// User-made word collections ("My collections").
// Signed-in users: public.user_collections (migration 20261106150000, RLS own rows).
// Guests: localStorage 'qv-collections-v1', merged into the account on sign-in.
//
// The generated Supabase types do not include user_collections yet, so the only untyped
// access is the `table()` helper below; everything leaving this module is typed.

import { useSyncExternalStore, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createSyncedStore, type SyncedState } from '@/lib/notes/createSyncedStore';
import { track } from '@/lib/analytics';

export const COLLECTIONS_STORAGE_KEY = 'qv-collections-v1';
export const COLLECTION_NAME_MAX = 80;
export const COLLECTION_DESCRIPTION_MAX = 500;
export const COLLECTION_WORDS_MAX = 1000;

/** Query parameter the Review page reads: /review?collection=<id> (/practice?collection= redirects there). */
export const PRACTICE_COLLECTION_PARAM = 'collection';
export const practiceCollectionUrl = (id: string) =>
  `/review?${PRACTICE_COLLECTION_PARAM}=${encodeURIComponent(id)}`;

export interface UserCollection {
  id: string;
  name: string;
  description: string;
  wordIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NewUserCollection {
  name: string;
  description?: string;
  wordIds?: string[];
}

export interface UserCollectionPatch {
  name?: string;
  description?: string;
  wordIds?: string[];
}

interface CollectionRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  word_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

interface PgError {
  message: string;
  code?: string;
}
interface Result<T> {
  data: T | null;
  error: PgError | null;
}
// Minimal typed surface of the query builder used here.
interface CollectionsQuery extends PromiseLike<Result<CollectionRow[]>> {
  select(cols?: string): CollectionsQuery;
  insert(row: Partial<CollectionRow>): CollectionsQuery;
  update(row: Partial<CollectionRow>): CollectionsQuery;
  delete(): CollectionsQuery;
  eq(col: string, value: string): CollectionsQuery;
  order(col: string, opts: { ascending: boolean }): CollectionsQuery;
  single(): PromiseLike<Result<CollectionRow>>;
}

const table = (): CollectionsQuery =>
  (supabase as unknown as { from(name: string): CollectionsQuery }).from('user_collections');

const cleanName = (s: string) => s.trim().slice(0, COLLECTION_NAME_MAX);
const cleanDescription = (s: string | undefined) => (s ?? '').trim().slice(0, COLLECTION_DESCRIPTION_MAX);
const cleanWordIds = (ids: readonly string[] | undefined) =>
  Array.from(new Set((ids ?? []).filter((x) => typeof x === 'string' && x.length > 0))).slice(
    0,
    COLLECTION_WORDS_MAX
  );

const fromRow = (r: CollectionRow): UserCollection => ({
  id: r.id,
  name: r.name,
  description: r.description ?? '',
  wordIds: r.word_ids ?? [],
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const store = createSyncedStore<UserCollection, NewUserCollection, UserCollectionPatch>({
  name: 'collections',
  storageKey: COLLECTIONS_STORAGE_KEY,
  sort: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  remote: {
    async list(userId) {
      const { data, error } = await table().select('*').eq('user_id', userId).order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(fromRow);
    },
    async create(userId, input) {
      const { data, error } = await table()
        .insert({
          user_id: userId,
          name: cleanName(input.name),
          description: cleanDescription(input.description) || null,
          word_ids: cleanWordIds(input.wordIds),
        })
        .select()
        .single();
      if (error || !data) throw error ?? new Error('No row returned');
      return fromRow(data);
    },
    async update(id, patch) {
      const row: Partial<CollectionRow> = {};
      if (patch.name !== undefined) row.name = cleanName(patch.name);
      if (patch.description !== undefined) row.description = cleanDescription(patch.description) || null;
      if (patch.wordIds !== undefined) row.word_ids = cleanWordIds(patch.wordIds);
      const { data, error } = await table().update(row).eq('id', id).select().single();
      if (error || !data) throw error ?? new Error('No row returned');
      return fromRow(data);
    },
    async remove(id) {
      const { error } = await table().delete().eq('id', id);
      if (error) throw error;
    },
    async removeAll(userId) {
      const { error } = await table().delete().eq('user_id', userId);
      if (error) throw error;
    },
  },
  local: {
    build: (id, input, now) => ({
      id,
      name: cleanName(input.name),
      description: cleanDescription(input.description),
      wordIds: cleanWordIds(input.wordIds),
      createdAt: now,
      updatedAt: now,
    }),
    applyPatch: (c, patch, now) => ({
      ...c,
      ...(patch.name !== undefined ? { name: cleanName(patch.name) } : {}),
      ...(patch.description !== undefined ? { description: cleanDescription(patch.description) } : {}),
      ...(patch.wordIds !== undefined ? { wordIds: cleanWordIds(patch.wordIds) } : {}),
      updatedAt: now,
    }),
    parse: (raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const r = raw as Record<string, unknown>;
      if (typeof r.id !== 'string' || typeof r.name !== 'string' || !r.name.trim()) return null;
      const now = new Date().toISOString();
      return {
        id: r.id,
        name: cleanName(r.name),
        description: typeof r.description === 'string' ? r.description : '',
        wordIds: Array.isArray(r.wordIds) ? cleanWordIds(r.wordIds as string[]) : [],
        createdAt: typeof r.createdAt === 'string' ? r.createdAt : now,
        updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : now,
      };
    },
    toCreateInput: (c) => ({ name: c.name, description: c.description, wordIds: c.wordIds }),
  },
});

const validateName = (name: string | undefined) => {
  if (name === undefined) return;
  const n = name.trim();
  if (!n) throw new Error('Please enter a collection name');
  if (n.length > COLLECTION_NAME_MAX) throw new Error(`Name must be ${COLLECTION_NAME_MAX} characters or fewer`);
};

export const createCollection = (input: NewUserCollection) => {
  validateName(input.name);
  return store.create(input).then((c) => { track('collection_create'); return c; });
};
export const updateCollection = (id: string, patch: UserCollectionPatch) => {
  validateName(patch.name);
  return store.update(id, patch);
};
export const deleteCollection = (id: string) => store.remove(id);
export const deleteAllCollections = () => store.clearAll();

const current = (id: string) => store.getState().items.find((c) => c.id === id);

export const addWordToUserCollection = (id: string, wordId: string) => {
  const c = current(id);
  if (!c) return Promise.reject(new Error('Collection not found'));
  if (c.wordIds.includes(wordId)) return Promise.resolve(c);
  return store.update(id, { wordIds: [...c.wordIds, wordId] });
};

export const removeWordFromUserCollection = (id: string, wordId: string) => {
  const c = current(id);
  if (!c) return Promise.reject(new Error('Collection not found'));
  return store.update(id, { wordIds: c.wordIds.filter((w) => w !== wordId) });
};

export type UserCollectionsState = SyncedState<UserCollection>;

/** My collections (account or this browser), most recently changed first. */
export function useUserCollections(): UserCollectionsState {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

/** One of my collections by id (undefined while loading or if not found). */
export function useUserCollection(id: string | null | undefined): UserCollectionsState & {
  collection: UserCollection | undefined;
} {
  const state = useUserCollections();
  const collection = useMemo(() => (id ? state.items.find((c) => c.id === id) : undefined), [state.items, id]);
  return { ...state, collection };
}
