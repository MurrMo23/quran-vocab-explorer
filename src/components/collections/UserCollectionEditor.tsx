import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Play, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { getWordById } from '@/utils/vocabulary';
import {
  addWordToUserCollection,
  COLLECTION_DESCRIPTION_MAX,
  COLLECTION_NAME_MAX,
  deleteCollection,
  practiceCollectionUrl,
  removeWordFromUserCollection,
  updateCollection,
  type UserCollection,
} from '@/lib/collections';
import WordSearchPicker from './WordSearchPicker';
import { getWordPath } from '@/utils/word-slugs';

interface Props {
  collection: UserCollection;
  onDeleted?: () => void;
}

const UserCollectionEditor: React.FC<Props> = ({ collection, onDeleted }) => {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description);

  const words = useMemo(
    () => collection.wordIds.map((id) => ({ id, word: getWordById(id) })),
    [collection.wordIds]
  );
  const knownCount = words.filter((w) => w.word).length;

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCollection(collection.id, { name, description });
      setRenaming(false);
      toast.success('Collection updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the collection');
    }
  };

  const add = async (wordId: string) => {
    try {
      await addWordToUserCollection(collection.id, wordId);
    } catch {
      toast.error('Could not add the word. Please try again.');
    }
  };

  const remove = async (wordId: string) => {
    try {
      await removeWordFromUserCollection(collection.id, wordId);
    } catch {
      toast.error('Could not remove the word. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        {renaming ? (
          <form onSubmit={saveDetails} className="space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={COLLECTION_NAME_MAX}
              aria-label="Collection name"
              autoFocus
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={COLLECTION_DESCRIPTION_MAX}
              rows={2}
              placeholder="Description (optional)"
              aria-label="Collection description"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setName(collection.name);
                  setDescription(collection.description);
                  setRenaming(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!name.trim()}>
                Save
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold break-words">{collection.name}</h2>
              {collection.description && (
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{collection.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {knownCount} {knownCount === 1 ? 'word' : 'words'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {knownCount > 0 ? (
                <Button asChild size="sm">
                  <Link to={practiceCollectionUrl(collection.id)}>
                    <Play className="h-4 w-4 mr-1" />
                    Practice this collection
                  </Link>
                </Button>
              ) : (
                <Button size="sm" disabled title="Add words first">
                  <Play className="h-4 w-4 mr-1" />
                  Practice this collection
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setRenaming(true)}>
                <Pencil className="h-4 w-4 mr-1" />
                Rename
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{collection.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The collection is removed. The words themselves and your progress on them are not affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        try {
                          await deleteCollection(collection.id);
                          toast.success('Collection deleted');
                          onDeleted?.();
                        } catch {
                          toast.error('Could not delete the collection. Please try again.');
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
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <h3 className="text-sm font-medium mb-2">Add words</h3>
          <WordSearchPicker selectedIds={collection.wordIds} onPick={(w) => add(w.id)} />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Words in this collection</h3>
          {words.length === 0 ? (
            <p className="text-sm text-muted-foreground">No words yet. Search above to add some.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {words.map(({ id, word }) => (
                <li key={id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                  {word ? (
                    <Link to={getWordPath(word.id)} className="min-w-0 hover:underline underline-offset-4">
                      <span className="font-arabic text-lg mr-2" lang="ar">
                        {word.arabic}
                      </span>
                      <span className="text-sm text-muted-foreground">{word.meaning}</span>
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">Word no longer available</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => remove(id)}
                    aria-label={`Remove ${word?.meaning ?? 'word'} from collection`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCollectionEditor;
