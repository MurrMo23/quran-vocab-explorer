// Shared contract for learner progress. Implemented in src/lib/progress (engine),
// consumed by Practice, Quiz, Dashboard, Analytics and Notebook.
// Scheduling uses FSRS (ts-fsrs). Signed-in users sync to Supabase; guests use localStorage,
// and guest progress is merged into the account on sign-in.

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export type CardStatus = 'new' | 'learning' | 'review' | 'relearning';

export type ReviewSource = 'practice' | 'quiz' | 'flashcards' | 'listening';

/** FSRS memory state for one word for one learner. Dates are ISO strings. */
export interface CardState {
  wordId: string;
  due: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  status: CardStatus;
  lastReview: string | null;
  /** Optional FSRS bookkeeping (current (re)learning step, last scheduled interval in days). */
  learningSteps?: number;
  scheduledDays?: number;
}

/** One answer given by the learner. */
export interface ReviewLog {
  wordId: string;
  rating: Rating;
  reviewedAt: string;
  source: ReviewSource;
  /** Time taken to answer, if measured. */
  elapsedMs?: number;
}

export interface DailyCount {
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  count: number;
}

export interface ProgressStats {
  /** Words with at least one review. */
  wordsStarted: number;
  /** Words whose FSRS stability is at least 21 days. */
  wordsMastered: number;
  /** Started words currently due for review. */
  dueNow: number;
  reviewsToday: number;
  /** Last 7 local days, oldest first, zero-filled. */
  reviewsLast7Days: DailyCount[];
  /** Consecutive local days with at least one review, ending today (or yesterday if none yet today). */
  currentStreak: number;
  longestStreak: number;
  /** Share of reviews in the last 7 days not rated 'again' (0 to 1); null when there are none. */
  accuracy7d: number | null;
}

export interface UseProgressResult {
  loading: boolean;
  /** True when no user is signed in; progress lives in this browser only. */
  isGuest: boolean;
  /** True when the server tables are unavailable and progress fell back to this browser. */
  offlineFallback: boolean;
  cards: ReadonlyMap<string, CardState>;
  logs: readonly ReviewLog[];
  stats: ProgressStats;
  /** Schedule the word with FSRS, persist the card and the log. Returns the updated card. */
  recordReview: (wordId: string, rating: Rating, source: ReviewSource, elapsedMs?: number) => Promise<CardState>;
  /** Word ids due now, most overdue first. */
  getDueWordIds: (limit?: number) => string[];
  /** Ids from `pool` the learner has never reviewed, in pool order. */
  getNewWordIds: (pool: readonly string[], limit?: number) => string[];
  /** A practice queue: due words first, topped up with new words from `pool`. */
  buildSession: (pool: readonly string[], size: number) => string[];
  /** Human-readable next interval if `rating` were chosen now, e.g. "10 min", "3 days". */
  previewInterval: (wordId: string, rating: Rating) => string;
}
