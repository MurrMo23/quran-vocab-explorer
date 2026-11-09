// Review-funnel analytics derived inside the progress engine, so they work for every review UI
// (the Review page, the listening exercise and older hooks) without page wiring.
//
//   review_rating   every recorded review (after review_start for the first one), with the card
//                   mode when the UI passes one.
//   review_start    the first review of a session. A session ends after SESSION_IDLE_MS without
//                   reviews, a switch between review and listening, a newer planned queue (the
//                   learner picked another source), or completion. The Review page records Yes / No
//                   and multiple-choice answers as source 'quiz' and others as 'practice', so those
//                   two sources share one session. card_count is the size of the most recent planned
//                   queue (notePlan: the Review page and buildSession()) when it contains the first
//                   reviewed word (omitted otherwise, e.g. quizzes). source is the plan's label when
//                   there is one (e.g. 'review_due', 'review_words'), else the ReviewSource.
//   review_complete when every word of that planned queue has been reviewed at least once in the
//                   session (re-queued "again" repeats are not waited for; those trailing repeats
//                   are absorbed into the finished session instead of starting a new one).
import { track, type ReviewCardMode } from '@/lib/analytics';
import type { Rating, ReviewSource } from './types';

type SessionGroup = 'review' | 'listening';
const groupOf = (source: ReviewSource): SessionGroup => (source === 'listening' ? 'listening' : 'review');

const SESSION_IDLE_MS = 30 * 60_000;

interface ActiveSession {
  group: SessionGroup;
  label: string;
  startedAt: number;
  lastAt: number;
  planned: Set<string> | null;
  reviewedPlanned: Set<string>;
  cards: number;
  again: number;
  againWords: Set<string>;
}

export class ReviewSessionTracker {
  private lastPlan: { ids: readonly string[]; at: number; label?: string } | null = null;
  private active: ActiveSession | null = null;
  /** After completion: re-queued "again" words still being answered in the finished session. */
  private tail: { group: SessionGroup; label: string; words: Set<string>; lastAt: number } | null = null;

  /** Remember the queue a review UI is about to present; label names it in review_start. */
  notePlan(ids: readonly string[], label?: string, at = Date.now()): void {
    this.lastPlan = { ids, at, label };
  }

  record(wordId: string, rating: Rating, source: ReviewSource, at = Date.now(), mode?: ReviewCardMode): void {
    try {
      const group = groupOf(source);
      const plan = this.lastPlan;
      const planFits = !!plan && at - plan.at <= SESSION_IDLE_MS && plan.ids.includes(wordId);
      const tail = this.tail;
      if (
        !this.active &&
        tail &&
        tail.group === group &&
        tail.words.has(wordId) &&
        at - tail.lastAt <= SESSION_IDLE_MS &&
        !(planFits && plan.at > tail.lastAt)
      ) {
        tail.lastAt = at;
        track('review_rating', { rating, source: tail.label, mode });
        return;
      }
      this.tail = null;
      let s = this.active;
      const newerPlan = !!s && planFits && plan.at > s.startedAt && !s.planned?.has(wordId);
      if (!s || s.group !== group || at - s.lastAt > SESSION_IDLE_MS || newerPlan) {
        s = {
          group,
          label: (planFits && plan.label) || source,
          startedAt: at,
          lastAt: at,
          planned: planFits ? new Set(plan.ids) : null,
          reviewedPlanned: new Set(),
          cards: 0,
          again: 0,
          againWords: new Set(),
        };
        this.active = s;
        track('review_start', { source: s.label, card_count: s.planned?.size, mode });
      }
      track('review_rating', { rating, source: s.label, mode });
      s.lastAt = at;
      s.cards++;
      if (rating === 'again') {
        s.again++;
        s.againWords.add(wordId);
      }
      if (s.planned?.has(wordId)) s.reviewedPlanned.add(wordId);
      if (s.planned && s.reviewedPlanned.size >= s.planned.size) {
        track('review_complete', { source: s.label, cards: s.cards, again_count: s.again });
        this.active = null;
        this.lastPlan = null;
        this.tail = s.againWords.size > 0 ? { group, label: s.label, words: s.againWords, lastAt: at } : null;
      }
    } catch {
      // Analytics must never affect reviews.
    }
  }
}
