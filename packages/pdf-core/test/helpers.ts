import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { SourceFile } from '../src/types.js';

/** Build a simple N-page PDF in memory for tests. Each page prints its number. */
export async function makePdf(pageCount: number, name = 'test.pdf'): Promise<SourceFile> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([400, 600]);
    page.drawText(`Page ${i}`, { x: 50, y: 550, size: 24, font, color: rgb(0, 0, 0) });
  }
  const bytes = await doc.save();
  return { name, bytes };
}

export async function pageCountOf(bytes: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}
