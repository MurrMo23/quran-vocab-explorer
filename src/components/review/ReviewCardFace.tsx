import React from 'react';
import { Link } from 'react-router-dom';
import AudioPlayer from '@/components/AudioPlayer';
import type { Word } from '@/utils/vocabulary-types';
import { cn } from '@/lib/utils';
import { getWordPath } from '@/utils/word-slugs';

interface ReviewCardFaceProps {
  word: Word;
  revealed: boolean;
  isNew: boolean;
  /** Shown under the Arabic before the answer is revealed (e.g. "Choose the meaning"). */
  prompt?: string;
  /** Tapping the card reveals it (flip cards only). */
  onReveal?: () => void;
}

/** The card itself: Arabic and recitation on the front; meaning, root and an example verse on the back. */
const ReviewCardFace: React.FC<ReviewCardFaceProps> = ({ word, revealed, isNew, prompt, onReveal }) => {
  const example = word.examples?.[0];
  const tappable = !revealed && !!onReveal;

  const handleClick = (e: React.MouseEvent) => {
    if (!tappable) return;
    // Buttons and links inside the card (audio, word link) keep their own behaviour.
    if ((e.target as HTMLElement).closest('button, a')) return;
    onReveal?.();
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-card px-4 py-8 text-center shadow-sm sm:px-8',
        tappable && 'cursor-pointer select-none',
      )}
      onClick={handleClick}
      data-testid="review-card"
    >
      {isNew && (
        <span className="absolute left-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          New word
        </span>
      )}

      <p
        className="arabic-text text-center text-5xl font-bold leading-relaxed text-primary sm:text-6xl"
        lang="ar"
        dir="rtl"
        data-testid="review-arabic"
      >
        {word.arabic}
      </p>
      <div className="mt-3 flex justify-center">
        <AudioPlayer key={word.id} word={word} label="Listen" size="lg" showAttribution={false} />
      </div>

      {!revealed ? (
        <p className="mt-6 text-sm text-muted-foreground">{prompt ?? 'Recall the meaning, then tap to check'}</p>
      ) : (
        <div className="mt-6 space-y-4 text-left" data-testid="review-answer">
          <div className="text-center">
            <p className="text-2xl font-semibold">{word.meaning}</p>
            <p className="mt-1 text-muted-foreground">{word.transliteration}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {word.root && (
                <>
                  Root{' '}
                  <span className="arabic-text text-base" lang="ar" dir="rtl">
                    {word.root}
                  </span>
                </>
              )}
              {word.root && word.partOfSpeech ? ' · ' : ''}
              {word.partOfSpeech}
            </p>
          </div>

          {example && (example.arabicText || example.translation) && (
            <figure className="rounded-xl bg-muted p-4">
              {example.arabicText && (
                <p className="arabic-text text-xl leading-loose" lang="ar" dir="rtl">
                  {example.arabicText}
                </p>
              )}
              {example.translation && (
                <figcaption className="mt-2 text-sm text-muted-foreground">
                  “{example.translation}”
                  {example.surah > 0 && example.ayah > 0 && (
                    <span className="whitespace-nowrap"> — {example.surah}:{example.ayah}</span>
                  )}
                </figcaption>
              )}
            </figure>
          )}

          <p className="text-center">
            <Link
              to={getWordPath(word)}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Word details
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewCardFace;
