// Pure helpers that derive display data from the progress engine's cards and logs.
// Everything here is computed from real review history; nothing is estimated or invented.
import type { CardState, DailyCount, ReviewLog } from '@/lib/progress/types';
import { getPublishedCollections, getWordsByCollection } from '@/utils/vocabulary';

/** A word counts as mastered once its FSRS stability reaches this many days. */
export const MASTERY_STABILITY_DAYS = 21;

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD. */
export const localDateKey = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "Mon", "Tue"... for a YYYY-MM-DD key. */
export const weekdayLabel = (key: string): string => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short' });
};

/** "Nov 6" for a YYYY-MM-DD key. */
export const shortDateLabel = (key: string): string => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const isStarted = (card: CardState): boolean => card.reps > 0 || card.lastReview !== null;

export const isMastered = (card: CardState): boolean =>
  isStarted(card) && card.stability >= MASTERY_STABILITY_DAYS;

/** Consecutive local date keys, oldest first, ending today (offset 0) or later (negative start). */
const dayKeys = (days: number, startOffset: number): string[] => {
  const keys: string[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + startOffset + i);
    keys.push(localDateKey(d));
  }
  return keys;
};

/** Reviews per local day for the last `days` days, oldest first, zero-filled. */
export const reviewsPerDay = (logs: readonly ReviewLog[], days: number): DailyCount[] => {
  const keys = dayKeys(days, -(days - 1));
  const counts = new Map(keys.map((k) => [k, 0]));
  for (const log of logs) {
    const key = localDateKey(new Date(log.reviewedAt));
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return keys.map((date) => ({ date, count: counts.get(date) ?? 0 }));
};

export interface DailyAccuracy {
  date: string;
  reviews: number;
  /** Percent of reviews not rated 'again' (0-100); null on days without reviews. */
  accuracy: number | null;
}

export const accuracyPerDay = (logs: readonly ReviewLog[], days: number): DailyAccuracy[] => {
  const keys = dayKeys(days, -(days - 1));
  const totals = new Map(keys.map((k) => [k, { total: 0, ok: 0 }]));
  for (const log of logs) {
    const bucket = totals.get(localDateKey(new Date(log.reviewedAt)));
    if (!bucket) continue;
    bucket.total += 1;
    if (log.rating !== 'again') bucket.ok += 1;
  }
  return keys.map((date) => {
    const { total, ok } = totals.get(date)!;
    return { date, reviews: total, accuracy: total ? Math.round((ok / total) * 100) : null };
  });
};

export interface HardWord {
  wordId: string;
  again: number;
  total: number;
}

/** Words with the most 'again' ratings across all logs. */
export const hardestWords = (logs: readonly ReviewLog[], limit = 10): HardWord[] => {
  const byWord = new Map<string, HardWord>();
  for (const log of logs) {
    const entry = byWord.get(log.wordId) ?? { wordId: log.wordId, again: 0, total: 0 };
    entry.total += 1;
    if (log.rating === 'again') entry.again += 1;
    byWord.set(log.wordId, entry);
  }
  return [...byWord.values()]
    .filter((w) => w.again > 0)
    .sort((a, b) => b.again - a.again || b.again / b.total - a.again / a.total)
    .slice(0, limit);
};

/** Started cards falling due on each of the next `days` local days. Overdue cards count toward today. */
export const upcomingReviews = (cards: ReadonlyMap<string, CardState>, days: number): DailyCount[] => {
  const keys = dayKeys(days, 0);
  const counts = new Map(keys.map((k) => [k, 0]));
  const todayKey = keys[0];
  cards.forEach((card) => {
    if (!isStarted(card)) return;
    let key = localDateKey(new Date(card.due));
    if (key < todayKey) key = todayKey;
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return keys.map((date) => ({ date, count: counts.get(date) ?? 0 }));
};

export interface CollectionProgressRow {
  id: string;
  name: string;
  total: number;
  started: number;
  mastered: number;
}

/** Started / mastered share for every collection that has words. */
export const collectionProgress = (cards: ReadonlyMap<string, CardState>): CollectionProgressRow[] => {
  const rows: CollectionProgressRow[] = [];
  for (const collection of getPublishedCollections()) {
    const words = getWordsByCollection(collection.id);
    if (words.length === 0) continue;
    let started = 0;
    let mastered = 0;
    for (const word of words) {
      const card = cards.get(word.id);
      if (!card || !isStarted(card)) continue;
      started += 1;
      if (isMastered(card)) mastered += 1;
    }
    rows.push({ id: collection.id, name: collection.name, total: words.length, started, mastered });
  }
  return rows;
};

export const percent = (part: number, whole: number): number =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;
