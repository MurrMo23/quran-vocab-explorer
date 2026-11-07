#!/usr/bin/env node
// Generates 1200x630 social share images (Open Graph / Twitter cards) for the site's key pages
// and the manifest src/utils/generated/og-manifest.ts that SEO uses to pick them up.
//
// Needs Playwright + Chromium on the machine that runs it (NOT available on the Lovable host),
// so images are generated locally and committed. See scripts/og/README.md.
//
//   node scripts/og/generate-og.mjs                 # everything
//   node scripts/og/generate-og.mjs --only=names    # one type: words|names|surah|collections|pages
//   node scripts/og/generate-og.mjs --limit=5       # first N of each type (quick preview)
//   OG_TOP_WORDS=500 node scripts/og/generate-og.mjs  # more word pages (default 300 by frequency)
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const outRoot = join(root, 'public/og');
const manifestFile = join(root, 'src/utils/generated/og-manifest.ts');
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const only = args.only ? new Set(args.only.split(',')) : null;
const limit = args.limit ? Number(args.limit) : Infinity;
const QUALITY = Number(args.quality || 76);

// ---------- optional deps: playwright (required) and sharp (optional, better compression) ----------
const tryRequire = (name) => {
  const bases = [join(root, 'package.json'), process.env.OG_DEPS && join(resolve(process.env.OG_DEPS), 'package.json')];
  try {
    bases.push(join(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(), 'noop.js'));
  } catch { /* no global npm */ }
  for (const base of bases.filter(Boolean)) {
    try {
      return createRequire(base)(name);
    } catch { /* try next */ }
  }
  return null;
};
const playwright = tryRequire('playwright');
if (!playwright) {
  console.error('[og] playwright not found. Install it (npm i -g playwright && npx playwright install chromium) or set OG_DEPS to a folder with it.');
  process.exit(1);
}
const sharp = tryRequire('sharp');
console.log(`[og] encoder: ${sharp ? 'sharp (mozjpeg)' : 'Chromium JPEG'} q${QUALITY}`);

// ---------- data: bundle scripts/og/og-data.ts with the app's esbuild and run it ----------
const work = mkdtempSync(join(tmpdir(), 'qv-og-'));
const bundle = join(work, 'og-data.mjs');
const dataFile = join(work, 'og-data.json');
execFileSync(
  join(root, 'node_modules/.bin/esbuild'),
  [join(here, 'og-data.ts'), '--bundle', '--platform=node', '--format=esm', `--alias:@=${join(root, 'src')}`, '--log-level=warning', `--outfile=${bundle}`],
  { stdio: 'inherit' },
);
execFileSync(process.execPath, [bundle, dataFile], { stdio: 'inherit', cwd: root });
const data = JSON.parse(readFileSync(dataFile, 'utf8'));
rmSync(work, { recursive: true, force: true });

