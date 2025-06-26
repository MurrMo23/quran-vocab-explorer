
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Save, Plus, Search, FileDown, FileUp } from 'lucide-react';
import { getAllWords } from '@/utils/vocabulary';
import { Word } from '@/utils/vocabulary-types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const wordSchema = z.object({
  arabic: z.string().min(1, { message: "Arabic text is required" }),
  transliteration: z.string().min(1, { message: "Transliteration is required" }),
  meaning: z.string().min(1, { message: "Meaning is required" }),
  root: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  partOfSpeech: z.string().optional(),
});

type WordFormValues = z.infer<typeof wordSchema>;

interface AdminVocabularyProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: any) => Promise<void>;
}

const AdminVocabulary: React.FC<AdminVocabularyProps> = ({ onAuditLog }) => {
  const [words, setWords] = useState<Word[]>(getAllWords());
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState<Word[]>(words);

  const form = useForm<WordFormValues>({
    resolver: zodResolver(wordSchema),
    defaultValues: {
      arabic: '',
      transliteration: '',
      meaning: '',
      root: '',
      level: 'beginner',
      partOfSpeech: 'noun',
    }
  });

  const handleSearch = () => {
    if (!searchQuery) {
      setFilteredWords(words);
      return;
    }
    
    const filtered = words.filter(word => 
      word.arabic.includes(searchQuery) ||
      word.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.root?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredWords(filtered);
  };

  const handleEditWord = async (word: Word) => {
    if (onAuditLog) {
      await onAuditLog('EDIT_START', 'word', word.id, { wordId: word.id });
    }
    
    setSelectedWord(word);
    form.reset({
      arabic: word.arabic,
      transliteration: word.transliteration,
      meaning: word.meaning,
      root: word.root || '',
      level: word.level as 'beginner' | 'intermediate' | 'advanced',
      partOfSpeech: word.partOfSpeech || 'noun',
    });
    setIsEditing(true);
  };

  const handleNewWord = async () => {
    if (onAuditLog) {
      await onAuditLog('NEW_WORD_START', 'word', null);
    }
    
    setSelectedWord(null);
    form.reset({
      arabic: '',
      transliteration: '',
      meaning: '',
      root: '',
      level: 'beginner',
      partOfSpeech: 'noun',
    });
    setIsEditing(true);
  };

  const handleDeleteWord = async (wordId: string) => {
    if (onAuditLog) {
      await onAuditLog('DELETE', 'word', wordId);
    }
    
    setWords(prev => prev.filter(w => w.id !== wordId));
    setFilteredWords(prev => prev.filter(w => w.id !== wordId));
    toast.success('Word deleted successfully (demo only)');
  };

  const handleSaveWord = async (data: WordFormValues) => {
    const csrfToken = await generateCSRFToken();
    
    if (onAuditLog) {
      await onAuditLog(
        selectedWord ? 'UPDATE' : 'CREATE', 
        'word', 
        selectedWord?.id || null, 
        { 
          wordData: data,
          csrfToken
        }
      );
    }
    
    toast.success(selectedWord ? 'Word updated successfully (demo only)' : 'New word created successfully (demo only)');
    setIsEditing(false);
    
    // Demo update UI
    if (selectedWord) {
      const updatedWord = { ...selectedWord, ...data };
      setWords(prev => prev.map(w => w.id === selectedWord.id ? updatedWord : w));
      setFilteredWords(prev => prev.map(w => w.id === selectedWord.id ? updatedWord : w));
    } else {
      const newWord: Word = {
        id: Date.now().toString(),
        arabic: data.arabic,
        transliteration: data.transliteration,
        meaning: data.meaning,
        root: data.root || '',
        level: data.level,
        partOfSpeech: data.partOfSpeech || 'noun',
        examples: [],
        frequency: 1,
        tags: [],
        collections: []
      };
      setWords(prev => [...prev, newWord]);
      setFilteredWords(prev => [...prev, newWord]);
    }
  };

  const generateCSRFToken = async (): Promise<string> => {
    return `csrf-${Math.random().toString(36).substring(2, 15)}`;
  };

  const exportWords = async () => {
    const csrfToken = await generateCSRFToken();
    
    if (onAuditLog) {
      await onAuditLog('EXPORT', 'word', null, { 
        count: words.length,
        csrfToken
      });
    }
    
    const dataStr = JSON.stringify(words, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'vocabulary-words.json');
    linkElement.click();
    
    toast.success(`${words.length} words exported successfully`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Vocabulary Management</h2>
        <div className="flex gap-2">
          <Button onClick={exportWords} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export Words
          </Button>
          {!isEditing && (
            <Button onClick={handleNewWord} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Word
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedWord ? 'Edit Word' : 'Add New Word'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveWord)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="arabic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arabic Text</FormLabel>
                        <FormControl>
                          <Input {...field} className="text-right" dir="rtl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="transliteration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transliteration</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="meaning"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meaning</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="root"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Root (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partOfSpeech"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part of Speech</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="noun">Noun</SelectItem>
                            <SelectItem value="verb">Verb</SelectItem>
                            <SelectItem value="adjective">Adjective</SelectItem>
                            <SelectItem value="adverb">Adverb</SelectItem>
                            <SelectItem value="preposition">Preposition</SelectItem>
                            <SelectItem value="pronoun">Pronoun</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)} type="button">
                    Cancel
                  </Button>
                  <Button className="gap-2" type="submit">
                    <Save className="h-4 w-4" />
                    Save Word
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search words by Arabic, transliteration, meaning, or root..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="ml-2">Search</Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Arabic</TableHead>
                  <TableHead>Transliteration</TableHead>
                  <TableHead>Meaning</TableHead>
                  <TableHead>Root</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Part of Speech</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWords.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell className="font-arabic text-right">{word.arabic}</TableCell>
                    <TableCell>{word.transliteration}</TableCell>
                    <TableCell>{word.meaning}</TableCell>
                    <TableCell>{word.root}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        word.level === 'beginner' ? 'bg-green-100 text-green-800' :
                        word.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {word.level}
                      </span>
                    </TableCell>
                    <TableCell>{word.partOfSpeech}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditWord(word)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteWord(word.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No words found matching your search.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminVocabulary;
