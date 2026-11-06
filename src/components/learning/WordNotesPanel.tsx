import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NotebookPen, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createNote, useWordNotes } from '@/lib/notes';
import NoteForm from './NoteForm';
import NoteItem from './NoteItem';

/** Compact "My notes" panel for one word. */
const WordNotesPanel: React.FC<{ wordId: string; className?: string }> = ({ wordId, className }) => {
  const { notes, loading, isGuest, offlineFallback } = useWordNotes(wordId);
  const [adding, setAdding] = useState(false);

  return (
    <section className={className} aria-labelledby="my-notes-heading">
      <div className="flex items-center justify-between mb-3">
        <h3 id="my-notes-heading" className="text-lg font-medium flex items-center">
          <NotebookPen className="h-5 w-5 mr-2 text-primary" />
          <span>My notes</span>
        </h3>
        <div className="flex items-center gap-2">
          <Link to="/notebook" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
            All notes
          </Link>
          {!adding && (
            <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add note
            </Button>
          )}
        </div>
      </div>

      {(isGuest || offlineFallback) && (
        <p className="text-xs text-muted-foreground mb-3">
          {isGuest ? (
            <>
              Notes are saved in this browser. <Link to="/auth" className="underline">Sign in</Link> to keep them in your account.
            </>
          ) : (
            'Your account could not be reached, so notes are saved in this browser for now.'
          )}
        </p>
      )}

      {adding && (
        <div className="rounded-lg border p-3 mb-3">
          <NoteForm
            autoFocus
            onCancel={() => setAdding(false)}
            onSubmit={async (v) => {
              try {
                await createNote({ wordId, ...v });
                setAdding(false);
                toast.success('Note saved');
              } catch {
                toast.error('Could not save the note. Please try again.');
              }
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="h-12 rounded-lg bg-muted animate-pulse" />
      ) : notes.length === 0 ? (
        !adding && <p className="text-sm text-muted-foreground">No notes for this word yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <NoteItem key={n.id} note={n} />
          ))}
        </div>
      )}
    </section>
  );
};

export default WordNotesPanel;
