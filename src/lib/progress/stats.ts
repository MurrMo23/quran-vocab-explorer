// Pure functions computing ProgressStats. All day bucketing uses the learner's LOCAL calendar.
import type { CardState, DailyCount, ProgressStats, ReviewLog } from './types';
import { MASTERED_STABILITY_DAYS } from './scheduler';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date YYYY-MM-DD for a Date. */
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local date key `offset` calendar days from `date` (negative = earlier). DST-safe. */
export function shiftLocalDateKey(date: Date, offset: number): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset, 12);
  return localDateKey(d);
}

/** Calendar days between two local date keys (b - a). */
function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** Review counts per local day. */
export function countByLocalDay(logs: readonly ReviewLog[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const log of logs) {
    const t = new Date(log.reviewedAt);
    if (Number.isNaN(t.getTime())) continue;
    const key = localDateKey(t);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/** Last `days` local days ending today, oldest first, zero-filled. */
export function reviewsLastNDays(logs: readonly ReviewLog[], days: number, now: Date = new Date()): DailyCount[] {
  const counts = countByLocalDay(logs);
  const out: DailyCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = shiftLocalDateKey(now, -i);
    out.push({ date, count: counts.get(date) ?? 0 });
  }
  return out;
}

/**
 * Current streak: consecutive local days with a review ending today, or ending yesterday when
 * nothing has been reviewed yet today (the streak is still alive until today ends).
 */
export function computeCurrentStreak(activeDays: ReadonlySet<string>, now: Date = new Date()): number {
  let offset = activeDays.has(localDateKey(now)) ? 0 : -1;
  let streak = 0;
  while (activeDays.has(shiftLocalDateKey(now, offset))) {
    streak++;
    offset--;
  }
  return streak;
}

export function computeLongestStreak(activeDays: ReadonlySet<string>): number {
  const sorted = [...activeDays].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    run = prev !== null && dayDiff(prev, day) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = day;
  }
  return longest;
}

/** Started words (lastReview set) whose due time has passed. */
export function isDue(card: CardState, now: Date = new Date()): boolean {
  return card.lastReview !== null && new Date(card.due).getTime() <= now.getTime();
}

export function computeStats(
  cards: ReadonlyMap<string, CardState> | readonly CardState[],
  logs: readonly ReviewLog[],
  now: Date = new Date(),
): ProgressStats {
  const list = Array.isArray(cards) ? (cards as readonly CardState[]) : [...(cards as ReadonlyMap<string, CardState>).values()];

  let wordsStarted = 0;
  let wordsMastered = 0;
  let dueNow = 0;
  for (const card of list) {
    if (card.lastReview === null && card.reps === 0) continue;
    wordsStarted++;
    if (card.stability >= MASTERED_STABILITY_DAYS) wordsMastered++;
    if (isDue(card, now)) dueNow++;
  }

  const counts = countByLocalDay(logs);
  // Card lastReview dates also count as active days, so streaks survive the 90-day log window
  // for the most recent day of each card.
  const activeDays = new Set(counts.keys());
  for (const card of list) {
    if (card.lastReview) {
      const t = new Date(card.lastReview);
      if (!Number.isNaN(t.getTime())) activeDays.add(localDateKey(t));
    }
  }

  const today = localDateKey(now);
  const reviewsLast7Days = reviewsLastNDays(logs, 7, now);

  const weekStart = reviewsLast7Days[0].date;
  let weekTotal = 0;
  let weekCorrect = 0;
  for (const log of logs) {
    const t = new Date(log.reviewedAt);
    if (Number.isNaN(t.getTime())) continue;
    const key = localDateKey(t);
    if (key < weekStart || key > today) continue;
    weekTotal++;
    if (log.rating !== 'again') weekCorrect++;
  }

  return {
    wordsStarted,
    wordsMastered,
    dueNow,
    reviewsToday: counts.get(today) ?? 0,
    reviewsLast7Days,
    currentStreak: computeCurrentStreak(activeDays, now),
    longestStreak: computeLongestStreak(activeDays),
    accuracy7d: weekTotal > 0 ? weekCorrect / weekTotal : null,
  };
}

export const EMPTY_STATS: ProgressStats = computeStats([], []);
