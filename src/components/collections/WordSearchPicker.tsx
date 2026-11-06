import React, { useMemo, useState } from 'react';
import { Check, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchWords, type Word } from '@/utils/vocabulary';

interface WordSearchPickerProps {
  /** Ids already chosen (shown as added). */
  selectedIds?: readonly string[];
  onPick: (word: Word) => void;
  placeholder?: string;
  limit?: number;
  pickLabel?: string;
}

/** Search the vocabulary by Arabic, transliteration or meaning, and pick a word. */
const WordSearchPicker: React.FC<WordSearchPickerProps> = ({
  selectedIds = [],
  onPick,
  placeholder = 'Search words by Arabic, transliteration or meaning',
  limit = 12,
  pickLabel = 'Add',
}) => {
  const [query, setQuery] = useState('');
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const results = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    return searchWords(q).slice(0, limit);
  }, [query, limit]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
          aria-label="Search words"
        />
      </div>
      {query.trim().length >= 2 && (
        <ul className="max-h-72 overflow-y-auto divide-y rounded-md border">
          {results.length === 0 ? (
            <li className="p-3 text-sm text-muted-foreground">No words match "{query.trim()}".</li>
          ) : (
            results.map((w) => {
              const isAdded = selected.has(w.id);
              return (
                <li key={w.id} className="flex items-center justify-between gap-3 p-2">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-arabic text-lg" lang="ar">
                        {w.arabic}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{w.transliteration}</span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{w.meaning}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={isAdded ? 'ghost' : 'outline'}
                    disabled={isAdded}
                    onClick={() => onPick(w)}
                    aria-label={isAdded ? `${w.meaning} already added` : `${pickLabel} ${w.meaning}`}
                  >
                    {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    <span className="ml-1 hidden sm:inline">{isAdded ? 'Added' : pickLabel}</span>
                  </Button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default WordSearchPicker;
