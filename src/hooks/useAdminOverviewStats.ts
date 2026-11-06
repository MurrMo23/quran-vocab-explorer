import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAllCollections, getAllWords } from '@/utils/vocabulary';

export interface AdminOverviewStats {
  /** Registered accounts (user_profiles rows; admins can read all via RLS). null = loading/unavailable. */
  totalUsers: number | null;
  /** Accounts created in the last 30 days. */
  newUsers30d: number | null;
  /** New accounts in the 30 days before that, for a like-for-like comparison. */
  newUsersPrev30d: number | null;
  /** Unique vocabulary entries shipped with the app. */
  words: number;
  /** Words whose frequency was computed from corpus data. */
  verifiedWords: number;
  /** Collections that contain at least one word. */
  collections: number;
}

const DAY = 24 * 60 * 60 * 1000;

/** Real numbers for the Admin overview cards. Never fabricates a value: unknown stays null. */
export function useAdminOverviewStats(enabled = true): AdminOverviewStats {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [newUsers30d, setNewUsers30d] = useState<number | null>(null);
  const [newUsersPrev30d, setNewUsersPrev30d] = useState<number | null>(null);

  const content = useMemo(() => {
    const words = getAllWords();
    const ids = new Set(words.map((w) => w.id));
    const used = new Set(words.flatMap((w) => w.collections ?? []));
    return {
      words: ids.size,
      verifiedWords: words.filter((w) => w.frequencyVerified).length,
      collections: getAllCollections().filter((c) => used.has(c.id)).length,
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const now = Date.now();
    const since30 = new Date(now - 30 * DAY).toISOString();
    const since60 = new Date(now - 60 * DAY).toISOString();

    const count = (q: PromiseLike<{ count: number | null; error: unknown }>) =>
      Promise.resolve(q).then(({ count: c, error }) => (error ? null : (c ?? 0)));

    const base = () => supabase.from('user_profiles').select('id', { count: 'exact', head: true });

    void Promise.all([
      count(base()),
      count(base().gte('created_at', since30)),
      count(base().gte('created_at', since60).lt('created_at', since30)),
    ]).then(([total, recent, prev]) => {
      if (cancelled) return;
      setTotalUsers(total);
      setNewUsers30d(recent);
      setNewUsersPrev30d(prev);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { totalUsers, newUsers30d, newUsersPrev30d, ...content };
}
