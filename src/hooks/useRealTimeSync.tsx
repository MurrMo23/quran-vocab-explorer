
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SyncOptions = {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
  onSync?: (payload: any) => void;
}

export const useRealTimeSync = <T extends Record<string, any>>(options: SyncOptions) => {
  const { table, event = '*', schema = 'public', filter, onSync } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // For tables that don't exist yet, return mock data
        if (!['audit_logs', 'learning_paths', 'learning_progress', 'profiles', 'user_roles'].includes(table)) {
          console.log(`Table ${table} not found in types, using mock data`);
          setData([] as T[]);
          setLoading(false);
          return;
        }
        
        // Cast to any to bypass TypeScript restrictions
        const { data: initialData, error } = await (supabase as any)
          .from(table)
          .select('*');
        
        if (filter && initialData) {
          const [key, value] = filter.split('=');
          const filteredData = initialData.filter((item: any) => item[key] === value);
          setData(filteredData as T[]);
        } else if (initialData) {
          setData(initialData as T[]);
        }

        if (error) {
          throw error;
        }
      } catch (err: any) {
        setError(err);
        toast.error(`Error fetching data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up realtime subscription with proper type handling
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes' as any, // Type assertion to bypass TS error
        {
          event: event,
          schema: schema,
          table: table,
        },
        (payload: any) => {
          // Safely handle different payload structures
          const eventType = payload.eventType || payload.event;
          const newRecord = payload.new || {};
          const oldRecord = payload.old || {};

          // Update local state based on the event type
          if (eventType === 'INSERT') {
            setData((prevData) => [...prevData, newRecord as T]);
          } else if (eventType === 'UPDATE') {
            setData((prevData) => 
              prevData.map((item) => item.id === newRecord.id ? { ...item, ...newRecord } as T : item)
            );
          } else if (eventType === 'DELETE') {
            setData((prevData) => 
              prevData.filter((item) => item.id !== oldRecord.id)
            );
          }

          // Call custom callback if provided
          if (onSync) {
            onSync(payload);
          }

          toast.info(`Data ${eventType?.toLowerCase?.() || 'changed'} by another user`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, schema, filter, onSync]);

  return { data, loading, error, setData };
};
