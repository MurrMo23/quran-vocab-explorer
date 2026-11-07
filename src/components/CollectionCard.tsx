import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LEVELS,
  LEVEL_FILL,
  LEVEL_LABEL,
  LEVEL_TEXT,
  type LevelCounts,
} from '@/components/collections/collection-meta';

interface CollectionCardProps {
  id: string;
  title: string;
  description: string;
  count: number;
  className?: string;
  icon?: React.ReactNode;
  wordCount?: number;
  /** Optional label chip (e.g. "Custom"). */
  difficulty?: string;
  /** Words per level; shown as a split bar and legend when given. */
  levels?: LevelCounts;
}

/** Tactile link card for one collection on the /collections index. */
const CollectionCard: React.FC<CollectionCardProps> = ({
  id,
  title,
  description,
  count,
  className,
  icon = <BookOpen className="h-6 w-6" />,
  wordCount,
  difficulty,
  levels,
}) => {
  // Use wordCount if provided, otherwise fall back to count
  const displayCount = wordCount !== undefined ? wordCount : count;
  const levelTotal = levels ? LEVELS.reduce((sum, l) => sum + levels[l], 0) : 0;

  return (
    <Link
      to={`/collections/${id}`}
      className={cn(
        'card-tactile group flex h-full flex-col gap-3 rounded-[26px] p-5 text-foreground no-underline transition-colors',
        'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary"
          aria-hidden="true"
        >
          {icon}
        </span>
        <ChevronRight
          className="mt-3 h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-extrabold leading-snug">{title}</h2>
        {description && <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border bg-background px-3 py-1 text-[13px] font-bold">
            {displayCount} {displayCount === 1 ? 'word' : 'words'}
          </span>
          {difficulty && (
            <span className="rounded-full bg-secondary px-3 py-1 text-[13px] font-bold text-secondary-foreground">
              {difficulty}
            </span>
          )}
        </div>

        {levels && levelTotal > 0 && (
          <>
            <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-track" aria-hidden="true">
              {LEVELS.filter((l) => levels[l] > 0).map((l) => (
                <span key={l} className={LEVEL_FILL[l]} style={{ width: `${(levels[l] / levelTotal) * 100}%` }} />
              ))}
            </div>
            <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-bold">
              {LEVELS.filter((l) => levels[l] > 0).map((l) => (
                <span key={l} className={LEVEL_TEXT[l]}>
                  {levels[l]} {LEVEL_LABEL[l].toLowerCase()}
                </span>
              ))}
            </p>
          </>
        )}
      </div>
    </Link>
  );
};

export default CollectionCard;
