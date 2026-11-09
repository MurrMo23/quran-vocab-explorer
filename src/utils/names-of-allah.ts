// Lookups for the 99 Names of Allah pages (/names-of-allah, /names-of-allah/<slug>), over data generated
// from the Quranic Arabic Corpus by scripts/vocab/gen-names.py.
import { NAMES_OF_ALLAH, WORD_NAME, type DivineName, type NameStatus, type NameVerse } from './generated/names-of-allah';
import { getRootBySlug } from './quran-pages';
import { getWordById, type Word } from './vocabulary';
import { pad3 } from './audio';

export type { DivineName, NameStatus, NameVerse };

export const NAMES_HUB_PATH = '/names-of-allah';
export const namePath = (slug: string) => `${NAMES_HUB_PATH}/${slug}`;

export const getAllNames = (): DivineName[] => NAMES_OF_ALLAH;

const bySlug = new Map(NAMES_OF_ALLAH.map((n) => [n.slug, n]));
export const getNameBySlug = (slug: string): DivineName | undefined => bySlug.get(slug);

/** Short label for a name's Quran status. */
export const STATUS_LABEL: Record<NameStatus, string> = {
  quran: 'In the Quran',
  'quran-verb-only': 'Related form in the Quran',
  hadith: 'From hadith',
};

/** Quran.com word-by-word recitation of the word at a verse position. */
export const verseWordAudioUrl = (v: Pick<NameVerse, 's' | 'a' | 'w'>) =>
  `https://audio.qurancdn.com/wbw/${pad3(v.s)}_${pad3(v.a)}_${pad3(v.w)}.mp3`;

/** The verse whose word recitation represents the name (a verse using the name itself, else none). */
export const getNameAudioVerse = (name: DivineName): NameVerse | undefined =>
  name.verses.find((v) => v.kind === 'name');

/** The QuranVocab word page for this name, if the word is on the site. */
export const getNameWord = (name: DivineName): Word | undefined => {
  for (const id of name.words) {
    const w = getWordById(id);
    if (w) return w;
  }
  return undefined;
};

/** Every site word of the names (one per name), for "Review all 99". */
export const getNamesReviewIds = (): string[] =>
  NAMES_OF_ALLAH.map((n) => getNameWord(n)?.id).filter((id): id is string => !!id);

/** Review these names (every review is Yes / No by default, then pick the meaning on No). */
export const reviewHref = (ids: string[]) => `/review?words=${ids.map(encodeURIComponent).join(',')}`;

/** The name page a word page should link to, if any. */
export const getNameForWord = (wordId: string): DivineName | undefined => {
  const slug = WORD_NAME[wordId];
  return slug ? bySlug.get(slug) : undefined;
};

/** Other names from the same root. */
export const getRelatedNames = (name: DivineName): DivineName[] =>
  NAMES_OF_ALLAH.filter((n) => n.slug !== name.slug && n.root.slug === name.root.slug);

export const hasRootPage = (slug: string) => !!getRootBySlug(slug);

export const getAdjacentNames = (name: DivineName) => ({
  prev: NAMES_OF_ALLAH[name.n - 2],
  next: NAMES_OF_ALLAH[name.n],
});
