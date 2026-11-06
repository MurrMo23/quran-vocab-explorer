// Compatibility wrapper over the FSRS progress engine (src/lib/progress).
// Exposes the learner's cards in the legacy UserWordProgress shape. New code should use
// useProgress() directly.
import { useCallback, useMemo } from 'react';
import { useProgress, MASTERED_STABILITY_DAYS, type CardState } from '@/lib/progress';

export interface UserWordProgress {
  id: string;
  user_id: string;
  word_id: string;
  collection_id: string;
  level: number;
  next_review: string;
  last_reviewed?: string;
  review_count: number;
  success_streak: number;
  difficulty_modifier: number;
  pronunciation_mastery: number;
  contextual_mastery: number;
  created_at: string;
  updated_at: string;
}

/** Legacy 0-7 level derived from FSRS stability (days). */
const levelFromStability = (stability: number): number => {
  const thresholds = [1, 3, 7, 14, MASTERED_STABILITY_DAYS, 60, 180];
  let level = 0;
  for (const t of thresholds) if (stability >= t) level++;
  return level;
};

const toLegacy = (card: CardState, userId: string): UserWordProgress => ({
  id: `${userId}:${card.wordId}`,
  user_id: userId,
  word_id: card.wordId,
  collection_id: 'general',
  level: levelFromStability(card.stability),
  next_review: card.due,
  last_reviewed: card.lastReview ?? undefined,
  review_count: card.reps,
  success_streak: 0,
  difficulty_modifier: 1,
  pronunciation_mastery: 0,
  contextual_mastery: 0,
  created_at: card.lastReview ?? card.due,
  updated_at: card.lastReview ?? card.due,
});

export const useWordProgress = (wordId?: string) => {
  const { cards, loading, userId, recordReview, refresh } = useProgress();

  const progress = useMemo(() => {
    const owner = userId ?? 'guest';
    const list = wordId ? [cards.get(wordId)].filter((c): c is CardState => !!c) : [...cards.values()];
    return list.map((c) => toLegacy(c, owner));
  }, [cards, userId, wordId]);

  /**
   * Legacy update API. Scheduling is owned by FSRS now, so arbitrary field updates are not
   * supported; a `review_count` increment is treated as a successful review.
   */
  const updateProgress = useCallback(
    async (id: string, _collectionId: string, updates: Partial<UserWordProgress>) => {
      if (updates.review_count === undefined && updates.success_streak === undefined) {
        const card = cards.get(id);
        return card ? toLegacy(card, userId ?? 'guest') : null;
      }
      const success = updates.success_streak === undefined || updates.success_streak > 0;
      const card = await recordReview(id, success ? 'good' : 'again', 'practice');
      return toLegacy(card, userId ?? 'guest');
    },
    [cards, recordReview, userId],
  );

  return { progress, loading, updateProgress, refetch: refresh };
};
