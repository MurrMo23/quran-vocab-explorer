// Goal-based onboarding: "What do you want to understand?" Each goal is an ordered word list.
// The chosen goal is remembered in this browser; "Due & new" on /review then introduces new words
// from the goal list first (see preferredNew in src/components/review/review-session.ts).
import {
  juzAmmaWordIds,
  salahSurahWordIds,
  topQuranWordIds,
  uniqueWordIds,
} from '@/utils/word-lists';

export type LearningGoalId = 'salah' | 'juz-amma' | 'top-300';

export interface LearningGoal {
  id: LearningGoalId;
  title: string;
  description: string;
}

export const LEARNING_GOALS: readonly LearningGoal[] = [
  {
    id: 'salah',
    title: 'The words in my salah',
    description: 'Al-Fatiha, Al-Ikhlas and the phrases you say in every prayer.',
  },
  {
    id: 'juz-amma',
    title: 'Juz Amma',
    description: 'The short surahs 78–114, most frequent words first.',
  },
  {
    id: 'top-300',
    title: 'The top 300 Quranic words',
    description: 'The most frequent words in the whole Quran.',
  },
];

/**
 * Phrases said in every prayer that the site has as entries: the takbir, "subhana rabbiya al-azim"
 * (bowing), "subhan Allah" and the testimony in the tashahhud. Ids without a word are skipped.
 */
const PRAYER_PHRASE_IDS = ['allahu-akbar', 'subhan-allah', 'al-azeem', 'la-ilaha-illa-allah'];

const TOP_N = 300;
const cache = new Map<LearningGoalId, string[]>();

/** The goal's words in learning order. */
export function goalWordIds(goal: LearningGoalId): string[] {
  const hit = cache.get(goal);
  if (hit) return hit;
  let ids: string[];
  if (goal === 'salah') {
    ids = uniqueWordIds([...salahSurahWordIds(1), ...salahSurahWordIds(112), ...PRAYER_PHRASE_IDS]);
  } else if (goal === 'juz-amma') {
    ids = juzAmmaWordIds();
  } else {
    ids = topQuranWordIds(TOP_N);
  }
  cache.set(goal, ids);
  return ids;
}

export const isLearningGoalId = (v: unknown): v is LearningGoalId =>
  typeof v === 'string' && LEARNING_GOALS.some((g) => g.id === v);

export const GOAL_STORAGE_KEY = 'qv-learning-goal';
export const GOAL_CHOOSER_DISMISSED_KEY = 'qv-goal-chooser-dismissed';
/** Fired on window when the goal changes in this tab. */
export const GOAL_CHANGE_EVENT = 'qv-learning-goal-change';

export function readLearningGoal(): LearningGoalId | null {
  try {
    if (typeof window === 'undefined') return null;
    const v = window.localStorage.getItem(GOAL_STORAGE_KEY);
    return isLearningGoalId(v) ? v : null;
  } catch {
    return null;
  }
}

export function writeLearningGoal(goal: LearningGoalId | null): void {
  try {
    if (goal) window.localStorage.setItem(GOAL_STORAGE_KEY, goal);
    else window.localStorage.removeItem(GOAL_STORAGE_KEY);
  } catch {
    // Storage blocked: the goal lasts for this visit only.
  }
  try {
    window.dispatchEvent(new Event(GOAL_CHANGE_EVENT));
  } catch {
    // ignore
  }
}

/** True when the chooser should not be offered (dismissed, or a goal was already picked). */
export function isGoalChooserDone(): boolean {
  try {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(GOAL_CHOOSER_DISMISSED_KEY) === '1' || readLearningGoal() !== null;
  } catch {
    return false;
  }
}

export function dismissGoalChooser(): void {
  try {
    window.localStorage.setItem(GOAL_CHOOSER_DISMISSED_KEY, '1');
  } catch {
    // ignore
  }
}

/** Words from `ids` the learner has not started yet, in order, followed by the rest. */
export function firstUnstarted(ids: readonly string[], isStarted: (id: string) => boolean, n: number): string[] {
  const fresh = ids.filter((id) => !isStarted(id));
  return (fresh.length > 0 ? fresh : ids).slice(0, n);
}
