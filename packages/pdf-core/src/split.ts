import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import type { SourceFile, SplitResult } from './types';
import { assertPdf, parsePageSpec } from './util';

export type SplitMode =
  | { kind: 'ranges'; spec: string } // "1-3,5" → one PDF of those pages
  | { kind: 'everyN'; n: number } // chunk every N pages → many PDFs
  | { kind: 'extract'; spec: string }; // each listed page → its own PDF

/**
 * Split a PDF according to the chosen mode.
 * Returns one or more named PDF byte arrays.
 */
export async function splitPdf(file: SourceFile, mode: SplitMode): Promise<SplitResult[]> {
  assertPdf(file.bytes, file.name);
  const src = await PDFDocument.load(file.bytes);
  const total = src.getPageCount();
  const base = file.name.replace(/\.pdf$/i, '');

  if (mode.kind === 'ranges') {
    const indices = parsePageSpec(mode.spec, total);
    if (indices.length === 0) throw new Error('No pages selected.');
    const bytes = await buildFromIndices(src, indices);
    return [{ name: `${base}-split.pdf`, bytes }];
  }

  if (mode.kind === 'extract') {
    const indices = parsePageSpec(mode.spec, total);
    if (indices.length === 0) throw new Error('No pages selected.');
    const results: SplitResult[] = [];
    for (const idx of indices) {
      const bytes = await buildFromIndices(src, [idx]);
      results.push({ name: `${base}-page-${idx + 1}.pdf`, bytes });
    }
    return results;
  }

  // everyN
  const n = Math.floor(mode.n);
  if (n < 1) throw new Error('Chunk size must be at least 1.');
  const results: SplitResult[] = [];
  let part = 1;
  for (let start = 0; start < total; start += n) {
    const indices: number[] = [];
    for (let i = start; i < Math.min(start + n, total); i++) indices.push(i);
    const bytes = await buildFromIndices(src, indices);
    results.push({ name: `${base}-part-${part}.pdf`, bytes });
    part++;
  }
  return results;
}

async function buildFromIndices(src: PDFDocument, indices: number[]): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, indices);
  for (const page of copied) out.addPage(page);
  return out.save();
}

/** Bundle multiple split results into a single zip for download. */
export async function zipResults(results: SplitResult[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const r of results) {
    zip.file(r.name, r.bytes);
  }
  const blob = await zip.generateAsync({ type: 'uint8array' });
  return blob;
}
