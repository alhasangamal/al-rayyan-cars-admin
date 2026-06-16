import 'server-only';

import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']);
const maxImageSizeBytes = 5 * 1024 * 1024;
const maxPdfSizeBytes = 10 * 1024 * 1024;

function safeName(name: string) {
  const extension = path.extname(name).toLowerCase() || '.bin';
  const base = path.basename(name, extension).replace(/[^\w\u0600-\u06FF-]+/g, '-').slice(0, 48) || 'file';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${base}${extension}`;
}

export async function saveUploadedFile(file: File | null, publicSubdir: string) {
  if (!file || file.size === 0) return null;
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error('Unsupported file type');
  }
  const maxSize = file.type === 'application/pdf' ? maxPdfSizeBytes : maxImageSizeBytes;
  if (file.size > maxSize) {
    throw new Error(`File is too large. Maximum allowed size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
  }

  const relativeDir = publicSubdir.replace(/^\/+|\/+$/g, '');
  const fileName = safeName(file.name);
  const diskDir = path.join(process.cwd(), 'public', relativeDir);
  const diskPath = path.join(diskDir, fileName);

  await mkdir(diskDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, bytes);

  return `/${relativeDir.replace(/\\/g, '/')}/${fileName}`;
}
