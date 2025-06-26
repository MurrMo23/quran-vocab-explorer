
import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, RotateCcw, Check, X } from 'lucide-react';
import { Word } from '@/utils/vocabulary-types';

interface TouchGesturesProps {
  word: Word;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  showAnswer?: boolean;
}

const TouchGestures: React.FC<TouchGesturesProps> = ({
  word,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  showAnswer = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    
    if (dragOffset > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (dragOffset < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (Math.abs(dragOffset) < 20 && onTap) {
      onTap();
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  const getCardStyle = () => {
    if (!isDragging) return {};
    
    const rotation = dragOffset * 0.1;
    const opacity = 1 - Math.abs(dragOffset) * 0.002;
    
    return {
      transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
      opacity: Math.max(opacity, 0.7),
      transition: isDragging ? 'none' : 'all 0.3s ease-out'
    };
  };

  const getSwipeHint = () => {
    if (!isDragging) return null;
    
    if (dragOffset > 50) {
      return (
        <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full">
          <Check className="h-4 w-4" />
        </div>
      );
    } else if (dragOffset < -50) {
      return (
        <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full">
          <X className="h-4 w-4" />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="relative max-w-sm mx-auto">
      <Card
        ref={cardRef}
        className="relative cursor-pointer select-none"
        style={getCardStyle()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent className="p-6 text-center space-y-4">
          {getSwipeHint()}
          
          <div className="space-y-2">
            <div className="text-3xl font-arabic">{word.arabic}</div>
            <div className="text-lg text-muted-foreground">/{word.transliteration}/</div>
            
            {showAnswer && (
              <div className="space-y-2">
                <div className="text-lg font-medium">{word.meaning}</div>
                {word.root && (
                  <div className="text-sm text-muted-foreground">Root: {word.root}</div>
                )}
                <Badge variant="outline">{word.level}</Badge>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-2">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tap to reveal • Swipe to rate</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Gesture Instructions */}
      <div className="mt-4 text-center space-y-1">
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <X className="h-3 w-3 text-red-500" />
            Swipe left: Difficult
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" />
            Swipe right: Easy
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Tap to flip card</div>
      </div>
    </div>
  );
};

export default TouchGestures;
