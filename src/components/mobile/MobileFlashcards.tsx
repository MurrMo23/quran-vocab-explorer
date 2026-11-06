import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';
import TouchGestures from './TouchGestures';
import { Word } from '@/utils/vocabulary-types';
import AudioPlayer from '@/components/AudioPlayer';
import AudioAttribution from '@/components/audio/AudioAttribution';
import { getBestAudio, isSpeechSupported, COMPUTER_VOICE_LABEL } from '@/utils/audio';
import { useProgress, type Rating } from '@/lib/progress';
import ProgressSaveNotice from '@/components/practice/ProgressSaveNotice';
import { RATING_OPTIONS } from '@/components/practice/rating-options';
import { cn } from '@/lib/utils';

export interface FlashcardResults {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

interface MobileFlashcardsProps {
  words: Word[];
  onComplete?: (results: FlashcardResults) => void;
  onRestart?: () => void;
}

const EMPTY: FlashcardResults = { again: 0, hard: 0, good: 0, easy: 0 };

/** Swipe flashcards. Every rating is recorded with FSRS (source 'flashcards'). */
const MobileFlashcards: React.FC<MobileFlashcardsProps> = ({ words, onComplete, onRestart }) => {
  const { recordReview, previewInterval } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<FlashcardResults>(EMPTY);
  const shownAt = useRef(Date.now());

  const done = currentIndex >= words.length;
  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? (Math.min(currentIndex, words.length) / words.length) * 100 : 0;

  const rate = (rating: Rating) => {
    if (!currentWord) return;
    // Rating before seeing the answer would not be an honest review.
    if (!showAnswer) {
      setShowAnswer(true);
      return;
    }
    void recordReview(currentWord.id, rating, 'flashcards', Date.now() - shownAt.current);
    const next = { ...results, [rating]: results[rating] + 1 };
    setResults(next);
    setShowAnswer(false);
    shownAt.current = Date.now();
    setCurrentIndex((i) => i + 1);
    if (currentIndex + 1 >= words.length) onComplete?.(next);
  };

  if (words.length === 0) {
    return (
      <Card className="mx-auto max-w-sm">
        <CardContent className="space-y-2 p-6 text-center">
          <p className="font-medium">Nothing to review right now</p>
          <p className="text-sm text-muted-foreground">You’re all caught up. Come back later or pick another collection.</p>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    const total = results.again + results.hard + results.good + results.easy;
    return (
      <Card className="mx-auto max-w-sm">
        <CardContent className="space-y-4 p-6 text-center">
          <div className="text-2xl font-bold text-green-600">Session Complete!</div>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'card' : 'cards'} reviewed
          </p>
          <div className="space-y-2">
            {RATING_OPTIONS.map((o) => (
              <div key={o.rating} className="flex justify-between">
                <span>{o.label}</span>
                <Badge variant={o.rating === 'again' ? 'destructive' : 'secondary'}>{results[o.rating]}</Badge>
              </div>
            ))}
          </div>
          <ProgressSaveNotice />
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setResults(EMPTY);
              setShowAnswer(false);
              shownAt.current = Date.now();
              onRestart?.();
            }}
          >
            Start Over
          </Button>
        </CardContent>
      </Card>
    );
  }

  const audio = getBestAudio(currentWord);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Card {currentIndex + 1} of {words.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Swipe right = Good, swipe left = Again (after the answer is revealed). */}
      <TouchGestures
        word={currentWord}
        showAnswer={showAnswer}
        onTap={() => setShowAnswer((s) => !s)}
        onSwipeLeft={() => rate('again')}
        onSwipeRight={() => rate('good')}
      />

      <div className="flex justify-center gap-2">
        <AudioPlayer key={currentWord.id} word={currentWord} label="" size="sm" showAttribution={false} />
        <Button variant="outline" size="sm" onClick={() => setShowAnswer((s) => !s)} aria-label="Flip card">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1 text-center">
        <p className="text-xs text-muted-foreground">
          {audio?.shortLabel ?? (isSpeechSupported() ? COMPUTER_VOICE_LABEL : 'No audio available')}
        </p>
        {audio && <AudioAttribution />}
      </div>

      {showAnswer ? (
        <div className="grid grid-cols-4 gap-2">
          {RATING_OPTIONS.map((o) => (
            <Button
              key={o.rating}
              variant="outline"
              onClick={() => rate(o.rating)}
              className={cn('h-auto flex-col gap-0.5 px-1 py-2', o.className)}
            >
              <span className="text-sm font-semibold">{o.label}</span>
              <span className="text-[11px] opacity-80">{previewInterval(currentWord.id, o.rating)}</span>
            </Button>
          ))}
        </div>
      ) : (
        <Button className="w-full" onClick={() => setShowAnswer(true)}>
          Show answer
        </Button>
      )}

      <ProgressSaveNotice />
    </div>
  );
};

export default MobileFlashcards;
