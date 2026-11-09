// Build-time prerendering: renders each public route to static HTML (dist/<route>/index.html)
// so crawlers and link previews get real content, titles and structured data. The client
// hydrates this markup (src/main.tsx), so visitors see no flash.
import './static-loader.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
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
const { render, routes, getLegacyWordRedirects, staticRedirects } = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href);

// Tags the page itself provides via Helmet (src/components/SEO.tsx) replace the generic ones in the
// template, so each page has exactly one of each and a single JSON-LD graph.
const stripDefaults = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="(description|author)"[^>]*>/g, '')
    .replace(/<link rel="canonical"[^>]*>/, '')
    .replace(/<meta property="og:[a-z_:]+"[^>]*>/g, '')
    .replace(/<meta name="twitter:[a-z_:]+"[^>]*>/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
// The template's <noscript> fallback (generic H1 and links to old URLs) is only for the unrendered
// shell; prerendered pages already carry their real content.
const stripNoscript = (html) => html.replace(/\s*<!-- Readable fallback[^>]*-->\s*<noscript>[\s\S]*?<\/noscript>/, '');

const BOOT = /<div id="root">[\s\S]*?<\/div><\/div>/;
const BOOT_HTML = template.match(BOOT)[0].replace(/^<div id="root">/, '').replace(/<\/div>$/, '');
// dist/index.html is also the SPA fallback for client-only routes. On any path other than '/', hide the
// prerendered home before first paint (head script) and restore the boot shell so React mounts fresh.
const HOME_GUARD_HEAD = `<script>if(location.pathname!=='/')document.documentElement.classList.add('qv-shell')</script><style>.qv-shell #root[data-prerendered]{visibility:hidden}</style>`;
const HOME_GUARD_BODY = `<script>(function(){if(location.pathname==='/')return;var r=document.getElementById('root');r.removeAttribute('data-prerendered');r.innerHTML=${JSON.stringify(BOOT_HTML)};document.documentElement.classList.remove('qv-shell')})()</script>`;
let ok = 0;
let redirectsWritten = 0;
const failed = [];
for (const url of routes()) {
  try {
    const { html, head } = await render(url);
    if (!html || html.length < 200) throw new Error('empty render');
    let page = head ? stripDefaults(template).replace('</head>', `${head}</head>`) : template;
    if (!BOOT.test(page)) throw new Error('root placeholder not found in template');
    page = page.replace(BOOT, () => `<div id="root" data-prerendered="true">${html}</div>`);
    if (url === '/') {
      page = page.replace('</head>', `${HOME_GUARD_HEAD}</head>`);
      page = page.replace(/(<div id="root" data-prerendered="true">[\s\S]*?)(\s*<!-- Readable fallback)/, (_m, a, b) => `${a}${HOME_GUARD_BODY}${b}`);
      if (!page.includes(HOME_GUARD_BODY)) throw new Error('home guard not inserted');
    }
    if (head) page = stripNoscript(page);
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
// Other moved URLs (e.g. /juz/30 -> /juz-amma-vocabulary), same kind of page.
for (const { from, to } of staticRedirects?.() ?? []) {
  try {
    const abs = `https://quranvocab.com${to}`;
    const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Redirecting…</title><link rel="canonical" href="${esc(abs)}"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0; url=${esc(to)}"><script>location.replace(${JSON.stringify(to)}+location.search+location.hash)</script></head><body><p>This page has moved to <a href="${esc(to)}">${esc(abs)}</a>.</p></body></html>\n`;
    const out = join(dist, from, 'index.html');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, page);
    redirectsWritten++;
  } catch (e) {
    failed.push(`${from} (redirect): ${e.message}`);
  }
}
// dist-ssr is removed by scripts/generate-sitemap.mjs, which runs next and still needs it.
console.log(`[prerender] ${ok} pages written, ${redirectsWritten} redirects, ${failed.length} failed`);
if (failed.length) {
  console.log(failed.slice(0, 20).join('\n'));
  // A partial prerender still leaves a working SPA for the failed routes; only fail the build
  // if most pages broke, which means something is systematically wrong.
  if (failed.length > ok) process.exit(1);
}
