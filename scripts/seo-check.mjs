#!/usr/bin/env node
// On-page SEO checker for the prerendered site. Run after a full build:
//
//   node scripts/seo-check.mjs            # checks ./dist
//   node scripts/seo-check.mjs path/to/dist [--verbose] [--json out.json]
//
// For every prerendered page (dist/**/index.html) and every sitemap URL it reports: title and
// description length, H1 count, canonical, robots, JSON-LD validity (and BreadcrumbList presence),
// inbound internal links (distinct linking pages), images without width/height, and site-wide:
// orphans, duplicate titles/descriptions, sitemap URLs that are missing / noindexed / redirects /
// non-canonical, indexable pages missing from the sitemap, and internal links to redirect pages.
// Exit code is 0 (it is a report, not a gate); use --strict to exit 1 on errors.
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--json'));
const dist = resolve(positional[0] ?? 'dist');
const VERBOSE = flag('--verbose');
const SITE = 'https://quranvocab.com';
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 155;

if (!existsSync(join(dist, 'index.html'))) {
  console.error(`No prerendered site at ${dist} (run the full build first).`);
  process.exit(2);
}

// ---------------------------------------------------------------------------------------------
const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? decode(m[2] ?? m[3] ?? '') : undefined;
};
const len = (s) => [...s].length;
const normPath = (p) => {
  let x = p.split(/[?#]/)[0] || '/';
  try {
    x = decodeURIComponent(x);
  } catch {
    /* keep raw */
  }
  return x === '/' ? '/' : x.replace(/\/+$/, '') || '/';
};
const template = (p) => {
  if (p === '/') return 'home';
  const seg = p.split('/')[1];
  return p.split('/').length > 2 ? `/${seg}/*` : `/${seg}`;
};

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === 'assets' || name === 'og' || name === 'audio' || name === 'data') continue;
      walk(full, out);
    } else if (name === 'index.html') out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Sitemap(s): sitemap.xml may be a <urlset> or a <sitemapindex> of child sitemaps.
function readSitemap(file, seen = new Set()) {
  if (seen.has(file) || !existsSync(file)) return [];
  seen.add(file);
  const xml = readFileSync(file, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1].trim()));
  if (/<sitemapindex/.test(xml)) {
    return locs.flatMap((u) => readSitemap(join(dist, new URL(u).pathname), seen));
  }
  const lastmods = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((m) => m[0].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]);
  return locs.map((loc, i) => ({ loc, lastmod: lastmods[i] }));
}
const sitemapEntries = readSitemap(join(dist, 'sitemap.xml'));
const sitemapPaths = new Map();
for (const e of sitemapEntries) {
  const u = new URL(e.loc);
  sitemapPaths.set(normPath(u.pathname), e);
}

