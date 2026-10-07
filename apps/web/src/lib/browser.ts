import { isPdf } from '@alldocs/pdf-core';

export interface LoadedFile {
  id: string;
  name: string;
  size: number;
  bytes: Uint8Array;
}

export async function fileToLoaded(file: File): Promise<LoadedFile> {
  const buf = new Uint8Array(await file.arrayBuffer());
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    bytes: buf,
  };
}

/** Validate a File is a PDF by magic bytes (never trust extension). */
export async function validatePdf(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (!isPdf(head)) return `${file.name} is not a valid PDF.`;
  return null;
}

export async function validateImage(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isJpg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  const isPng =
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47;
  if (!isJpg && !isPng) return `${file.name} is not a JPG or PNG.`;
  return null;
}

/** Trigger a browser download for raw bytes. */
export function downloadBytes(bytes: Uint8Array, filename: string, mime = 'application/pdf') {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const blob = new Blob([ab], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
