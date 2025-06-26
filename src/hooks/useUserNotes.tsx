
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export interface UserNote {
  id: string;
  user_id: string;
  word_id: string;
  note_type: 'general' | 'mnemonic' | 'personal_example' | 'etymology';
  content: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserNotes = (wordId?: string) => {
  const { session } = useAuth();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      let query = supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', session.user.id);

      if (wordId) {
        query = query.eq('word_id', wordId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast to ensure proper typing
      const typedData = (data || []).map(note => ({
        ...note,
        note_type: note.note_type as UserNote['note_type']
      }));
      
      setNotes(typedData);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note: Omit<UserNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!session?.user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('user_notes')
        .insert({
          ...note,
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        note_type: data.note_type as UserNote['note_type']
      };
      
      setNotes(prev => [typedData, ...prev]);
      toast.success('Note added successfully');
      return typedData;
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
      return null;
    }
  };

  const updateNote = async (noteId: string, updates: Partial<UserNote>) => {
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        note_type: data.note_type as UserNote['note_type']
      };
      
      setNotes(prev => prev.map(note => note.id === noteId ? typedData : note));
      toast.success('Note updated successfully');
      return typedData;
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
      return null;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [session?.user?.id, wordId]);

  return { notes, loading, addNote, updateNote, deleteNote, refetch: fetchNotes };
};
