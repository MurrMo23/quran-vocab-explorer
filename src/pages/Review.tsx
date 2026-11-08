import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarClock, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { ogImage } from '@/utils/og-image';
import { getPublishedCollections, getWordById } from '@/utils/vocabulary';
import { useProgress, upcomingWordIds, type Rating } from '@/lib/progress';
import { useUserCollections, PRACTICE_COLLECTION_PARAM } from '@/lib/collections';
import { usePracticePool } from '@/components/practice/usePracticePool';
import ProgressSaveNotice from '@/components/practice/ProgressSaveNotice';
import { RATING_OPTIONS } from '@/components/practice/rating-options';
import { ChoiceOptions, FeedbackBar, SessionTopBar, type FeedbackState } from '@/components/review/SessionParts';
import SourcePicker from '@/components/review/SourcePicker';
import ReviewCardFace from '@/components/review/ReviewCardFace';
import ReviewSummary, { type ReviewAnswer } from '@/components/review/ReviewSummary';
import GoalChooser from '@/components/onboarding/GoalChooser';
import {
  GOAL_CHANGE_EVENT,
  goalWordIds,
  readLearningGoal,
  writeLearningGoal,
  type LearningGoalId,
} from '@/lib/learning-goals';
import { track } from '@/lib/analytics';
import { wordPath } from '@/utils/quran-pages';
import { getNameForWord, namePath } from '@/utils/names-of-allah';
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
  REVIEW_SIMPLE_PARAM,
  SOURCE_DUE,
  SOURCE_WORDS,
  collectionSourceValue,
  type SessionItem,
} from '@/components/review/review-session';

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
  // Simple session (used by the 99 Names): "Do you remember?" Yes / No instead of rating buttons.
  const simple = searchParams.get(REVIEW_SIMPLE_PARAM) === '1';
  const navigate = useNavigate();

  const progress = useProgress();
  const { recordReview, previewInterval, cards, logs, stats, loading: progressLoading } = progress;
  const collections = useMemo(() => getPublishedCollections(), []);
  const { items: userCollections } = useUserCollections();
  const collectionPool = usePracticePool(kind === 'collection' ? collectionParam : null);

  const [newPerDay, setNewPerDay] = useState(readNewPerDay);
  const [goal, setGoal] = useState<LearningGoalId | null>(readLearningGoal);
  // Picking a goal in the chooser on this page updates it too.
  useEffect(() => {
    const sync = () => setGoal(readLearningGoal());
    window.addEventListener(GOAL_CHANGE_EVENT, sync);
    return () => window.removeEventListener(GOAL_CHANGE_EVENT, sync);
  }, []);

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
  const sourceKey = `${simple ? 's' : ''}${kind}|${kind === 'words' ? wordList.join(',') : kind === 'collection' ? `${collectionParam}|${pool.ids.length}` : ''}`;

  // Session state.
  const [phase, setPhase] = useState<Phase>('loading');
  const [items, setItems] = useState<SessionItem[]>([]);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  /** Yes / No cards: what the learner answered ('no' shows the meanings to pick from). */
  const [yesNo, setYesNo] = useState<'yes' | 'no' | null>(null);
  const autoNext = useRef<number | null>(null);
  const clearAutoNext = () => {
    if (autoNext.current !== null) window.clearTimeout(autoNext.current);
    autoNext.current = null;
  };
  useEffect(() => clearAutoNext, []);
  const [answers, setAnswers] = useState<ReviewAnswer[]>([]);
  const [round, setRound] = useState(0);
  const [buildMode, setBuildMode] = useState<BuildMode>('normal');
  const shownAt = useRef(Date.now());
  const repeats = useRef(new Map<string, number>());

  // Latest progress, read when a session is built (the queue must not change as cards are rescheduled).
  const latest = useRef({ cards, logs, newPerDay, pool, goal });
  latest.current = { cards, logs, newPerDay, pool, goal };

  useEffect(() => {
    if (!ready) {
      setPhase('loading');
      return;
    }
    const { cards: c, logs: l, newPerDay: perDay, pool: p, goal: g } = latest.current;
    let queue: SessionItem[] = [];
    if (!p.notFound) {
      const usePool = kind !== 'due';
      const remainingToday = Math.max(0, perDay - newWordsIntroducedToday(l));
      queue = buildReviewQueue({
        cards: c,
        pool: usePool ? p.ids : undefined,
        newLimit: buildMode === 'newOnly' ? Math.max(perDay, 5) : usePool ? Infinity : remainingToday,
        preferredNew: g ? goalWordIds(g) : undefined,
        newOnly: buildMode === 'newOnly',
        ahead: buildMode === 'ahead',
        simple,
      });
    }
    repeats.current = new Map();
    clearAutoNext();
    setItems(queue);
    setPosition(0);
    setRevealed(false);
    setChosen(null);
    setYesNo(null);
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

  const changeGoal = (value: LearningGoalId | null) => {
    writeLearningGoal(value);
    setGoal(value);
    if (value) track('goal_selected', { goal: value });
    // Like the daily limit: apply right away unless a session is under way.
    if (kind === 'due' && (phase === 'empty' || (phase === 'session' && answers.length === 0))) startRound('normal');
  };

  const advance = useCallback(
    (queue: SessionItem[]) => {
      clearAutoNext();
      if (position + 1 >= queue.length) {
        setPhase('summary');
        return;
      }
      setPosition(position + 1);
      setRevealed(false);
      setChosen(null);
      setYesNo(null);
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
          queue = [
            ...items,
            current.mode === 'yesno'
              ? { wordId: current.wordId, mode: 'yesno', options: current.options, isNew: false }
              : { wordId: current.wordId, mode: 'flip', isNew: false },
          ];
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

  /** Where a missed word is explained: its 99 Names page if it is one, else its word page. */
  const explainPath = (wordId: string) => {
    const name = getNameForWord(wordId);
    return name ? namePath(name.slug) : wordPath(wordId);
  };

  // Yes / No cards. Yes: show the meaning briefly, then the next word.
  const answerYes = useCallback(() => {
    if (!current || current.mode !== 'yesno' || yesNo !== null) return;
    setYesNo('yes');
    setRevealed(true);
    const queue = record('good', 'practice');
    autoNext.current = window.setTimeout(() => advance(queue), 1600);
  }, [current, yesNo, record, advance]);

  // No: the four meanings appear under the card.
  const answerNo = useCallback(() => {
    if (!current || current.mode !== 'yesno' || yesNo !== null) return;
    setYesNo('no');
  }, [current, yesNo]);

  // Right: next word. Wrong: open the page that explains the word.
  const pickMeaning = useCallback(
    (option: string) => {
      if (!current || current.mode !== 'yesno' || yesNo !== 'no' || chosen !== null || !word) return;
      setChosen(option);
      setRevealed(true);
      const right = option === word.meaning;
      const queue = record(right ? 'hard' : 'again', 'quiz');
      const target = explainPath(word.id);
      autoNext.current = window.setTimeout(() => (right ? advance(queue) : navigate(target)), right ? 1400 : 2200);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, yesNo, chosen, word, record, advance, navigate],
  );

  const continueYesNo = useCallback(() => {
    if (!current || current.mode !== 'yesno' || !word) return;
    if (yesNo === 'yes' || (chosen !== null && chosen === word.meaning)) advance(items);
    else if (chosen !== null) {
      clearAutoNext();
      navigate(explainPath(word.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, word, yesNo, chosen, advance, items, navigate]);

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
      if (current.mode === 'yesno') {
        const k = e.key.toLowerCase();
        if (yesNo === null) {
          if (k === 'y') {
            e.preventDefault();
            answerYes();
          } else if (k === 'n') {
            e.preventDefault();
            answerNo();
          } else if (isSpace) e.preventDefault();
        } else if (yesNo === 'no' && chosen === null) {
          const idx = ['1', '2', '3', '4'].indexOf(e.key);
          if (idx >= 0 && current.options?.[idx] !== undefined) {
            e.preventDefault();
            pickMeaning(current.options[idx]);
          } else if (isSpace) e.preventDefault();
        } else if (isSpace || e.key === 'Enter') {
          e.preventDefault();
          continueYesNo();
        }
        return;
      }
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
  }, [phase, current, revealed, chosen, yesNo, reveal, rate, choose, continueAfterChoice, answerYes, answerNo, pickMeaning, continueYesNo]);

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
  const answeredCurrent =
    (current?.mode === 'choice' && chosen !== null) || (current?.mode === 'yesno' && (yesNo === 'yes' || chosen !== null));

  const feedback: FeedbackState | null =
    phase === 'session' && current && word
      ? current.mode === 'yesno'
        ? yesNo === null
          ? { kind: 'yn-ask' }
          : yesNo === 'yes'
            ? { kind: 'yn-yes', word }
            : chosen === null
              ? { kind: 'choice-idle' }
              : chosen === word.meaning
                ? { kind: 'yn-right', word }
                : { kind: 'yn-wrong', word, explainLabel: getNameForWord(word.id) ? 'name' : 'word' }
        : current.mode === 'flip'
        ? revealed
          ? { kind: 'flip-back', word, previewInterval }
          : { kind: 'flip-front' }
        : chosen === null
          ? { kind: 'choice-idle' }
          : chosen === word.meaning
            ? { kind: 'correct', word }
            : { kind: 'wrong', word }
      : null;

  const sourcePicker = (
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
      goal={goal}
      onGoalChange={changeGoal}
    />
  );

  // The shared goal card, restyled to the session's tactile surfaces.
  const goalCardClass = 'rounded-3xl border-2 border-b-[5px] shadow-none sm:p-6';

  return (
    <>
      <SEO
        title="Review Quranic Vocabulary"
        description="One short daily review of Quranic Arabic words: hear the recitation, recall the meaning, see it in a verse. Spaced repetition schedules each word just before you would forget it."
        keywords={['Quranic Arabic', 'Quran vocabulary review', 'spaced repetition', 'Arabic flashcards']}
        url="https://quranvocab.com/review"
        image={ogImage('pages', 'review')}
        type="website"
      />

      <div className="w-full">
        <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6 sm:pt-8">
          <h1 className="sr-only">Review</h1>

          {phase !== 'session' && <div className="mb-6">{sourcePicker}</div>}

          {phase === 'loading' && (
            <p className="flex items-center justify-center gap-2 py-16 text-sm font-semibold text-muted-foreground" role="status">
              <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden /> Loading your progress…
            </p>
          )}

          {phase === 'session' && current && word && (
            <div className="space-y-6 sm:space-y-7">
              <SessionTopBar
                done={position + (answeredCurrent ? 1 : 0)}
                total={total}
                streak={stats.currentStreak}
                onClose={endSession}
                closeLabel={answers.length > 0 ? 'End session' : 'Close review'}
              />

              {/* First visit: offer a goal before the default "Due & new" words. */}
              {kind === 'due' && cards.size === 0 && answers.length === 0 && <GoalChooser className={goalCardClass} />}

              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-[1.5rem] font-extrabold leading-tight sm:text-[1.625rem]">
                  {current.mode === 'yesno'
                    ? yesNo === 'no'
                      ? 'Which meaning is it?'
                      : yesNo === 'yes'
                        ? 'Here is the meaning'
                        : 'Do you remember this word?'
                    : current.mode === 'choice'
                    ? 'What does this word mean?'
                    : revealed
                      ? 'Here is the meaning'
                      : 'Do you remember this word?'}
                </h2>
                <span className="text-sm font-bold text-muted-foreground" data-testid="review-position">
                  Word {position + 1} of {total}
                  <span className="hidden sm:inline"> · {pool.name}</span>
                </span>
              </div>

              <ReviewCardFace
                key={`${position}-${word.id}`}
                word={word}
                revealed={revealed}
                isNew={current.isNew}
                prompt={
                  current.mode === 'choice' || (current.mode === 'yesno' && yesNo === 'no')
                    ? 'Pick the meaning below'
                    : current.mode === 'yesno'
                      ? 'Think of its meaning, then answer below'
                      : undefined
                }
                onReveal={current.mode === 'flip' ? reveal : undefined}
              />

              {current.mode === 'yesno' && yesNo === 'no' && (
                <ChoiceOptions options={current.options ?? []} answer={word.meaning} chosen={chosen} onChoose={pickMeaning} />
              )}

              {current.mode === 'choice' && (
                <ChoiceOptions options={current.options ?? []} answer={word.meaning} chosen={chosen} onChoose={choose} />
              )}

              <div className="space-y-3 border-t-2 border-border pt-6">
                {sourcePicker}
                <ProgressSaveNotice />
              </div>
            </div>
          )}

          {phase === 'summary' && <ReviewSummary answers={answers} onReviewMore={() => startRound('normal')} />}

          {phase === 'empty' && emptyInfo && (
            <section className="space-y-6" data-testid="review-empty">
              <div className="card-tactile flex flex-col items-center px-5 py-9 text-center sm:px-10">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <CalendarClock className="h-8 w-8" aria-hidden />
                </span>
                {pool.notFound ? (
                  <>
                    <h2 className="mt-4 text-[1.5rem] font-extrabold leading-tight">
                      {kind === 'words' ? 'None of these words were found' : 'That collection could not be found'}
                    </h2>
                    <p className="mt-2 text-muted-foreground">Pick something else to review above.</p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-4 text-[1.5rem] font-extrabold leading-tight">
                      {kind === 'due' ? "You're all caught up" : `Nothing due in ${pool.name}`}
                    </h2>
                    <p className="mt-2 max-w-md text-muted-foreground">
                      {emptyInfo.next
                        ? `Your next review is due ${formatUntil(emptyInfo.next)}.`
                        : 'Nothing is scheduled yet.'}
                      {kind === 'due' && emptyInfo.introduced > 0 && newPerDay > 0 && emptyInfo.introduced >= newPerDay && (
                        <> You've started today's {newPerDay} new words.</>
                      )}
                    </p>
                  </>
                )}
                <div className="mt-7 flex w-full max-w-sm flex-col gap-3">
                  {kind === 'due' && emptyInfo.newLeft && (
                    <Button size="lg" variant="gold" onClick={() => startRound('newOnly')}>
                      <Sparkles aria-hidden />
                      Learn new words
                    </Button>
                  )}
                  {!pool.notFound && emptyInfo.next && emptyInfo.next.getTime() <= Date.now() ? (
                    // A card became due while this screen was open.
                    <Button size="lg" onClick={() => startRound('normal')}>
                      Review now
                    </Button>
                  ) : (
                    emptyInfo.ahead &&
                    !pool.notFound && (
                      <Button size="lg" variant="outline" onClick={() => startRound('ahead')}>
                        Review ahead
                      </Button>
                    )
                  )}
                  {kind !== 'due' && (
                    <Button size="lg" variant="outline" onClick={() => chooseSource(SOURCE_DUE)}>
                      Review due &amp; new instead
                    </Button>
                  )}
                  <Button size="lg" variant="ghost" className="text-primary hover:text-primary" asChild>
                    <Link to="/collections">Pick a collection</Link>
                  </Button>
                </div>
              </div>
              {kind === 'due' && <GoalChooser className={goalCardClass} />}
              <ProgressSaveNotice />
            </section>
          )}
        </div>

        {/* Sticks to the bottom of the viewport while the session is on screen; mobile and desktop alike. */}
        {feedback && (
          <FeedbackBar
          state={feedback}
          onReveal={reveal}
          onRate={rate}
          onContinue={current?.mode === 'yesno' ? continueYesNo : continueAfterChoice}
          onYes={answerYes}
          onNo={answerNo}
        />
        )}
      </div>
    </>
  );
};

export default Review;
