-- FSRS learner progress: per-word FSRS memory state on user_word_progress, plus a review log.
-- Idempotent: safe to run more than once. Existing columns are kept for compatibility.

-- ---------------------------------------------------------------------------
-- 1. user_word_progress: FSRS columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_word_progress
  ADD COLUMN IF NOT EXISTS stability   double precision NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS difficulty  double precision NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS due         timestamptz      NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS reps        integer          NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lapses      integer          NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS state       text             NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS last_review timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_word_progress_state_check'
      AND conrelid = 'public.user_word_progress'::regclass
  ) THEN
    ALTER TABLE public.user_word_progress
      ADD CONSTRAINT user_word_progress_state_check
      CHECK (state IN ('new', 'learning', 'review', 'relearning'));
  END IF;
END
$$;

-- Backfill FSRS state once for legacy rows that were reviewed with the old level-based scheduler
-- (reps = 0 and last_review IS NULL means the row has never been touched by FSRS).
-- Stability is approximated from the legacy level interval so FSRS can continue from it.
UPDATE public.user_word_progress
SET
  last_review = last_reviewed,
  due         = COALESCE(next_review, now()),
  reps        = GREATEST(COALESCE(review_count, 1), 1),
  state       = 'review',
  difficulty  = 5,
  stability   = (ARRAY[0.5, 1, 3, 7, 14, 30, 90, 180]::double precision[])[LEAST(GREATEST(COALESCE(level, 0), 0), 7) + 1]
WHERE last_reviewed IS NOT NULL
  AND last_review IS NULL
  AND reps = 0;

-- collection_id is not meaningful for FSRS progress (one card per word per learner).
ALTER TABLE public.user_word_progress ALTER COLUMN collection_id SET DEFAULT 'general';
ALTER TABLE public.user_word_progress ALTER COLUMN collection_id DROP NOT NULL;

-- Upserts use ON CONFLICT (user_id, word_id); the original table has UNIQUE(user_id, word_id),
-- but make sure a matching unique index exists.
CREATE UNIQUE INDEX IF NOT EXISTS user_word_progress_user_word_key
  ON public.user_word_progress (user_id, word_id);

CREATE INDEX IF NOT EXISTS idx_user_word_progress_user_due
  ON public.user_word_progress (user_id, due);

-- Learners may delete their own progress rows.
DROP POLICY IF EXISTS "Users can delete their own progress" ON public.user_word_progress;
CREATE POLICY "Users can delete their own progress" ON public.user_word_progress
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. review_logs: one row per answer
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  word_id     text NOT NULL,
  rating      text NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  source      text,
  elapsed_ms  integer CHECK (elapsed_ms IS NULL OR elapsed_ms >= 0),
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_logs_user_reviewed_at
  ON public.review_logs (user_id, reviewed_at DESC);

ALTER TABLE public.review_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own review logs" ON public.review_logs;
CREATE POLICY "Users can view their own review logs" ON public.review_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own review logs" ON public.review_logs;
CREATE POLICY "Users can insert their own review logs" ON public.review_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.review_logs TO authenticated;

-- Not added to the supabase_realtime publication on purpose.
