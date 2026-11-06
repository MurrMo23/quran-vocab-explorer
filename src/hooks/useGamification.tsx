import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useProgress } from '@/lib/progress';
import type { ProgressStats, ReviewLog } from '@/lib/progress/types';
import { localDateKey } from '@/components/analytics/progress-utils';

/** What a daily challenge measures; progress is computed from today's real reviews. */
export type DailyChallengeMetric = 'reviews_today' | 'new_words_today' | 'clear_due';

export interface DailyChallenge {
  id: string;
  challenge_date: string;
  challenge_type: 'vocabulary' | 'pronunciation' | 'speed' | 'accuracy';
  target_collection?: string;
  target_words?: string[];
  goal_value: number;
  description: string;
  /** Points are not awarded anywhere yet, so local challenges carry 0. */
  reward_points: number;
  created_at: string;
  /** Present on challenges derived from progress; lets the card measure real progress. */
  metric?: DailyChallengeMetric;
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

const CHALLENGES: Array<Pick<DailyChallenge, 'challenge_type' | 'goal_value' | 'description'> & { metric: DailyChallengeMetric }> = [
  { metric: 'reviews_today', challenge_type: 'vocabulary', goal_value: 20, description: 'Complete 20 reviews today' },
  { metric: 'new_words_today', challenge_type: 'vocabulary', goal_value: 5, description: 'Start 5 new words today' },
  { metric: 'clear_due', challenge_type: 'accuracy', goal_value: 1, description: 'Clear every word that is due for review' },
];

/** Same challenge for everyone on a given local date: picked by day number, not at random. */
const challengeForDate = (dateKey: string): DailyChallenge => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dayNumber = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  const pick = CHALLENGES[dayNumber % CHALLENGES.length];
  return {
    id: `local-${dateKey}-${pick.metric}`,
    challenge_date: dateKey,
    challenge_type: pick.challenge_type,
    goal_value: pick.goal_value,
    description: pick.description,
    reward_points: 0,
    created_at: dateKey,
    metric: pick.metric,
  };
};

/** Real progress toward a challenge, from today's logs and current stats. */
export const measureChallenge = (
  challenge: DailyChallenge,
  stats: ProgressStats,
  logs: readonly ReviewLog[],
): number => {
  const today = localDateKey(new Date());
  switch (challenge.metric) {
    case 'reviews_today':
      return stats.reviewsToday;
    case 'new_words_today': {
      // A word is "new today" if its first-ever review happened today.
      const firstSeen = new Map<string, string>();
      for (const log of logs) {
        const prev = firstSeen.get(log.wordId);
        if (!prev || log.reviewedAt < prev) firstSeen.set(log.wordId, log.reviewedAt);
      }
      let n = 0;
      firstSeen.forEach((iso) => {
        if (localDateKey(new Date(iso)) === today) n += 1;
      });
      return n;
    }
    case 'clear_due':
      return stats.reviewsToday > 0 && stats.dueNow === 0 ? 1 : 0;
    default:
      return 0;
  }
};

export const useGamification = () => {
  const { session } = useAuth();
  const { stats, logs } = useProgress();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [serverStats, setServerStats] = useState({ totalPoints: 0, challengesCompleted: 0, rank: 0 });
  const [loading, setLoading] = useState(false);

  const todayKey = localDateKey(new Date());
  const todayChallenge = useMemo(() => challengeForDate(todayKey), [todayKey]);
  const challengeProgress = measureChallenge(todayChallenge, stats, logs);
  const challengeCompleted = challengeProgress >= todayChallenge.goal_value;

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
      setLeaderboard(
        (data || []).map((entry) => ({ ...entry, category: entry.category as LeaderboardEntry['category'] })),
      );
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServerStats = async () => {
    if (!session?.user?.id) return;
    try {
      const { data: pointsData } = await supabase
        .from('leaderboard_entries')
        .select('score')
        .eq('user_id', session.user.id);
      const totalPoints = pointsData?.reduce((sum, entry) => sum + entry.score, 0) || 0;

      const { data: challengesData } = await supabase
        .from('user_challenge_attempts')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('is_completed', true);

      const { data: rankData } = await supabase
        .from('leaderboard_entries')
        .select('user_id, score')
        .eq('category', 'weekly')
        .order('score', { ascending: false });
      const index = rankData?.findIndex((entry) => entry.user_id === session.user.id) ?? -1;

      setServerStats({ totalPoints, challengesCompleted: challengesData?.length || 0, rank: index + 1 });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    if (session?.user?.id) fetchServerStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  return {
    todayChallenge,
    challengeProgress,
    challengeCompleted,
    leaderboard,
    userStats: { ...serverStats, currentStreak: stats.currentStreak },
    loading,
    fetchLeaderboard,
    refetch: () => {
      fetchLeaderboard();
      fetchServerStats();
    },
  };
};
