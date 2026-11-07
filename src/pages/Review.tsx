import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarClock, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SEO from '@/components/SEO';
import { getPublishedCollections, getWordById } from '@/utils/vocabulary';
import { useProgress, upcomingWordIds, type Rating } from '@/lib/progress';
import { useUserCollections, PRACTICE_COLLECTION_PARAM } from '@/lib/collections';
import { usePracticePool } from '@/components/practice/usePracticePool';
import ProgressSaveNotice from '@/components/practice/ProgressSaveNotice';
import { RATING_OPTIONS } from '@/components/practice/rating-options';
import SourcePicker from '@/components/review/SourcePicker';
import ReviewCardFace from '@/components/review/ReviewCardFace';
import ReviewSummary, { type ReviewAnswer } from '@/components/review/ReviewSummary';
import {
  MAX_REPEATS_PER_WORD,
  buildReviewQueue,
  formatUntil,
  newWordsIntroducedToday,
  nextDueAt,
  readNewPerDay,
  writeNewPerDay,
  defaultNewWordOrder,
  parseWordList,
  REVIEW_WORDS_PARAM,
  SOURCE_DUE,
  SOURCE_WORDS,
  collectionSourceValue,
  type SessionItem,
} from '@/components/review/review-session';
import { cn } from '@/lib/utils';

type Phase = 'loading' | 'session' | 'summary' | 'empty';
type BuildMode = 'normal' | 'newOnly' | 'ahead';

const isTypingTarget = (el: EventTarget | null) => {
  const node = el as HTMLElement | null;
  if (!node || !node.tagName) return false;
  const tag = node.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable;
};

