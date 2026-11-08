// Large read-only data (the root library) lives in public/data/*.json instead of the JS bundle.
//
// - Prerender (scripts/prerender.mjs) installs a synchronous loader, so the page renders with its data
//   and embeds that JSON in the HTML (<EmbedStaticData>).
// - On hydration the client reads the embedded JSON synchronously, so the first client render matches.
// - On client-side navigation the JSON is fetched.
import React, { useEffect, useState } from 'react';

declare global {
  // eslint-disable-next-line no-var
  var __QV_STATIC_LOADER__: ((path: string) => unknown) | undefined;
}

const cache = new Map<string, unknown>();
const scriptId = (path: string) => `qvd${path.replace(/[^a-z0-9]+/gi, '-')}`;

/** Data already available without a network request (cache, prerender loader or embedded JSON). */
export function peekStaticData<T>(path: string): T | undefined {
  if (cache.has(path)) return cache.get(path) as T;
  let value: unknown;
  if (typeof document === 'undefined') {
    value = globalThis.__QV_STATIC_LOADER__?.(path);
  } else {
    const el = document.getElementById(scriptId(path));
    if (el?.textContent) {
      try {
        value = JSON.parse(el.textContent);
      } catch {
        value = undefined;
      }
    }
  }
  if (value !== undefined) cache.set(path, value);
  return value as T | undefined;
}

export function useStaticData<T>(path: string | null): { data: T | undefined; error: boolean } {
  const [state, setState] = useState<{ path: string | null; data: T | undefined; error: boolean }>(() => ({
    path,
    data: path ? peekStaticData<T>(path) : undefined,
    error: false,
  }));

  useEffect(() => {
    if (!path) return;
    const ready = peekStaticData<T>(path);
    if (ready !== undefined) {
      setState({ path, data: ready, error: false });
      return;
    }
    let alive = true;
    setState({ path, data: undefined, error: false });
    fetch(path)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((v: T) => {
        cache.set(path, v);
        if (alive) setState({ path, data: v, error: false });
      })
      .catch(() => {
        if (alive) setState({ path, data: undefined, error: true });
      });
    return () => {
      alive = false;
    };
  }, [path]);

  // Never show the previous page's data while the next one loads.
  return state.path === path ? { data: state.data, error: state.error } : { data: undefined, error: false };
}

/** Embeds the JSON a page rendered with, so hydration can reuse it without a request. */
export const EmbedStaticData: React.FC<{ path: string; data: unknown }> = ({ path, data }) => (
  <script
    type="application/json"
    id={scriptId(path)}
    // JSON with "<" escaped cannot close the script element.
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
);
