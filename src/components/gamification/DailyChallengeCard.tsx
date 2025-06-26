
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock, Star } from 'lucide-react';
import { DailyChallenge } from '@/hooks/useGamification';

interface DailyChallengeCardProps {
  challenge: DailyChallenge | null;
  onStartChallenge?: () => void;
  userProgress?: number;
  isCompleted?: boolean;
}

const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  onStartChallenge,
  userProgress = 0,
  isCompleted = false
}) => {
  if (!challenge) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading today's challenge...</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = Math.min((userProgress / challenge.goal_value) * 100, 100);

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return '📚';
      case 'pronunciation': return '🗣️';
      case 'speed': return '⚡';
      case 'accuracy': return '🎯';
      default: return '🏆';
    }
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'vocabulary': return 'bg-blue-500';
      case 'pronunciation': return 'bg-green-500';
      case 'speed': return 'bg-yellow-500';
      case 'accuracy': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{getChallengeIcon(challenge.challenge_type)}</span>
            Daily Challenge
          </CardTitle>
          <Badge className={`${getChallengeColor(challenge.challenge_type)} text-white`}>
            {challenge.reward_points} points
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">{challenge.description}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>Goal: {challenge.goal_value}</span>
            {challenge.target_collection && (
              <>
                <span>•</span>
                <span>Collection: {challenge.target_collection}</span>
              </>
            )}
          </div>
        </div>

        {userProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{userProgress} / {challenge.goal_value}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg text-green-700">
            <Trophy className="h-5 w-5" />
            <span className="font-medium">Challenge Completed!</span>
            <Star className="h-5 w-5" />
          </div>
        ) : (
          <Button 
            onClick={onStartChallenge}
            className="w-full"
            size="lg"
          >
            {userProgress > 0 ? 'Continue Challenge' : 'Start Challenge'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyChallengeCard;
