// Build step: generates the sitemaps from the same data the app renders (via the SSR bundle), so
// they cannot go stale. Runs after scripts/prerender.mjs (it reads the prerendered pages) and then
// removes the SSR bundle. Writes dist/ (what is deployed) and public/ (the committed copies).
//
//   sitemap.xml              sitemap index, pointing at:
//   sitemap-pages.xml        home, hubs, static pages and the pillar pages (/phrases/<slug>, ...)
//   sitemap-collections.xml  /collections/<id>
//   sitemap-words.xml        /word/<slug>
//   sitemap-roots.xml        /roots/<letter>, /root/<slug>
//   sitemap-surahs.xml       /surah/<n>
//   sitemap-names.xml        /names-of-allah/<slug>
//
// <lastmod> is the date a page's content last changed, not the build date: each page's rendered
// content is hashed and compared with scripts/sitemap-lastmod.json (commit that file after a build
// so the dates carry over). Pages that are not prerendered get no <lastmod>. Pages whose prerendered
// HTML is noindex are left out.
//
// It also guards the word slugs: the build fails if any slug is duplicated, not URL-safe,
// numeric, or equal to another word's id (which would make /word/<x> ambiguous).
import './static-loader.mjs';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE_URL = 'https://quranvocab.com';
const dist = resolve('dist');
const publicDir = resolve('public');
const ssrDir = resolve('dist-ssr');
const manifestFile = resolve('scripts', 'sitemap-lastmod.json');
const ssr = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href);
const { getAllWords, getPublishedCollections, getWordSlug, quranPages, namesPages, pillarPages } = ssr;

// --- Slug guard ------------------------------------------------------------------------------
const words = getAllWords();
const ids = new Set(words.map((w) => w.id));
const seen = new Map();
const errors = [];
for (const w of words) {
  const slug = getWordSlug(w);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push(`slug not URL-safe: ${w.id} -> ${slug}`);
  if (/^\d+$/.test(slug)) errors.push(`numeric slug: ${w.id} -> ${slug}`);
  if (slug !== w.id && ids.has(slug)) errors.push(`slug equals another word's id: ${w.id} -> ${slug}`);
  if (seen.has(slug)) errors.push(`duplicate slug ${slug}: ${seen.get(slug)} and ${w.id}`);
  seen.set(slug, w.id);
}
if (errors.length) {
  console.error(`[sitemap] word slug check failed:\n${errors.join('\n')}`);
  process.exit(1);
}

// --- URL groups ------------------------------------------------------------------------------
// Public, indexable pages. The static ones without a prerendered file are client-rendered.
const staticPages = ['/', '/collections', '/roots', '/surahs', '/names-of-allah', '/ramadan', '/review', '/blog', '/about', '/contact', '/help', '/privacy-policy', '/terms-of-service'];
const collections = getPublishedCollections();
const q = quranPages();
const groups = {
  pages: [...staticPages, ...pillarPages()],
  collections: collections.map((c) => `/collections/${encodeURIComponent(c.id)}`),
  words: words.map((w) => `/word/${encodeURIComponent(getWordSlug(w))}`),
  roots: q.filter((p) => p.startsWith('/roots/') || p.startsWith('/root/')),
  surahs: q.filter((p) => p.startsWith('/surah/')),
  names: namesPages().filter((p) => p !== '/names-of-allah'),
};
const all = Object.values(groups).flat();
const dupes = all.filter((p, i) => all.indexOf(p) !== i);
if (dupes.length) console.warn(`[sitemap] duplicate URLs: ${dupes.join(', ')}`);
const unassigned = [...q, ...namesPages(), ...pillarPages()].filter((p) => !all.includes(p));
if (unassigned.length) console.warn(`[sitemap] prerendered routes in no sitemap: ${unassigned.join(', ')}`);