// ---------- jobs ----------
const fmt = (n) => Number(n).toLocaleString('en-US');
const plainArabic = (s) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '').replace(/ٱ/g, 'ا');
const uniqueArabic = (list) => {
  const seen = new Set();
  return list.filter((a) => {
    const k = plainArabic(a);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const jobs = {
  words: data.words.map((w) => ({
    slug: w.slug,
    kind: 'Quranic word',
    arabic: w.arabic,
    title: w.transliteration,
    subtitle: w.meaning,
    stat: `Appears ${fmt(w.frequency)} ${w.frequency === 1 ? 'time' : 'times'} in the Quran`,
  })),
  names: data.names.map((n) => ({
    slug: n.slug,
    kind: '99 Names of Allah',
    badge: `${n.n} / 99`,
    arabic: n.arabic,
    title: n.transliteration,
    subtitle: n.meaning,
    stat:
      n.status === 'quran' && n.count
        ? `In the Quran ${fmt(n.count)} ${n.count === 1 ? 'time' : 'times'}`
        : n.status === 'quran-verb-only'
          ? 'Its root appears in the Quran'
          : 'From the Hadith list',
  })),
  surah: data.surahs.map((s) => ({
    slug: s.slug,
    kind: 'Surah vocabulary',
    badge: `Surah ${s.number}`,
    arabic: `سُورَةُ ${s.arabic}`,
    title: s.name,
    subtitle: s.meaning,
    stat: s.count ? `${fmt(s.count)} words · ${s.coveragePercent}% of the surah` : `${s.ayahs} ayahs`,
  })),
  collections: data.collections.map((c) => ({
    slug: c.slug,
    kind: 'Word collection',
    arabic: uniqueArabic(c.arabic).slice(0, 3).join('  ·  '),
    arabicSize: 'multi',
    title: c.name,
    subtitle: c.description,
    stat: `${fmt(c.count)} Quranic words`,
  })),
  pages: [
    {
      slug: 'home',
      kind: 'Learn Quranic Arabic',
      arabic: 'كَلِمَاتُ الْقُرْآنِ',
      title: 'Learn the words of the Quran',
      subtitle: 'Flashcards, quizzes and word pages with root, meaning and recitation.',
      stat: `${fmt(data.totalWords)} words · free`,
    },
    {
      slug: 'names-of-allah',
      kind: '99 Names of Allah',
      arabic: 'الْأَسْمَاءُ الْحُسْنَىٰ',
      title: 'The 99 Names of Allah',
      subtitle: 'Al-Asma al-Husna: meaning, root and the verses where each name appears.',
      stat: '99 names with Quranic verses',
    },
    {
      slug: 'ramadan',
      kind: 'Ramadan plan',
      arabic: 'رَمَضَانُ',
      title: `${data.ramadan.days}-day Ramadan vocabulary plan`,
      subtitle: 'Learn the words you hear in taraweeh, most frequent first.',
      stat: `${data.ramadan.perDay} words a day · ${Math.round(data.ramadan.quranPercent)}% of the Quran's words`,
    },
    {
      slug: 'review',
      kind: 'Daily review',
      arabic: 'مُرَاجَعَةٌ',
      title: 'Review Quranic vocabulary',
      subtitle: 'Hear the recitation, recall the meaning, see it in a verse.',
      stat: 'Spaced repetition · a few minutes a day',
    },
  ],
};

// ---------- template ----------
const font = (f) => `data:font/woff2;base64,${readFileSync(join(here, 'fonts', f)).toString('base64')}`;
const logo = `data:image/png;base64,${readFileSync(join(root, 'public/lovable-uploads/971aabb3-7499-4eb9-a8b4-d658db731aee.png')).toString('base64')}`;
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
const faces = [
  // Scheherazade New (SIL): a classic naskh built for fully vowelled Quranic text. The Google Fonts
  // build of Amiri used on the site does not attach harakat to their letters under HarfBuzz
  // (they float above the line), so it is not used for the images.
  `@font-face{font-family:ArabicOG;font-weight:700;src:url(${font('scheherazade-new-arabic-700-normal.woff2')}) format('woff2')}`,
  ...[400, 500, 700].flatMap((w) => [
    `@font-face{font-family:InterOG;font-weight:${w};unicode-range:${LATIN};src:url(${font(`inter-latin-${w}-normal.woff2`)}) format('woff2')}`,
    `@font-face{font-family:InterOG;font-weight:${w};unicode-range:${LATIN_EXT};src:url(${font(`inter-latin-ext-${w}-normal.woff2`)}) format('woff2')}`,
  ]),
].join('\n');

// Brand: site primary hsl(195 83% 38%) = #1089b1, background hsl(40 25% 98%), logo indigo #4147e0.
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${faces}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{font-family:InterOG,sans-serif;background:#faf8f4;color:#14181c;-webkit-font-smoothing:antialiased}
.card{position:relative;width:1200px;height:630px;display:flex}
.left{position:relative;width:540px;height:630px;padding:56px 44px 48px 60px;display:flex;flex-direction:column}
.left:before{content:"";position:absolute;inset:0;background:radial-gradient(600px 400px at 0% 0%,rgba(16,137,177,.07),transparent 70%)}
.kind{position:relative;display:flex;align-items:center;gap:12px;font-size:19px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#0d7398}
.kind i{width:10px;height:10px;background:#c9a24a;transform:rotate(45deg);display:block}
.kind .badge{margin-left:auto;letter-spacing:.04em;text-transform:none;font-weight:500;color:#6b7680;font-size:19px}
.body{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;gap:18px;padding:12px 0}
.title{font-weight:700;font-size:64px;line-height:1.08;letter-spacing:-.02em;color:#101418;max-height:150px;overflow:hidden}
.subtitle{font-size:31px;line-height:1.3;color:#46525c;max-height:165px;overflow:hidden}
.stat{display:flex;align-items:center;gap:10px;white-space:nowrap;overflow:hidden;font-size:22px;font-weight:500;color:#0d7398}
.stat:before{content:"";flex:none;width:28px;height:3px;border-radius:2px;background:#c9a24a}
.foot{position:relative;display:flex;align-items:center;justify-content:space-between}
.foot img{height:44px;width:auto}
.foot span{font-size:19px;color:#7a858e;font-weight:500}
.right{position:relative;flex:1;height:630px;background:linear-gradient(150deg,#1291bb 0%,#0c6f92 45%,#08465e 100%);overflow:hidden;display:flex;align-items:center;justify-content:center}
.right svg.pat{position:absolute;inset:0;opacity:.075}
.frame{position:absolute;inset:26px;border:1.5px solid rgba(233,205,140,.55);border-radius:22px}
.frame:after{content:"";position:absolute;inset:8px;border:1px solid rgba(233,205,140,.22);border-radius:16px}
.glow{position:absolute;width:560px;height:560px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.14),transparent)}
.ar{position:relative;font-family:ArabicOG,serif;font-weight:700;color:#fdf6e3;text-align:center;direction:rtl;line-height:1.55;width:540px;max-height:470px;padding:0 10px;text-shadow:0 2px 18px rgba(0,0,0,.18);font-feature-settings:"calt" 1,"liga" 1}
.orn{position:absolute;left:50%;transform:translateX(-50%);width:120px;height:14px;display:flex;align-items:center;justify-content:center;gap:10px}
.orn.top{top:50px}.orn.bot{bottom:50px}
.orn b{flex:1;height:1px;background:rgba(233,205,140,.6)}.orn i{width:9px;height:9px;transform:rotate(45deg);background:#e9cd8c;display:block}
</style></head><body>
<div class="card">
  <div class="left">
    <div class="kind"><i></i><span id="kind"></span><span class="badge" id="badge"></span></div>
    <div class="body">
      <div class="title" id="title"></div>
      <div class="subtitle" id="subtitle"></div>
      <div class="stat" id="stat"></div>
    </div>
    <div class="foot"><img src="${logo}" alt=""><span>quranvocab.com</span></div>
  </div>
  <div class="right">
    <svg class="pat" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="p" width="80" height="80" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#fff" stroke-width="1.4"><rect x="20" y="20" width="40" height="40"/><rect x="20" y="20" width="40" height="40" transform="rotate(45 40 40)"/><circle cx="40" cy="40" r="9"/><path d="M0 0L20 20M80 0L60 20M0 80L20 60M80 80L60 60"/></g>
    </pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>
    <div class="glow"></div>
    <div class="frame"></div>
    <div class="orn top"><b></b><i></i><b></b></div>
    <div class="ar" id="ar" lang="ar" dir="rtl"></div>
    <div class="orn bot"><b></b><i></i><b></b></div>
  </div>
</div>
<script>
// Shrink an element's font until it fits its box (width and max-height).
function fit(el, max, min, maxH) {
  let size = max;
  el.style.fontSize = size + 'px';
  while (size > min && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > maxH)) {
    size -= 2;
    el.style.fontSize = size + 'px';
  }
  return size;
}
window.renderCard = async (d) => {
  document.getElementById('kind').textContent = d.kind;
  document.getElementById('badge').textContent = d.badge || '';
  for (const k of ['title', 'subtitle', 'stat']) document.getElementById(k).textContent = d[k] || '';
  const ar = document.getElementById('ar');
  ar.textContent = d.arabic;
  await document.fonts.ready;
  const title = document.getElementById('title');
  title.style.maxHeight = 'none';
  fit(title, 64, 36, 150);
  const sub = document.getElementById('subtitle');
  sub.style.maxHeight = 'none';
  fit(sub, 31, 22, 165);
  fit(document.getElementById('stat'), 22, 16, 40);
  ar.style.maxHeight = 'none';
  const words = d.arabic.trim().split(/\\s+/).length;
  fit(ar, d.arabicSize === 'multi' ? 110 : words > 2 ? 130 : 210, 56, 460);
  return true;
};
</script></body></html>`;

// ---------- render ----------
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

const manifest = {};
let total = 0;
let count = 0;
let biggest = { size: 0, file: '' };
const saveJpeg = async (png, file) => {
  const buf = sharp
    ? await sharp(png).jpeg({ quality: QUALITY, mozjpeg: true, chromaSubsampling: '4:2:0' }).toBuffer()
    : png; // already JPEG from Chromium
  writeFileSync(file, buf);
  return buf.length;
};

for (const [type, list] of Object.entries(jobs)) {
  const dir = join(outRoot, type);
  if (only && !only.has(type)) {
    // Keep what is on disk for types we did not regenerate.
    manifest[type] = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.jpg')).map((f) => f.slice(0, -4)).sort() : [];
    continue;
  }
  mkdirSync(dir, { recursive: true });
  const wanted = new Set(list.map((j) => j.slug));
  // Remove images for pages that no longer exist (e.g. a word dropped out of the top N).
  if (limit === Infinity) for (const f of readdirSync(dir)) if (f.endsWith('.jpg') && !wanted.has(f.slice(0, -4))) rmSync(join(dir, f));
  for (const job of list.slice(0, limit)) {
    await page.evaluate((d) => window.renderCard(d), job);
    const shot = await page.screenshot(sharp ? { type: 'png' } : { type: 'jpeg', quality: QUALITY });
    const file = join(dir, `${job.slug}.jpg`);
    const size = await saveJpeg(shot, file);
    total += size;
    count++;
    if (size > biggest.size) biggest = { size, file };
    if (type === 'pages' && job.slug === 'home') {
      // The static fallback in index.html (/og-image.png) is the same card, as PNG.
      const png = sharp ? await sharp(shot).png({ palette: true, quality: 90, compressionLevel: 9 }).toBuffer() : await page.screenshot({ type: 'png' });
      writeFileSync(join(root, 'public/og-image.png'), png);
    }
  }
  manifest[type] = readdirSync(dir).filter((f) => f.endsWith('.jpg')).map((f) => f.slice(0, -4)).sort();
  console.log(`[og] ${type}: ${manifest[type].length} images`);
}
await browser.close();

// ---------- manifest ----------
const dirSize = (d) => (existsSync(d) ? readdirSync(d, { recursive: true }).reduce((s, f) => s + (statSync(join(d, f)).isFile() ? statSync(join(d, f)).size : 0), 0) : 0);
const ts = `// GENERATED by scripts/og/generate-og.mjs. Do not edit by hand; rerun the script after data changes.
/* eslint-disable */

/** Slugs with a share image at /og/<type>/<slug>.jpg (1200x630 JPEG). */
export const OG_MANIFEST = ${JSON.stringify(manifest, null, 0).replace(/\],"/g, '],\n  "').replace(/^\{/, '{\n  ').replace(/\}$/, '\n}')} as const;
`;
writeFileSync(manifestFile, ts);
const all = Object.values(manifest).reduce((s, l) => s + l.length, 0);
console.log(`[og] rendered ${count} (${(total / 1024).toFixed(0)} KB, avg ${(total / 1024 / Math.max(count, 1)).toFixed(1)} KB, max ${(biggest.size / 1024).toFixed(1)} KB ${biggest.file.replace(root + '/', '')})`);
console.log(`[og] manifest: ${all} images, public/og total ${(dirSize(outRoot) / 1024 / 1024).toFixed(2)} MB`);
