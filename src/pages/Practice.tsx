import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, RotateCcw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getPublishedCollections, getAllWords, getWordById, getWordsByCollection } from '@/utils/vocabulary';
import type { Word } from '@/utils/vocabulary-types';
import { useProgress, upcomingWordIds, type Rating } from '@/lib/progress';
import { useUserCollections, PRACTICE_COLLECTION_PARAM } from '@/lib/collections';
import { usePracticePool, ALL_WORDS } from '@/components/practice/usePracticePool';
import ReviewCard from '@/components/practice/ReviewCard';
import SessionSummary, { type SessionAnswer } from '@/components/practice/SessionSummary';
import ProgressSaveNotice from '@/components/practice/ProgressSaveNotice';
import SEO from '@/components/SEO';

const SESSION_SIZES = [10, 20, 50] as const;
/** A word rated "Again" comes back later in the same session, at most this many extra times. */
const MAX_REPEATS_PER_WORD = 2;

type Phase = 'setup' | 'session' | 'summary';

const Practice = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get(PRACTICE_COLLECTION_PARAM) ?? '';
  const [selected, setSelected] = useState<string>(collectionParam || ALL_WORDS);
  const [sessionSize, setSessionSize] = useState<number>(20);

  useEffect(() => {
    if (collectionParam) setSelected(collectionParam);
  }, [collectionParam]);

  const progress = useProgress();
  const { buildSession, recordReview, previewInterval, cards, loading: progressLoading } = progress;
  const builtInCollections = useMemo(() => getPublishedCollections(), []);
  const { items: userCollections } = useUserCollections();
  const pool = usePracticePool(selected);

  const [phase, setPhase] = useState<Phase>('setup');
  const [queue, setQueue] = useState<string[]>([]);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [saving, setSaving] = useState(false);
  const shownAt = useRef<number>(Date.now());
  const repeats = useRef(new Map<string, number>());

  // What a session would contain right now (for the setup screen).
  const plannedQueue = useMemo(
    () => (pool.loading ? [] : buildSession(pool.wordIds, sessionSize)),
    [buildSession, pool.loading, pool.wordIds, sessionSize],
  );
  const plannedDue = plannedQueue.filter((id) => cards.get(id)?.lastReview).length;
  const plannedNew = plannedQueue.length - plannedDue;
  const aheadQueue = useMemo(
    () => (plannedQueue.length === 0 ? upcomingWordIds(cards, pool.wordIds, sessionSize) : []),
    [plannedQueue.length, cards, pool.wordIds, sessionSize],
  );

  const startSession = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      repeats.current = new Map();
      setQueue(ids);
      setPosition(0);
      setAnswers([]);
      setRevealed(false);
      shownAt.current = Date.now();
      setPhase('session');
    },
    [],
  );

  const chooseCollection = (id: string) => {
    setSelected(id);
    const next = new URLSearchParams(searchParams);
    if (id && id !== ALL_WORDS) next.set(PRACTICE_COLLECTION_PARAM, id);
    else next.delete(PRACTICE_COLLECTION_PARAM);
    setSearchParams(next, { replace: true });
  };

  const currentId = queue[position];
  const currentWord: Word | undefined = currentId ? getWordById(currentId) : undefined;

  const reveal = useCallback(() => setRevealed(true), []);

  const rate = useCallback(
    async (rating: Rating) => {
      if (!currentId || saving) return;
      const elapsedMs = Date.now() - shownAt.current;
      setSaving(true);
      try {
        const card = await recordReview(currentId, rating, 'practice', elapsedMs);
        setAnswers((prev) => [...prev, { wordId: currentId, rating, elapsedMs, due: card.due }]);

        let nextQueue = queue;
        if (rating === 'again') {
          const count = repeats.current.get(currentId) ?? 0;
          if (count < MAX_REPEATS_PER_WORD) {
            repeats.current.set(currentId, count + 1);
            nextQueue = [...queue, currentId];
            setQueue(nextQueue);
          }
        }
        if (position + 1 >= nextQueue.length) {
          setPhase('summary');
        } else {
          setPosition(position + 1);
          setRevealed(false);
          shownAt.current = Date.now();
        }
      } finally {
        setSaving(false);
      }
    },
    [currentId, saving, recordReview, queue, position],
  );

  // Skip ids whose word data is missing (e.g. a removed custom word).
  useEffect(() => {
    if (phase === 'session' && currentId && !currentWord) {
      if (position + 1 >= queue.length) setPhase('summary');
      else setPosition((p) => p + 1);
    }
  }, [phase, currentId, currentWord, position, queue.length]);

  const sessionProgress = queue.length > 0 ? (position / queue.length) * 100 : 0;

  return (
    <>
      <SEO
        title="Practice Quranic Vocabulary"
        description="Review Quranic Arabic vocabulary with spaced-repetition flashcards that schedule each word for the moment you are about to forget it."
        keywords={['Arabic practice', 'vocabulary flashcards', 'spaced repetition', 'Quranic Arabic']}
        url="https://quranvocab.com/practice"
        type="website"
      />

      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Practice</h1>
          <p className="text-muted-foreground">
            Spaced-repetition review: due words first, then new ones.
          </p>
        </div>

        {phase === 'setup' && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Start a review session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label htmlFor="practice-collection" className="mb-2 block text-sm font-medium">
                  Words from
                </label>
                <select
                  id="practice-collection"
                  value={selected}
                  onChange={(e) => chooseCollection(e.target.value)}
                  className="w-full rounded-md border bg-background p-2"
                >
                  <option value={ALL_WORDS}>All words ({getAllWords().length})</option>
                  <optgroup label="Collections">
                    {builtInCollections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({getWordsByCollection(c.id).length})
                      </option>
                    ))}
                  </optgroup>
                  {userCollections.length > 0 && (
                    <optgroup label="My collections">
                      {userCollections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.wordIds.length})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {selected !== ALL_WORDS &&
                    !builtInCollections.some((c) => c.id === selected) &&
                    !userCollections.some((c) => c.id === selected) && (
                      <option value={selected}>{pool.loading ? 'Loading collection…' : 'Collection not found'}</option>
                    )}
                </select>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium">Session length</span>
                <div className="flex gap-2" role="group" aria-label="Session length">
                  {SESSION_SIZES.map((n) => (
                    <Button
                      key={n}
                      type="button"
                      variant={sessionSize === n ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSessionSize(n)}
                      aria-pressed={sessionSize === n}
                    >
                      {n} cards
                    </Button>
                  ))}
                </div>
              </div>

              {pool.notFound ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                  That collection could not be found. Pick another one above.
                </p>
              ) : progressLoading || pool.loading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading your progress…
                </p>
              ) : plannedQueue.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {plannedDue} due for review · {plannedNew} new
                </p>
              ) : pool.wordIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">This collection has no words yet.</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You’re all caught up in {pool.name}. Nothing is due right now.
                </p>
              )}

              {plannedQueue.length > 0 || aheadQueue.length === 0 ? (
                <Button
                  onClick={() => startSession(plannedQueue)}
                  disabled={plannedQueue.length === 0 || progressLoading || pool.loading}
                  className="w-full"
                  size="lg"
                >
                  Start session ({plannedQueue.length} {plannedQueue.length === 1 ? 'card' : 'cards'})
                </Button>
              ) : (
                <Button onClick={() => startSession(aheadQueue)} variant="outline" className="w-full" size="lg">
                  Review ahead ({aheadQueue.length} {aheadQueue.length === 1 ? 'card' : 'cards'})
                </Button>
              )}

              <ProgressSaveNotice />
            </CardContent>
          </Card>
        )}

        {phase === 'session' && currentWord && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Card {position + 1} of {queue.length} · {pool.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (answers.length > 0 ? setPhase('summary') : setPhase('setup'))}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {answers.length > 0 ? 'End session' : 'Cancel'}
                </Button>
              </div>
              <Progress value={sessionProgress} className="h-2" aria-label="Session progress" />
            </div>

            <ReviewCard
              word={currentWord}
              revealed={revealed}
              isNew={!cards.get(currentWord.id)?.lastReview}
              onReveal={reveal}
              onRate={rate}
              previewInterval={(r) => previewInterval(currentWord.id, r)}
              disabled={saving}
            />

            <ProgressSaveNotice />
          </div>
        )}

        {phase === 'summary' && (
          <SessionSummary
            answers={answers}
            onRestart={() => setPhase('setup')}
          />
        )}
      </div>
    </>
  );
};

export default Practice;
