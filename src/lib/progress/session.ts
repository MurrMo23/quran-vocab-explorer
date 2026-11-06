// Pure queue-building helpers used by the provider (and testable without React).
import type { CardState } from './types';
import { isDue } from './stats';

const byDue = (a: CardState, b: CardState) => new Date(a.due).getTime() - new Date(b.due).getTime();

/** Started words due now, most overdue first. When `pool` is given, only words in it. */
export function dueWordIds(
  cards: ReadonlyMap<string, CardState>,
  now: Date = new Date(),
  pool?: readonly string[],
  limit?: number,
): string[] {
  const allowed = pool && pool.length > 0 ? new Set(pool) : null;
  const due: CardState[] = [];
  for (const card of cards.values()) {
    if (allowed && !allowed.has(card.wordId)) continue;
    if (isDue(card, now)) due.push(card);
  }
  due.sort(byDue);
  const ids = due.map((c) => c.wordId);
  return limit === undefined ? ids : ids.slice(0, Math.max(0, limit));
}

/** Ids from `pool` never reviewed, pool order, de-duplicated. */
export function newWordIds(cards: ReadonlyMap<string, CardState>, pool: readonly string[], limit?: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const max = limit === undefined ? Infinity : Math.max(0, limit);
  for (const id of pool) {
    if (out.length >= max) break;
    if (seen.has(id)) continue;
    seen.add(id);
    const card = cards.get(id);
    if (!card || (card.lastReview === null && card.reps === 0)) out.push(id);
  }
  return out;
}

/**
 * A practice queue of at most `size` words: due words first (restricted to `pool` when it is
 * non-empty, most overdue first), then new words from `pool` in pool order.
 */
export function buildSessionQueue(
  cards: ReadonlyMap<string, CardState>,
  pool: readonly string[],
  size: number,
  now: Date = new Date(),
): string[] {
  const max = Math.max(0, Math.floor(size));
  const queue = dueWordIds(cards, now, pool, max);
  if (queue.length < max) {
    const taken = new Set(queue);
    for (const id of newWordIds(cards, pool)) {
      if (queue.length >= max) break;
      if (!taken.has(id)) {
        queue.push(id);
        taken.add(id);
      }
    }
  }
  return queue;
}

/** Started words from `pool` that are not yet due, soonest first ("review ahead"). */
export function upcomingWordIds(
  cards: ReadonlyMap<string, CardState>,
  pool: readonly string[],
  limit: number,
  now: Date = new Date(),
): string[] {
  const out: CardState[] = [];
  const seen = new Set<string>();
  for (const id of pool) {
    if (seen.has(id)) continue;
    seen.add(id);
    const card = cards.get(id);
    if (card && card.lastReview !== null && !isDue(card, now)) out.push(card);
  }
  out.sort(byDue);
  return out.slice(0, Math.max(0, limit)).map((c) => c.wordId);
}
