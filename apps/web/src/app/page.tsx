import { Hero } from '@/components/landing/Hero';
import { ToolGrid } from '@/components/landing/ToolGrid';
import { FeatureTabs } from '@/components/landing/FeatureTabs';
import { DarkFeatures } from '@/components/landing/DarkFeatures';
import { OpenSource } from '@/components/landing/OpenSource';
import { Faq } from '@/components/landing/Faq';
import { TOOLS } from '@alldocs/config/tools';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alldocs.app';

// Structured data for rich results — WebApplication + the tool catalog.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AllDocs',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any (browser-based)',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Privacy-first browser-based document toolkit: merge, split, compress, convert, rotate and watermark PDFs.',
  url: SITE_URL,
  featureList: TOOLS.map((t) => t.name),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <ToolGrid />
      <FeatureTabs />
      <DarkFeatures />
      <OpenSource />
      <Faq />
    </>
  );
}
