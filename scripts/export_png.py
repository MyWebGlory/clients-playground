"""
High-fidelity static-project PNG exporter.

Why:
  Browser-side DOM-to-canvas libraries (e.g. html2canvas) are best-effort and can miss
  certain CSS effects (filters, blend modes, backdrop-filter, etc.). This script uses
  Playwright to screenshot the actual browser-rendered output, so the PNG matches what
  you see on screen.

Usage examples:
  python3 scripts/export_png.py --project zoom-landing-page
  python3 scripts/export_png.py --client rxvp --project partnership-package
  python3 scripts/export_png.py --project zoom-landing-page --selector .zoom-graphic
  python3 scripts/export_png.py --project zoom-landing-page --selector .zoom-graphic-square
  python3 scripts/export_png.py --project zoom-landing-page --selector .zoom-graphic-300x250
  python3 scripts/export_png.py --project zoom-landing-page --selector .zoom-graphic-square --index 1 --output cbhn-zoom-1080.png
"""

import argparse
import asyncio
import http.server
import os
import pathlib
import threading
from dataclasses import dataclass
from typing import Optional, Tuple

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"


def project_exists(client_slug: str, project_slug: str) -> bool:
    return (PUBLIC / "clients" / client_slug / "projects" / project_slug / "index.html").exists()


def start_server(port: int):
    handler = http.server.SimpleHTTPRequestHandler
    handler.log_message = lambda *args: None
    server = http.server.HTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


async def wait_for_assets(page) -> None:
    await page.evaluate("document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()")
    await page.evaluate(
        """
        Promise.all(Array.from(document.images).map((img) => {
            if (img.complete && img.naturalWidth > 0) {
                return img.decode ? img.decode().catch(() => undefined) : Promise.resolve();
            }
            return new Promise((resolve) => {
                const done = () => resolve();
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
            });
        }))
        """
    )
    await page.evaluate(
        """
        new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
        })
        """
    )


async def detect_default_selector(page) -> Optional[str]:
    candidates = [
        ".graphic",
        ".flyer-page",
        ".page",
        ".zoom-graphic",
        ".zoom-graphic-square",
        ".zoom-graphic-300x250",
    ]
    for selector in candidates:
        if await page.locator(selector).count() > 0:
            return selector
    return None


def parse_output_path(raw: Optional[str], default_name: str) -> pathlib.Path:
    if raw:
        p = pathlib.Path(raw)
        if p.suffix.lower() != ".png":
            p = p.with_suffix(".png")
        return p if p.is_absolute() else (ROOT / p)
    return ROOT / default_name


def build_default_name(client: str, project: str, selector: str, index: int) -> str:
    safe_selector = selector.strip().lstrip(".#").replace("/", "-").replace(" ", "-")
    return f"{client}__{project}__{safe_selector}__{index}.png"


@dataclass
class CaptureTarget:
    selector: str
    index: int
    clip: Tuple[int, int]


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--client", default="cbhn", help="Client slug under public/clients (default: cbhn)")
    parser.add_argument(
        "--project",
        required=True,
        help="Project slug under public/clients/<client>/projects/<project>/index.html",
    )
    parser.add_argument("--selector", default=None, help="CSS selector for the design container (defaults auto-detect)")
    parser.add_argument("--index", type=int, default=1, help="1-based index when selector matches multiple elements")
    parser.add_argument("--output", default=None, help="Output PNG filename (default auto)")
    parser.add_argument("--port", type=int, default=8000, help="Local server port")
    parser.add_argument("--headed", action="store_true", help="Run Chromium headed (can improve fidelity for some effects)")
    args = parser.parse_args()

    client = str(args.client).strip()
    project = str(args.project).strip()
    if not project_exists(client, project):
        raise SystemExit(
            f"Unknown project '{client}/{project}'. Expected "
            f"public/clients/{client}/projects/{project}/index.html"
        )

    os.chdir(PUBLIC)
    server = start_server(args.port)
    try:
        url = f"http://127.0.0.1:{args.port}/clients/{client}/projects/{project}/index.html"

        async with async_playwright() as playwright:
            # Backdrop-filter can be unreliable in some headless configurations.
            # These flags nudge Chromium toward full compositor behavior.
            browser = await playwright.chromium.launch(
                headless=(not args.headed),
                args=[
                    "--enable-features=CSSBackdropFilter",
                    "--use-angle=metal",
                ],
            )
            page = await browser.new_page(device_scale_factor=2)

            print(f"Loading: {url}")
            await page.goto(url, wait_until="networkidle")
            await wait_for_assets(page)

            selector = args.selector
            if not selector:
                selector = await detect_default_selector(page)
                if not selector:
                    raise SystemExit("Could not auto-detect a selector. Pass --selector explicitly.")

            locator = page.locator(selector)
            count = await locator.count()
            if count == 0:
                raise SystemExit(f"Selector '{selector}' did not match any elements.")

            index = int(args.index)
            if index < 1 or index > count:
                raise SystemExit(f"--index must be between 1 and {count} (selector matches {count} elements).")

            target = locator.nth(index - 1)
            await target.scroll_into_view_if_needed()
            await wait_for_assets(page)

            # Playwright screenshot is pixel-perfect to what Chromium renders.
            default_name = build_default_name(client, project, selector, index)
            out_path = parse_output_path(args.output, default_name)
            out_path.parent.mkdir(parents=True, exist_ok=True)

            await target.screenshot(path=str(out_path), type="png")
            print(f"PNG exported: {out_path}")

            await browser.close()

        return 0
    finally:
        server.shutdown()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
