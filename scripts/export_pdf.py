
"""
High-fidelity static-project PDF exporter.

Usage examples:
  python scripts/export_pdf.py --project registration-flyer
  python scripts/export_pdf.py --client rxvp --project partnership-package
  python scripts/export_pdf.py --project may-sponsorship-social
    python scripts/export_pdf.py --project may-sponsorship-social --selector .graphic
    python scripts/export_pdf.py --project may-sponsorship-social --selector .graphic --index 1
    python scripts/export_pdf.py --project may-sponsorship-social --selector .graphic --split-pages
  python scripts/export_pdf.py --project may-sponsorship-social --output CBHN_May_Sponsorship_Social.pdf

Behavior:
  - Serves `public/` on localhost:8000.
  - Opens `/clients/<client-slug>/projects/<project-slug>/index.html` in Playwright.
  - Waits for fonts and images to finish loading.
    - Captures element screenshots (exact browser render) and assembles them into a PDF.
    - Excludes UI controls/titles by capturing only target design containers.
    - Preserves clickable anchor links as PDF URI annotations.
    - Optionally exports each page as its own PDF file.
"""

import argparse
import asyncio
import http.server
import io
import os
import pathlib
import re
import threading
import time
from dataclasses import dataclass
from typing import List, Optional

from playwright.async_api import async_playwright
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, DictionaryObject, FloatObject, NameObject, NumberObject, TextStringObject

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"


@dataclass
class LinkHotspot:
    href: str
    x: float
    y: float
    width: float
    height: float


@dataclass
class CapturePage:
    image_bytes: bytes
    css_width: float
    css_height: float
    links: List[LinkHotspot]
    source_index: int
    title: str


def project_exists(client_slug: str, project_slug: str) -> bool:
    return (PUBLIC / "clients" / client_slug / "projects" / project_slug / "index.html").exists()


def sanitize_filename(raw: str) -> str:
    cleaned = re.sub(r"[\\/:*?\"<>|]", "-", raw or "")
    cleaned = re.sub(r"\s+", " ", cleaned).strip().strip(".")
    if not cleaned:
        cleaned = "Export"
    if not cleaned.lower().endswith(".pdf"):
        cleaned += ".pdf"
    return cleaned


def start_server(port: int):
    handler = http.server.SimpleHTTPRequestHandler
    handler.log_message = lambda *args: None
    server = http.server.HTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


async def wait_for_assets(page):
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
        ".certificate",
        ".graphic",
        ".flyer-page",
        ".page",
        ".zoom-graphic",
    ]

    for selector in candidates:
        count = await page.locator(selector).count()
        if count > 0:
            return selector

    return None


async def extract_links_for_element(element) -> List[LinkHotspot]:
    raw_links = await element.evaluate(
        """
        (node) => {
            const rootRect = node.getBoundingClientRect();
            const links = [];

            for (const anchor of node.querySelectorAll('a[href]')) {
                const rect = anchor.getBoundingClientRect();
                const style = window.getComputedStyle(anchor);
                const hidden = style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) === 0;

                if (hidden || rect.width < 2 || rect.height < 2) {
                    continue;
                }

                links.push({
                    href: anchor.href,
                    x: rect.left - rootRect.left,
                    y: rect.top - rootRect.top,
                    width: rect.width,
                    height: rect.height,
                });
            }

            return links;
        }
        """
    )

    link_hotspots: List[LinkHotspot] = []
    for item in raw_links:
        href = str(item.get("href", "")).strip()
        if not href:
            continue
        link_hotspots.append(
            LinkHotspot(
                href=href,
                x=float(item.get("x", 0.0)),
                y=float(item.get("y", 0.0)),
                width=float(item.get("width", 0.0)),
                height=float(item.get("height", 0.0)),
            )
        )

    return link_hotspots


async def extract_title_for_element(element) -> str:
    raw_title = await element.evaluate(
        """
        (node) => {
            const ownTitle = (node.getAttribute('data-export-title') || '').trim();
            if (ownTitle) {
                return ownTitle;
            }

            let previous = node.previousElementSibling;
            while (previous) {
                const label = previous.querySelector && previous.querySelector('.graphic-label');
                const text = (label && label.textContent ? label.textContent : '').trim();
                if (text) {
                    return text;
                }
                previous = previous.previousElementSibling;
            }

            const heading = node.querySelector('h1, h2, h3, .title, .event-title');
            const headingText = (heading && heading.textContent ? heading.textContent : '').trim();
            if (headingText) {
                return headingText;
            }

            const ariaLabel = (node.getAttribute('aria-label') || '').trim();
            if (ariaLabel) {
                return ariaLabel;
            }

            return '';
        }
        """
    )

    return str(raw_title or "").strip()


