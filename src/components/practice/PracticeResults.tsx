
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Clock, TrendingUp, RotateCcw, Home } from 'lucide-react';
import { SessionResults } from './PracticeSessionManager';

interface PracticeResultsProps {
  results: SessionResults;
  onRestartSession: () => void;
  onBackToDashboard: () => void;
  onReviewMistakes: () => void;
}

const PracticeResults: React.FC<PracticeResultsProps> = ({
  results,
  onRestartSession,
  onBackToDashboard,
  onReviewMistakes
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (accuracy >= 80) return { level: 'Great', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (accuracy >= 70) return { level: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Keep Practicing', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const performance = getPerformanceLevel(results.accuracy);
  const averageTimePerWord = results.timeSpent / results.totalWords;

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Header */}
      <Card className={`${performance.bg} border-2`}>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Trophy className={`h-12 w-12 mx-auto ${performance.color}`} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Practice Session Complete!</h2>
          <p className={`text-lg ${performance.color} font-semibold`}>
            {performance.level}
          </p>
        </CardContent>
      </Card>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{results.accuracy.toFixed(1)}%</div>
            <Progress value={results.accuracy} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {results.correctCount} correct out of {results.totalWords}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{formatTime(results.timeSpent)}</div>
            <p className="text-sm text-muted-foreground">
              Avg: {averageTimePerWord.toFixed(1)}s per word
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{results.totalWords}</div>
            <p className="text-sm text-muted-foreground">Words reviewed</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Session Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.correctCount}</div>
              <div className="text-sm text-green-700">Correct Answers</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{results.incorrectCount}</div>
              <div className="text-sm text-red-700">Need More Practice</div>
            </div>
          </div>

          {results.difficultWords.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Words to Review:</h4>
              <div className="flex flex-wrap gap-2">
                {results.difficultWords.slice(0, 10).map((wordId, index) => (
                  <Badge key={index} variant="outline" className="text-red-600">
                    Word #{wordId}
                  </Badge>
                ))}
                {results.difficultWords.length > 10 && (
                  <Badge variant="outline">
                    +{results.difficultWords.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {results.accuracy >= 90 && (
              <Badge className="bg-yellow-100 text-yellow-800">
                🏆 Accuracy Master
              </Badge>
            )}
            {results.totalWords >= 50 && (
              <Badge className="bg-blue-100 text-blue-800">
                📚 Study Marathon
              </Badge>
            )}
            {averageTimePerWord <= 15 && (
              <Badge className="bg-green-100 text-green-800">
                ⚡ Speed Learner
              </Badge>
            )}
            {results.correctCount >= 20 && (
              <Badge className="bg-purple-100 text-purple-800">
                🎯 Sharp Shooter
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onRestartSession} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Practice Again
        </Button>
        
        {results.difficultWords.length > 0 && (
          <Button onClick={onReviewMistakes} variant="outline" className="flex-1">
            Review Mistakes
          </Button>
        )}
        
        <Button onClick={onBackToDashboard} variant="outline" className="flex-1">
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PracticeResults;
