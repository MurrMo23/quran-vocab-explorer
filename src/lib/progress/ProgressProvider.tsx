// Learner-progress engine: one FSRS card per word, review logs, stats.
// Signed-in learners sync to Supabase; guests (and signed-in learners when the server tables are
// unavailable) keep progress in this browser. Guest progress is merged into the account on sign-in.
//
// The provider reads auth itself (supabase.auth.onAuthStateChange), so it does not depend on
// where AuthProvider sits in the tree.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CardState, ProgressStats, Rating, ReviewLog, ReviewSource, UseProgressResult } from './types';
import { formatInterval, previewIntervalMs, scheduleReview } from './scheduler';
import { computeStats } from './stats';
import { buildSessionQueue, dueWordIds, newWordIds } from './session';
import {
  LOCAL_STORAGE_KEY,
  LocalStore,
  ProgressStoreError,
  SupabaseStore,
  isMissingSchemaError,
  makeLogId,
  userFallbackKey,
  mergeCards,
  mergeLogs,
  type StoredLog,
} from './storage';
import { ReviewSessionTracker } from './session-analytics';

/** UseProgressResult plus optional extras (the contract in types.ts stays unchanged). */
export interface ProgressContextValue extends UseProgressResult {
  /** Signed-in user id, or null for guests. */
  userId: string | null;
  /** Reviews recorded but not yet confirmed by the server (signed-in only). */
  pendingSync: number;
  /** The learner's card for a word, if it has been reviewed. */
  getCard: (wordId: string) => CardState | undefined;
  /** Reload from the server (or this browser for guests). */
  refresh: () => Promise<void>;
}

interface EngineState {
  loading: boolean;
  userId: string | null;
  offlineFallback: boolean;
  cards: Map<string, CardState>;
  logs: StoredLog[];
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

let warnedFallback = false;
function warnFallbackOnce(err: unknown) {
  if (warnedFallback) return;
  warnedFallback = true;
  const msg = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
  console.warn(`[progress] Server progress unavailable, saving in this browser instead (${msg}).`);
}

const STATS_TICK_MS = 60_000;

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Empty until the session is known, so a signed-in learner never sees guest data flash by.
  const [state, setState] = useState<EngineState>(() => ({
    loading: true,
    userId: null,
    offlineFallback: false,
    cards: new Map(),
    logs: [],
  }));
  const [now, setNow] = useState(() => new Date());

