
import { supabase } from '@/integrations/supabase/client';

// Enhanced spaced repetition algorithm based on SM-2+ with adjustments for Arabic learning
export interface WordProgress {
  level: number; // 0-7 levels (new, learning, reviewing stages)
  next_review: string;
  last_reviewed?: string;
  review_count: number;
  success_streak: number;
  difficulty_modifier: number;
  pronunciation_mastery: number; // 0-100
  contextual_mastery: number; // 0-100
}

// Collection progress tracking
export interface CollectionProgress {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  completionPercentage: number;
  averageRetention: number;
  badges: string[];
}

// Achievement system
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'completion' | 'streak' | 'practice_days';
    value: number;
  };
  collectionId?: string;
}

// Calculate next review interval based on performance
export function calculateNextReview(
  currentLevel: number,
  isCorrect: boolean,
  difficultyModifier: number = 1.0,
  responseTime?: number
): { nextLevel: number; intervalDays: number } {
  const baseIntervals = [0, 1, 3, 7, 14, 30, 90, 180]; // Days for each level
  
  let nextLevel = currentLevel;
  
  if (isCorrect) {
    // Progress to next level if correct
    nextLevel = Math.min(currentLevel + 1, 7);
  } else {
    // Regress on incorrect answer
    nextLevel = Math.max(0, currentLevel - 1);
  }
  
  // Apply difficulty modifier
  let intervalDays = baseIntervals[nextLevel] * difficultyModifier;
  
  // Adjust based on response time (if provided)
  if (responseTime) {
    const responseModifier = responseTime > 5000 ? 0.8 : responseTime < 2000 ? 1.2 : 1.0;
    intervalDays *= responseModifier;
  }
  
  return {
    nextLevel,
    intervalDays: Math.round(intervalDays)
  };
}

