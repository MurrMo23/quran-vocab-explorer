import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ogImage } from '@/utils/og-image';
import { rootPath } from '@/utils/quran-pages';
import { cn } from '@/lib/utils';
import { EmbedStaticData, useStaticData } from '@/lib/static-data';
import { ROOTS_INDEX_PATH, type RootIndex, type RootIndexRow } from '@/utils/root-library';

type Sort = 'alpha' | 'frequent';

/** Lower-case Latin without separators, and Arabic letters without spaces or marks, for search. */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[\s'’-]/g, '')
    .toLowerCase();

const PAGE = 120;

const RootCard: React.FC<{ row: RootIndexRow }> = ({ row }) => {
  const [slug, ar, total, forms, meaning, site] = row;
  // Compact markup (styles in index.css: .root-card): this list has 1,600+ entries.
  return (
    <li>
      <Link to={rootPath(slug)} className="root-card">
        <span className="rc-top">
          <span className="rc-n" title={`${total} occurrences in the Quran`}>
            {total.toLocaleString('en-US')}×
          </span>
          <span className="rc-ar" lang="ar" dir="rtl">
            {ar}
          </span>
        </span>
        <span className="rc-m">{meaning ? meaning[0].toUpperCase() + meaning.slice(1) : meaning}</span>
        <span className="rc-f">
          {slug} · {forms} {forms === 1 ? 'form' : 'forms'}
          {site > 0 && <b> · {site} to learn</b>}
        </span>
      </Link>
    </li>
  );
};

const Roots = () => {
  const { data, error } = useStaticData<RootIndex>(ROOTS_INDEX_PATH);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('alpha');
  // One letter at a time (1,600+ cards at once is slow on phones); search and "most frequent" page by 120.
  const [letter, setLetter] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const rows = useMemo(() => data?.roots ?? [], [data]);
  const tokens = rows.reduce((n, r) => n + r[2], 0);

  // Search over slug, Arabic letters and meaning.
  const shown = useMemo(() => {
    const q = fold(query.trim());
    const hits = q ? rows.filter((r) => fold(`${r[0]} ${r[1]} ${r[4]}`).includes(q)) : rows;
    return sort === 'frequent' ? [...hits].sort((a, b) => b[2] - a[2]) : hits;
  }, [rows, query, sort]);

  // Alphabetical view: grouped by first radical (rows already come in Arabic order).
  const groups = useMemo(() => {
    const out: { letter: string; key: string; rows: RootIndexRow[] }[] = [];
    for (const r of shown) {
      const letter = r[1].split(' ')[0];
      const last = out[out.length - 1];
      if (last && last.letter === letter) last.rows.push(r);
      else out.push({ letter, key: r[0].split('-')[0], rows: [r] });
    }
    return out;
  }, [shown]);

  const count = rows.length || 1642;
  const searching = query.trim().length > 0;
  const current = groups.find((g) => g.key === letter) ?? groups[0];
  const visible = searching || sort === 'frequent' ? shown.slice(0, limit) : current?.rows ?? [];

  return (
    <>
      <SEO
        title={`Quranic Arabic Roots: All ${count.toLocaleString('en-US')} Roots with Meanings and Word Forms`}
        description={`Every Arabic root in the Quran (${count.toLocaleString('en-US')}), with its core meaning, all the word forms built from it, how often each occurs and an example verse. Search by root letters or meaning.`}
        url="/roots"
        keywords={['Quranic Arabic roots', 'Arabic root words', 'Quran root list', 'trilateral roots', 'Quran vocabulary by root']}
        breadcrumbs={[{ name: 'Roots', path: '/roots' }]}
        image={ogImage('pages', 'roots')}
      />
      {data && <EmbedStaticData path={ROOTS_INDEX_PATH} data={data} />}

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Roots', path: '/roots' }]} />

        <header className="card-tactile mb-6 rounded-[2rem] p-6 sm:p-9">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Arabic roots in the Quran</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
            Most Arabic words are built from a root of three letters, and every word from a root shares its core
            meaning. Learn one root and you can recognise a whole family of words. Here are all{' '}
            {count.toLocaleString('en-US')} roots in the Quran, with every word form built from them.
          </p>
          {data && (
            <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Roots</dt>
                <dd className="text-2xl font-extrabold">{rows.length.toLocaleString('en-US')}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Word forms</dt>
                <dd className="text-2xl font-extrabold">{rows.reduce((n, r) => n + r[3], 0).toLocaleString('en-US')}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Words in the Quran from a root</dt>
                <dd className="text-2xl font-extrabold">{tokens.toLocaleString('en-US')}</dd>
              </div>
            </dl>
          )}
        </header>

        <div className="sticky top-16 z-10 -mx-4 mb-5 border-b bg-background px-4 py-3 sm:-mx-6 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:max-w-sm sm:flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setLimit(PAGE);
                }}
                placeholder="Search: k-t-b, كتب, mercy"
                aria-label="Search roots by letters or meaning"
                className="h-12 rounded-2xl border-2 bg-card pl-11 text-base md:text-base"
              />
            </div>
            <div role="group" aria-label="Sort roots" className="flex gap-2">
              {(
                [
                  ['alpha', 'A–Z (Arabic)'],
                  ['frequent', 'Most frequent'],
                ] as [Sort, string][]
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={sort === v}
                  onClick={() => {
                    setSort(v);
                    setLimit(PAGE);
                  }}
                  className={cn(
                    'h-11 rounded-full border-2 px-4 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    sort === v ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/40',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {data && (searching || sort === 'frequent') && (
            <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
              Showing {shown.length.toLocaleString('en-US')} of {rows.length.toLocaleString('en-US')}
            </p>
          )}
        </div>

        {sort === 'alpha' && !searching && groups.length > 1 && (
          <nav aria-label="Roots by first letter" className="mb-6">
            <ul className="flex flex-wrap gap-1.5" lang="ar" dir="rtl">
              {groups.map((g) => (
                <li key={g.key}>
                  <button
                    type="button"
                    onClick={() => setLetter(g.key)}
                    aria-pressed={g === current}
                    aria-label={`Roots starting with ${g.letter} (${g.rows.length})`}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl border-2 border-b-4 font-arabic text-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      g === current ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary/40 hover:text-primary',
                    )}
                  >
                    {g.letter}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {!data && !error && (
          <p className="flex items-center justify-center gap-2 py-16 text-sm font-semibold text-muted-foreground" role="status">
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden /> Loading roots…
          </p>
        )}
        {error && <p className="py-16 text-center text-muted-foreground">The root list could not be loaded. Check your connection and reload.</p>}

        {data && shown.length === 0 && <p className="py-10 text-center text-muted-foreground">No root matches “{query}”.</p>}

        {data && shown.length > 0 && (
          <>
            {sort === 'alpha' && !searching && current && (
              <h2 className="mb-4 flex items-center gap-3" lang="ar" dir="rtl">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary font-quran text-3xl leading-none text-secondary-foreground">
                  {current.letter}
                </span>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
                <span className="text-sm font-bold text-muted-foreground" dir="ltr">
                  {current.rows.length} roots
                </span>
              </h2>
            )}
            <ul className="root-grid">
              {visible.map((r) => (
                <RootCard key={r[0]} row={r} />
              ))}
            </ul>
            {(searching || sort === 'frequent') && shown.length > visible.length && (
              <div className="mt-6 flex justify-center">
                <Button variant="outline" size="lg" onClick={() => setLimit((n) => n + PAGE)}>
                  Show more ({(shown.length - visible.length).toLocaleString('en-US')} left)
                </Button>
              </div>
            )}
          </>
        )}

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Roots, word forms and counts: Quranic Arabic Corpus (morphology v0.4). The number on each root is how many
          words in the Quran are built from it. Meanings: QuranVocab, written from the Quran.com word-by-word
          translation.
        </p>
      </div>
    </>
  );
};

export default Roots;
