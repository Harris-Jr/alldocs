import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import type { SourceFile, WatermarkOptions } from './types';
import { assertPdf, hexToRgb01 } from './util';

/**
 * Stamp a text watermark onto every page. Default: a single 45°-rotated,
 * semi-transparent label centered on the page. `tile: true` repeats it.
 */
export async function watermarkPdf(
  file: SourceFile,
  opts: WatermarkOptions,
): Promise<Uint8Array> {
  assertPdf(file.bytes, file.name);
  if (!opts.text || !opts.text.trim()) throw new Error('Watermark text is required.');

  const doc = await PDFDocument.load(file.bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const opacity = clamp(opts.opacity ?? 0.2, 0.02, 1);
  const rotation = opts.rotation ?? 45;
  const { r, g, b } = opts.color ? hexToRgb01(opts.color) : { r: 0.5, g: 0.5, b: 0.5 };
  const color = rgb(r, g, b);

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const fontSize = opts.fontSize ?? Math.max(18, Math.min(width, height) * 0.08);
    const textWidth = font.widthOfTextAtSize(opts.text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    if (opts.tile) {
      const stepX = textWidth + fontSize * 2;
      const stepY = textHeight + fontSize * 4;
      for (let y = -height * 0.2; y < height * 1.2; y += stepY) {
        for (let x = -width * 0.2; x < width * 1.2; x += stepX) {
          page.drawText(opts.text, {
            x,
            y,
            size: fontSize,
            font,
            color,
            opacity,
            rotate: degrees(rotation),
          });
        }
      }
    } else {
      // center the (rotated) label
      const cx = width / 2;
      const cy = height / 2;
      const rad = (rotation * Math.PI) / 180;
      const x = cx - (textWidth / 2) * Math.cos(rad) + (textHeight / 2) * Math.sin(rad);
      const y = cy - (textWidth / 2) * Math.sin(rad) - (textHeight / 2) * Math.cos(rad);
      page.drawText(opts.text, {
        x,
        y,
        size: fontSize,
        font,
        color,
        opacity,
        rotate: degrees(rotation),
      });
    }
  }

  return doc.save();
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
