-- Applied manually in the SQL editor on 2026-11-07, before the Postgres 15 -> 17 upgrade.
-- pgjwt had no dependent objects and nothing in the app used it; Supabase requires it
-- to be removed before upgrading. Idempotent; no CASCADE.
drop extension if exists pgjwt;
