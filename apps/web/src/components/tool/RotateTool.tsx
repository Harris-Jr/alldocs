'use client';

import { useEffect, useState } from 'react';
import { rotatePdf } from '@alldocs/pdf-core';
import { SinglePdfLoader } from './SinglePdfLoader';
import { ResultPanel } from './ResultPanel';
import { downloadBytes, type LoadedFile } from '@/lib/browser';
import { renderThumbnails, type RenderedThumb } from '@/lib/pdfPreview';
import { Icon } from '@/components/Icon';

export function RotateTool() {
  return (
    <SinglePdfLoader hint="Add a PDF to rotate">
      {(file) => <RotateInner file={file} />}
    </SinglePdfLoader>
  );
}

function RotateInner({ file }: { file: LoadedFile }) {
  const [thumbs, setThumbs] = useState<RenderedThumb[]>([]);
  const [total, setTotal] = useState(0);
  const [rot, setRot] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  useEffect(() => {
    let alive = true;
    renderThumbnails(file.bytes, { maxPages: 30, scale: 0.35 })
      .then((r) => {
        if (!alive) return;
        setThumbs(r.thumbs);
        setTotal(r.total);
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [file.bytes]);

  function bump(pageIndex: number) {
    setRot((prev) => ({ ...prev, [pageIndex]: ((prev[pageIndex] ?? 0) + 90) % 360 }));
  }

  function bumpAll() {
    const next: Record<number, number> = {};
    for (let i = 0; i < total; i++) next[i] = ((rot[i] ?? 0) + 90) % 360;
    setRot(next);
  }

  async function run() {
    setBusy(true);
    setError(null);
    try {
      // Group pages by their chosen angle and apply each group.
      let bytes = file.bytes;
      const byAngle: Record<number, number[]> = { 90: [], 180: [], 270: [] };
      for (let i = 0; i < total; i++) {
        const a = rot[i] ?? 0;
        if (a === 90 || a === 180 || a === 270) byAngle[a]!.push(i);
      }
      for (const angleStr of Object.keys(byAngle)) {
        const angle = Number(angleStr) as 90 | 180 | 270;
        const pages = byAngle[angle]!;
        if (pages.length > 0) {
          bytes = await rotatePdf({ name: file.name, bytes }, angle, pages);
        }
      }
      setResult(bytes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Rotate failed.');
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <ResultPanel
        filename={file.name.replace(/\.pdf$/i, '') + '-rotated.pdf'}
        size={result.length}
        onDownload={() =>
          downloadBytes(result, file.name.replace(/\.pdf$/i, '') + '-rotated.pdf')
        }
        onReset={() => {
          setResult(null);
          setRot({});
        }}
      />
    );
  }

  const anyRotated = Object.values(rot).some((v) => v % 360 !== 0);

  return (
    <div className="card-surface p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-secondary">
          {total ? `${total} page${total > 1 ? 's' : ''}` : 'Loading preview…'}
          {thumbs.length < total && total > 0 && (
            <span className="ml-1 text-text-muted">(showing first {thumbs.length})</span>
          )}
        </p>
        <button className="btn-secondary !py-2 text-sm" onClick={bumpAll} disabled={!total}>
          <Icon name="rotate-cw" size={16} />
          Rotate all
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {thumbs.map((t) => (
          <button
            key={t.pageIndex}
            onClick={() => bump(t.pageIndex)}
            className="group relative rounded-md border border-border bg-page p-1.5 hover:border-accent"
            aria-label={`Rotate page ${t.pageIndex + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.dataUrl}
              alt={`Page ${t.pageIndex + 1}`}
              className="mx-auto transition-transform"
              style={{ transform: `rotate(${rot[t.pageIndex] ?? 0}deg)` }}
            />
            <span className="mt-1 block text-center text-xs text-text-muted">
              {t.pageIndex + 1}
            </span>
            <span className="absolute right-2 top-2 rounded-full bg-accent p-1 text-text-primary opacity-0 transition group-hover:opacity-100">
              <Icon name="rotate-cw" size={12} />
            </span>
          </button>
        ))}
      </div>

      <button
        className="btn-cta mt-6 w-full"
        disabled={busy || !anyRotated}
        onClick={run}
        data-testid="rotate-run"
      >
        {busy ? 'Applying…' : 'Apply rotation'}
      </button>
      {!anyRotated && total > 0 && (
        <p className="mt-2 text-center text-xs text-text-muted">
          Tap a page (or “Rotate all”) to set an angle.
        </p>
      )}
    </div>
  );
}
