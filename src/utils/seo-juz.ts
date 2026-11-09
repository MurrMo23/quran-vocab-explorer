// Titles and meta descriptions for /juz and /juz/<n> (Juz 30 uses juzAmmaSeo in seo-pillars.ts).
// Same limits as seo-templates.ts: titles within TITLE_MAX (SEO adds " | QuranVocab" only when it
// fits), descriptions within DESC_MAX. Check after a build with: npm run seo:check
import { TITLE_MAX, fitSentences, type PageSeo } from './seo-templates';
import type { JuzRow } from './generated/juz';

const len = (s: string) => [...s].length;
const firstFitting = (...titles: string[]) => titles.find((t) => len(t) <= TITLE_MAX) ?? titles[titles.length - 1];
const pct = (part: number, whole: number) => `${((100 * part) / whole).toFixed(1)}%`;

export const JUZ_HUB_SEO = {
  title: 'Quran Juz by Juz: Vocabulary of All 30 Juz (Para)',
  heading: 'Quran vocabulary, juz by juz',
  description: fitSentences(
    'The key words of each of the 30 juz (para) of the Quran, from Juz 1 Alif Lam Mim to Juz 30 Amma, with meanings and how often each occurs.',
    'One juz a day for Ramadan.',
  ),
};

/** "Juz 2 (Sayaqul) Vocabulary: Key Words & Meanings"; `top`/`covered`: the listed words and the tokens they cover. */
export const juzSeo = (j: JuzRow, range: string, top: number, covered: number): PageSeo => ({
  title: firstFitting(
    `Juz ${j.n} (${j.name}) Vocabulary: Key Words & Meanings`,
    `Juz ${j.n} (${j.name}) Vocabulary & Meanings`,
    `Juz ${j.n} (${j.name}) Vocabulary`,
  ),
  description: fitSentences(
    `Key words of Juz ${j.n} (Para ${j.n}, ${j.name}), ${range}: its ${top} most frequent words, with meanings, make up ${pct(covered, j.words)} of the text.`,
    'Learn them with free flashcards.',
  ),
});
