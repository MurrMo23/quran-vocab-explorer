import React, { useState, useEffect } from 'react';
import CollectionCard from '@/components/CollectionCard';
import SearchBar from '@/components/SearchBar';
import CreateCollectionForm from '@/components/collections/CreateCollectionForm';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, Plus, BookText, BookMarked } from 'lucide-react';
import { getWordsByCollection, getAllCollections, addCustomCollection, Collection } from '@/utils/vocabulary';
import { Helmet } from 'react-helmet';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePermissions } from '@/hooks/usePermissions';
import AdPlaceholder from '@/components/ads/AdPlaceholder';

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const isMobile = useIsMobile();
  const { hasRole } = usePermissions();
  const isAdmin = hasRole('admin');

  useEffect(() => {
    // Load collections
    const loadCollections = () => {
      setLoading(true);
      const allCollections = getAllCollections();
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="h-6 w-48 mx-auto bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="h-4 w-64 mx-auto bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="glass-card h-40 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Word Collections | Arabic Vocabulary</title>
        <meta 
          name="description" 
          content="Browse and learn from organized collections of Arabic vocabulary words." 
        />
      </Helmet>
      
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center">Word Collections</h1>
          <p className="text-center text-muted-foreground mt-2">
            Browse and learn from organized collections of Arabic vocabulary words
          </p>
        </div>

        {isMobile && (
          <AdPlaceholder 
            adId="collections-top-mobile" 
            size="mobile-banner"
            className="mx-auto mb-6"
            location="collections-mobile"
          />
        )}
        
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex-1 md:max-w-sm">
            <SearchBar
              placeholder="Search collections..."
              onSearch={handleSearch}
            />
          </div>
          
          {/* Only show Create Collection button for admins */}
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
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
        
        {!isMobile && (
          <AdPlaceholder 
            adId="collections-top" 
            size="leaderboard"
            className="mx-auto mb-8"
            location="collections"
          />
        )}
        
        {filteredCollections.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No collections found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term' : 'Browse the available collections to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map(collection => {
              const wordCount = getWordsByCollection(collection.id).length;
              let icon = <BookText className="h-5 w-5" />;
              let difficulty = 'Mixed';
              
              // Determine if the collection is custom
              const isCustom = collection.id.startsWith('custom-');
              
              if (isCustom) {
                icon = <BookMarked className="h-5 w-5" />;
              }
              
              return (
                <CollectionCard
                  key={collection.id}
                  id={collection.id}
                  title={collection.name}
                  description={collection.description || ''}
                  count={wordCount}
                  icon={icon}
                  wordCount={wordCount}
                  difficulty={difficulty}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Collections;
