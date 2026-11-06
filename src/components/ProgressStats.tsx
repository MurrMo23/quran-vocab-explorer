import React from 'react';
import { BookOpen, CheckCircle2, Clock, Flame, Target, Trophy, Repeat } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProgressStats as Stats } from '@/lib/progress/types';

interface ProgressStatsProps {
  stats: Stats;
  loading?: boolean;
}

interface Tile {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}

/** Headline numbers, all taken directly from useProgress().stats. */
const ProgressStats: React.FC<ProgressStatsProps> = ({ stats, loading = false }) => {
  const tiles: Tile[] = [
    {
      label: 'Words started',
      value: String(stats.wordsStarted),
      hint: 'Reviewed at least once',
      icon: <BookOpen className="h-4 w-4 text-sky-600" />,
    },
    {
      label: 'Words mastered',
      value: String(stats.wordsMastered),
      hint: 'Remembered for 21+ days',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    },
    {
      label: 'Due now',
      value: String(stats.dueNow),
      hint: 'Ready for review',
      icon: <Clock className="h-4 w-4 text-amber-600" />,
    },
    {
      label: 'Reviews today',
      value: String(stats.reviewsToday),
      hint: 'Answers given today',
      icon: <Repeat className="h-4 w-4 text-violet-600" />,
    },
    {
      label: 'Current streak',
      value: `${stats.currentStreak} day${stats.currentStreak === 1 ? '' : 's'}`,
      hint: 'Consecutive days reviewing',
      icon: <Flame className="h-4 w-4 text-orange-500" />,
    },
    {
      label: 'Longest streak',
      value: `${stats.longestStreak} day${stats.longestStreak === 1 ? '' : 's'}`,
      hint: 'Your best run',
      icon: <Trophy className="h-4 w-4 text-yellow-600" />,
    },
    {
      label: '7-day accuracy',
      value: stats.accuracy7d === null ? '—' : `${Math.round(stats.accuracy7d * 100)}%`,
      hint: stats.accuracy7d === null ? 'No reviews this week' : "Answers not rated 'again'",
      icon: <Target className="h-4 w-4 text-rose-600" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            {tile.icon}
            <span>{tile.label}</span>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-semibold tabular-nums">{tile.value}</div>
          )}
          <div className="mt-1 text-xs text-muted-foreground">{tile.hint}</div>
        </div>
      ))}
    </div>
  );
};

export default ProgressStats;
