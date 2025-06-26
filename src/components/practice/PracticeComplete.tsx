
import React from 'react';
import { BookOpenCheck } from 'lucide-react';
import StreakCounter from '@/components/StreakCounter';

interface PracticeCompleteProps {
  correctCount: number;
  incorrectCount: number;
  totalWords: number;
  streak: number;
  onBackToDashboard: () => void;
  onPracticeAgain: () => void;
}

const PracticeComplete: React.FC<PracticeCompleteProps> = ({
  correctCount,
  incorrectCount,
  totalWords,
  streak,
  onBackToDashboard,
  onPracticeAgain
}) => {
  return (
    <div className="text-center animate-scale-in">
      <div className="glass-card p-8 rounded-xl mb-8">
        <div className="bg-primary/10 text-primary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpenCheck className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">Practice Complete!</h2>
        <p className="text-muted-foreground mb-6">
          You've reviewed {totalWords} words today. Keep it up!
        </p>
        
        <div className="flex justify-center space-x-4 mb-6">
          <div className="text-center px-6 py-3 bg-white/50 rounded-lg">
            <div className="text-3xl font-bold text-green-500 mb-1">{correctCount}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="text-center px-6 py-3 bg-white/50 rounded-lg">
            <div className="text-3xl font-bold text-red-500 mb-1">{incorrectCount}</div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </div>
          <div className="text-center px-6 py-3 bg-white/50 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">
              {Math.round((correctCount / totalWords) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
        </div>
        
        <div className="flex justify-center items-center">
          <StreakCounter streak={streak} className="mx-auto" />
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={onBackToDashboard}
          className="px-6 py-3 bg-white border border-gray-200 rounded-lg text-foreground hover:bg-gray-50 transition-colors"
        >
          View Progress
        </button>
        <button
          onClick={onPracticeAgain}
          className="px-6 py-3 bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors"
        >
          Practice Again
        </button>
      </div>
    </div>
  );
};

export default PracticeComplete;
