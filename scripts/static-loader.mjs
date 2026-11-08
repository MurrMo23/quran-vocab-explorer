// Lets the SSR bundle read public/data/*.json synchronously at build time (see src/lib/static-data.tsx).
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const publicDir = resolve('public');
const cache = new Map();
globalThis.__QV_STATIC_LOADER__ = (path) => {
  if (!cache.has(path)) {
    try {
      cache.set(path, JSON.parse(readFileSync(join(publicDir, path), 'utf8')));
    } catch {
      cache.set(path, undefined);
    }
  }
  return cache.get(path);
};
