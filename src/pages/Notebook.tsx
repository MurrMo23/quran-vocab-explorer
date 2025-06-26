
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { NotebookPen, Plus, Search, Filter, BookOpen, Star } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Note {
  id: string;
  wordId: string;
  wordArabic: string;
  wordMeaning: string;
  content: string;
  type: 'general' | 'memory-aid' | 'example' | 'pronunciation';
  createdAt: string;
  updatedAt: string;
}

const Notebook = () => {
  const { session } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'general' as Note['type']
  });
  const [selectedWord, setSelectedWord] = useState({
    id: 'word-1',
    arabic: 'السلام',
    meaning: 'Peace'
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (session) {
      // Load user's notes - in a real app, this would come from Supabase
      const mockNotes: Note[] = [
        {
          id: '1',
          wordId: 'word-1',
          wordArabic: 'السلام',
          wordMeaning: 'Peace',
          content: 'Remember: This word appears in many greetings and prayers. The root س-ل-م relates to safety and wholeness.',
          type: 'memory-aid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          wordId: 'word-2',
          wordArabic: 'الحمد',
          wordMeaning: 'Praise',
          content: 'Example sentence: الحمد لله - Praise be to Allah. This is the opening of many surahs.',
          type: 'example',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setNotes(mockNotes);
    }
  }, [session]);

  const handleAddNote = () => {
    if (!newNote.content.trim()) {
      toast.error('Please enter note content');
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      wordId: selectedWord.id,
      wordArabic: selectedWord.arabic,
      wordMeaning: selectedWord.meaning,
      content: newNote.content,
      type: newNote.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNotes(prev => [note, ...prev]);
    setNewNote({ content: '', type: 'general' });
    setDialogOpen(false);
    toast.success('Note added successfully!');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.wordArabic.includes(searchQuery) ||
                         note.wordMeaning.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || note.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: Note['type']) => {
    switch (type) {
      case 'memory-aid': return 'bg-blue-100 text-blue-800';
      case 'example': return 'bg-green-100 text-green-800';
      case 'pronunciation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Note['type']) => {
    switch (type) {
      case 'memory-aid': return <Star className="h-4 w-4" />;
      case 'example': return <BookOpen className="h-4 w-4" />;
      case 'pronunciation': return <NotebookPen className="h-4 w-4" />;
      default: return <NotebookPen className="h-4 w-4" />;
    }
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <NotebookPen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Personal Notebook</h1>
        <p className="text-muted-foreground mb-6">
          Sign in to create and manage your personal vocabulary notes and memory aids.
        </p>
        <Button onClick={() => window.location.href = '/auth'}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <NotebookPen className="h-8 w-8" />
          My Vocabulary Notebook
        </h1>
        <p className="text-muted-foreground">
          Keep track of your personal notes, memory aids, and examples for vocabulary words.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search notes, words, or meanings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notes</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="memory-aid">Memory Aids</SelectItem>
            <SelectItem value="example">Examples</SelectItem>
            <SelectItem value="pronunciation">Pronunciation</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Word</label>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-arabic">{selectedWord.arabic}</span>
                    <span className="text-sm text-muted-foreground">{selectedWord.meaning}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Note Type</label>
                <Select value={newNote.type} onValueChange={(value) => setNewNote(prev => ({ ...prev, type: value as Note['type'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Note</SelectItem>
                    <SelectItem value="memory-aid">Memory Aid</SelectItem>
                    <SelectItem value="example">Example Usage</SelectItem>
                    <SelectItem value="pronunciation">Pronunciation Tip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Note Content</label>
                <Textarea
                  placeholder="Enter your note here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote}>
                  Add Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-4">
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <NotebookPen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No notes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start building your vocabulary notebook by adding your first note.'}
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-arabic">{note.wordArabic}</div>
                    <div>
                      <CardTitle className="text-lg">{note.wordMeaning}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getTypeColor(note.type)}>
                          {getTypeIcon(note.type)}
                          <span className="ml-1 capitalize">{note.type.replace('-', ' ')}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{note.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notebook;
