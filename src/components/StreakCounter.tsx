
import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  streak: number;
  className?: string;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ 
  streak, 
  className 
}) => {
  // Determine if the streak deserves a special visual treatment
  const isHighStreak = streak >= 7;
  const isVeryHighStreak = streak >= 30;

  return (
    <div className={cn("flex items-center", className)}>
      <div 
        className={cn(
          "flex items-center px-2 py-1 rounded-full",
          isVeryHighStreak ? "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800" : 
          isHighStreak ? "bg-amber-100 text-amber-800 border border-amber-200" : 
          "bg-amber-100 text-amber-800"
        )}
      >
        <Flame 
          className={cn(
            "h-4 w-4 mr-1", 
            isVeryHighStreak ? "text-amber-600" :
            isHighStreak ? "text-amber-500" :
            streak > 0 ? "text-amber-500" : "text-muted-foreground"
          )} 
        />
        <span className="text-sm font-medium">
          {streak} day{streak !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default StreakCounter;
