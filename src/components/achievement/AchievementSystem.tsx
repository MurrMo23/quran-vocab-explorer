
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  BookOpen, 
  Volume2,
  Users,
  Calendar,
  Award,
  Crown
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'learning' | 'social' | 'milestone' | 'streak';
  points: number;
  isUnlocked: boolean;
  progress: number;
  target: number;
  unlockedAt?: Date;
}

const AchievementSystem: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Mock achievements data - in a real app, this would come from the backend
    const mockAchievements: Achievement[] = [
      {
        id: 'first-word',
        title: 'First Steps',
        description: 'Learn your first Arabic word',
        icon: <BookOpen className="h-6 w-6" />,
        category: 'learning',
        points: 10,
        isUnlocked: true,
        progress: 1,
        target: 1,
        unlockedAt: new Date('2024-01-15')
      },
      {
        id: 'word-collector-50',
        title: 'Word Collector',
        description: 'Learn 50 different words',
        icon: <Target className="h-6 w-6" />,
        category: 'learning',
        points: 50,
        isUnlocked: true,
        progress: 50,
        target: 50,
        unlockedAt: new Date('2024-02-01')
      },
      {
        id: 'streak-7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: <Flame className="h-6 w-6" />,
        category: 'streak',
        points: 25,
        isUnlocked: false,
        progress: 5,
        target: 7
      },
      {
        id: 'pronunciation-master',
        title: 'Pronunciation Master',
        description: 'Complete 100 pronunciation exercises',
        icon: <Volume2 className="h-6 w-6" />,
        category: 'learning',
        points: 75,
        isUnlocked: false,
        progress: 73,
        target: 100
      },
      {
        id: 'community-helper',
        title: 'Community Helper',
        description: 'Help 10 other learners in study groups',
        icon: <Users className="h-6 w-6" />,
        category: 'social',
        points: 40,
        isUnlocked: false,
        progress: 6,
        target: 10
      },
      {
        id: 'collection-master',
        title: 'Collection Master',
        description: 'Complete 5 different collections',
        icon: <Award className="h-6 w-6" />,
        category: 'milestone',
        points: 100,
        isUnlocked: false,
        progress: 3,
        target: 5
      },
      {
        id: 'daily-devotion',
        title: 'Daily Devotion',
        description: 'Practice daily for 30 consecutive days',
        icon: <Calendar className="h-6 w-6" />,
        category: 'streak',
        points: 150,
        isUnlocked: false,
        progress: 18,
        target: 30
      },
      {
        id: 'vocab-champion',
        title: 'Vocabulary Champion',
        description: 'Master 500 words with 90%+ accuracy',
        icon: <Crown className="h-6 w-6" />,
        category: 'milestone',
        points: 250,
        isUnlocked: false,
        progress: 234,
        target: 500
      }
    ];

    setAchievements(mockAchievements);
    setTotalPoints(mockAchievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.points, 0));
  }, []);

  const categories = [
    { id: 'all', name: 'All Achievements', icon: Trophy },
    { id: 'learning', name: 'Learning', icon: BookOpen },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'milestone', name: 'Milestones', icon: Award },
    { id: 'streak', name: 'Streaks', icon: Flame }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'learning': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-green-100 text-green-800';
      case 'milestone': return 'bg-purple-100 text-purple-800';
      case 'streak': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievement System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {achievements.filter(a => a.isUnlocked).length}
              </div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((achievements.filter(a => a.isUnlocked).length / achievements.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map((achievement) => (
              <Card key={achievement.id} className={`${!achievement.isUnlocked ? 'opacity-75' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${achievement.isUnlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{achievement.title}</h3>
                        <Badge className={getCategoryColor(achievement.category)} variant="secondary">
                          {achievement.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      
                      {achievement.isUnlocked ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="gap-1">
                            <Star className="h-3 w-3" />
                            {achievement.points} points
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {achievement.progress} / {achievement.target}
                            </span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.target) * 100} 
                            className="h-2"
                          />
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3" />
                            {achievement.points} points
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementSystem;
