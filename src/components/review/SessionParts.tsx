import React from 'react';
import { Check, Flame, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Rating } from '@/lib/progress';
import type { Word } from '@/utils/vocabulary-types';
import { RATING_OPTIONS } from '@/components/practice/rating-options';
import { cn } from '@/lib/utils';
import { WRONG_OUTLINE, WRONG_SURFACE, WRONG_TEXT, WRONG_BODY } from './feedback-styles';

/* ------------------------------------------------------------------ top bar */

interface SessionTopBarProps {
  /** Items finished (the current one counts once it has been answered). */
  done: number;
  total: number;
  streak: number;
  onClose: () => void;
  closeLabel: string;
}

/** Focused session header: close, a chunky progress bar and the day streak. */
export const SessionTopBar: React.FC<SessionTopBarProps> = ({ done, total, streak, onClose, closeLabel }) => {
  const pct = Math.min(100, Math.max(0, (done / Math.max(1, total)) * 100));
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        title={closeLabel}
        className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-6 w-6" strokeWidth={2.4} aria-hidden />
      </button>
      <div
        role="progressbar"
        aria-label="Session progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${done} of ${total} done`}
        className="h-4 flex-1 overflow-hidden rounded-full bg-track"
      >
        <div
          className="relative h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-out"
          style={{ width: `${pct}%` }}
        >
          {/* Highlight stripe, as on the tactile buttons. */}
          {pct > 6 && <span className="absolute inset-x-2 top-[3px] h-[3px] rounded-full bg-white/25" aria-hidden />}
        </div>
      </div>
      <span
        className="flex shrink-0 items-center gap-1.5 text-base font-extrabold text-gold-text"
        aria-label={`${streak}-day streak`}
        title={`${streak}-day streak`}
      >
        <Flame className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        {streak}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------ choice options */

interface ChoiceOptionsProps {
  options: string[];
  answer: string;
  chosen: string | null;
  onChoose: (option: string) => void;
}

const KEY_BADGE = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-2 text-sm font-extrabold';

/** 2×2 tactile answers (one column on phones) with their number keys. */
export const ChoiceOptions: React.FC<ChoiceOptionsProps> = ({ options, answer, chosen, onChoose }) => {
  const answered = chosen !== null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5" role="group" aria-label="Choose the meaning">
      {options.map((opt, i) => {
        const isCorrect = opt === answer;
        const picked = chosen === opt;
        const tone = !answered ? 'idle' : isCorrect ? 'correct' : picked ? 'wrong' : 'rest';
        return (
          <button
            key={opt}
            type="button"
            disabled={answered}
            onClick={() => onChoose(opt)}
            aria-keyshortcuts={String(i + 1)}
            aria-pressed={answered ? picked : undefined}
            data-testid="choice-option"
            className={cn(
              'flex min-h-[60px] w-full items-center gap-3.5 rounded-[18px] border-2 border-b-4 px-4 py-3 text-left text-[17px] font-extrabold leading-snug sm:min-h-[68px] sm:px-5 sm:text-lg',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'motion-safe:transition-[transform,border-width,background-color,border-color]',
              tone === 'idle' &&
                'border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/40 active:translate-y-[2px] active:border-b-2 motion-reduce:active:translate-y-0',
              tone === 'correct' && 'border-primary bg-secondary text-secondary-foreground',
              tone === 'wrong' && cn(WRONG_SURFACE, WRONG_OUTLINE, WRONG_TEXT),
              tone === 'rest' && 'border-border bg-card text-muted-foreground',
              answered && 'cursor-default',
            )}
          >
            <span
              className={cn(
                KEY_BADGE,
                tone === 'correct' ? 'border-primary text-secondary-foreground' : tone === 'wrong' ? cn(WRONG_OUTLINE, WRONG_TEXT) : 'border-border text-muted-foreground',
              )}
              aria-hidden
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">{opt}</span>
            {tone === 'correct' && (
              <>
                <Check className="h-5 w-5 shrink-0" strokeWidth={3} aria-hidden />
                <span className="sr-only">(correct answer)</span>
              </>
            )}
            {tone === 'wrong' && (
              <>
                <X className="h-5 w-5 shrink-0" strokeWidth={3} aria-hidden />
                <span className="sr-only">(your answer)</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------- feedback bar */

export type FeedbackState =
  | { kind: 'flip-front' }
  | { kind: 'flip-back'; word: Word; previewInterval: (wordId: string, rating: Rating) => string }
  | { kind: 'choice-idle' }
  | { kind: 'correct'; word: Word }
  | { kind: 'wrong'; word: Word };

interface FeedbackBarProps {
  state: FeedbackState;
  onReveal: () => void;
  onRate: (rating: Rating) => void;
  onContinue: () => void;
}

const meaningLine = (word: Word) => {
  const name = word.transliteration || word.arabic;
  return `${name} means “${word.meaning}”.`;
};

/**
 * The bar under the session (sticks to the bottom of the viewport while the session is on screen):
 * the reveal button, the rating buttons, or the correct / not-quite feedback with Continue.
 */
export const FeedbackBar: React.FC<FeedbackBarProps> = ({ state, onReveal, onRate, onContinue }) => {
  const tone = state.kind === 'correct' ? 'correct' : state.kind === 'wrong' ? 'wrong' : 'neutral';

  let message: React.ReactNode = null;
  if (state.kind === 'correct') {
    const freq = state.word.frequencyVerified && state.word.frequency > 0 ? state.word.frequency : 0;
    message = (
      <>
        <p className="text-xl font-extrabold leading-tight text-secondary-foreground">Correct!</p>
        <p className="mt-0.5 text-sm text-foreground/80">
          {meaningLine(state.word)}
          {freq > 0 && ` It appears ${freq} ${freq === 1 ? 'time' : 'times'} in the Quran.`}
        </p>
      </>
    );
  } else if (state.kind === 'wrong') {
    message = (
      <>
        <p className={cn('text-xl font-extrabold leading-tight', WRONG_TEXT)}>Not quite</p>
        <p className={cn('mt-0.5 text-sm', WRONG_BODY)}>{meaningLine(state.word)} It will come back again soon.</p>
      </>
    );
  } else if (state.kind === 'choice-idle') {
    message = (
      <p className="text-sm font-semibold text-muted-foreground">
        Choose an answer<span className="hidden sm:inline"> · press 1–4</span>
      </p>
    );
  } else if (state.kind === 'flip-front') {
    message = (
      <p className="hidden text-sm font-semibold text-muted-foreground sm:block">Space to reveal · 1–4 to rate</p>
    );
  } else {
    message = <p className="text-sm font-bold text-muted-foreground">How well did you remember it?</p>;
  }

  return (
    <div
      className={cn(
        'sticky bottom-0 z-40 border-t-2 motion-safe:transition-colors',
        tone === 'correct' && 'border-primary/25 bg-secondary',
        tone === 'wrong' && WRONG_SURFACE,
        tone === 'neutral' && 'border-border bg-card',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      data-testid="review-feedback"
      data-state={state.kind}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-3xl gap-3 px-4 py-4 sm:px-6 sm:py-5',
          state.kind === 'flip-back' ? 'flex-col' : 'flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        )}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          {tone === 'correct' && (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-200">
              <Check className="h-[26px] w-[26px]" strokeWidth={3} aria-hidden />
            </span>
          )}
          {tone === 'wrong' && (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-200">
              <X className="h-6 w-6" strokeWidth={3} aria-hidden />
            </span>
          )}
          {/* Persistent live region: the verdict is announced when it appears. */}
          <div className="min-w-0" aria-live="polite" aria-atomic="true" data-testid="review-feedback-text">
            {message}
          </div>
        </div>

        {state.kind === 'flip-front' && (
          <Button size="lg" className="w-full sm:w-auto sm:min-w-[12rem]" onClick={onReveal} data-testid="review-show-answer">
            Show answer
          </Button>
        )}

        {state.kind === 'flip-back' && (
          <div className="grid grid-cols-4 gap-2 sm:gap-3" role="group" aria-label="How well did you remember it?">
            {RATING_OPTIONS.map((o) => (
              <button
                key={o.rating}
                type="button"
                onClick={() => onRate(o.rating)}
                aria-keyshortcuts={o.key}
                data-testid={`rate-${o.rating}`}
                className={cn(
                  'relative flex h-16 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-b-4 px-1',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                  'hover:brightness-[0.97] active:translate-y-[2px] active:border-b-2 motion-safe:transition-[transform,border-width] motion-reduce:active:translate-y-0',
                  o.className,
                )}
              >
                <span className="absolute left-2 top-1.5 hidden text-[11px] font-extrabold opacity-70 sm:block" aria-hidden>
                  {o.key}
                </span>
                <span className="text-base font-extrabold leading-none">{o.label}</span>
                <span className="text-xs font-semibold opacity-90">{state.previewInterval(state.word.id, o.rating)}</span>
              </button>
            ))}
          </div>
        )}

        {(state.kind === 'correct' || state.kind === 'wrong') && (
          <Button
            size="lg"
            variant={state.kind === 'correct' ? 'default' : 'destructive'}
            className="w-full shrink-0 sm:w-auto sm:min-w-[10rem]"
            onClick={onContinue}
            autoFocus
            data-testid="review-continue"
          >
            {state.kind === 'correct' ? 'Continue' : 'Got it'}
          </Button>
        )}
      </div>
    </div>
  );
};
