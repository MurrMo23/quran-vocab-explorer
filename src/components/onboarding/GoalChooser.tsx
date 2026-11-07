import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, HandHeart, Sparkles, X } from 'lucide-react';
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
  writeLearningGoal,
  type LearningGoalId,
} from '@/lib/learning-goals';

const ICONS: Record<LearningGoalId, React.ComponentType<{ className?: string }>> = {
  salah: HandHeart,
  'juz-amma': BookOpen,
  'top-300': Sparkles,
};

/** Words per first session after picking a goal. */
const FIRST_SESSION = 10;

interface GoalChooserProps {
  className?: string;
}

/**
 * First-visit card: "What do you want to understand?" Picking a goal remembers it in this browser and
 * starts a review of its first words. Renders nothing on the server and until mounted (it depends on
 * browser storage), and nothing once dismissed or a goal is chosen.
 */
const GoalChooser: React.FC<GoalChooserProps> = ({ className }) => {
  const navigate = useNavigate();
  const { cards } = useProgress();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!isGoalChooserDone());
  }, []);

  if (!visible) return null;

  const choose = (goal: LearningGoalId) => {
    writeLearningGoal(goal);
    track('goal_selected', { goal });
    setVisible(false);
    const ids = firstUnstarted(goalWordIds(goal), (id) => !!cards.get(id)?.lastReview, FIRST_SESSION);
    navigate(reviewWordsUrl(ids));
  };

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
