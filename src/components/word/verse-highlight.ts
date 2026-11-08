// Finds the word inside an example verse so the word page can highlight it.
// Deliberately strict: a token is highlighted only when, after removing vowel marks, it is the
// word's consonant skeleton with at most a common attached prefix (و ف ب ل ك ال ...) and a short
// ending, and exactly one token in the verse matches. Anything ambiguous gets no highlight.

const MARKS = /[ً-ٟۖ-ۭـ]/g;

/** Consonant skeleton: no vowel marks, unified alef/ya/ta marbuta spellings, letters only. */
const skeleton = (s: string): string =>
  s
    .normalize('NFC')
    .replace(/ٰ/g, 'ا') // dagger alef counts as alef (keeps عالمين apart from علم)
    .replace(MARKS, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^ء-ي]/g, '');

const PREFIXES = new Set(['', 'و', 'ف', 'ب', 'ل', 'ك', 'س', 'ال', 'وال', 'فال', 'بال', 'كال', 'لل', 'ولل', 'فلل', 'وب', 'فب', 'ول', 'فل', 'وك', 'ا']);
const MAX_SUFFIX = 4;

/** The core to look for: skeleton without the article and a trailing ta marbuta / alef / ya. */
const core = (arabic: string): string => skeleton(arabic).replace(/^ال/, '').replace(/[هاي]$/, '');

export interface VersePart {
  text: string;
  highlight: boolean;
}

/**
 * Splits `verse` into parts with the single occurrence of `word` marked, or returns null when
 * the word cannot be located reliably (multi-word entries, short skeletons, no or several matches).
 */
export function highlightWordInVerse(verse: string, word: string, isVerb = false): VersePart[] | null {
  if (/\s/.test(word.trim())) return null;
  const c = core(word);
  if (c.length < 3) return null;
  const tokens = verse.split(/(\s+)/);
  let hit = -1;
  for (let i = 0; i < tokens.length; i++) {
    const s = skeleton(tokens[i]);
    if (!s) continue;
    const at = s.indexOf(c);
    if (at < 0) continue;
    const prefix = s.slice(0, at);
    if (!PREFIXES.has(prefix) || s.length - at - c.length > MAX_SUFFIX) continue;
    if (isVerb && (prefix.includes('ال') || prefix.endsWith('لل'))) continue; // verbs never take the article
    if (hit >= 0) return null; // ambiguous
    hit = i;
  }
  if (hit < 0) return null;
  return [
    { text: tokens.slice(0, hit).join(''), highlight: false },
    { text: tokens[hit], highlight: true },
    { text: tokens.slice(hit + 1).join(''), highlight: false },
  ].filter((p) => p.text.length > 0);
}

/**
 * Index (among the verse's whitespace-separated words) of the single occurrence of `word`, or -1.
 * Same rules as highlightWordInVerse.
 */
export function findWordIndexInVerse(verse: string, word: string, isVerb = false): number {
  const parts = highlightWordInVerse(verse, word, isVerb);
  if (!parts) return -1;
  const before = parts[0].highlight ? '' : parts[0].text;
  return before.trim() ? before.trim().split(/\s+/).length : 0;
}