  // Refs mirror the latest state so recordReview is synchronous and never sees stale closures.
  const stateRef = useRef(state);
  const commit = useCallback((next: EngineState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  // Retry queue for signed-in writes (in memory; flushed on the next success).
  const pendingCards = useRef(new Map<string, CardState>());
  const pendingLogs = useRef(new Map<string, StoredLog>());
  const [pendingSync, setPendingSync] = useState(0);
  const flushing = useRef(false);
  const flushAgain = useRef(false);
  const loadToken = useRef(0);
  const sessionAnalytics = useRef(new ReviewSessionTracker());

  const updatePendingCount = useCallback(() => setPendingSync(pendingLogs.current.size), []);

  const enterFallback = useCallback(
    (err: unknown) => {
      warnFallbackOnce(err);
      const s = stateRef.current;
      // Keep everything (including unsent reviews) in this browser from now on.
      const logs = s.logs.map((l) => (pendingLogs.current.has(l.id) ? { ...l, uploaded: undefined } : l));
      if (s.userId) LocalStore.save(s.cards, logs, userFallbackKey(s.userId));
      pendingCards.current.clear();
      pendingLogs.current.clear();
      updatePendingCount();
      commit({ ...s, logs, offlineFallback: true });
    },
    [commit, updatePendingCount],
  );

  const flush = useCallback(async () => {
    const s = stateRef.current;
    if (!s.userId || s.offlineFallback) return;
    if (flushing.current) {
      flushAgain.current = true;
      return;
    }
    if (pendingCards.current.size === 0 && pendingLogs.current.size === 0) return;
    flushing.current = true;
    const userId = s.userId;
    const cards = [...pendingCards.current.values()];
    const logs = [...pendingLogs.current.values()];
    try {
      await SupabaseStore.upsertCards(userId, cards);
      await SupabaseStore.insertLogs(userId, logs);
      if (stateRef.current.userId === userId) {
        for (const c of cards) if (pendingCards.current.get(c.wordId) === c) pendingCards.current.delete(c.wordId);
        for (const l of logs) pendingLogs.current.delete(l.id);
        updatePendingCount();
      }
    } catch (err) {
      if (stateRef.current.userId === userId && (isMissingSchemaError(err) || (err as ProgressStoreError)?.missingSchema)) {
        enterFallback(err);
      }
      // Otherwise keep the queue; it is retried on the next review or when the browser is online.
    } finally {
      flushing.current = false;
      if (flushAgain.current) {
        flushAgain.current = false;
        void flush();
      }
    }
  }, [enterFallback, updatePendingCount]);

  const loadGuest = useCallback(() => {
    loadToken.current++;
    pendingCards.current.clear();
    pendingLogs.current.clear();
    updatePendingCount();
    const local = LocalStore.load();
    commit({ loading: false, userId: null, offlineFallback: false, cards: local.cards, logs: local.logs });
  }, [commit, updatePendingCount]);

  const loadUser = useCallback(
    async (userId: string) => {
      const token = ++loadToken.current;
      const prev = stateRef.current;
      if (prev.userId !== userId) {
        // Different account: drop anything queued for the previous one.
        pendingCards.current.clear();
        pendingLogs.current.clear();
        updatePendingCount();
      }
      commit({ ...prev, loading: true, userId, offlineFallback: false });

      let server;
      try {
        server = await SupabaseStore.load(userId);
      } catch (err) {
        if (token !== loadToken.current) return;
        warnFallbackOnce(err);
        // Work from this account's own browser copy plus any guest progress made on this device
        // (the guest store is kept so it can still be merged into the server later).
        const key = userFallbackKey(userId);
        const mine = LocalStore.load(key);
        const guest = LocalStore.load();
        let cards = mergeCards(mine.cards, guest.cards).merged;
        cards = mergeCards(cards, pendingCards.current).merged;
        const logs = mergeLogs(mergeLogs(mine.logs, guest.logs), [...pendingLogs.current.values()]);
        pendingCards.current.clear();
        pendingLogs.current.clear();
        updatePendingCount();
        LocalStore.save(cards, logs, key);
        commit({ loading: false, userId, offlineFallback: true, cards, logs });
        return;
      }
      if (token !== loadToken.current) return;

      // Merge progress kept in this browser into the account: guest progress, plus anything this
      // account saved here while the server was unavailable.
      const guestOnly = LocalStore.load();
      const fallbackKey = userFallbackKey(userId);
      const ownFallback = LocalStore.load(fallbackKey);
      const guest = {
        cards: mergeCards(ownFallback.cards, guestOnly.cards).merged,
        logs: mergeLogs(ownFallback.logs, guestOnly.logs),
      };
      const { merged, toUpload } = mergeCards(server.cards, guest.cards);
      const serverLogIds = new Set(server.logs.map((l) => l.id));
      const guestLogsToUpload = guest.logs.filter((l) => !l.uploaded && !serverLogIds.has(l.id));

      // Reviews recorded while loading take precedence when newer.
      const withPending = mergeCards(merged, pendingCards.current).merged;
      const logs = mergeLogs(mergeLogs(server.logs, guestLogsToUpload), [...pendingLogs.current.values()]);
      commit({ loading: false, userId, offlineFallback: false, cards: withPending, logs });

      if (!LocalStore.isEmpty(guest)) {
        try {
          await SupabaseStore.upsertCards(userId, toUpload);
          await SupabaseStore.insertLogs(userId, guestLogsToUpload);
          if (token === loadToken.current) {
            LocalStore.clear();
            LocalStore.clear(fallbackKey);
          }
        } catch (err) {
          if (token !== loadToken.current) return;
          if (isMissingSchemaError(err) || (err as ProgressStoreError)?.missingSchema) {
            enterFallback(err);
            return;
          }
          // Keep the guest store so the merge is retried on the next load (it is idempotent),
          // and queue the items so they also go up with the next successful write.
          for (const c of toUpload) if (!pendingCards.current.has(c.wordId)) pendingCards.current.set(c.wordId, c);
          for (const l of guestLogsToUpload) pendingLogs.current.set(l.id, l);
          updatePendingCount();
        }
      }
      if (token === loadToken.current) void flush();
    },
    [commit, enterFallback, flush, updatePendingCount],
  );

  // Auth wiring.
  useEffect(() => {
    let active = true;
    let currentUser: string | null | undefined;
    const handle = (userId: string | null) => {
      if (!active || userId === currentUser) return;
      currentUser = userId;
      if (userId) void loadUser(userId);
      else loadGuest();
    };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => handle(session?.user?.id ?? null));
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => handle(session?.user?.id ?? null))
      .catch(() => handle(null));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [loadGuest, loadUser]);

  // Keep time-dependent stats fresh; retry pending writes when back online.
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, STATS_TICK_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        tick();
        void flush();
      }
    };
    const onOnline = () => void flush();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
    };
  }, [flush]);

  // Guests on other tabs: pick up changes written to localStorage elsewhere.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      const s = stateRef.current;
      if (s.loading || (s.userId && !s.offlineFallback)) return;
      const key = s.userId ? userFallbackKey(s.userId) : LOCAL_STORAGE_KEY;
      if (e.key !== null && e.key !== key) return;
      const local = LocalStore.load(key);
      commit({ ...s, cards: local.cards, logs: local.logs });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [commit]);

  const recordReview = useCallback(
    async (wordId: string, rating: Rating, source: ReviewSource, elapsedMs?: number): Promise<CardState> => {
      const at = new Date();
      const s = stateRef.current;
      const card = scheduleReview(s.cards.get(wordId), wordId, rating, at);
      const log: StoredLog = {
        id: makeLogId(),
        wordId,
        rating,
        source,
        reviewedAt: at.toISOString(),
        elapsedMs: elapsedMs !== undefined && Number.isFinite(elapsedMs) ? Math.max(0, Math.round(elapsedMs)) : undefined,
      };
      const cards = new Map(s.cards);
      cards.set(wordId, card);
      const logs = [...s.logs, log];
      commit({ ...s, cards, logs });
      setNow(at);
      sessionAnalytics.current.record(wordId, rating, source, at.getTime());

      if (!s.userId) {
        LocalStore.save(cards, logs);
      } else if (s.offlineFallback) {
        LocalStore.save(cards, logs, userFallbackKey(s.userId));
      } else {
        pendingCards.current.set(wordId, card);
        pendingLogs.current.set(log.id, log);
        updatePendingCount();
        void flush();
      }
      return card;
    },
    [commit, flush, updatePendingCount],
  );

  const refresh = useCallback(async () => {
    const userId = stateRef.current.userId;
    if (userId) await loadUser(userId);
    else loadGuest();
  }, [loadGuest, loadUser]);

  const stats: ProgressStats = useMemo(() => computeStats(state.cards, state.logs, now), [state.cards, state.logs, now]);

  const getDueWordIds = useCallback((limit?: number) => dueWordIds(state.cards, new Date(), undefined, limit), [state.cards]);
  const getNewWordIds = useCallback(
    (pool: readonly string[], limit?: number) => newWordIds(state.cards, pool, limit),
    [state.cards],
  );
  const buildSession = useCallback(
    (pool: readonly string[], size: number) => {
      const ids = buildSessionQueue(state.cards, pool, size, new Date());
      sessionAnalytics.current.notePlan(ids);
      return ids;
    },
    [state.cards],
  );
  const previewInterval = useCallback(
    (wordId: string, rating: Rating) => formatInterval(previewIntervalMs(stateRef.current.cards.get(wordId), rating)),
    // state.cards dependency keeps consumers re-rendering with fresh labels.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.cards],
  );
  const getCard = useCallback((wordId: string) => state.cards.get(wordId), [state.cards]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      loading: state.loading,
      isGuest: state.userId === null,
      offlineFallback: state.offlineFallback,
      cards: state.cards,
      logs: state.logs as readonly ReviewLog[],
      stats,
      recordReview,
      getDueWordIds,
      getNewWordIds,
      buildSession,
      previewInterval,
      userId: state.userId,
      pendingSync,
      getCard,
      refresh,
    }),
    [state, stats, recordReview, getDueWordIds, getNewWordIds, buildSession, previewInterval, pendingSync, getCard, refresh],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

/** Learner progress. Must be used under <ProgressProvider> (mounted in src/main.tsx). */
// eslint-disable-next-line react-refresh/only-export-components
export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used inside <ProgressProvider> (mounted in src/main.tsx).');
  }
  return ctx;
}
