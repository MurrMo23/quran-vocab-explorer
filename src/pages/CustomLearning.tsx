import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FolderPlus, Library } from 'lucide-react';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateCollectionForm from '@/components/collections/CreateCollectionForm';
import UserCollectionEditor from '@/components/collections/UserCollectionEditor';
import { useUserCollections } from '@/lib/collections';
import { cn } from '@/lib/utils';

/**
 * "My collections": personal word lists the learner builds from the vocabulary and can
 * practise. Saved to the account when signed in, otherwise in this browser.
 * Route: /custom-learning (optional ?id=<collection id> selects one).
 */
const CustomLearning = () => {
  const { items, loading, isGuest, offlineFallback } = useUserCollections();
  const [searchParams, setSearchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const selectedId = searchParams.get('id');

  const select = (id: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('id', id);
    else next.delete('id');
    setSearchParams(next, { replace: true });
  };

  // Default to the most recent collection; drop a stale id.
  useEffect(() => {
    if (loading) return;
    if (selectedId && items.some((c) => c.id === selectedId)) return;
    if (items.length > 0) select(items[0].id);
    else if (selectedId) select(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, items, selectedId]);

  const selected = items.find((c) => c.id === selectedId);

  return (
    <>
      <SEO
        title="My Collections"
        description="Build your own lists of Quranic vocabulary and practise them."
        url="https://quranvocab.com/custom-learning"
        noindex
      />
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">My collections</h1>
            <p className="text-muted-foreground mt-1">
              Group the words you want to focus on, then practise just those words.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New collection
          </Button>
        </div>

        {(isGuest || offlineFallback) && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm mb-6">
            {isGuest ? (
              <>
                Your collections are saved in this browser.{' '}
                <Link to="/auth" className="underline">
                  Sign in
                </Link>{' '}
                to keep them in your account; they'll be moved over automatically.
              </>
            ) : (
              'Your account could not be reached, so collections are saved in this browser for now.'
            )}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-[240px_1fr] gap-6">
            <div className="h-40 rounded-lg bg-muted animate-pulse" />
            <div className="h-72 rounded-lg bg-muted animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <Library className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium">No collections yet</h2>
            <p className="text-muted-foreground mt-1 mb-6">
              Create one, then search the vocabulary to add words. You can also browse the{' '}
              <Link to="/collections" className="underline">
                built-in collections
              </Link>
              .
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create your first collection
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-[240px_1fr] gap-6 items-start">
            <nav aria-label="My collections" className="space-y-1">
              {items.map((c) => (
                <button
                  key={c.id}
                  onClick={() => select(c.id)}
                  className={cn(
                    'w-full text-left rounded-md px-3 py-2 transition-colors',
                    c.id === selectedId ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  )}
                  aria-current={c.id === selectedId ? 'true' : undefined}
                >
                  <div className="font-medium truncate">{c.name}</div>
                  <div className={cn('text-xs', c.id === selectedId ? 'opacity-80' : 'text-muted-foreground')}>
                    {c.wordIds.length} {c.wordIds.length === 1 ? 'word' : 'words'}
                  </div>
                </button>
              ))}
            </nav>
            {selected ? (
              <UserCollectionEditor key={selected.id} collection={selected} onDeleted={() => select(null)} />
            ) : (
              <div className="h-40" />
            )}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New collection</DialogTitle>
          </DialogHeader>
          <CreateCollectionForm
            bare
            onCancel={() => setCreateOpen(false)}
            onCreated={(c) => {
              setCreateOpen(false);
              select(c.id);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomLearning;
