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
    art: 'word',
    slug: w.slug,
    kind: 'Quranic word',
    arabic: w.arabic,
    title: w.transliteration,
    subtitle: w.meaning,
    stat: `Appears ${fmt(w.frequency)} ${w.frequency === 1 ? 'time' : 'times'} in the Quran`,
  })),
  names: data.names.map((n) => ({
    art: 'names',
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
    art: 'surah',
    slug: s.slug,
    kind: 'Surah vocabulary',
    badge: `Surah ${s.number}`,
    arabic: `سُورَةُ ${s.arabic}`,
    title: s.name,
    subtitle: s.meaning,
    stat: s.count ? `${fmt(s.count)} words · ${s.coveragePercent}% of the surah` : `${s.ayahs} ayahs`,
  })),
  collections: data.collections.map((c) => ({
    art: 'collections',
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
      layout: 'illus',
      art: 'home',
      kind: 'Learn Quranic Arabic',
      arabic: 'كَلِمَاتُ الْقُرْآنِ',
      title: 'Learn the words of the Quran',
      subtitle: 'Flashcards, quizzes and word pages with root, meaning and recitation.',
      stat: `${fmt(data.totalWords)} words · free`,
    },
    {
      slug: 'names-of-allah',
      layout: 'illus',
      art: 'names',
      theme: 'dark',
      kind: '99 Names of Allah',
      arabic: 'الْأَسْمَاءُ الْحُسْنَىٰ',
      title: 'The 99 Names of Allah',
      subtitle: 'Al-Asma al-Husna: meaning, root and the verses where each name appears.',
      stat: '99 names with Quranic verses',
    },
    {
      slug: 'ramadan',
      layout: 'illus',
      art: 'ramadan',
      theme: 'dark',
      kind: 'Ramadan plan',
      arabic: 'رَمَضَانُ',
      title: `${data.ramadan.days}-day Ramadan vocabulary plan`,
      subtitle: 'Learn the words you hear in taraweeh, most frequent first.',
      stat: `${data.ramadan.perDay} words a day · ${Math.round(data.ramadan.quranPercent)}% of the Quran's words`,
    },
    {
      slug: 'review',
      layout: 'illus',
      art: 'review',
      kind: 'Daily review',
      arabic: 'مُرَاجَعَةٌ',
      title: 'Review Quranic vocabulary',
      subtitle: 'Hear the recitation, recall the meaning, see it in a verse.',
      stat: 'Spaced repetition · a few minutes a day',
    },
    {
      slug: 'collections',
      layout: 'illus',
      art: 'collections',
      kind: 'Word collections',
      title: 'Quranic words by theme',
      subtitle: 'Nature, faith, family, the afterlife and more, each with recitation audio.',
      stat: `${fmt(data.collections.length)} collections · ${fmt(data.totalWords)} words`,
    },
    {
      slug: 'surahs',
      layout: 'illus',
      art: 'surah',
      kind: 'Surah vocabulary',
      title: 'The words of every surah',
      subtitle: 'A word list for all 114 surahs, most frequent words first.',
      stat: '114 surahs · free',
    },
    {
      slug: 'roots',
      layout: 'illus',
      art: 'roots',
      kind: 'Arabic roots',
      title: 'Learn words by their roots',
      subtitle: 'See how one three-letter root grows into a family of Quranic words.',
      stat: 'Root families with Quranic examples',
    },
  ],
};

// ---------- template ----------
const font = (f) => `data:font/woff2;base64,${readFileSync(join(here, 'fonts', f)).toString('base64')}`;
const siteFont = (f) => `data:font/woff2;base64,${readFileSync(join(root, 'src/assets/fonts', f)).toString('base64')}`;
// The new brand logo (book mark + wordmark), inline SVG with the dark-ink wordmark for the sand background.
const logo = `data:image/svg+xml;base64,${readFileSync(join(root, 'public/brand/quranvocab-logo.svg')).toString('base64')}`;
const logoDark = `data:image/svg+xml;base64,${readFileSync(join(root, 'public/brand/quranvocab-logo-dark.svg')).toString('base64')}`;
// Brand illustrations (made with Higgsfield, palette-matched), one per page type: scripts/og/art/<name>.jpg
const art = Object.fromEntries(
  readdirSync(join(here, 'art'))
    .filter((f) => f.endsWith('.jpg'))
    .map((f) => [f.slice(0, -4), `data:image/jpeg;base64,${readFileSync(join(here, 'art', f)).toString('base64')}`]),
);
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
const faces = [
  // Headword: Amiri Quran, the face the site uses for large Arabic (self-hosted subset in src/assets/fonts).
  // Scheherazade New stays as a fallback for any character outside that subset.
  `@font-face{font-family:QuranOG;font-weight:400;src:url(${siteFont('amiri-quran-arabic-400-normal.woff2')}) format('woff2')}`,
  `@font-face{font-family:ArabicOG;font-weight:700;src:url(${font('scheherazade-new-arabic-700-normal.woff2')}) format('woff2')}`,
  // Latin: Plus Jakarta Sans (variable weight), the site's UI face.
  `@font-face{font-family:JakartaOG;font-weight:200 800;unicode-range:${LATIN};src:url(${siteFont('plus-jakarta-sans-latin-wght-normal.woff2')}) format('woff2')}`,
  `@font-face{font-family:JakartaOG;font-weight:200 800;unicode-range:${LATIN_EXT};src:url(${siteFont('plus-jakarta-sans-latin-ext-wght-normal.woff2')}) format('woff2')}`,
].join('\n');

