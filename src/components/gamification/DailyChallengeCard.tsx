import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Trophy } from 'lucide-react';
import { useProgress } from '@/lib/progress';
import { DailyChallenge, measureChallenge } from '@/hooks/useGamification';

interface DailyChallengeCardProps {
  challenge: DailyChallenge | null;
  onStartChallenge?: () => void;
  /** Overrides the progress measured from the learner's reviews. */
  userProgress?: number;
  isCompleted?: boolean;
}

/** Today's challenge, with progress measured from real reviews. "Start" opens Review. */
const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  onStartChallenge,
  userProgress,
  isCompleted,
}) => {
  const { stats, logs, loading } = useProgress();

  if (!challenge) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-muted-foreground">No challenge today.</CardContent>
      </Card>
    );
  }

  const progress = userProgress ?? measureChallenge(challenge, stats, logs);
  const done = isCompleted ?? progress >= challenge.goal_value;
  const pct = Math.min((progress / challenge.goal_value) * 100, 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Daily Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">{challenge.description}</h3>

        {challenge.goal_value > 1 && !loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress today</span>
              <span className="tabular-nums">
                {Math.min(progress, challenge.goal_value)} / {challenge.goal_value}
              </span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        )}

        {done ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <Trophy className="h-5 w-5" />
            <span className="font-medium">Challenge completed!</span>
          </div>
        ) : (
          <Button asChild className="w-full" size="lg" onClick={onStartChallenge}>
            <Link to="/review">{progress > 0 ? 'Continue reviewing' : 'Start reviewing'}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyChallengeCard;
