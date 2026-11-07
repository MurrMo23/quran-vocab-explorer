import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Moon, Sun, NotebookPen, Library } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
import { deleteAllNotes, useNotes } from '@/lib/notes';
import { deleteAllCollections, useUserCollections } from '@/lib/collections';

type ThemeChoice = 'light' | 'dark' | 'system';

interface DeleteRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  noun: string;
  onConfirm: () => Promise<void>;
}

const DeleteRow: React.FC<DeleteRowProps> = ({ icon, title, description, count, noun, onConfirm }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center">
      <div className="mr-3 rounded-xl bg-destructive/10 p-2.5">{icon}</div>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={count === 0}>
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {count} {noun}?
          </AlertDialogTitle>
          <AlertDialogDescription>This permanently removes them and can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              try {
                await onConfirm();
                toast.success('Deleted');
              } catch {
                toast.error('Could not delete. Please try again.');
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
);

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { session } = useAuth();
  const notes = useNotes();
  const collections = useUserCollections();

  return (
    <>
      <SEO title="Settings" url="https://quranvocab.com/settings" noindex />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight sm:text-4xl">Settings</h1>

        <div className="card-tactile mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-extrabold">Appearance</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold">Theme</h3>
                <p className="text-sm text-muted-foreground">Saved in this browser</p>
              </div>
              <ToggleGroup
                type="single"
                value={theme}
                onValueChange={(v) => v && setTheme(v as ThemeChoice)}
                aria-label="Theme"
              >
                <ToggleGroupItem value="light" aria-label="Light" className="h-11 gap-2 rounded-xl px-3 font-bold data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground">
                  <Sun className="h-4 w-4" /> Light
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Dark" className="h-11 gap-2 rounded-xl px-3 font-bold data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground">
                  <Moon className="h-4 w-4" /> Dark
                </ToggleGroupItem>
                <ToggleGroupItem value="system" aria-label="Match system" className="h-11 gap-2 rounded-xl px-3 font-bold data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground">
                  <Monitor className="h-4 w-4" /> System
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>

        <div className="card-tactile overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-extrabold">Your data</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {session
                ? 'Notes and collections are stored in your account.'
                : (
                  <>
                    You're not signed in, so notes and collections live in this browser only.{' '}
                    <Link to="/auth" className="font-bold text-primary underline underline-offset-4">Sign in</Link> to keep them.
                  </>
                )}
            </p>
          </div>
          <div className="p-6 space-y-6">
            <DeleteRow
              icon={<NotebookPen className="h-5 w-5 text-destructive" />}
              title="Delete all my notes"
              description={`${notes.items.length} ${notes.items.length === 1 ? 'note' : 'notes'}`}
              count={notes.items.length}
              noun={notes.items.length === 1 ? 'note' : 'notes'}
              onConfirm={deleteAllNotes}
            />
            <DeleteRow
              icon={<Library className="h-5 w-5 text-destructive" />}
              title="Delete all my collections"
              description={`${collections.items.length} ${collections.items.length === 1 ? 'collection' : 'collections'}`}
              count={collections.items.length}
              noun={collections.items.length === 1 ? 'collection' : 'collections'}
              onConfirm={deleteAllCollections}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
