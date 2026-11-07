import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Flame, CalendarClock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProgress, type Rating } from '@/lib/progress';
import { getWordById } from '@/utils/vocabulary';
import ProgressSaveNotice from '@/components/practice/ProgressSaveNotice';
import { formatUntil, nextDueAt } from './review-session';
import { WRONG_TEXT } from './feedback-styles';
import { cn } from '@/lib/utils';

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
    <section className="space-y-6" aria-labelledby="review-summary-title" data-testid="review-summary">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border-b-[5px] border-primary-shade bg-primary text-primary-foreground">
          <Check className="h-10 w-10" strokeWidth={3} aria-hidden />
        </span>
        <h2 id="review-summary-title" className="mt-4 text-[1.75rem] font-extrabold leading-tight">
          Session complete
        </h2>
        <p className="mt-1 text-base text-muted-foreground">Each word is scheduled for its next review.</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="card-tactile p-4 text-center sm:p-5">
          <dt className="text-sm font-bold text-muted-foreground">Words reviewed</dt>
          <dd className="mt-1 text-4xl font-extrabold text-primary" data-testid="summary-reviewed">
            {reviewed}
          </dd>
        </div>
        <div className="card-tactile p-4 text-center sm:p-5">
          <dt className="text-sm font-bold text-muted-foreground">Again</dt>
          <dd className={cn('mt-1 text-4xl font-extrabold', againCount > 0 ? WRONG_TEXT : 'text-foreground')} data-testid="summary-again">
            {againCount}
          </dd>
        </div>
        <div className="card-tactile flex items-center gap-3 p-4 sm:p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <CalendarClock className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <dt className="text-sm font-bold text-muted-foreground">Next review</dt>
            <dd className="font-extrabold">{next ? formatUntil(next) : '—'}</dd>
          </div>
        </div>
        <div className="card-tactile flex items-center gap-3 p-4 sm:p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold-text">
            <Flame className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <dt className="text-sm font-bold text-muted-foreground">Streak</dt>
            <dd className="font-extrabold">
              {stats.currentStreak} day{stats.currentStreak === 1 ? '' : 's'}
            </dd>
          </div>
        </div>
      </dl>

      {missed.length > 0 && (
        <div>
          <h3 className="mb-2 text-base font-extrabold">Coming back soon</h3>
          <ul className="card-tactile divide-y-2 divide-border overflow-hidden">
            {missed.map((id) => {
              const w = getWordById(id);
              return (
                <li key={id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="font-arabic text-2xl leading-normal" lang="ar" dir="rtl">
                    {w?.arabic ?? id}
                  </span>
                  <span className="text-right text-sm font-semibold text-muted-foreground">{w?.meaning}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="sm:flex-1" onClick={onReviewMore}>
          <RotateCcw aria-hidden />
          Review more
        </Button>
        <Button size="lg" variant="outline" className="sm:flex-1" asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <ProgressSaveNotice />
    </section>
  );
};

export default ReviewSummary;
