import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, BookOpen, HandHeart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/lib/progress';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { reviewWordsUrl } from '@/components/review/review-session';
import {
  LEARNING_GOALS,
  dismissGoalChooser,
  firstUnstarted,
  goalWordIds,
  isGoalChooserDone,
  readLearningGoal,
  writeLearningGoal,
  type LearningGoalId,
} from '@/lib/learning-goals';

const ICONS: Record<LearningGoalId, React.ComponentType<{ className?: string }>> = {
  salah: HandHeart,
  'juz-amma': BookOpen,
  'top-300': BarChart3,
};

/** Longer descriptions for the home page cards (the compact panel uses the goal's own description). */
const CARD_COPY: Record<LearningGoalId, string> = {
  salah: 'Al-Fatiha, Al-Ikhlas and the phrases you say in every prayer.',
  'juz-amma': 'The short surahs 78–114 that most people pray with, most frequent words first.',
  'top-300': 'The most frequent words across the whole Quran, in order of how often they appear.',
};

/** Icon tile colours per goal: mint for the first two, soft gold for the top 300 (as in the design). */
const TILE: Record<LearningGoalId, string> = {
  salah: 'bg-secondary text-primary',
  'juz-amma': 'bg-secondary text-primary',
  'top-300': 'bg-gold/20 text-gold-text',
};

/** Words per first session after picking a goal. */
const FIRST_SESSION = 10;

interface GoalChooserProps {
  className?: string;
  /**
   * 'panel' (default): first-visit card with a dismiss button; renders nothing on the server, until
   * mounted, and once dismissed or a goal is chosen.
   * 'cards': the home page section "Where do you want to start?"; always rendered (also on the server)
   * so the prerendered page is complete. After mount it marks the goal already chosen in this browser.
   */
  variant?: 'panel' | 'cards';
}

/**
 * "What do you want to understand?" Picking a goal remembers it in this browser and starts a review
 * of its first words.
 */
const GoalChooser: React.FC<GoalChooserProps> = ({ className, variant = 'panel' }) => {
  const navigate = useNavigate();
  const { cards } = useProgress();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<LearningGoalId | null>(null);

  useEffect(() => {
    if (variant === 'cards') setCurrent(readLearningGoal());
    else setVisible(!isGoalChooserDone());
  }, [variant]);

  const choose = (goal: LearningGoalId) => {
    writeLearningGoal(goal);
    track('goal_selected', { goal });
    setVisible(false);
    setCurrent(goal);
    const ids = firstUnstarted(goalWordIds(goal), (id) => !!cards.get(id)?.lastReview, FIRST_SESSION);
    navigate(reviewWordsUrl(ids));
  };

  if (variant === 'cards') {
    return (
      <section
        className={cn('mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8', className)}
        aria-labelledby="goal-chooser-heading"
        data-testid="goal-chooser"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="goal-chooser-heading"
            className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] sm:text-4xl"
          >
            Where do you want to start?
          </h2>
          <p className="text-base text-muted-foreground sm:text-[17px]">
            Pick a goal and your first review starts with its words. You can switch any time.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {LEARNING_GOALS.map((g) => {
            const Icon = ICONS[g.id];
            const isCurrent = current === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => choose(g.id)}
                data-testid={`goal-${g.id}`}
                className={cn(
                  'card-tactile group flex flex-col gap-3.5 p-6 text-left transition-[border-color,transform] hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-[2px] active:border-b-[3px]',
                  isCurrent && 'border-primary/70',
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className={cn('flex h-[52px] w-[52px] items-center justify-center rounded-2xl', TILE[g.id])}>
                    <Icon className="h-[26px] w-[26px]" aria-hidden="true" />
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                      Your goal
                    </span>
                  )}
                </span>
                <span className="text-[21px] font-extrabold leading-snug">{g.title}</span>
                <span className="text-[15px] leading-normal text-muted-foreground">{CARD_COPY[g.id]}</span>
                <span className="mt-auto flex items-center justify-between text-sm font-extrabold text-primary">
                  {goalWordIds(g.id).length} words
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (!visible) return null;

  const dismiss = () => {
    dismissGoalChooser();
    setVisible(false);
  };

  return (
    <section
      className={cn('relative rounded-xl border bg-card p-4 text-left shadow-sm sm:p-5', className)}
      aria-labelledby="goal-chooser-heading"
      data-testid="goal-chooser"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8"
        onClick={dismiss}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </Button>
      <h2 id="goal-chooser-heading" className="pr-8 text-lg font-semibold">
        What do you want to understand?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick a goal and we will start with its words. You can change it any time in the Review settings.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {LEARNING_GOALS.map((g) => {
          const Icon = ICONS[g.id];
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => choose(g.id)}
              data-testid={`goal-${g.id}`}
              className="flex items-start gap-3 rounded-lg border bg-background p-3 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block font-medium">{g.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {g.description} {goalWordIds(g.id).length} words.
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default GoalChooser;
