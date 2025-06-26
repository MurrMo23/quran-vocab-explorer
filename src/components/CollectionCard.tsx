
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import AudioPlayer from './AudioPlayer';

interface CollectionCardProps {
  id: string;
  title: string;
  description: string;
  count: number;
  className?: string;
  icon?: React.ReactNode;
  wordCount?: number;
  difficulty?: string;
  imageSrc?: string;
  arabic?: string; // Add Arabic text for audio playback
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  id,
  title,
  description,
  count,
  className,
  icon = <BookOpen className="h-5 w-5" />,
  wordCount,
  difficulty,
  imageSrc,
  arabic
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/collections/${id}`);
  };

  // Use wordCount if provided, otherwise fall back to count
  const displayCount = wordCount !== undefined ? wordCount : count;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "glass-card p-4 rounded-xl text-left border border-gray-100 hover:border-primary/20 transition-all",
        "hover:shadow-md hover:-translate-y-1 flex items-start justify-between w-full",
        className
      )}
    >
      <div className="flex items-start flex-1">
        <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {displayCount} words
            </span>
            {difficulty && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {difficulty}
              </span>
            )}
          </div>
          {arabic && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-arabic">{arabic}</span>
              <AudioPlayer 
                text={arabic}
                voice="Mo"
                size="sm"
                className="ml-auto"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground mt-1 ml-2" />
    </button>
  );
};

export default CollectionCard;
