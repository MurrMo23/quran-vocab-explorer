import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type SyncOptions = {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  /** PostgREST-style equality filter, e.g. "user_id=abc". Applied to the load and the subscription. */
  filter?: string;
  onSync?: (payload: unknown) => void;
};

interface ChangePayload {
  eventType?: string;
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
}

let channelSeq = 0;

/**
 * Loads a table and keeps it in sync via Supabase realtime. Rows are only as visible as RLS allows.
 * Tables that are not in the realtime publication still load; they just won't receive live updates.
 */
export const useRealTimeSync = <T extends Record<string, unknown>>(options: SyncOptions) => {
  const { table, event = '*', schema = 'public', filter, onSync } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  useEffect(() => {
    let active = true;
    const [filterKey, filterValue] = filter ? filter.split('=') : [];

    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Table names are dynamic here, so the generated types cannot be used.
        let query = (supabase.from(table as never) as unknown as {
          select: (c: string) => PromiseLike<{ data: T[] | null; error: { message: string } | null }> & {
            eq: (k: string, v: string) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>;
          };
        }).select('*') as PromiseLike<{ data: T[] | null; error: { message: string } | null }> & {
          eq?: (k: string, v: string) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>;
        };
        if (filterKey && filterValue !== undefined && query.eq) query = query.eq(filterKey, filterValue) as typeof query;
        const { data: rows, error: loadError } = await query;
        if (loadError) throw new Error(loadError.message);
        if (active) setData(rows ?? []);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
          console.warn(`[useRealTimeSync] failed to load ${table}:`, err);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchInitialData();

    const channel = supabase
      .channel(`rt-${schema}-${table}-${++channelSeq}`)
      .on(
        'postgres_changes' as never,
        { event, schema, table, ...(filter ? { filter: `${filterKey}=eq.${filterValue}` } : {}) },
        (payload: ChangePayload) => {
          const eventType = payload.eventType;
          const newRecord = (payload.new ?? {}) as T;
          const oldRecord = (payload.old ?? {}) as T;
          if (eventType === 'INSERT') {
            setData((prev) => [...prev, newRecord]);
          } else if (eventType === 'UPDATE') {
            setData((prev) => prev.map((item) => (item.id === newRecord.id ? ({ ...item, ...newRecord } as T) : item)));
          } else if (eventType === 'DELETE') {
            setData((prev) => prev.filter((item) => item.id !== oldRecord.id));
          }
          onSyncRef.current?.(payload);
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [table, event, schema, filter]);

  return { data, loading, error, setData };
};
