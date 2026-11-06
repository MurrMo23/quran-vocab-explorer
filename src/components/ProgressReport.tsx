import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { DailyCount } from '@/lib/progress/types';
import { shortDateLabel, weekdayLabel } from '@/components/analytics/progress-utils';

interface ProgressReportProps {
  /** Daily review counts, oldest first (e.g. stats.reviewsLast7Days). */
  data: readonly DailyCount[];
  loading?: boolean;
  title?: string;
  /** Use weekday labels (7-day view) or short dates (longer ranges). */
  labelStyle?: 'weekday' | 'date';
  height?: number;
}

/** Bar chart of real reviews per day. */
const ProgressReport: React.FC<ProgressReportProps> = ({
  data,
  loading = false,
  title = 'Reviews, last 7 days',
  labelStyle = 'weekday',
  height = 200,
}) => {
  const rows = data.map((d) => ({
    ...d,
    label: labelStyle === 'weekday' ? weekdayLabel(d.date) : shortDateLabel(d.date),
  }));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {!loading && (
          <span className="text-sm text-muted-foreground tabular-nums">
            {total} review{total === 1 ? '' : 's'}
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="w-full" style={{ height }} />
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                interval={labelStyle === 'date' ? 'preserveStartEnd' : 0}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                labelFormatter={(_l, payload) =>
                  payload?.[0] ? shortDateLabel((payload[0].payload as DailyCount).date) : ''
                }
                formatter={(value: number) => [value, 'Reviews']}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProgressReport;
