
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Upload, 
  Search, 
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const wordSchema = z.object({
  arabic: z.string().min(1, 'Arabic text is required'),
  transliteration: z.string().min(1, 'Transliteration is required'),
  meaning: z.string().min(1, 'Meaning is required'),
  translation: z.string().optional(),
  root: z.string().optional(),
  part_of_speech: z.string().min(1, 'Part of speech is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  tags: z.array(z.string()).default([]),
  audio_url: z.string().optional(),
  pronunciation_guide: z.string().optional(),
  etymology: z.string().optional(),
  usage_notes: z.string().optional(),
  is_published: z.boolean().default(true)
});

type WordFormData = z.infer<typeof wordSchema>;

interface VocabularyWord {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  translation?: string;
  root?: string;
  part_of_speech: string;
  level: string;
  tags: string[];
  audio_url?: string;
  pronunciation_guide?: string;
  etymology?: string;
  usage_notes?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const VocabularyCMS: React.FC = () => {
  const { session } = useAuth();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [filteredWords, setFilteredWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const form = useForm<WordFormData>({
    resolver: zodResolver(wordSchema),
    defaultValues: {
      arabic: '',
      transliteration: '',
      meaning: '',
      translation: '',
      root: '',
      part_of_speech: 'noun',
      level: 'beginner',
      tags: [],
      audio_url: '',
      pronunciation_guide: '',
      etymology: '',
      usage_notes: '',
      is_published: true
    }
  });

  useEffect(() => {
    fetchWords();
  }, []);

  useEffect(() => {
    filterWords();
  }, [words, searchQuery, levelFilter, publishedFilter]);

  const fetchWords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vocabulary_words')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWords(data || []);
    } catch (error) {
      console.error('Error fetching words:', error);
      toast.error('Failed to load vocabulary words');
    } finally {
      setLoading(false);
    }
  };

  const filterWords = () => {
    let filtered = [...words];

    if (searchQuery) {
      filtered = filtered.filter(word => 
        word.arabic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(word => word.level === levelFilter);
    }

    if (publishedFilter !== 'all') {
      filtered = filtered.filter(word => 
        publishedFilter === 'published' ? word.is_published : !word.is_published
      );
    }

    setFilteredWords(filtered);
  };

  const handleSaveWord = async (data: WordFormData) => {
    try {
      setLoading(true);

      if (editingWord) {
        const { error } = await supabase
          .from('vocabulary_words')
          .update({
            arabic: data.arabic,
            transliteration: data.transliteration,
            meaning: data.meaning,
            translation: data.translation || null,
            root: data.root || null,
            part_of_speech: data.part_of_speech,
            level: data.level,
            tags: data.tags,
            audio_url: data.audio_url || null,
            pronunciation_guide: data.pronunciation_guide || null,
            etymology: data.etymology || null,
            usage_notes: data.usage_notes || null,
            is_published: data.is_published,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingWord.id);

        if (error) throw error;
        toast.success('Word updated successfully');
      } else {
        const { error } = await supabase
          .from('vocabulary_words')
          .insert({
            arabic: data.arabic,
            transliteration: data.transliteration,
            meaning: data.meaning,
            translation: data.translation || null,
            root: data.root || null,
            part_of_speech: data.part_of_speech,
            level: data.level,
            tags: data.tags,
            audio_url: data.audio_url || null,
            pronunciation_guide: data.pronunciation_guide || null,
            etymology: data.etymology || null,
            usage_notes: data.usage_notes || null,
            is_published: data.is_published
          });

        if (error) throw error;
        toast.success('Word created successfully');
      }

      form.reset();
      setEditingWord(null);
      fetchWords();
    } catch (error) {
      console.error('Error saving word:', error);
      toast.error('Failed to save word');
    } finally {
      setLoading(false);
    }
  };

  const handleEditWord = (word: VocabularyWord) => {
    setEditingWord(word);
    form.reset({
      arabic: word.arabic,
      transliteration: word.transliteration,
      meaning: word.meaning,
      translation: word.translation || '',
      root: word.root || '',
      part_of_speech: word.part_of_speech,
      level: word.level as 'beginner' | 'intermediate' | 'advanced',
      tags: word.tags,
      audio_url: word.audio_url || '',
      pronunciation_guide: word.pronunciation_guide || '',
      etymology: word.etymology || '',
      usage_notes: word.usage_notes || '',
      is_published: word.is_published
    });
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!confirm('Are you sure you want to delete this word?')) return;

    try {
      const { error } = await supabase
        .from('vocabulary_words')
        .delete()
        .eq('id', wordId);

      if (error) throw error;
      toast.success('Word deleted successfully');
      fetchWords();
    } catch (error) {
      console.error('Error deleting word:', error);
      toast.error('Failed to delete word');
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedWords.length === 0) {
      toast.error('No words selected');
      return;
    }

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedWords.length} words?`)) {
      return;
    }

    try {
      setLoading(true);

      if (action === 'delete') {
        const { error } = await supabase
          .from('vocabulary_words')
          .delete()
          .in('id', selectedWords);

        if (error) throw error;
        toast.success(`${selectedWords.length} words deleted`);
      } else {
        const { error } = await supabase
          .from('vocabulary_words')
          .update({ 
            is_published: action === 'publish',
            updated_at: new Date().toISOString()
          })
          .in('id', selectedWords);

        if (error) throw error;
        toast.success(`${selectedWords.length} words ${action}ed`);
      }

      setSelectedWords([]);
      fetchWords();
    } catch (error) {
      console.error(`Error ${action}ing words:`, error);
      toast.error(`Failed to ${action} words`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportWords = () => {
    const exportData = filteredWords.map(word => ({
      Arabic: word.arabic,
      Transliteration: word.transliteration,
      Meaning: word.meaning,
      Translation: word.translation || '',
      Root: word.root || '',
      'Part of Speech': word.part_of_speech,
      Level: word.level,
      Tags: word.tags.join(', '),
      Published: word.is_published ? 'Yes' : 'No'
    }));

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabulary-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vocabulary Management</h2>
        <div className="flex gap-2">
          <Button onClick={handleExportWords} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => {
            setEditingWord(null);
            form.reset();
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Word
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Word List</TabsTrigger>
          <TabsTrigger value="edit">
            {editingWord ? 'Edit Word' : 'Add New Word'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search words..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="unpublished">Unpublished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedWords.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedWords.length} word(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('publish')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Publish
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('unpublish')}
                    >
                      <EyeOff className="h-4 w-4 mr-1" />
                      Unpublish
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkAction('delete')}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Words List */}
          <div className="grid gap-4">
            {loading && <div>Loading...</div>}
            {!loading && filteredWords.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No words found
                </CardContent>
              </Card>
            )}
            {filteredWords.map((word) => (
              <Card key={word.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedWords.includes(word.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedWords([...selectedWords, word.id]);
                          } else {
                            setSelectedWords(selectedWords.filter(id => id !== word.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-bold">{word.arabic}</h3>
                          <span className="text-lg text-muted-foreground">
                            ({word.transliteration})
                          </span>
                          <Badge variant={word.is_published ? 'default' : 'secondary'}>
                            {word.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{word.meaning}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{word.level}</Badge>
                          <Badge variant="outline">{word.part_of_speech}</Badge>
                          {word.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditWord(word)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteWord(word.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingWord ? 'Edit Word' : 'Add New Word'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSaveWord)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Arabic Text *</label>
                    <Input {...form.register('arabic')} placeholder="Arabic word" />
                    {form.formState.errors.arabic && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.arabic.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Transliteration *</label>
                    <Input {...form.register('transliteration')} placeholder="Transliteration" />
                    {form.formState.errors.transliteration && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.transliteration.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Meaning *</label>
                  <Input {...form.register('meaning')} placeholder="Primary meaning" />
                  {form.formState.errors.meaning && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.meaning.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Translation</label>
                  <Input {...form.register('translation')} placeholder="Additional translation" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Root</label>
                    <Input {...form.register('root')} placeholder="Arabic root" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Part of Speech *</label>
                    <Select 
                      value={form.watch('part_of_speech')} 
                      onValueChange={(value) => form.setValue('part_of_speech', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="noun">Noun</SelectItem>
                        <SelectItem value="verb">Verb</SelectItem>
                        <SelectItem value="adjective">Adjective</SelectItem>
                        <SelectItem value="adverb">Adverb</SelectItem>
                        <SelectItem value="preposition">Preposition</SelectItem>
                        <SelectItem value="particle">Particle</SelectItem>
                        <SelectItem value="pronoun">Pronoun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Level *</label>
                    <Select 
                      value={form.watch('level')} 
                      onValueChange={(value) => form.setValue('level', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium">Pronunciation Guide</label>
                  <Textarea 
                    {...form.register('pronunciation_guide')} 
                    placeholder="Pronunciation notes and guidance"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Etymology</label>
                  <Textarea 
                    {...form.register('etymology')} 
                    placeholder="Word origin and etymology"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Usage Notes</label>
                  <Textarea 
                    {...form.register('usage_notes')} 
                    placeholder="Usage context and notes"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Audio URL</label>
                  <Input 
                    {...form.register('audio_url')} 
                    placeholder="URL to audio pronunciation file"
                    type="url"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={form.watch('is_published')}
                    onCheckedChange={(checked) => form.setValue('is_published', !!checked)}
                  />
                  <label className="text-sm font-medium">Publish immediately</label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setEditingWord(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving...' : editingWord ? 'Update Word' : 'Create Word'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VocabularyCMS;
