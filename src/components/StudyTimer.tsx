
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyTimerProps {
  isActive?: boolean;
  className?: string;
}

const StudyTimer: React.FC<StudyTimerProps> = ({ 
  isActive = true,
  className
}) => {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive) {
      interval = window.setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);
  
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
        <Clock className="h-4 w-4 mr-1 text-blue-500" />
        <span className="text-sm font-medium">{formatTime(seconds)}</span>
      </div>
    </div>
  );
};

export default StudyTimer;
