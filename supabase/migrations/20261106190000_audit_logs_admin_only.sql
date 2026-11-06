-- audit_logs: only admins may write audit entries, attributed to themselves.
-- Previously "Users can insert audit logs" allowed anyone (including anonymous visitors)
-- to insert rows, which would let anyone fake admin activity in Admin > Analytics.
-- user_id now defaults to the caller so existing inserts (which omit it) keep working.
-- Idempotent and guarded.

DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NULL THEN
    RAISE NOTICE 'public.audit_logs not found, skipping';
    RETURN;
  END IF;

  EXECUTE 'ALTER TABLE public.audit_logs ALTER COLUMN user_id SET DEFAULT auth.uid()';

  EXECUTE 'DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs';
  EXECUTE $p$
    CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
      FOR INSERT TO authenticated
      WITH CHECK (
        private.has_role(auth.uid(), 'admin'::public.app_role)
        AND (user_id IS NULL OR user_id = auth.uid())
      )
  $p$;
END
$$;
