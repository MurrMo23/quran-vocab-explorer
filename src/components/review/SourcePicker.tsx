import React, { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Collection } from '@/utils/vocabulary-types';
import type { UserCollection } from '@/lib/collections';
import { NEW_PER_DAY_MAX, NEW_PER_DAY_MIN } from './review-session';

export const SOURCE_DUE = 'due';
export const SOURCE_WORDS = 'words';
export const collectionSourceValue = (id: string) => `c:${id}`;

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
}

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
      <label htmlFor="review-source" className="sr-only">
        Review
      </label>
      <select
        id="review-source"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 min-w-0 flex-1 truncate rounded-md border bg-background px-2 text-sm"
      >
        <option value={SOURCE_DUE}>Due &amp; new</option>
        {(wordListCount > 0 || value === SOURCE_WORDS) && (
          <option value={SOURCE_WORDS}>
            Selected words ({wordListCount})
          </option>
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

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" aria-label="Review settings">
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commitDraft();
            }}
            className="space-y-2"
          >
            <Label htmlFor="new-per-day">New words per day</Label>
            <Input
              id="new-per-day"
              type="number"
              inputMode="numeric"
              min={NEW_PER_DAY_MIN}
              max={NEW_PER_DAY_MAX}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitDraft}
            />
            <p className="text-xs text-muted-foreground">
              Used by “Due &amp; new”. Due words always come first. Saved in this browser.
            </p>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SourcePicker;
