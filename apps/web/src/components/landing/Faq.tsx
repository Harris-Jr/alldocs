const FAQS = [
  {
    q: 'Do my files get uploaded?',
    a: 'For merge, split, rotate, watermark and page numbers — no. Those tools run entirely in your browser using WebAssembly, so the file never leaves your device. Compression and image conversion need a server; for those, your file is encrypted in transit and permanently deleted within the hour.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes — completely, and for good. AllDocs is open source. Every tool is free with no signup, no page-view limits, and no watermark added to your output. You can also self-host the whole thing.',
  },
  {
    q: 'What file sizes can I process?',
    a: 'Up to 200 MB across 10 files per job on the hosted instance. Running your own? The limits are yours to set.',
  },
  {
    q: 'How long do you keep server-processed files?',
    a: 'Download links expire after one hour, and the underlying file is purged from storage automatically. We never keep a copy beyond that window, and we store job metadata only — which itself expires.',
  },
  {
    q: 'Do you use trackers?',
    a: 'There are no third-party trackers on our tool pages. We use privacy-respecting, self-hosted analytics and publish exactly how each tool handles your data on our transparency page.',
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <span className="eyebrow">Questions</span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-headline sm:text-4xl">
          Good questions, straight answers
        </h2>
      </div>

      <div className="mt-10 divide-y divide-border rounded-lg border border-border bg-surface">
        {FAQS.map((f) => (
          <details key={f.q} className="group p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              {f.q}
              <span className="ml-4 text-accent transition group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
