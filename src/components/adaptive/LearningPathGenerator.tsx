
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Star, Target, BookOpen, TrendingUp } from 'lucide-react';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface LearningPath {
  id: string;
  pathName: string;
  targetCollections: string[];
  recommendedWords: string[];
  completedWords: string[];
  currentFocusArea: string;
  estimatedCompletionTime: number;
  aiConfidenceScore: number;
  isActive: boolean;
}

interface PathMilestone {
  id: string;
  title: string;
  description: string;
  wordsCount: number;
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
  isCurrent: boolean;
}

const LearningPathGenerator: React.FC = () => {
  const { session } = useAuth();
  const { adaptiveLearningData } = useAdaptiveLearning();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [generatedPath, setGeneratedPath] = useState<{
    path: LearningPath;
    milestones: PathMilestone[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // AI-powered learning path generation
  const generatePersonalizedPath = async () => {
    if (!session?.user?.id || !adaptiveLearningData) return;

    setLoading(true);
    try {
      // Analyze user's current state
      const userLevel = adaptiveLearningData.currentDifficulty;
      const weakAreas = adaptiveLearningData.weakAreas;
      const learningVelocity = adaptiveLearningData.learningVelocity;

      // Generate path based on AI analysis
      const pathName = `Personalized Journey - ${userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}`;
      
      // Create milestone structure
      const milestones: PathMilestone[] = [];
      
      // Milestone 1: Foundation (if beginner or has weak areas)
      if (userLevel === 'beginner' || weakAreas.length > 0) {
        milestones.push({
          id: 'foundation',
          title: 'Foundation Building',
          description: 'Master essential vocabulary and build confidence',
          wordsCount: 50,
          estimatedHours: 8,
          difficulty: 'beginner',
          isCompleted: false,
          isCurrent: true
        });
      }

      // Milestone 2: Core vocabulary
      milestones.push({
        id: 'core',
        title: 'Core Vocabulary',
        description: 'Learn the most frequently used words',
        wordsCount: 100,
        estimatedHours: 15,
        difficulty: userLevel === 'beginner' ? 'beginner' : 'intermediate',
        isCompleted: false,
        isCurrent: milestones.length === 0
      });

      // Milestone 3: Specialized areas
      if (weakAreas.length > 0) {
        milestones.push({
          id: 'specialized',
          title: 'Weak Areas Focus',
          description: `Strengthen ${weakAreas.join(', ')} collections`,
          wordsCount: weakAreas.length * 25,
          estimatedHours: weakAreas.length * 6,
          difficulty: 'intermediate',
          isCompleted: false,
          isCurrent: milestones.length === 1
        });
      }

      // Milestone 4: Advanced mastery (if intermediate or advanced)
      if (userLevel !== 'beginner') {
        milestones.push({
          id: 'mastery',
          title: 'Advanced Mastery',
          description: 'Perfect pronunciation and complex vocabulary',
          wordsCount: 75,
          estimatedHours: 20,
          difficulty: 'advanced',
          isCompleted: false,
          isCurrent: milestones.every(m => m.isCompleted)
        });
      }

      // Calculate total estimated time based on learning velocity
      const totalWords = milestones.reduce((sum, m) => sum + m.wordsCount, 0);
      const estimatedWeeks = learningVelocity > 0 ? Math.ceil(totalWords / learningVelocity) : 12;
      const estimatedHours = estimatedWeeks * 2; // Assume 2 hours per week

      // Create the learning path
      const newPath: LearningPath = {
        id: `path_${Date.now()}`,
        pathName,
        targetCollections: ['general', ...weakAreas],
        recommendedWords: adaptiveLearningData.nextRecommendations,
        completedWords: [],
        currentFocusArea: milestones.find(m => m.isCurrent)?.title || 'Getting Started',
        estimatedCompletionTime: estimatedHours,
        aiConfidenceScore: adaptiveLearningData.confidenceScore,
        isActive: false
      };

      setGeneratedPath({ path: newPath, milestones });

    } catch (error) {
      console.error('Error generating learning path:', error);
      toast.error('Failed to generate learning path');
    } finally {
      setLoading(false);
    }
  };

  // Save learning path using existing learning_paths table
  const saveLearningPath = async (path: LearningPath) => {
    if (!session?.user?.id) return;

    try {
      // Store learning paths using localStorage until database migration is complete
      const existingPaths = JSON.parse(localStorage.getItem(`learning_paths_${session.user.id}`) || '[]');
      const pathWithTimestamp = {
        ...path,
        id: `path_${Date.now()}`,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      // Deactivate other paths
      const updatedPaths = existingPaths.map((p: LearningPath) => ({ ...p, isActive: false }));
      updatedPaths.push(pathWithTimestamp);
      
      localStorage.setItem(`learning_paths_${session.user.id}`, JSON.stringify(updatedPaths));

      toast.success('Learning path activated!');
      loadLearningPaths();
      setGeneratedPath(null);

    } catch (error) {
      console.error('Error saving learning path:', error);
      toast.error('Failed to save learning path');
    }
  };

  // Load existing learning paths from localStorage
  const loadLearningPaths = () => {
    if (!session?.user?.id) return;

    try {
      const storedPaths = JSON.parse(localStorage.getItem(`learning_paths_${session.user.id}`) || '[]');
      setLearningPaths(storedPaths);
    } catch (error) {
      console.error('Error loading learning paths:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadLearningPaths();
    }
  }, [session?.user?.id]);

  const activePath = learningPaths.find(path => path.isActive);

  return (
    <div className="space-y-6">
      {/* Current Active Path */}
      {activePath && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Active Learning Path
              <Badge className="ml-auto">
                {Math.round(activePath.aiConfidenceScore * 100)}% AI Match
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{activePath.pathName}</h3>
              <p className="text-muted-foreground">
                Current Focus: {activePath.currentFocusArea}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                <div className="text-sm font-medium">
                  {activePath.completedWords.length} / {activePath.recommendedWords.length}
                </div>
                <div className="text-xs text-muted-foreground">Words Completed</div>
              </div>
              
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-1 text-green-500" />
                <div className="text-sm font-medium">
                  ~{activePath.estimatedCompletionTime}h
                </div>
                <div className="text-xs text-muted-foreground">Estimated Time</div>
              </div>
              
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                <div className="text-sm font-medium">
                  {activePath.targetCollections.length}
                </div>
                <div className="text-xs text-muted-foreground">Focus Areas</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>
                  {Math.round((activePath.completedWords.length / Math.max(activePath.recommendedWords.length, 1)) * 100)}%
                </span>
              </div>
              <Progress 
                value={(activePath.completedWords.length / Math.max(activePath.recommendedWords.length, 1)) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate New Path */}
      {!activePath && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Path Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Let our AI analyze your learning patterns and create a personalized learning journey tailored just for you.
            </p>
            
            {adaptiveLearningData && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="text-sm font-medium">Based on your data:</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• Current level: {adaptiveLearningData.currentDifficulty}</div>
                  <div>• Learning velocity: {adaptiveLearningData.learningVelocity} words/week</div>
                  <div>• Focus areas: {adaptiveLearningData.weakAreas.length > 0 ? adaptiveLearningData.weakAreas.join(', ') : 'All areas'}</div>
                </div>
              </div>
            )}

            <Button 
              onClick={generatePersonalizedPath}
              disabled={loading || !adaptiveLearningData}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate AI Learning Path'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Path Preview */}
      {generatedPath && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Your Personalized Learning Path
              <Badge variant="secondary" className="ml-auto">
                {Math.round(generatedPath.path.aiConfidenceScore * 100)}% AI Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">{generatedPath.path.pathName}</h3>
              <p className="text-muted-foreground">
                Estimated completion: {generatedPath.path.estimatedCompletionTime} hours
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Learning Milestones:</h4>
              {generatedPath.milestones.map((milestone, index) => (
                <div key={milestone.id} className="space-y-3">
                  <div className={`p-4 rounded-lg border ${
                    milestone.isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{milestone.title}</h5>
                      <Badge variant={milestone.isCurrent ? 'default' : 'outline'}>
                        {milestone.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {milestone.description}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{milestone.wordsCount} words</span>
                      <span>~{milestone.estimatedHours} hours</span>
                    </div>
                  </div>
                  {index < generatedPath.milestones.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => saveLearningPath(generatedPath.path)}
                className="flex-1"
              >
                Activate This Path
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setGeneratedPath(null)}
                className="flex-1"
              >
                Generate Different Path
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Paths */}
      {learningPaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Path History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {learningPaths.map(path => (
                <div key={path.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{path.pathName}</div>
                      <div className="text-sm text-muted-foreground">
                        {path.completedWords.length} of {path.recommendedWords.length} words completed
                      </div>
                    </div>
                    <Badge variant={path.isActive ? 'default' : 'secondary'}>
                      {path.isActive ? 'Active' : 'Completed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningPathGenerator;
