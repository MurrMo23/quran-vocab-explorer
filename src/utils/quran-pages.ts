// Lookups for the /surah and /root pages and the word page, over data generated from the
// Quranic Arabic Corpus by scripts/vocab/gen-pages.py.
import { LEMMAS, ROOTS, SURAHS, SURAH_NAMES, SURAH_PAGES, WORD_LEMMA, WORD_ROOT } from './generated/quran-index';
import { getWordById, type Word } from './vocabulary';

export { SURAH_PAGES };

/** Link to a word page. */
export const wordPath = (id: string) => `/word/${encodeURIComponent(id)}`;
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

export interface SurahWord {
  word: Word;
  /** Occurrences of the word's lemma in this surah. */
  count: number;
}

export interface SurahVocabulary extends SurahName {
  ayahs: number;
  /** Words (corpus tokens) in the surah. */
  totalWords: number;
  /** Tokens whose lemma is one of `words`. */
  coveredWords: number;
  /** Rounded to one decimal. */
  coveragePercent: number;
  words: SurahWord[];
  prev?: SurahName;
  next?: SurahName;
}

export const hasSurahPage = (n: number) => SURAH_PAGES.includes(n);

export const getSurahVocabulary = (n: number): SurahVocabulary | undefined => {
  const data = SURAHS[n];
  const name = getSurahName(n);
  if (!data || !name) return undefined;
  const words = data.words
    .map((id, i) => ({ word: getWordById(id), count: data.counts[i] }))
    .filter((w): w is SurahWord => !!w.word);
  const idx = SURAH_PAGES.indexOf(n);
  return {
    ...name,
    ayahs: data.ayahs,
    totalWords: data.total,
    coveredWords: data.covered,
    coveragePercent: Math.round((1000 * data.covered) / data.total) / 10,
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

/** Surahs with a vocabulary page in which the word occurs, in mushaf order. */
export const getWordSurahPages = (id: string): { surah: SurahName; count: number }[] => {
  const occ = getWordOccurrences(id);
  if (!occ) return [];
  return SURAH_PAGES.filter((n) => occ.bySurah.has(n)).map((n) => ({
    surah: getSurahName(n) as SurahName,
    count: occ.bySurah.get(n) as number,
  }));
};
