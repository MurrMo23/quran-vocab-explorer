// Lookups for the /surah and /root pages and the word page, over data generated from the
// Quranic Arabic Corpus by scripts/vocab/gen-pages.py.
import { LEMMAS, ROOTS, SURAH_NAMES, SURAH_PAGES, SURAH_STATS, WORD_LEMMA, WORD_ROOT } from './generated/quran-index';
import { getWordById, type Word } from './vocabulary';
import { getWordPath } from './word-slugs';
import { surahWordCounts } from './word-lists';

export { SURAH_PAGES };

/** Link to a word page (/word/<slug>). */
export const wordPath = (id: string) => getWordPath(id);
export const surahPath = (n: number) => `/surah/${n}`;
export const rootPath = (slug: string) => `/root/${slug}`;

export interface SurahName {
  number: number;
  arabic: string;
  name: string;
  meaning: string;
}

export const getSurahName = (n: number): SurahName | undefined => {
  const row = SURAH_NAMES[n - 1];
  return row && Number.isInteger(n) ? { number: n, arabic: row[0], name: row[1], meaning: row[2] } : undefined;
};

/**
 * Where each of the 30 juz (ajza') begins, as [surah, ayah], in the standard division of the
 * Madani mushaf (juz n at index n - 1).
 */
const JUZ_STARTS: readonly (readonly [number, number])[] = [
  [1, 1], [2, 142], [2, 253], [3, 93], [4, 24], [4, 148], [5, 82], [6, 111], [7, 88], [8, 41],
  [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75], [21, 1], [23, 1], [25, 21], [27, 56],
  [29, 46], [33, 31], [36, 28], [39, 32], [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1],
];

/** The juz containing ayah `ayah` of surah `surah` (1-30). */
export const juzOf = (surah: number, ayah: number): number => {
  let j = 1;
  for (let i = 0; i < JUZ_STARTS.length; i++) {
    const [s, a] = JUZ_STARTS[i];
    if (s < surah || (s === surah && a <= ayah)) j = i + 1;
  }
  return j;
};

/** Juz Amma (the 30th juz): surahs 78-114. */
export const isJuzAmma = (n: number) => n >= 78 && n <= 114;

export interface SurahSummary extends SurahName {
  ayahs: number;
  /** Words (corpus tokens) in the surah. */
  totalWords: number;
  /** Tokens whose lemma is one of the surah's site words. */
  coveredWords: number;
  /** Rounded to one decimal. */
  coveragePercent: number;
  /** Site words (one per lemma) that occur in the surah. */
  wordCount: number;
  /** Juz of the first and last ayah (equal unless the surah spans several juz). */
  juzStart: number;
  juzEnd: number;
}

export const getSurahSummary = (n: number): SurahSummary | undefined => {
  const name = getSurahName(n);
  const stats = SURAH_STATS[n - 1];
  if (!name || !stats) return undefined;
  const [ayahs, total, covered] = stats;
  return {
    ...name,
    ayahs,
    totalWords: total,
    coveredWords: covered,
    coveragePercent: Math.round((1000 * covered) / total) / 10,
    wordCount: surahWordCounts(n).length,
    juzStart: juzOf(n, 1),
    juzEnd: juzOf(n, ayahs),
  };
};

/** All surahs with a vocabulary page, in mushaf order. */
export const getSurahSummaries = (): SurahSummary[] =>
  SURAH_PAGES.map((n) => getSurahSummary(n)).filter((s): s is SurahSummary => !!s);

export interface SurahWord {
  word: Word;
  /** Occurrences of the word's lemma in this surah. */
  count: number;
}

export interface SurahVocabulary extends SurahSummary {
  /** Most frequent in the surah first. */
  words: SurahWord[];
  prev?: SurahName;
  next?: SurahName;
}

export const hasSurahPage = (n: number) => SURAH_PAGES.includes(n);

export const getSurahVocabulary = (n: number): SurahVocabulary | undefined => {
  const summary = hasSurahPage(n) ? getSurahSummary(n) : undefined;
  if (!summary) return undefined;
  const words = surahWordCounts(n)
    .map(({ id, count }) => ({ word: getWordById(id), count }))
    .filter((w): w is SurahWord => !!w.word);
  const idx = SURAH_PAGES.indexOf(n);
  return {
    ...summary,
    words,
    prev: idx > 0 ? getSurahName(SURAH_PAGES[idx - 1]) : undefined,
    next: idx < SURAH_PAGES.length - 1 ? getSurahName(SURAH_PAGES[idx + 1]) : undefined,
  };
};

export interface RootFamily {
  slug: string;
  /** Root letters in Arabic, space separated (e.g. "ك ت ب"). */
  arabic: string;
  /** Words in the Quran derived from this root (corpus tokens). */
  total: number;
  words: Word[];
}

const toFamily = (r: (typeof ROOTS)[number]): RootFamily => ({
  slug: r.slug,
  arabic: r.ar,
  total: r.total,
  words: r.words.map((id) => getWordById(id)).filter((w): w is Word => !!w),
});

/** All roots with at least one site word, in Arabic alphabetical order. */
export const getAllRoots = (): RootFamily[] => ROOTS.map(toFamily);

export const getRootBySlug = (slug: string): RootFamily | undefined => {
  const r = ROOTS.find((x) => x.slug === slug.toLowerCase());
  return r ? toFamily(r) : undefined;
};

/** Root page slug for a word, when its root is known from the corpus. */
export const getWordRootSlug = (id: string): string | undefined => WORD_ROOT[id];

/** Occurrences of a word's lemma in the Quran and per surah (verbatim words only). */
export const getWordOccurrences = (id: string): { total: number; bySurah: Map<number, number> } | undefined => {
  const i = WORD_LEMMA[id];
  if (i === undefined) return undefined;
  const [total, flat] = LEMMAS[i];
  const bySurah = new Map<number, number>();
  for (let k = 0; k < flat.length; k += 2) bySurah.set(flat[k], flat[k + 1]);
  return { total, bySurah };
};

/** Surahs with a vocabulary page in which the word occurs (and its count there), in mushaf order. */
export const getWordSurahPages = (id: string): { surah: SurahName; count: number }[] => {
  const occ = getWordOccurrences(id);
  if (!occ) return [];
  return SURAH_PAGES.filter((n) => occ.bySurah.has(n)).map((n) => ({
    surah: getSurahName(n) as SurahName,
    count: occ.bySurah.get(n) as number,
  }));
};
