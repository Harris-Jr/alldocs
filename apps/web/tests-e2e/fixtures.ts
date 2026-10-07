import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/** Build a simple labelled N-page PDF as a Buffer, for upload in tests. */
export async function makePdfBuffer(pages: number, label: string): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pages; i++) {
    const page = doc.addPage([400, 600]);
    page.drawText(`${label} ${i}`, { x: 40, y: 540, size: 28, font, color: rgb(0.1, 0.1, 0.1) });
  }
  return Buffer.from(await doc.save());
}
