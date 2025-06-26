
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export interface DailyChallenge {
  id: string;
  challenge_date: string;
  challenge_type: 'vocabulary' | 'pronunciation' | 'speed' | 'accuracy';
  target_collection?: string;
  target_words?: string[];
  goal_value: number;
  description: string;
  reward_points: number;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  category: 'daily' | 'weekly' | 'monthly' | 'all_time';
  score: number;
  rank_position?: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export const useGamification = () => {
  const { session } = useAuth();
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    currentStreak: 0,
    challengesCompleted: 0,
    rank: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchTodayChallenge = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      if (data) {
        const typedData = {
          ...data,
          challenge_type: data.challenge_type as DailyChallenge['challenge_type']
        };
        setTodayChallenge(typedData);
      } else {
        setTodayChallenge(null);
        // If no challenge exists, create one
        await createDailyChallenge();
      }
    } catch (error: any) {
      console.error('Error fetching today\'s challenge:', error);
    }
  };

  const createDailyChallenge = async () => {
    const challengeTypes = ['vocabulary', 'pronunciation', 'speed', 'accuracy'];
    const collections = ['faith', 'ethics', 'prophets', 'worship', 'community', 'knowledge', 'nature'];
    
    const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)] as DailyChallenge['challenge_type'];
    const randomCollection = collections[Math.floor(Math.random() * collections.length)];
    
    const challenges = {
      vocabulary: { goal: 10, description: 'Master 10 new vocabulary words', points: 50 },
      pronunciation: { goal: 5, description: 'Practice pronunciation for 5 words', points: 30 },
      speed: { goal: 30, description: 'Answer 30 questions in under 2 minutes', points: 40 },
      accuracy: { goal: 95, description: 'Achieve 95% accuracy in practice session', points: 60 }
    };

    const challenge = challenges[randomType];
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('daily_challenges')
        .insert({
          challenge_date: today,
          challenge_type: randomType,
          target_collection: randomCollection,
          goal_value: challenge.goal,
          description: challenge.description,
          reward_points: challenge.points
        })
        .select()
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        challenge_type: data.challenge_type as DailyChallenge['challenge_type']
      };
      setTodayChallenge(typedData);
    } catch (error: any) {
      console.error('Error creating daily challenge:', error);
    }
  };

  const fetchLeaderboard = async (category: LeaderboardEntry['category'] = 'weekly') => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('category', category)
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Type cast to ensure proper typing
      const typedData = (data || []).map(entry => ({
        ...entry,
        category: entry.category as LeaderboardEntry['category']
      }));
      
      setLeaderboard(typedData);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const submitChallengeAttempt = async (challengeId: string, score: number) => {
    if (!session?.user?.id) return false;

    try {
      const { data, error } = await supabase
        .from('user_challenge_attempts')
        .insert({
          user_id: session.user.id,
          challenge_id: challengeId,
          score: score,
          is_completed: score >= (todayChallenge?.goal_value || 0)
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data.is_completed) {
        toast.success(`Challenge completed! You earned ${todayChallenge?.reward_points || 0} points!`);
        await updateUserPoints(todayChallenge?.reward_points || 0);
      }
      
      return data.is_completed;
    } catch (error: any) {
      console.error('Error submitting challenge attempt:', error);
      toast.error('Failed to submit challenge attempt');
      return false;
    }
  };

  const updateUserPoints = async (points: number) => {
    if (!session?.user?.id) return;

    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    try {
      await supabase
        .from('leaderboard_entries')
        .upsert({
          user_id: session.user.id,
          category: 'weekly',
          score: points,
          period_start: startOfWeek.toISOString().split('T')[0],
          period_end: endOfWeek.toISOString().split('T')[0]
        });
      
      await fetchLeaderboard();
    } catch (error: any) {
      console.error('Error updating user points:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!session?.user?.id) return;

    try {
      // Get total points from leaderboard
      const { data: pointsData } = await supabase
        .from('leaderboard_entries')
        .select('score')
        .eq('user_id', session.user.id);

      const totalPoints = pointsData?.reduce((sum, entry) => sum + entry.score, 0) || 0;

      // Get challenges completed
      const { data: challengesData } = await supabase
        .from('user_challenge_attempts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_completed', true);

      const challengesCompleted = challengesData?.length || 0;

      // Get current rank
      const { data: rankData } = await supabase
        .from('leaderboard_entries')
        .select('user_id, score')
        .eq('category', 'weekly')
        .order('score', { ascending: false });

      const rank = rankData?.findIndex(entry => entry.user_id === session.user.id) + 1 || 0;

      setUserStats({
        totalPoints,
        currentStreak: 0, // Would need more complex logic
        challengesCompleted,
        rank
      });
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
    }
  };

  useEffect(() => {
    fetchTodayChallenge();
    fetchLeaderboard();
    if (session?.user?.id) {
      fetchUserStats();
    }
  }, [session?.user?.id]);

  return {
    todayChallenge,
    leaderboard,
    userStats,
    loading,
    submitChallengeAttempt,
    fetchLeaderboard,
    refetch: () => {
      fetchTodayChallenge();
      fetchLeaderboard();
      fetchUserStats();
    }
  };
};
