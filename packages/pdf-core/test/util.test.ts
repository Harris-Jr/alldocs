import { describe, it, expect } from 'vitest';
import { isPdf, parsePageSpec, rangesToIndices, hexToRgb01, humanFileSize } from '../src/util.js';

describe('isPdf', () => {
  it('accepts %PDF header', () => {
    expect(isPdf(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]))).toBe(true);
  });
  it('rejects non-pdf', () => {
    expect(isPdf(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
    expect(isPdf(new Uint8Array([]))).toBe(false);
  });
});

describe('parsePageSpec', () => {
  it('parses single pages and ranges into sorted 0-based indices', () => {
    expect(parsePageSpec('1-3,5', 10)).toEqual([0, 1, 2, 4]);
  });
  it('dedupes and sorts overlapping ranges', () => {
    expect(parsePageSpec('5,1-3,2-4', 10)).toEqual([0, 1, 2, 3, 4]);
  });
  it('handles reversed ranges', () => {
    expect(parsePageSpec('3-1', 10)).toEqual([0, 1, 2]);
  });
  it('throws on out-of-range', () => {
    expect(() => parsePageSpec('11', 10)).toThrow(/out of range/);
  });
  it('throws on garbage', () => {
    expect(() => parsePageSpec('abc', 10)).toThrow(/Invalid/);
  });
  it('returns empty for empty spec', () => {
    expect(parsePageSpec('', 10)).toEqual([]);
  });
});

describe('rangesToIndices', () => {
  it('expands inclusive ranges', () => {
    expect(rangesToIndices([{ from: 1, to: 2 }, { from: 4, to: 4 }], 5)).toEqual([0, 1, 3]);
  });
  it('throws when exceeding page count', () => {
    expect(() => rangesToIndices([{ from: 1, to: 6 }], 5)).toThrow(/out of range/);
  });
});

describe('hexToRgb01', () => {
  it('parses 6-digit hex', () => {
    const c = hexToRgb01('#7C3AED');
    expect(c.r).toBeCloseTo(124 / 255);
    expect(c.g).toBeCloseTo(58 / 255);
    expect(c.b).toBeCloseTo(237 / 255);
  });
  it('parses 3-digit shorthand', () => {
    expect(hexToRgb01('#fff')).toEqual({ r: 1, g: 1, b: 1 });
  });
  it('throws on bad hex', () => {
    expect(() => hexToRgb01('#zzz')).toThrow();
  });
});

describe('humanFileSize', () => {
  it('formats bytes/KB/MB', () => {
    expect(humanFileSize(512)).toBe('512 B');
    expect(humanFileSize(2048)).toBe('2.0 KB');
    expect(humanFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
