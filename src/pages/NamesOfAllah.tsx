import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Repeat, Search } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import AudioPlayer from '@/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  NAMES_HUB_PATH,
  STATUS_LABEL,
  getAllNames,
  getNameAudioVerse,
  getNamesReviewIds,
  namePath,
  reviewHref,
  verseWordAudioUrl,
  type DivineName,
} from '@/utils/names-of-allah';

type Filter = 'all' | 'quran' | 'hadith';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All 99' },
  { value: 'quran', label: 'In the Quran' },
  { value: 'hadith', label: 'From hadith' },
];

const SITE_URL = 'https://quranvocab.com';

/** Lower-case Latin without diacritics or apostrophes, and Arabic without vowel marks, for search. */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/['’ʿʾ`-]/g, '')
    .toLowerCase();

const matches = (n: DivineName, q: string) => {
  if (!q) return true;
  const hay = fold(`${n.tr} ${n.slug} ${n.en} ${n.ar} ${n.n}`);
  return q.split(/\s+/).every((t) => hay.includes(t));
};

const NameCard: React.FC<{ name: DivineName }> = ({ name }) => {
  const verse = getNameAudioVerse(name);
  return (
    <li className="relative">
      <Link
        to={namePath(name.slug)}
        className="flex h-full flex-col rounded-xl border bg-card p-3 sm:p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {name.n}
        </span>
        <span className="mt-1 block text-center font-arabic text-2xl leading-relaxed sm:text-3xl" lang="ar" dir="rtl">
          {name.ar}
        </span>
        <span className="mt-1 block font-semibold leading-snug">{name.tr}</span>
        <span className="block text-sm text-muted-foreground">{name.en}</span>
        {name.status !== 'quran' && (
          <span className="mt-2 block text-xs text-muted-foreground">{STATUS_LABEL[name.status]}</span>
        )}
        {/* Room for the play button, which sits outside the link. */}
        {verse && <span className="mt-2 block h-8" aria-hidden="true" />}
      </Link>
      {verse && (
        <AudioPlayer
          src={verseWordAudioUrl(verse)}
          size="sm"
          label=""
          allowComputerVoice={false}
          className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4"
        />
      )}
    </li>
  );
};

const NamesOfAllah = () => {
  const names = getAllNames();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const reviewIds = useMemo(() => getNamesReviewIds(), []);
  const inQuran = names.filter((n) => n.status === 'quran').length;

  const shown = useMemo(() => {
    const q = fold(query.trim());
    return names.filter(
      (n) =>
        (filter === 'all' || (filter === 'quran' ? n.status === 'quran' : n.status !== 'quran')) && matches(n, q),
    );
  }, [names, filter, query]);

  const termSet = {
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}${NAMES_HUB_PATH}#names`,
    name: "The 99 Names of Allah (al-Asma' al-Husna)",
    url: `${SITE_URL}${NAMES_HUB_PATH}`,
    inLanguage: ['ar', 'en'],
    hasDefinedTerm: names.map((n) => ({
      '@type': 'DefinedTerm',
      name: `${n.tr} (${n.ar})`,
      description: n.en,
      termCode: String(n.n),
      url: `${SITE_URL}${namePath(n.slug)}`,
    })),
  };

  return (
    <>
      <SEO
        title="99 Names of Allah: Meanings, Arabic & Where They Appear in the Quran"
        description={`All 99 Names of Allah (Asma ul Husna) in Arabic with transliteration and meaning. See which ${inQuran} names are used of Allah in the Quran, read the verses, listen to the recitation and review them.`}
        url={NAMES_HUB_PATH}
        keywords={['99 names of Allah', 'Asma ul Husna', 'names of Allah meaning', 'al-asma al-husna', 'names of Allah in the Quran']}
        breadcrumbs={[{ name: '99 Names of Allah', path: NAMES_HUB_PATH }]}
        jsonLd={[termSet]}
      />

      <div className="container mx-auto max-w-6xl py-6">
        <PageTrail items={[{ name: '99 Names of Allah', path: NAMES_HUB_PATH }]} />

        <header className="mb-6 max-w-3xl">
          <p className="font-arabic text-4xl leading-relaxed text-primary" lang="ar" dir="rtl">
            الأسماء الحسنى
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">The 99 Names of Allah</h1>
          <p className="mt-3 text-muted-foreground">
            Each name with its Arabic, transliteration and meaning, and the verses where the Quran uses it. {inQuran} of
            the 99 are used of Allah in the Quran itself; for the others we show a related Quranic word where there is
            one. Tap a name to read its verses and hear the recitation.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          {reviewIds.length > 0 && (
            <Button asChild>
              <Link to={reviewHref(reviewIds)}>
                <Repeat className="mr-2 h-4 w-4" aria-hidden="true" />
                Review all 99
              </Link>
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            {reviewIds.length < names.length
              ? `Reviews the ${reviewIds.length} names that have a QuranVocab word page.`
              : 'Spaced-repetition review of every name.'}
          </p>
        </div>

        <div className="sticky top-0 z-10 -mx-4 mb-4 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:max-w-xs sm:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search: Wadud, loving, الودود"
                aria-label="Search the names"
                className="pl-9"
              />
            </div>
            <div role="group" aria-label="Filter names" className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  aria-pressed={filter === f.value}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    filter === f.value ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
            Showing {shown.length} of {names.length}
          </p>
        </div>

        {shown.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((n) => (
              <NameCard key={n.slug} name={n} />
            ))}
          </ul>
        ) : (
          <p className="py-10 text-center text-muted-foreground">No name matches “{query}”.</p>
        )}

        <section aria-labelledby="about-list" className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border p-5">
            <h2 id="about-list" className="mb-2 text-lg font-semibold">About this list</h2>
            <p className="text-sm text-muted-foreground">
              The Prophet Muhammad ﷺ said that Allah has ninety-nine names (Sahih al-Bukhari and Sahih Muslim). The
              list of 99 used here, from Ar-Rahman to As-Sabur, comes from a hadith narrated by al-Tirmidhi. Scholars
              differ on the exact list, and the Quran contains more names of Allah than these.
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              <li><strong>In the Quran</strong>: the name's own word is used of Allah in the Quran.</li>
              <li><strong>Related form in the Quran</strong>: a verb or other word from the same root describes Allah.</li>
              <li><strong>From hadith</strong>: the name comes from the hadith list; no Quranic word from its root describes Allah by it.</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Word data: Quranic Arabic Corpus. Verses: Tanzil Uthmani text with the Saheeh International translation.
              Recitation: Quran.com word by word.
            </p>
          </div>

          <aside aria-label="Related site" className="rounded-xl border bg-muted/30 p-5">
            <h2 className="mb-2 text-lg font-semibold">AllahSWT.org</h2>
            <p className="text-sm text-muted-foreground">
              Charity projects inspired by the Names. A sister site from the team behind QuranVocab.
            </p>
            <a
              href="https://allahswt.org/"
              target="_blank"
              rel="noopener"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Visit AllahSWT.org
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </aside>
        </section>
      </div>
    </>
  );
};

export default NamesOfAllah;
