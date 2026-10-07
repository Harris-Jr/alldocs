'use client';

import { MergeTool } from './MergeTool';
import { SplitTool } from './SplitTool';
import { RotateTool } from './RotateTool';
import { WatermarkTool } from './WatermarkTool';
import { PageNumbersTool } from './PageNumbersTool';
import { ServerTool, type ServerToolConfig } from './ServerTool';
import { COMPRESS_PRESETS } from '@alldocs/config/limits';

const compressConfig: ServerToolConfig = {
  tool: 'compress-pdf',
  accept: 'application/pdf,.pdf',
  kind: 'pdf',
  defaultOptions: { preset: 'recommended' },
  renderOptions: (options, setOptions) => (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Compression level</legend>
      <div className="grid grid-cols-3 gap-2">
        {COMPRESS_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={options.preset === p}
            onClick={() => setOptions({ ...options, preset: p })}
            className={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition ${
              options.preset === p
                ? 'border-accent bg-accent text-text-primary'
                : 'border-border bg-page hover:border-accent'
            }`}
          >
            {p.replace('-', ' ')}
          </button>
        ))}
      </div>
    </fieldset>
  ),
};

const pdfToJpgConfig: ServerToolConfig = {
  tool: 'pdf-to-jpg',
  accept: 'application/pdf,.pdf',
  kind: 'pdf',
  defaultOptions: { dpi: 150 },
  renderOptions: (options, setOptions) => (
    <label className="block text-sm font-medium">
      Quality (DPI): {String(options.dpi ?? 150)}
      <input
        type="range"
        min={72}
        max={300}
        step={6}
        value={Number(options.dpi ?? 150)}
        onChange={(e) => setOptions({ ...options, dpi: Number(e.target.value) })}
        className="mt-2 block w-full accent-accent"
      />
    </label>
  ),
};

const jpgToPdfConfig: ServerToolConfig = {
  tool: 'jpg-to-pdf',
  accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
  kind: 'image',
  multiple: true,
  defaultOptions: { pageSize: 'fit' },
  renderOptions: (options, setOptions) => (
    <label className="block text-sm font-medium">
      Page size
      <select
        value={String(options.pageSize ?? 'fit')}
        onChange={(e) => setOptions({ ...options, pageSize: e.target.value })}
        className="mt-1 block w-full rounded-md border border-border bg-page px-3 py-2 focus:border-accent focus:outline-none"
      >
        <option value="fit">Fit to image</option>
        <option value="a4">A4</option>
        <option value="letter">Letter</option>
      </select>
    </label>
  ),
};

export function ToolComponent({ slug }: { slug: string }) {
  switch (slug) {
    case 'merge-pdf':
      return <MergeTool />;
    case 'split-pdf':
      return <SplitTool />;
    case 'rotate-pdf':
      return <RotateTool />;
    case 'watermark-pdf':
      return <WatermarkTool />;
    case 'page-numbers':
      return <PageNumbersTool />;
    case 'compress-pdf':
      return <ServerTool config={compressConfig} />;
    case 'pdf-to-jpg':
      return <ServerTool config={pdfToJpgConfig} />;
    case 'jpg-to-pdf':
      return <ServerTool config={jpgToPdfConfig} />;
    default:
      return null;
  }
}
