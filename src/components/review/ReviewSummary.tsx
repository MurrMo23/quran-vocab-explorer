import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Flame, CalendarClock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProgress, type Rating } from '@/lib/progress';
import { getWordById } from '@/utils/vocabulary';
import ProgressSaveNotice from '@/components/practice/ProgressSaveNotice';
import { formatUntil, nextDueAt } from './review-session';

export interface ReviewAnswer {
  wordId: string;
  rating: Rating;
  elapsedMs: number;
}

interface ReviewSummaryProps {
  answers: ReviewAnswer[];
  onReviewMore: () => void;
}

/** End-of-session summary built from the answers actually given. */
const ReviewSummary: React.FC<ReviewSummaryProps> = ({ answers, onReviewMore }) => {
  const { stats, cards } = useProgress();
  const reviewed = new Set(answers.map((a) => a.wordId)).size;
  const againCount = answers.filter((a) => a.rating === 'again').length;
  const next = nextDueAt(cards);
  const missed = [...new Set(answers.filter((a) => a.rating === 'again').map((a) => a.wordId))];

  return (
    <section className="mx-auto max-w-xl space-y-6 py-4" aria-labelledby="review-summary-title" data-testid="review-summary">
      <div className="text-center">
        <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-600" aria-hidden />
        <h2 id="review-summary-title" className="text-2xl font-bold">
          Session complete
        </h2>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4 text-center">
          <dt className="text-xs text-muted-foreground">Cards reviewed</dt>
          <dd className="text-3xl font-bold" data-testid="summary-reviewed">
            {reviewed}
          </dd>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <dt className="text-xs text-muted-foreground">Again</dt>
          <dd className="text-3xl font-bold text-red-600 dark:text-red-400" data-testid="summary-again">
            {againCount}
          </dd>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
          <CalendarClock className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <dt className="text-xs text-muted-foreground">Next review</dt>
            <dd className="font-semibold">{next ? formatUntil(next) : '—'}</dd>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
          <Flame className="h-5 w-5 shrink-0 text-orange-500" aria-hidden />
          <div>
            <dt className="text-xs text-muted-foreground">Streak</dt>
            <dd className="font-semibold">
              {stats.currentStreak} day{stats.currentStreak === 1 ? '' : 's'}
            </dd>
          </div>
        </div>
      </dl>

      {missed.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Coming back soon</h3>
          <ul className="divide-y rounded-xl border">
            {missed.map((id) => {
              const w = getWordById(id);
              return (
                <li key={id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <span className="arabic-text text-lg" lang="ar" dir="rtl">
                    {w?.arabic ?? id}
                  </span>
                  <span className="text-right text-muted-foreground">{w?.meaning}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="h-14 flex-1 text-base" onClick={onReviewMore}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Review more
        </Button>
        <Button size="lg" variant="outline" className="h-14 flex-1 text-base" asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <ProgressSaveNotice />
    </section>
  );
};

export default ReviewSummary;
