'use client';

import { useState } from 'react';
import { watermarkPdf } from '@alldocs/pdf-core';
import { SinglePdfLoader } from './SinglePdfLoader';
import { ResultPanel } from './ResultPanel';
import { downloadBytes, type LoadedFile } from '@/lib/browser';

export function WatermarkTool() {
  return (
    <SinglePdfLoader hint="Add a PDF to watermark">
      {(file) => <WatermarkInner file={file} />}
    </SinglePdfLoader>
  );
}

function WatermarkInner({ file }: { file: LoadedFile }) {
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.2);
  const [rotation, setRotation] = useState(45);
  const [tile, setTile] = useState(false);
  const [color, setColor] = useState('#7C3AED');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const bytes = await watermarkPdf(
        { name: file.name, bytes: file.bytes },
        { text, opacity, rotation, tile, color },
      );
      setResult(bytes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Watermark failed.');
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const out = file.name.replace(/\.pdf$/i, '') + '-watermarked.pdf';
    return (
      <ResultPanel
        filename={out}
        size={result.length}
        onDownload={() => downloadBytes(result, out)}
        onReset={() => setResult(null)}
      />
    );
  }

  return (
    <div className="card-surface space-y-5 p-6">
      <label className="block text-sm font-medium">
        Watermark text
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border bg-page px-3 py-2 focus:border-accent focus:outline-none"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Opacity: {Math.round(opacity * 100)}%
          <input
            type="range"
            min={5}
            max={100}
            value={opacity * 100}
            onChange={(e) => setOpacity(Number(e.target.value) / 100)}
            className="mt-2 block w-full accent-accent"
          />
        </label>
        <label className="block text-sm font-medium">
          Rotation: {rotation}°
          <input
            type="range"
            min={0}
            max={90}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="mt-2 block w-full accent-accent"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm font-medium">
          Color
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-12 cursor-pointer rounded border border-border"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={tile}
            onChange={(e) => setTile(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Tile across page
        </label>
      </div>

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <button className="btn-cta w-full" disabled={busy} onClick={run} data-testid="watermark-run">
        {busy ? 'Applying…' : 'Add watermark'}
      </button>
    </div>
  );
}
