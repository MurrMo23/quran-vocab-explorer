
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalSessions: number;
  totalWords: number;
  averageAccuracy: number;
  timeSpent: number;
  streak: number;
  weakAreas: string[];
  strongAreas: string[];
  dailyProgress: Array<{
    date: string;
    accuracy: number;
    wordsLearned: number;
    timeSpent: number;
  }>;
  levelDistribution: Array<{
    level: string;
    count: number;
    accuracy: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    correct: number;
    total: number;
  }>;
}

interface ProgressData {
  level: string;
  xp: number;
  xpToNext: number;
  wordsLearned: number;
  totalWords: number;
  streak: number;
  accuracy: number;
  recentAchievements: Array<{
    title: string;
    description: string;
    date: string;
    icon: string;
  }>;
}

export const useAnalytics = () => {
  const { session } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAnalyticsData();
      fetchProgressData();
    }
  }, [session?.user?.id]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual Supabase queries
      const mockAnalyticsData: AnalyticsData = {
        totalSessions: 45,
        totalWords: 234,
        averageAccuracy: 78.5,
        timeSpent: 8640, // seconds
        streak: 7,
        weakAreas: ['Advanced Grammar', 'Complex Verbs', 'Formal Language'],
        strongAreas: ['Basic Vocabulary', 'Common Phrases', 'Numbers'],
        dailyProgress: [
          { date: '2024-01-15', accuracy: 75, wordsLearned: 12, timeSpent: 1800 },
          { date: '2024-01-16', accuracy: 82, wordsLearned: 15, timeSpent: 2100 },
          { date: '2024-01-17', accuracy: 79, wordsLearned: 10, timeSpent: 1500 },
          { date: '2024-01-18', accuracy: 85, wordsLearned: 18, timeSpent: 2400 },
          { date: '2024-01-19', accuracy: 88, wordsLearned: 20, timeSpent: 2700 },
          { date: '2024-01-20', accuracy: 83, wordsLearned: 14, timeSpent: 1900 },
          { date: '2024-01-21', accuracy: 90, wordsLearned: 22, timeSpent: 3000 },
        ],
        levelDistribution: [
          { level: 'Beginner', count: 150, accuracy: 85 },
          { level: 'Intermediate', count: 70, accuracy: 75 },
          { level: 'Advanced', count: 14, accuracy: 65 },
        ],
        categoryPerformance: [
          { category: 'Nouns', correct: 45, total: 60 },
          { category: 'Verbs', correct: 32, total: 45 },
          { category: 'Adjectives', correct: 28, total: 35 },
          { category: 'Phrases', correct: 22, total: 30 },
        ],
      };

      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      // Mock data for now - replace with actual Supabase queries
      const mockProgressData: ProgressData = {
        level: 'Intermediate',
        xp: 1250,
        xpToNext: 2000,
        wordsLearned: 234,
        totalWords: 500,
        streak: 7,
        accuracy: 78,
        recentAchievements: [
          {
            title: 'Week Warrior',
            description: 'Practiced 7 days in a row',
            date: '2024-01-21',
            icon: '🔥'
          },
          {
            title: 'Quick Learner',
            description: 'Learned 20+ words in one session',
            date: '2024-01-19',
            icon: '⚡'
          },
          {
            title: 'Accuracy Master',
            description: 'Achieved 90% accuracy',
            date: '2024-01-21',
            icon: '🎯'
          }
        ],
      };

      setProgressData(mockProgressData);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const updateProgress = async (sessionResults: any) => {
    if (!session?.user?.id) return;

    try {
      // Here you would update the user's progress in the database
      console.log('Updating progress with session results:', sessionResults);
      
      // Refresh the data after updating
      await fetchAnalyticsData();
      await fetchProgressData();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return {
    analyticsData,
    progressData,
    loading,
    updateProgress,
    refreshData: () => {
      fetchAnalyticsData();
      fetchProgressData();
    }
  };
};
