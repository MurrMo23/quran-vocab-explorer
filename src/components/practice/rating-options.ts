import type { Rating } from '@/lib/progress';

/** FSRS rating buttons: label, keyboard shortcut and colour classes. */
export const RATING_OPTIONS: { rating: Rating; label: string; key: string; className: string }[] = [
  { rating: 'again', label: 'Again', key: '1', className: 'border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30' },
  { rating: 'hard', label: 'Hard', key: '2', className: 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/30' },
  { rating: 'good', label: 'Good', key: '3', className: 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/30' },
  { rating: 'easy', label: 'Easy', key: '4', className: 'border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/30' },
];
