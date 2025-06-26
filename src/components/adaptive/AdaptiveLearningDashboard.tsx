
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Target, Zap, BookOpen, Clock } from 'lucide-react';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';

interface AdaptiveLearningDashboardProps {
  onStartAdaptiveSession?: (sessionType: 'practice' | 'quiz' | 'review') => void;
}

const AdaptiveLearningDashboard: React.FC<AdaptiveLearningDashboardProps> = ({
  onStartAdaptiveSession
}) => {
  const { 
    adaptiveLearningData, 
    currentSession, 
    loading,
    startAdaptiveSession 
  } = useAdaptiveLearning();

  const handleStartSession = async (sessionType: 'practice' | 'quiz' | 'review') => {
    const session = await startAdaptiveSession(sessionType);
    if (session && onStartAdaptiveSession) {
      onStartAdaptiveSession(sessionType);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">AI is analyzing your learning patterns...</p>
        </CardContent>
      </Card>
    );
  }

  if (!adaptiveLearningData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Start practicing to enable AI-powered recommendations!</p>
        </CardContent>
      </Card>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Learning Assistant
            <Badge variant="secondary" className="ml-auto">
              {Math.round(adaptiveLearningData.confidenceScore * 100)}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">{adaptiveLearningData.currentDifficulty}</div>
              <div className="text-sm text-muted-foreground">Optimal Difficulty</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{adaptiveLearningData.learningVelocity}</div>
              <div className="text-sm text-muted-foreground">Words/Week</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{adaptiveLearningData.nextRecommendations.length}</div>
              <div className="text-sm text-muted-foreground">Smart Picks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Session Status */}
      {currentSession && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Active Learning Session
              <Badge className={getDifficultyColor(currentSession.initialDifficulty)}>
                {currentSession.sessionType}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>AI Confidence</span>
                  <span>{Math.round(currentSession.confidenceScore * 100)}%</span>
                </div>
                <Progress value={currentSession.confidenceScore * 100} className="h-2" />
              </div>
              <div className="text-sm text-muted-foreground">
                Difficulty: {currentSession.initialDifficulty} → {currentSession.finalDifficulty}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adaptive Session Options */}
      {!currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              AI-Powered Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => handleStartSession('practice')}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <Brain className="h-6 w-6" />
                <span className="font-medium">Smart Practice</span>
                <span className="text-xs text-muted-foreground">
                  AI-selected words for optimal learning
                </span>
              </Button>
              
              <Button
                onClick={() => handleStartSession('review')}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <TrendingUp className="h-6 w-6" />
                <span className="font-medium">Adaptive Review</span>
                <span className="text-xs text-muted-foreground">
                  Focus on weak areas with spaced repetition
                </span>
              </Button>
              
              <Button
                onClick={() => handleStartSession('quiz')}
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
              >
                <Target className="h-6 w-6" />
                <span className="font-medium">Challenge Mode</span>
                <span className="text-xs text-muted-foreground">
                  Dynamic difficulty adjustment
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weak Areas & Recommendations */}
      {adaptiveLearningData.weakAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adaptiveLearningData.weakAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{area}</div>
                    <div className="text-sm text-muted-foreground">
                      AI recommends additional practice
                    </div>
                  </div>
                  <Badge variant="outline">Focus Area</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Recommendations Preview */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-3">
              Based on your learning patterns, the AI suggests focusing on these areas:
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {adaptiveLearningData.nextRecommendations.slice(0, 6).map((rec, index) => (
                <Badge key={index} variant="secondary" className="justify-center">
                  {rec.includes('weak_area') ? '🎯' : rec.includes('new_') ? '🆕' : '🔄'} 
                  {rec.split('_').pop()?.slice(0, 8)}...
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdaptiveLearningDashboard;
