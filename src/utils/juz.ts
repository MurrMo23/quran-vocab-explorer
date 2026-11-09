// The /juz hub and /juz/<n> pages. Summary rows (src/utils/generated/juz.ts) are in the bundle; each
// juz's word list and first/last ayah are in public/data/juz/<n>.json (src/lib/static-data.tsx).
// Both are written by scripts/vocab/gen-juz.py. Juz 30 is Juz Amma: its page is /juz-amma-vocabulary
// and /juz/30 only redirects there (one page per juz, no duplicate content).
import { JUZ, type JuzRow } from './generated/juz';
import { PILLAR_PATHS } from './seo-pillars';
import { getSurahName } from './quran-pages';
import { SURAH_STATS } from './generated/quran-index';

export { JUZ, type JuzRow };

export const JUZ_HUB_PATH = '/juz';
export const JUZ_COUNT = 30;
/** The juz whose page is /juz-amma-vocabulary. */
export const JUZ_AMMA = 30;
/** Site words listed per juz (the data file holds this many). */
export const JUZ_TOP = 60;

/** Link to a juz page (Juz 30 -> /juz-amma-vocabulary). */
export const juzPath = (n: number) => (n === JUZ_AMMA ? PILLAR_PATHS.juzAmma : `${JUZ_HUB_PATH}/${n}`);
/** /juz/<n> URLs that are prerendered as pages (all but Juz Amma). */
export const juzPagePaths = () => JUZ.filter((j) => j.n !== JUZ_AMMA).map((j) => `${JUZ_HUB_PATH}/${j.n}`);
export const juzDataPath = (n: number) => `/data/juz/${n}.json`;

export const getJuz = (n: number): JuzRow | undefined => (Number.isInteger(n) ? JUZ[n - 1] : undefined);

/** Tokens covered by the juz's top `n` site words (`n` must be one of the generated points). */
export const juzCoverage = (j: JuzRow, n: number): number => j.cov.find(([k]) => k === n)?.[1] ?? 0;

export interface JuzAyah {
  s: number;
  a: number;
  ar: string;
  en: string;
}

export interface JuzDetail {
  n: number;
  /** [word id, occurrences in the juz], most frequent first. */
  top: [string, number][];
  /** Frequent corpus lemmas with no QuranVocab word: most common written form, dictionary form, gloss, count. */
  other: { ar: string; lemma: string; gl: string; n: number }[];
  first: JuzAyah;
  last: JuzAyah;
}

const surahName = (s: number) => getSurahName(s)?.name ?? `Surah ${s}`;

/** "Al-Baqarah 2:142–252", or "Ali 'Imran 3:93 – An-Nisa 4:23" across surahs. */
export const juzRangeLabel = (j: JuzRow): string => {
  const [s1, a1] = j.start;
  const [s2, a2] = j.end;
  return s1 === s2 ? `${surahName(s1)} ${s1}:${a1}–${a2}` : `${surahName(s1)} ${s1}:${a1} – ${surahName(s2)} ${s2}:${a2}`;
};

/** Short range for descriptions: "Al-Baqarah 142 to Al-Baqarah 252". */
export const juzRangeText = (j: JuzRow): string => {
  const [s1, a1] = j.start;
  const [s2, a2] = j.end;
  return `${surahName(s1)} ${s1}:${a1} to ${surahName(s2)} ${s2}:${a2}`;
};

export interface JuzPart {
  surah: number;
  name: string;
  arabic: string;
  from: number;
  to: number;
  /** The whole surah is in this juz. */
  whole: boolean;
  ayahs: number;
}

/** The surahs (or parts of surahs) in a juz, in order. */
export const juzParts = (j: JuzRow): JuzPart[] =>
  j.parts.map(([surah, from, to]) => {
    const name = getSurahName(surah);
    const total = SURAH_STATS[surah - 1][0];
    return { surah, name: name?.name ?? `Surah ${surah}`, arabic: name?.arabic ?? '', from, to, whole: from === 1 && to === total, ayahs: total };
  });
