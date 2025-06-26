
import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Word, getAllWords, getWordById } from '@/utils/vocabulary';

interface RootFamily {
  root: string;
  words: Word[];
  meaning: string;
  pattern: string;
}

interface RootFamilyExplorerProps {
  selectedWordId?: string;
  onWordSelect?: (word: Word) => void;
}

const RootFamilyExplorer: React.FC<RootFamilyExplorerProps> = ({
  selectedWordId,
  onWordSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);

  // Get all words and group by root
  const allWords = getAllWords();
  
  const rootFamilies = useMemo(() => {
    const rootMap: { [key: string]: Word[] } = {};
    
    allWords.forEach(word => {
      if (!rootMap[word.root]) {
        rootMap[word.root] = [];
      }
      rootMap[word.root].push(word);
    });
    
    return Object.entries(rootMap)
      .map(([root, words]) => ({
        root,
        words: words.sort((a, b) => b.frequency - a.frequency),
        meaning: getRootMeaning(root, words),
        pattern: getRootPattern(root)
      }))
      .sort((a, b) => b.words.length - a.words.length);
  }, [allWords]);

  // Filter families based on search
  const filteredFamilies = rootFamilies.filter(family => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      family.root.includes(query) ||
      family.meaning.toLowerCase().includes(query) ||
      family.words.some(word => 
        word.arabic.includes(searchQuery) ||
        word.meaning.toLowerCase().includes(query) ||
        word.transliteration.toLowerCase().includes(query)
      )
    );
  });

  // Set initial selected root based on selectedWordId
  React.useEffect(() => {
    if (selectedWordId && !selectedRoot) {
      const word = getWordById(selectedWordId);
      if (word) {
        setSelectedRoot(word.root);
      }
    }
  }, [selectedWordId, selectedRoot]);

  function getRootMeaning(root: string, words: Word[]): string {
    // Common Arabic root meanings
    const rootMeanings: { [key: string]: string } = {
      'ك ت ب': 'writing, inscription',
      'ق ر أ': 'reading, recitation',
      'ص ل و': 'prayer, connection',
      'ر ح م': 'mercy, compassion',
      'ع ل م': 'knowledge, learning',
      'ح م د': 'praise, gratitude',
      'س ج د': 'prostration, worship',
      'أ م ن': 'security, faith',
      'ق و ل': 'speech, saying',
      'ف ع ل': 'action, doing',
      'ج ع ل': 'making, placing',
      'ذ ك ر': 'remembrance, mention',
      'ش ك ر': 'gratitude, thanks',
      'ص ب ر': 'patience, endurance',
      'ن ص ر': 'help, victory',
      'ع ب د': 'worship, service',
      'ر ز ق': 'sustenance, provision',
      'ه د ي': 'guidance, direction',
      'خ ل ق': 'creation, making',
      'ر ب ب': 'lordship, nurturing'
    };
    
    return rootMeanings[root] || `concept related to ${words[0]?.meaning.split(',')[0] || 'unknown'}`;
  }

  function getRootPattern(root: string): string {
    const letters = root.split(' ');
    if (letters.length === 3) {
      return `${letters[0]}-${letters[1]}-${letters[2]}`;
    }
    return root;
  }

  const selectedFamily = selectedRoot ? rootFamilies.find(f => f.root === selectedRoot) : null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Root Family Explorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by root, meaning, or word..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Explore {rootFamilies.length} root families containing {allWords.length} words
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Root families list */}
        <Card>
          <CardHeader>
            <CardTitle>Root Families ({filteredFamilies.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {filteredFamilies.map((family) => (
              <Card 
                key={family.root}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedRoot === family.root ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedRoot(family.root)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold arabic-text text-lg">{family.root}</h3>
                      <p className="text-sm text-muted-foreground">{family.pattern}</p>
                    </div>
                    <Badge variant="secondary">{family.words.length} words</Badge>
                  </div>
                  <p className="text-sm mb-2">{family.meaning}</p>
                  <div className="flex flex-wrap gap-1">
                    {family.words.slice(0, 3).map((word) => (
                      <span key={word.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {word.arabic}
                      </span>
                    ))}
                    {family.words.length > 3 && (
                      <span className="text-xs text-muted-foreground px-2 py-1">
                        +{family.words.length - 3} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Selected family details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedFamily ? (
                <div className="flex items-center gap-2">
                  <span className="arabic-text">{selectedFamily.root}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span>Family Details</span>
                </div>
              ) : (
                'Select a root family'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFamily ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Root Meaning</h3>
                  <p className="text-muted-foreground">{selectedFamily.meaning}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">
                    Words in this family ({selectedFamily.words.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedFamily.words.map((word) => (
                      <Card 
                        key={word.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedWordId === word.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => onWordSelect?.(word)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="arabic-text text-xl">{word.arabic}</span>
                                <span className="text-sm text-muted-foreground">
                                  /{word.transliteration}/
                                </span>
                              </div>
                              <p className="text-sm">{word.meaning}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {word.partOfSpeech}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {word.level}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  freq: {word.frequency}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Etymology & Connections</h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      This root family demonstrates the interconnected nature of Arabic vocabulary.
                      Words sharing the same root often have related meanings, showing the logical
                      structure of the Arabic language.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedFamily.words.map(word => (
                        <Badge key={word.id} variant="secondary" className="text-xs">
                          {word.collections.join(', ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a root family from the list to explore its words and connections</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RootFamilyExplorer;