// Brand "Oasis": sand #FBF8F1, ink #10231F, teal #0F6B5C (shade #0A4D42), gold #E3B455, mint #E3F0EC.
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${faces}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{font-family:JakartaOG,sans-serif;background:#FBF8F1;color:#10231F;-webkit-font-smoothing:antialiased}
.card{position:relative;width:1200px;height:630px;display:flex;gap:8px;padding:44px}
.left{position:relative;width:560px;padding:8px 24px 4px 16px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;justify-content:space-between;gap:16px}
.top img{height:50px;width:auto;display:block}
.chips{display:flex;align-items:center;gap:10px;margin-top:40px}
.chip{display:inline-flex;align-items:center;height:42px;padding:0 18px;border-radius:999px;font-size:19px;font-weight:800;white-space:nowrap}
.kind{background:#E3F0EC;color:#0F5C4F}
.badge{background:#FFFFFF;border:2px solid #E4DCCB;color:#34453F}
.badge:empty{display:none}
.body{flex:1;display:flex;flex-direction:column;justify-content:center;gap:16px;padding:8px 0 12px}
.title{font-weight:800;font-size:64px;line-height:1.06;letter-spacing:-.025em;color:#10231F;max-height:150px;overflow:hidden;text-wrap:balance}
.subtitle{font-size:29px;line-height:1.35;font-weight:500;color:#51615C;max-height:160px;overflow:hidden;text-wrap:pretty}
.foot{display:flex;align-items:center;justify-content:space-between;gap:16px}
.stat{display:inline-flex;align-items:center;height:48px;padding:0 20px;border-radius:16px;background:#F6EBD3;border-bottom:4px solid #E3B455;color:#7A560F;font-size:21px;font-weight:800;white-space:nowrap;overflow:hidden;max-width:100%}
.url{font-size:19px;font-weight:700;color:#51615C}
.right{position:relative;flex:1;height:542px;border-radius:44px;background:#0F6B5C;border-bottom:12px solid #0A4D42;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:84px 0 62px}
.right svg.pat{position:absolute;inset:0;opacity:.07}
.arcs{position:absolute;top:34px;left:50%;transform:translateX(-50%)}
/* Amiri Quran colours its marks (COLR palette: red/green/orange/blue); draw them in the text colour. */
@font-palette-values --sand{font-family:QuranOG;override-colors:0 #FBF8F1,1 #FBF8F1,2 #FBF8F1,3 #FBF8F1}
.ar{position:relative;font-family:QuranOG,ArabicOG,serif;font-palette:--sand;font-weight:400;color:#FBF8F1;text-align:center;direction:rtl;line-height:1.75;width:520px;max-height:400px;padding:0 18px}
/* Item cards: the type's illustration, tinted teal, under the Arabic. */
.right .tint{position:absolute;inset:0;background-size:cover;background-position:70% 50%;opacity:.1;filter:blur(2px);mix-blend-mode:luminosity}
/* Hub pages: full-bleed illustration with the text on the empty left side. */
.illus{display:none;position:relative;width:1200px;height:630px;overflow:hidden}
.illus .art{position:absolute;right:0;bottom:0;height:92%;width:auto;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 24%),linear-gradient(180deg,transparent 0,#000 16%);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent 0,#000 24%),linear-gradient(180deg,transparent 0,#000 16%);mask-composite:intersect}
body.is-illus .card{display:none}
body.is-illus .illus{display:block}
.illus .txt{position:absolute;left:0;top:0;bottom:0;width:600px;padding:52px 0 52px 60px;display:flex;flex-direction:column}
.illus .txt img{height:52px;width:auto;align-self:flex-start}
.illus .ititle{font-weight:800;font-size:68px;line-height:1.04;letter-spacing:-.03em;color:#10231F;text-wrap:balance}
.illus .isub{max-width:500px;font-size:28px;line-height:1.38;font-weight:500;color:#51615C;text-wrap:pretty}
.illus.dark .ititle{color:#FBF8F1}
.illus.dark .isub{color:#C9D6D1}
.illus.dark .kind{background:#1F3832;color:#8FE0CC}
.illus.dark .stat{background:#1F3832;border-bottom-color:#E3B455;color:#E3B455}
.dots{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);display:flex;gap:10px}
.dots i{width:10px;height:10px;border-radius:50%;background:#E3B455;display:block;opacity:.9}
.dots i:nth-child(2){opacity:.55}.dots i:nth-child(3){opacity:.3}
</style></head><body>
<div class="card">
  <div class="left">
    <div class="top"><img src="${logo}" alt=""><span class="url">quranvocab.com</span></div>
    <div class="chips"><span class="chip kind" id="kind"></span><span class="chip badge" id="badge"></span></div>
    <div class="body">
      <div class="title" id="title"></div>
      <div class="subtitle" id="subtitle"></div>
    </div>
    <div class="foot"><span class="stat" id="stat"></span></div>
  </div>
  <div class="right">
    <div class="tint" id="tint"></div>
    <svg class="pat" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="p" width="84" height="84" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#FBF8F1" stroke-width="1.5"><rect x="22" y="22" width="40" height="40"/><rect x="22" y="22" width="40" height="40" transform="rotate(45 42 42)"/></g>
    </pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>
    <svg class="arcs" width="96" height="40" viewBox="40 26 40 18" aria-hidden="true"><path d="M49.4 40.4a15 15 0 0 1 21.2 0" stroke="#E3B455" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M41.6 32.6a26 26 0 0 1 36.8 0" stroke="#E3B455" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>
    <div class="ar" id="ar" lang="ar" dir="rtl"></div>
    <div class="dots"><i></i><i></i><i></i></div>
  </div>
</div>
<div class="illus" id="illus">
  <img class="art" id="iart" alt="">
  <div class="txt">
    <img id="ilogo" src="${logo}" alt="">
    <div class="chips"><span class="chip kind" id="ikind"></span></div>
    <div class="body"><div class="ititle" id="ititle"></div><div class="isub" id="isub"></div></div>
    <div class="foot"><span class="stat" id="istat"></span></div>
  </div>
</div>
<script>
const LOGO = ${JSON.stringify(logo)}, LOGO_DARK = ${JSON.stringify(logoDark)};
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
  if (d.artUrl) await new Promise((r) => { const i = new Image(); i.onload = r; i.onerror = r; i.src = d.artUrl; });
  if (d.layout === 'illus') {
    document.body.classList.add('is-illus');
    const box = document.getElementById('illus');
    box.className = 'illus' + (d.theme === 'dark' ? ' dark' : '');
    document.getElementById('iart').src = d.artUrl;
    document.getElementById('ilogo').src = d.theme === 'dark' ? LOGO_DARK : LOGO;
    // Fill the space the illustration doesn't cover with its own top-left colour, so there is no seam.
    const img = new Image(); img.src = d.artUrl; await img.decode();
    const c = document.createElement('canvas'); c.width = 4; c.height = 4;
    const cx = c.getContext('2d'); cx.drawImage(img, 0, 0, 40, 40, 0, 0, 4, 4);
    const [r, g, b] = cx.getImageData(0, 0, 1, 1).data;
    const fill = 'rgb(' + r + ',' + g + ',' + b + ')';
    box.style.backgroundColor = fill;
    document.getElementById('ikind').textContent = d.kind;
    for (const [id, k] of [['ititle', 'title'], ['isub', 'subtitle'], ['istat', 'stat']]) document.getElementById(id).textContent = d[k] || '';
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    fit(document.getElementById('ititle'), 68, 40, 220);
    fit(document.getElementById('isub'), 28, 20, 160);
    fit(document.getElementById('istat'), 21, 14, 48);
    return true;
  }
  document.body.classList.remove('is-illus');
  document.getElementById('tint').style.backgroundImage = d.artUrl ? 'url(' + d.artUrl + ')' : 'none';
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
  fit(sub, 29, 21, 160);
  fit(document.getElementById('stat'), 21, 15, 48);
  ar.style.maxHeight = 'none';
  const words = d.arabic.trim().split(/\\s+/).length;
  fit(ar, d.arabicSize === 'multi' ? 92 : words > 2 ? 110 : 170, 44, 370);
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
    await page.evaluate((d) => window.renderCard(d), { ...job, artUrl: job.art ? art[job.art] : '' });
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
