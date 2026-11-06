// FSRS scheduling via ts-fsrs, plus mapping between ts-fsrs cards and our CardState.
import { fsrs, createEmptyCard, Rating as FsrsRating, State, type Card, type Grade } from 'ts-fsrs';
import type { CardState, CardStatus, Rating } from './types';

export const REQUEST_RETENTION = 0.9;
/** Stability (days) at which a word counts as mastered. */
export const MASTERED_STABILITY_DAYS = 21;

const scheduler = fsrs({ enable_fuzz: true, request_retention: REQUEST_RETENTION });
// Previews use the same parameters without fuzz, so labels are stable while the learner decides.
const previewScheduler = fsrs({ enable_fuzz: false, request_retention: REQUEST_RETENTION });

export const RATINGS: readonly Rating[] = ['again', 'hard', 'good', 'easy'];

const RATING_TO_GRADE: Record<Rating, Grade> = {
  again: FsrsRating.Again,
  hard: FsrsRating.Hard,
  good: FsrsRating.Good,
  easy: FsrsRating.Easy,
};

const STATE_TO_STATUS: Record<State, CardStatus> = {
  [State.New]: 'new',
  [State.Learning]: 'learning',
  [State.Review]: 'review',
  [State.Relearning]: 'relearning',
};

const STATUS_TO_STATE: Record<CardStatus, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

export const ratingToGrade = (rating: Rating): Grade => RATING_TO_GRADE[rating];

export const isRating = (value: unknown): value is Rating =>
  typeof value === 'string' && (RATINGS as readonly string[]).includes(value);

export const isCardStatus = (value: unknown): value is CardStatus =>
  value === 'new' || value === 'learning' || value === 'review' || value === 'relearning';

/** A never-reviewed card for `wordId`, due immediately. */
export function newCardState(wordId: string, now: Date = new Date()): CardState {
  return fromFsrsCard(wordId, createEmptyCard(now));
}

export function toFsrsCard(card: CardState): Card {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    scheduled_days: card.scheduledDays ?? 0,
    learning_steps: card.learningSteps ?? 0,
    reps: card.reps,
    lapses: card.lapses,
    state: STATUS_TO_STATE[card.status] ?? State.New,
    last_review: card.lastReview ? new Date(card.lastReview) : undefined,
  };
}

export function fromFsrsCard(wordId: string, card: Card): CardState {
  return {
    wordId,
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    reps: card.reps,
    lapses: card.lapses,
    status: STATE_TO_STATUS[card.state] ?? 'new',
    lastReview: card.last_review ? card.last_review.toISOString() : null,
    learningSteps: card.learning_steps,
    scheduledDays: card.scheduled_days,
  };
}

/** Apply one review to `card` (or a fresh card when undefined) and return the new state. */
export function scheduleReview(
  card: CardState | undefined,
  wordId: string,
  rating: Rating,
  now: Date = new Date(),
): CardState {
  const base = card ? toFsrsCard(card) : createEmptyCard(now);
  const { card: next } = scheduler.next(base, now, ratingToGrade(rating));
  return fromFsrsCard(wordId, next);
}

/** Milliseconds until the card would be due again if `rating` were chosen now (no fuzz). */
export function previewIntervalMs(card: CardState | undefined, rating: Rating, now: Date = new Date()): number {
  const base = card ? toFsrsCard(card) : createEmptyCard(now);
  const { card: next } = previewScheduler.next(base, now, ratingToGrade(rating));
  return Math.max(0, next.due.getTime() - now.getTime());
}

/** Probability (0 to 1) the learner still recalls the card now; 0 for never-reviewed cards. */
export function retrievability(card: CardState, now: Date = new Date()): number {
  if (!card.lastReview || card.status === 'new') return 0;
  try {
    return previewScheduler.retrievability(toFsrsCard(card), now);
  } catch {
    return 0;
  }
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;

/** "<1 min", "10 min", "5 hours", "1 day", "3 days", "2 months", "1.5 years". */
export function formatInterval(ms: number): string {
  if (!Number.isFinite(ms) || ms < MINUTE) return '<1 min';
  if (ms < HOUR) return `${Math.round(ms / MINUTE)} min`;
  if (ms < DAY) return plural(Math.round(ms / HOUR), 'hour');
  const days = Math.round(ms / DAY);
  if (days < 30) return plural(days, 'day');
  if (days < 365) return plural(Math.round(days / 30), 'month');
  const years = Math.round((days / 365) * 10) / 10;
  return `${years} year${years === 1 ? '' : 's'}`;
}
