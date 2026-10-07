/** A loaded source file: raw bytes plus a display name. */
export interface SourceFile {
  name: string;
  bytes: Uint8Array;
}

/** 1-based inclusive page range. */
export interface PageRange {
  from: number;
  to: number;
}

export type RotationAngle = 90 | 180 | 270;

export interface WatermarkOptions {
  text: string;
  /** 0..1 */
  opacity?: number;
  /** points; default auto-sized to page */
  fontSize?: number;
  /** degrees, counter-clockwise; default 45 */
  rotation?: number;
  /** hex color like #7C3AED; default gray */
  color?: string;
  /** tile across the page vs single centered placement */
  tile?: boolean;
}

export type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right'
  | 'top-left';

export interface PageNumberOptions {
  position?: PageNumberPosition;
  /** e.g. "Page {n} of {total}" or "{n}" */
  format?: string;
  startAt?: number;
  fontSize?: number;
  /** 1-based page indices to skip (no number drawn) */
  skipPages?: number[];
  /** hex color; default near-black */
  color?: string;
  margin?: number;
}

export interface SplitResult {
  name: string;
  bytes: Uint8Array;
}
