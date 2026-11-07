import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
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
        title="Surah Vocabulary: Word Lists for All 114 Surahs"
        description="The Quranic Arabic words of every surah, from Al-Fatihah to An-Nas: each list is ordered by how often the word occurs in the surah and shows how much of the surah the words cover. Juz Amma included."
        url="/surahs"
        keywords={['surah vocabulary', 'surah word list', 'Quran words by surah', 'Juz Amma vocabulary', 'Quranic Arabic']}
        breadcrumbs={[{ name: 'Surah vocabulary', path: '/surahs' }]}
      />

      <div className="container mx-auto max-w-5xl py-6">
        <PageTrail items={[{ name: 'Surah vocabulary', path: '/surahs' }]} />

        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Surah vocabulary</h1>
          <p className="mt-2 text-muted-foreground">
            Learn the words of the surahs you recite. Each of the 114 surahs has a page listing the QuranVocab words
            found in it, most frequent first, and how much of the surah they cover. The short surahs of{' '}
            <a href="#juz-amma" className="underline underline-offset-4 hover:text-foreground">Juz Amma</a> (78–114) are
            highlighted.
          </p>
        </header>

        <div className="relative mb-4 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or number, e.g. Yasin, الكهف, 67"
            aria-label="Search surahs by English or Arabic name"
            className="pl-9"
          />
        </div>
        <p className="sr-only" aria-live="polite">
          {query ? `${shown.length} ${shown.length === 1 ? 'surah' : 'surahs'} found` : ''}
        </p>

        {shown.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No surah matches “{query}”.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((s) => {
              const amma = isJuzAmma(s.number);
              return (
                <li key={s.number} id={s.number === 78 ? 'juz-amma' : undefined} className="scroll-mt-20">
                  <Link
                    to={surahPath(s.number)}
                    className={cn(
                      'flex h-full items-start gap-3 rounded-xl border p-4 transition-colors hover:border-primary/30 hover:bg-muted/40',
                      amma && 'border-primary/25 bg-primary/5',
                    )}
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
                      <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                        <span>{juzLabel(s)}</span>
                        {amma && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-px font-medium text-primary">Juz Amma</span>
                        )}
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

        <p className="mt-8 text-sm text-muted-foreground">
          Coverage is the share of the surah’s words (every form counted, from the Quranic Arabic Corpus) that are forms
          of the listed words. You can also explore words by their{' '}
          <Link to="/roots" className="underline underline-offset-4 hover:text-foreground">Arabic roots</Link> or by{' '}
          <Link to="/collections" className="underline underline-offset-4 hover:text-foreground">theme</Link>.
        </p>
      </div>
    </>
  );
};

export default Surahs;
