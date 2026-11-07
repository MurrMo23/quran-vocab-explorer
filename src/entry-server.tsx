/// <reference types="node" />
// Server entry used only at build time to prerender public pages (scripts/prerender.mjs).
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Helmet } from 'react-helmet';
import App from './App';
import { ProgressProvider } from '@/lib/progress';
import { getAllWords, getPublishedCollections } from '@/utils/vocabulary';
import { SURAH_PAGES, getAllRoots, rootPath, surahPath } from '@/utils/quran-pages';
import { getWordPath } from '@/utils/word-slugs';

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
  return ['/roots', ...getAllRoots().map((r) => rootPath(r.slug)), '/surahs', ...SURAH_PAGES.map(surahPath)];
}

/** Public routes worth prerendering (everything that is in the sitemap and needs no account). */
export function routes(): string[] {
  // '/' is not prerendered: dist/index.html must stay the clean SPA shell the host serves for every
  // other route (auth, dashboard, ...). Interactive pages that depend on saved progress stay client-only.
  const statics = ['/collections', '/ramadan'];
  const collections = getPublishedCollections().map((c) => `/collections/${c.id}`);
  const words = getAllWords().map((w) => getWordPath(w));
  return [...statics, ...collections, ...words, ...quranPages()];
}
