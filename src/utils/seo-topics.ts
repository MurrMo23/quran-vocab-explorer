// Titles and meta descriptions for /salah-words, the /topics hub and the "<X> in the Quran" pages.
// Same limits as seo-templates.ts / seo-pillars.ts: titles within TITLE_MAX (SEO adds " | QuranVocab"
// only when it fits), descriptions within DESC_MAX. Check after a build with: npm run seo:check
import { fitSentences, TITLE_MAX } from './seo-templates';
import type { PageSeo } from './seo-templates';
import type { TopicData } from './generated/topics';

const len = (s: string) => [...s].length;
const firstFitting = (...titles: string[]) => titles.find((t) => len(t) <= TITLE_MAX) ?? titles[titles.length - 1];
const n = (x: number) => x.toLocaleString('en-US');
const c = (d: TopicData, key: string) => d.counts.find((x) => x.key === key)?.count ?? 0;

export const salahWordsSeo = (salahCount: number): PageSeo => ({
  title: 'Words of Salah: What You Say in Prayer, Word by Word',
  description: fitSentences(
    `What to say in salah (prayer in Arabic), in order: takbir, Al-Fatiha word by word, ruku, sujud, tashahhud and salam, with transliteration and meaning.`,
    `“Salah” occurs ${n(salahCount)} times in the Quran.`,
    'Free audio.',
  ),
});

export const TOPICS_HUB_SEO: PageSeo = {
  title: 'Topics in the Quran: Jesus, Mary, Moses, Women & Jinn',
  description: fitSentences(
    'What the Quran says about Jesus, Mary, Moses, the prophets, women and the jinn: how often each is mentioned, the key verses in Arabic with translation, and the words to learn.',
  ),
};

/** Per-topic title and description, built from the generated counts. */
export const topicSeo = (slug: string, d: TopicData): PageSeo => {
  switch (slug) {
    case 'jesus-in-the-quran':
      return {
        title: firstFitting('Jesus in the Quran: Isa, Son of Maryam, and Key Verses', 'Jesus (Isa) in the Quran'),
        description: fitSentences(
          `Jesus (ʿĪsā) is named ${n(c(d, 'isa'))} times in the Quran and called al-Masih ${n(c(d, 'masih'))} times. His titles, the surahs that mention him and the key verses in Arabic with translation.`,
        ),
      };
    case 'mary-in-the-quran':
      return {
        title: firstFitting('Mary in the Quran: Maryam, the Only Woman Named', 'Mary (Maryam) in the Quran'),
        description: fitSentences(
          `Maryam (Mary) is named ${n(c(d, 'maryam'))} times in the Quran, the only woman called by name, and Surah 19 is named after her. Her titles and key verses in Arabic with translation.`,
        ),
      };
    case 'moses-in-the-quran':
      return {
        title: firstFitting('Moses in the Quran: Musa, the Most-Named Prophet', 'Moses (Musa) in the Quran'),
        description: fitSentences(
          `Moses (Mūsā) is named ${n(c(d, 'musa'))} times in the Quran, more than any other prophet. The surahs that tell his story, his duas and key verses in Arabic with translation.`,
        ),
      };
    case 'prophets-in-the-quran':
      return {
        title: 'Prophets in the Quran: All 25 Names and Mentions',
        description: fitSentences(
          `The 25 prophets named in the Quran, from Adam to Muhammad, with how often each name occurs and the verses that list them, in Arabic with translation.`,
          'Learn their names with free flashcards.',
        ),
      };
    case 'women-in-the-quran':
      return {
        title: 'Women in the Quran: Maryam and the Women of Its Stories',
        description: fitSentences(
          `Maryam is the only woman named in the Quran. The wife of Pharaoh, the mother of Musa, the queen of Sheba and the others, with the Arabic and references, and key verses on women.`,
        ),
      };
    case 'jinn-in-the-quran':
      return {
        title: 'Jinn in the Quran: Mentions, Surah Al-Jinn & Key Verses',
        description: fitSentences(
          `The jinn are mentioned ${n(c(d, 'jinn') + c(d, 'jann') + c(d, 'jinnah'))} times in the Quran. What it says about them, Surah Al-Jinn (72) and the key verses in Arabic with translation.`,
        ),
      };
    default:
      return { title: 'Topics in the Quran', description: TOPICS_HUB_SEO.description };
  }
};
