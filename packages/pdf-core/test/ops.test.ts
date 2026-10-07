import { describe, it, expect } from 'vitest';
import { makePdf, pageCountOf } from './helpers.js';
import { mergePdfs } from '../src/merge.js';
import { splitPdf, zipResults } from '../src/split.js';
import { rotatePdf } from '../src/rotate.js';
import { watermarkPdf } from '../src/watermark.js';
import { addPageNumbers } from '../src/pageNumbers.js';
import { readPdfInfo } from '../src/info.js';
import { PDFDocument } from 'pdf-lib';

describe('mergePdfs', () => {
  it('concatenates page counts in order', async () => {
    const a = await makePdf(2, 'a.pdf');
    const b = await makePdf(3, 'b.pdf');
    const out = await mergePdfs([{ file: a }, { file: b }]);
    expect(await pageCountOf(out)).toBe(5);
  });

  it('respects per-file page ranges', async () => {
    const a = await makePdf(5, 'a.pdf');
    const b = await makePdf(5, 'b.pdf');
    const out = await mergePdfs([
      { file: a, pageSpec: '1-2' },
      { file: b, pageSpec: '5' },
    ]);
    expect(await pageCountOf(out)).toBe(3);
  });

  it('throws on empty input', async () => {
    await expect(mergePdfs([])).rejects.toThrow(/No files/);
  });

  it('rejects a non-pdf', async () => {
    const bad = { name: 'x.pdf', bytes: new Uint8Array([1, 2, 3, 4]) };
    await expect(mergePdfs([{ file: bad }])).rejects.toThrow(/not a valid PDF/);
  });
});

describe('splitPdf', () => {
  it('ranges mode returns one doc with selected pages', async () => {
    const a = await makePdf(10);
    const res = await splitPdf(a, { kind: 'ranges', spec: '2-4' });
    expect(res).toHaveLength(1);
    expect(await pageCountOf(res[0]!.bytes)).toBe(3);
  });

  it('everyN mode chunks correctly', async () => {
    const a = await makePdf(10);
    const res = await splitPdf(a, { kind: 'everyN', n: 3 });
    expect(res).toHaveLength(4); // 3+3+3+1
    expect(await pageCountOf(res[3]!.bytes)).toBe(1);
  });

  it('extract mode yields one doc per page', async () => {
    const a = await makePdf(5);
    const res = await splitPdf(a, { kind: 'extract', spec: '1,3,5' });
    expect(res).toHaveLength(3);
    expect(res.map((r) => r.name)).toEqual([
      'test-page-1.pdf',
      'test-page-3.pdf',
      'test-page-5.pdf',
    ]);
  });

  it('zips multiple results', async () => {
    const a = await makePdf(4);
    const res = await splitPdf(a, { kind: 'everyN', n: 1 });
    const zip = await zipResults(res);
    // zip local file header signature "PK\x03\x04"
    expect(Array.from(zip.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
  });
});

describe('rotatePdf', () => {
  it('rotates all pages additively', async () => {
    const a = await makePdf(2);
    const out = await rotatePdf(a, 90);
    const doc = await PDFDocument.load(out);
    expect(doc.getPage(0).getRotation().angle).toBe(90);
  });

  it('rotates only selected pages', async () => {
    const a = await makePdf(3);
    const out = await rotatePdf(a, 180, [1]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPage(0).getRotation().angle).toBe(0);
    expect(doc.getPage(1).getRotation().angle).toBe(180);
  });
});

describe('watermarkPdf', () => {
  it('produces a valid pdf and preserves page count', async () => {
    const a = await makePdf(2);
    const out = await watermarkPdf(a, { text: 'CONFIDENTIAL', opacity: 0.3 });
    expect(await pageCountOf(out)).toBe(2);
  });
  it('requires text', async () => {
    const a = await makePdf(1);
    await expect(watermarkPdf(a, { text: '  ' })).rejects.toThrow(/required/);
  });
  it('tiled mode still yields valid pdf', async () => {
    const a = await makePdf(1);
    const out = await watermarkPdf(a, { text: 'DRAFT', tile: true });
    expect(await pageCountOf(out)).toBe(1);
  });
});

describe('addPageNumbers', () => {
  it('keeps page count and returns valid pdf', async () => {
    const a = await makePdf(3);
    const out = await addPageNumbers(a, { format: 'Page {n} of {total}' });
    expect(await pageCountOf(out)).toBe(3);
  });
  it('honors skipPages without crashing', async () => {
    const a = await makePdf(3);
    const out = await addPageNumbers(a, { skipPages: [1] });
    expect(await pageCountOf(out)).toBe(3);
  });
});

describe('readPdfInfo', () => {
  it('reports page count and sizes', async () => {
    const a = await makePdf(2);
    const info = await readPdfInfo(a);
    expect(info.pageCount).toBe(2);
    expect(info.sizes[0]).toEqual({ width: 400, height: 600 });
    expect(info.encrypted).toBe(false);
  });
});
