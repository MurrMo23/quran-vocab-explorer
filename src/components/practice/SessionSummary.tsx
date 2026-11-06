import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, RotateCcw, Flame, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProgress, type Rating } from '@/lib/progress';
import { getWordById } from '@/utils/vocabulary';
import ProgressSaveNotice from './ProgressSaveNotice';

export interface SessionAnswer {
  wordId: string;
  rating: Rating;
  elapsedMs: number;
  /** Next due date (ISO) after this answer. */
  due: string;
}

interface SessionSummaryProps {
  answers: SessionAnswer[];
  onRestart: () => void;
  onChangeCollection?: () => void;
}

const RATING_LABEL: Record<Rating, string> = { again: 'Again', hard: 'Hard', good: 'Good', easy: 'Easy' };
const RATING_COLOR: Record<Rating, string> = {
  again: 'text-red-600 dark:text-red-400',
  hard: 'text-amber-600 dark:text-amber-400',
  good: 'text-green-600 dark:text-green-400',
  easy: 'text-blue-600 dark:text-blue-400',
};

const formatDuration = (ms: number) => {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
};

/** End-of-session summary built only from the answers actually given. */
const SessionSummary: React.FC<SessionSummaryProps> = ({ answers, onRestart, onChangeCollection }) => {
  const { stats } = useProgress();

  const counts: Record<Rating, number> = { again: 0, hard: 0, good: 0, easy: 0 };
  for (const a of answers) counts[a.rating]++;
  const total = answers.length;
  const recalled = total - counts.again;
  const wordsReviewed = new Set(answers.map((a) => a.wordId)).size;
  const totalTime = answers.reduce((sum, a) => sum + a.elapsedMs, 0);

  // Latest answer per word, to show when each word comes back.
  const latest = new Map<string, SessionAnswer>();
  for (const a of answers) latest.set(a.wordId, a);
  const missed = [...latest.values()].filter((a) => answers.some((x) => x.wordId === a.wordId && x.rating === 'again'));

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="text-center">
        <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-600" aria-hidden />
        <CardTitle className="text-2xl">Session complete</CardTitle>
        <p className="text-muted-foreground">
          {wordsReviewed} {wordsReviewed === 1 ? 'word' : 'words'} reviewed · {total} {total === 1 ? 'answer' : 'answers'} in{' '}
          {formatDuration(totalTime)}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(counts) as Rating[]).map((r) => (
            <div key={r} className="rounded-lg border p-3 text-center">
              <div className={`text-2xl font-bold ${RATING_COLOR[r]}`}>{counts[r]}</div>
              <div className="text-xs text-muted-foreground">{RATING_LABEL[r]}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            <CheckCircle className="h-5 w-5 text-green-600" aria-hidden />
            <div>
              <div className="font-semibold">{total > 0 ? Math.round((recalled / total) * 100) : 0}% recalled</div>
              <div className="text-xs text-muted-foreground">Answers not rated “Again”</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            <Flame className="h-5 w-5 text-orange-500" aria-hidden />
            <div>
              <div className="font-semibold">
                {stats.currentStreak} day{stats.currentStreak === 1 ? '' : 's'} streak
              </div>
              <div className="text-xs text-muted-foreground">{stats.dueNow} words due now</div>
            </div>
          </div>
        </div>

        {missed.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="h-4 w-4" aria-hidden /> Words to watch
            </h3>
            <ul className="divide-y rounded-lg border">
              {missed.map((a) => {
                const w = getWordById(a.wordId);
                return (
                  <li key={a.wordId} className="flex items-center justify-between p-3 text-sm">
                    <span>
                      <span className="arabic-text mr-2 text-lg" lang="ar" dir="rtl">
                        {w?.arabic ?? a.wordId}
                      </span>
                      <span className="text-muted-foreground">{w?.meaning}</span>
                    </span>
                    <span className={RATING_COLOR[a.rating]}>{RATING_LABEL[a.rating]}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <ProgressSaveNotice />

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={onRestart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Practice again
          </Button>
          {onChangeCollection && (
            <Button variant="outline" onClick={onChangeCollection}>
              Choose another collection
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionSummary;
