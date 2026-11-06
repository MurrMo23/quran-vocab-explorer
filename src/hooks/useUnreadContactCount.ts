import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Count of contact messages with status 'new'. Admin-only (RLS); returns null until loaded or on error. */
export function useUnreadContactCount(enabled = true) {
  const [count, setCount] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const { count: c, error } = await supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new');
    setCount(error ? null : (c ?? 0));
  }, []);

  useEffect(() => {
    if (enabled) void refresh();
  }, [enabled, refresh]);

  return { count, refresh };
}
