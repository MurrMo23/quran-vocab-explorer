
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  BookText,
  Pilcrow, 
  BookOpenCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const LevelSelect: React.FC = () => {
  const navigate = useNavigate();
  
  const levels: LevelOption[] = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'Start with the most common 300 words, covering 60% of the Quran',
      icon: <BookText className="h-12 w-12" />,
      color: 'bg-emerald-50 text-emerald-500 border-emerald-200',
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'Learn the next 500 words, covering 80% of the Quran',
      icon: <Pilcrow className="h-12 w-12" />,
      color: 'bg-blue-50 text-blue-500 border-blue-200',
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'Master 1000+ specialized vocabulary for deep understanding',
      icon: <GraduationCap className="h-12 w-12" />,
      color: 'bg-purple-50 text-purple-500 border-purple-200',
    },
    {
      id: 'custom',
      title: 'Custom Learning',
      description: 'Select specific Surahs or themes you want to focus on',
      icon: <BookOpenCheck className="h-12 w-12" />,
      color: 'bg-amber-50 text-amber-500 border-amber-200',
    },
  ];

  const handleLevelSelect = (levelId: string) => {
    // Navigate to the appropriate page based on selection
    if (levelId === 'custom') {
      navigate('/custom-learning');
    } else {
      // In a real app, this would set the user's selected level
      console.log('Selected level:', levelId);
      // Navigate to practice with the selected level
      navigate('/practice');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Choose Your Learning Path</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => handleLevelSelect(level.id)}
            className={cn(
              "glass-card p-6 rounded-xl text-left border-2 transition-all",
              "hover:shadow-md hover:-translate-y-1",
              level.color
            )}
          >
            <div className="flex items-start">
              <div className="p-3 rounded-lg bg-white/70 mr-4">
                {level.icon}
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">{level.title}</h3>
                <p className="text-muted-foreground text-sm">{level.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelect;
