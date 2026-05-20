"""
Export CBHN certificate templates as a fully flattened, browser-rendered PDF.

This captures each `.certificate` element as a PNG from Chromium and embeds the
resulting bitmaps into a multi-page PDF. The output is intentionally flattened:
no live text, no font substitution, no PDF layout reflow.
"""

import asyncio
import shutil
from pathlib import Path

from export_pdf import export_pdf

ROOT = Path(__file__).resolve().parent.parent
PROJECT_PDF = ROOT / "public/clients/cbhn/projects/ceu-certificate-templates/CBHN-CEU-Certificate-Templates-Flattened.pdf"
DOWNLOADS_PDF = Path("/Users/gabriel/Downloads/CBHN-CEU-Certificate-Templates-Flattened.pdf")


async def main() -> None:
    exported = await export_pdf(
        client_slug="cbhn",
        project_slug="ceu-certificate-templates",
        output_name=PROJECT_PDF.name,
        selector=".certificate",
        index=None,
        port=8000,
        wait_ms=1200,
        dpi=300,
        split_pages=False,
    )
    shutil.move(str(exported), PROJECT_PDF)
    shutil.copyfile(PROJECT_PDF, DOWNLOADS_PDF)
    print(PROJECT_PDF)
    print(DOWNLOADS_PDF)


if __name__ == "__main__":
    asyncio.run(main())
