/// <reference types="node" />
// Server entry used only at build time to prerender public pages (scripts/prerender.mjs).
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Helmet } from 'react-helmet';
import App from './App';
import { ProgressProvider } from '@/lib/progress';
import { getAllWords, getPublishedCollections } from '@/utils/vocabulary';
import { SURAH_PAGES, rootPath, surahPath } from '@/utils/quran-pages';
import { FIRST_ROOT_LETTER, ROOTS_INDEX_PATH, rootLetterKey, rootLetterPath, type RootIndex } from '@/utils/root-library';
import { getWordPath } from '@/utils/word-slugs';
import { NAMES_HUB_PATH, getAllNames, namePath } from '@/utils/names-of-allah';
import { PHRASES, PHRASES_HUB_PATH, phrasePath } from '@/utils/phrases';
import { PILLAR_PATHS } from '@/utils/seo-pillars';
import { ISLAMIC_TERMS_PATH } from '@/utils/islamic-terms';
import { SALAH_WORDS_PATH } from '@/utils/salah-guide';
import { TOPICS, TOPICS_HUB_PATH, topicPath } from '@/utils/topics';
import { ramadanPages } from '@/utils/seo-ramadan';
import { JUZ_AMMA, JUZ_HUB_PATH, juzPagePaths, juzPath } from '@/utils/juz';

// Build-time data for scripts/generate-sitemap.mjs and the legacy /word/<id> redirect pages.
export { getAllWords, getPublishedCollections };
export { getWordSlug, getLegacyWordRedirects } from '@/utils/word-slugs';

export interface RenderResult {
  html: string;
  head: string;
  htmlAttributes: string;
}

export function render(url: string): Promise<RenderResult> {
  // renderToString, not renderToPipeableStream: React 18.3's streaming renderer can corrupt
  // multi-byte UTF-8 (Arabic) at its internal chunk boundaries, leaving NUL bytes in the HTML.
  // Every prerendered page is imported eagerly (no lazy boundaries), so a synchronous render
  // produces the complete page.
  try {
    const html = renderToString(
      <StaticRouter location={url}>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </StaticRouter>,
    );
    const h = Helmet.renderStatic();
    return Promise.resolve({
      html,
      head: [h.title, h.meta, h.link, h.script].map((x) => x.toString()).join(''),
      htmlAttributes: h.htmlAttributes.toString(),
    });
  } catch (err) {
    return Promise.reject(err);
  }
}

/** Root and surah vocabulary pages (prerendered and in the sitemap). */
export function quranPages(): string[] {
  // Every Quranic root, from the generated root library (public/data/roots/index.json).
  const index = globalThis.__QV_STATIC_LOADER__?.(ROOTS_INDEX_PATH) as RootIndex | undefined;
  if (!index) throw new Error('static data loader not installed (see scripts/static-loader.mjs)');
  // One hub per first letter (/roots itself lists the first one).
  const letters = [...new Set(index.roots.map((r) => rootLetterKey(r[0])))].filter((k) => k !== FIRST_ROOT_LETTER);
  return [
    '/roots',
    ...letters.map(rootLetterPath),
    ...index.roots.map((r) => rootPath(r[0])),
    '/surahs',
    ...SURAH_PAGES.map(surahPath),
  ];
}

/** The 99 Names of Allah hub and one page per name (prerendered and in the sitemap). */
export function namesPages(): string[] {
  return [NAMES_HUB_PATH, ...getAllNames().map((n) => namePath(n.slug))];
}

/** Pillar pages: the phrase hub and pages, and the one-off guides (prerendered and in the pages sitemap). */
export function pillarPages(): string[] {
  return [
    PHRASES_HUB_PATH,
    ...PHRASES.map((p) => phrasePath(p.slug)),
    PILLAR_PATHS.commonWords,
    PILLAR_PATHS.stats,
    PILLAR_PATHS.juzAmma,
    JUZ_HUB_PATH,
    ...juzPagePaths(),
    ISLAMIC_TERMS_PATH,
    ...topicPages(),
    ...ramadanPages(),
  ];
}

/**
 * Static redirect pages (prerendered as noindex pages with a canonical link and a meta refresh, like the
 * legacy /word/<id> pages). /juz/30 is Juz Amma, whose page is /juz-amma-vocabulary.
 */
export function staticRedirects(): { from: string; to: string }[] {
  return [{ from: `${JUZ_HUB_PATH}/${JUZ_AMMA}`, to: juzPath(JUZ_AMMA) }];
}

/** /salah-words, the /topics hub and the topic pages (prerendered and in the pages sitemap). */
export function topicPages(): string[] {
  return [SALAH_WORDS_PATH, TOPICS_HUB_PATH, ...TOPICS.map((t) => topicPath(t.slug))];
}

/** Public routes worth prerendering (everything that is in the sitemap and needs no account). */
export function routes(): string[] {
  // '/' is prerendered into dist/index.html, which the host also serves for client-only routes
  // (auth, dashboard, ...). scripts/prerender.mjs adds a guard that swaps the home markup back to the
  // boot shell on any other path before first paint, so those routes never show or hydrate it.
  const statics = ['/', '/collections', '/ramadan'];
  const collections = getPublishedCollections().map((c) => `/collections/${c.id}`);
  const words = getAllWords().map((w) => getWordPath(w));
  return [...statics, ...collections, ...words, ...quranPages(), ...namesPages(), ...pillarPages()];
}
