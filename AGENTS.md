# Architecture

- Keep supplemental client-error table types in the dedicated Supabase adapter, sharing the existing client and session, rather than hand-editing generated schema types.