async def capture_target_pages(page, selector: str, index: Optional[int]) -> List[CapturePage]:
    locator = page.locator(selector)
    count = await locator.count()

    if count == 0:
        raise RuntimeError(f"Selector '{selector}' did not match any elements on the page.")

    if index is not None:
        if index < 1 or index > count:
            raise ValueError(f"--index must be between 1 and {count} for selector '{selector}'.")
        target_indices = [index - 1]
    else:
        target_indices = list(range(count))

    captured_pages: List[CapturePage] = []

    for position, target_idx in enumerate(target_indices, start=1):
        element = locator.nth(target_idx)
        await element.scroll_into_view_if_needed()
        await page.wait_for_timeout(120)

        box = await element.bounding_box()
        if box is None:
            raise RuntimeError(f"Could not resolve bounding box for target #{target_idx + 1}.")

        width = int(round(box["width"]))
        height = int(round(box["height"]))
        if width <= 0 or height <= 0:
            raise RuntimeError(f"Target #{target_idx + 1} has invalid size: {width}x{height}.")

        links = await extract_links_for_element(element)
        page_title = await extract_title_for_element(element)
        if not page_title:
            page_title = f"Page {target_idx + 1:02d}"

        screenshot = await element.screenshot(type="png", animations="disabled")
        captured_pages.append(
            CapturePage(
                image_bytes=screenshot,
                css_width=float(width),
                css_height=float(height),
                links=links,
                source_index=target_idx + 1,
                title=page_title,
            )
        )

        print(
            f"Captured card {position}/{len(target_indices)} (source #{target_idx + 1}): "
            f"{width}x{height}, links={len(links)}, title='{page_title}'"
        )

    return captured_pages


def export_pages_to_pdf(pages: List[CapturePage], output_path: pathlib.Path, dpi: int) -> None:
    if not pages:
        raise RuntimeError("No images were captured for PDF export.")

    pil_images = []
    for page in pages:
        with Image.open(io.BytesIO(page.image_bytes)) as image:
            pil_images.append(image.convert("RGB"))

    first_image, *remaining = pil_images
    first_image.save(
        output_path,
        "PDF",
        resolution=float(dpi),
        save_all=True,
        append_images=remaining,
    )


def add_link_annotations(pdf_path: pathlib.Path, pages: List[CapturePage]) -> int:
    reader = PdfReader(str(pdf_path))
    if len(reader.pages) != len(pages):
        raise RuntimeError(
            f"Page count mismatch while adding links: PDF has {len(reader.pages)} page(s), "
            f"capture has {len(pages)} page(s)."
        )

    writer = PdfWriter()
    annotation_count = 0

    for page_index, (pdf_page, capture_page) in enumerate(zip(reader.pages, pages), start=1):
        writer.add_page(pdf_page)
        out_page = writer.pages[page_index - 1]

        page_width_pts = float(out_page.mediabox.width)
        page_height_pts = float(out_page.mediabox.height)
        if capture_page.css_width <= 0 or capture_page.css_height <= 0:
            continue

        scale_x = page_width_pts / capture_page.css_width
        scale_y = page_height_pts / capture_page.css_height

        for hotspot in capture_page.links:
            x0 = max(0.0, min(page_width_pts, hotspot.x * scale_x))
            x1 = max(0.0, min(page_width_pts, (hotspot.x + hotspot.width) * scale_x))
            y0 = max(0.0, min(page_height_pts, page_height_pts - (hotspot.y + hotspot.height) * scale_y))
            y1 = max(0.0, min(page_height_pts, page_height_pts - hotspot.y * scale_y))

            if x1 <= x0 or y1 <= y0:
                continue

            annotation = DictionaryObject(
                {
                    NameObject("/Type"): NameObject("/Annot"),
                    NameObject("/Subtype"): NameObject("/Link"),
                    NameObject("/Rect"): ArrayObject(
                        [FloatObject(x0), FloatObject(y0), FloatObject(x1), FloatObject(y1)]
                    ),
                    NameObject("/Border"): ArrayObject(
                        [NumberObject(0), NumberObject(0), NumberObject(0)]
                    ),
                    NameObject("/A"): DictionaryObject(
                        {
                            NameObject("/Type"): NameObject("/Action"),
                            NameObject("/S"): NameObject("/URI"),
                            NameObject("/URI"): TextStringObject(hotspot.href),
                        }
                    ),
                }
            )

            if "/Annots" not in out_page:
                out_page[NameObject("/Annots")] = ArrayObject()
            out_page[NameObject("/Annots")].append(writer._add_object(annotation))
            annotation_count += 1

    temp_path = pdf_path.with_name(f"{pdf_path.stem}.__tmp__.pdf")
    with temp_path.open("wb") as temp_file:
        writer.write(temp_file)
    temp_path.replace(pdf_path)

    return annotation_count