// --- Content hashes -> lastmod ---------------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
let manifest = {};
try {
  manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
} catch {
  /* first run: every prerendered page gets today's date */
}
const htmlFile = (path) => (path === '/' ? join(dist, 'index.html') : join(dist, decodeURIComponent(path), 'index.html'));
/** What a reader or crawler sees change: title, description, canonical, robots and the rendered page. */
function fingerprint(html) {
  const head = html.slice(0, html.indexOf('</head>'));
  const pick = (re) => head.match(re)?.[0] ?? '';
  const root = html.slice(html.indexOf('data-prerendered="true"'));
  return createHash('sha1')
    .update(pick(/<title[^>]*>[\s\S]*?<\/title>/))
    .update(pick(/<meta[^>]*name="description"[^>]*>/))
    .update(pick(/<link[^>]*rel="canonical"[^>]*>/))
    .update(pick(/<meta[^>]*name="robots"[^>]*>/))
    .update(
      root
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, (m) => (m.includes('application/json') ? m : ''))
        .replace(/-[A-Za-z0-9_-]{8}\.(js|css|woff2?|png|jpe?g|svg|webp)/g, '.$1') // build hashes
        .replace(/©\s*\d{4}/g, '©'), // footer year
    )
    .digest('hex')
    .slice(0, 16);
}
const nextManifest = {};
const lastmodOf = new Map();
const skipped = [];
let changed = 0;
for (const path of all) {
  const file = htmlFile(path);
  if (!existsSync(file) || (path === '/' && !readFileSync(file, 'utf8').includes('data-prerendered="true"'))) continue;
  const html = readFileSync(file, 'utf8');
  if (/<meta[^>]*name="robots"[^>]*noindex/i.test(html.slice(0, html.indexOf('</head>')))) {
    skipped.push(path);
    continue;
  }
  const hash = fingerprint(html);
  const prev = manifest[path];
  const lastmod = prev && prev.hash === hash ? prev.lastmod : today;
  if (!prev || prev.hash !== hash) changed++;
  nextManifest[path] = { hash, lastmod };
  lastmodOf.set(path, lastmod);
}

// --- Write -----------------------------------------------------------------------------------
const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const urlset = (paths) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generated by scripts/generate-sitemap.mjs during the build. Do not edit by hand. -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths
      .filter((p) => !skipped.includes(p))
      .map((p) => {
        const lm = lastmodOf.get(p);
        return `  <url><loc>${xmlEscape(SITE_URL + p)}</loc>${lm ? `<lastmod>${lm}</lastmod>` : ''}</url>`;
      }),
    '</urlset>',
    '',
  ].join('\n');
const files = Object.entries(groups).map(([name, paths]) => {
  const dates = paths.map((p) => lastmodOf.get(p)).filter(Boolean).sort();
  return { file: `sitemap-${name}.xml`, xml: urlset(paths), lastmod: dates[dates.length - 1], count: paths.length };
});
const index = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!-- Generated by scripts/generate-sitemap.mjs during the build. Do not edit by hand. -->',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...files.map((f) => `  <sitemap><loc>${SITE_URL}/${f.file}</loc>${f.lastmod ? `<lastmod>${f.lastmod}</lastmod>` : ''}</sitemap>`),
  '</sitemapindex>',
  '',
].join('\n');

const writeAll = (dir) => {
  writeFileSync(join(dir, 'sitemap.xml'), index);
  for (const f of files) writeFileSync(join(dir, f.file), f.xml);
};
writeAll(dist);
const written = ['dist'];
try {
  writeAll(publicDir);
  written.push('public');
} catch (e) {
  console.warn(`[sitemap] could not update public/ copies: ${e.message}`);
}
try {
  writeFileSync(manifestFile, `${JSON.stringify(nextManifest, null, 0).replace(/\},"/g, '},\n"')}\n`);
} catch (e) {
  console.warn(`[sitemap] could not update ${manifestFile}: ${e.message}`);
}
rmSync(ssrDir, { recursive: true, force: true });
console.log(
  `[sitemap] ${all.length - skipped.length} URLs in ${files.length} sitemaps (${files.map((f) => `${f.file.slice(8, -4)} ${f.count}`).join(', ')}) -> ${written.join(', ')}; ` +
    `${changed} pages new or changed since the last lastmod manifest${skipped.length ? `; ${skipped.length} noindex pages left out` : ''}`,
);
