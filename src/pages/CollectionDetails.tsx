import SEO from '@/components/SEO';
import { SITE_URL, collectionSeo } from '@/utils/seo-templates';
import { ogImage } from '@/utils/og-image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { track } from '@/lib/analytics';
import { Check } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import HearItButton from '@/components/word/HearItButton';
import { Button } from '@/components/ui/button';
import { getCollectionById, getWordsByCollection, Word } from '@/utils/vocabulary';
import { toast } from 'sonner';
import { practiceCollectionUrl } from '@/lib/collections';
import { getWordPath } from '@/utils/word-slugs';
import { getQuranicUsage } from '@/utils/word-usage';
import { useProgress } from '@/lib/progress';
import { isMastered, isStarted, MASTERY_STABILITY_DAYS } from '@/components/analytics/progress-utils';
import { cn } from '@/lib/utils';
import {
  collectionIcon,
  countLevels,
  LEVELS,
  LEVEL_LABEL,
  LEVEL_TEXT,
  levelSplitText,
  SEARCH_BAR_CLASS,
  type Level,
} from '@/components/collections/collection-meta';

type LevelFilter = 'all' | Level;

/** "245× in the Quran" for verbatim words, a short note for related forms, otherwise nothing. */
const usageNote = (word: Word): string | null => {
  const usage = getQuranicUsage(word);
  if (usage.kind === 'verbatim') return `${word.frequency}× in the Quran`;
  if (usage.kind === 'related') return usage.short;
  return null;
};

interface WordTileProps {
  word: Word;
  learned: boolean;
}

// Plain markup (no per-tile state besides the audio button) so large collections stay cheap.
// The whole tile is clickable through the link's stretched ::after; the audio button sits above it.
const WordTile = React.memo(({ word, learned }: WordTileProps) => {
  const note = usageNote(word);
  return (
    <li className="relative flex flex-col gap-1.5 rounded-[22px] border-2 border-b-4 border-border bg-card p-4 transition-colors hover:border-primary/40 focus-within:border-primary/60 sm:p-5">
      <div className="flex min-h-7 items-center justify-between gap-1">
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={cn('text-xs font-extrabold', LEVEL_TEXT[word.level])}>{LEVEL_LABEL[word.level]}</span>
          {learned && (
            <span className="flex items-center gap-1 text-xs font-extrabold text-primary">
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
              Learned
            </span>
          )}
        </span>
        <HearItButton word={word} size="sm" iconOnly className="relative z-10 -my-2 shrink-0" />
      </div>
      <Link
        to={getWordPath(word.id)}
        className="flex flex-col gap-1 text-foreground no-underline after:absolute after:inset-0 after:rounded-[20px] after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
      >
        <span
          lang="ar"
          dir="rtl"
          className="break-words pt-1 text-center font-quran text-[28px] leading-[1.75] sm:text-[36px]"
        >
          {word.arabic}
        </span>
        <span className="text-base font-extrabold leading-snug sm:text-[17px]">{word.meaning}</span>
      </Link>
      <span className="text-[13px] leading-snug text-muted-foreground">
        {word.transliteration}
        {note && <> · {note}</>}
      </span>
    </li>
  );
});
WordTile.displayName = 'WordTile';

