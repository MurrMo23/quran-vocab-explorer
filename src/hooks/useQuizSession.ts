// Quiz history (quiz_sessions) for signed-in learners. Word-level progress is recorded separately
// through useProgress().recordReview; this only keeps a per-quiz summary row. Guests get no-ops.
// All writes are best-effort: a failure is logged and never interrupts the quiz.
import { useCallback, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import type { QuizConfiguration, QuizMode, DifficultyLevel, QuestionType, QuizSession } from '@/utils/quiz-types';

/** Fields of a finished quiz written back to quiz_sessions. */
export interface QuizSessionSummary {
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  /** Seconds. */
  totalTime: number;
  averageTimePerQuestion: number;
}

export const useQuizSession = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(false);

  const startQuizSession = useCallback(
    async (config: QuizConfiguration): Promise<string | null> => {
      if (!userId) return null;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('quiz_sessions')
          .insert({
            user_id: userId,
            quiz_type: 'vocabulary',
            mode: config.mode,
            collection_id: config.collectionId ?? null,
            difficulty: config.difficulty,
            total_questions: config.questionCount,
            question_types: config.questionTypes,
            adaptive_difficulty_used: false,
            spaced_repetition_words: [],
          })
          .select()
          .single();
        if (error) throw error;
        setCurrentSession({
          id: data.id,
          user_id: data.user_id,
          quiz_type: data.quiz_type,
          mode: data.mode as QuizMode,
          collection_id: data.collection_id ?? undefined,
          difficulty: data.difficulty as DifficultyLevel,
          total_questions: data.total_questions,
          correct_answers: data.correct_answers,
          incorrect_answers: data.incorrect_answers,
          accuracy_percentage: data.accuracy_percentage,
          total_time_seconds: data.total_time_seconds,
          average_time_per_question: data.average_time_per_question ?? undefined,
          question_types: (data.question_types ?? []) as QuestionType[],
          adaptive_difficulty_used: data.adaptive_difficulty_used ?? false,
          spaced_repetition_words: data.spaced_repetition_words ?? [],
          started_at: data.started_at,
          completed_at: data.completed_at ?? undefined,
          created_at: data.created_at,
        });
        return data.id;
      } catch (error) {
        console.warn('[quiz] could not record quiz session:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const completeQuizSession = useCallback(
    async (sessionId: string, result: QuizSessionSummary): Promise<boolean> => {
      if (!userId) return false;
      try {
        const { error } = await supabase
          .from('quiz_sessions')
          .update({
            completed_at: new Date().toISOString(),
            correct_answers: result.correctAnswers,
            incorrect_answers: result.incorrectAnswers,
            total_questions: result.correctAnswers + result.incorrectAnswers,
            accuracy_percentage: Math.round(result.accuracy * 100) / 100,
            total_time_seconds: Math.round(result.totalTime),
            average_time_per_question: Math.round(result.averageTimePerQuestion * 100) / 100,
          })
          .eq('id', sessionId)
          .eq('user_id', userId);
        if (error) throw error;
        return true;
      } catch (error) {
        console.warn('[quiz] could not complete quiz session:', error);
        return false;
      }
    },
    [userId],
  );

  const getQuizHistory = useCallback(
    async (limit: number = 10) => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);
      if (error) {
        console.warn('[quiz] could not load quiz history:', error);
        return [];
      }
      return data ?? [];
    },
    [userId],
  );

  return {
    currentSession,
    loading,
    startQuizSession,
    completeQuizSession,
    getQuizHistory,
  };
};
