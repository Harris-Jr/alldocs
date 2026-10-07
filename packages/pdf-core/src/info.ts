import { PDFDocument } from 'pdf-lib';
import type { SourceFile } from './types';
import { assertPdf } from './util';

export interface PdfInfo {
  pageCount: number;
  title?: string;
  encrypted: boolean;
  sizes: { width: number; height: number }[];
}

/** Read lightweight metadata without mutating the document. */
export async function readPdfInfo(file: SourceFile): Promise<PdfInfo> {
  assertPdf(file.bytes, file.name);
  let encrypted = false;
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(file.bytes);
  } catch {
    // retry allowing encryption so we can at least report it
    doc = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
    encrypted = true;
  }
  const pages = doc.getPages();
  return {
    pageCount: pages.length,
    title: doc.getTitle() ?? undefined,
    encrypted,
    sizes: pages.map((p) => {
      const { width, height } = p.getSize();
      return { width, height };
    }),
  };
}
