import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { CardState } from '@/lib/progress/types';
import { collectionProgress, percent } from '@/components/analytics/progress-utils';

interface CollectionProgressTrackerProps {
  cards: ReadonlyMap<string, CardState>;
  loading?: boolean;
  /** How many collections to show before "Show all". */
  initialCount?: number;
}

/**
 * Per-collection progress: share of each collection's words the learner has started and mastered.
 * Computed from the progress engine's cards and getWordsByCollection.
 */
const CollectionProgressTracker: React.FC<CollectionProgressTrackerProps> = ({
  cards,
  loading = false,
  initialCount = 6,
}) => {
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    const all = collectionProgress(cards);
    // Collections in progress first (by share started), then the rest in catalogue order.
    return all
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const diff = b.row.started / b.row.total - a.row.started / a.row.total;
        return diff !== 0 ? diff : a.index - b.index;
      })
      .map(({ row }) => row);
  }, [cards]);

  const visible = showAll ? rows : rows.slice(0, initialCount);

  return (
    <div className="rounded-3xl border bg-card p-5 sm:p-7">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-extrabold">Collections</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-primary/40" /> started
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" /> mastered
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections available.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {visible.map((row) => {
              const startedPct = percent(row.started, row.total);
              const masteredPct = percent(row.mastered, row.total);
              return (
                <li key={row.id}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <Link to={`/collections/${row.id}`} className="truncate font-medium hover:underline">
                      {row.name}
                    </Link>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {row.started}/{row.total} started · {row.mastered} mastered
                    </span>
                  </div>
                  <div
                    className="relative h-2 overflow-hidden rounded-full bg-track"
                    role="img"
                    aria-label={`${startedPct}% started, ${masteredPct}% mastered`}
                  >
                    <div className="absolute inset-y-0 left-0 bg-primary/40" style={{ width: `${startedPct}%` }} />
                    <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${masteredPct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          {rows.length > initialCount && (
            <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => setShowAll((v) => !v)}>
              {showAll ? (
                <>
                  Show fewer <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Show all {rows.length} collections <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default CollectionProgressTracker;
