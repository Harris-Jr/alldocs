import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { PageNumberOptions, SourceFile } from './types';
import { assertPdf, hexToRgb01 } from './util';

/**
 * Draw page numbers. Supports {n} and {total} placeholders, a start offset,
 * skipped pages, and six anchor positions.
 */
export async function addPageNumbers(
  file: SourceFile,
  opts: PageNumberOptions = {},
): Promise<Uint8Array> {
  assertPdf(file.bytes, file.name);
  const doc = await PDFDocument.load(file.bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const position = opts.position ?? 'bottom-center';
  const format = opts.format ?? '{n}';
  const startAt = opts.startAt ?? 1;
  const fontSize = opts.fontSize ?? 11;
  const margin = opts.margin ?? 28;
  const skip = new Set(opts.skipPages ?? []);
  const { r, g, b } = opts.color ? hexToRgb01(opts.color) : { r: 0.07, g: 0.06, b: 0.11 };
  const color = rgb(r, g, b);

  const pages = doc.getPages();
  const total = pages.length;
  let displayNum = startAt;

  pages.forEach((page, i) => {
    const oneBased = i + 1;
    if (skip.has(oneBased)) {
      return; // skipped pages advance neither number nor get drawn
    }
    const label = format
      .replace(/\{n\}/g, String(displayNum))
      .replace(/\{total\}/g, String(total));
    displayNum++;

    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, fontSize);

    let x: number;
    if (position.endsWith('left')) x = margin;
    else if (position.endsWith('right')) x = width - margin - textWidth;
    else x = (width - textWidth) / 2;

    const y = position.startsWith('top') ? height - margin - fontSize : margin;

    page.drawText(label, { x, y, size: fontSize, font, color });
  });

  return doc.save();
}
