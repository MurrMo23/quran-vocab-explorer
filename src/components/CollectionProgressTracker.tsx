
import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, TrendingUp, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCollectionProgress, Achievement, getAchievements, CollectionProgress } from '@/utils/enhanced-spaced-repetition';

interface CollectionProgressTrackerProps {
  collectionId: string;
  collectionName: string;
  onStartPractice?: () => void;
}

const CollectionProgressTracker: React.FC<CollectionProgressTrackerProps> = ({
  collectionId,
  collectionName,
  onStartPractice
}) => {
  const [progress, setProgress] = useState<CollectionProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const loadProgress = async () => {
      const progressData = await getCollectionProgress(collectionId);
      const achievementsData = getAchievements().filter(a => a.collectionId === collectionId);
      
      setProgress(progressData);
      setAchievements(achievementsData);
    };

    loadProgress();
  }, [collectionId]);

  if (!progress) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getProgressMessage = (percentage: number) => {
    if (percentage >= 100) return 'Collection Mastered! 🎉';
    if (percentage >= 80) return 'Almost there! Keep going! 💪';
    if (percentage >= 60) return 'Great progress! You\'re doing well! 👍';
    if (percentage >= 40) return 'Good start! Keep practicing! 📚';
    if (percentage >= 20) return 'Just getting started! 🌱';
    return 'Begin your journey! 🚀';
  };

  const getNextMilestone = (percentage: number) => {
    const milestones = [25, 50, 75, 100];
    return milestones.find(m => m > percentage) || 100;
  };

  const nextMilestone = getNextMilestone(progress.completionPercentage);
  const progressToNextMilestone = ((progress.completionPercentage % 25) / 25) * 100;

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {collectionName} Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall completion */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-2xl font-bold">{Math.round(progress.completionPercentage)}%</span>
            </div>
            <Progress 
              value={progress.completionPercentage} 
              className={`h-3 ${getProgressColor(progress.completionPercentage)}`}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {getProgressMessage(progress.completionPercentage)}
            </p>
          </div>

          {/* Word breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{progress.masteredWords}</div>
              <div className="text-sm text-green-700">Mastered</div>
              <Star className="h-4 w-4 mx-auto mt-1 text-green-500" />
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{progress.learningWords}</div>
              <div className="text-sm text-blue-700">Learning</div>
              <TrendingUp className="h-4 w-4 mx-auto mt-1 text-blue-500" />
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{progress.newWords}</div>
              <div className="text-sm text-purple-700">New</div>
              <Calendar className="h-4 w-4 mx-auto mt-1 text-purple-500" />
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{progress.totalWords}</div>
              <div className="text-sm text-gray-700">Total</div>
              <Target className="h-4 w-4 mx-auto mt-1 text-gray-500" />
            </div>
          </div>

          {/* Next milestone */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Next Milestone: {nextMilestone}%</span>
              <span className="text-sm text-muted-foreground">
                {Math.ceil((nextMilestone - progress.completionPercentage) / 100 * progress.totalWords)} words to go
              </span>
            </div>
            <Progress value={progressToNextMilestone} className="h-2" />
          </div>

          {/* Retention score */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium">Retention Score</span>
              <span className="text-lg font-semibold">{Math.round(progress.averageRetention)}%</span>
            </div>
            <Progress value={progress.averageRetention} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              How well you remember words from this collection
            </p>
          </div>

          {/* Action button */}
          <Button onClick={onStartPractice} className="w-full" size="lg">
            <Target className="h-4 w-4 mr-2" />
            Practice This Collection
          </Button>
        </CardContent>
      </Card>

      {/* Badges and Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Collection Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Current badges */}
            {progress.badges.map((badge) => (
              <div key={badge} className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Award className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800 capitalize text-sm">
                    {badge.replace('-', ' ')}
                  </div>
                  <div className="text-xs text-yellow-600">Earned</div>
                </div>
              </div>
            ))}

            {/* Available achievements */}
            {achievements.map((achievement) => {
              const isEarned = progress.badges.includes(achievement.id);
              const meetsRequirement = achievement.requirement.type === 'completion' && 
                                     progress.completionPercentage >= achievement.requirement.value;
              
              return (
                <div 
                  key={achievement.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border ${
                    isEarned ? 'bg-green-50 border-green-200' :
                    meetsRequirement ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-lg">{achievement.icon}</div>
                  <div>
                    <div className={`font-medium text-sm ${
                      isEarned ? 'text-green-800' :
                      meetsRequirement ? 'text-blue-800' :
                      'text-gray-600'
                    }`}>
                      {achievement.name}
                    </div>
                    <div className={`text-xs ${
                      isEarned ? 'text-green-600' :
                      meetsRequirement ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                      {achievement.requirement.value}% completion
                    </div>
                  </div>
                  {isEarned && <Badge variant="secondary" className="ml-auto text-xs">Earned</Badge>}
                  {meetsRequirement && !isEarned && <Badge className="ml-auto text-xs">Ready!</Badge>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionProgressTracker;
