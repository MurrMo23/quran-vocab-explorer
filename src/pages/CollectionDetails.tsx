
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import WordCard from '@/components/WordCard';
import { 
  getCollectionById, 
  getWordsByCollection, 
  Word 
} from '@/utils/vocabulary';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import AdPlaceholder from '@/components/ads/AdPlaceholder';
import AdSidebar from '@/components/ads/AdSidebar';
import { Helmet } from 'react-helmet';

const CollectionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [collection, setCollection] = useState<{ id: string; name: string; description: string } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (id) {
      const collectionInfo = getCollectionById(id);
      
      if (collectionInfo) {
        setCollection(collectionInfo);
        const collectionWords = getWordsByCollection(id);
        setWords(collectionWords);
        setFilteredWords(collectionWords);
      } else {
        toast.error("Collection not found", {
          description: "We couldn't find the collection you're looking for",
        });
      }
    }
  }, [id]);

  // Filter words based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWords(words);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = words.filter(word => 
        word.arabic.includes(query) || 
        word.meaning.toLowerCase().includes(query) || 
        word.transliteration.toLowerCase().includes(query)
      );
      setFilteredWords(filtered);
    }
  }, [searchQuery, words]);

  const handleWordClick = (wordId: string) => {
    navigate(`/word/${wordId}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <Helmet>
        <title>{collection?.name || 'Collection'} | Arabic Words</title>
        <meta name="description" content={collection?.description || 'Browse Arabic vocabulary collection'} />
      </Helmet>

      <div className="mb-6">
        <button 
          onClick={() => navigate('/collections')}
          className="text-muted-foreground hover:text-foreground flex items-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Collections</span>
        </button>
      </div>

      {collection ? (
        <div>
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold">{collection.name}</h1>
              </div>
              <p className="text-muted-foreground mt-2">{collection.description}</p>
              <p className="text-sm mt-1">
                <span className="font-medium">{filteredWords.length}</span> {filteredWords.length === 1 ? 'word' : 'words'} in this collection
              </p>
            </div>
            <SearchBar 
              className="w-full md:w-64" 
              onSearch={handleSearch}
              placeholder="Search in this collection"
            />
          </div>

          {isMobile && (
            <AdPlaceholder 
              adId="collection-top-mobile" 
              size="mobile-banner"
              className="mx-auto mb-6"
              location="collection-detail-mobile"
            />
          )}
          
          {!isMobile && (
            <AdPlaceholder 
              adId="collection-top" 
              size="leaderboard"
              className="mx-auto mb-6"
              location="collection-detail"
            />
          )}

          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-3/4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredWords.map((word) => (
                  <button
                    key={word.id}
                    onClick={() => handleWordClick(word.id)}
                    className="glass-card p-4 rounded-xl text-left hover:shadow-md transition-all border border-transparent hover:border-primary/20"
                  >
                    <div className="mb-2">
                      <span className="text-xl font-arabic">{word.arabic}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">{word.transliteration}</div>
                    <div className="font-medium">{word.meaning}</div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {word.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag} 
                          className="text-xs bg-gray-100 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {word.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{word.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {filteredWords.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No words found matching your search.' : 'No words found in this collection.'}
                  </p>
                </div>
              )}
            </div>
            
            <aside className="w-full md:w-1/4">
              <div className="sticky top-20">
                <div className="p-4 bg-secondary/30 rounded-lg mb-6">
                  <h3 className="font-medium mb-2">Practice This Collection</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Master the words in this collection through focused practice.
                  </p>
                  <button
                    onClick={() => navigate(`/practice?collection=${id}`)}
                    className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Start Practice Session
                  </button>
                </div>
                
                <AdSidebar location="collection-detail-sidebar" />
              </div>
            </aside>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">Collection Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Sorry, we couldn't find the collection you're looking for.
          </p>
          <button
            onClick={() => navigate('/collections')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            View All Collections
          </button>
        </div>
      )}
    </>
  );
};

export default CollectionDetails;
