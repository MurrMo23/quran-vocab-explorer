// Build-time prerendering: renders each public route to static HTML (dist/<route>/index.html)
// so crawlers and link previews get real content, titles and structured data. The client
// hydrates this markup (src/main.tsx), so visitors see no flash.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Render as a first-time visitor: empty browser storage (guest state, default theme).
class MemoryStorage {
  #m = new Map();
  get length() { return this.#m.size; }
  key(i) { return [...this.#m.keys()][i] ?? null; }
  getItem(k) { return this.#m.has(k) ? this.#m.get(k) : null; }
  setItem(k, v) { this.#m.set(k, String(v)); }
  removeItem(k) { this.#m.delete(k); }
  clear() { this.#m.clear(); }
}
globalThis.localStorage ??= new MemoryStorage();
globalThis.sessionStorage ??= new MemoryStorage();

const dist = resolve('dist');
const ssrDir = resolve('dist-ssr');
const template = readFileSync(join(dist, 'index.html'), 'utf8');
const { render, routes, getLegacyWordRedirects } = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href);

// Tags the page itself provides via Helmet replace the generic ones in the template.
const stripDefaults = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<link rel="canonical"[^>]*>/, '')
    .replace(/<meta property="og:(title|description|url|type)"[^>]*>/g, '')
    .replace(/<meta name="twitter:(title|description)"[^>]*>/g, '');

const BOOT = /<div id="root">[\s\S]*?<\/div><\/div>/;
let ok = 0;
let redirectsWritten = 0;
const failed = [];
for (const url of routes()) {
  try {
    const { html, head } = await render(url);
    if (!html || html.length < 200) throw new Error('empty render');
    let page = head ? stripDefaults(template).replace('</head>', `${head}</head>`) : template;
    if (!BOOT.test(page)) throw new Error('root placeholder not found in template');
    page = page.replace(BOOT, `<div id="root" data-prerendered="true">${html}</div>`);
    const out = url === '/' ? join(dist, 'index.html') : join(dist, decodeURIComponent(url), 'index.html');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, page);
    ok++;
  } catch (e) {
    failed.push(`${url}: ${e.message}`);
  }
}
// Legacy word URLs (/word/<id>) -> tiny redirect pages to /word/<slug>. The host has no real 301s,
// so these send visitors on and let crawlers consolidate on the slug URL.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
for (const { id, slug } of getLegacyWordRedirects?.() ?? []) {
  try {
    const to = `/word/${encodeURIComponent(slug)}`;
    const abs = `https://quranvocab.com${to}`;
    const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Redirecting…</title><link rel="canonical" href="${esc(abs)}"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0; url=${esc(to)}"><script>location.replace(${JSON.stringify(to)}+location.search+location.hash)</script></head><body><p>This page has moved to <a href="${esc(to)}">${esc(abs)}</a>.</p></body></html>\n`;
    const out = join(dist, 'word', id, 'index.html');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, page);
    redirectsWritten++;
  } catch (e) {
    failed.push(`/word/${id} (redirect): ${e.message}`);
  }
}
rmSync(ssrDir, { recursive: true, force: true });
console.log(`[prerender] ${ok} pages written, ${redirectsWritten} legacy redirects, ${failed.length} failed`);
if (failed.length) {
  console.log(failed.slice(0, 20).join('\n'));
  // A partial prerender still leaves a working SPA for the failed routes; only fail the build
  // if most pages broke, which means something is systematically wrong.
  if (failed.length > ok) process.exit(1);
}
