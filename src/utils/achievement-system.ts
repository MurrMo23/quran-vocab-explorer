// Achievements derived purely from the learner's real progress (src/lib/progress).
// Nothing is stored separately: an achievement is unlocked exactly when the stats say so,
// so it can never drift from the review history.
import type { ProgressStats, ReviewLog } from '@/lib/progress/types';

export interface DerivedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Current value of the measured quantity, capped at `target`. */
  progress: number;
  target: number;
  unlocked: boolean;
}

interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  measure: (stats: ProgressStats, logs: readonly ReviewLog[]) => number;
}

const DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_review',
    name: 'First Steps',
    description: 'Complete your first review',
    icon: '🌱',
    target: 1,
    measure: (_s, logs) => logs.length,
  },
  {
    id: 'first_mastered',
    name: 'Firmly Rooted',
    description: 'Master your first word (remembered for 21+ days)',
    icon: '🌳',
    target: 1,
    measure: (s) => s.wordsMastered,
  },
  {
    id: 'streak_7',
    name: 'Week of Devotion',
    description: 'Review on 7 days in a row',
    icon: '🔥',
    target: 7,
    measure: (s) => s.longestStreak,
  },
  {
    id: 'words_50',
    name: 'Growing Vocabulary',
    description: 'Start learning 50 words',
    icon: '📚',
    target: 50,
    measure: (s) => s.wordsStarted,
  },
  {
    id: 'reviews_100',
    name: 'Steady Practice',
    description: 'Complete 100 reviews',
    icon: '🎯',
    target: 100,
    measure: (_s, logs) => logs.length,
  },
  {
    id: 'mastered_25',
    name: 'Deep Roots',
    description: 'Master 25 words',
    icon: '🏆',
    target: 25,
    measure: (s) => s.wordsMastered,
  },
  {
    id: 'streak_30',
    name: 'Month of Consistency',
    description: 'Review on 30 days in a row',
    icon: '🌙',
    target: 30,
    measure: (s) => s.longestStreak,
  },
];

export const deriveAchievements = (
  stats: ProgressStats,
  logs: readonly ReviewLog[],
): DerivedAchievement[] =>
  DEFINITIONS.map(({ measure, ...def }) => {
    const value = Math.max(0, measure(stats, logs));
    return { ...def, progress: Math.min(value, def.target), unlocked: value >= def.target };
  });
