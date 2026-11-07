import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { SURAH_PAGES, getSurahVocabulary, surahPath, type SurahVocabulary } from '@/utils/quran-pages';

const Surahs = () => {
  const surahs = useMemo(
    () => SURAH_PAGES.map((n) => getSurahVocabulary(n)).filter((s): s is SurahVocabulary => !!s),
    [],
  );

  return (
    <>
      <SEO
        title="Surah Vocabulary: Juz Amma Word Lists (Surahs 78–114)"
        description={`Word lists for the ${surahs.length} surahs of Juz Amma (An-Naba' to An-Nas): the Quranic Arabic words in each surah, most frequent first, and how much of the surah they cover.`}
        url="/surahs"
        keywords={['Juz Amma vocabulary', 'short surahs vocabulary', 'surah word list', 'Quranic Arabic']}
        breadcrumbs={[{ name: 'Surah vocabulary', path: '/surahs' }]}
      />

      <div className="container mx-auto max-w-5xl py-6">
        <PageTrail items={[{ name: 'Surah vocabulary', path: '/surahs' }]} />

        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Surah vocabulary</h1>
          <p className="mt-2 text-muted-foreground">
            Learn the words of the surahs you recite. Each page lists the QuranVocab words found in the surah, most
            frequent first, and how much of the surah they cover. Juz Amma (surahs 78–114) is available now; more
            surahs are coming.
          </p>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {surahs.map((s) => (
            <li key={s.number}>
              <Link
                to={surahPath(s.number)}
                className="flex h-full items-start gap-3 rounded-xl border p-4 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {s.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-arabic text-lg" lang="ar" dir="rtl">{s.arabic}</span>
                  </span>
                  <span className="block text-sm text-muted-foreground">{s.meaning}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {s.words.length} words · covers {s.coveragePercent}% of {s.totalWords}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-muted-foreground">
          More surahs are coming. Meanwhile, explore words by their <Link to="/roots" className="underline underline-offset-4 hover:text-foreground">Arabic roots</Link> or by <Link to="/collections" className="underline underline-offset-4 hover:text-foreground">theme</Link>.
        </p>
      </div>
    </>
  );
};

export default Surahs;
