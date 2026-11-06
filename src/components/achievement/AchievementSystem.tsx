import React, { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useProgress } from '@/lib/progress';
import { deriveAchievements } from '@/utils/achievement-system';

/** Achievements computed from the learner's real review history. */
const AchievementSystem: React.FC<{ className?: string }> = ({ className }) => {
  const { stats, logs, loading } = useProgress();
  const achievements = useMemo(() => deriveAchievements(stats, logs), [stats, logs]);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Milestones
          </span>
          {!loading && (
            <span className="text-sm font-normal text-muted-foreground">
              {unlockedCount} of {achievements.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => (
            <li
              key={a.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3',
                a.unlocked ? 'border-amber-300 bg-amber-50/60 dark:bg-amber-950/20' : 'opacity-80',
              )}
            >
              <span className={cn('text-2xl leading-none', !a.unlocked && 'grayscale')} aria-hidden>
                {a.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {loading ? '…' : `${a.progress}/${a.target}`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{a.description}</p>
                {!a.unlocked && a.target > 1 && !loading && (
                  <Progress value={(a.progress / a.target) * 100} className="mt-2 h-1.5" />
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default AchievementSystem;
