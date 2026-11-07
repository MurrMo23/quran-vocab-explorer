import type { Rating } from '@/lib/progress';
import { WRONG_OUTLINE, WRONG_SURFACE, WRONG_TEXT } from '@/components/review/feedback-styles';

/** FSRS rating buttons: label, keyboard shortcut and tactile colour classes (used by /review). */
export const RATING_OPTIONS: { rating: Rating; label: string; key: string; className: string }[] = [
  { rating: 'again', label: 'Again', key: '1', className: `${WRONG_SURFACE} ${WRONG_OUTLINE} ${WRONG_TEXT}` },
  { rating: 'hard', label: 'Hard', key: '2', className: 'border-gold-shade bg-gold/15 text-gold-text dark:bg-gold/10' },
  { rating: 'good', label: 'Good', key: '3', className: 'border-primary bg-secondary text-secondary-foreground' },
  { rating: 'easy', label: 'Easy', key: '4', className: 'border-primary-shade bg-primary text-primary-foreground' },
];
