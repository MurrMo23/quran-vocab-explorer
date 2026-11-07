import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Word } from '@/utils/vocabulary-types';
import { cn } from '@/lib/utils';
import { getWordPath } from '@/utils/word-slugs';
import HearItButton from './HearItButton';

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
        'card-tactile relative flex flex-col items-center rounded-[2rem] px-5 pb-8 pt-9 text-center sm:px-10 sm:pb-9',
        tappable && 'cursor-pointer select-none',
      )}
      onClick={handleClick}
      data-testid="review-card"
    >
      {isNew && (
        <span className="absolute left-4 top-4 rounded-full bg-gold/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-gold-text">
          New word
        </span>
      )}

      <p
        className="font-quran text-[4.5rem] leading-[1.6] text-foreground sm:text-[6.5rem]"
        lang="ar"
        dir="rtl"
        data-testid="review-arabic"
      >
        {word.arabic}
      </p>
      <HearItButton key={word.id} word={word} className="mt-2" />

      {!revealed ? (
        <p className="mt-6 text-sm font-semibold text-muted-foreground">{prompt ?? 'Recall the meaning, then tap to check'}</p>
      ) : (
        <div className="mt-7 w-full space-y-5 border-t-2 border-border pt-6" data-testid="review-answer">
          <div>
            <p className="text-[1.75rem] font-extrabold leading-tight text-foreground">{word.meaning}</p>
            <p className="mt-1.5 text-base font-semibold text-muted-foreground">
              {word.transliteration}
              {(word.root || word.partOfSpeech) && <span aria-hidden> · </span>}
              {word.root && (
                <>
                  root{' '}
                  <span className="font-arabic text-lg text-foreground" lang="ar" dir="rtl">
                    {word.root}
                  </span>
                </>
              )}
              {word.root && word.partOfSpeech ? ', ' : ''}
              {word.partOfSpeech}
            </p>
          </div>

          {example && (example.arabicText || example.translation) && (
            <figure className="rounded-2xl bg-secondary/60 px-4 py-4 text-left dark:bg-secondary/50 sm:px-5">
              {example.arabicText && (
                <p className="font-arabic text-right text-2xl leading-loose text-foreground" lang="ar" dir="rtl">
                  {example.arabicText}
                </p>
              )}
              {example.translation && (
                <figcaption className="mt-2 text-sm leading-relaxed text-foreground/80">
                  “{example.translation}”
                  {example.surah > 0 && example.ayah > 0 && (
                    <span className="whitespace-nowrap font-semibold text-muted-foreground"> {example.surah}:{example.ayah}</span>
                  )}
                </figcaption>
              )}
            </figure>
          )}

          <p>
            <Link
              to={getWordPath(word)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Word details
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewCardFace;
