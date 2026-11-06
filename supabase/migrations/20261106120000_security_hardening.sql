-- Security hardening (2026-11-06)
-- Idempotent: every statement is guarded so the file can be re-run safely and
-- tolerates missing objects. Apply manually; not auto-applied.

-- ---------------------------------------------------------------------------
-- 1. ad_configs: ad system removed from the app. Lock the table to admins only
--    and deactivate all rows. The table itself is kept.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  pol record;
BEGIN
  IF to_regclass('public.ad_configs') IS NULL THEN
    RAISE NOTICE 'public.ad_configs not found, skipping';
    RETURN;
  END IF;

  EXECUTE 'ALTER TABLE public.ad_configs ENABLE ROW LEVEL SECURITY';

  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ad_configs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.ad_configs', pol.policyname);
  END LOOP;

  EXECUTE $pol$
    CREATE POLICY "Admins only can manage ad configs"
    ON public.ad_configs
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
          AND user_roles.role = 'admin'::public.app_role
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
          AND user_roles.role = 'admin'::public.app_role
      )
    )
  $pol$;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ad_configs' AND column_name = 'is_active'
  ) THEN
    EXECUTE 'UPDATE public.ad_configs SET is_active = false WHERE is_active IS DISTINCT FROM false';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 2. search_analytics: no more anonymous inserts; authenticated users may only
--    insert rows attributed to themselves.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.search_analytics') IS NULL THEN
    RAISE NOTICE 'public.search_analytics not found, skipping';
    RETURN;
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert search analytics" ON public.search_analytics';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can insert own search analytics" ON public.search_analytics';
  EXECUTE $pol$
    CREATE POLICY "Authenticated users can insert own search analytics"
    ON public.search_analytics
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid())
  $pol$;
END
$$;

-- ---------------------------------------------------------------------------
-- 3. Pin search_path on update_quiz_statistics() (mutable search_path warning).
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regprocedure('public.update_quiz_statistics()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.update_quiz_statistics() SET search_path = public';
  ELSE
    RAISE NOTICE 'public.update_quiz_statistics() not found, skipping';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 4. Remove tables that don't need realtime from the supabase_realtime
--    publication (reduces data broadcast surface). Only drops current members.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE NOTICE 'publication supabase_realtime not found, skipping';
    RETURN;
  END IF;

  FOREACH t IN ARRAY ARRAY[
    'user_word_progress',
    'community_sentences',
    'study_group_members',
    'leaderboard_entries',
    'forum_posts',
    'forum_replies'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
    END IF;
  END LOOP;
END
$$;

-- ---------------------------------------------------------------------------
-- 5. site_settings: values are public branding (logo, favicon, OG image, site
--    name), so allow anonymous + authenticated reads. Admin management policy
--    ("Admins can manage site settings") is left untouched.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.site_settings') IS NULL THEN
    RAISE NOTICE 'public.site_settings not found, skipping';
    RETURN;
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings';
  EXECUTE $pol$
    CREATE POLICY "Anyone can read site settings"
    ON public.site_settings
    FOR SELECT
    TO public
    USING (true)
  $pol$;
END
$$;
