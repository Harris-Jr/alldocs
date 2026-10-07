'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';

interface Tab {
  id: string;
  label: string;
  icon: string;
  heading: string;
  body: string;
  bullets: string[];
}

const TABS: Tab[] = [
  {
    id: 'organize',
    label: 'Organize',
    icon: 'layers',
    heading: 'Reshape any PDF in seconds',
    body: 'Merge files in the exact order you want, split a big document into pieces, rotate scanned pages the right way up — all without an upload.',
    bullets: ['Drag to reorder before merging', 'Split by range, every-N, or extract', 'Rotate all or selected pages'],
  },
  {
    id: 'optimize',
    label: 'Optimize',
    icon: 'minimize-2',
    heading: 'Smaller files, same clarity',
    body: 'Compress oversized PDFs with three quality presets. Heavy processing runs on secure workers, with your file encrypted in transit and deleted within the hour.',
    bullets: ['Extreme, Recommended, Less-loss presets', 'See before/after size instantly', 'Auto-deleted — zero retention'],
  },
  {
    id: 'convert',
    label: 'Convert',
    icon: 'image',
    heading: 'Move between formats cleanly',
    body: 'Turn each PDF page into a crisp JPG, or bundle a folder of images into a single PDF — with sensible page sizing and orientation handling.',
    bullets: ['PDF → JPG, page by page', 'JPG / PNG → one PDF', 'Delivered as a tidy zip'],
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: 'stamp',
    heading: 'Mark up without the markup',
    body: 'Stamp watermarks across your pages or add polished page numbers, with full control over position and style — processed entirely on your device.',
    bullets: ['Text watermarks, tiled or centered', 'Page numbers with {n} of {total}', 'Pick position, skip pages, set start'],
  },
];

export function FeatureTabs() {
  const [active, setActive] = useState(TABS[0]!.id);
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">One hub</span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-headline sm:text-4xl">
          Four jobs. Zero friction.
        </h2>
      </div>

      <div
        className="mt-10 flex flex-wrap justify-center gap-2.5"
        role="tablist"
        aria-label="Feature categories"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            className="tab-pill"
            onClick={() => setActive(t.id)}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div
        id={`panel-${tab.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab.id}`}
        className="card-surface mt-8 grid items-center gap-8 p-8 lg:grid-cols-2 lg:p-12"
      >
        <div>
          <h3 className="text-2xl font-extrabold tracking-headline">{tab.heading}</h3>
          <p className="mt-4 text-text-secondary">{tab.body}</p>
          <ul className="mt-6 space-y-3">
            {tab.bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm font-medium">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <Icon name="check" size={13} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-elevated p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-shape-orange/70"
          />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-lg bg-accent text-text-primary">
            <Icon name={tab.icon} size={48} />
          </div>
        </div>
      </div>
    </section>
  );
}
