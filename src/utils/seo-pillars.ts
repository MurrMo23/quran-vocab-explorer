// Titles and meta descriptions for the pillar pages: /phrases, /phrases/<slug>,
// /most-common-words-in-the-quran, /quran-statistics and /juz-amma-vocabulary.
// Kept apart from seo-templates.ts (which owns the word, root, surah, collection and name templates);
// the same limits apply: titles within TITLE_MAX (SEO adds " | QuranVocab" only when it fits) and
// descriptions within DESC_MAX. Check after a build with: npm run seo:check
import { SITE_URL, TITLE_MAX, fitSentences } from './seo-templates';
import type { PageSeo } from './seo-templates';
import type { Phrase } from './phrases';

/** Paths of the one-off pillar pages (the phrase pages use PHRASES_HUB_PATH / phrasePath). */
export const PILLAR_PATHS = {
  commonWords: '/most-common-words-in-the-quran',
  stats: '/quran-statistics',
  juzAmma: '/juz-amma-vocabulary',
} as const;

const len = (s: string) => [...s].length;
/** The first candidate that fits in TITLE_MAX (the last one is used regardless). */
const firstFitting = (...titles: string[]) => titles.find((t) => len(t) <= TITLE_MAX) ?? titles[titles.length - 1];
/** Arabic without vowel marks (shorter in titles, and how people type it). */
const plainArabic = (s: string) => s.replace(/[\u064B-\u065F\u0670]/g, '');
const SMALL_WORDS = /^(a|an|and|as|at|but|by|for|from|in|is|of|on|or|the|to|upon|with)$/;
/** "in the name of Allah" -> "In the Name of Allah". */
const titleCase = (s: string) =>
  s
    .split(' ')
    .map((w, i) => (i > 0 && SMALL_WORDS.test(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
const pct = (part: number, whole: number) => `${((100 * part) / whole).toFixed(1)}%`;

export const PHRASES_HUB_SEO = {
  title: 'Islamic Phrases: Meanings in Arabic & the Quran',
  /** `names`: the first few phrase names, in page order. */
  description: (count: number, names: string[]) =>
    fitSentences(
      `${names.slice(0, 5).join(', ')} and more: what ${count} everyday Islamic phrases mean, word by word, with the Arabic and the Quran verses behind them.`,
    ),
};

/** "Inshallah Meaning: If Allah Wills (إن شاء الله)"; the H1 is "<name> Meaning". */
export const phraseSeo = (p: Phrase): PageSeo => {
  const short = p.meaning.replace(/\s*\([^)]*\)/g, '');
  const titled = titleCase(p.titleMeaning ?? short);
  const ar = plainArabic(p.ar);
  const inQuran =
    p.quran.status === 'exact'
      ? 'and where it is in the Quran.'
      : p.quran.status === 'related'
        ? 'and the Quran verses it comes from.'
        : 'and whether it is in the Quran.';
  return {
    title: firstFitting(`${p.name} Meaning: ${titled} (${ar})`, `${p.name} Meaning: ${titled}`, `${p.name} Meaning in Arabic`),
    description: fitSentences(
      `${p.name} (${ar}) means “${short}”. The Arabic, transliteration, a word-by-word breakdown, when Muslims say it ${inQuran}`,
      'Free, with audio.',
    ),
  };
};

export const commonWordsSeo = (top: number, covered: number, total: number): PageSeo => ({
  title: `Most Common Words in the Quran: Top ${top} Quranic Words`,
  description: fitSentences(
    `The ${top} most frequent words in the Quran, with meanings and how often each occurs. Together they make up ${pct(covered, total)} of the Quran’s text.`,
    'Learn them with free flashcards.',
  ),
});

export const quranStatsSeo = (s: { surahs: number; ayahs: number; words: number; juz: number; pages: number }): PageSeo => ({
  title: 'Quran Statistics: Surahs, Ayahs, Words & Juz in Numbers',
  description: fitSentences(
    `How many surahs (${s.surahs}), ayahs (${s.ayahs.toLocaleString('en-US')}), words (${s.words.toLocaleString('en-US')}), juz (${s.juz}) and pages (${s.pages}) the Quran has, its longest and shortest surahs, and how often names occur.`,
  ),
});

export const juzAmmaSeo = (top: number, covered: number, total: number): PageSeo => ({
  title: 'Juz Amma Vocabulary: Words of Surahs 78–114 (Juz 30)',
  description: fitSentences(
    `The words of Juz Amma (Juz 30, surahs An-Naba to An-Nas) ranked by frequency, with meanings. The top ${top} make up ${pct(covered, total)} of its text.`,
    'Review them with free flashcards.',
  ),
});

/** /islamic-terms: the A–Z glossary of Islamic terms (src/utils/islamic-terms.ts). `names`: a few term names. */
export const islamicTermsSeo = (count: number, names: string[]): PageSeo => ({
  title: 'Islamic Terms & Arabic Words: Meanings A–Z',
  description: fitSentences(
    `What ${names.join(', ')} and ${count - names.length} more Islamic terms mean: an A–Z glossary with the Arabic and the Quran verses behind each word.`,
  ),
});

/** schema.org FAQPage for a page's visible Q&A section (the answers must be shown on the page). */
export const faqLd = (path: string, items: { q: string; a: string }[]) => ({
  '@type': 'FAQPage',
  '@id': `${SITE_URL}${path}#faq`,
  mainEntity: items.map((it) => ({
    '@type': 'Question',
    name: it.q,
    acceptedAnswer: { '@type': 'Answer', text: it.a },
  })),
});
