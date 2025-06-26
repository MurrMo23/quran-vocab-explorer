
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export interface CommunitySentence {
  id: string;
  user_id: string;
  word_id: string;
  sentence_arabic: string;
  sentence_translation: string;
  context?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  votes: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  is_public: boolean;
  max_members: number;
  current_members: number;
  focus_collections: string[];
  created_at: string;
  updated_at: string;
}

export const useCommunityFeatures = () => {
  const { session } = useAuth();
  const [sentences, setSentences] = useState<CommunitySentence[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCommunitySentences = async (wordId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('community_sentences')
        .select('*')
        .eq('is_approved', true);

      if (wordId) {
        query = query.eq('word_id', wordId);
      }

      const { data, error } = await query.order('votes', { ascending: false });

      if (error) throw error;
      
      // Type cast to ensure proper typing
      const typedData = (data || []).map(sentence => ({
        ...sentence,
        difficulty_level: sentence.difficulty_level as CommunitySentence['difficulty_level']
      }));
      
      setSentences(typedData);
    } catch (error: any) {
      console.error('Error fetching community sentences:', error);
      toast.error('Failed to load community sentences');
    } finally {
      setLoading(false);
    }
  };

  const submitSentence = async (sentence: Omit<CommunitySentence, 'id' | 'user_id' | 'votes' | 'is_approved' | 'created_at' | 'updated_at'>) => {
    if (!session?.user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('community_sentences')
        .insert({
          ...sentence,
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Sentence submitted for review');
      return data;
    } catch (error: any) {
      console.error('Error submitting sentence:', error);
      toast.error('Failed to submit sentence');
      return null;
    }
  };

  const fetchStudyGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('is_public', true)
        .order('current_members', { ascending: false });

      if (error) throw error;
      setStudyGroups(data || []);
    } catch (error: any) {
      console.error('Error fetching study groups:', error);
      toast.error('Failed to load study groups');
    } finally {
      setLoading(false);
    }
  };

  const createStudyGroup = async (group: Omit<StudyGroup, 'id' | 'created_by' | 'current_members' | 'created_at' | 'updated_at'>) => {
    if (!session?.user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('study_groups')
        .insert({
          ...group,
          created_by: session.user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Also add creator as member
      await supabase
        .from('study_group_members')
        .insert({
          group_id: data.id,
          user_id: session.user.id,
          role: 'admin'
        });

      setStudyGroups(prev => [data, ...prev]);
      toast.success('Study group created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating study group:', error);
      toast.error('Failed to create study group');
      return null;
    }
  };

  const joinStudyGroup = async (groupId: string) => {
    if (!session?.user?.id) return false;

    try {
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: session.user.id
        });

      if (error) throw error;
      
      // Update group member count manually since we don't have the RPC function
      const group = studyGroups.find(g => g.id === groupId);
      if (group) {
        const { error: updateError } = await supabase
          .from('study_groups')
          .update({ current_members: group.current_members + 1 })
          .eq('id', groupId);
        
        if (updateError) console.error('Error updating member count:', updateError);
      }
      
      toast.success('Joined study group successfully');
      await fetchStudyGroups();
      return true;
    } catch (error: any) {
      console.error('Error joining study group:', error);
      toast.error('Failed to join study group');
      return false;
    }
  };

  useEffect(() => {
    fetchCommunitySentences();
    fetchStudyGroups();
  }, []);

  return {
    sentences,
    studyGroups,
    loading,
    fetchCommunitySentences,
    submitSentence,
    createStudyGroup,
    joinStudyGroup,
    refetch: () => {
      fetchCommunitySentences();
      fetchStudyGroups();
    }
  };
};
