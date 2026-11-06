// Compatibility wrapper over the FSRS progress engine (src/lib/progress).
// Kept so existing callers compile; new code should use useProgress() directly.
import { useCallback } from 'react';
import { useProgress } from '@/lib/progress';
import type { Word } from '@/utils/vocabulary-types';

export const useSpacedRepetition = (_pathId?: string) => {
  const { recordReview, buildSession, stats, cards, loading } = useProgress();

  /** Records a review (success -> 'good', failure -> 'again'). The path id is no longer used. */
  const updateWordProgress = useCallback(
    async (word: Word, success: boolean, _pathId?: string) =>
      recordReview(word.id, success ? 'good' : 'again', 'practice'),
    [recordReview],
  );

  /** Due words from `allWords` first, topped up with new ones (at least 5 when available). */
  const getWordsForReview = useCallback(
    (_pathId: string, allWords: Word[]): Word[] => {
      const byId = new Map(allWords.map((w) => [w.id, w]));
      const ids = buildSession(allWords.map((w) => w.id), Math.max(5, allWords.length));
      return ids.map((id) => byId.get(id)).filter((w): w is Word => !!w);
    },
    [buildSession],
  );

  /** Streaks are derived from review history; this just returns the current value. */
  const updateUserStreak = useCallback(() => stats.currentStreak, [stats.currentStreak]);

  const getUserProgress = useCallback(() => {
    let learningWords = 0;
    for (const card of cards.values()) {
      if (card.lastReview && card.stability < 21) learningWords++;
    }
    const totalWords = stats.wordsStarted;
    const masteredWords = stats.wordsMastered;
    return {
      streak: stats.currentStreak,
      totalWords,
      masteredWords,
      learningWords,
      newWords: 0,
      mastery: totalWords ? Math.round((masteredWords / totalWords) * 100) : 0,
    };
  }, [cards, stats]);

  return {
    updateWordProgress,
    getWordsForReview,
    updateUserStreak,
    getUserProgress,
    streak: stats.currentStreak,
    loading,
  };
};
