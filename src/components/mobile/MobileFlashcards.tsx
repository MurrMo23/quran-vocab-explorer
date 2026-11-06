
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import TouchGestures from './TouchGestures';
import { Word } from '@/utils/vocabulary-types';
import AudioPlayer from '@/components/AudioPlayer';
import AudioAttribution from '@/components/audio/AudioAttribution';
import { getBestAudio, isSpeechSupported, COMPUTER_VOICE_LABEL } from '@/utils/audio';

interface MobileFlashcardsProps {
  words: Word[];
  onComplete?: (results: { easy: number; difficult: number }) => void;
}

const MobileFlashcards: React.FC<MobileFlashcardsProps> = ({ words, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState({ easy: 0, difficult: 0 });

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  const handleTap = () => {
    setShowAnswer(!showAnswer);
  };

  const handleSwipeLeft = () => {
    // Mark as difficult
    setResults(prev => ({ ...prev, difficult: prev.difficult + 1 }));
    nextCard();
  };

  const handleSwipeRight = () => {
    // Mark as easy
    setResults(prev => ({ ...prev, easy: prev.easy + 1 }));
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Session complete
      if (onComplete) {
        onComplete(results);
      }
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  if (currentIndex >= words.length) {
    return (
      <Card className="max-w-sm mx-auto">
        <CardContent className="text-center p-6 space-y-4">
          <div className="text-2xl font-bold text-green-600">Session Complete!</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Easy:</span>
              <Badge variant="default">{results.easy}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Difficult:</span>
              <Badge variant="destructive">{results.difficult}</Badge>
            </div>
          </div>
          <Button onClick={() => {
            setCurrentIndex(0);
            setResults({ easy: 0, difficult: 0 });
            setShowAnswer(false);
          }}>
            Start Over
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Card {currentIndex + 1} of {words.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Flashcard */}
      <TouchGestures
        word={currentWord}
        showAnswer={showAnswer}
        onTap={handleTap}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <AudioPlayer
          key={currentWord.id}
          word={currentWord}
          label=""
          size="sm"
          showAttribution={false}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={previousCard}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={nextCard}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          {getBestAudio(currentWord)?.shortLabel ??
            (isSpeechSupported() ? COMPUTER_VOICE_LABEL : 'No audio available')}
        </p>
        {getBestAudio(currentWord) && <AudioAttribution />}
      </div>

      {/* Mobile-specific rating buttons */}
      {showAnswer && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="destructive"
            onClick={handleSwipeLeft}
            className="w-full"
          >
            Difficult
          </Button>
          <Button
            variant="default"
            onClick={handleSwipeRight}
            className="w-full"
          >
            Easy
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileFlashcards;
