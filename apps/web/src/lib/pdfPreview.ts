'use client';

import * as pdfjs from 'pdfjs-dist';

// Serve the worker locally (privacy posture: no CDN). Copied into /public.
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export interface RenderedThumb {
  pageIndex: number; // 0-based
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Render the first N pages of a PDF to data-URL thumbnails for preview.
 * Everything runs in the browser; bytes are never sent anywhere.
 */
export async function renderThumbnails(
  bytes: Uint8Array,
  opts: { maxPages?: number; scale?: number } = {},
): Promise<{ total: number; thumbs: RenderedThumb[] }> {
  const maxPages = opts.maxPages ?? 12;
  const scale = opts.scale ?? 0.4;

  // pdf.js mutates the buffer it's given; hand it a copy.
  const copy = bytes.slice();
  const doc = await pdfjs.getDocument({ data: copy }).promise;
  const total = doc.numPages;
  const count = Math.min(total, maxPages);
  const thumbs: RenderedThumb[] = [];

  for (let i = 1; i <= count; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport }).promise;
    thumbs.push({
      pageIndex: i - 1,
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
    });
    page.cleanup();
  }

  await doc.destroy();
  return { total, thumbs };
}

/** Read just the page count, cheaply. */
export async function countPages(bytes: Uint8Array): Promise<number> {
  const copy = bytes.slice();
  const doc = await pdfjs.getDocument({ data: copy }).promise;
  const total = doc.numPages;
  await doc.destroy();
  return total;
}
