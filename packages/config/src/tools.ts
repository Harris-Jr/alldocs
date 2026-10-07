/**
 * Canonical Phase-1 tool catalog.
 * Drives: landing-page tool grid, per-tool route generation, SEO metadata,
 * and the processing-location badge ("local" vs "server").
 */

export type ProcessingLocation = 'local' | 'server';

export interface ToolDef {
  /** URL slug — route is /{slug} */
  slug: string;
  /** Display name */
  name: string;
  /** Short grid-tile tagline */
  tagline: string;
  /** Longer description for the tool page hero + meta description */
  description: string;
  /** Lucide-style icon name used by the web app's Icon component */
  icon: string;
  /** Where processing happens — determines the privacy badge */
  processing: ProcessingLocation;
  /** Category grouping (matches features doc) */
  category: 'Organize' | 'Optimize' | 'Convert' | 'Edit';
  /** SEO keywords for the per-tool page */
  keywords: string[];
  /** Whether this tool is live in Phase 1 */
  phase1: boolean;
}

export const TOOLS: ToolDef[] = [
  {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    tagline: 'Combine PDFs in the order you want.',
    description:
      'Combine multiple PDF files into one document. Drag to reorder, pick page ranges per file. Runs entirely in your browser — your files never leave your device.',
    icon: 'layers',
    processing: 'local',
    category: 'Organize',
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'merge pdf online free'],
    phase1: true,
  },
  {
    slug: 'split-pdf',
    name: 'Split PDF',
    tagline: 'Separate one PDF into many.',
    description:
      'Split a PDF by page ranges, every N pages, or extract specific pages. Download a single PDF or a zip. Processed locally in your browser.',
    icon: 'scissors',
    processing: 'local',
    category: 'Organize',
    keywords: ['split pdf', 'extract pdf pages', 'separate pdf', 'split pdf online'],
    phase1: true,
  },
  {
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    tagline: 'Turn pages the right way up.',
    description:
      'Rotate all pages or selected pages by 90°, 180°, or 270°. Instant, local, and free — nothing is uploaded.',
    icon: 'rotate-cw',
    processing: 'local',
    category: 'Organize',
    keywords: ['rotate pdf', 'turn pdf pages', 'rotate pdf online free'],
    phase1: true,
  },
  {
    slug: 'watermark-pdf',
    name: 'Watermark PDF',
    tagline: 'Stamp text across your pages.',
    description:
      'Add a text watermark with control over opacity, rotation, size, and position. Tiled or single placement. Runs on your device — never uploaded.',
    icon: 'stamp',
    processing: 'local',
    category: 'Edit',
    keywords: ['watermark pdf', 'add watermark to pdf', 'pdf watermark online'],
    phase1: true,
  },
  {
    slug: 'page-numbers',
    name: 'Page Numbers',
    tagline: 'Number your pages, your way.',
    description:
      'Add page numbers with custom position, format, starting number, and pages to skip. Processed locally in the browser.',
    icon: 'hash',
    processing: 'local',
    category: 'Edit',
    keywords: ['add page numbers to pdf', 'pdf page numbers', 'number pdf pages'],
    phase1: true,
  },
  {
    slug: 'compress-pdf',
    name: 'Compress PDF',
    tagline: 'Shrink file size, keep quality.',
    description:
      'Reduce PDF file size with three quality presets. Heavy lifting runs on our secure workers; your file is encrypted in transit, processed, and auto-deleted within the hour.',
    icon: 'minimize-2',
    processing: 'server',
    category: 'Optimize',
    keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'compress pdf online'],
    phase1: true,
  },
  {
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG',
    tagline: 'Turn each page into an image.',
    description:
      'Convert every PDF page into a high-quality JPG image, delivered as a zip. Rendered on our workers and auto-deleted within the hour.',
    icon: 'image',
    processing: 'server',
    category: 'Convert',
    keywords: ['pdf to jpg', 'pdf to image', 'convert pdf to jpg', 'pdf to jpg online'],
    phase1: true,
  },
  {
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    tagline: 'Bundle images into one PDF.',
    description:
      'Combine JPG and PNG images into a single PDF, with page-size and orientation control. Processed on our workers and auto-deleted within the hour.',
    icon: 'file-image',
    processing: 'server',
    category: 'Convert',
    keywords: ['jpg to pdf', 'image to pdf', 'convert jpg to pdf', 'png to pdf'],
    phase1: true,
  },
];

export const LOCAL_TOOLS = TOOLS.filter((t) => t.processing === 'local');
export const SERVER_TOOLS = TOOLS.filter((t) => t.processing === 'server');

export function getTool(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export const TOOL_CATEGORIES = ['Organize', 'Optimize', 'Convert', 'Edit'] as const;
