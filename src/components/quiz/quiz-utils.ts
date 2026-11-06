// Shared quiz types and helpers (question building, answer checking, results).
import type { Word } from '@/utils/vocabulary-types';
import type { CardState } from '@/lib/progress';

export type QuestionType = 'multiple-choice' | 'fill-in-blank' | 'arabic-to-meaning' | 'meaning-to-arabic';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'mixed';

export interface QuizSettings {
  wordCount: number;
  difficulty: DifficultyLevel;
  collectionId?: string;
  questionTypes: QuestionType[];
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  word: Word;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  /** Seconds taken to answer. */
  timeSpent?: number;
  isCorrect?: boolean;
}

/** A question as shown by components/quiz/QuizQuestion. */
export interface TypedQuizQuestion extends QuizQuestion {
  type: QuestionType;
  question: string;
}

export interface QuizResult {
  score: number;
  accuracy: number;
  /** Seconds. */
  totalTime: number;
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTimePerQuestion: number;
  difficultyBreakdown: Record<string, { correct: number; total: number }>;
  weakAreas: string[];
  achievements: never[];
  nextRecommendations: QuestionType[];
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Up to `n` random distinct values from `pool`, excluding `exclude`. */
function sampleDistinct(pool: readonly string[], n: number, exclude: string): string[] {
  const seen = new Set<string>([normalize(exclude)]);
  const out: string[] = [];
  for (const v of shuffle(pool)) {
    if (out.length >= n) break;
    const key = normalize(v);
    if (!v || seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/^(the|a|an|to)\s+/, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * True when `answer` matches `correct`. For typed answers, any of the comma/slash/semicolon
 * separated alternatives in the stored meaning is accepted ("Work, deed" accepts "deed").
 */
export function isAnswerCorrect(answer: string, correct: string, typed = false): boolean {
  if (!answer.trim()) return false;
  if (!typed) return answer.trim() === correct.trim();
  const given = normalize(answer);
  if (!given) return false;
  const alternatives = [correct, ...correct.split(/[,/;]| or /i)].map(normalize).filter(Boolean);
  return alternatives.includes(given);
}

const QUESTION_TEXT: Record<QuestionType, (w: Word) => string> = {
  'multiple-choice': (w) => `What does "${w.arabic}" mean?`,
  'arabic-to-meaning': (w) => `Choose the meaning of ${w.arabic}`,
  'meaning-to-arabic': (w) => `Which Arabic word means "${w.meaning}"?`,
  'fill-in-blank': (w) => `Type the meaning of ${w.arabic}`,
};

/** Build one question of `type` for `word`, with distractors drawn from `pool`. */
export function buildQuestion(word: Word, type: QuestionType, pool: readonly Word[], index: number): TypedQuizQuestion {
  const base = { id: `q${index}-${word.id}-${type}`, word, type, question: QUESTION_TEXT[type](word) };
  if (type === 'fill-in-blank') {
    return { ...base, options: [], correctAnswer: word.meaning };
  }
  const arabic = type === 'meaning-to-arabic';
  const correct = arabic ? word.arabic : word.meaning;
  const distractors = sampleDistinct(
    pool.filter((w) => w.id !== word.id).map((w) => (arabic ? w.arabic : w.meaning)),
    3,
    correct,
  );
  return { ...base, options: shuffle([correct, ...distractors]), correctAnswer: correct };
}

export interface PickOptions {
  /** Put words due for review first. */
  dueFirst?: boolean;
  /** Prefer words the learner has struggled with (lapses, low stability). */
  weakFirst?: boolean;
  cards?: ReadonlyMap<string, CardState>;
  now?: Date;
}

/** Choose `count` words from `pool`, optionally prioritising due and weak words; rest random. */
export function pickQuizWords(pool: readonly Word[], count: number, opts: PickOptions = {}): Word[] {
  const { cards, now = new Date() } = opts;
  const chosen: Word[] = [];
  const taken = new Set<string>();
  const take = (w: Word) => {
    if (chosen.length < count && !taken.has(w.id)) {
      taken.add(w.id);
      chosen.push(w);
    }
  };
  if (cards && opts.dueFirst) {
    pool
      .filter((w) => {
        const c = cards.get(w.id);
        return c?.lastReview && new Date(c.due).getTime() <= now.getTime();
      })
      .sort((a, b) => new Date(cards.get(a.id)!.due).getTime() - new Date(cards.get(b.id)!.due).getTime())
      .forEach(take);
  }
  if (cards && opts.weakFirst) {
    pool
      .filter((w) => {
        const c = cards.get(w.id);
        return c?.lastReview && (c.lapses > 0 || c.status === 'relearning' || c.stability < 3);
      })
      .sort((a, b) => {
        const ca = cards.get(a.id)!;
        const cb = cards.get(b.id)!;
        return cb.lapses - ca.lapses || ca.stability - cb.stability;
      })
      .forEach(take);
  }
  shuffle(pool).forEach(take);
  // Keep the prioritised words but mix their order with the rest.
  return shuffle(chosen);
}

/** Build a quiz from real answers. `startedAt`/`endedAt` in ms. */
export function summarizeQuiz(questions: readonly QuizQuestion[], startedAt: number, endedAt: number): QuizResult {
  const answered = questions.filter((q) => q.userAnswer !== undefined);
  const correctAnswers = answered.filter((q) => q.isCorrect).length;
  const total = answered.length;
  const totalTime = Math.max(0, (endedAt - startedAt) / 1000);

  const difficultyBreakdown: Record<string, { correct: number; total: number }> = {};
  for (const q of answered) {
    const level = q.word.level ?? 'unknown';
    difficultyBreakdown[level] ??= { correct: 0, total: 0 };
    difficultyBreakdown[level].total++;
    if (q.isCorrect) difficultyBreakdown[level].correct++;
  }
  const weakAreas = Object.entries(difficultyBreakdown)
    .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.6)
    .map(([level]) => level);

  const accuracy = total > 0 ? (correctAnswers / total) * 100 : 0;
  return {
    score: Math.round(accuracy),
    accuracy,
    totalTime,
    totalQuestions: questions.length,
    questionsAnswered: total,
    correctAnswers,
    incorrectAnswers: total - correctAnswers,
    averageTimePerQuestion: total > 0 ? totalTime / total : 0,
    difficultyBreakdown,
    weakAreas,
    achievements: [],
    nextRecommendations: [],
  };
}
