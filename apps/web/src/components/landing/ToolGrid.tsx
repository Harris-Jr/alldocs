import Link from 'next/link';
import { TOOLS } from '@alldocs/config/tools';
import { Icon } from '@/components/Icon';

export function ToolGrid() {
  return (
    <section id="tools" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">The toolkit</span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-headline sm:text-4xl">
          Eight tools. One tab.
        </h2>
        <p className="mt-4 text-text-secondary">
          Pick a tool and go — no signup, no page limits, no watermarks on your files.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((t) => (
          <Link
            key={t.slug}
            href={`/${t.slug}`}
            className="tool-tile group flex flex-col"
            aria-label={`${t.name} — ${t.tagline}`}
          >
            <span className="icon-chip">
              <Icon name={t.icon} size={20} />
            </span>
            <span className="mt-4 flex items-center gap-2 text-base font-semibold">
              {t.name}
              {t.processing === 'local' && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                  <Icon name="lock" size={10} />
                  Local
                </span>
              )}
            </span>
            <span className="mt-1 text-sm text-text-secondary">{t.tagline}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
