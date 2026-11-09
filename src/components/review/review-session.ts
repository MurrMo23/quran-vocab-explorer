// Pure helpers for the Review session (/review): queue building, the daily new-word limit,
// when multiple-choice cards are mixed in, and the learner's "new words per day" setting.
import {
  dueWordIds,
  localDateKey,
  newWordIds,
  upcomingWordIds,
  type CardState,
  type Rating,
  type ReviewLog,
} from '@/lib/progress';
import { buildQuestion } from '@/components/quiz/quiz-utils';
import { getAllWords, getWordById } from '@/utils/vocabulary';
import type { Word } from '@/utils/vocabulary-types';

/** Query parameter with an explicit word list: /review?words=id1,id2 (used by surah pages). */
export const REVIEW_WORDS_PARAM = 'words';
/**
 * Query parameter that forces the simple Yes / No session even when Advanced grading is on:
 * /review?words=…&simple=1. Yes / No is the default for every session, so links no longer need it.
 */
export const REVIEW_SIMPLE_PARAM = 'simple';
/** Query parameter with a collection id: /review?collection=<id>. */
export const REVIEW_COLLECTION_PARAM = 'collection';
const MAX_WORD_LIST = 1000;

/** Link to a review session over exactly these words. */
export const reviewWordsUrl = (ids: readonly string[]) =>
  `/review?${REVIEW_WORDS_PARAM}=${ids.map(encodeURIComponent).join(',')}`;

/** Known word ids from a `?words=` value, de-duplicated, in the given order. */
export function parseWordList(raw: string | null): string[] {
  if (!raw) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of raw.split(',')) {
    const id = part.trim();
    if (!id || seen.has(id) || !getWordById(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_WORD_LIST) break;
  }
  return out;
}

/** Values of the session source picker. */
export const SOURCE_DUE = 'due';
export const SOURCE_WORDS = 'words';
export const collectionSourceValue = (id: string) => `c:${id}`;

/** Most cards in one session; "Review more" builds the next batch. */
export const SESSION_MAX = 20;
export const DEFAULT_NEW_PER_DAY = 10;
export const NEW_PER_DAY_MIN = 0;
export const NEW_PER_DAY_MAX = 50;
export const NEW_PER_DAY_STORAGE_KEY = 'qv-review-new-per-day';
/** Opt-in four-button FSRS grading (Again / Hard / Good / Easy). Off by default. */
export const ADVANCED_GRADING_STORAGE_KEY = 'qv-review-advanced-grading';
/** Fired on window when Advanced grading is switched on or off (Settings and the review page stay in sync). */
export const ADVANCED_GRADING_EVENT = 'qv-review-advanced-grading-change';
/** A card is shown as multiple choice only after this many reviews. */
export const CHOICE_MIN_REPS = 2;
/** Share of eligible cards shown as multiple choice. */
export const CHOICE_RATIO = 1 / 3;
/** A word rated "Again" comes back later in the same session, at most this many extra times. */
export const MAX_REPEATS_PER_WORD = 2;

/**
 * yesno (default): "Do you know what this means?" Yes / No, then pick from four meanings on No.
 * choice: pick the meaning (a quick check for words seen a few times).
 * flip: reveal then rate Again / Hard / Good / Easy (Advanced grading only).
 */
export type CardMode = 'flip' | 'choice' | 'yesno';

export interface SessionItem {
  wordId: string;
  mode: CardMode;
  /** Multiple-choice options (meanings); set when mode is 'choice' or 'yesno'. */
  options?: string[];
  /** True when the word had never been reviewed when the session was built. */
  isNew: boolean;
}

export function readNewPerDay(): number {
  try {
    const raw = typeof window === 'undefined' ? null : window.localStorage.getItem(NEW_PER_DAY_STORAGE_KEY);
    if (raw === null) return DEFAULT_NEW_PER_DAY;
    return clampNewPerDay(Number(raw));
  } catch {
    return DEFAULT_NEW_PER_DAY;
  }
}

export function writeNewPerDay(value: number): number {
  const v = clampNewPerDay(value);
  try {
    window.localStorage.setItem(NEW_PER_DAY_STORAGE_KEY, String(v));
  } catch {
    // Private mode or storage blocked: the setting lasts for this visit only.
  }
  return v;
}

