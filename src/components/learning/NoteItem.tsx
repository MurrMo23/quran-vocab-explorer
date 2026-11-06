import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteNote, NOTE_TYPE_LABELS, updateNote, type Note } from '@/lib/notes';
import NoteForm from './NoteForm';

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const NoteItem: React.FC<{ note: Note }> = ({ note }) => {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-lg border p-3">
        <NoteForm
          initialType={note.noteType}
          initialContent={note.content}
          submitLabel="Save changes"
          autoFocus
          onCancel={() => setEditing(false)}
          onSubmit={async (v) => {
            try {
              await updateNote(note.id, v);
              setEditing(false);
              toast.success('Note updated');
            } catch {
              toast.error('Could not update the note. Please try again.');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{NOTE_TYPE_LABELS[note.noteType]}</Badge>
          <span className="text-xs text-muted-foreground">{formatDate(note.updatedAt)}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(true)} aria-label="Edit note">
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete note">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await deleteNote(note.id);
                      toast.success('Note deleted');
                    } catch {
                      toast.error('Could not delete the note. Please try again.');
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
    </div>
  );
};

export default NoteItem;
