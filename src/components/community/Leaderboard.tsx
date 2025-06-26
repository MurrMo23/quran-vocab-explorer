
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, Crown, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  rank_position: number;
  username?: string;
  avatar_url?: string;
}

interface LeaderboardProps {
  category?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  category = 'overall',
  period = 'weekly'
}) => {
  const { session } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [category, period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Mock data for now since we don't have the complete leaderboard system
      const mockEntries: LeaderboardEntry[] = [
        { id: '1', user_id: 'user1', score: 2450, rank_position: 1, username: 'ArabicMaster' },
        { id: '2', user_id: 'user2', score: 2380, rank_position: 2, username: 'QuranStudent' },
        { id: '3', user_id: 'user3', score: 2250, rank_position: 3, username: 'LearningSeeker' },
        { id: '4', user_id: 'user4', score: 2100, rank_position: 4, username: 'VocabExplorer' },
        { id: '5', user_id: 'user5', score: 1980, rank_position: 5, username: 'StudyBuddy' },
        { id: '6', user_id: 'user6', score: 1850, rank_position: 6, username: 'PronunciationPro' },
        { id: '7', user_id: 'user7', score: 1720, rank_position: 7, username: 'GrammarGuru' },
        { id: '8', user_id: 'user8', score: 1650, rank_position: 8, username: 'FlashcardFan' },
        { id: '9', user_id: 'user9', score: 1580, rank_position: 9, username: 'QuizChampion' },
        { id: '10', user_id: 'user10', score: 1500, rank_position: 10, username: 'DailyLearner' }
      ];

      setEntries(mockEntries);

      // Mock current user rank
      if (session?.user?.id) {
        setCurrentUserRank({
          id: 'current',
          user_id: session.user.id,
          score: 1350,
          rank_position: 15,
          username: 'You'
        });
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold">#{position}</span>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Leaderboard...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard - {period.charAt(0).toUpperCase() + period.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  entry.rank_position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank_position)}
                  <div>
                    <div className="font-medium">{entry.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.score} points
                    </div>
                  </div>
                </div>
                <Badge variant={entry.rank_position <= 3 ? 'default' : 'secondary'}>
                  #{entry.rank_position}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentUserRank && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3">
                {getRankIcon(currentUserRank.rank_position)}
                <div>
                  <div className="font-medium">{currentUserRank.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentUserRank.score} points
                  </div>
                </div>
              </div>
              <Badge variant="outline">#{currentUserRank.rank_position}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Leaderboard;
