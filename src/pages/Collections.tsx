
import React, { useState, useEffect, useMemo } from 'react';
import CollectionCard from '@/components/CollectionCard';
import SearchBar from '@/components/SearchBar';
import CreateCollectionForm from '@/components/collections/CreateCollectionForm';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, Plus } from 'lucide-react';
import { collectionIcon, countLevels, SEARCH_BAR_CLASS, type LevelCounts } from '@/components/collections/collection-meta';
import { getWordsByCollection, getPublishedCollections, addCustomCollection, Collection } from '@/utils/vocabulary';
import SEO from '@/components/SEO';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { usePermissions } from '@/hooks/usePermissions';

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>(() => getPublishedCollections());
  const [loading, setLoading] = useState(false);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>(collections);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { hasRole } = usePermissions();
  const isAdmin = hasRole('admin');

  useEffect(() => {
    // Load collections
    const loadCollections = () => {
      setLoading(true);
      const allCollections = getPublishedCollections();
      setCollections(allCollections);
      setFilteredCollections(allCollections);
      setLoading(false);
    };

    loadCollections();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredCollections(collections);
      return;
    }
    
    const normalizedQuery = query.toLowerCase();
    const filtered = collections.filter(collection => 
      collection.name.toLowerCase().includes(normalizedQuery) || 
      (collection.description && collection.description.toLowerCase().includes(normalizedQuery))
    );
    
    setFilteredCollections(filtered);
  };

  const handleCreateCollection = (newCollection: Collection) => {
    // Save the new collection
    const collection = addCustomCollection(newCollection);
    
    // Update the collections list
    setCollections(prevCollections => [...prevCollections, collection]);
    setFilteredCollections(prevCollections => [...prevCollections, collection]);
    
    // Close the dialog
    setDialogOpen(false);
  };

  // Word counts and level splits are static data, so they are identical in the prerender and on
  // the client.
  const stats = useMemo(() => {
    const map = new Map<string, { count: number; levels: LevelCounts }>();
    for (const c of collections) {
      const words = getWordsByCollection(c.id);
      map.set(c.id, { count: words.length, levels: countLevels(words) });
    }
    return map;
  }, [collections]);

  const totalWords = useMemo(() => {
    const ids = new Set<string>();
    for (const c of collections) for (const w of getWordsByCollection(c.id)) ids.add(w.id);
    return ids.size;
  }, [collections]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <div className="h-10 w-64 rounded-xl bg-track" />
        <div className="mt-3 h-5 w-80 max-w-full rounded-lg bg-track" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card-tactile h-56 rounded-[26px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Quranic Vocabulary Collections"
        description="Browse and learn from organized collections of Arabic vocabulary words. Explore different categories and difficulty levels."
        keywords={["Arabic collections", "vocabulary categories", "organized learning", "word lists"]}
        url="https://quranvocab.com/collections"
        type="website"
      />
      
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-8 sm:gap-8 sm:px-6 sm:pt-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-[44px] sm:leading-[1.1]">Word collections</h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
            Browse and learn from organized collections of Arabic vocabulary words. Each collection groups
            Quranic words by theme, with meanings, recitation audio and a focused review.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-bold">
              {collections.length} collections
            </span>
            <span className="rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-bold">
              {totalWords} words
            </span>
          </div>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <SearchBar
              className={SEARCH_BAR_CLASS}
              placeholder="Search collections..."
              onSearch={handleSearch}
            />
          </div>
          
          {/* Only show Create Collection button for admins */}
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus />
                  Create Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <CreateCollectionForm 
                  onCreateCollection={handleCreateCollection}
                  onCancel={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {filteredCollections.length === 0 ? (
          <div className="card-tactile flex flex-col items-center gap-2 rounded-[26px] px-6 py-12 text-center">
            <BookOpenCheck className="mb-2 h-12 w-12 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-lg font-extrabold">No collections found</h2>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Browse the available collections to get started'}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {filteredCollections.map(collection => {
              const Icon = collectionIcon(collection.id);
              const s = stats.get(collection.id);
              const wordCount = s ? s.count : getWordsByCollection(collection.id).length;
              return (
                <li key={collection.id}>
                  <CollectionCard
                    id={collection.id}
                    title={collection.name}
                    description={collection.description || ''}
                    count={wordCount}
                    icon={<Icon className="h-6 w-6" />}
                    wordCount={wordCount}
                    levels={s?.levels}
                    difficulty={collection.id.startsWith('custom-') ? 'Custom' : undefined}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
};

export default Collections;
