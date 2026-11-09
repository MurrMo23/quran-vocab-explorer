import React, { useMemo, useState } from 'react';
import { ogImage } from '@/utils/og-image';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { HUB_SEO, itemListLd } from '@/utils/seo-templates';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getSurahSummaries, isJuzAmma, surahPath, type SurahSummary } from '@/utils/quran-pages';

/** Latin text for matching: lower case, letters and digits only, long vowels folded (yaseen -> yasin). */
const latinKey = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]/g, '')
    .replace(/ee/g, 'i')
    .replace(/oo|ou/g, 'u')
    .replace(/aa/g, 'a');

/** Arabic text for matching: no harakat or tatweel, one form of alif, ta marbuta as ha, ya without dots. */
const arabicKey = (s: string) =>
  s
    .replace(/[ً-ٰٟۖ-ۭـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, '');

const ARABIC = /[؀-ۿ]/;

function matches(s: SurahSummary, query: string): boolean {
  if (ARABIC.test(query)) {
    const q = arabicKey(query).replace(/^سوره/, '');
    return !q || arabicKey(s.arabic).includes(q);
  }
  const q = latinKey(query.replace(/^\s*(surah|surat|sura)\b/i, ''));
  if (!q) return true;
  if (/^\d+$/.test(q)) return String(s.number) === q;
  return latinKey(s.name).includes(q) || latinKey(s.meaning).includes(q);
}

const juzLabel = (s: SurahSummary) => (s.juzStart === s.juzEnd ? `Juz ${s.juzStart}` : `Juz ${s.juzStart}–${s.juzEnd}`);

const Surahs = () => {
  const surahs = useMemo(() => getSurahSummaries(), []);
  const [query, setQuery] = useState('');
  const shown = useMemo(() => surahs.filter((s) => matches(s, query)), [surahs, query]);

  return (
    <>
      <SEO
        title={HUB_SEO.surahs.title}
        description={HUB_SEO.surahs.description}
        url="/surahs"
        keywords={['surah vocabulary', 'surah word list', 'Quran words by surah', 'Juz Amma vocabulary', 'Quranic Arabic']}
        breadcrumbs={[{ name: 'Surah vocabulary', path: '/surahs' }]}
        image={ogImage('pages', 'surahs')}
        jsonLd={[
          itemListLd(
            'Surah vocabulary lists',
            '/surahs',
            surahs.map((x) => ({ name: `Surah ${x.name} vocabulary`, path: surahPath(x.number) })),
          ),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Surah vocabulary', path: '/surahs' }]} />

        <header className="card-tactile mb-8 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Surah vocabulary</h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              Learn the words of the surahs you recite. Each of the 114 surahs has a page listing the QuranVocab words
              found in it, most frequent first, and how much of the surah they cover. The short surahs of{' '}
              <a href="#juz-amma" className="font-semibold text-primary underline underline-offset-4 hover:text-primary-shade">Juz Amma</a>{' '}
              (78–114) are highlighted.
            </p>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or number, e.g. Yasin, الكهف, 67"
              aria-label="Search surahs by English or Arabic name"
              className="h-12 rounded-2xl border-2 bg-background pl-11 text-base md:text-base"
            />
          </div>
        </header>
        <p className="sr-only" aria-live="polite">
          {query ? `${shown.length} ${shown.length === 1 ? 'surah' : 'surahs'} found` : ''}
        </p>

        {shown.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No surah matches “{query}”.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {shown.map((s) => {
              const amma = isJuzAmma(s.number);
              return (
                <li key={s.number} id={s.number === 78 ? 'juz-amma' : undefined} className="scroll-mt-24">
                  <Link
                    to={surahPath(s.number)}
                    className={cn(
                      'flex h-full items-start gap-3.5 rounded-[1.375rem] border-2 border-b-4 bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-5',
                      amma && 'border-primary/25 bg-secondary/40',
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-extrabold text-secondary-foreground">
                      {s.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-extrabold">{s.name}</span>
                        <span className="font-arabic text-xl leading-none" lang="ar" dir="rtl">{s.arabic}</span>
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{s.meaning}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                        {amma && (
                          <span className="rounded-full bg-gold/25 px-2 py-0.5 font-bold text-gold-text">Juz Amma</span>
                        )}
                        <span>{juzLabel(s)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{s.ayahs} ayahs</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {s.wordCount} words cover {s.coveragePercent}%
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Coverage is the share of the surah’s words (every form counted, from the Quranic Arabic Corpus) that are forms
          of the listed words. You can also explore words by their{' '}
          <Link to="/roots" className="font-semibold text-primary underline underline-offset-4 hover:text-primary-shade">Arabic roots</Link> or by{' '}
          <Link to="/collections" className="font-semibold text-primary underline underline-offset-4 hover:text-primary-shade">theme</Link>.
        </p>
      </div>
    </>
  );
};

export default Surahs;
