
import React, { useState, useEffect } from 'react';
import { Word } from '@/utils/vocabulary-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface PracticeSessionManagerProps {
  words: Word[];
  onSessionComplete: (results: SessionResults) => void;
  onModeChange: (mode: PracticeMode) => void;
  currentMode: PracticeMode;
}

export type PracticeMode = 'vocabulary' | 'pronunciation' | 'mixed' | 'spaced-repetition';

export interface SessionResults {
  totalWords: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  timeSpent: number;
  wordsReviewed: string[];
  difficultWords: string[];
}

const PracticeSessionManager: React.FC<PracticeSessionManagerProps> = ({
  words,
  onSessionComplete,
  onModeChange,
  currentMode
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [sessionStartTime] = useState(new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [difficultWords, setDifficultWords] = useState<string[]>([]);

  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;
  const accuracy = (correctCount + incorrectCount) > 0 ? (correctCount / (correctCount + incorrectCount)) * 100 : 0;

  const handleAnswer = (isCorrect: boolean, wordId: string) => {
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      toast.success('Correct! 🎉');
    } else {
      setIncorrectCount(prev => prev + 1);
      setDifficultWords(prev => [...prev, wordId]);
      toast.error('Keep practicing! 💪');
    }

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        completeSession();
      }
    }, 1500);
  };

  const completeSession = () => {
    const timeSpent = (new Date().getTime() - sessionStartTime.getTime()) / 1000;
    const results: SessionResults = {
      totalWords: words.length,
      correctCount,
      incorrectCount,
      accuracy,
      timeSpent,
      wordsReviewed: words.map(w => w.id),
      difficultWords
    };
    onSessionComplete(results);
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setDifficultWords([]);
    setIsPaused(false);
  };

  const practiceModOptions = [
    { key: 'vocabulary', label: 'Vocabulary', icon: '📚' },
    { key: 'pronunciation', label: 'Pronunciation', icon: '🗣️' },
    { key: 'mixed', label: 'Mixed Practice', icon: '🔄' },
    { key: 'spaced-repetition', label: 'Spaced Repetition', icon: '🧠' }
  ];

  return (
    <div className="space-y-6">
      {/* Session Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Practice Session</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetSession}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {currentIndex + 1} of {words.length}</span>
              <span>Accuracy: {accuracy.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{correctCount}</div>
              <div className="text-sm text-green-700">Correct</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
              <div className="text-sm text-red-700">Incorrect</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{words.length - currentIndex - 1}</div>
              <div className="text-sm text-blue-700">Remaining</div>
            </div>
          </div>

          {/* Practice Mode Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Practice Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {practiceModOptions.map((mode) => (
                <Button
                  key={mode.key}
                  variant={currentMode === mode.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => onModeChange(mode.key as PracticeMode)}
                  className="justify-start"
                >
                  <span className="mr-2">{mode.icon}</span>
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Word Display */}
      {words[currentIndex] && !isPaused && (
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="arabic-text text-3xl mb-2">{words[currentIndex].arabic}</div>
              <div className="text-sm text-muted-foreground mb-4">
                /{words[currentIndex].transliteration}/
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => handleAnswer(true, words[currentIndex].id)}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  I Know This
                </Button>
                <Button
                  onClick={() => handleAnswer(false, words[currentIndex].id)}
                  variant="outline"
                  className="w-full"
                >
                  Need More Practice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isPaused && (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Session Paused</h3>
            <p className="text-muted-foreground mb-4">
              Take a break and resume when you're ready.
            </p>
            <Button onClick={() => setIsPaused(false)}>
              <Play className="h-4 w-4 mr-2" />
              Resume Practice
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PracticeSessionManager;
