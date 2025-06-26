
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Word } from '@/utils/vocabulary-types';
import { toast } from 'sonner';

export interface AdaptiveLearningData {
  recommendedWords: Word[];
  currentDifficulty: 'beginner' | 'intermediate' | 'advanced';
  learningVelocity: number;
  weakAreas: string[];
  nextRecommendations: string[];
  confidenceScore: number;
}

export interface LearningSession {
  id: string;
  sessionType: 'practice' | 'quiz' | 'review';
  initialDifficulty: string;
  finalDifficulty: string;
  performanceMetrics: Record<string, any>;
  recommendedWords: string[];
  learningVelocity: number;
  confidenceScore: number;
}

export interface WordDifficultyData {
  wordId: string;
  calculatedDifficulty: number;
  userPerformanceScore: number;
  responseTimeAvg: number;
  masteryLevel: number;
  errorPatterns: Record<string, any>;
}

export const useAdaptiveLearning = () => {
  const { session } = useAuth();
  const [adaptiveLearningData, setAdaptiveLearningData] = useState<AdaptiveLearningData | null>(null);
  const [wordDifficulties, setWordDifficulties] = useState<WordDifficultyData[]>([]);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [loading, setLoading] = useState(false);

  // AI-powered difficulty calculation
  const calculateOptimalDifficulty = useCallback((
    userPerformance: number,
    responseTime: number,
    errorRate: number,
    currentLevel: string
  ): 'beginner' | 'intermediate' | 'advanced' => {
    const performanceScore = userPerformance * 0.6 + (1 - errorRate) * 0.3 + (responseTime < 3000 ? 0.1 : 0);
    
    if (performanceScore > 0.8 && currentLevel !== 'advanced') {
      return currentLevel === 'beginner' ? 'intermediate' : 'advanced';
    } else if (performanceScore < 0.4 && currentLevel !== 'beginner') {
      return currentLevel === 'advanced' ? 'intermediate' : 'beginner';
    }
    
    return currentLevel as 'beginner' | 'intermediate' | 'advanced';
  }, []);

  // Smart word recommendation algorithm
  const generateWordRecommendations = useCallback((
    userProgress: any[],
    weakAreas: string[],
    targetDifficulty: string
  ): string[] => {
    // Simulate AI-powered word selection based on:
    // 1. User's weak areas
    // 2. Spaced repetition intervals
    // 3. Optimal difficulty progression
    // 4. Learning patterns
    
    const recommendations: string[] = [];
    
    // Focus on weak areas first (40% of recommendations)
    weakAreas.forEach(area => {
      // In a real implementation, this would query words from weak areas
      recommendations.push(`weak_area_${area}_${Math.random().toString(36).substr(2, 9)}`);
    });
    
    // Add spaced repetition words (30% of recommendations)
    const spacedRepetitionWords = userProgress
      .filter(p => p.next_review && new Date(p.next_review) <= new Date())
      .map(p => p.word_id)
      .slice(0, 3);
    
    recommendations.push(...spacedRepetitionWords);
    
    // Add new words at appropriate difficulty (30% of recommendations)
    const newWordCount = Math.max(1, 5 - recommendations.length);
    for (let i = 0; i < newWordCount; i++) {
      recommendations.push(`new_${targetDifficulty}_${Math.random().toString(36).substr(2, 9)}`);
    }
    
    return recommendations.slice(0, 10); // Limit to 10 recommendations
  }, []);

  // Analyze learning patterns and update recommendations
  const analyzeAndUpdateRecommendations = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);

      // Get user's learning progress
      const { data: progressData } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', session.user.id);

      // Get user's learning preferences (fallback to defaults if table doesn't exist)
      let preferencesData = null;
      try {
        const { data } = await supabase
          .from('user_learning_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        preferencesData = data;
      } catch (error) {
        // Table might not exist, use defaults
        console.log('User preferences table not available, using defaults');
      }

      // Calculate performance metrics
      const totalWords = progressData?.length || 0;
      const masteredWords = progressData?.filter(p => p.level >= 6).length || 0;
      const averageAccuracy = progressData?.length > 0 
        ? progressData.reduce((sum, p) => sum + (p.success_streak / Math.max(p.review_count, 1)), 0) / progressData.length
        : 0;

      // Identify weak areas
      const weakAreas = progressData
        ?.filter(p => p.level < 3 && p.review_count > 2)
        .map(p => p.collection_id)
        .filter((value, index, self) => self.indexOf(value) === index)
        .slice(0, 3) || [];

      // Calculate learning velocity (words mastered per week)
      const recentProgress = progressData?.filter(p => {
        const lastReviewed = new Date(p.last_reviewed || p.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastReviewed >= weekAgo && p.level >= 4;
      }) || [];

      const learningVelocity = recentProgress.length;

      // Determine optimal difficulty
      const currentDifficulty = calculateOptimalDifficulty(
        averageAccuracy,
        3000, // Default response time
        1 - averageAccuracy,
        preferencesData?.difficulty_preference || 'intermediate'
      );

      // Generate smart recommendations
      const recommendedWords = generateWordRecommendations(
        progressData || [],
        weakAreas,
        currentDifficulty
      );

      // Calculate AI confidence score
      const confidenceScore = Math.min(0.95, 0.5 + (totalWords * 0.01) + (averageAccuracy * 0.3));

      setAdaptiveLearningData({
        recommendedWords: [], // Would be populated with actual Word objects
        currentDifficulty,
        learningVelocity,
        weakAreas,
        nextRecommendations: recommendedWords,
        confidenceScore
      });

    } catch (error) {
      console.error('Error analyzing learning patterns:', error);
      toast.error('Failed to update learning recommendations');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, calculateOptimalDifficulty, generateWordRecommendations]);

  // Start adaptive learning session using existing quiz_sessions table
  const startAdaptiveSession = useCallback(async (sessionType: 'practice' | 'quiz' | 'review') => {
    if (!session?.user?.id || !adaptiveLearningData) return null;

    try {
      // Use existing quiz_sessions table with adaptive features
      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: session.user.id,
          quiz_type: 'adaptive',
          mode: sessionType,
          difficulty: adaptiveLearningData.currentDifficulty,
          adaptive_difficulty_used: true,
          spaced_repetition_words: adaptiveLearningData.nextRecommendations
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: LearningSession = {
        id: data.id,
        sessionType,
        initialDifficulty: data.difficulty,
        finalDifficulty: data.difficulty,
        performanceMetrics: {},
        recommendedWords: data.spaced_repetition_words || [],
        learningVelocity: adaptiveLearningData.learningVelocity,
        confidenceScore: adaptiveLearningData.confidenceScore
      };

      setCurrentSession(newSession);
      return newSession;

    } catch (error) {
      console.error('Error starting adaptive session:', error);
      toast.error('Failed to start adaptive learning session');
      return null;
    }
  }, [session?.user?.id, adaptiveLearningData]);

  // Update word difficulty based on performance using localStorage until DB function is available
  const updateWordDifficulty = useCallback(async (
    wordId: string,
    isCorrect: boolean,
    responseTime: number
  ) => {
    if (!session?.user?.id) return;

    try {
      // For now, store in localStorage until the database function is available
      const storageKey = `word_difficulties_${session.user.id}`;
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const existingIndex = existingData.findIndex((w: WordDifficultyData) => w.wordId === wordId);
      
      let currentDifficulty = 0.5;
      if (existingIndex >= 0) {
        currentDifficulty = existingData[existingIndex].calculatedDifficulty;
      }
      
      // AI difficulty adjustment algorithm
      const performanceFactor = isCorrect ? -0.05 : 0.1;
      const timeFactor = responseTime < 3000 ? -0.02 : responseTime > 10000 ? 0.02 : 0;
      const newDifficulty = Math.max(0.1, Math.min(0.9, currentDifficulty + performanceFactor + timeFactor));
      
      const wordDifficultyData: WordDifficultyData = {
        wordId,
        calculatedDifficulty: newDifficulty,
        userPerformanceScore: isCorrect ? 0.8 : 0.2,
        responseTimeAvg: responseTime,
        masteryLevel: isCorrect ? 0.6 : 0.3,
        errorPatterns: {}
      };
      
      if (existingIndex >= 0) {
        existingData[existingIndex] = wordDifficultyData;
      } else {
        existingData.push(wordDifficultyData);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existingData));
      
      // Update local state
      setWordDifficulties(existingData);
      
      return newDifficulty;

    } catch (error) {
      console.error('Error updating word difficulty:', error);
      return null;
    }
  }, [session?.user?.id]);

  // Complete adaptive session with performance data
  const completeAdaptiveSession = useCallback(async (performanceData: {
    accuracy: number;
    averageResponseTime: number;
    wordsStudied: string[];
    difficultyProgression: Record<string, number>;
  }) => {
    if (!currentSession || !session?.user?.id) return;

    try {
      const finalDifficulty = calculateOptimalDifficulty(
        performanceData.accuracy,
        performanceData.averageResponseTime,
        1 - performanceData.accuracy,
        currentSession.initialDifficulty
      );

      // Update the quiz session
      await supabase
        .from('quiz_sessions')
        .update({
          difficulty: finalDifficulty,
          completed_at: new Date().toISOString(),
          correct_answers: Math.round(performanceData.wordsStudied.length * performanceData.accuracy),
          total_questions: performanceData.wordsStudied.length,
          accuracy_percentage: performanceData.accuracy * 100,
          total_time_seconds: Math.round(performanceData.averageResponseTime * performanceData.wordsStudied.length / 1000)
        })
        .eq('id', currentSession.id);

      setCurrentSession(null);

      // Trigger recommendation update
      await analyzeAndUpdateRecommendations();

      toast.success('Adaptive learning session completed!');

    } catch (error) {
      console.error('Error completing adaptive session:', error);
      toast.error('Failed to complete adaptive session');
    }
  }, [currentSession, session?.user?.id, calculateOptimalDifficulty, analyzeAndUpdateRecommendations]);

  // Load word difficulties from localStorage
  useEffect(() => {
    if (session?.user?.id) {
      const storageKey = `word_difficulties_${session.user.id}`;
      const storedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setWordDifficulties(storedData);
    }
  }, [session?.user?.id]);

  // Initialize adaptive learning data
  useEffect(() => {
    if (session?.user?.id) {
      analyzeAndUpdateRecommendations();
    }
  }, [session?.user?.id, analyzeAndUpdateRecommendations]);

  return {
    adaptiveLearningData,
    wordDifficulties,
    currentSession,
    loading,
    startAdaptiveSession,
    updateWordDifficulty,
    completeAdaptiveSession,
    analyzeAndUpdateRecommendations
  };
};
