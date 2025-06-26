
import React from 'react';
import { Trophy, Target, Clock, TrendingUp, RotateCcw, Home, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { QuizResult, QuizQuestion } from '@/pages/Quiz';
import { toast } from 'sonner';

interface QuizResultsProps {
  result: QuizResult;
  questions: QuizQuestion[];
  onRestart: () => void;
  onBackToDashboard: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  questions,
  onRestart,
  onBackToDashboard
}) => {
  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: 'Excellent', color: 'bg-green-500', emoji: '🏆' };
    if (accuracy >= 80) return { level: 'Very Good', color: 'bg-blue-500', emoji: '⭐' };
    if (accuracy >= 70) return { level: 'Good', color: 'bg-yellow-500', emoji: '👍' };
    if (accuracy >= 60) return { level: 'Fair', color: 'bg-orange-500', emoji: '📚' };
    return { level: 'Needs Improvement', color: 'bg-red-500', emoji: '💪' };
  };

  const performance = getPerformanceLevel(result.accuracy);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const shareResults = () => {
    const text = `I just completed a quiz with ${result.accuracy.toFixed(1)}% accuracy! ${result.correctAnswers}/${result.totalQuestions} correct answers.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Quiz Results',
        text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Results copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Results Card */}
      <Card className="text-center">
        <CardHeader>
          <div className="text-6xl mb-4">{performance.emoji}</div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <p className="text-muted-foreground">
            You scored {result.correctAnswers} out of {result.totalQuestions} questions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Accuracy Circle */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground/20"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${result.accuracy}, 100`}
                className={performance.color.replace('bg-', 'text-')}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{result.accuracy.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>

          <Badge variant="secondary" className="text-lg px-4 py-2">
            {performance.level}
          </Badge>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
                <p className="text-2xl font-bold text-green-500">{result.correctAnswers}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{formatTime(result.totalTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. per Question</p>
                <p className="text-2xl font-bold">{formatTime(result.averageTimePerQuestion)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Breakdown */}
      {Object.keys(result.difficultyBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance by Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(result.difficultyBreakdown).map(([level, stats]) => {
              const percentage = (stats.correct / stats.total) * 100;
              return (
                <div key={level} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium">{level}</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.correct}/{stats.total} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {questions.map((question, index) => (
              <div 
                key={question.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  question.isCorrect ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    question.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium arabic-text">{question.word.arabic}</p>
                    <p className="text-xs text-muted-foreground">{question.word.meaning}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    question.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {question.isCorrect ? 'Correct' : 'Incorrect'}
                  </p>
                  {question.timeSpent && (
                    <p className="text-xs text-muted-foreground">
                      {formatTime(question.timeSpent)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRestart} variant="outline" className="flex-1 sm:flex-none">
          <RotateCcw className="h-4 w-4 mr-2" />
          Take Another Quiz
        </Button>
        
        <Button onClick={shareResults} variant="outline" className="flex-1 sm:flex-none">
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
        
        <Button onClick={onBackToDashboard} className="flex-1 sm:flex-none">
          <Home className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Recommendations */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Recommendations for Improvement</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            {result.accuracy < 70 && (
              <p>• Consider reviewing the words you missed before attempting another quiz</p>
            )}
            {result.averageTimePerQuestion > 20 && (
              <p>• Try to answer more quickly - practice will help improve your response time</p>
            )}
            {Object.values(result.difficultyBreakdown).some(level => level.correct / level.total < 0.6) && (
              <p>• Focus on practicing words from difficulty levels where you scored below 60%</p>
            )}
            <p>• Regular practice will help improve both accuracy and speed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;
