import React, { useEffect, useState } from 'react';
import { ChevronDown, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Collection } from '@/utils/vocabulary-types';
import type { UserCollection } from '@/lib/collections';
import { LEARNING_GOALS, isLearningGoalId, type LearningGoalId } from '@/lib/learning-goals';
import { NEW_PER_DAY_MAX, NEW_PER_DAY_MIN, SOURCE_DUE, SOURCE_WORDS, collectionSourceValue } from './review-session';

interface SourcePickerProps {
  value: string;
  onChange: (value: string) => void;
  collections: Collection[];
  userCollections: UserCollection[];
  /** Number of words in `?words=`; the "Selected words" option shows only when > 0. */
  wordListCount: number;
  /** Label for a collection id from the URL that is not in either list (loading / not found). */
  unknownCollection?: { value: string; label: string };
  newPerDay: number;
  onNewPerDayChange: (value: number) => void;
  /** Learning goal whose words "Due & new" introduces first. */
  goal: LearningGoalId | null;
  onGoalChange: (value: LearningGoalId | null) => void;
}

const SELECT =
  'h-11 w-full min-w-0 appearance-none truncate rounded-2xl border-2 border-b-4 border-border bg-card pl-3 pr-9 text-[15px] font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Compact "what am I reviewing" bar: source select plus a settings popover. */
const SourcePicker: React.FC<SourcePickerProps> = ({
  value,
  onChange,
  collections,
  userCollections,
  wordListCount,
  unknownCollection,
  newPerDay,
  onNewPerDayChange,
  goal,
  onGoalChange,
}) => {
  const [draft, setDraft] = useState(String(newPerDay));
  useEffect(() => setDraft(String(newPerDay)), [newPerDay]);

  const commitDraft = () => {
    const n = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(n)) setDraft(String(newPerDay));
    else onNewPerDayChange(n);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="review-source" className="shrink-0 text-sm font-bold text-muted-foreground">
        Reviewing
      </label>
      <div className="relative min-w-0 flex-1">
        <select id="review-source" value={value} onChange={(e) => onChange(e.target.value)} className={SELECT}>
          <option value={SOURCE_DUE}>Due &amp; new</option>
          {(wordListCount > 0 || value === SOURCE_WORDS) && (
            <option value={SOURCE_WORDS}>Selected words ({wordListCount})</option>
          )}
          <optgroup label="Collections">
            {collections.map((c) => (
              <option key={c.id} value={collectionSourceValue(c.id)}>
                {c.name}
              </option>
            ))}
          </optgroup>
          {userCollections.length > 0 && (
            <optgroup label="My collections">
              {userCollections.map((c) => (
                <option key={c.id} value={collectionSourceValue(c.id)}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          )}
          {unknownCollection && <option value={unknownCollection.value}>{unknownCollection.label}</option>}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 text-muted-foreground" aria-label="Review settings">
            <Settings2 className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 rounded-2xl border-2 p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commitDraft();
            }}
            className="space-y-2"
          >
            <Label htmlFor="new-per-day" className="font-bold">
              New words per day
            </Label>
            <Input
              id="new-per-day"
              type="number"
              inputMode="numeric"
              min={NEW_PER_DAY_MIN}
              max={NEW_PER_DAY_MAX}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitDraft}
              className="h-11 rounded-xl border-2"
            />
            <p className="text-xs text-muted-foreground">
              Used by “Due &amp; new”. Due words always come first. Saved in this browser.
            </p>
          </form>
          <div className="mt-4 space-y-2 border-t-2 pt-4">
            <Label htmlFor="learning-goal" className="font-bold">
              Change goal
            </Label>
            <div className="relative">
              <select
                id="learning-goal"
                value={goal ?? ''}
                onChange={(e) => onGoalChange(isLearningGoalId(e.target.value) ? e.target.value : null)}
                className={SELECT}
                data-testid="goal-select"
              >
                <option value="">No goal (most common words)</option>
                {LEARNING_GOALS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
            <p className="text-xs text-muted-foreground">New words in “Due &amp; new” come from your goal first.</p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SourcePicker;
