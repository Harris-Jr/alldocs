"""
PDF processing operations for server-side jobs.

Each processor takes raw input bytes + options and returns
(output_bytes, output_ext, content_type). Engines:
  - compress : PyMuPDF (image downsample + deflate + GC); pikepdf fallback.
  - pdf->jpg : PyMuPDF rasterize each page, zip the JPGs.
  - jpg->pdf : PyMuPDF/Pillow assemble images into a PDF.

Production can swap compress to Ghostscript where `gs` is present (see
ghostscript_compress stub below) — the queue/contract is unchanged.
"""
import io
import zipfile
import pymupdf  # PyMuPDF
from PIL import Image

PDF_MAGIC = b"%PDF"
JPG_MAGIC = b"\xff\xd8\xff"
PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


def _assert_pdf(data: bytes) -> None:
    if not data[:4] == PDF_MAGIC:
        raise ValueError("Input is not a valid PDF (magic bytes).")


def _assert_image(data: bytes) -> None:
    if not (data[:3] == JPG_MAGIC or data[:8] == PNG_MAGIC):
        raise ValueError("Input is not a valid JPG or PNG (magic bytes).")


# Compression presets → (image DPI target, JPEG quality).
_PRESETS = {
    "extreme": (72, 45),
    "recommended": (120, 65),
    "less-loss": (180, 80),
}


def compress_pdf(data: bytes, options: dict) -> tuple[bytes, str, str]:
    _assert_pdf(data)
    preset = str(options.get("preset", "recommended"))
    dpi, quality = _PRESETS.get(preset, _PRESETS["recommended"])

    doc = pymupdf.open(stream=data, filetype="pdf")
    try:
        # Downsample + recompress embedded images.
        for page in doc:
            for img in page.get_images(full=True):
                xref = img[0]
                try:
                    _recompress_image(doc, xref, dpi, quality)
                except Exception:
                    # never fail the whole job on one image — skip it
                    continue

        out = doc.tobytes(
            garbage=4,        # maximal cross-reference garbage collection
            deflate=True,     # deflate uncompressed streams
            deflate_images=True,
            deflate_fonts=True,
            clean=True,
        )
    finally:
        doc.close()

    # If PyMuPDF didn't shrink it, try pikepdf lossless as a fallback.
    if len(out) >= len(data):
        try:
            out_pike = _pikepdf_compress(data)
            if len(out_pike) < len(out):
                out = out_pike
        except Exception:
            pass

    return out, ".pdf", "application/pdf"


def _recompress_image(doc, xref: int, dpi: int, quality: int) -> None:
    info = doc.extract_image(xref)
    raw = info["image"]
    img = Image.open(io.BytesIO(raw))
    if img.mode in ("RGBA", "P", "LA"):
        img = img.convert("RGB")

    # Cap the longest edge at dpi * (nominal 8.5in) as a simple downsample.
    max_edge = int(dpi * 11)
    if max(img.size) > max_edge:
        ratio = max_edge / max(img.size)
        img = img.resize((max(1, int(img.width * ratio)), max(1, int(img.height * ratio))))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    doc.update_stream(xref, buf.getvalue())


def _pikepdf_compress(data: bytes) -> bytes:
    import pikepdf

    pdf = pikepdf.open(io.BytesIO(data))
    out = io.BytesIO()
    pdf.save(
        out,
        compress_streams=True,
        object_stream_mode=pikepdf.ObjectStreamMode.generate,
        linearize=False,
    )
    pdf.close()
    return out.getvalue()


def pdf_to_jpg(data: bytes, options: dict) -> tuple[bytes, str, str]:
    _assert_pdf(data)
    dpi = int(options.get("dpi", 150))
    zoom = dpi / 72.0
    matrix = pymupdf.Matrix(zoom, zoom)

    doc = pymupdf.open(stream=data, filetype="pdf")
    buf = io.BytesIO()
    try:
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for i, page in enumerate(doc, start=1):
                pix = page.get_pixmap(matrix=matrix, alpha=False)
                zf.writestr(f"page-{i:03d}.jpg", pix.tobytes("jpg"))
    finally:
        doc.close()
    return buf.getvalue(), ".zip", "application/zip"


_PAGE_SIZES = {
    "a4": (595, 842),       # points
    "letter": (612, 792),
}


def jpg_to_pdf(images: list[bytes], options: dict) -> tuple[bytes, str, str]:
    if not images:
        raise ValueError("No images provided.")
    for im in images:
        _assert_image(im)

    page_size = str(options.get("pageSize", "fit"))
    doc = pymupdf.open()
    try:
        for raw in images:
            img = pymupdf.open(stream=raw, filetype="img")
            rect = img[0].rect
            pdfbytes = img.convert_to_pdf()
            img.close()
            src = pymupdf.open("pdf", pdfbytes)

            if page_size in _PAGE_SIZES:
                w, h = _PAGE_SIZES[page_size]
                page = doc.new_page(width=w, height=h)
                page.show_pdf_page(page.rect, src, 0)
            else:  # fit to image
                page = doc.new_page(width=rect.width, height=rect.height)
                page.show_pdf_page(page.rect, src, 0)
            src.close()

        out = doc.tobytes(garbage=4, deflate=True)
    finally:
        doc.close()
    return out, ".pdf", "application/pdf"
