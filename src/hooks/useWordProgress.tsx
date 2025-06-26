
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export interface UserWordProgress {
  id: string;
  user_id: string;
  word_id: string;
  collection_id: string;
  level: number;
  next_review: string;
  last_reviewed?: string;
  review_count: number;
  success_streak: number;
  difficulty_modifier: number;
  pronunciation_mastery: number;
  contextual_mastery: number;
  created_at: string;
  updated_at: string;
}

export const useWordProgress = (wordId?: string) => {
  const { session } = useAuth();
  const [progress, setProgress] = useState<UserWordProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProgress = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      let query = supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', session.user.id);

      if (wordId) {
        query = query.eq('word_id', wordId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProgress(data || []);
    } catch (error: any) {
      console.error('Error fetching progress:', error);
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (
    wordId: string,
    collectionId: string,
    updates: Partial<UserWordProgress>
  ) => {
    if (!session?.user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('user_word_progress')
        .upsert({
          user_id: session.user.id,
          word_id: wordId,
          collection_id: collectionId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      setProgress(prev => {
        const index = prev.findIndex(p => p.word_id === wordId);
        if (index >= 0) {
          const newProgress = [...prev];
          newProgress[index] = data;
          return newProgress;
        }
        return [...prev, data];
      });

      return data;
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
      return null;
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [session?.user?.id, wordId]);

  return { progress, loading, updateProgress, refetch: fetchProgress };
};
