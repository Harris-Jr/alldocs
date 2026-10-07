import type { PageRange } from './types';

/** %PDF magic-byte check — never trust the extension. */
export function isPdf(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 // F
  );
}

export function assertPdf(bytes: Uint8Array, label = 'file'): void {
  if (!isPdf(bytes)) {
    throw new Error(`${label} is not a valid PDF (magic bytes %PDF not found).`);
  }
}

/** Parse "1-3,5,7-9" (1-based) into sorted, de-duplicated 0-based page indices. */
export function parsePageSpec(spec: string, pageCount: number): number[] {
  const out = new Set<number>();
  const trimmed = spec.trim();
  if (!trimmed) return [];
  for (const partRaw of trimmed.split(',')) {
    const part = partRaw.trim();
    if (!part) continue;
    const dash = part.indexOf('-');
    if (dash === -1) {
      const n = Number(part);
      if (!Number.isInteger(n)) throw new Error(`Invalid page "${part}".`);
      pushPage(out, n, pageCount);
    } else {
      const from = Number(part.slice(0, dash).trim());
      const to = Number(part.slice(dash + 1).trim());
      if (!Number.isInteger(from) || !Number.isInteger(to)) {
        throw new Error(`Invalid range "${part}".`);
      }
      const lo = Math.min(from, to);
      const hi = Math.max(from, to);
      for (let n = lo; n <= hi; n++) pushPage(out, n, pageCount);
    }
  }
  return [...out].sort((a, b) => a - b);
}

function pushPage(set: Set<number>, oneBased: number, pageCount: number): void {
  if (oneBased < 1 || oneBased > pageCount) {
    throw new Error(`Page ${oneBased} is out of range (1–${pageCount}).`);
  }
  set.add(oneBased - 1);
}

/** Convert ranges (1-based inclusive) to 0-based indices, validated. */
export function rangesToIndices(ranges: PageRange[], pageCount: number): number[] {
  const out: number[] = [];
  for (const r of ranges) {
    const lo = Math.min(r.from, r.to);
    const hi = Math.max(r.from, r.to);
    if (lo < 1 || hi > pageCount) {
      throw new Error(`Range ${r.from}-${r.to} is out of range (1–${pageCount}).`);
    }
    for (let n = lo; n <= hi; n++) out.push(n - 1);
  }
  return out;
}

/** #RRGGBB → {r,g,b} in 0..1 for pdf-lib's rgb(). */
export function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '').trim();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) {
    throw new Error(`Invalid hex color "${hex}".`);
  }
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  };
}

export function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}