def export_split_pdfs(combined_pdf_path: pathlib.Path, pages: List[CapturePage]) -> List[pathlib.Path]:
    reader = PdfReader(str(combined_pdf_path))
    if len(reader.pages) != len(pages):
        raise RuntimeError(
            f"Page count mismatch while splitting: PDF has {len(reader.pages)} page(s), "
            f"capture has {len(pages)} page(s)."
        )

    output_paths: List[pathlib.Path] = []
    used_filenames = set()

    for page_index, (page, capture_page) in enumerate(zip(reader.pages, pages), start=1):
        writer = PdfWriter()
        writer.add_page(page)

        base_name = capture_page.title.strip() or f"Page {page_index:02d}"
        split_name = sanitize_filename(base_name)

        if split_name in used_filenames:
            suffix = 2
            while True:
                candidate = sanitize_filename(f"{base_name} ({suffix})")
                if candidate not in used_filenames:
                    split_name = candidate
                    break
                suffix += 1

        used_filenames.add(split_name)
        split_path = combined_pdf_path.with_name(split_name)

        with split_path.open("wb") as split_file:
            writer.write(split_file)

        output_paths.append(split_path)

    return output_paths


async def export_pdf(
    client_slug: str,
    project_slug: str,
    output_name: Optional[str],
    selector: Optional[str],
    index: Optional[int],
    port: int,
    wait_ms: int,
    dpi: int,
    split_pages: bool,
):
    if not project_exists(client_slug, project_slug):
        raise FileNotFoundError(
            f"Project not found: public/clients/{client_slug}/projects/{project_slug}/index.html"
        )

    os.chdir(PUBLIC)
    server = start_server(port)
    time.sleep(0.3)

    url = f"http://127.0.0.1:{port}/clients/{client_slug}/projects/{project_slug}/index.html"

    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch()
            page = await browser.new_page(
                viewport={"width": 2200, "height": 2600},
                device_scale_factor=2,
            )

            print(f"Loading: {url}")
            await page.goto(url, wait_until="networkidle")
            await wait_for_assets(page)
            await page.wait_for_timeout(wait_ms)

            page_title = (await page.title()).strip()
            resolved_name = sanitize_filename(output_name or page_title)
            output_path = ROOT / resolved_name

            chosen_selector = selector or await detect_default_selector(page)
            if not chosen_selector:
                raise RuntimeError(
                    "Could not auto-detect export selector. Pass one explicitly with --selector."
                )

            print(f"Using selector: {chosen_selector}")
            pages = await capture_target_pages(page, chosen_selector, index)

            if output_path.exists():
                output_path.unlink()

            export_pages_to_pdf(pages, output_path, dpi)
            annotation_count = add_link_annotations(output_path, pages)

            split_output_paths: List[pathlib.Path] = []
            if split_pages:
                split_output_paths = export_split_pdfs(output_path, pages)

            await browser.close()
            print(f"PDF exported: {output_path}")
            print(f"Pages: {len(pages)}")
            print("Page dimensions (px): " + ", ".join(f"{int(p.css_width)}x{int(p.css_height)}" for p in pages))
            print(f"Clickable links added: {annotation_count}")
            if split_output_paths:
                print(f"Per-page PDFs exported: {len(split_output_paths)}")
                for split_path in split_output_paths:
                    print(f"  - {split_path}")
            return output_path
    finally:
        server.shutdown()
        server.server_close()


def parse_args():
    parser = argparse.ArgumentParser(description="Export a static client project page to PDF")
    parser.add_argument("--client", default="cbhn", help="Client slug under public/clients (default: cbhn)")
    parser.add_argument(
        "--project",
        required=True,
        help="Project slug under public/clients/<client>/projects (e.g. may-sponsorship-social)",
    )
    parser.add_argument("--output", help="Optional output PDF filename (defaults to page title)")
    parser.add_argument(
        "--selector",
        help="CSS selector for design containers to export (auto-detected if omitted)",
    )
    parser.add_argument(
        "--index",
        type=int,
        help="1-based index of matched selector to export only one card/page",
    )
    parser.add_argument("--port", type=int, default=8000, help="Local preview port")
    parser.add_argument("--wait-ms", type=int, default=1200, help="Extra wait before PDF capture (ms)")
    parser.add_argument("--dpi", type=int, default=300, help="DPI metadata for PDF image pages")
    parser.add_argument(
        "--split-pages",
        action="store_true",
        help="Also export one PDF file per output page",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(
        export_pdf(
            args.client,
            args.project,
            args.output,
            args.selector,
            args.index,
            args.port,
            args.wait_ms,
            args.dpi,
            args.split_pages,
        )
    )
