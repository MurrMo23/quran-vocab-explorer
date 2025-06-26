
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { collections, getWordsByCollection } from '@/utils/vocabulary';
import { Collection, Word } from '@/utils/vocabulary-types';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { DifficultyLevel } from '@/components/learning/LearningPathForm';
import { commonSurahs } from '@/components/learning/SurahSelector';

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  surahs: number[];
  themes: string[];
  difficulty: DifficultyLevel;
  is_public: boolean;
  created_at: string;
  user_id: string;
}

export const useCustomLearning = () => {
  const { session } = useAuth();
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [userPaths, setUserPaths] = useState<LearningPath[]>([]);
  const [publicPaths, setPublicPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's learning paths
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserPaths();
      fetchPublicPaths();
    }
  }, [session?.user?.id]);

  const fetchUserPaths = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('user_id', session?.user?.id);

      if (error) throw error;
      
      // Type casting to ensure compatibility
      const typedData = data?.map(path => ({
        ...path,
        difficulty: (path.difficulty || 'beginner') as DifficultyLevel,
        surahs: path.surahs || [],
        themes: path.themes || []
      })) || [];
      
      setUserPaths(typedData);
    } catch (error: any) {
      console.error('Error fetching learning paths:', error);
      toast.error('Failed to load your learning paths');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicPaths = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', session?.user?.id || '');

      if (error) throw error;
      
      // Type casting to ensure compatibility
      const typedData = data?.map(path => ({
        ...path,
        difficulty: (path.difficulty || 'beginner') as DifficultyLevel,
        surahs: path.surahs || [],
        themes: path.themes || []
      })) || [];
      
      setPublicPaths(typedData);
    } catch (error: any) {
      console.error('Error fetching public paths:', error);
    }
  };

  const handleSurahToggle = (surahId: number) => {
    setSelectedSurahs(prev => 
      prev.includes(surahId) 
        ? prev.filter(id => id !== surahId) 
        : [...prev, surahId]
    );
  };

  const handleThemeToggle = (themeId: string) => {
    setSelectedThemes(prev => 
      prev.includes(themeId) 
        ? prev.filter(id => id !== themeId) 
        : [...prev, themeId]
    );
  };

  const handleClearSelections = () => {
    setSelectedSurahs([]);
    setSelectedThemes([]);
  };

  const saveLearningPath = async (pathDetails: {
    name: string;
    description: string;
    difficulty: DifficultyLevel;
    isPublic: boolean;
  }) => {
    if (!session) {
      toast.error('You must be logged in to save a learning path');
      return null;
    }

    if (selectedSurahs.length === 0 && selectedThemes.length === 0) {
      toast.error('Please select at least one Surah or Theme to continue');
      return null;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_paths')
        .insert({
          name: pathDetails.name,
          description: pathDetails.description,
          difficulty: pathDetails.difficulty,
          is_public: pathDetails.isPublic,
          surahs: selectedSurahs,
          themes: selectedThemes,
          user_id: session.user.id
        })
        .select();

      if (error) throw error;
      
      toast.success('Learning path saved successfully!');
      await fetchUserPaths();
      
      // Type cast the returned data
      if (data && data.length > 0) {
        return {
          ...data[0],
          difficulty: data[0].difficulty as DifficultyLevel,
          surahs: data[0].surahs || [],
          themes: data[0].themes || []
        };
      }
      return null;
    } catch (error: any) {
      console.error('Error saving learning path:', error);
      toast.error('Failed to save learning path');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteLearningPath = async (pathId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('learning_paths')
        .delete()
        .eq('id', pathId);

      if (error) throw error;
      
      toast.success('Learning path deleted');
      await fetchUserPaths();
    } catch (error: any) {
      console.error('Error deleting learning path:', error);
      toast.error('Failed to delete learning path');
    } finally {
      setLoading(false);
    }
  };

  // Get words based on the current selection
  const getSelectedWords = (): Word[] => {
    let words: Word[] = [];
    
    // Add words from selected themes
    if (selectedThemes.length > 0) {
      selectedThemes.forEach(themeId => {
        words = [...words, ...getWordsByCollection(themeId)];
      });
    }
    
    // Filter by Surahs (in a real app, this would filter by Surah references)
    // For now, this is a simplified implementation
    if (selectedSurahs.length > 0 && words.length > 0) {
      words = words.filter(word => 
        word.examples.some(ex => selectedSurahs.includes(ex.surah))
      );
    }
    
    // Deduplicate words based on id
    const uniqueWords = Array.from(new Map(words.map(word => [word.id, word])).values());
    return uniqueWords;
  };

  // Get words based on a saved learning path
  const getPathWords = (path: LearningPath): Word[] => {
    let words: Word[] = [];
    
    // Add words from selected themes
    if (path.themes && path.themes.length > 0) {
      path.themes.forEach(themeId => {
        words = [...words, ...getWordsByCollection(themeId)];
      });
    }
    
    // Filter by Surahs
    if (path.surahs && path.surahs.length > 0 && words.length > 0) {
      words = words.filter(word => 
        word.examples.some(ex => path.surahs.includes(ex.surah))
      );
    }
    
    // Deduplicate words
    const uniqueWords = Array.from(new Map(words.map(word => [word.id, word])).values());
    return uniqueWords;
  };

  // Calculate theme word counts
  const themeWordCounts = collections.map(collection => ({
    ...collection,
    wordCount: getWordsByCollection(collection.id).length
  }));

  return {
    selectedSurahs,
    selectedThemes,
    userPaths,
    publicPaths,
    loading,
    handleSurahToggle,
    handleThemeToggle,
    handleClearSelections,
    saveLearningPath,
    deleteLearningPath,
    getSelectedWords,
    getPathWords,
    themeWordCounts,
  };
};
