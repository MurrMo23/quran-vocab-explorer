
import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Tag, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Word, getAllWords, getAllCollections } from '@/utils/vocabulary';

interface SearchFilters {
  collections: string[];
  levels: string[];
  partOfSpeech: string[];
  tags: string[];
  frequencyRange: [number, number];
}

interface SemanticSearchProps {
  onWordSelect?: (word: Word) => void;
  initialQuery?: string;
}

const SemanticSearch: React.FC<SemanticSearchProps> = ({
  onWordSelect,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    collections: [],
    levels: [],
    partOfSpeech: [],
    tags: [],
    frequencyRange: [0, 3000]
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'semantic' | 'phonetic'>('text');

  const allWords = getAllWords();
  const allCollections = getAllCollections();
  
  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const levels = [...new Set(allWords.map(w => w.level))];
    const partOfSpeech = [...new Set(allWords.map(w => w.partOfSpeech))];
    const tags = [...new Set(allWords.flatMap(w => w.tags))];
    
    return { levels, partOfSpeech, tags };
  }, [allWords]);

  // Advanced search algorithm
  const searchWords = useMemo(() => {
    if (!query && filters.collections.length === 0 && filters.levels.length === 0) {
      return [];
    }

    let results = allWords;

    // Apply filters first
    if (filters.collections.length > 0) {
      results = results.filter(word => 
        word.collections.some(c => filters.collections.includes(c))
      );
    }

    if (filters.levels.length > 0) {
      results = results.filter(word => filters.levels.includes(word.level));
    }

    if (filters.partOfSpeech.length > 0) {
      results = results.filter(word => filters.partOfSpeech.includes(word.partOfSpeech));
    }

    if (filters.tags.length > 0) {
      results = results.filter(word => 
        word.tags.some(t => filters.tags.includes(t))
      );
    }

    results = results.filter(word => 
      word.frequency >= filters.frequencyRange[0] && 
      word.frequency <= filters.frequencyRange[1]
    );

    // Apply text search if query exists
    if (query) {
      const normalizedQuery = query.toLowerCase().trim();
      
      results = results.filter(word => {
        switch (searchMode) {
          case 'text':
            return (
              word.arabic.includes(query) ||
              word.meaning.toLowerCase().includes(normalizedQuery) ||
              word.transliteration.toLowerCase().includes(normalizedQuery) ||
              word.root.includes(query) ||
              word.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
            );
          
          case 'semantic':
            // Semantic search - look for meaning relationships
            const meaningWords = word.meaning.toLowerCase().split(/[,\s]+/);
            const queryWords = normalizedQuery.split(/\s+/);
            return queryWords.some(qWord => 
              meaningWords.some(mWord => 
                mWord.includes(qWord) || 
                getSemanticSimilarity(qWord, mWord) > 0.7
              )
            );
          
          case 'phonetic':
            // Phonetic search - transliteration similarity
            return getPhoneticSimilarity(word.transliteration.toLowerCase(), normalizedQuery) > 0.6;
          
          default:
            return true;
        }
      });

      // Sort results by relevance
      results.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, normalizedQuery);
        const scoreB = calculateRelevanceScore(b, normalizedQuery);
        return scoreB - scoreA;
      });
    } else {
      // Sort by frequency if no query
      results.sort((a, b) => b.frequency - a.frequency);
    }

    return results.slice(0, 50); // Limit results
  }, [query, filters, searchMode, allWords]);

  const calculateRelevanceScore = (word: Word, query: string): number => {
    let score = 0;
    
    // Exact matches get highest score
    if (word.arabic === query) score += 100;
    if (word.meaning.toLowerCase() === query) score += 100;
    if (word.transliteration.toLowerCase() === query) score += 100;
    
    // Partial matches
    if (word.arabic.includes(query)) score += 50;
    if (word.meaning.toLowerCase().includes(query)) score += 30;
    if (word.transliteration.toLowerCase().includes(query)) score += 40;
    if (word.root.includes(query)) score += 60;
    
    // Tag matches
    if (word.tags.some(tag => tag.toLowerCase().includes(query))) score += 20;
    
    // Frequency bonus (higher frequency = more important)
    score += Math.log(word.frequency + 1) * 2;
    
    return score;
  };

  const getSemanticSimilarity = (word1: string, word2: string): number => {
    // Simple semantic similarity based on common word relationships
    const synonymGroups = [
      ['god', 'allah', 'divine', 'deity'],
      ['prayer', 'worship', 'devotion', 'ritual'],
      ['mercy', 'compassion', 'kindness', 'forgiveness'],
      ['knowledge', 'wisdom', 'learning', 'understanding'],
      ['guidance', 'direction', 'path', 'way'],
      ['paradise', 'heaven', 'garden', 'bliss'],
      ['prophet', 'messenger', 'apostle'],
      ['book', 'scripture', 'revelation', 'text'],
      ['faith', 'belief', 'trust', 'conviction'],
      ['good', 'righteous', 'virtuous', 'noble'],
      ['evil', 'bad', 'wicked', 'sinful']
    ];
    
    for (const group of synonymGroups) {
      if (group.includes(word1) && group.includes(word2)) {
        return 0.8;
      }
    }
    
    return 0;
  };

  const getPhoneticSimilarity = (str1: string, str2: string): number => {
    // Simple Levenshtein distance-based similarity
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
    
    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);
    return maxLen > 0 ? (maxLen - distance) / maxLen : 1;
  };

  const updateFilter = (filterType: keyof SearchFilters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...(prev[filterType] as string[]), value]
        : (prev[filterType] as string[]).filter(item => item !== value)
    }));
  };

  const clearFilters = () => {
    setFilters({
      collections: [],
      levels: [],
      partOfSpeech: [],
      tags: [],
      frequencyRange: [0, 3000]
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : false
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Semantic Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Arabic, meaning, transliteration, or concept..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={searchMode} onValueChange={(value: any) => setSearchMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="semantic">Semantic</SelectItem>
                <SelectItem value="phonetic">Phonetic</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? 'bg-primary/10' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && <span className="ml-1 text-xs">({
                Object.values(filters).reduce((count, filter) => 
                  count + (Array.isArray(filter) ? filter.length : 0), 0
                )})
              </span>}
            </Button>
          </div>

          {showFilters && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Search Filters</h4>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Collections */}
                  <div>
                    <h5 className="font-medium mb-2">Collections</h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {allCollections.map(collection => (
                        <div key={collection.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`collection-${collection.id}`}
                            checked={filters.collections.includes(collection.id)}
                            onCheckedChange={(checked) => 
                              updateFilter('collections', collection.id, checked as boolean)
                            }
                          />
                          <label htmlFor={`collection-${collection.id}`} className="text-sm">
                            {collection.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Levels */}
                  <div>
                    <h5 className="font-medium mb-2">Levels</h5>
                    <div className="space-y-2">
                      {filterOptions.levels.map(level => (
                        <div key={level} className="flex items-center space-x-2">
                          <Checkbox
                            id={`level-${level}`}
                            checked={filters.levels.includes(level)}
                            onCheckedChange={(checked) => 
                              updateFilter('levels', level, checked as boolean)
                            }
                          />
                          <label htmlFor={`level-${level}`} className="text-sm capitalize">
                            {level}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Part of Speech */}
                  <div>
                    <h5 className="font-medium mb-2">Part of Speech</h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {filterOptions.partOfSpeech.map(pos => (
                        <div key={pos} className="flex items-center space-x-2">
                          <Checkbox
                            id={`pos-${pos}`}
                            checked={filters.partOfSpeech.includes(pos)}
                            onCheckedChange={(checked) => 
                              updateFilter('partOfSpeech', pos, checked as boolean)
                            }
                          />
                          <label htmlFor={`pos-${pos}`} className="text-sm">
                            {pos}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h5 className="font-medium mb-2">Tags</h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {filterOptions.tags.slice(0, 10).map(tag => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={filters.tags.includes(tag)}
                            onCheckedChange={(checked) => 
                              updateFilter('tags', tag, checked as boolean)
                            }
                          />
                          <label htmlFor={`tag-${tag}`} className="text-sm">
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Search Results ({searchWords.length})</span>
            {query && (
              <Badge variant="outline">
                {searchMode} search for "{query}"
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {searchWords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {query ? 'No words found matching your search.' : 'Enter a search term or apply filters to find words.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchWords.map(word => (
                <Card 
                  key={word.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onWordSelect?.(word)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="arabic-text text-xl">{word.arabic}</span>
                        <Badge variant="outline" className="text-xs">
                          {word.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        /{word.transliteration}/
                      </p>
                      <p className="text-sm">{word.meaning}</p>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {word.partOfSpeech}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {word.root}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          freq: {word.frequency}
                        </Badge>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {word.collections.slice(0, 2).map(collection => (
                          <Badge key={collection} variant="outline" className="text-xs">
                            <Layers className="h-3 w-3 mr-1" />
                            {collection}
                          </Badge>
                        ))}
                        {word.collections.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{word.collections.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SemanticSearch;
