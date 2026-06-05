"""
Export the ZS management skills checklist as a visually identical fillable PDF.

The shared PDF exporter preserves the browser rendering by rasterizing the
`.page` element. This script keeps that workflow, then overlays transparent PDF
form widgets on the participant name line and checklist boxes.
"""

import asyncio
import http.server
import importlib.util
import pathlib
import threading
import time
from dataclasses import dataclass
from typing import List

from playwright.async_api import async_playwright
from pypdf import PdfReader, PdfWriter
from pypdf.generic import (
    ArrayObject,
    BooleanObject,
    DictionaryObject,
    FloatObject,
    NameObject,
    NumberObject,
    TextStringObject,
)

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
CLIENT = "rxvp"
PROJECT = "zs-management-skills-checklist"
OUTPUT_NAME = "ZS Emerging Leaders Management Skills Checklist.pdf"
DOWNLOADS_OUTPUT = pathlib.Path.home() / "Downloads" / OUTPUT_NAME


@dataclass
class FieldRect:
    name: str
    kind: str
    x: float
    y: float
    width: float
    height: float


def load_shared_exporter():
    path = ROOT / "scripts" / "export_pdf.py"
    spec = importlib.util.spec_from_file_location("export_pdf", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load exporter at {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def start_server(port: int):
    handler = lambda *args, **kwargs: http.server.SimpleHTTPRequestHandler(
        *args,
        directory=str(PUBLIC),
        **kwargs,
    )
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
    await page.evaluate("new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))")


async def measure_fields(port: int) -> tuple[float, float, List[FieldRect]]:
    server = start_server(port)
    time.sleep(0.3)
    url = f"http://127.0.0.1:{port}/clients/{CLIENT}/projects/{PROJECT}/index.html"

    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch()
            page = await browser.new_page(viewport={"width": 2200, "height": 2600}, device_scale_factor=2)
            await page.goto(url, wait_until="networkidle")
            await wait_for_assets(page)

            raw = await page.locator(".page").evaluate(
                """
                (root) => {
                    const rootRect = root.getBoundingClientRect();
                    const rectFor = (el) => {
                        const rect = el.getBoundingClientRect();
                        return {
                            x: rect.left - rootRect.left,
                            y: rect.top - rootRect.top,
                            width: rect.width,
                            height: rect.height,
                        };
                    };

                    const fields = [];
                    const nameLine = root.querySelector('.name-line');
                    fields.push({
                        name: 'participant_name',
                        kind: 'text',
                        ...rectFor(nameLine),
                    });

                    const instructionCard = root.querySelector('.instruction-card');
                    const instructionText = instructionCard.querySelector('p');
                    const cardRect = instructionCard.getBoundingClientRect();
                    const textRect = instructionText.getBoundingClientRect();
                    const cardStyle = window.getComputedStyle(instructionCard);
                    const paddingLeft = parseFloat(cardStyle.paddingLeft) || 0;
                    const paddingRight = parseFloat(cardStyle.paddingRight) || 0;
                    const paddingBottom = parseFloat(cardStyle.paddingBottom) || 0;
                    const notesTop = textRect.bottom + 8;
                    fields.push({
                        name: 'top_five_notes',
                        kind: 'textarea',
                        x: cardRect.left - rootRect.left + paddingLeft,
                        y: notesTop - rootRect.top,
                        width: cardRect.width - paddingLeft - paddingRight,
                        height: Math.max(18, cardRect.bottom - paddingBottom - notesTop),
                    });

                    root.querySelectorAll('.box').forEach((box, index) => {
                        fields.push({
                            name: `skill_${String(index + 1).padStart(2, '0')}`,
                            kind: 'checkbox',
                            ...rectFor(box),
                        });
                    });

                    return {
                        width: rootRect.width,
                        height: rootRect.height,
                        fields,
                    };
                }
                """
            )
            await browser.close()

        fields = [
            FieldRect(
                name=str(item["name"]),
                kind=str(item["kind"]),
                x=float(item["x"]),
                y=float(item["y"]),
                width=float(item["width"]),
                height=float(item["height"]),
            )
            for item in raw["fields"]
        ]
        return float(raw["width"]), float(raw["height"]), fields
    finally:
        server.shutdown()
        server.server_close()


def make_text_widget(name: str, rect: ArrayObject):
    flags = NumberObject(4096) if name == "top_five_notes" else NumberObject(0)
    return DictionaryObject(
        {
            NameObject("/Type"): NameObject("/Annot"),
            NameObject("/Subtype"): NameObject("/Widget"),
            NameObject("/FT"): NameObject("/Tx"),
            NameObject("/T"): TextStringObject(name),
            NameObject("/Rect"): rect,
            NameObject("/F"): NumberObject(4),
            NameObject("/Ff"): flags,
            NameObject("/DA"): TextStringObject("/Helv 10 Tf 0 0 0 rg"),
            NameObject("/V"): TextStringObject(""),
            NameObject("/DV"): TextStringObject(""),
            NameObject("/BS"): DictionaryObject({NameObject("/W"): NumberObject(0)}),
        }
    )


def make_checkbox_widget(name: str, rect: ArrayObject):
    return DictionaryObject(
        {
            NameObject("/Type"): NameObject("/Annot"),
            NameObject("/Subtype"): NameObject("/Widget"),
            NameObject("/FT"): NameObject("/Btn"),
            NameObject("/T"): TextStringObject(name),
            NameObject("/Rect"): rect,
            NameObject("/F"): NumberObject(4),
            NameObject("/Ff"): NumberObject(0),
            NameObject("/V"): NameObject("/Off"),
            NameObject("/DV"): NameObject("/Off"),
            NameObject("/AS"): NameObject("/Off"),
            NameObject("/BS"): DictionaryObject({NameObject("/W"): NumberObject(0)}),
        }
    )


def add_fillable_fields(pdf_path: pathlib.Path, css_width: float, css_height: float, fields: List[FieldRect]) -> None:
    reader = PdfReader(str(pdf_path))
    writer = PdfWriter()
    writer.append_pages_from_reader(reader)

    page = writer.pages[0]
    page_width = float(page.mediabox.width)
    page_height = float(page.mediabox.height)
    scale_x = page_width / css_width
    scale_y = page_height / css_height

    if "/Annots" not in page:
        page[NameObject("/Annots")] = ArrayObject()

    field_refs = ArrayObject()
    for field in fields:
        x0 = field.x * scale_x
        x1 = (field.x + field.width) * scale_x
        y0 = page_height - (field.y + field.height) * scale_y
        y1 = page_height - field.y * scale_y
        rect = ArrayObject([FloatObject(x0), FloatObject(y0), FloatObject(x1), FloatObject(y1)])

        annotation = make_text_widget(field.name, rect) if field.kind in {"text", "textarea"} else make_checkbox_widget(field.name, rect)
        annotation_ref = writer._add_object(annotation)
        page[NameObject("/Annots")].append(annotation_ref)
        field_refs.append(annotation_ref)

    acroform = DictionaryObject(
        {
            NameObject("/Fields"): field_refs,
            NameObject("/NeedAppearances"): BooleanObject(True),
            NameObject("/DR"): DictionaryObject(
                {
                    NameObject("/Font"): DictionaryObject(
                        {NameObject("/Helv"): writer._add_object(DictionaryObject({NameObject("/Type"): NameObject("/Font"), NameObject("/Subtype"): NameObject("/Type1"), NameObject("/BaseFont"): NameObject("/Helvetica")}))}
                    )
                }
            ),
            NameObject("/DA"): TextStringObject("/Helv 10 Tf 0 0 0 rg"),
        }
    )
    writer._root_object.update({NameObject("/AcroForm"): writer._add_object(acroform)})

    temp_path = pdf_path.with_name(f"{pdf_path.stem}.__fillable_tmp__.pdf")
    with temp_path.open("wb") as output:
        writer.write(output)
    temp_path.replace(pdf_path)


async def main():
    css_width, css_height, fields = await measure_fields(port=8011)

    exporter = load_shared_exporter()
    pdf_path = await exporter.export_pdf(
        CLIENT,
        PROJECT,
        OUTPUT_NAME,
        ".page",
        None,
        8012,
        1200,
        300,
        False,
    )

    add_fillable_fields(pdf_path, css_width, css_height, fields)
    if DOWNLOADS_OUTPUT.exists():
        DOWNLOADS_OUTPUT.unlink()
    DOWNLOADS_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf_path.replace(DOWNLOADS_OUTPUT)
    print(f"Fillable fields added: {len(fields)}")
    print(f"Fillable PDF exported: {DOWNLOADS_OUTPUT}")


if __name__ == "__main__":
    asyncio.run(main())
