
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import StreakCounter from '@/components/StreakCounter';
import StudyTimer from '@/components/StudyTimer';
import { Progress } from '@/components/ui/progress';

interface PracticeHeaderProps {
  streak: number;
  timerActive: boolean;
  currentIndex: number;
  totalWords: number;
  correctCount: number;
  incorrectCount: number;
  progress: number;
}

const PracticeHeader: React.FC<PracticeHeaderProps> = ({
  streak,
  timerActive,
  currentIndex,
  totalWords,
  correctCount,
  incorrectCount,
  progress
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground flex items-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </button>
        <div className="flex items-center space-x-4">
          <StreakCounter streak={streak} />
          <StudyTimer isActive={timerActive} />
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {totalWords}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <span className="h-4 w-4 rounded-full bg-green-500"></span>
            <span className="text-sm">{correctCount} correct</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-4 w-4 rounded-full bg-red-500"></span>
            <span className="text-sm">{incorrectCount} incorrect</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </>
  );
};

export default PracticeHeader;
