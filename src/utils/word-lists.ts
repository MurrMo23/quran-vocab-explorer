// Ordered word lists derived from the generated corpus data (quran-index.ts, salah-words.ts).
// Used by the learning goals (src/lib/learning-goals.ts) and the Ramadan plan (src/lib/ramadan-plan.ts).
// Everything here is deterministic: the same data always gives the same lists.
import { LEMMAS, SURAHS, SURAH_PAGES, WORD_LEMMA } from './generated/quran-index';
import { SALAH_SURAH_WORDS } from './generated/salah-words';
import { getAllWords, getWordById } from './vocabulary';
import type { Word } from './vocabulary-types';

/** Word tokens in the Quran (Quranic Arabic Corpus v0.4). */
export const QURAN_WORD_TOKENS = 77429;

/** Juz Amma: surahs 78-114. */
export const JUZ_AMMA_SURAHS: readonly number[] = SURAH_PAGES.filter((n) => n >= 78 && n <= 114);

/** Occurrences of a word's lemma in the Quran (verbatim words only), else 0. */
export const quranCount = (id: string): number => {
  const i = WORD_LEMMA[id];
  return i === undefined ? 0 : LEMMAS[i][0];
};

let canonicalCache: Word[] | null = null;
/**
 * Words found verbatim in the Quran, one per corpus lemma (the site has a few duplicate entries; the
 * canonical one is chosen as in scripts/vocab/gen-pages.py), most frequent first.
 */
export function canonicalQuranWords(): Word[] {
  if (canonicalCache) return canonicalCache;
  const byLemma = new Map<number, { w: Word; rank: [boolean, boolean] }>();
  for (const w of getAllWords()) {
    const i = WORD_LEMMA[w.id];
    if (i === undefined) continue;
    const rank: [boolean, boolean] = [LEMMAS[i][0] !== w.frequency, /^\d+$/.test(w.id)];
    const prev = byLemma.get(i);
    const better = !prev || rank[0] < prev.rank[0] || (rank[0] === prev.rank[0] && rank[1] < prev.rank[1]);
    if (better) byLemma.set(i, { w, rank });
  }
  canonicalCache = [...byLemma.entries()]
    .sort((a, b) => LEMMAS[b[0]][0] - LEMMAS[a[0]][0] || (a[1].w.id < b[1].w.id ? -1 : 1))
    .map(([, v]) => v.w);
  return canonicalCache;
}

/** The `n` most frequent Quranic words on the site (verbatim only, one per lemma). */
export const topQuranWordIds = (n: number): string[] => canonicalQuranWords().slice(0, n).map((w) => w.id);

let juzCache: { counts: Map<string, number>; tokens: number } | null = null;
/** Occurrences of each site word across Juz Amma, and the number of word tokens in Juz Amma. */
export function juzAmmaCounts(): { counts: ReadonlyMap<string, number>; tokens: number } {
  if (juzCache) return juzCache;
  const counts = new Map<string, number>();
  let tokens = 0;
  for (const s of JUZ_AMMA_SURAHS) {
    const d = SURAHS[s];
    if (!d) continue;
    tokens += d.total;
    d.words.forEach((id, k) => counts.set(id, (counts.get(id) ?? 0) + d.counts[k]));
  }
  juzCache = { counts, tokens };
  return juzCache;
}

/** Words of Juz Amma, most frequent there first (ties: more frequent in the whole Quran first). */
export function juzAmmaWordIds(): string[] {
  const { counts } = juzAmmaCounts();
  return [...counts.entries()]
    .filter(([id]) => !!getWordById(id))
    .sort((a, b) => b[1] - a[1] || quranCount(b[0]) - quranCount(a[0]) || (a[0] < b[0] ? -1 : 1))
    .map(([id]) => id);
}

/** Site words of a surah in reading order (Al-Fatiha and Al-Ikhlas, from salah-words.ts). */
export const salahSurahWordIds = (surah: number): string[] =>
  (SALAH_SURAH_WORDS[surah] ?? []).filter((id) => !!getWordById(id));

/** Site words of a Juz Amma surah, most frequent in the surah first. */
export const surahWordIds = (surah: number): string[] => (SURAHS[surah]?.words ?? []).filter((id) => !!getWordById(id));

/** Ids in order without repeats, skipping ids with no word. */
export function uniqueWordIds(ids: Iterable<string>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (seen.has(id) || !getWordById(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
