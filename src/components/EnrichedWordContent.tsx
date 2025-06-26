
import React, { useState } from 'react';
import { Book, MessageSquare, Lightbulb, ExternalLink, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Word } from '@/utils/vocabulary-types';

interface EnrichedWordContentProps {
  word: Word;
}

interface HadithReference {
  source: string;
  arabic: string;
  translation: string;
  context: string;
}

interface ContextualNote {
  category: 'grammatical' | 'cultural' | 'historical' | 'linguistic';
  title: string;
  content: string;
}

interface RelatedConcept {
  word: string;
  relation: 'synonym' | 'antonym' | 'related' | 'derivative';
  explanation: string;
}

const EnrichedWordContent: React.FC<EnrichedWordContentProps> = ({ word }) => {
  const [selectedTab, setSelectedTab] = useState('examples');

  // Enhanced content data (in a real app, this would come from a comprehensive database)
  const getHadithReferences = (word: Word): HadithReference[] => {
    const hadithData: { [key: string]: HadithReference[] } = {
      'اللّٰه': [
        {
          source: 'Sahih Bukhari 6410',
          arabic: 'إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ',
          translation: 'Allah has ninety-nine names. Whoever memorizes them will enter Paradise.',
          context: 'The Beautiful Names of Allah (Asma ul-Husna)'
        }
      ],
      'صَلاة': [
        {
          source: 'Sahih Muslim 612',
          arabic: 'الصَّلاَةُ عِمَادُ الدِّينِ',
          translation: 'Prayer is the pillar of religion.',
          context: 'Importance of establishing regular prayer'
        }
      ],
      'رَحْمَة': [
        {
          source: 'Sahih Bukhari 6469',
          arabic: 'إِنَّ رَحْمَتِي غَلَبَتْ غَضَبِي',
          translation: 'Indeed, My mercy prevails over My wrath.',
          context: 'Allah\'s infinite mercy towards His creation'
        }
      ]
    };

    return hadithData[word.arabic] || [];
  };

  const getContextualNotes = (word: Word): ContextualNote[] => {
    const noteData: { [key: string]: ContextualNote[] } = {
      'اللّٰه': [
        {
          category: 'linguistic',
          title: 'Definite Article Integration',
          content: 'The word "Allah" contains the definite article "al" (ال) merged with "ilah" (إله), meaning "the God". The double L is emphatic, indicating uniqueness.'
        },
        {
          category: 'cultural',
          title: 'Pre-Islamic Usage',
          content: 'The word "Allah" was used by Arabic-speaking Christians and Jews before Islam, indicating its linguistic roots in Semitic languages (Hebrew: Elohim, Aramaic: Alaha).'
        }
      ],
      'صَلاة': [
        {
          category: 'grammatical',
          title: 'Verbal Noun (Masdar)',
          content: 'صَلاة is a masdar (verbal noun) from the root ص-ل-و. The pattern فَعَالة often indicates an action or state that is continuous or repeated.'
        },
        {
          category: 'historical',
          title: 'Etymology',
          content: 'Originally meant "to follow closely" or "to burn/heat", relating to the concept of drawing close to Allah through worship.'
        }
      ]
    };

    return noteData[word.arabic] || [
      {
        category: 'grammatical',
        title: 'Word Pattern',
        content: `This word follows the ${word.partOfSpeech} pattern common in Arabic morphology.`
      }
    ];
  };

  const getRelatedConcepts = (word: Word): RelatedConcept[] => {
    const conceptData: { [key: string]: RelatedConcept[] } = {
      'اللّٰه': [
        { word: 'رَبّ', relation: 'related', explanation: 'Both refer to God, but Rabb emphasizes lordship and nurturing' },
        { word: 'إِلٰه', relation: 'derivative', explanation: 'The root word from which Allah is derived' },
        { word: 'الرَّحْمٰن', relation: 'related', explanation: 'One of the Beautiful Names of Allah' }
      ],
      'صَلاة': [
        { word: 'دُعَاء', relation: 'related', explanation: 'Both are forms of worship, but salah is structured while dua is supplication' },
        { word: 'عِبَادَة', relation: 'related', explanation: 'Salah is the most important form of worship (ibadah)' },
        { word: 'رَكْعَة', relation: 'related', explanation: 'A unit of prayer within salah' }
      ]
    };

    return conceptData[word.arabic] || [];
  };

  const getUsageVariations = (word: Word): string[] => {
    const variations: { [key: string]: string[] } = {
      'اللّٰه': ['اللَّهُمَّ (O Allah)', 'بِاللّٰهِ (By Allah)', 'لِلّٰهِ (For Allah)', 'إِلَى اللّٰهِ (To Allah)'],
      'صَلاة': ['الصَّلَوَات (prayers)', 'مُصَلٍّ (one who prays)', 'صَلَّى (he prayed)', 'مُصَلَّى (place of prayer)'],
      'كِتَاب': ['كُتُب (books)', 'كَاتِب (writer)', 'مَكْتُوب (written)', 'مَكْتَبَة (library)']
    };

    return variations[word.arabic] || [`${word.arabic} (various forms based on grammar)`];
  };

  const hadithReferences = getHadithReferences(word);
  const contextualNotes = getContextualNotes(word);
  const relatedConcepts = getRelatedConcepts(word);
  const usageVariations = getUsageVariations(word);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          Enriched Content: {word.arabic}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="examples">Quranic Examples</TabsTrigger>
            <TabsTrigger value="hadith">Hadith References</TabsTrigger>
            <TabsTrigger value="notes">Contextual Notes</TabsTrigger>
            <TabsTrigger value="related">Related Concepts</TabsTrigger>
            <TabsTrigger value="usage">Usage Variations</TabsTrigger>
          </TabsList>

          <TabsContent value="examples" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Quranic Examples</h3>
              {word.examples.map((example, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline">Surah {example.surah}:{example.ayah}</Badge>
                      <Button variant="ghost" size="sm">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <p className="arabic-text text-lg leading-relaxed">{example.arabicText}</p>
                      <p className="text-muted-foreground italic">{example.translation}</p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>Context:</strong> This verse demonstrates the word's usage in {
                            index === 0 ? 'the opening chapter of the Quran' :
                            index === 1 ? 'a declaration of monotheism' :
                            'various Quranic contexts'
                          }.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hadith" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Hadith References</h3>
              {hadithReferences.length > 0 ? (
                hadithReferences.map((hadith, index) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary">{hadith.source}</Badge>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <p className="arabic-text text-lg leading-relaxed">{hadith.arabic}</p>
                        <p className="text-muted-foreground italic">{hadith.translation}</p>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm">
                            <strong>Context:</strong> {hadith.context}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No specific hadith references available for this word.</p>
                    <p className="text-sm mt-1">Check general hadith collections for contextual usage.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Contextual Notes</h3>
              {contextualNotes.map((note, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="capitalize">
                        {note.category}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{note.title}</h4>
                        <p className="text-sm text-muted-foreground">{note.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="related" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Related Concepts</h3>
              {relatedConcepts.length > 0 ? (
                relatedConcepts.map((concept, index) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div>
                          <span className="arabic-text text-lg">{concept.word}</span>
                          <Badge variant="outline" className="ml-2 capitalize text-xs">
                            {concept.relation}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{concept.explanation}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Related concepts will be added as the vocabulary database expands.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Usage Variations</h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Different grammatical forms and contexts for this word:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {usageVariations.map((variation, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <span className="arabic-text">{variation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Frequency Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quranic frequency:</span>
                      <span className="font-medium">{word.frequency} occurrences</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Relative frequency:</span>
                      <span className="font-medium">
                        {word.frequency > 500 ? 'Very High' : 
                         word.frequency > 100 ? 'High' : 
                         word.frequency > 50 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Learning priority:</span>
                      <span className="font-medium capitalize">{word.level}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnrichedWordContent;