// Update word progress in database
export async function updateWordProgress(
  wordId: string,
  isCorrect: boolean,
  userId: string,
  responseTime?: number
): Promise<void> {
  try {
    // Get current progress
    const { data: currentProgress } = await supabase
      .from('user_word_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single();

    const current = currentProgress || {
      level: 0,
      review_count: 0,
      success_streak: 0,
      difficulty_modifier: 1.0,
      pronunciation_mastery: 0,
      contextual_mastery: 0
    };

    // Calculate next review
    const { nextLevel, intervalDays } = calculateNextReview(
      current.level,
      isCorrect,
      current.difficulty_modifier,
      responseTime
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);

    const updateData = {
      user_id: userId,
      word_id: wordId,
      collection_id: 'general', // Default collection, should be passed as parameter
      level: nextLevel,
      next_review: nextReview.toISOString(),
      last_reviewed: new Date().toISOString(),
      review_count: current.review_count + 1,
      success_streak: isCorrect ? current.success_streak + 1 : 0,
      difficulty_modifier: current.difficulty_modifier,
      pronunciation_mastery: current.pronunciation_mastery,
      contextual_mastery: current.contextual_mastery,
      updated_at: new Date().toISOString()
    };

    if (currentProgress) {
      await supabase
        .from('user_word_progress')
        .update(updateData)
        .eq('user_id', userId)
        .eq('word_id', wordId);
    } else {
      await supabase
        .from('user_word_progress')
        .insert(updateData);
    }

  } catch (error) {
    console.error('Error updating word progress:', error);
    throw error;
  }
}

// Get words due for review
export async function getWordsForReview(
  userId: string,
  limit: number = 20
): Promise<string[]> {
  try {
    const { data } = await supabase
      .from('user_word_progress')
      .select('word_id')
      .eq('user_id', userId)
      .lte('next_review', new Date().toISOString())
      .order('next_review', { ascending: true })
      .limit(limit);

    return data?.map(item => item.word_id) || [];
  } catch (error) {
    console.error('Error getting words for review:', error);
    return [];
  }
}

// Update pronunciation mastery
export async function updatePronunciationMastery(
  wordId: string,
  userId: string,
  score: number
): Promise<void> {
  try {
    const { data: currentProgress } = await supabase
      .from('user_word_progress')
      .select('pronunciation_mastery, review_count')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single();

    if (currentProgress) {
      // Calculate weighted average for pronunciation mastery
      const currentMastery = currentProgress.pronunciation_mastery || 0;
      const reviewCount = currentProgress.review_count || 1;
      const newMastery = Math.round(
        (currentMastery * reviewCount + score) / (reviewCount + 1)
      );

      await supabase
        .from('user_word_progress')
        .update({
          pronunciation_mastery: Math.min(100, newMastery),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('word_id', wordId);
    }
  } catch (error) {
    console.error('Error updating pronunciation mastery:', error);
    throw error;
  }
}

// Get user's overall progress statistics
export async function getUserProgressStats(userId: string): Promise<{
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  averageRetention: number;
}> {
  try {
    const { data } = await supabase
      .from('user_word_progress')
      .select('level, success_streak')
      .eq('user_id', userId);

    if (!data || data.length === 0) {
      return {
        totalWords: 0,
        masteredWords: 0,
        learningWords: 0,
        newWords: 0,
        averageRetention: 0
      };
    }

    const masteredWords = data.filter(item => item.level >= 6).length;
    const learningWords = data.filter(item => item.level > 0 && item.level < 6).length;
    const newWords = data.filter(item => item.level === 0).length;
    
    const totalStreaks = data.reduce((sum, item) => sum + item.success_streak, 0);
    const averageRetention = data.length > 0 ? totalStreaks / data.length : 0;

    return {
      totalWords: data.length,
      masteredWords,
      learningWords,
      newWords,
      averageRetention: Math.round(averageRetention * 100) / 100
    };
  } catch (error) {
    console.error('Error getting user progress stats:', error);
    return {
      totalWords: 0,
      masteredWords: 0,
      learningWords: 0,
      newWords: 0,
      averageRetention: 0
    };
  }
}

// Get collection-specific progress
export async function getCollectionProgress(collectionId: string, userId?: string): Promise<CollectionProgress> {
  try {
    // Mock implementation - in a real app, this would query the database
    // for progress specific to the collection
    if (userId) {
      const stats = await getUserProgressStats(userId);
      return {
        ...stats,
        completionPercentage: stats.totalWords > 0 ? (stats.masteredWords / stats.totalWords) * 100 : 0,
        badges: ['first-word', 'week-streak'] // Mock badges
      };
    }
    
    // Default empty progress
    return {
      totalWords: 0,
      masteredWords: 0,
      learningWords: 0,
      newWords: 0,
      completionPercentage: 0,
      averageRetention: 0,
      badges: []
    };
  } catch (error) {
    console.error('Error getting collection progress:', error);
    return {
      totalWords: 0,
      masteredWords: 0,
      learningWords: 0,
      newWords: 0,
      completionPercentage: 0,
      averageRetention: 0,
      badges: []
    };
  }
}

// Get available achievements
export function getAchievements(): Achievement[] {
  return [
    {
      id: 'first-word',
      name: 'First Word',
      description: 'Complete your first word',
      icon: '🌱',
      requirement: { type: 'completion', value: 1 }
    },
    {
      id: 'quarter-complete',
      name: 'Quarter Master',
      description: 'Complete 25% of a collection',
      icon: '🎯',
      requirement: { type: 'completion', value: 25 }
    },
    {
      id: 'half-complete',
      name: 'Halfway Hero',
      description: 'Complete 50% of a collection',
      icon: '⭐',
      requirement: { type: 'completion', value: 50 }
    },
    {
      id: 'three-quarters',
      name: 'Almost There',
      description: 'Complete 75% of a collection',
      icon: '🏆',
      requirement: { type: 'completion', value: 75 }
    },
    {
      id: 'collection-master',
      name: 'Collection Master',
      description: 'Complete 100% of a collection',
      icon: '👑',
      requirement: { type: 'completion', value: 100 }
    }
  ];
}
