
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
  // A week or more gets the solid gold chip.
  const isHighStreak = streak >= 7;

  return (
    <div className={cn("flex items-center", className)}>
      <div 
        className={cn(
          "flex items-center rounded-full px-2.5 py-1 font-bold",
          isHighStreak ? "border-b-2 border-gold-shade bg-gold text-gold-foreground" : "bg-gold/25 text-gold-text"
        )}
      >
        <Flame 
          className={cn(
            "h-4 w-4 mr-1", 
            isHighStreak ? "text-gold-foreground" : streak > 0 ? "text-gold-text" : "text-muted-foreground"
          )} 
        />
        <span className="text-sm font-bold">
          {streak} day{streak !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default StreakCounter;
