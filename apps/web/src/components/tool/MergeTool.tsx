'use client';

import { useState } from 'react';
import { mergePdfs, humanFileSize } from '@alldocs/pdf-core';
import { Dropzone } from './Dropzone';
import { ResultPanel } from './ResultPanel';
import { Icon } from '@/components/Icon';
import { fileToLoaded, validatePdf, downloadBytes, type LoadedFile } from '@/lib/browser';

interface Row extends LoadedFile {
  pageSpec: string;
}

export function MergeTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ bytes: Uint8Array; name: string } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function addFiles(files: File[]) {
    setError(null);
    const next: Row[] = [];
    for (const f of files) {
      const err = await validatePdf(f);
      if (err) {
        setError(err);
        continue;
      }
      const loaded = await fileToLoaded(f);
      next.push({ ...loaded, pageSpec: '' });
    }
    setRows((prev) => [...prev, ...next]);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= rows.length) return;
    setRows((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item!);
      return copy;
    });
  }

  function remove(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const bytes = await mergePdfs(
        rows.map((r) => ({ file: { name: r.name, bytes: r.bytes }, pageSpec: r.pageSpec })),
      );
      setResult({ bytes, name: 'merged.pdf' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Merge failed.');
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setRows([]);
    setResult(null);
    setError(null);
  }

  if (result) {
    return (
      <ResultPanel
        filename={result.name}
        size={result.bytes.length}
        onDownload={() => downloadBytes(result.bytes, result.name)}
        onReset={reset}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Dropzone
        accept="application/pdf,.pdf"
        multiple
        onFiles={addFiles}
        hint="Add two or more PDFs to combine"
      />

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {rows.length > 0 && (
        <div className="card-surface p-5" data-testid="merge-list">
          <p className="mb-3 text-sm font-semibold text-text-secondary">
            {rows.length} file{rows.length > 1 ? 's' : ''} · drag to reorder
          </p>
          <ul className="space-y-2">
            {rows.map((r, i) => (
              <li
                key={r.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) move(dragIndex, i);
                  setDragIndex(null);
                }}
                className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-page/50 px-3 py-2.5"
                data-testid="merge-row"
              >
                <Icon name="grip" size={16} className="cursor-grab text-text-muted" />
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-text-primary">
                  <Icon name="file-text" size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{r.name}</span>
                  <span className="block text-xs text-text-muted">{humanFileSize(r.size)}</span>
                </span>
                <label className="flex items-center gap-1.5 text-xs text-text-secondary">
                  Pages
                  <input
                    type="text"
                    value={r.pageSpec}
                    placeholder="all"
                    aria-label={`Page range for ${r.name}`}
                    className="w-24 rounded-md border border-border bg-surface px-2 py-1 text-sm focus:border-accent focus:outline-none"
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x) => (x.id === r.id ? { ...x, pageSpec: e.target.value } : x)),
                      )
                    }
                  />
                </label>
                <div className="flex items-center gap-1">
                  <button
                    aria-label="Move up"
                    className="rounded p-1 text-text-muted hover:bg-elevated disabled:opacity-30"
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                  >
                    ↑
                  </button>
                  <button
                    aria-label="Move down"
                    className="rounded p-1 text-text-muted hover:bg-elevated disabled:opacity-30"
                    disabled={i === rows.length - 1}
                    onClick={() => move(i, i + 1)}
                  >
                    ↓
                  </button>
                  <button
                    aria-label={`Remove ${r.name}`}
                    className="rounded p-1 text-text-muted hover:bg-elevated"
                    onClick={() => remove(r.id)}
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button
            className="btn-cta mt-5 w-full"
            disabled={rows.length < 2 || busy}
            onClick={run}
            data-testid="merge-run"
          >
            {busy ? 'Merging…' : `Merge ${rows.length} file${rows.length > 1 ? 's' : ''}`}
          </button>
          {rows.length < 2 && (
            <p className="mt-2 text-center text-xs text-text-muted">Add at least two files.</p>
          )}
        </div>
      )}
    </div>
  );
}
