import Link from 'next/link';
import { Icon } from '@/components/Icon';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-24 lg:pt-16">
        {/* Left: headline */}
        <div className="animate-fade-up">
          <span className="badge-new">Open source</span>
          <h1 className="mt-5 text-balance text-5xl font-extrabold uppercase leading-[0.95] tracking-headline sm:text-6xl lg:text-7xl">
            Every document
            <br />
            tool, in your
            <br />
            browser<span className="accent-dot">.</span>
          </h1>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-text-secondary">
            Merge, split, compress, convert, rotate and watermark your PDFs — fast and free.
            Lightweight tools run entirely on your device, so your files never leave your computer.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href="#tools" className="btn-cta">
              Get started
            </Link>
            <Link href="#tools" className="btn-link">
              See all tools
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>

          {/* Open-source signal row */}
          <div className="mt-8 flex items-center gap-3 text-sm text-text-secondary">
            <Icon name="lock" size={16} className="text-text-primary" />
            <span>
              <span className="font-bold text-text-primary">Free forever.</span> No signup, no
              limits, no watermarks — and the code is open.
            </span>
          </div>
        </div>

        {/* Right: product UI mockup over an oversized orange shape */}
        <div className="relative animate-fade-up [animation-delay:120ms]">
          {/* oversized decorative orange circle (flat, behind card) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-shape-orange"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-shape-yellow"
          />

          <div className="relative card-surface overflow-hidden shadow-float">
            {/* mock window chrome */}
            <div className="flex items-center gap-1.5 border-b border-border-card bg-elevated px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-text-muted/40" />
              <span className="h-3 w-3 rounded-full bg-text-muted/40" />
              <span className="h-3 w-3 rounded-full bg-text-muted/40" />
              <span className="ml-3 text-xs font-medium text-text-muted">AllDocs · Merge PDF</span>
            </div>
            <div className="space-y-3 p-5">
              {['Q3-report.pdf', 'appendix.pdf', 'cover-letter.pdf'].map((f, i) => (
                <div
                  key={f}
                  className="flex items-center gap-3 rounded-sm border border-border-card bg-page px-3 py-3"
                >
                  <Icon name="grip" size={16} className="text-text-muted" />
                  <span className="icon-chip !h-9 !w-9">
                    <Icon name="file-text" size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium">{f}</span>
                  <span className="text-xs text-text-muted">{(i + 2) * 3} pages</span>
                </div>
              ))}
              <button className="btn-cta w-full">Merge 3 files</button>
            </div>
          </div>

          {/* floating stat cards, dashed connectors */}
          <div className="absolute -left-5 -top-4 hidden animate-float items-center gap-2 rounded-pill border border-border-card bg-surface px-3.5 py-2 shadow-float sm:flex">
            <Icon name="check" size={15} className="text-success" />
            <span className="text-xs font-semibold">Processed locally</span>
          </div>
          <div className="absolute -right-2 bottom-16 hidden animate-float items-center gap-2 rounded-pill border border-border-card bg-surface px-3.5 py-2 shadow-float [animation-delay:1.5s] sm:flex">
            <span className="text-xs font-semibold">7 files merged</span>
          </div>
        </div>
      </div>
    </section>
  );
}