// ---------------------------------------------------------------------------------------------
const pages = new Map(); // path -> info
for (const file of walk(dist)) {
  const rel = relative(dist, file).split(sep).slice(0, -1).join('/');
  const path = rel ? `/${rel}` : '/';
  const html = readFileSync(file, 'utf8');
  const headEnd = html.indexOf('</head>');
  const head = html.slice(0, headEnd);
  const body = html.slice(headEnd);
  const titles = [...head.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/g)].map((m) => decode(m[1].trim()));
  const metaTags = [...head.matchAll(/<meta\b[^>]*>/g)].map((m) => m[0]);
  const linkTags = [...head.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  const descs = metaTags.filter((t) => attr(t, 'name') === 'description').map((t) => attr(t, 'content') ?? '');
  const robots = metaTags.filter((t) => attr(t, 'name') === 'robots').map((t) => attr(t, 'content') ?? '');
  const canonicals = linkTags.filter((t) => attr(t, 'rel') === 'canonical').map((t) => attr(t, 'href') ?? '');
  const ogUrl = metaTags.filter((t) => attr(t, 'property') === 'og:url').map((t) => attr(t, 'content'));
  const ogTitle = metaTags.some((t) => attr(t, 'property') === 'og:title');
  const twTitle = metaTags.some((t) => attr(t, 'name') === 'twitter:title');
  const refresh = metaTags.find((t) => (attr(t, 'http-equiv') ?? '').toLowerCase() === 'refresh');
  // Content as crawlers see it: drop <noscript> fallback and scripts.
  const visible = body.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
  const h1s = [...visible.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => decode(m[1].replace(/<[^>]+>/g, '').trim()));
  const ldBlocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const ldErrors = [];
  const ldTypes = new Set();
  const ldIds = [];
  for (const raw of ldBlocks) {
    try {
      const j = JSON.parse(raw);
      const nodes = Array.isArray(j) ? j : j['@graph'] ?? [j];
      if (!j['@context'] && !Array.isArray(j)) ldErrors.push('missing @context');
      for (const n of nodes) {
        const t = n['@type'];
        (Array.isArray(t) ? t : [t]).forEach((x) => x && ldTypes.add(x));
        if (n['@id']) ldIds.push(n['@id']);
        if (t === 'BreadcrumbList') {
          const items = n.itemListElement ?? [];
          items.forEach((it, i) => {
            if (it.position !== i + 1) ldErrors.push('breadcrumb position gap');
            if (!it.name || !it.item) ldErrors.push('breadcrumb item missing name/item');
          });
        }
        if (t === 'ItemList' && !(n.itemListElement ?? []).length) ldErrors.push('empty ItemList');
        if (t === 'FAQPage' && !(n.mainEntity ?? []).length) ldErrors.push('empty FAQPage');
      }
    } catch (e) {
      ldErrors.push(`invalid JSON: ${e.message.slice(0, 60)}`);
    }
  }
  const dupIds = ldIds.filter((id, i) => ldIds.indexOf(id) !== i);
  if (dupIds.length) ldErrors.push(`duplicate @id: ${[...new Set(dupIds)].join(', ')}`);
  const links = new Set();
  for (const m of visible.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    let href = decode(m[1]);
    if (href.startsWith(SITE)) href = href.slice(SITE.length) || '/';
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    links.add(normPath(href));
  }
  const imgsNoDims = [...visible.matchAll(/<img\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((t) => !/\swidth=/.test(t) || !/\sheight=/.test(t)).length;
  pages.set(path, {
    path,
    template: template(path),
    redirect: !!refresh,
    redirectTo: refresh ? normPath((attr(refresh, 'content') ?? '').replace(/^.*url=/i, '')) : undefined,
    title: titles[0] ?? '',
    titleCount: titles.length,
    desc: descs[0],
    descCount: descs.length,
    robots: robots.join(','),
    noindex: robots.some((r) => /noindex/i.test(r)),
    canonical: canonicals[0],
    canonicalCount: canonicals.length,
    ogUrl: ogUrl[0],
    hasOg: ogTitle,
    hasTwitter: twTitle,
    h1s,
    ldBlocks: ldBlocks.length,
    ldTypes: [...ldTypes],
    ldErrors,
    links,
    imgsNoDims,
    bytes: html.length,
  });
}

// Inbound links: distinct non-redirect source pages linking to each path (self-links excluded).
const inbound = new Map();
for (const p of pages.values()) {
  if (p.redirect) continue;
  for (const target of p.links) {
    if (target === p.path) continue;
    inbound.set(target, (inbound.get(target) ?? 0) + 1);
  }
}
const redirectPaths = new Set([...pages.values()].filter((p) => p.redirect).map((p) => p.path));
// Client-side redirect routes (react-router <Navigate>) that should never be linked internally.
const SPA_REDIRECTS = new Set(['/practice', '/quiz', '/enhanced-quiz', '/mobile-flashcards', '/community', '/community-hub']);

// ---------------------------------------------------------------------------------------------
const issues = []; // [severity, code, path, detail]
const add = (sev, code, path, detail = '') => issues.push([sev, code, path, detail]);

for (const p of pages.values()) {
  if (p.redirect) {
    if (sitemapPaths.has(p.path)) add('error', 'redirect-in-sitemap', p.path, `-> ${p.redirectTo}`);
    if (!p.noindex) add('warn', 'redirect-indexable', p.path);
    if (!p.canonical || normPath(new URL(p.canonical).pathname) !== p.redirectTo)
      add('error', 'redirect-canonical-mismatch', p.path, `${p.canonical} vs ${p.redirectTo}`);
    if (p.redirectTo && !pages.has(p.redirectTo)) add('error', 'redirect-target-missing', p.path, p.redirectTo);
    continue;
  }
  const expected = p.path === '/' ? `${SITE}/` : `${SITE}${encodeURI(p.path)}`;
  if (!p.title) add('error', 'title-missing', p.path);
  if (p.titleCount > 1) add('error', 'title-multiple', p.path, String(p.titleCount));
  if (len(p.title) > TITLE_MAX) add('warn', 'title-long', p.path, `${len(p.title)}: ${p.title}`);
  if (p.desc === undefined) add('error', 'desc-missing', p.path);
  else {
    if (len(p.desc) > DESC_MAX) add('warn', 'desc-long', p.path, `${len(p.desc)}`);
    if (len(p.desc) < DESC_MIN) add('warn', 'desc-short', p.path, `${len(p.desc)}: ${p.desc}`);
  }
  if (p.descCount > 1) add('error', 'desc-multiple', p.path, String(p.descCount));
  if (p.h1s.length !== 1) add(p.h1s.length ? 'warn' : 'error', 'h1-count', p.path, `${p.h1s.length}: ${p.h1s.join(' | ').slice(0, 120)}`);
  if (!p.canonical) add('error', 'canonical-missing', p.path);
  else {
    if (p.canonicalCount > 1) add('error', 'canonical-multiple', p.path, String(p.canonicalCount));
    if (!p.noindex && p.canonical !== expected) add('error', 'canonical-not-self', p.path, p.canonical);
    if (/[?#]/.test(p.canonical)) add('error', 'canonical-query', p.path, p.canonical);
  }
  if (p.ogUrl && p.canonical && p.ogUrl !== p.canonical) add('warn', 'og-url-mismatch', p.path, p.ogUrl);
  if (!p.hasOg) add('warn', 'og-missing', p.path);
  if (!p.hasTwitter) add('warn', 'twitter-missing', p.path);
  if (!p.ldBlocks) add('warn', 'jsonld-missing', p.path);
  for (const e of p.ldErrors) add('error', 'jsonld-invalid', p.path, e);
  if (p.ldBlocks > 1) add('warn', 'jsonld-multiple-blocks', p.path, String(p.ldBlocks));
  if (p.path !== '/' && !p.ldTypes.includes('BreadcrumbList')) add('warn', 'jsonld-no-breadcrumb', p.path);
  if (p.imgsNoDims) add('warn', 'img-no-dimensions', p.path, String(p.imgsNoDims));
  if (!p.noindex && !sitemapPaths.has(p.path)) add('warn', 'indexable-not-in-sitemap', p.path);
  if (p.noindex && sitemapPaths.has(p.path)) add('error', 'noindex-in-sitemap', p.path);
  if (!p.noindex && !(inbound.get(p.path) > 0)) add('error', 'orphan', p.path);
  for (const l of p.links) {
    if (redirectPaths.has(l) || SPA_REDIRECTS.has(l)) add('warn', 'links-to-redirect', p.path, l);
  }
}
for (const [path, e] of sitemapPaths) {
  if (!pages.has(path)) add('warn', 'sitemap-not-prerendered', path);
  const u = new URL(e.loc);
  if (u.search || u.hash || (path !== '/' && u.pathname.endsWith('/'))) add('error', 'sitemap-url-not-canonical', path, e.loc);
}
// Duplicates among indexable pages.
const dupCheck = (key, code) => {
  const by = new Map();
  for (const p of pages.values()) {
    if (p.redirect || p.noindex || !p[key]) continue;
    const k = p[key].toLowerCase();
    by.set(k, [...(by.get(k) ?? []), p.path]);
  }
  for (const [k, paths] of by) if (paths.length > 1) add('warn', code, paths.join(' , '), k.slice(0, 100));
};
dupCheck('title', 'title-duplicate');
dupCheck('desc', 'desc-duplicate');

// ---------------------------------------------------------------------------------------------
const real = [...pages.values()].filter((p) => !p.redirect);
const byTemplate = new Map();
for (const p of real) byTemplate.set(p.template, [...(byTemplate.get(p.template) ?? []), p]);
const stat = (arr) => {
  if (!arr.length) return '-';
  const s = [...arr].sort((a, b) => a - b);
  return `min ${s[0]} / med ${s[Math.floor(s.length / 2)]} / max ${s[s.length - 1]}`;
};
const lastmods = new Set(sitemapEntries.map((e) => e.lastmod).filter(Boolean));

const out = [];
const log = (s = '') => out.push(s);
log(`SEO check: ${dist}`);
log(`Pages: ${real.length} prerendered, ${redirectPaths.size} redirect stubs; sitemap URLs: ${sitemapEntries.length} (${lastmods.size} distinct lastmod values)`);
log('');
log('Per template (indexable pages):');
for (const [t, arr] of [...byTemplate].sort((a, b) => b[1].length - a[1].length)) {
  log(
    `  ${t.padEnd(22)} n=${String(arr.length).padStart(4)}  title ${stat(arr.map((p) => len(p.title)))}  desc ${stat(arr.map((p) => len(p.desc ?? '')))}  inbound ${stat(arr.map((p) => inbound.get(p.path) ?? 0))}  links-out ${stat(arr.map((p) => p.links.size))}  KB ${stat(arr.map((p) => Math.round(p.bytes / 1024)))}`,
  );
  log(`  ${''.padEnd(22)} jsonld: ${[...new Set(arr.flatMap((p) => p.ldTypes))].join(', ')}`);
}
log('');
const counts = new Map();
for (const [sev, code] of issues) counts.set(`${sev} ${code}`, (counts.get(`${sev} ${code}`) ?? 0) + 1);
log('Issue counts:');
for (const [k, n] of [...counts].sort()) log(`  ${k.padEnd(40)} ${n}`);
if (!counts.size) log('  none');
log('');
const LIMIT = VERBOSE ? Infinity : 15;
const byCode = new Map();
for (const i of issues) byCode.set(i[1], [...(byCode.get(i[1]) ?? []), i]);
for (const [code, list] of byCode) {
  log(`${code} (${list.length})${list.length > LIMIT ? ` - first ${LIMIT}, use --verbose for all` : ''}:`);
  for (const [, , path, detail] of list.slice(0, LIMIT)) log(`  ${path}${detail ? `  ${detail}` : ''}`);
}
console.log(out.join('\n'));

const jsonOut = opt('--json');
if (jsonOut) {
  writeFileSync(
    jsonOut,
    JSON.stringify(
      {
        pages: real.map((p) => ({ ...p, links: undefined, linksOut: p.links.size, inbound: inbound.get(p.path) ?? 0, inSitemap: sitemapPaths.has(p.path) })),
        issues,
      },
      null,
      1,
    ),
  );
}
if (flag('--strict') && issues.some((i) => i[0] === 'error')) process.exit(1);
