// Lookups for the 99 Names of Allah pages (/names-of-allah, /names-of-allah/<slug>), over data generated
// from the Quranic Arabic Corpus by scripts/vocab/gen-names.py.
import { NAMES_OF_ALLAH, WORD_NAME, type DivineName, type NameStatus, type NameVerse } from './generated/names-of-allah';
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

/**
 * Every Quranic root has a page (/root/<slug>, from public/data/roots/), including roots with no
 * QuranVocab word; every name's root is a corpus root, so any well-formed slug links.
 * (scripts/seo-check.mjs reports a broken link if that ever stops being true.)
 */
export const hasRootPage = (slug: string) => /^[a-z]+(?:-[a-z]+)+$/.test(slug);

export const getAdjacentNames = (name: DivineName) => ({
  prev: NAMES_OF_ALLAH[name.n - 2],
  next: NAMES_OF_ALLAH[name.n],
});

/** Spellings that are hand-written because the article rule below does not apply. */
const SPECIAL_SPELLINGS: Record<string, { ya: string; variants: string[] }> = {
  'Malik al-Mulk': { ya: 'Ya Malik al-Mulk', variants: ['Malik ul-Mulk', 'Maalik al-Mulk', 'Ya Malik al-Mulk'] },
  'Dhul-Jalali wal-Ikram': {
    ya: 'Ya Dhal-Jalali wal-Ikram',
    variants: ['Dhul Jalali wal Ikram', 'Dhul-Jalal wal-Ikram', 'Ya Dhal-Jalali wal-Ikram'],
  },
};

/**
 * Other spellings of a name, as people write and search it: without the ayn/hamza marks, with the
 * unassimilated article ("Ar-Rahman" -> "Al-Rahman"), without the hyphen, without the article, and
 * the vocative used in dua ("Ya Rahman", which drops the article).
 */
export const nameSpellings = (tr: string): { ya: string; variants: string[] } => {
  if (SPECIAL_SPELLINGS[tr]) return SPECIAL_SPELLINGS[tr];
  const plainTr = tr.replace(/['ʿʾ‘’]/g, '');
  const m = plainTr.match(/^(A[a-z]{1,2})-(.+)$/);
  if (!m) return { ya: `Ya ${plainTr}`, variants: [plainTr, `Ya ${plainTr}`].filter((v) => v !== tr) };
  const [, article, bare] = m;
  const variants = [plainTr, article !== 'Al' ? `Al-${bare}` : '', `${article} ${bare}`, bare, `Ya ${bare}`];
  return { ya: `Ya ${bare}`, variants: [...new Set(variants)].filter((v) => v && v !== tr) };
};
