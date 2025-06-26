
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Volume2, RotateCcw, BookOpen } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getWordsByCollection, Collection, Word, getAllCollections } from '@/utils/vocabulary';
import PreviewMode from '@/components/PreviewMode';
import { Helmet } from 'react-helmet';

const Practice = () => {
  const { session } = useAuth();
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  useEffect(() => {
    const allCollections = getAllCollections();
    setCollections(allCollections);
    if (allCollections.length > 0) {
      setSelectedCollection(allCollections[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      const collectionWords = getWordsByCollection(selectedCollection);
      // For preview mode, limit to 3 words for non-logged in users
      const wordsToShow = !session ? collectionWords.slice(0, 3) : collectionWords;
      setWords(wordsToShow);
      setCurrentWordIndex(0);
      setShowAnswer(false);
      setIsCorrect(null);
    }
  }, [selectedCollection, session]);

  const currentWord = words[currentWordIndex];
  const progress = words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0;

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleCorrect = () => {
    setIsCorrect(true);
    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
        setShowAnswer(false);
        setIsCorrect(null);
      } else {
        // Practice session complete
        setPracticeStarted(false);
        setCurrentWordIndex(0);
        setShowAnswer(false);
        setIsCorrect(null);
      }
    }, 1000);
  };

  const handleIncorrect = () => {
    setIsCorrect(false);
    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
        setShowAnswer(false);
        setIsCorrect(null);
      } else {
        // Practice session complete
        setPracticeStarted(false);
        setCurrentWordIndex(0);
        setShowAnswer(false);
        setIsCorrect(null);
      }
    }, 1000);
  };

  const resetPractice = () => {
    setCurrentWordIndex(0);
    setShowAnswer(false);
    setIsCorrect(null);
    setPracticeStarted(false);
  };

  const practiceContent = (
    <>
      <Helmet>
        <title>Practice Arabic Vocabulary | Learn Words</title>
        <meta name="description" content="Practice Arabic vocabulary words with interactive flashcards and track your progress." />
      </Helmet>

      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Practice Mode</h1>
          <p className="text-muted-foreground">
            {session 
              ? "Master Arabic vocabulary with interactive practice sessions" 
              : "Try our practice mode with a preview of available words"
            }
          </p>
        </div>

        {!practiceStarted ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Choose a Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Collection:</label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name} ({getWordsByCollection(collection.id).length} words)
                    </option>
                  ))}
                </select>
              </div>
              
              {!session && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Preview mode: You can try the first 3 words from this collection.
                  </p>
                </div>
              )}
              
              <Button
                onClick={() => setPracticeStarted(true)}
                disabled={words.length === 0}
                className="w-full"
                size="lg"
              >
                Start Practice Session ({words.length} words)
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Word {currentWordIndex + 1} of {words.length}
                </span>
                <Button variant="outline" size="sm" onClick={resetPractice}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {currentWord && (
              <Card className={`mb-4 ${
                isCorrect === true ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
                isCorrect === false ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
                ''
              }`}>
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <h2 className="text-4xl font-bold mb-2 text-primary">
                      {currentWord.arabic}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {currentWord.transliteration}
                    </p>
                  </div>

                  {!showAnswer ? (
                    <Button onClick={handleShowAnswer} size="lg">
                      Show Answer
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-xl font-semibold mb-2">{currentWord.meaning}</p>
                        <p className="text-sm text-muted-foreground">
                          {currentWord.partOfSpeech} • {currentWord.root}
                        </p>
                      </div>

                      {isCorrect === null && (
                        <div className="flex gap-4 justify-center">
                          <Button
                            onClick={handleCorrect}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            I knew it
                          </Button>
                          <Button
                            onClick={handleIncorrect}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            I didn't know
                          </Button>
                        </div>
                      )}

                      {isCorrect === true && (
                        <div className="text-green-600 font-medium">
                          <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                          Correct! Well done.
                        </div>
                      )}

                      {isCorrect === false && (
                        <div className="text-red-600 font-medium">
                          <XCircle className="h-6 w-6 mx-auto mb-2" />
                          Keep practicing!
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );

  // Show preview mode for non-logged in users
  if (!session) {
    return <PreviewMode type="practice">{practiceContent}</PreviewMode>;
  }

  return practiceContent;
};

export default Practice;
