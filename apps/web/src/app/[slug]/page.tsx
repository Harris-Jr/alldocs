import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TOOLS, getTool } from '@alldocs/config/tools';
import { ToolShell } from '@/components/tool/ToolShell';
import { ToolComponent } from '@/components/tool/registry';
import { Icon } from '@/components/Icon';

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = getTool(params.slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — free & private`,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: `/${tool.slug}` },
    openGraph: {
      title: `${tool.name} — AllDocs`,
      description: tool.description,
      url: `/${tool.slug}`,
    },
  };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getTool(params.slug);
  if (!tool) notFound();

  const related = TOOLS.filter((t) => t.slug !== tool.slug && t.category === tool.category).slice(
    0,
    3,
  );

  const howItWorks =
    tool.processing === 'local'
      ? [
          'Drop your file — it loads straight into your browser.',
          'Set your options and preview the result.',
          'Download. Your file never left your device.',
        ]
      : [
          'Drop your file — it uploads over an encrypted connection.',
          'Our workers process it and return a download link.',
          'The file auto-deletes within the hour. We keep no copy.',
        ];

  // HowTo structured data for SEO.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to ${tool.name.toLowerCase()} online`,
    step: howItWorks.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolShell tool={tool}>
        <ToolComponent slug={tool.slug} />

        {/* SEO + trust content below the tool */}
        <section className="mt-16">
          <h2 className="text-center text-2xl font-extrabold tracking-headline">How it works</h2>
          <ol className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-3">
            {howItWorks.map((step, i) => (
              <li key={i} className="rounded-lg border border-border bg-surface p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-text-primary">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm text-text-secondary">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-center text-2xl font-extrabold tracking-headline">
              Related tools
            </h2>
            <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
              {related.map((t) => (
                <Link key={t.slug} href={`/${t.slug}`} className="tool-tile">
                  <span className="icon-chip">
                    <Icon name={t.icon} size={20} />
                  </span>
                  <span className="mt-3 block text-sm font-semibold">{t.name}</span>
                  <span className="mt-1 block text-xs text-text-secondary">{t.tagline}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </ToolShell>
    </>
  );
}
