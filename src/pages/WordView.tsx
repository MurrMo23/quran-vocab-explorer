
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import WordDetail from '@/components/WordDetail';
import { getWordById, Word, getAllWords } from '@/utils/vocabulary';
import { toast } from 'sonner';

const WordView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [word, setWord] = useState<Word | null>(null);
  const [nextWord, setNextWord] = useState<Word | null>(null);
  const [previousWord, setPreviousWord] = useState<Word | null>(null);
  const [relatedWords, setRelatedWords] = useState<Word[]>([]);
  const [recommendedWords, setRecommendedWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundWord = getWordById(id);
      
      if (foundWord) {
        setWord(foundWord);
        
        // Get all words for navigation
        const allWords = getAllWords();
        const currentIndex = allWords.findIndex(w => w.id === id);
        
        // Set next and previous words
        if (currentIndex > 0) {
          setPreviousWord(allWords[currentIndex - 1]);
        }
        if (currentIndex < allWords.length - 1) {
          setNextWord(allWords[currentIndex + 1]);
        }
        
        // Find related words (same root or similar meaning)
        const related = allWords.filter(w => 
          w.id !== id && (
            w.root === foundWord.root || 
            w.partOfSpeech === foundWord.partOfSpeech ||
            w.tags.some(tag => foundWord.tags.includes(tag))
          )
        ).slice(0, 8);
        setRelatedWords(related);
        
        // Find recommended words (similar difficulty level and frequency)
        const recommended = allWords.filter(w => 
          w.id !== id && 
          w.level === foundWord.level &&
          Math.abs(w.frequency - foundWord.frequency) < 50
        ).sort(() => Math.random() - 0.5).slice(0, 8);
        setRecommendedWords(recommended);
        
      } else {
        toast.error("Word not found", {
          description: "We couldn't find the word you're looking for",
        });
      }
      
      setLoading(false);
    }
  }, [id]);

  return (
    <>
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground flex items-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col items-center justify-center py-10">
          <div className="w-2/3 h-8 bg-gray-200 rounded-lg mb-4"></div>
          <div className="w-1/2 h-6 bg-gray-200 rounded-lg mb-8"></div>
          <div className="w-full h-40 bg-gray-200 rounded-lg"></div>
        </div>
      ) : word ? (
        <div className="animate-fade-in">
          <WordDetail 
            word={word} 
            nextWord={nextWord || undefined}
            previousWord={previousWord || undefined}
            relatedWords={relatedWords}
            recommendedWords={recommendedWords}
          />
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">Word Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Sorry, we couldn't find the word you're looking for.
          </p>
          <button
            onClick={() => navigate('/practice')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Practice
          </button>
        </div>
      )}
    </>
  );
};

export default WordView;
