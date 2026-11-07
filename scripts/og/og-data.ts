// Collects everything the share-image generator needs from the app's own data modules.
// Bundled with esbuild and run by generate-og.mjs; prints one JSON document to the file in argv[2].
import { writeFileSync } from 'node:fs';
import { getAllWords, getPublishedCollections, getWordsByCollection } from '../../src/utils/vocabulary';
import { getWordSlug } from '../../src/utils/word-slugs';
import { NAMES_OF_ALLAH } from '../../src/utils/generated/names-of-allah';
import { SURAH_PAGES, getSurahVocabulary } from '../../src/utils/quran-pages';
import { RAMADAN_DAYS, WORDS_PER_DAY, ramadanPlanCoverage } from '../../src/lib/ramadan-plan';

const TOP_WORDS = Number(process.env.OG_TOP_WORDS || 300);

const byFrequency = <T extends { frequency: number }>(a: T, b: T) => b.frequency - a.frequency;

const words = getAllWords()
  .filter((w) => w.frequency > 0)
  .sort(byFrequency)
  .slice(0, TOP_WORDS)
  .map((w) => ({
    slug: getWordSlug(w),
    arabic: w.arabic,
    transliteration: w.transliteration,
    meaning: w.meaning,
    frequency: w.frequency,
    partOfSpeech: w.partOfSpeech,
  }));

const collections = getPublishedCollections().map((c) => {
  const cw = getWordsByCollection(c.id).sort(byFrequency);
  return {
    slug: c.id,
    name: c.name,
    description: c.description,
    count: cw.length,
    arabic: cw.slice(0, 3).map((w) => w.arabic),
  };
});

const names = NAMES_OF_ALLAH.map((n) => ({
  slug: n.slug,
  n: n.n,
  arabic: n.ar,
  transliteration: n.tr,
  meaning: n.en,
  count: n.count,
  status: n.status,
}));

const surahs = SURAH_PAGES.map((n) => getSurahVocabulary(n))
  .filter((s): s is NonNullable<typeof s> => !!s)
  .map((s) => ({
    slug: String(s.number),
    number: s.number,
    arabic: s.arabic,
    name: s.name,
    meaning: s.meaning,
    ayahs: s.ayahs,
    count: s.words.length,
    coveragePercent: s.coveragePercent,
  }));

const ramadan = { days: RAMADAN_DAYS, perDay: WORDS_PER_DAY, ...ramadanPlanCoverage() };

writeFileSync(
  process.argv[2],
  JSON.stringify({ totalWords: getAllWords().length, words, collections, names, surahs, ramadan }),
);
