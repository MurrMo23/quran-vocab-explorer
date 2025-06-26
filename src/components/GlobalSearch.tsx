
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  type: 'word' | 'collection' | 'blog';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  tags?: string[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search vocabulary words
      const { data: words } = await supabase
        .from('vocabulary_words')
        .select('id, arabic, transliteration, meaning')
        .or(`arabic.ilike.%${searchQuery}%,transliteration.ilike.%${searchQuery}%,meaning.ilike.%${searchQuery}%`)
        .eq('is_published', true)
        .limit(5);

      if (words) {
        words.forEach(word => {
          searchResults.push({
            id: word.id,
            type: 'word',
            title: word.arabic,
            subtitle: word.transliteration,
            description: word.meaning,
            url: `/word/${word.id}`
          });
        });
      }

      // Search collections
      const { data: collections } = await supabase
        .from('word_collections')
        .select('id, name, description, slug')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('is_published', true)
        .limit(3);

      if (collections) {
        collections.forEach(collection => {
          searchResults.push({
            id: collection.id,
            type: 'collection',
            title: collection.name,
            description: collection.description,
            url: `/collections/${collection.slug}`
          });
        });
      }

      // Search blog posts
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, tags')
        .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
        .eq('published', true)
        .limit(3);

      if (blogPosts) {
        blogPosts.forEach(post => {
          searchResults.push({
            id: post.id,
            type: 'blog',
            title: post.title,
            description: post.excerpt,
            url: `/blog/${post.slug}`,
            tags: post.tags
          });
        });
      }

      setResults(searchResults);
      setSelectedIndex(0);

      // Log search analytics
      if (searchResults.length > 0) {
        await supabase
          .from('search_analytics')
          .insert({
            search_query: searchQuery,
            results_count: searchResults.length,
            search_type: 'global'
          });
      }

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = async (result: SearchResult) => {
    // Log click analytics
    try {
      await supabase
        .from('search_analytics')
        .insert({
          search_query: query,
          results_count: results.length,
          clicked_result_id: result.id,
          search_type: 'global'
        });
    } catch (error) {
      console.error('Analytics error:', error);
    }

    navigate(result.url);
    onClose();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'word':
        return <BookOpen className="h-4 w-4" />;
      case 'collection':
        return <FolderOpen className="h-4 w-4" />;
      case 'blog':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'word':
        return 'Word';
      case 'collection':
        return 'Collection';
      case 'blog':
        return 'Blog Post';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-2xl mx-4">
        <CardContent className="p-0">
          <div className="flex items-center border-b">
            <Search className="h-5 w-5 ml-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search words, collections, blog posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="m-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loading && (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium truncate">{result.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(result.type)}
                        </Badge>
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {result.subtitle}
                        </p>
                      )}
                      {result.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {query.length >= 2 && (
            <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground">
              Use ↑↓ to navigate, Enter to select, Esc to close
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalSearch;
