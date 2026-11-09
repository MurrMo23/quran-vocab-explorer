import type { Rating } from '@/lib/progress';
import { WRONG_OUTLINE, WRONG_SURFACE, WRONG_TEXT } from '@/components/review/feedback-styles';

/**
 * FSRS rating buttons for the opt-in Advanced grading in /review: label, a plain-language hint,
 * keyboard shortcut and tactile colour classes.
 */
export const RATING_OPTIONS: { rating: Rating; label: string; hint: string; key: string; className: string }[] = [
  { rating: 'again', label: 'Again', hint: 'Forgot it', key: '1', className: `${WRONG_SURFACE} ${WRONG_OUTLINE} ${WRONG_TEXT}` },
  { rating: 'hard', label: 'Hard', hint: 'Got it, with effort', key: '2', className: 'border-gold-shade bg-gold/15 text-gold-text dark:bg-gold/10' },
  { rating: 'good', label: 'Good', hint: 'Remembered', key: '3', className: 'border-primary bg-secondary text-secondary-foreground' },
  { rating: 'easy', label: 'Easy', hint: 'Too easy', key: '4', className: 'border-primary-shade bg-primary text-primary-foreground' },
];

/** "See again in 6 min" from a formatted interval ("6 min", "<1 min", "7 days"). */
export const seeAgainLabel = (interval: string) =>
  interval.startsWith('<') ? 'See again in under a minute' : `See again in ${interval}`;
