// English translation (Saheeh International) of the short surahs, in public/data/surah-en/<n>.json,
// written by scripts/vocab/gen-surah-en.py. Keep SURAH_EN_MAX_AYAHS in step with MAX_AYAHS there.
import { isJuzAmma } from './quran-pages';

export interface SurahEnglish {
  n: number;
  source: string;
  /** Ayah i + 1 at index i. */
  ayahs: string[];
}

const SURAH_EN_MAX_AYAHS = 40;
/** Longer surahs with high "in English" search demand; keep in step with HIGH_DEMAND in the generator. */
const SURAH_EN_HIGH_DEMAND = new Set([18, 36, 55, 56]);

/** Surahs with a translation file: up to 40 ayahs, all of Juz Amma, and a few high-demand longer surahs. */
export const hasSurahEnglish = (n: number, ayahs: number) =>
  ayahs <= SURAH_EN_MAX_AYAHS || isJuzAmma(n) || SURAH_EN_HIGH_DEMAND.has(n);

export const surahEnglishPath = (n: number) => `/data/surah-en/${n}.json`;
