// Compatibility wrapper over src/lib/notes (the real data layer). Prefer importing
// useNotes / useWordNotes / createNote / updateNote / deleteNote from '@/lib/notes'.
import { useCallback } from 'react';
import {
  createNote,
  deleteNote as removeNote,
  updateNote as patchNote,
  useNotes,
  type Note,
  type NoteType,
} from '@/lib/notes';

export interface UserNote {
  id: string;
  word_id: string;
  note_type: NoteType;
  content: string;
  created_at: string;
  updated_at: string;
}

const toLegacy = (n: Note): UserNote => ({
  id: n.id,
  word_id: n.wordId,
  note_type: n.noteType,
  content: n.content,
  created_at: n.createdAt,
  updated_at: n.updatedAt,
});

export const useUserNotes = (wordId?: string) => {
  const { items, loading, isGuest, offlineFallback } = useNotes();
  const notes = items.filter((n) => !wordId || n.wordId === wordId).map(toLegacy);

  const addNote = useCallback(
    async (note: { word_id: string; note_type: NoteType; content: string }) =>
      toLegacy(await createNote({ wordId: note.word_id, noteType: note.note_type, content: note.content })),
    []
  );
  const updateNote = useCallback(
    async (id: string, updates: Partial<Pick<UserNote, 'note_type' | 'content'>>) =>
      toLegacy(await patchNote(id, { noteType: updates.note_type, content: updates.content })),
    []
  );
  const deleteNote = useCallback((id: string) => removeNote(id), []);

  return { notes, loading, isGuest, offlineFallback, addNote, updateNote, deleteNote };
};
