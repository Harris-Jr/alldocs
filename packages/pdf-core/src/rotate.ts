import { PDFDocument, degrees } from 'pdf-lib';
import type { RotationAngle, SourceFile } from './types';
import { assertPdf } from './util';

/**
 * Rotate pages by a multiple of 90°. Rotation is additive to any existing
 * page rotation (so a 90°-rotated page + 90° = 180°).
 *
 * @param pageIndices 0-based indices to rotate; omit/empty = all pages.
 */
export async function rotatePdf(
  file: SourceFile,
  angle: RotationAngle,
  pageIndices?: number[],
): Promise<Uint8Array> {
  assertPdf(file.bytes, file.name);
  const doc = await PDFDocument.load(file.bytes);
  const pages = doc.getPages();
  const targets =
    pageIndices && pageIndices.length > 0
      ? pageIndices
      : pages.map((_, i) => i);

  for (const idx of targets) {
    const page = pages[idx];
    if (!page) throw new Error(`Page index ${idx} out of range.`);
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  }

  return doc.save();
}
