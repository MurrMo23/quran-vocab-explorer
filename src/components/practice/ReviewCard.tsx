import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/AudioPlayer';
import type { Word } from '@/utils/vocabulary-types';
import type { Rating } from '@/lib/progress';
import { RATING_OPTIONS } from './rating-options';
import { cn } from '@/lib/utils';


interface ReviewCardProps {
  word: Word;
  revealed: boolean;
  isNew: boolean;
  onReveal: () => void;
  onRate: (rating: Rating) => void;
  previewInterval: (rating: Rating) => string;
  disabled?: boolean;
}

const isTypingTarget = (el: EventTarget | null) => {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable;
};

/** One flashcard: Arabic front, reveal, then rate with FSRS buttons (keys: Space, 1–4). */
const ReviewCard: React.FC<ReviewCardProps> = ({ word, revealed, isNew, onReveal, onRate, previewInterval, disabled }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      if (!revealed && (e.key === ' ' || e.key === 'Enter')) {
        // Let focused buttons (e.g. audio) handle their own activation.
        if ((e.target as HTMLElement | null)?.tagName === 'BUTTON' && e.key === 'Enter') return;
        e.preventDefault();
        onReveal();
        return;
      }
      if (revealed) {
        const option = RATING_OPTIONS.find((o) => o.key === e.key);
        if (option) {
          e.preventDefault();
          onRate(option.rating);
        } else if (e.key === ' ') {
          e.preventDefault(); // don't scroll the page
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, onReveal, onRate, disabled]);

  return (
    <Card className="mb-4">
      <CardContent className="p-8 text-center">
        {isNew && (
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            New word
          </span>
        )}
        <div className="mb-6">
          <h2 className="arabic-text mb-2 text-4xl font-bold text-primary" lang="ar" dir="rtl">
            {word.arabic}
          </h2>
          <p className="text-lg text-muted-foreground">{word.transliteration}</p>
          <div className="mt-3 flex justify-center">
            <AudioPlayer key={word.id} word={word} label="Listen" size="sm" showAttribution={false} />
          </div>
        </div>

        {!revealed ? (
          <div className="space-y-2">
            <Button onClick={onReveal} size="lg" disabled={disabled}>
              Show Answer
            </Button>
            <p className="hidden text-xs text-muted-foreground sm:block">Press Space to reveal</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg bg-muted p-4">
              <p className="mb-2 text-xl font-semibold">{word.meaning}</p>
              <p className="text-sm text-muted-foreground">
                {[word.partOfSpeech, word.root].filter(Boolean).join(' • ')}
              </p>
            </div>

            <div>
              <p className="mb-3 text-sm text-muted-foreground">How well did you remember it?</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RATING_OPTIONS.map((o) => (
                  <Button
                    key={o.rating}
                    variant="outline"
                    className={cn('h-auto flex-col gap-0.5 py-2', o.className)}
                    onClick={() => onRate(o.rating)}
                    disabled={disabled}
                    aria-keyshortcuts={o.key}
                  >
                    <span className="font-semibold">{o.label}</span>
                    <span className="text-xs opacity-80">{previewInterval(o.rating)}</span>
                  </Button>
                ))}
              </div>
              <p className="mt-2 hidden text-xs text-muted-foreground sm:block">Keys 1–4</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
