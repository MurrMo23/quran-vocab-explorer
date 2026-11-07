import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Brain, CalendarClock, Info, TrendingDown } from 'lucide-react';
import { useProgress } from '@/lib/progress';
import ProgressReport from '@/components/ProgressReport';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getWordById } from '@/utils/vocabulary';
import {
  accuracyPerDay,
  hardestWords,
  reviewsPerDay,
  shortDateLabel,
  upcomingReviews,
  weekdayLabel,
} from './progress-utils';
import { getWordPath } from '@/utils/word-slugs';

/** Detailed analytics, all computed from the learner's review logs and FSRS cards. */
const LearningAnalyticsDashboard: React.FC = () => {
  const { loading, isGuest, cards, logs } = useProgress();

  const daily30 = useMemo(() => reviewsPerDay(logs, 30), [logs]);
  const accuracy30 = useMemo(
    () => accuracyPerDay(logs, 30).map((d) => ({ ...d, label: shortDateLabel(d.date) })),
    [logs],
  );
  const hardest = useMemo(() => hardestWords(logs, 10), [logs]);
  const upcoming = useMemo(() => upcomingReviews(cards, 7), [cards]);

  const total30 = daily30.reduce((s, d) => s + d.count, 0);
  const activeDays30 = daily30.filter((d) => d.count > 0).length;
  const ok30 = accuracy30.reduce((s, d) => s + (d.accuracy === null ? 0 : (d.accuracy / 100) * d.reviews), 0);
  const overall30 = total30 > 0 ? Math.round((ok30 / total30) * 100) : null;
  const upcomingTotal = upcoming.reduce((s, d) => s + d.count, 0);

  if (!loading && logs.length === 0) {
    return (
      <Card className="rounded-3xl shadow-none border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <Brain className="h-10 w-10 text-primary" />
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold">No reviews yet</h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              Once you start reviewing, you'll see your daily activity, accuracy trend, the words you find
              hardest, and what's coming up.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/review">Start your first review</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isGuest && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your progress is saved in this browser. Sign in to keep it across devices.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Reviews (30 days)', value: String(total30) },
          { label: 'Active days (30)', value: `${activeDays30}/30` },
          { label: 'Accuracy (30 days)', value: overall30 === null ? '—' : `${overall30}%` },
        ].map((t) => (
          <div key={t.label} className="rounded-[1.375rem] border-2 border-b-4 bg-card p-4">
            <div className="text-xs text-muted-foreground sm:text-sm">{t.label}</div>
            {loading ? (
              <Skeleton className="mt-1 h-7 w-14" />
            ) : (
              <div className="text-2xl font-extrabold tabular-nums sm:text-3xl">{t.value}</div>
            )}
          </div>
        ))}
      </div>

      <ProgressReport
        data={daily30}
        loading={loading}
        title="Reviews per day, last 30 days"
        labelStyle="date"
        height={220}
      />

      <Card className="rounded-3xl shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-extrabold">Accuracy trend, last 30 days</CardTitle>
          <p className="text-sm text-muted-foreground">
            Share of answers not rated "again" on each day you reviewed.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracy30} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} unit="%" />
                  <Tooltip
                    formatter={(value: number, _n, item) => [
                      `${value}% of ${(item.payload as { reviews: number }).reviews} reviews`,
                      'Accuracy',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Hardest words
            </CardTitle>
            <p className="text-sm text-muted-foreground">Most often rated "again".</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : hardest.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No misses yet. Words you rate "again" will show up here.
              </p>
            ) : (
              <ol className="divide-y">
                {hardest.map((h) => {
                  const word = getWordById(h.wordId);
                  return (
                    <li key={h.wordId} className="flex items-center justify-between gap-3 py-2">
                      <Link to={getWordPath(h.wordId)} className="min-w-0 hover:underline">
                        <span className="font-arabic text-lg" dir="rtl">
                          {word?.arabic ?? h.wordId}
                        </span>
                        {word && (
                          <span className="ml-2 truncate text-sm text-muted-foreground">{word.meaning}</span>
                        )}
                      </Link>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {h.again} of {h.total} missed
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="h-5 w-5 text-primary" />
              Upcoming reviews
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {loading ? ' ' : `${upcomingTotal} due in the next 7 days (overdue counted today).`}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <ul className="space-y-2">
                {upcoming.map((d, i) => {
                  const max = Math.max(1, ...upcoming.map((u) => u.count));
                  return (
                    <li key={d.date} className="flex items-center gap-3 text-sm">
                      <span className="w-20 shrink-0 text-muted-foreground">
                        {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekdayLabel(d.date)}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-track">
                        <div className="h-full bg-primary" style={{ width: `${(d.count / max) * 100}%` }} />
                      </div>
                      <span className="w-8 shrink-0 text-right tabular-nums">{d.count}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningAnalyticsDashboard;
