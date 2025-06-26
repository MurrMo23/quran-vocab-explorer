
import React from 'react';
import { Award, TrendingUp, BookOpen, CheckCircle2, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getUserProgress } from '@/utils/spaced-repetition';

const ProgressStats: React.FC = () => {
  const progress = getUserProgress();
  
  const stats = [
    {
      title: 'Mastered',
      value: progress.masteredWords,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Learning',
      value: progress.learningWords,
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'New',
      value: progress.newWords,
      icon: <BookOpen className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      title: 'Total',
      value: progress.totalWords,
      icon: <Award className="h-5 w-5 text-yellow-500" />,
      color: 'bg-yellow-100 text-yellow-800',
    },
  ];

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Your Progress</h2>
        
        <div className="flex items-center bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
          <Flame className="h-4 w-4 mr-1 text-amber-500" />
          <span className="text-sm font-medium">{progress.streak} day streak</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm text-muted-foreground">Mastery Level</span>
          <span className="font-medium">{progress.mastery}%</span>
        </div>
        <Progress value={progress.mastery} className="h-2" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.title} 
            className="bg-white/50 rounded-lg p-4 flex flex-col items-center justify-center card-hover"
          >
            <div className="mb-2">{stat.icon}</div>
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className="text-sm text-muted-foreground">{stat.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressStats;