export function readAdvancedGrading(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(ADVANCED_GRADING_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeAdvancedGrading(on: boolean): boolean {
  try {
    if (on) window.localStorage.setItem(ADVANCED_GRADING_STORAGE_KEY, '1');
    else window.localStorage.removeItem(ADVANCED_GRADING_STORAGE_KEY);
  } catch {
    // Private mode or storage blocked: the setting lasts for this visit only.
  }
  try {
    window.dispatchEvent(new CustomEvent(ADVANCED_GRADING_EVENT, { detail: on }));
  } catch {
    // Non-browser environment.
  }
  return on;
}

export function clampNewPerDay(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_NEW_PER_DAY;
  return Math.min(NEW_PER_DAY_MAX, Math.max(NEW_PER_DAY_MIN, Math.round(value)));
}

/** Words whose first-ever review happened today (local time). */
export function newWordsIntroducedToday(logs: readonly ReviewLog[], now: Date = new Date()): number {
  const first = new Map<string, string>();
  for (const l of logs) {
    const prev = first.get(l.wordId);
    if (prev === undefined || l.reviewedAt < prev) first.set(l.wordId, l.reviewedAt);
  }
  const today = localDateKey(now);
  let n = 0;
  for (const at of first.values()) {
    const d = new Date(at);
    if (!Number.isNaN(d.getTime()) && localDateKey(d) === today) n++;
  }
  return n;
}

const LEVEL_RANK: Record<Word['level'], number> = { beginner: 0, intermediate: 1, advanced: 2 };

/** All word ids in the order new words are introduced: beginner first, most frequent first. */
export function defaultNewWordOrder(): string[] {
  return getAllWords()
    .map((w, i) => ({ w, i }))
    .sort(
      (a, b) =>
        LEVEL_RANK[a.w.level] - LEVEL_RANK[b.w.level] || (b.w.frequency ?? 0) - (a.w.frequency ?? 0) || a.i - b.i,
    )
    .map(({ w }) => w.id);
}

/**
 * New-word order for "Due & new" with a learning goal: the goal's words first (in goal order), then
 * every other word in the default order.
 */
export function preferredNewWordOrder(preferred: readonly string[] | undefined): string[] {
  const base = defaultNewWordOrder();
  if (!preferred || preferred.length === 0) return base;
  const head = [...new Set(preferred)];
  const inHead = new Set(head);
  return [...head, ...base.filter((id) => !inHead.has(id))];
}

/** Soonest due date among started cards (optionally only those in `pool`), or null. */
export function nextDueAt(cards: ReadonlyMap<string, CardState>, pool?: readonly string[]): Date | null {
  const allowed = pool && pool.length > 0 ? new Set(pool) : null;
  let best: number | null = null;
  for (const c of cards.values()) {
    if (c.lastReview === null) continue;
    if (allowed && !allowed.has(c.wordId)) continue;
    const t = new Date(c.due).getTime();
    if (Number.isFinite(t) && (best === null || t < best)) best = t;
  }
  return best === null ? null : new Date(best);
}

export interface BuildQueueInput {
  cards: ReadonlyMap<string, CardState>;
  /** Explicit pool (collection or word list). Empty/undefined means "Due & new" across all words. */
  pool?: readonly string[];
  /** Max new words to add. In "Due & new" mode this is what is left of today's limit. */
  newLimit: number;
  /** "Due & new" only: words to introduce before the default order (the learner's goal list). */
  preferredNew?: readonly string[];
  /** Include only new words (the "Learn new words" button). */
  newOnly?: boolean;
  /** Review words that are not due yet, soonest first (when nothing is due). */
  ahead?: boolean;
  size?: number;
  now?: Date;
  random?: () => number;
  /**
   * Opt-in Advanced grading: unseen and young cards are flip cards rated Again / Hard / Good / Easy.
   * Off (the default): every card asks Yes / No, with four meanings ready for a No.
   */
  advanced?: boolean;
  /** Force Yes / No cards even when `advanced` is on (the `simple=1` link parameter). */
  simple?: boolean;
}

/**
 * Four meaning options (the answer plus three distinct distractors). Falls back to the whole
 * vocabulary when the given pool cannot supply three meanings different from the answer.
 */
export function meaningOptions(word: Word, distractorPool: readonly Word[], index: number): string[] {
  let options = buildQuestion(word, 'multiple-choice', distractorPool, index).options;
  if (options.length < 4) options = buildQuestion(word, 'multiple-choice', getAllWords(), index).options;
  return options;
}

/**
 * Due words first (most overdue first), then new words. By default each card is Yes / No (or, for
 * words reviewed a few times, sometimes a multiple-choice check); with `advanced` the non-choice
 * cards are flip cards with the four rating buttons.
 */
export function buildReviewQueue({
  cards,
  pool,
  newLimit,
  preferredNew,
  newOnly = false,
  ahead = false,
  size = SESSION_MAX,
  now = new Date(),
  random = Math.random,
  advanced = false,
  simple = false,
}: BuildQueueInput): SessionItem[] {
  const hasPool = !!pool && pool.length > 0;
  const exists = (id: string) => !!getWordById(id);
  let ids: string[];
  if (ahead) {
    ids = upcomingWordIds(cards, hasPool ? pool! : [...cards.keys()], size, now).filter(exists);
  } else {
    const due = newOnly ? [] : dueWordIds(cards, now, hasPool ? pool : undefined).filter(exists).slice(0, size);
    const room = Math.max(0, Math.min(size - due.length, newLimit));
    const fresh = room > 0 ? newWordIds(cards, hasPool ? pool! : preferredNewWordOrder(preferredNew)).filter(exists).slice(0, room) : [];
    ids = [...due, ...fresh];
  }

  // Distractors: other words in this session and its pool, padded with all words when small.
  const sessionWords = ids.map((id) => getWordById(id)).filter((w): w is Word => !!w);
  const poolWords = hasPool ? pool!.map((id) => getWordById(id)).filter((w): w is Word => !!w) : sessionWords;
  const distinct = new Set(poolWords.map((w) => w.meaning.trim().toLowerCase()));
  const distractorPool = distinct.size >= 8 ? poolWords : getAllWords();

  return ids.map((wordId, i) => {
    const card = cards.get(wordId);
    const isNew = !card || (card.lastReview === null && card.reps === 0);
    const eligible = !!card && !isNew && card.reps >= CHOICE_MIN_REPS;
    const word = getWordById(wordId)!;
    if (!simple && eligible && random() < CHOICE_RATIO) {
      const options = meaningOptions(word, distractorPool, i);
      if (options.length >= 4) return { wordId, mode: 'choice', options, isNew };
    }
    if (simple || !advanced) return { wordId, mode: 'yesno', options: meaningOptions(word, distractorPool, i), isNew };
    return { wordId, mode: 'flip', isNew };
  });
}

/* ---------------------------------------------------------- saved session */

/** Where a session is parked while the learner looks up a missed word (this tab only). */
export const SESSION_SNAPSHOT_STORAGE_KEY = 'qv-review-session';
/** A parked session older than this is dropped and a fresh one is built. */
export const SESSION_SNAPSHOT_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export interface SessionSnapshot {
  /** Identifies the source (due / word list / collection) the session was built for. */
  sourceKey: string;
  items: SessionItem[];
  /** The card to show on return. */
  position: number;
  answers: { wordId: string; rating: Rating; elapsedMs: number }[];
  repeats: [string, number][];
  savedAt: number;
}

export function saveSessionSnapshot(snapshot: Omit<SessionSnapshot, 'savedAt'>, now: number = Date.now()): void {
  try {
    window.sessionStorage.setItem(SESSION_SNAPSHOT_STORAGE_KEY, JSON.stringify({ ...snapshot, savedAt: now }));
  } catch {
    // Storage blocked: the learner starts a fresh session on return (their answers are already recorded).
  }
}

/** The parked session for `sourceKey`, removed from storage; null when there is none or it is stale. */
export function takeSessionSnapshot(sourceKey: string, now: number = Date.now()): SessionSnapshot | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as SessionSnapshot;
    if (snap?.sourceKey !== sourceKey) return null;
    window.sessionStorage.removeItem(SESSION_SNAPSHOT_STORAGE_KEY);
    if (!Array.isArray(snap.items) || typeof snap.position !== 'number') return null;
    if (!(now - snap.savedAt <= SESSION_SNAPSHOT_MAX_AGE_MS)) return null;
    return snap;
  } catch {
    return null;
  }
}

/** "in 10 min", "in 3 hours" or "now". */
export function formatUntil(date: Date, now: Date = new Date()): string {
  const ms = date.getTime() - now.getTime();
  if (ms <= 0) return 'now';
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  if (ms < HOUR) return `in ${Math.max(1, Math.round(ms / MIN))} min`;
  if (ms < DAY) {
    const h = Math.round(ms / HOUR);
    return `in ${h} hour${h === 1 ? '' : 's'}`;
  }
  const d = Math.round(ms / DAY);
  return `in ${d} day${d === 1 ? '' : 's'}`;
}
