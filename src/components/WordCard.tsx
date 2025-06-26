
import React, { useState, useRef } from 'react';
import { Volume2, ArrowRight, Check, X } from 'lucide-react';
import { Word } from '@/utils/vocabulary';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WordCardProps {
  word: Word;
  onNext?: () => void;
  onResult?: (success: boolean) => void;
  showAnswerInitially?: boolean;
  className?: string;
}

const WordCard: React.FC<WordCardProps> = ({ 
  word, 
  onNext, 
  onResult,
  showAnswerInitially = false,
  className
}) => {
  const [flipped, setFlipped] = useState(showAnswerInitially);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = () => {
    if (!word.audioUrl) {
      toast.error("Audio not available", {
        description: "Pronunciation audio is not available for this word",
      });
      return;
    }

    if (audioRef.current) {
      setIsPlaying(true);
      audioRef.current.play()
        .then(() => {
          console.log('Playing audio for:', word.arabic);
        })
        .catch(error => {
          console.error('Audio playback error:', error);
          toast.error("Playback error", {
            description: "Could not play the audio file",
          });
        });
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true);
    }
  };

  const handleResult = (success: boolean) => {
    setResult(success ? 'correct' : 'incorrect');
    if (onResult) {
      onResult(success);
    }
    
    // Automatically move to next word after a delay
    setTimeout(() => {
      if (onNext) {
        onNext();
        setFlipped(false);
        setResult(null);
      }
    }, 1000);
  };

  return (
    <div 
      className={cn(
        "glass-card p-6 rounded-xl shadow-sm w-full max-w-md mx-auto card-hover transition-all duration-500",
        flipped ? "bg-white/80" : "bg-white/70",
        result === 'correct' && "ring-2 ring-green-500",
        result === 'incorrect' && "ring-2 ring-red-500",
        className
      )}
    >
      <audio 
        ref={audioRef} 
        src={word.audioUrl} 
        onEnded={handleAudioEnd}
        className="hidden"
      />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-medium text-primary/80 bg-primary/10 px-2 py-1 rounded-full">
            {word.level}
          </span>
          <span className="text-xs font-medium text-muted-foreground ml-2">
            Root: {word.root}
          </span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            playAudio();
          }}
          className={cn(
            "text-primary hover:text-primary/80 transition-colors p-2 rounded-full",
            isPlaying && "bg-primary/10"
          )}
          aria-label="Play pronunciation"
        >
          <Volume2 className="h-5 w-5" />
        </button>
      </div>

      <div 
        className="flex flex-col items-center justify-center space-y-4 min-h-[200px] cursor-pointer"
        onClick={handleFlip}
      >
        <h2 className="arabic-text text-4xl my-4 text-center">{word.arabic}</h2>
        
        {flipped ? (
          <div className="animate-slide-up">
            <p className="text-lg text-center font-medium">{word.meaning}</p>
            <p className="text-sm text-center text-muted-foreground mt-1">
              /{word.transliteration}/
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {word.partOfSpeech} • Used {word.frequency} times in the Quran
            </p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground animate-pulse">
            <p>Tap to reveal meaning</p>
          </div>
        )}
      </div>

      {flipped && onResult && (
        <div className="flex justify-center space-x-4 mt-6 animate-slide-up">
          <button
            onClick={() => handleResult(false)}
            className="bg-white border border-red-200 hover:bg-red-50 text-red-500 px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <X className="h-4 w-4 mr-1" />
            <span>Need Review</span>
          </button>
          <button
            onClick={() => handleResult(true)}
            className="bg-white border border-green-200 hover:bg-green-50 text-green-500 px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Check className="h-4 w-4 mr-1" />
            <span>I Know This</span>
          </button>
        </div>
      )}

      {flipped && !onResult && onNext && (
        <div className="flex justify-center mt-6 animate-slide-up">
          <button
            onClick={onNext}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default WordCard;
