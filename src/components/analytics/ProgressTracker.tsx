
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, Calendar } from 'lucide-react';

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

interface ProgressTrackerProps {
  data: ProgressData;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ data }) => {
  const progressPercentage = (data.xp / data.xpToNext) * 100;
  const wordsProgress = (data.wordsLearned / data.totalWords) * 100;

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Level Progress</span>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {data.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Experience Points</span>
              <span className="text-sm text-muted-foreground">
                {data.xp} / {data.xpToNext} XP
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.wordsLearned}</div>
              <div className="text-xs text-blue-700">Words Learned</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{data.streak}</div>
              <div className="text-xs text-orange-700">Day Streak</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.accuracy}%</div>
              <div className="text-xs text-green-700">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Learning Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-semibold">{data.wordsLearned}/{data.totalWords}</div>
              <Progress value={wordsProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(wordsProgress)}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-green-600">
                {data.accuracy >= 80 ? 'Excellent' : data.accuracy >= 60 ? 'Good' : 'Needs Work'}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on recent accuracy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {data.recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {achievement.date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Complete more practice sessions to earn achievements!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;
