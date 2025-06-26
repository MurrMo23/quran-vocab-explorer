
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import ProgressStats from '@/components/ProgressStats';
import ProgressReport from '@/components/ProgressReport';
import CollectionCard from '@/components/CollectionCard';
import SearchBar from '@/components/SearchBar';
import StreakCounter from '@/components/StreakCounter';
import { collections, getWordsByCollection, getDailyWords } from '@/utils/vocabulary';
import { BookText, BookOpen, ChevronRight, Brain, Heart, Users, Scroll, Settings, Database, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const getIconForCollection = (id: string) => {
  switch (id) {
    case 'faith':
      return <Heart className="h-5 w-5" />;
    case 'prophets':
      return <Users className="h-5 w-5" />;
    case 'ethics':
      return <Scroll className="h-5 w-5" />;
    default:
      return <BookText className="h-5 w-5" />;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { hasRole } = usePermissions();
  const isAdmin = hasRole('admin');
  const featuredCollections = collections.slice(0, 3);
  
  // Get today's daily words
  const dailyWords = getDailyWords(3);
  
  // Mock user streak data
  const userStreak = 7;

  if (!session) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <div className="flex items-center gap-2">
            <StreakCounter streak={userStreak} />
            <span className="text-sm text-muted-foreground">Keep up the good work!</span>
          </div>
        </div>
        <SearchBar className="w-full md:w-64" />
      </div>

      {/* Admin Panel Access */}
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Settings className="h-5 w-5" />
                Admin Panel
              </CardTitle>
              <CardDescription>
                Manage the platform with full administrative access
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-2">
              <Button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Admin Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/analytics')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      <div className="mb-10">
        <ProgressStats />
      </div>

      <div className="mb-10">
        <ProgressReport />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Today's Words</h2>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/practice')}
            className="text-primary hover:text-primary flex items-center"
          >
            Practice all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyWords.map((word, index) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.1 }
              }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-2xl font-arabic">{word.arabic}</span>
                    <Badge level={word.level} />
                  </CardTitle>
                  <CardDescription>{word.transliteration}</CardDescription>
                </CardHeader>
                <CardContent className="py-2 flex-grow">
                  <p className="font-medium">{word.meaning}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Root: {word.root}
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/word/${word.id}`)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Featured Collections</h2>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/collections')}
            className="text-primary hover:text-primary flex items-center"
          >
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {featuredCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.3 + index * 0.1 }
              }}
            >
              <CollectionCard
                id={collection.id}
                title={collection.name}
                description={collection.description}
                count={getWordsByCollection(collection.id).length}
                icon={getIconForCollection(collection.id)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          onClick={() => navigate('/practice')}
          className="px-6"
          size="lg"
        >
          <Brain className="mr-2 h-5 w-5" />
          Start Practice
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/collections')}
          size="lg"
        >
          <BookText className="mr-2 h-5 w-5" />
          Browse Collections
        </Button>
      </motion.div>
    </div>
  );
};

// Badge component for word difficulty level
const Badge = ({ level }: { level: string }) => {
  const getColorByLevel = () => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'intermediate':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'advanced':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${getColorByLevel()}`}>
      {level}
    </span>
  );
};

export default Dashboard;
