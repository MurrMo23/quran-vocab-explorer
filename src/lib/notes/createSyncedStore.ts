// Generic "guest in localStorage, account in Supabase" store.
//
// - Guests: items live in localStorage under `storageKey`.
// - Signed-in users: items are read from / written to Supabase through the remote adapter.
// - When a user signs in (or a signed-in session loads) and this browser still holds guest
//   items, they are pushed into the account and removed locally once each one is saved.
// - If the server is unreachable or the table is missing, the store falls back to
//   localStorage for the session, logs one quiet warning, and never throws on load.
//
// Shared by src/lib/notes and src/lib/collections.

import { supabase } from '@/integrations/supabase/client';

export interface SyncedItem {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface RemoteAdapter<T extends SyncedItem, CreateInput, Patch> {
  list(userId: string): Promise<T[]>;
  create(userId: string, input: CreateInput): Promise<T>;
  update(id: string, patch: Patch): Promise<T>;
  remove(id: string): Promise<void>;
  removeAll(userId: string): Promise<void>;
}

export interface LocalAdapter<T extends SyncedItem, CreateInput, Patch> {
  build(id: string, input: CreateInput, now: string): T;
  applyPatch(item: T, patch: Patch, now: string): T;
  /** Parse one stored item; return null to drop malformed data. */
  parse(raw: unknown): T | null;
  /** Turn a guest item into the input used to recreate it in the account. */
  toCreateInput(item: T): CreateInput;
}

export interface SyncedState<T> {
  items: T[];
  loading: boolean;
  /** No signed-in user: data lives in this browser only. */
  isGuest: boolean;
  /** Signed in, but the server could not be used; data is kept in this browser for now. */
  offlineFallback: boolean;
  userId: string | null;
}

export interface SyncedStore<T extends SyncedItem, CreateInput, Patch> {
  getState(): SyncedState<T>;
  subscribe(listener: () => void): () => void;
  create(input: CreateInput): Promise<T>;
  update(id: string, patch: Patch): Promise<T>;
  remove(id: string): Promise<void>;
  /** Delete every item for the current user (account and this browser). */
  clearAll(): Promise<void>;
}

interface Options<T extends SyncedItem, CreateInput, Patch> {
  name: string;
  storageKey: string;
  remote: RemoteAdapter<T, CreateInput, Patch>;
  local: LocalAdapter<T, CreateInput, Patch>;
  sort: (a: T, b: T) => number;
}

export const LOCAL_ID_PREFIX = 'local-';

export function makeLocalId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return LOCAL_ID_PREFIX + crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `${LOCAL_ID_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createSyncedStore<T extends SyncedItem, CreateInput, Patch>(
  opts: Options<T, CreateInput, Patch>
): SyncedStore<T, CreateInput, Patch> {
  const { name, storageKey, remote, local, sort } = opts;

  let state: SyncedState<T> = {
    items: [],
    loading: true,
    isGuest: true,
    offlineFallback: false,
    userId: null,
  };
  const listeners = new Set<() => void>();
  let started = false;
  let warned = false;
  let loadToken = 0;

  const setState = (patch: Partial<SyncedState<T>>) => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  };

  const warnOnce = (err: unknown) => {
    if (warned) return;
    warned = true;
    console.warn(`[${name}] Server storage unavailable; keeping data in this browser for now.`, err);
  };

  // ---- localStorage (every access guarded) ----
  const readLocal = (): T[] => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((r) => local.parse(r)).filter((x): x is T => x !== null);
    } catch {
      return [];
    }
  };

  const writeLocal = (items: T[]) => {
    try {
      if (items.length === 0) window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // storage full or blocked: in-memory state still works for this session
    }
  };

  const usingLocal = () => state.isGuest || state.offlineFallback;

  const sorted = (items: T[]) => [...items].sort(sort);

  // ---- loading / merging ----
  const load = async (userId: string | null) => {
    const token = ++loadToken;
    if (!userId) {
      setState({ items: sorted(readLocal()), loading: false, isGuest: true, offlineFallback: false, userId: null });
      return;
    }
    setState({ loading: true, isGuest: false, userId });
    try {
      // Merge guest items into the account first.
      const pending = readLocal();
      if (pending.length > 0) {
        const remaining: T[] = [];
        for (const item of pending) {
          try {
            await remote.create(userId, local.toCreateInput(item));
          } catch (err) {
            remaining.push(item);
            warnOnce(err);
          }
        }
        writeLocal(remaining);
        if (remaining.length === pending.length) {
          // Nothing could be saved: the server is not usable right now.
          throw new Error('merge failed');
        }
      }
      const items = await remote.list(userId);
      if (token !== loadToken) return;
      setState({ items: sorted(items), loading: false, offlineFallback: false });
    } catch (err) {
      if (token !== loadToken) return;
      warnOnce(err);
      setState({ items: sorted(readLocal()), loading: false, offlineFallback: true });
    }
  };

  const start = () => {
    if (started) return;
    started = true;
    let currentUser: string | null | undefined;
    const handle = (userId: string | null) => {
      if (userId === currentUser) return;
      currentUser = userId;
      // Defer: supabase-js must not be awaited inside its own auth callback.
      setTimeout(() => void load(userId), 0);
    };
    try {
      supabase.auth.onAuthStateChange((_event, session) => handle(session?.user?.id ?? null));
      supabase.auth
        .getSession()
        .then(({ data }) => handle(data.session?.user?.id ?? null))
        .catch(() => handle(null));
    } catch (err) {
      warnOnce(err);
      handle(null);
    }
  };

  // ---- mutations ----
  const createLocal = (input: CreateInput): T => {
    const now = new Date().toISOString();
    const item = local.build(makeLocalId(), input, now);
    const items = sorted([item, ...readLocal()]);
    writeLocal(items);
    setState({ items });
    return item;
  };

  return {
    getState: () => state,

    subscribe(listener) {
      start();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async create(input) {
      if (usingLocal() || !state.userId) return createLocal(input);
      try {
        const item = await remote.create(state.userId, input);
        setState({ items: sorted([item, ...state.items]) });
        return item;
      } catch (err) {
        // Keep the user's work: save in this browser; it is merged into the account later.
        warnOnce(err);
        setState({ offlineFallback: true, items: sorted(readLocal()) });
        return createLocal(input);
      }
    },

    async update(id, patch) {
      if (usingLocal() || id.startsWith(LOCAL_ID_PREFIX)) {
        const items = readLocal();
        const idx = items.findIndex((i) => i.id === id);
        if (idx === -1) throw new Error('Item not found');
        const updated = local.applyPatch(items[idx], patch, new Date().toISOString());
        items[idx] = updated;
        const next = sorted(items);
        writeLocal(next);
        setState({ items: next });
        return updated;
      }
      const updated = await remote.update(id, patch);
      setState({ items: sorted(state.items.map((i) => (i.id === id ? updated : i))) });
      return updated;
    },

    async remove(id) {
      if (usingLocal() || id.startsWith(LOCAL_ID_PREFIX)) {
        const next = readLocal().filter((i) => i.id !== id);
        writeLocal(next);
        setState({ items: sorted(next) });
        return;
      }
      await remote.remove(id);
      setState({ items: state.items.filter((i) => i.id !== id) });
    },

    async clearAll() {
      writeLocal([]);
      if (!usingLocal() && state.userId) {
        await remote.removeAll(state.userId);
      }
      setState({ items: [] });
    },
  };
}
