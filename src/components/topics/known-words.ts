import { getWordById } from '@/utils/vocabulary';
import type { Word } from '@/utils/vocabulary-types';

/** Known words for the given ids, in order, each once. */
export const knownWords = (ids: readonly (string | null | undefined)[]): Word[] => {
  const seen = new Set<string>();
  const out: Word[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    const w = getWordById(id);
    if (w) {
      seen.add(id);
      out.push(w);
    }
  }
  return out;
};
