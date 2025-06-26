
import React, { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserNotes, UserNote } from '@/hooks/useUserNotes';

const PersonalVocabularyNotebook: React.FC = () => {
  const { notes, loading, addNote, updateNote, deleteNote } = useUserNotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [formData, setFormData] = useState({
    word_id: '',
    note_type: 'general' as UserNote['note_type'],
    content: '',
    is_public: false
  });

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.word_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || note.note_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNote) {
      await updateNote(editingNote.id, formData);
      setEditingNote(null);
    } else {
      await addNote(formData);
      setShowAddNote(false);
    }
    
    setFormData({
      word_id: '',
      note_type: 'general',
      content: '',
      is_public: false
    });
  };

  const handleEdit = (note: UserNote) => {
    setEditingNote(note);
    setFormData({
      word_id: note.word_id,
      note_type: note.note_type,
      content: note.content,
      is_public: note.is_public
    });
  };

  const handleDelete = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const getNoteTypeIcon = (type: UserNote['note_type']) => {
    switch (type) {
      case 'mnemonic': return '🧠';
      case 'personal_example': return '💡';
      case 'etymology': return '📚';
      default: return '📝';
    }
  };

  const getNoteTypeColor = (type: UserNote['note_type']) => {
    switch (type) {
      case 'mnemonic': return 'bg-purple-100 text-purple-800';
      case 'personal_example': return 'bg-blue-100 text-blue-800';
      case 'etymology': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Personal Vocabulary Notebook
        </h1>
        <p className="text-muted-foreground">
          Keep track of your personal notes, mnemonics, and insights about Arabic vocabulary
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes or words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="mnemonic">Mnemonics</SelectItem>
            <SelectItem value="personal_example">Examples</SelectItem>
            <SelectItem value="etymology">Etymology</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Word ID or Arabic word"
                value={formData.word_id}
                onChange={(e) => setFormData(prev => ({ ...prev, word_id: e.target.value }))}
                required
              />
              <Select 
                value={formData.note_type} 
                onValueChange={(value: UserNote['note_type']) => 
                  setFormData(prev => ({ ...prev, note_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Note</SelectItem>
                  <SelectItem value="mnemonic">Mnemonic Device</SelectItem>
                  <SelectItem value="personal_example">Personal Example</SelectItem>
                  <SelectItem value="etymology">Etymology/Root</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Write your note here..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                required
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddNote(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Note</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start building your personal vocabulary notebook by adding your first note!'
                }
              </p>
              <Button onClick={() => setShowAddNote(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getNoteTypeIcon(note.note_type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold">{note.word_id}</h3>
                      <Badge className={getNoteTypeColor(note.note_type)}>
                        {note.note_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(note)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                  <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
                  {note.is_public && <Badge variant="outline">Public</Badge>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Note Dialog */}
      <Dialog open={editingNote !== null} onOpenChange={() => setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Word ID or Arabic word"
              value={formData.word_id}
              onChange={(e) => setFormData(prev => ({ ...prev, word_id: e.target.value }))}
              required
            />
            <Select 
              value={formData.note_type} 
              onValueChange={(value: UserNote['note_type']) => 
                setFormData(prev => ({ ...prev, note_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Note</SelectItem>
                <SelectItem value="mnemonic">Mnemonic Device</SelectItem>
                <SelectItem value="personal_example">Personal Example</SelectItem>
                <SelectItem value="etymology">Etymology/Root</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Write your note here..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Note</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalVocabularyNotebook;