const CollectionDetails = () => {
  const { id } = useParams<{ id: string }>();
  // Static data: identical in the prerender and on the client.
  const collection = useMemo(() => (id ? getCollectionById(id) ?? null : null), [id]);
  const words = useMemo<Word[]>(() => (collection ? getWordsByCollection(collection.id) : []), [collection]);
  const [searchQuery, setSearchQuery] = useState('');
  // Always "all" on first render so the prerendered markup and hydration match.
  const [level, setLevel] = useState<LevelFilter>('all');

  // Progress loads on the client after mount (the provider starts empty and loading), so the
  // prerendered page shows no learned ticks and hydration matches.
  const { cards, loading: progressLoading } = useProgress();

  useEffect(() => {
    if (id && !getCollectionById(id)) {
      toast.error("Collection not found", {
        description: "We couldn't find the collection you're looking for"
      });
    }
  }, [id]);

  useEffect(() => {
    setLevel('all');
  }, [id]);

  // Filter words based on search query
  const searchedWords = useMemo(() => {
    if (searchQuery.trim() === '') return words;
    const query = searchQuery.toLowerCase();
    return words.filter(word => word.arabic.includes(query) || word.meaning.toLowerCase().includes(query) || word.transliteration.toLowerCase().includes(query));
  }, [searchQuery, words]);

  const shownWords = useMemo(
    () => (level === 'all' ? searchedWords : searchedWords.filter((w) => w.level === level)),
    [level, searchedWords],
  );

  const totalLevels = useMemo(() => countLevels(words), [words]);
  const searchedLevels = useMemo(() => countLevels(searchedWords), [searchedWords]);
  const levelOptions = LEVELS.filter((l) => totalLevels[l] > 0);

  const progress = useMemo(() => {
    const learned = new Set<string>();
    let started = 0;
    for (const w of words) {
      const card = cards.get(w.id);
      if (!card) continue;
      if (isStarted(card)) started += 1;
      if (isMastered(card)) learned.add(w.id);
    }
    return { learned, started };
  }, [cards, words]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const total = words.length;
  const learnedCount = progress.learned.size;
  const learnedPct = total ? (learnedCount / total) * 100 : 0;
  const startedPct = total ? (progress.started / total) * 100 : 0;
  const Icon = collection ? collectionIcon(collection.id) : null;
  const filtered = level !== 'all' || searchQuery.trim() !== '';

  return <>
      <SEO
        {...(collection
          ? collectionSeo({ name: collection.name, description: collection.description, count: words.length })
          : { title: 'Collection not found', description: 'Browse a collection of Quranic Arabic vocabulary.' })}
        url={collection ? `/collections/${collection.id}` : undefined}
        image={ogImage('collections', collection?.id)}
        noindex={!collection}
        breadcrumbs={
          collection
            ? [
                { name: 'Collections', path: '/collections' },
                { name: collection.name, path: `/collections/${collection.id}` },
              ]
            : undefined
        }
        jsonLd={
          collection
            ? [
                {
                  '@type': 'DefinedTermSet',
                  '@id': `${SITE_URL}/collections/${collection.id}#termset`,
                  name: `${collection.name}: Quranic Arabic vocabulary`,
                  url: `${SITE_URL}/collections/${collection.id}`,
                  inLanguage: 'ar',
                  // The first 100 (large collections would add tens of KB to the page head).
                  hasDefinedTerm: words.slice(0, 100).map((w) => ({
                    '@type': 'DefinedTerm',
                    name: `${w.transliteration} (${w.arabic})`,
                    description: w.meaning,
                    url: `${SITE_URL}${getWordPath(w)}`,
                  })),
                },
              ]
            : undefined
        }
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-6 sm:gap-7 sm:px-6 sm:pt-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="inline-flex min-h-11 items-center text-muted-foreground no-underline hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link to="/collections" className="inline-flex min-h-11 items-center text-muted-foreground no-underline hover:text-foreground">
                Collections
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-bold text-foreground">
              {collection ? collection.name : 'Not found'}
            </li>
          </ol>
        </nav>

        {collection ? <>
            <section className="card-tactile flex flex-wrap items-center justify-between gap-7 rounded-[28px] p-5 sm:rounded-[32px] sm:p-9">
              <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
                {Icon && (
                  <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-secondary text-primary" aria-hidden="true">
                    <Icon className="h-7 w-7" />
                  </span>
                )}
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-[44px] sm:leading-[1.1]">{collection.name}</h1>
                {collection.description && (
                  <p className="text-base leading-relaxed text-muted-foreground sm:text-[17px]">{collection.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 text-[13px] font-bold">
                    {total} {total === 1 ? 'word' : 'words'}
                  </span>
                  {total > 0 && (
                    <span className="rounded-full border border-border bg-background px-3 py-1.5 text-[13px] font-bold">
                      {levelSplitText(totalLevels)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex w-full min-w-0 flex-[0_1_340px] flex-col gap-3 rounded-3xl bg-background p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-3 text-sm font-bold">
                  <span>Your progress</span>
                  <span className="text-primary tabular-nums">
                    {progressLoading ? ' ' : `${learnedCount} of ${total} learned`}
                  </span>
                </div>
                <div
                  className="relative h-3.5 overflow-hidden rounded-full bg-track"
                  role="img"
                  aria-label={progressLoading ? 'Loading progress' : `${learnedCount} of ${total} words learned, ${progress.started} started`}
                >
                  {!progressLoading && <>
                      <div className="absolute inset-y-0 left-0 rounded-full bg-primary/30" style={{ width: `${startedPct}%` }} />
                      <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${learnedPct}%` }} />
                    </>}
                </div>
                <p className="min-h-10 text-xs leading-snug text-muted-foreground">
                  {progressLoading
                    ? ' '
                    : progress.started > 0
                      ? `${progress.started} of ${total} started. A word counts as learned once you remember it for ${MASTERY_STABILITY_DAYS} days.`
                      : 'Review these words and your progress shows up here.'}
                </p>
                <Button asChild size="lg" className="w-full text-[17px] font-extrabold">
                  <Link to={practiceCollectionUrl(collection.id)} onClick={() => track('cta_click', { cta: 'review_collection', location: 'collection_progress' })}>Review this collection</Link>
                </Button>
              </div>
            </section>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {levelOptions.length > 0 && (
                <div role="group" aria-label="Filter by level" className="flex flex-wrap gap-2">
                  {(['all', ...levelOptions] as LevelFilter[]).map((option) => {
                    const on = option === level;
                    const count = option === 'all' ? searchedWords.length : searchedLevels[option];
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setLevel(option)}
                        className={cn(
                          'h-11 rounded-full border-2 px-4 text-sm font-extrabold tabular-nums transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          on
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-foreground hover:border-primary/40',
                        )}
                      >
                        {option === 'all' ? 'All' : LEVEL_LABEL[option]} · {count}
                      </button>
                    );
                  })}
                </div>
              )}
              <SearchBar className={cn('w-full md:w-72', SEARCH_BAR_CLASS)} onSearch={handleSearch} placeholder="Search in this collection" />
            </div>

            {shownWords.length > 0 ? (
              <ul className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] sm:gap-4">
                {shownWords.map(word => (
                  <WordTile key={word.id} word={word} learned={progress.learned.has(word.id)} />
                ))}
              </ul>
            ) : (
              <div className="card-tactile rounded-[26px] px-6 py-10 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No words found matching your search.' : level !== 'all' ? `No ${LEVEL_LABEL[level].toLowerCase()} words in this collection.` : 'No words found in this collection.'}
                </p>
              </div>
            )}

            {filtered && shownWords.length > 0 && (
              <p className="text-center text-sm text-muted-foreground" aria-live="polite">
                Showing {shownWords.length} of {total} words
              </p>
            )}
          </> : <section className="card-tactile flex flex-col items-center gap-3 rounded-[28px] px-6 py-12 text-center">
            <h1 className="text-2xl font-extrabold">Collection Not Found</h1>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the collection you're looking for.
            </p>
            <Button asChild variant="default">
              <Link to="/collections">View All Collections</Link>
            </Button>
          </section>}
      </div>
    </>;
};
export default CollectionDetails;
