import type { Word } from './vocabulary-types';

export type UsageKind = 'verbatim' | 'related' | 'post-quranic' | 'unknown';

export interface QuranicUsage {
  kind: UsageKind;
  /** Compact label, e.g. "245 occurrences" or "Related form". */
  short: string;
  /** One sentence for word pages and SEO descriptions. */
  long: string;
}

/** How a word appears in the Quran, phrased consistently for every surface. */
export const getQuranicUsage = (word: Pick<Word, 'frequency' | 'quranicForm'>): QuranicUsage => {
  if (word.frequency > 0) {
    const n = word.frequency;
    return { kind: 'verbatim', short: `${n} occurrence${n === 1 ? '' : 's'}`, long: `Used ${n} time${n === 1 ? '' : 's'} in the Quran.` };
  }
  const f = word.quranicForm;
  if (f?.status === 'related') {
    const occ = f.occurrences ? ` (${f.occurrences}×)` : '';
    return { kind: 'related', short: 'Related form', long: f.note || `The Quran uses the related form ${f.arabic ?? ''}${occ}.` };
  }
  if (f?.status === 'post-quranic') {
    return { kind: 'post-quranic', short: 'Not in the Quran', long: f.note };
  }
  return { kind: 'unknown', short: 'Not found verbatim', long: 'Not found verbatim in the Quran.' };
};
