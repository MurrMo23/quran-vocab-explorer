import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { NotebookPen, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NoteItem from '@/components/learning/NoteItem';
import NoteForm from '@/components/learning/NoteForm';
import WordSearchPicker from '@/components/collections/WordSearchPicker';
import { createNote, NOTE_TYPES, NOTE_TYPE_LABELS, useNotes, type Note, type NoteType } from '@/lib/notes';
import { getWordById, type Word } from '@/utils/vocabulary';
import { getWordPath } from '@/utils/word-slugs';

type Filter = 'all' | NoteType;

interface Group {
  wordId: string;
  word: Word | undefined;
  notes: Note[];
}

const Notebook = () => {
  const { items, loading, isGuest, offlineFallback } = useNotes();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [addWord, setAddWord] = useState<Word | null>(null);

  const groups = useMemo<Group[]>(() => {
    const q = query.trim().toLowerCase();
    const byWord = new Map<string, Group>();
    for (const note of items) {
      if (filter !== 'all' && note.noteType !== filter) continue;
      let g = byWord.get(note.wordId);
      if (!g) {
        g = { wordId: note.wordId, word: getWordById(note.wordId), notes: [] };
        byWord.set(note.wordId, g);
      }
      g.notes.push(note);
    }
    const all = Array.from(byWord.values());
    if (!q) return all;
    return all
      .map((g) => {
        const wordMatches =
          !!g.word &&
          (g.word.arabic.includes(query.trim()) ||
            g.word.meaning.toLowerCase().includes(q) ||
            g.word.transliteration.toLowerCase().includes(q));
        return wordMatches ? g : { ...g, notes: g.notes.filter((n) => n.content.toLowerCase().includes(q)) };
      })
      .filter((g) => g.notes.length > 0);
  }, [items, query, filter]);

  const closeAdd = () => {
    setAddOpen(false);
    setAddWord(null);
  };

  return (
    <>
      <SEO title="My Notebook" description="Your personal notes on Quranic vocabulary." url="https://quranvocab.com/notebook" noindex />
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <NotebookPen className="h-7 w-7 text-primary" />
              My notebook
            </h1>
            <p className="text-muted-foreground mt-1">Your memory aids, examples and notes, grouped by word.</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add note
          </Button>
        </div>

        {(isGuest || offlineFallback) && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm mb-6">
            {isGuest ? (
              <>
                Notes are saved in this browser.{' '}
                <Link to="/auth" className="underline">
                  Sign in
                </Link>{' '}
                to keep them; they'll be moved into your account automatically.
              </>
            ) : (
              'Your account could not be reached, so notes are saved in this browser for now.'
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes or words"
              className="pl-9"
              aria-label="Search notes"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <SelectTrigger className="sm:w-48" aria-label="Filter by note type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {NOTE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {NOTE_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <NotebookPen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium">No notes yet</h2>
            <p className="text-muted-foreground mt-1 mb-6 max-w-md mx-auto">
              Add a note from any word page, or start here. Notes are private to you.
            </p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first note
            </Button>
          </div>
        ) : groups.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No notes match your search or filter.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((g) => (
              <Card key={g.wordId}>
                <CardHeader className="pb-3">
                  {g.word ? (
                    <Link to={getWordPath(g.wordId)} className="group flex items-baseline gap-3 flex-wrap">
                      <span className="font-arabic text-2xl" lang="ar">
                        {g.word.arabic}
                      </span>
                      <span className="font-medium group-hover:underline underline-offset-4">{g.word.meaning}</span>
                      <span className="text-sm text-muted-foreground">{g.word.transliteration}</span>
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Word "{g.wordId}" is no longer in the vocabulary</span>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {g.notes.map((n) => (
                    <NoteItem key={n.id} note={n} />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={(o) => (o ? setAddOpen(true) : closeAdd())}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{addWord ? 'New note' : 'Choose a word'}</DialogTitle>
          </DialogHeader>
          {!addWord ? (
            <WordSearchPicker onPick={setAddWord} pickLabel="Choose" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="font-arabic text-2xl mr-2" lang="ar">
                    {addWord.arabic}
                  </span>
                  <span className="font-medium">{addWord.meaning}</span>
                </div>
                <Button variant="link" size="sm" onClick={() => setAddWord(null)}>
                  Change word
                </Button>
              </div>
              <NoteForm
                autoFocus
                onCancel={closeAdd}
                onSubmit={async (v) => {
                  try {
                    await createNote({ wordId: addWord.id, ...v });
                    toast.success('Note saved');
                    closeAdd();
                  } catch {
                    toast.error('Could not save the note. Please try again.');
                  }
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Notebook;
