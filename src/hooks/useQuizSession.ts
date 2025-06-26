import { useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QuizSession, QuizConfiguration, QuizResult, UserAchievement, QuestionType, QuizMode, DifficultyLevel } from '@/utils/quiz-types';

export const useQuizSession = () => {
  const { session } = useAuth();
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(false);

  const startQuizSession = useCallback(async (config: QuizConfiguration): Promise<string | null> => {
    if (!session?.user?.id) {
      toast.error('Please log in to start a quiz session');
      return null;
    }

    setLoading(true);
    try {
      const sessionData = {
        user_id: session.user.id,
        quiz_type: 'vocabulary',
        mode: config.mode,
        collection_id: config.collectionId,
        difficulty: config.difficulty,
        total_questions: config.questionCount,
        question_types: config.questionTypes,
        adaptive_difficulty_used: config.adaptiveLearning,
        spaced_repetition_words: []
      };

      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      // Transform database response to match QuizSession type
      const quizSession: QuizSession = {
        id: data.id,
        user_id: data.user_id,
        quiz_type: data.quiz_type,
        mode: data.mode as QuizMode,
        collection_id: data.collection_id,
        difficulty: data.difficulty as DifficultyLevel,
        total_questions: data.total_questions,
        correct_answers: data.correct_answers,
        incorrect_answers: data.incorrect_answers,
        accuracy_percentage: data.accuracy_percentage,
        total_time_seconds: data.total_time_seconds,
        average_time_per_question: data.average_time_per_question,
        question_types: data.question_types as QuestionType[],
        adaptive_difficulty_used: data.adaptive_difficulty_used,
        spaced_repetition_words: data.spaced_repetition_words,
        started_at: data.started_at,
        completed_at: data.completed_at,
        created_at: data.created_at
      };

      setCurrentSession(quizSession);
      console.log('Quiz session started:', data.id);
      return data.id;
    } catch (error: any) {
      console.error('Error starting quiz session:', error);
      toast.error('Failed to start quiz session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const updateQuizSession = useCallback(async (
    sessionId: string,
    updates: Partial<QuizSession>
  ): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .update(updates)
        .eq('id', sessionId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      console.log('Quiz session updated:', sessionId);
      return true;
    } catch (error: any) {
      console.error('Error updating quiz session:', error);
      toast.error('Failed to update quiz session');
      return false;
    }
  }, [session]);

  const completeQuizSession = useCallback(async (
    sessionId: string,
    result: QuizResult
  ): Promise<boolean> => {
    if (!session?.user?.id) return false;

    setLoading(true);
    try {
      // Update session with completion data
      const sessionUpdates = {
        completed_at: new Date().toISOString(),
        correct_answers: result.correctAnswers,
        incorrect_answers: result.incorrectAnswers,
        accuracy_percentage: result.accuracy,
        total_time_seconds: result.totalTime,
        average_time_per_question: result.averageTimePerQuestion
      };

      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .update(sessionUpdates)
        .eq('id', sessionId)
        .eq('user_id', session.user.id);

      if (sessionError) throw sessionError;

      // Process achievements
      if (result.achievements.length > 0) {
        await processAchievements(result.achievements);
      }

      console.log('Quiz session completed:', sessionId);
      toast.success(`Quiz completed! Score: ${result.score}%`);
      return true;
    } catch (error: any) {
      console.error('Error completing quiz session:', error);
      toast.error('Failed to complete quiz session');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const processAchievements = async (achievements: UserAchievement[]) => {
    if (!session?.user?.id) return;

    try {
      const achievementData = achievements.map(achievement => ({
        ...achievement,
        user_id: session.user.id
      }));

      const { error } = await supabase
        .from('user_achievements')
        .upsert(achievementData, { 
          onConflict: 'user_id,achievement_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      // Show achievement notifications
      achievements.forEach(achievement => {
        if (achievement.is_unlocked) {
          toast.success(`🏆 Achievement unlocked: ${achievement.achievement_id}!`);
        }
      });
    } catch (error: any) {
      console.error('Error processing achievements:', error);
    }
  };

  const getQuizHistory = useCallback(async (limit: number = 10) => {
    if (!session?.user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching quiz history:', error);
      return [];
    }
  }, [session]);

  const getUserStatistics = useCallback(async (period: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    if (!session?.user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('quiz_statistics')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('period_type', period)
        .order('period_start', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching user statistics:', error);
      return null;
    }
  }, [session]);

  const getUserAchievements = useCallback(async () => {
    if (!session?.user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }, [session]);

  return {
    currentSession,
    loading,
    startQuizSession,
    updateQuizSession,
    completeQuizSession,
    getQuizHistory,
    getUserStatistics,
    getUserAchievements
  };
};
