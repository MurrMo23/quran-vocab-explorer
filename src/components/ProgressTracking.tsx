
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Target, BookOpen, Star, Calendar } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  target: number;
  unlocked: boolean;
  category: 'streak' | 'vocabulary' | 'quiz' | 'social';
}

const ProgressTracking = () => {
  const { session } = useAuth();
  const { getUserProgress, streak } = useSpacedRepetition();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState({
    totalWords: 0,
    masteredWords: 0,
    learningWords: 0,
    streak: 0,
    weeklyGoal: 50,
    weeklyProgress: 0
  });

  useEffect(() => {
    if (session) {
      const progress = getUserProgress();
      setUserStats(prev => ({
        ...prev,
        ...progress,
        streak
      }));

      // Initialize achievements
      const mockAchievements: Achievement[] = [
        {
          id: 'first-week',
          title: 'First Week',
          description: 'Complete 7 days of practice',
          icon: <Calendar className="h-5 w-5" />,
          progress: Math.min(streak, 7),
          target: 7,
          unlocked: streak >= 7,
          category: 'streak'
        },
        {
          id: 'vocabulary-master',
          title: 'Vocabulary Master',
          description: 'Learn 100 new words',
          icon: <BookOpen className="h-5 w-5" />,
          progress: progress.totalWords,
          target: 100,
          unlocked: progress.totalWords >= 100,
          category: 'vocabulary'
        },
        {
          id: 'quiz-champion',
          title: 'Quiz Champion',
          description: 'Score 90% or higher on 5 quizzes',
          icon: <Trophy className="h-5 w-5" />,
          progress: 3, // Mock data
          target: 5,
          unlocked: false,
          category: 'quiz'
        },
        {
          id: 'streak-master',
          title: 'Streak Master',
          description: 'Maintain a 30-day learning streak',
          icon: <Flame className="h-5 w-5" />,
          progress: streak,
          target: 30,
          unlocked: streak >= 30,
          category: 'streak'
        }
      ];

      setAchievements(mockAchievements);
    }
  }, [session, streak]);

  if (!session) {
    return null;
  }

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'streak': return 'bg-orange-100 text-orange-800';
      case 'vocabulary': return 'bg-blue-100 text-blue-800';
      case 'quiz': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.streak}</div>
            <p className="text-xs text-muted-foreground">
              days consecutive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Mastered</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.masteredWords}</div>
            <p className="text-xs text-muted-foreground">
              out of {userStats.totalWords} learned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.weeklyProgress}</div>
            <p className="text-xs text-muted-foreground">
              of {userStats.weeklyGoal} words goal
            </p>
            <Progress 
              value={(userStats.weeklyProgress / userStats.weeklyGoal) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border ${
                  achievement.unlocked 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-muted/50 border-muted'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded ${
                      achievement.unlocked ? 'bg-green-100' : 'bg-muted'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(achievement.category)}>
                    {achievement.category}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{achievement.progress} / {achievement.target}</span>
                    <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.target) * 100}
                    className="h-2"
                  />
                </div>
                
                {achievement.unlocked && (
                  <div className="mt-2 flex items-center gap-1 text-green-600">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-medium">Unlocked!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracking;
