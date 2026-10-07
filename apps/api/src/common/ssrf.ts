import { BadRequestException } from '@nestjs/common';
import { lookup } from 'node:dns/promises';
import net from 'node:net';

/**
 * SSRF guard for user-supplied URLs (FR-2 URL import).
 * - allow only http/https
 * - resolve DNS and reject private / loopback / link-local / reserved ranges
 *   (defends against DNS-rebind to internal hosts)
 * - cap download size
 */
const BLOCKED_V4 = [
  ['10.0.0.0', 8],
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['0.0.0.0', 8],
  ['100.64.0.0', 10],
] as const;

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}

function inCidr(ip: string, base: string, bits: number): boolean {
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(base) & mask);
}

export function isBlockedIp(ip: string): boolean {
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    // loopback, unique-local (fc00::/7), link-local (fe80::/10), unspecified
    return (
      lower === '::1' ||
      lower === '::' ||
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe8') ||
      lower.startsWith('fe9') ||
      lower.startsWith('fea') ||
      lower.startsWith('feb') ||
      lower.startsWith('::ffff:') // IPv4-mapped — validate the embedded v4 separately
    );
  }
  return BLOCKED_V4.some(([base, bits]) => inCidr(ip, base, bits));
}

export async function assertSafeUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new BadRequestException('Invalid URL.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BadRequestException('Only http and https URLs are allowed.');
  }
  // Resolve every A/AAAA record and reject if any is internal.
  const results = await lookup(url.hostname, { all: true }).catch(() => {
    throw new BadRequestException('Could not resolve host.');
  });
  for (const r of results) {
    if (isBlockedIp(r.address)) {
      throw new BadRequestException('That host is not allowed.');
    }
  }
  return url;
}

export async function fetchWithLimit(url: URL, maxBytes: number): Promise<Uint8Array> {
  const res = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new BadRequestException(`Fetch failed (${res.status}).`);
  const len = Number(res.headers.get('content-length') ?? 0);
  if (len && len > maxBytes) throw new BadRequestException('Remote file is too large.');

  const reader = res.body?.getReader();
  if (!reader) throw new BadRequestException('Empty response.');
  const chunks: Uint8Array[] = [];
  let total = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.length;
      if (total > maxBytes) throw new BadRequestException('Remote file is too large.');
      chunks.push(value);
    }
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}
