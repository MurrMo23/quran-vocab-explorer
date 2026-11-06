-- Notes and user collections.
--
-- 1. public.user_collections: personal word collections (replaces the in-memory
--    custom collections that vanished on reload). Own-rows CRUD only; nothing is public.
-- 2. public.user_notes already exists (20250616090708). Notes are personal: the app always
--    writes is_public = false and has no sharing UI (there is no moderation), so we add an
--    updated_at trigger and a content length check, but leave the existing policies alone.

-- updated_at helper (exists since 20250620115218; recreate defensively, same body).
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- user_collections
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 80),
  description text CHECK (description IS NULL OR char_length(description) <= 500),
  word_ids text[] NOT NULL DEFAULT '{}' CHECK (cardinality(word_ids) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_collections_user_id
  ON public.user_collections (user_id, updated_at DESC);

ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own collections" ON public.user_collections;
CREATE POLICY "Users can view their own collections" ON public.user_collections
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own collections" ON public.user_collections;
CREATE POLICY "Users can create their own collections" ON public.user_collections
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own collections" ON public.user_collections;
CREATE POLICY "Users can update their own collections" ON public.user_collections
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own collections" ON public.user_collections;
CREATE POLICY "Users can delete their own collections" ON public.user_collections
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_user_collections_updated_at ON public.user_collections;
CREATE TRIGGER update_user_collections_updated_at
  BEFORE UPDATE ON public.user_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_collections TO authenticated;

-- ---------------------------------------------------------------------------
-- user_notes hardening (table and RLS already exist)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.user_notes') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'user_notes_content_length' AND conrelid = 'public.user_notes'::regclass
    ) THEN
      ALTER TABLE public.user_notes
        ADD CONSTRAINT user_notes_content_length
        CHECK (char_length(content) BETWEEN 1 AND 4000) NOT VALID;
    END IF;

    DROP TRIGGER IF EXISTS update_user_notes_updated_at ON public.user_notes;
    CREATE TRIGGER update_user_notes_updated_at
      BEFORE UPDATE ON public.user_notes
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    CREATE INDEX IF NOT EXISTS idx_user_notes_user_word ON public.user_notes (user_id, word_id);
  END IF;
END
$$;
