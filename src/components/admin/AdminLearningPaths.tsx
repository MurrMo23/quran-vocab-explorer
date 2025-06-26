
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Settings, User, Users, Eye } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { LearningPath, useCustomLearning } from '@/hooks/useCustomLearning';
import { commonSurahs } from '@/components/learning/SurahSelector';
import { collections } from '@/utils/vocabulary';
import { toast } from 'sonner';

interface AdminLearningPathsProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: any) => Promise<void>;
}

const AdminLearningPaths: React.FC<AdminLearningPathsProps> = ({ onAuditLog }) => {
  const { session } = useAuth();
  const { userPaths, publicPaths, deleteLearningPath } = useCustomLearning();
  const [allPaths, setAllPaths] = useState<LearningPath[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    // Combine all paths for admin view
    setAllPaths([...userPaths, ...publicPaths]);
  }, [userPaths, publicPaths]);
  
  const handleTabChange = async (value: string) => {
    if (onAuditLog) {
      await onAuditLog('TAB_CHANGE', 'learning_paths_tab', value, { previous: activeTab });
    }
    setActiveTab(value);
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getSurahNames = (surahIds: number[]) => {
    return surahIds.map(id => {
      const surah = commonSurahs.find(s => s.id === id);
      return surah ? surah.name : `Surah ${id}`;
    }).join(', ');
  };
  
  const getThemeNames = (themeIds: string[]) => {
    return themeIds.map(id => {
      const theme = collections.find(c => c.id === id);
      return theme ? theme.name : id;
    }).join(', ');
  };
  
  const handleDeletePath = async (pathId: string) => {
    if (confirm('Are you sure you want to delete this learning path?')) {
      if (onAuditLog) {
        await onAuditLog('DELETE', 'learning_path', pathId);
      }
      await deleteLearningPath(pathId);
      toast.success('Learning path deleted successfully');
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Learning Paths</h2>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Paths</TabsTrigger>
          <TabsTrigger value="my-paths">My Paths</TabsTrigger>
          <TabsTrigger value="public-paths">Public Paths</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <AdminPathsList 
            paths={allPaths}
            getDifficultyColor={getDifficultyColor}
            getSurahNames={getSurahNames}
            getThemeNames={getThemeNames}
            onDelete={handleDeletePath}
          />
        </TabsContent>
        
        <TabsContent value="my-paths" className="mt-6">
          <AdminPathsList 
            paths={userPaths}
            getDifficultyColor={getDifficultyColor}
            getSurahNames={getSurahNames}
            getThemeNames={getThemeNames}
            onDelete={handleDeletePath}
          />
        </TabsContent>
        
        <TabsContent value="public-paths" className="mt-6">
          <AdminPathsList 
            paths={publicPaths}
            getDifficultyColor={getDifficultyColor}
            getSurahNames={getSurahNames}
            getThemeNames={getThemeNames}
            onDelete={handleDeletePath}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface AdminPathsListProps {
  paths: LearningPath[];
  getDifficultyColor: (difficulty: string) => string;
  getSurahNames: (surahIds: number[]) => string;
  getThemeNames: (themeIds: string[]) => string;
  onDelete: (pathId: string) => void;
}

const AdminPathsList: React.FC<AdminPathsListProps> = ({ 
  paths, 
  getDifficultyColor, 
  getSurahNames, 
  getThemeNames,
  onDelete
}) => {
  if (paths.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No learning paths found</p>;
  }
  
  return (
    <div className="space-y-4">
      {paths.map((path) => (
        <Card key={path.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="text-xl font-semibold mb-1">{path.name}</h3>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`/custom-learning?path=${path.id}`}>
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(path.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-2">{path.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mt-4">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(path.difficulty)}`}>
                      {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">
                      {path.user_id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-border mt-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {path.surahs.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Surahs:</p>
                        <p className="text-sm text-muted-foreground">
                          {getSurahNames(path.surahs)}
                        </p>
                      </div>
                    )}
                    
                    {path.themes.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Themes:</p>
                        <p className="text-sm text-muted-foreground">
                          {getThemeNames(path.themes)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${path.is_public ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {path.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminLearningPaths;
