import { PDFDocument } from 'pdf-lib';
import type { SourceFile } from './types';
import { assertPdf, parsePageSpec } from './util';

export interface MergeInput {
  file: SourceFile;
  /** optional 1-based page spec like "1-3,5"; empty/undefined = all pages */
  pageSpec?: string;
}

/**
 * Merge multiple PDFs (in the given order) into one.
 * Per-file page ranges supported. Returns the merged PDF bytes.
 */
export async function mergePdfs(inputs: MergeInput[]): Promise<Uint8Array> {
  if (inputs.length === 0) throw new Error('No files to merge.');

  const out = await PDFDocument.create();

  for (const input of inputs) {
    assertPdf(input.file.bytes, input.file.name);
    const src = await PDFDocument.load(input.file.bytes, { ignoreEncryption: false });
    const total = src.getPageCount();

    const indices =
      input.pageSpec && input.pageSpec.trim()
        ? parsePageSpec(input.pageSpec, total)
        : src.getPageIndices();

    const copied = await out.copyPages(src, indices);
    for (const page of copied) out.addPage(page);
  }

  if (out.getPageCount() === 0) {
    throw new Error('Merge produced an empty document (no pages selected).');
  }

  return out.save();
}
