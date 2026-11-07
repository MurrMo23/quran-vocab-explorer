// Review-funnel analytics derived inside the progress engine, so they work for every review UI
// (Practice, Quiz, flashcards, listening, and the merged Review page) without page wiring.
//
//   review_rating   every recorded review.
//   review_start    the first review of a session. A session is one source, ending after
//                   SESSION_IDLE_MS without reviews, a source switch, or completion.
//                   card_count is the size of the most recent buildSession() queue when that queue
//                   contains the first reviewed word (omitted otherwise, e.g. quizzes).
//   review_complete when every word of that planned queue has been reviewed at least once in the
//                   session (re-queued "again" repeats are not waited for; those trailing repeats
//                   are absorbed into the finished session instead of starting a new one).
import { track } from '@/lib/analytics';
import type { Rating, ReviewSource } from './types';

const SESSION_IDLE_MS = 30 * 60_000;

interface ActiveSession {
  source: ReviewSource;
  lastAt: number;
  planned: Set<string> | null;
  reviewedPlanned: Set<string>;
  cards: number;
  again: number;
  againWords: Set<string>;
}

export class ReviewSessionTracker {
  private lastPlan: { ids: readonly string[]; at: number } | null = null;
  private active: ActiveSession | null = null;
  /** After completion: re-queued "again" words still being answered in the finished session. */
  private tail: { source: ReviewSource; words: Set<string>; lastAt: number } | null = null;

  /** Remember the queue a review UI is about to present. */
  notePlan(ids: readonly string[]): void {
    this.lastPlan = { ids, at: Date.now() };
  }

  record(wordId: string, rating: Rating, source: ReviewSource, at = Date.now()): void {
    try {
      track('review_rating', { rating });
      const tail = this.tail;
      if (!this.active && tail && tail.source === source && tail.words.has(wordId) && at - tail.lastAt <= SESSION_IDLE_MS) {
        tail.lastAt = at;
        return;
      }
      this.tail = null;
      let s = this.active;
      if (!s || s.source !== source || at - s.lastAt > SESSION_IDLE_MS) {
        const plan = this.lastPlan;
        const usePlan = plan && at - plan.at <= SESSION_IDLE_MS && plan.ids.includes(wordId);
        s = {
          source,
          lastAt: at,
          planned: usePlan ? new Set(plan.ids) : null,
          reviewedPlanned: new Set(),
          cards: 0,
          again: 0,
          againWords: new Set(),
        };
        this.active = s;
        track('review_start', s.planned ? { source, card_count: s.planned.size } : { source });
      }
      s.lastAt = at;
      s.cards++;
      if (rating === 'again') {
        s.again++;
        s.againWords.add(wordId);
      }
      if (s.planned?.has(wordId)) s.reviewedPlanned.add(wordId);
      if (s.planned && s.reviewedPlanned.size >= s.planned.size) {
        track('review_complete', { cards: s.cards, again_count: s.again });
        this.active = null;
        this.lastPlan = null;
        this.tail = s.againWords.size > 0 ? { source, words: s.againWords, lastAt: at } : null;
      }
    } catch {
      // Analytics must never affect reviews.
    }
  }
}
