// Personal vocabulary notes.
// Signed-in users: public.user_notes (RLS: own rows). Guests: localStorage 'qv-notes-v1',
// merged into the account on sign-in. Notes are always created private (is_public = false);
// there is no public sharing UI because there is no moderation.

import { useSyncExternalStore, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createSyncedStore, type SyncedState } from './createSyncedStore';
import { track } from '@/lib/analytics';

export const NOTE_TYPES = ['general', 'mnemonic', 'personal_example', 'etymology'] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  general: 'General',
  mnemonic: 'Memory aid',
  personal_example: 'My example',
  etymology: 'Root & etymology',
};

export const NOTE_MAX_LENGTH = 4000;

export interface Note {
  id: string;
  wordId: string;
  noteType: NoteType;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewNote {
  wordId: string;
  noteType: NoteType;
  content: string;
}

export interface NotePatch {
  noteType?: NoteType;
  content?: string;
}

export const NOTES_STORAGE_KEY = 'qv-notes-v1';

const isNoteType = (v: unknown): v is NoteType =>
  typeof v === 'string' && (NOTE_TYPES as readonly string[]).includes(v);

const clean = (content: string) => content.trim().slice(0, NOTE_MAX_LENGTH);

interface NoteRow {
  id: string;
  user_id: string;
  word_id: string;
  note_type: string | null;
  content: string;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const fromRow = (r: NoteRow): Note => ({
  id: r.id,
  wordId: r.word_id,
  noteType: isNoteType(r.note_type) ? r.note_type : 'general',
  content: r.content,
  createdAt: r.created_at ?? new Date().toISOString(),
  updatedAt: r.updated_at ?? r.created_at ?? new Date().toISOString(),
});

const store = createSyncedStore<Note, NewNote, NotePatch>({
  name: 'notes',
  storageKey: NOTES_STORAGE_KEY,
  sort: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  remote: {
    async list(userId) {
      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(fromRow);
    },
    async create(userId, input) {
      const { data, error } = await supabase
        .from('user_notes')
        .insert({
          user_id: userId,
          word_id: input.wordId,
          note_type: input.noteType,
          content: clean(input.content),
          is_public: false,
        })
        .select()
        .single();
      if (error) throw error;
      return fromRow(data);
    },
    async update(id, patch) {
      const { data, error } = await supabase
        .from('user_notes')
        .update({
          ...(patch.noteType ? { note_type: patch.noteType } : {}),
          ...(patch.content !== undefined ? { content: clean(patch.content) } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return fromRow(data);
    },
    async remove(id) {
      const { error } = await supabase.from('user_notes').delete().eq('id', id);
      if (error) throw error;
    },
    async removeAll(userId) {
      const { error } = await supabase.from('user_notes').delete().eq('user_id', userId);
      if (error) throw error;
    },
  },
  local: {
    build: (id, input, now) => ({
      id,
      wordId: input.wordId,
      noteType: input.noteType,
      content: clean(input.content),
      createdAt: now,
      updatedAt: now,
    }),
    applyPatch: (n, patch, now) => ({
      ...n,
      ...(patch.noteType ? { noteType: patch.noteType } : {}),
      ...(patch.content !== undefined ? { content: clean(patch.content) } : {}),
      updatedAt: now,
    }),
    parse: (raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const r = raw as Record<string, unknown>;
      if (typeof r.id !== 'string' || typeof r.wordId !== 'string' || typeof r.content !== 'string') return null;
      const now = new Date().toISOString();
      return {
        id: r.id,
        wordId: r.wordId,
        noteType: isNoteType(r.noteType) ? r.noteType : 'general',
        content: r.content,
        createdAt: typeof r.createdAt === 'string' ? r.createdAt : now,
        updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : now,
      };
    },
    toCreateInput: (n) => ({ wordId: n.wordId, noteType: n.noteType, content: n.content }),
  },
});

const validate = (content: string | undefined) => {
  if (content !== undefined && !content.trim()) throw new Error('Note cannot be empty');
};

export const createNote = (input: NewNote) => {
  validate(input.content);
  return store.create(input).then((note) => { track('note_create'); return note; });
};
export const updateNote = (id: string, patch: NotePatch) => {
  validate(patch.content);
  return store.update(id, patch);
};
export const deleteNote = (id: string) => store.remove(id);
export const deleteAllNotes = () => store.clearAll();

export type NotesState = SyncedState<Note>;

/** All of my notes (account or this browser), newest first. */
export function useNotes(): NotesState {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

/** My notes for one word. */
export function useWordNotes(wordId: string | undefined): NotesState & { notes: Note[] } {
  const state = useNotes();
  const notes = useMemo(
    () => (wordId ? state.items.filter((n) => n.wordId === wordId) : []),
    [state.items, wordId]
  );
  return { ...state, notes };
}
