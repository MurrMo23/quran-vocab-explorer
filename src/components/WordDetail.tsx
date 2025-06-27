
import React from 'react';
import { Book, AlignLeft, BookOpen, Hash, ArrowLeft, ArrowRight, Search, Users } from 'lucide-react';
import { Word } from '@/utils/vocabulary';
import AudioPlayer from './AudioPlayer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface WordDetailProps {
  word: Word;
  className?: string;
  nextWord?: Word;
  previousWord?: Word;
  relatedWords?: Word[];
  recommendedWords?: Word[];
}

const WordDetail: React.FC<WordDetailProps> = ({ 
  word, 
  className,
  nextWord,
  previousWord,
  relatedWords = [],
  recommendedWords = []
}) => {
  const navigate = useNavigate();

  const handleWordNavigation = (wordId: string) => {
    navigate(`/word/${wordId}`);
  };

  return (
    <div className={cn("glass-card rounded-xl p-6", className)}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-arabic mb-2">{word.arabic}</h1>
          <div className="text-lg text-muted-foreground mb-1">{word.transliteration}</div>
          <h2 className="text-2xl font-medium">{word.meaning}</h2>
        </div>
        
        <AudioPlayer 
          text={word.arabic}
          voice="CwhRBWXzGAHq8TQ4Fs17"
          label="Listen to pronunciation" 
          className="flex items-center gap-2 mt-4 md:mt-0"
        />
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Book className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Part of Speech</div>
            <div className="font-medium capitalize">{word.partOfSpeech}</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <AlignLeft className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Root</div>
            <div className="font-medium font-arabic">{word.root}</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Hash className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Frequency</div>
            <div className="font-medium">{word.frequency} occurrences</div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          <span>Quranic Examples</span>
        </h3>
        
        <div className="space-y-4">
          {word.examples.map((example, index) => (
            <div key={index} className="bg-white/50 rounded-lg p-4">
              <div className="mb-2">
                <span className="text-sm text-muted-foreground">
                  Surah {example.surah}, Ayah {example.ayah}
                </span>
              </div>
              <div className="text-right mb-2">
                <p className="text-xl font-arabic leading-loose">{example.arabicText}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{example.translation}</p>
              </div>
              <div className="mt-3">
                <AudioPlayer
                  text={example.arabicText}
                  voice="CwhRBWXzGAHq8TQ4Fs17"
                  label="Listen to verse"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Section */}
      <div className="border-t pt-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div className="flex gap-2">
            {previousWord && (
              <Button
                variant="outline"
                onClick={() => handleWordNavigation(previousWord.id)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous:</span>
                <span className="font-arabic">{previousWord.arabic}</span>
              </Button>
            )}
            {nextWord && (
              <Button
                variant="outline"
                onClick={() => handleWordNavigation(nextWord.id)}
                className="flex items-center gap-2"
              >
                <span className="hidden sm:inline">Next:</span>
                <span className="font-arabic">{nextWord.arabic}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Related Words Section */}
      {relatedWords.length > 0 && (
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Search className="h-5 w-5 mr-2 text-primary" />
            <span>Similar Words</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {relatedWords.slice(0, 4).map((relatedWord) => (
              <button
                key={relatedWord.id}
                onClick={() => handleWordNavigation(relatedWord.id)}
                className="p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-colors text-left"
              >
                <div className="font-arabic text-lg">{relatedWord.arabic}</div>
                <div className="text-sm text-muted-foreground truncate">{relatedWord.meaning}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Words Section */}
      {recommendedWords.length > 0 && (
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            <span>People Also Studied</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {recommendedWords.slice(0, 4).map((recommendedWord) => (
              <button
                key={recommendedWord.id}
                onClick={() => handleWordNavigation(recommendedWord.id)}
                className="p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-colors text-left"
              >
                <div className="font-arabic text-lg">{recommendedWord.arabic}</div>
                <div className="text-sm text-muted-foreground truncate">{recommendedWord.meaning}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {word.tags.map(tag => (
          <span 
            key={tag} 
            className="text-xs bg-gray-100 px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WordDetail;
