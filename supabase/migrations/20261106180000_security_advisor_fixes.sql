-- Fixes for the Supabase security advisor findings (2026-11-06).
--   0011 function_search_path_mutable            -> fixed search_path on every flagged function
--   0028/0029 security definer executable by API  -> role check moved to a non-exposed schema,
--                                                    get_user_roles made SECURITY INVOKER,
--                                                    trigger functions no longer callable via the API
-- Plus two data-exposure fixes found while reviewing policies:
--   user_profiles was readable by anyone (107 rows incl. email-as-username and full_name)
--   leaderboard_entries was readable by anyone (feature removed; table empty)
-- Idempotent and guarded: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Admin role check lives in a private schema that PostgREST does not expose.
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Policies that called public.has_role now call private.has_role, and apply only to
-- signed-in users (anonymous visitors never evaluate the admin check).
DROP POLICY IF EXISTS "Admins can do everything on user_roles" ON public.user_roles;
CREATE POLICY "Admins can do everything on user_roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs';
    EXECUTE $p$
      CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
        FOR SELECT TO authenticated
        USING (private.has_role(auth.uid(), 'admin'::public.app_role))
    $p$;
  END IF;
END
$$;

-- The old public.has_role stays (nothing else depends on it being callable) but is no
-- longer executable through the API, and gets a fixed search_path.
DO $$
BEGIN
  IF to_regprocedure('public.has_role(uuid, public.app_role)') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 2. get_user_roles(): called by the app (rpc) to read the caller's own roles.
--    SECURITY INVOKER is enough: "Users can view their own roles" lets each user
--    read their own rows; anonymous callers simply get no rows.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regprocedure('public.get_user_roles()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.get_user_roles() SECURITY INVOKER';
    EXECUTE 'ALTER FUNCTION public.get_user_roles() SET search_path = public';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 3. Trigger-only functions: not callable through the API. Triggers still fire
--    (EXECUTE is checked when a trigger is created, not when it runs).
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.handle_new_user() SET search_path = public';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated';
  END IF;
  IF to_regprocedure('public.update_quiz_statistics()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.update_quiz_statistics() FROM PUBLIC, anon, authenticated';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 4. user_profiles: own row only (admins may read all). Previously world-readable.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.user_profiles') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.user_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles';
    EXECUTE $p$
      CREATE POLICY "Users can view their own profile" ON public.user_profiles
        FOR SELECT TO authenticated
        USING (auth.uid() = id OR private.has_role(auth.uid(), 'admin'::public.app_role))
    $p$;
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 5. leaderboard_entries: own rows only. Previously world-readable.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.leaderboard_entries') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.leaderboard_entries';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own leaderboard entries" ON public.leaderboard_entries';
    EXECUTE $p$
      CREATE POLICY "Users can view their own leaderboard entries" ON public.leaderboard_entries
        FOR SELECT TO authenticated
        USING (auth.uid() = user_id)
    $p$;
  END IF;
END
$$;
