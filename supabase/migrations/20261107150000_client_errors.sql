-- Client-side error reports (src/lib/error-reporting.ts).
--
-- Browsers (anonymous or signed in) may INSERT only, with every column length-capped by the
-- policy and by CHECK constraints. Nothing identifying is stored: no user id, no IP, the URL
-- has its query string and hash stripped client-side. Only admins can read or delete rows
-- (Admin > Errors).
--
-- Cleanup: rows older than 90 days can be deleted at any time, e.g.
--   DELETE FROM public.client_errors WHERE created_at < now() - interval '90 days';
-- (Admin > Errors also offers "Delete older than 30 days".)
--
-- Idempotent.

CREATE TABLE IF NOT EXISTS public.client_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  message text NOT NULL,
  stack text,
  url text,
  user_agent text,
  release text
);

-- Grants first, before row-level security and policies.
GRANT INSERT ON public.client_errors TO anon, authenticated;
GRANT SELECT, DELETE ON public.client_errors TO authenticated;
GRANT ALL ON public.client_errors TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'client_errors_lengths' AND conrelid = 'public.client_errors'::regclass
  ) THEN
    ALTER TABLE public.client_errors
      ADD CONSTRAINT client_errors_lengths CHECK (
        char_length(message) BETWEEN 1 AND 500
        AND (stack IS NULL OR char_length(stack) <= 4000)
        AND (url IS NULL OR char_length(url) <= 500)
        AND (user_agent IS NULL OR char_length(user_agent) <= 300)
        AND (release IS NULL OR char_length(release) <= 40)
      );
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS client_errors_created_at_idx
  ON public.client_errors (created_at DESC);

ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can report client errors" ON public.client_errors;
CREATE POLICY "Anyone can report client errors" ON public.client_errors
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(message) BETWEEN 1 AND 500
    AND (stack IS NULL OR char_length(stack) <= 4000)
    AND (url IS NULL OR char_length(url) <= 500)
    AND (user_agent IS NULL OR char_length(user_agent) <= 300)
    AND (release IS NULL OR char_length(release) <= 40)
    -- Reports cannot be back- or forward-dated.
    AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '5 minutes'
  );

DROP POLICY IF EXISTS "Admins can view client errors" ON public.client_errors;
CREATE POLICY "Admins can view client errors" ON public.client_errors
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete client errors" ON public.client_errors;
CREATE POLICY "Admins can delete client errors" ON public.client_errors
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
