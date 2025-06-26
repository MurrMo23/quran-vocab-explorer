import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Word } from '@/utils/vocabulary-types';

interface LearningProgress {
  id: string;
  user_id: string;
  path_id: string;
  word_id: string;
  proficiency: number;
  last_reviewed: string;
  next_review: string;
  reviews_count: number;
}

export const useSpacedRepetition = (pathId?: string) => {
  const { session } = useAuth();
  const [userProgress, setUserProgress] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastPracticeDate, setLastPracticeDate] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchUserProgress();
      checkStreak();
    }
  }, [session, pathId]);

  const fetchUserProgress = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', session.user.id);
        
      if (pathId) {
        query = query.eq('path_id', pathId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setUserProgress(data || []);
    } catch (error: any) {
      console.error('Error fetching learning progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkStreak = async () => {
    if (!session) return;
    
    try {
      // In a real app, we would store streak in the database
      // For now, we'll use the current streak implementation
      const storedStreak = localStorage.getItem('userStreak') || '0';
      const storedDate = localStorage.getItem('lastPracticeDate');
      
      setStreak(parseInt(storedStreak, 10));
      setLastPracticeDate(storedDate);
    } catch (error) {
      console.error('Error checking streak:', error);
    }
  };

  const updateUserStreak = () => {
    const today = new Date().toDateString();
    let currentStreak = streak;
    
    // If this is the first practice ever
    if (!lastPracticeDate) {
      currentStreak = 1;
    } 
    // User practiced today already
    else if (lastPracticeDate === today) {
      // Keep current streak
    }
    // User practiced yesterday (maintain streak)
    else {
      const lastDate = new Date(lastPracticeDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate.toDateString() === yesterday.toDateString()) {
        currentStreak += 1;
      } 
      // User missed a day or more (reset streak)
      else {
        currentStreak = 1;
      }
    }
    
    // Update local storage
    localStorage.setItem('userStreak', currentStreak.toString());
    localStorage.setItem('lastPracticeDate', today);
    
    setStreak(currentStreak);
    setLastPracticeDate(today);
    
    return currentStreak;
  };

  const calculateNextReview = (proficiency: number): Date => {
    // Time in hours before next review based on proficiency level
    const intervals = [1, 6, 24, 72, 168, 336]; // 1h, 6h, 1d, 3d, 1w, 2w
    const hours = intervals[Math.min(proficiency, 5)];
    
    const nextReview = new Date();
    nextReview.setHours(nextReview.getHours() + hours);
    
    return nextReview;
  };

  const updateWordProgress = async (
    word: Word, 
    success: boolean, 
    pathId: string
  ) => {
    if (!session) {
      console.error('User not authenticated');
      return null;
    }
    
    try {
      // Check if we already have a record for this word
      const existingProgress = userProgress.find(p => 
        p.word_id === word.id && p.path_id === pathId
      );
      
      const now = new Date();
      let proficiency = existingProgress ? existingProgress.proficiency : 0;
      
      // Adjust proficiency based on success
      if (success) {
        proficiency = Math.min(5, proficiency + 1);
      } else {
        proficiency = Math.max(0, proficiency - 1);
      }
      
      const nextReview = calculateNextReview(proficiency);
      
      if (existingProgress) {
        // Update existing record
        const { data, error } = await supabase
          .from('learning_progress')
          .update({
            proficiency,
            last_reviewed: now.toISOString(),
            next_review: nextReview.toISOString(),
            reviews_count: existingProgress.reviews_count + 1
          })
          .eq('id', existingProgress.id)
          .select();
          
        if (error) throw error;
        return data?.[0] || null;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('learning_progress')
          .insert({
            user_id: session.user.id,
            word_id: word.id,
            path_id: pathId,
            proficiency,
            last_reviewed: now.toISOString(),
            next_review: nextReview.toISOString(),
            reviews_count: 1
          })
          .select();
          
        if (error) throw error;
        return data?.[0] || null;
      }
    } catch (error: any) {
      console.error('Error updating word progress:', error);
      return null;
    }
  };

  const getWordsForReview = (pathId: string, allWords: Word[]): Word[] => {
    if (!userProgress.length || !allWords.length) return allWords;
    
    const now = new Date();
    const dueProgress = userProgress.filter(p => 
      p.path_id === pathId && new Date(p.next_review) <= now
    );
    
    const dueWordIds = new Set(dueProgress.map(p => p.word_id));
    
    // Return words that are due for review
    const dueWords = allWords.filter(word => dueWordIds.has(word.id));
    
    // If we have fewer than 5 due words, add some new words
    if (dueWords.length < 5) {
      const learnedWordIds = new Set(userProgress.map(p => p.word_id));
      const newWords = allWords
        .filter(word => !learnedWordIds.has(word.id))
        .slice(0, 5 - dueWords.length);
        
      return [...dueWords, ...newWords];
    }
    
    return dueWords;
  };
  
  const getUserProgress = () => {
    // Calculate statistics
    const totalWords = userProgress.length;
    const masteredWords = userProgress.filter(p => p.proficiency >= 4).length;
    const learningWords = userProgress.filter(p => p.proficiency > 0 && p.proficiency < 4).length;
    const newWords = userProgress.filter(p => p.proficiency === 0).length;
    
    return {
      streak,
      totalWords,
      masteredWords,
      learningWords,
      newWords,
      mastery: totalWords ? Math.round((masteredWords / totalWords) * 100) : 0
    };
  };

  return {
    updateWordProgress,
    getWordsForReview,
    updateUserStreak,
    getUserProgress,
    streak,
    loading
  };
};
