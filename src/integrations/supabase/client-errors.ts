import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';
import type { Database } from './types';

export type ClientError = {
  id: string;
  created_at: string;
  message: string;
  stack: string | null;
  url: string | null;
  user_agent: string | null;
  release: string | null;
};

type ClientErrorsDatabase = Database & {
  public: {
    Tables: {
      client_errors: {
        Row: ClientError;
        Insert: Pick<ClientError, 'message'> & Partial<Omit<ClientError, 'message'>>;
        Update: Partial<ClientError>;
        Relationships: [];
      };
    };
  };
};

// Reuse the existing session and transport; only extend the compile-time schema.
export const clientErrorsClient = supabase as SupabaseClient<ClientErrorsDatabase>;