const Review = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get(PRACTICE_COLLECTION_PARAM) ?? '';
  const wordsParam = searchParams.get(REVIEW_WORDS_PARAM);
  const wordList = useMemo(() => parseWordList(wordsParam), [wordsParam]);
  const kind: 'due' | 'words' | 'collection' = wordsParam !== null ? 'words' : collectionParam ? 'collection' : 'due';

  const progress = useProgress();
  const { recordReview, previewInterval, cards, logs, loading: progressLoading } = progress;
  const collections = useMemo(() => getPublishedCollections(), []);
  const { items: userCollections } = useUserCollections();
  const collectionPool = usePracticePool(kind === 'collection' ? collectionParam : null);

  const [newPerDay, setNewPerDay] = useState(readNewPerDay);

  const pool: { name: string; ids: string[]; loading: boolean; notFound: boolean } = useMemo(() => {
    if (kind === 'words') return { name: 'Selected words', ids: wordList, loading: false, notFound: wordList.length === 0 };
    if (kind === 'collection')
      return {
        name: collectionPool.name,
        ids: collectionPool.wordIds,
        loading: collectionPool.loading,
        notFound: collectionPool.notFound,
      };
    return { name: 'Due & new', ids: [], loading: false, notFound: false };
  }, [kind, wordList, collectionPool]);

  const ready = !progressLoading && !pool.loading;
  const sourceKey = `${kind}|${kind === 'words' ? wordList.join(',') : kind === 'collection' ? `${collectionParam}|${pool.ids.length}` : ''}`;

  // Session state.
  const [phase, setPhase] = useState<Phase>('loading');
  const [items, setItems] = useState<SessionItem[]>([]);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [answers, setAnswers] = useState<ReviewAnswer[]>([]);
  const [round, setRound] = useState(0);
  const [buildMode, setBuildMode] = useState<BuildMode>('normal');
  const shownAt = useRef(Date.now());
  const repeats = useRef(new Map<string, number>());

  // Latest progress, read when a session is built (the queue must not change as cards are rescheduled).
  const latest = useRef({ cards, logs, newPerDay, pool });
  latest.current = { cards, logs, newPerDay, pool };

  useEffect(() => {
    if (!ready) {
      setPhase('loading');
      return;
    }
    const { cards: c, logs: l, newPerDay: perDay, pool: p } = latest.current;
    let queue: SessionItem[] = [];
    if (!p.notFound) {
      const usePool = kind !== 'due';
      const remainingToday = Math.max(0, perDay - newWordsIntroducedToday(l));
      queue = buildReviewQueue({
        cards: c,
        pool: usePool ? p.ids : undefined,
        newLimit: buildMode === 'newOnly' ? Math.max(perDay, 5) : usePool ? Infinity : remainingToday,
        newOnly: buildMode === 'newOnly',
        ahead: buildMode === 'ahead',
      });
    }
    repeats.current = new Map();
    setItems(queue);
    setPosition(0);
    setRevealed(false);
    setChosen(null);
    setAnswers([]);
    shownAt.current = Date.now();
    setPhase(queue.length > 0 ? 'session' : 'empty');
    // Rebuild only when the source, the round or readiness changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sourceKey, round, buildMode]);

  const current = phase === 'session' ? items[position] : undefined;
  const word = current ? getWordById(current.wordId) : undefined;

  const startRound = (mode: BuildMode) => {
    setBuildMode(mode);
    setRound((r) => r + 1);
  };

  const chooseSource = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === SOURCE_WORDS) {
      next.delete(PRACTICE_COLLECTION_PARAM);
    } else {
      next.delete(REVIEW_WORDS_PARAM);
      if (value.startsWith('c:')) next.set(PRACTICE_COLLECTION_PARAM, value.slice(2));
      else next.delete(PRACTICE_COLLECTION_PARAM);
    }
    setBuildMode('normal');
    setSearchParams(next, { replace: true });
  };

  const changeNewPerDay = (value: number) => {
    const v = writeNewPerDay(value);
    setNewPerDay(v);
    // Apply right away unless a session is under way.
    if (kind === 'due' && (phase === 'empty' || (phase === 'session' && answers.length === 0))) startRound('normal');
  };

  const advance = useCallback(
    (queue: SessionItem[]) => {
      if (position + 1 >= queue.length) {
        setPhase('summary');
        return;
      }
      setPosition(position + 1);
      setRevealed(false);
      setChosen(null);
      shownAt.current = Date.now();
    },
    [position],
  );

  /** Record an answer; a word rated Again comes back as a flip card later in this session. */
  const record = useCallback(
    (rating: Rating, source: 'practice' | 'quiz') => {
      if (!current) return items;
      const elapsedMs = Date.now() - shownAt.current;
      void recordReview(current.wordId, rating, source, elapsedMs);
      setAnswers((prev) => [...prev, { wordId: current.wordId, rating, elapsedMs }]);
      let queue = items;
      if (rating === 'again') {
        const n = repeats.current.get(current.wordId) ?? 0;
        if (n < MAX_REPEATS_PER_WORD) {
          repeats.current.set(current.wordId, n + 1);
          queue = [...items, { wordId: current.wordId, mode: 'flip', isNew: false }];
          setItems(queue);
        }
      }
      return queue;
    },
    [current, items, recordReview],
  );

  const reveal = useCallback(() => setRevealed(true), []);

  const rate = useCallback(
    (rating: Rating) => {
      if (!current || current.mode !== 'flip' || !revealed) return;
      advance(record(rating, 'practice'));
    },
    [current, revealed, record, advance],
  );

  const choose = useCallback(
    (option: string) => {
      if (!current || current.mode !== 'choice' || chosen !== null || !word) return;
      setChosen(option);
      setRevealed(true);
      // Recorded now; the learner moves on with Continue after seeing the answer.
      record(option === word.meaning ? 'good' : 'again', 'quiz');
    },
    [current, chosen, word, record],
  );

  const continueAfterChoice = useCallback(() => {
    if (!current || current.mode !== 'choice' || chosen === null) return;
    advance(items);
  }, [current, chosen, advance, items]);

  const endSession = () => {
    if (answers.length > 0) setPhase('summary');
    else setPhase('empty');
  };

  // Keyboard: Space reveals / continues, 1–4 rate or pick an option.
  useEffect(() => {
    if (phase !== 'session' || !current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const onButton = (e.target as HTMLElement | null)?.tagName === 'BUTTON';
      if (e.key === 'Enter' && onButton) return; // let the focused button act
      const isSpace = e.key === ' ' || e.key === 'Spacebar';
      if (current.mode === 'flip') {
        if (!revealed && (isSpace || e.key === 'Enter')) {
          e.preventDefault();
          reveal();
        } else if (revealed) {
          const option = RATING_OPTIONS.find((o) => o.key === e.key);
          if (option) {
            e.preventDefault();
            rate(option.rating);
          } else if (isSpace) {
            e.preventDefault();
          }
        }
      } else if (chosen === null) {
        const idx = ['1', '2', '3', '4'].indexOf(e.key);
        if (idx >= 0 && current.options?.[idx] !== undefined) {
          e.preventDefault();
          choose(current.options[idx]);
        } else if (isSpace) {
          e.preventDefault();
        }
      } else if (isSpace || e.key === 'Enter') {
        e.preventDefault();
        continueAfterChoice();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, current, revealed, chosen, reveal, rate, choose, continueAfterChoice]);

  // Skip ids whose word data is missing (e.g. a removed custom word).
  useEffect(() => {
    if (phase === 'session' && current && !word) advance(items);
  }, [phase, current, word, advance, items]);

  const pickerValue =
    kind === 'words' ? SOURCE_WORDS : kind === 'collection' ? collectionSourceValue(collectionParam) : SOURCE_DUE;
  const knownCollection =
    kind !== 'collection' ||
    collections.some((c) => c.id === collectionParam) ||
    userCollections.some((c) => c.id === collectionParam);

  // Empty-state facts.
  const emptyInfo = useMemo(() => {
    if (phase !== 'empty') return null;
    const scoped = kind !== 'due' ? pool.ids : undefined;
    const next = nextDueAt(cards, scoped);
    const ahead = upcomingWordIds(cards, scoped ?? [...cards.keys()], 1).length > 0;
    const introduced = newWordsIntroducedToday(logs);
    const newLeft = kind === 'due' ? defaultNewWordOrder().some((id) => !cards.get(id)?.lastReview) : false;
    return { next, ahead, introduced, newLeft };
  }, [phase, kind, pool.ids, cards, logs]);

  const total = items.length;

  return (
    <>
      <SEO
        title="Review Quranic Vocabulary"
        description="One short daily review of Quranic Arabic words: hear the recitation, recall the meaning, see it in a verse. Spaced repetition schedules each word just before you would forget it."
        keywords={['Quranic Arabic', 'Quran vocabulary review', 'spaced repetition', 'Arabic flashcards']}
        url="https://quranvocab.com/review"
        type="website"
      />

      <div className={cn('mx-auto w-full max-w-xl py-4 sm:py-8', phase === 'session' && (current?.mode === 'choice' ? 'pb-[22rem] sm:pb-8' : 'pb-48 sm:pb-8'))}>
        <h1 className="sr-only">Review</h1>

        <SourcePicker
          value={pickerValue}
          onChange={chooseSource}
          collections={collections}
          userCollections={userCollections}
          wordListCount={wordList.length}
          unknownCollection={
            knownCollection
              ? undefined
              : { value: pickerValue, label: pool.loading ? 'Loading collection…' : 'Collection not found' }
          }
          newPerDay={newPerDay}
          onNewPerDayChange={changeNewPerDay}
        />

        {phase === 'loading' && (
          <p className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground" role="status">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your progress…
          </p>
        )}

        {phase === 'session' && current && word && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm text-muted-foreground">
                <span data-testid="review-position">
                  {position + 1} / {total}
                  {current.mode === 'choice' && ' · Quick check'}
                </span>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={endSession}>
                  <X className="mr-1 h-4 w-4" />
                  {answers.length > 0 ? 'End' : 'Close'}
                </Button>
              </div>
              <Progress value={(position / Math.max(1, total)) * 100} className="h-1.5" aria-label="Session progress" />
            </div>

            <ReviewCardFace
              key={`${position}-${word.id}`}
              word={word}
              revealed={revealed}
              isNew={current.isNew}
              prompt={current.mode === 'choice' ? 'Choose the meaning' : undefined}
              onReveal={current.mode === 'flip' ? reveal : undefined}
            />

            {/* Answer controls: fixed to the bottom on phones (thumb reach), inline on larger screens. */}
            <div
              className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-3 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:z-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
              <div className="mx-auto max-w-xl">
                {current.mode === 'flip' && !revealed && (
                  <>
                    <Button size="lg" className="h-14 w-full text-base" onClick={reveal}>
                      Show answer
                    </Button>
                    <p className="mt-2 hidden text-center text-xs text-muted-foreground sm:block">Space to reveal · 1–4 to rate</p>
                  </>
                )}

                {current.mode === 'flip' && revealed && (
                  <div className="grid grid-cols-4 gap-2" role="group" aria-label="How well did you remember it?">
                    {RATING_OPTIONS.map((o) => (
                      <Button
                        key={o.rating}
                        variant="outline"
                        className={cn('h-16 flex-col gap-0.5 px-1', o.className)}
                        onClick={() => rate(o.rating)}
                        aria-keyshortcuts={o.key}
                        data-testid={`rate-${o.rating}`}
                      >
                        <span className="text-base font-semibold">{o.label}</span>
                        <span className="text-xs opacity-80">{previewInterval(word.id, o.rating)}</span>
                      </Button>
                    ))}
                  </div>
                )}

                {current.mode === 'choice' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Choose the meaning">
                      {(current.options ?? []).map((opt, i) => {
                        const isCorrect = opt === word.meaning;
                        const picked = chosen === opt;
                        return (
                          <Button
                            key={opt}
                            variant="outline"
                            disabled={chosen !== null}
                            onClick={() => choose(opt)}
                            aria-keyshortcuts={String(i + 1)}
                            data-testid="choice-option"
                            className={cn(
                              'h-auto min-h-12 justify-start whitespace-normal py-2 text-left text-base disabled:opacity-100',
                              chosen !== null && isCorrect && 'border-2 border-green-600 bg-green-100 font-semibold text-green-800 dark:bg-green-950/40 dark:text-green-200',
                              picked && !isCorrect && 'border-2 border-red-600 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200',
                              chosen !== null && !isCorrect && !picked && 'opacity-60',
                            )}
                          >
                            <span className="mr-2 hidden text-xs text-muted-foreground sm:inline">{i + 1}</span>
                            {opt}
                          </Button>
                        );
                      })}
                    </div>
                    {chosen !== null && (
                      <Button size="lg" className="h-14 w-full text-base" onClick={continueAfterChoice} autoFocus>
                        {chosen === word.meaning ? 'Correct — continue' : 'Continue'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <ProgressSaveNotice className="hidden sm:flex" />
          </div>
        )}

        {phase === 'summary' && (
          <div className="mt-4">
            <ReviewSummary answers={answers} onReviewMore={() => startRound('normal')} />
          </div>
        )}

        {phase === 'empty' && emptyInfo && (
          <section className="mt-8 space-y-5 text-center" data-testid="review-empty">
            <CalendarClock className="mx-auto h-10 w-10 text-primary" aria-hidden />
            {pool.notFound ? (
              <>
                <h2 className="text-xl font-semibold">
                  {kind === 'words' ? 'None of these words were found' : 'That collection could not be found'}
                </h2>
                <p className="text-muted-foreground">Pick something else to review above.</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">
                  {kind === 'due' ? "You're all caught up" : `Nothing due in ${pool.name}`}
                </h2>
                <p className="text-muted-foreground">
                  {emptyInfo.next
                    ? `Your next review is due ${formatUntil(emptyInfo.next)}.`
                    : 'Nothing is scheduled yet.'}
                  {kind === 'due' && emptyInfo.introduced > 0 && newPerDay > 0 && emptyInfo.introduced >= newPerDay && (
                    <> You've started today's {newPerDay} new words.</>
                  )}
                </p>
              </>
            )}
            <div className="mx-auto flex max-w-sm flex-col gap-3">
              {kind === 'due' && emptyInfo.newLeft && (
                <Button size="lg" className="h-14 text-base" onClick={() => startRound('newOnly')}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Learn new words
                </Button>
              )}
              {!pool.notFound && emptyInfo.next && emptyInfo.next.getTime() <= Date.now() ? (
                // A card became due while this screen was open.
                <Button size="lg" variant="outline" className="h-14 text-base" onClick={() => startRound('normal')}>
                  Review now
                </Button>
              ) : (
                emptyInfo.ahead &&
                !pool.notFound && (
                  <Button size="lg" variant="outline" className="h-14 text-base" onClick={() => startRound('ahead')}>
                    Review ahead
                  </Button>
                )
              )}
              {kind !== 'due' && (
                <Button size="lg" variant="outline" className="h-14 text-base" onClick={() => chooseSource(SOURCE_DUE)}>
                  Review due &amp; new instead
                </Button>
              )}
              <Button size="lg" variant="ghost" asChild>
                <Link to="/collections">Pick a collection</Link>
              </Button>
            </div>
            <ProgressSaveNotice />
          </section>
        )}
      </div>
    </>
  );
};

export default Review;
