
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit, Trash2, Save, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sampleVocabulary, collections, addCustomWord, generateAudioForWord } from '@/utils/vocabulary';
import { Word, Example } from '@/utils/vocabulary-types';
import { toast } from 'sonner';

interface AdminWordsProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: any) => Promise<void>;
}

const AdminWords: React.FC<AdminWordsProps> = ({ onAuditLog }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState<Word[]>(sampleVocabulary);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [wordForm, setWordForm] = useState<Partial<Word>>({});
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  // For demonstration - in a real app, this would connect to your database
  const handleSearch = async () => {
    if (onAuditLog) {
      await onAuditLog('SEARCH', 'words', null, { query: searchQuery });
    }

    if (!searchQuery.trim()) {
      setFilteredWords(sampleVocabulary);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = sampleVocabulary.filter(word => 
      word.arabic.includes(query) ||
      word.meaning.toLowerCase().includes(query) ||
      word.transliteration.toLowerCase().includes(query)
    );
    
    setFilteredWords(results);
  };
  
  const handleEditWord = async (word: Word) => {
    if (onAuditLog) {
      await onAuditLog('EDIT_START', 'word', word.id, { wordId: word.id });
    }
    
    setSelectedWord(word);
    setWordForm({...word});
    setIsEditing(true);
  };
  
  const handleNewWord = async () => {
    if (onAuditLog) {
      await onAuditLog('NEW_WORD_START', 'word', null);
    }
    
    const newWordTemplate: Partial<Word> = {
      arabic: '',
      transliteration: '',
      meaning: '',
      root: '',
      partOfSpeech: 'noun',
      level: 'beginner',
      frequency: 0,
      tags: [],
      collections: [],
      examples: [],
      audioUrl: ''
    };
    
    setSelectedWord(null);
    setWordForm(newWordTemplate);
    setIsEditing(true);
  };
  
  const handleDeleteWord = async (wordId: string) => {
    // In a real app, this would delete from your database
    if (onAuditLog) {
      await onAuditLog('DELETE', 'word', wordId);
    }
    
    toast.success('Word deleted successfully (demo only)');
    setFilteredWords(words => words.filter(word => word.id !== wordId));
  };
  
  const handleSaveWord = async () => {
    if (!wordForm.arabic || !wordForm.meaning || !wordForm.transliteration) {
      toast.error('Please fill in all required fields: Arabic, Meaning, and Transliteration');
      return;
    }
    
    // In a real app, this would save to your database
    if (onAuditLog) {
      await onAuditLog(
        selectedWord ? 'UPDATE' : 'CREATE', 
        'word', 
        selectedWord?.id || null, 
        { wordData: wordForm }
      );
    }
    
    // Generate a unique ID for new words
    if (!selectedWord) {
      const id = `custom-${Date.now()}`;
      
      // Make sure all required properties are present
      const newWord: Word = {
        id,
        arabic: wordForm.arabic || '',
        transliteration: wordForm.transliteration || '',
        meaning: wordForm.meaning || '',
        translation: wordForm.meaning, // Use meaning as translation for backward compatibility
        root: wordForm.root || '',
        partOfSpeech: wordForm.partOfSpeech || 'noun',
        level: wordForm.level || 'beginner',
        frequency: wordForm.frequency || 0,
        tags: wordForm.tags || [],
        collections: wordForm.collections || [],
        collection: wordForm.collections?.[0] || 'general', // Use first collection as primary collection
        examples: wordForm.examples || [],
        audioUrl: wordForm.audioUrl || ''
      };
      
      // Add to custom words
      addCustomWord(newWord);
      
      // Add to filtered words
      setFilteredWords(prevWords => [...prevWords, newWord]);
    } else {
      // Update the word in the filtered list
      setFilteredWords(prevWords => 
        prevWords.map(word => 
          word.id === selectedWord.id ? { 
            ...word, 
            ...wordForm,
            translation: wordForm.meaning || word.meaning, // Ensure translation is set
            collection: wordForm.collections?.[0] || word.collections?.[0] || 'general' // Ensure collection is set
          } : word
        )
      );
    }
    
    toast.success(selectedWord ? 'Word updated successfully (demo only)' : 'New word created successfully (demo only)');
    setIsEditing(false);
  };
  
  const handleFormChange = (key: string, value: any) => {
    setWordForm(prev => ({ ...prev, [key]: value }));
  };
  
  const handleGenerateAudio = async () => {
    if (!wordForm.arabic) {
      toast.error('Please enter Arabic text first');
      return;
    }
    
    setIsGeneratingAudio(true);
    
    try {
      // Create a temporary word object for the generation function
      const tempWord = {
        id: selectedWord?.id || `temp-${Date.now()}`,
        arabic: wordForm.arabic,
        transliteration: wordForm.transliteration || '',
        meaning: wordForm.meaning || '',
        level: wordForm.level as 'beginner' | 'intermediate' | 'advanced' || 'beginner',
        examples: [],
        collections: [],
        frequency: 0,
        partOfSpeech: 'noun',
        root: '',
        tags: []
      };
      
      // Generate audio
      const audioUrl = await generateAudioForWord(tempWord);
      
      if (audioUrl) {
        setWordForm(prev => ({ ...prev, audioUrl }));
        toast.success('Audio generated successfully');
      } else {
        toast.error('Failed to generate audio');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Vocabulary Words</h2>
        <Button onClick={handleNewWord} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Word
        </Button>
      </div>
      
      <div className="flex mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search words by arabic, meaning or transliteration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} className="ml-2">Search</Button>
      </div>
      
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedWord ? 'Edit Word' : 'Add New Word'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arabic">Arabic Text <span className="text-red-500">*</span></Label>
                  <Input 
                    id="arabic" 
                    value={wordForm.arabic || ''} 
                    onChange={(e) => handleFormChange('arabic', e.target.value)}
                    className="font-arabic"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meaning">Meaning <span className="text-red-500">*</span></Label>
                  <Input 
                    id="meaning" 
                    value={wordForm.meaning || ''} 
                    onChange={(e) => handleFormChange('meaning', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transliteration">Transliteration <span className="text-red-500">*</span></Label>
                  <Input 
                    id="transliteration" 
                    value={wordForm.transliteration || ''} 
                    onChange={(e) => handleFormChange('transliteration', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="root">Root</Label>
                  <Input 
                    id="root" 
                    value={wordForm.root || ''} 
                    onChange={(e) => handleFormChange('root', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partOfSpeech">Part of Speech</Label>
                  <Select 
                    value={wordForm.partOfSpeech || ''} 
                    onValueChange={(value) => handleFormChange('partOfSpeech', value)}
                  >
                    <SelectTrigger id="partOfSpeech">
                      <SelectValue placeholder="Select part of speech" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="noun">Noun</SelectItem>
                      <SelectItem value="verb">Verb</SelectItem>
                      <SelectItem value="adjective">Adjective</SelectItem>
                      <SelectItem value="adverb">Adverb</SelectItem>
                      <SelectItem value="preposition">Preposition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select 
                    value={wordForm.level || ''} 
                    onValueChange={(value) => handleFormChange('level', value as 'beginner' | 'intermediate' | 'advanced')}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input 
                    id="frequency" 
                    type="number" 
                    value={wordForm.frequency || 0} 
                    onChange={(e) => handleFormChange('frequency', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input 
                    id="tags" 
                    value={wordForm.tags?.join(', ') || ''} 
                    onChange={(e) => handleFormChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                  />
                </div>
                
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label htmlFor="audioUrl">Audio URL</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="audioUrl" 
                      value={wordForm.audioUrl || ''} 
                      onChange={(e) => handleFormChange('audioUrl', e.target.value)}
                      placeholder="Enter audio URL or generate one"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleGenerateAudio}
                      disabled={isGeneratingAudio}
                      className="flex items-center gap-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      {isGeneratingAudio ? 'Generating...' : 'Generate Audio'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add a URL for audio pronunciation or click generate to create one automatically
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Collections</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {collections.map((collection) => (
                    <label key={collection.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={wordForm.collections?.includes(collection.id) || false}
                        onChange={(e) => {
                          const currentCollections = wordForm.collections || [];
                          if (e.target.checked) {
                            handleFormChange('collections', [...currentCollections, collection.id]);
                          } else {
                            handleFormChange('collections', currentCollections.filter(id => id !== collection.id));
                          }
                        }}
                      />
                      <span>{collection.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Examples</Label>
                {/* In a real implementation, you would have fields to add/edit examples */}
                <Textarea 
                  placeholder="In a full implementation, you would have fields to add and manage example sentences here."
                  rows={3}
                  disabled
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button className="gap-2" onClick={handleSaveWord}>
                  <Save className="h-4 w-4" />
                  Save Word
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWords.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No words found</p>
          ) : (
            filteredWords.map((word) => (
              <Card key={word.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-xl font-arabic mb-1">{word.arabic}</h3>
                        <div className="text-sm text-muted-foreground">{word.transliteration}</div>
                        <div className="font-medium mt-1">{word.meaning}</div>
                        {word.audioUrl && (
                          <button 
                            className="text-primary hover:text-primary/80 transition-colors mt-2 flex items-center text-sm"
                            onClick={() => {
                              const audio = new Audio(word.audioUrl);
                              audio.play().catch(err => {
                                console.error('Error playing audio:', err);
                                toast.error('Could not play audio');
                              });
                            }}
                          >
                            <Volume2 className="h-4 w-4 mr-1" />
                            Play Audio
                          </button>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditWord(word)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteWord(word.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {word.level}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {word.partOfSpeech}
                      </span>
                      {word.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminWords;
