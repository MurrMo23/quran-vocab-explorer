// Readable, stable URL slugs for word pages (/word/<slug>).
//
// Slugs are URL-only: word ids stay the data key for saved progress, notes, collections and
// Supabase rows. Old URLs that use a word id (/word/87) still resolve and redirect to the slug.
//
// Rules (deterministic, so the prerender, sitemap, _redirects and client always agree):
// 1. A non-numeric id that is already a clean slug keeps its id as slug (no URL churn).
// 2. Other words (the numeric ids "1".."140") get a slug from the transliteration:
//    lowercase ASCII, diacritics/ʿ/ʾ/apostrophes stripped, spaces -> '-'.
// 3. On a collision, the first words of the meaning are appended ("allah-god"), then "-2", "-3".
// Reserved ids are claimed first, so adding a numeric-id word can never take an existing slug.
import { getAllWords } from './vocabulary';
import type { Word } from './vocabulary-types';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NUMERIC_RE = /^\d+$/;
const STOPWORDS = new Set(['a', 'an', 'the', 'of', 'to', 'and', 'or', 'in', 'on', 'for', 'with', 'by', 'from', 'one', 'who', 'that']);

/** Lowercase ASCII slug: strips diacritics, ʿ ʾ and apostrophes; other separators become '-'. */
export const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining marks: ā -> a, ḥ -> h, ī -> i
    .replace(/[ʿʾʻʼ'‘’`´]/g, '') // ayn/hamza marks and apostrophes vanish (sab'ah -> sabah)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** True when `id` can be used as-is as a word slug. */
export const isCleanSlug = (id: string): boolean => SLUG_RE.test(id) && !NUMERIC_RE.test(id);

const meaningSuffix = (word: Word, base: string): string => {
  const baseParts = new Set(base.split('-'));
  const meaning = word.meaning || '';
  const words = (text: string) =>
    slugify(text)
      .split('-')
      .filter((p) => p && !STOPWORDS.has(p) && !baseParts.has(p))
      .slice(0, 3)
      .join('-');
  // First sense ("God, The Creator" -> "god"); if that only repeats the name, the whole meaning
  // ("Adam (first human)" -> "first-human").
  return words(meaning.split(/[,;(]/)[0]) || words(meaning);
};

const buildSlugMaps = () => {
  const words = getAllWords();
  const bySlug = new Map<string, Word>();
  const byId = new Map<string, string>();

  // Pass 1: ids that are already good slugs keep them.
  for (const w of words) {
    if (isCleanSlug(w.id) && !bySlug.has(w.id)) {
      bySlug.set(w.id, w);
      byId.set(w.id, w.id);
    }
  }
  // Pass 2: everything else gets a slug from its transliteration, in data order.
  for (const w of words) {
    if (byId.has(w.id)) continue;
    let base = slugify(w.transliteration) || slugify(w.meaning) || `word-${slugify(w.id) || 'x'}`;
    if (NUMERIC_RE.test(base)) base = `word-${base}`;
    let slug = base;
    if (bySlug.has(slug)) {
      const suffix = meaningSuffix(w, base);
      if (suffix) slug = `${base}-${suffix}`;
      for (let n = 2; bySlug.has(slug); n++) slug = `${base}-${n}`;
    }
    bySlug.set(slug, w);
    byId.set(w.id, slug);
  }
  return { bySlug, byId };
};

let maps: ReturnType<typeof buildSlugMaps> | null = null;
const getMaps = () => (maps ??= buildSlugMaps());

let frozen: Readonly<Record<string, string>> | null = null;
/** Frozen id -> slug map for every word (built lazily on first use). */
export const getWordSlugMap = (): Readonly<Record<string, string>> =>
  (frozen ??= Object.freeze(Object.fromEntries(getMaps().byId)));

/** Canonical URL slug for a word (falls back to its id for words added at runtime). */
export const getWordSlug = (word: Pick<Word, 'id'> | string): string => {
  const id = typeof word === 'string' ? word : word.id;
  return getMaps().byId.get(id) ?? id;
};

/** Canonical path for a word page, e.g. /word/tawakkul. Accepts a word or a word id. */
export const getWordPath = (word: Pick<Word, 'id'> | string): string =>
  `/word/${encodeURIComponent(getWordSlug(word))}`;

/**
 * Resolve a /word/:param value: a slug, a legacy id, or a non-canonical spelling of a slug
 * (different case, trailing dashes). Returns the word and its canonical slug.
 */
export const getWordBySlugOrId = (param: string | undefined | null): { word: Word; slug: string } | null => {
  if (!param) return null;
  const { bySlug, byId } = getMaps();
  const direct = bySlug.get(param);
  if (direct) return { word: direct, slug: param };
  const slugForId = byId.get(param);
  if (slugForId) return { word: bySlug.get(slugForId)!, slug: slugForId };
  const normalised = slugify(param);
  const loose = bySlug.get(normalised);
  if (loose) return { word: loose, slug: normalised };
  // Words added at runtime (admin custom words) are not in the slug map; match by id.
  const custom = getAllWords().find((w) => w.id === param);
  return custom ? { word: custom, slug: custom.id } : null;
};

/** Legacy id -> slug pairs for every word whose id differs from its slug (for redirects). */
export const getLegacyWordRedirects = (): Array<{ id: string; slug: string }> =>
  [...getMaps().byId.entries()].filter(([id, slug]) => id !== slug).map(([id, slug]) => ({ id, slug }));
