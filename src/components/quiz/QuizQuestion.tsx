
import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { QuizQuestion as QuizQuestionType } from '@/pages/EnhancedQuiz';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  timeLimit?: number;
  onAnswer: (answer: string, timeSpent: number) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  timeLimit,
  onAnswer
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime] = useState(new Date());

  // Reset everything when question changes
  useEffect(() => {
    console.log('Question changed, resetting state for question:', question.id);
    setSelectedAnswer('');
    setTextAnswer('');
    setHasAnswered(false);
    setIsCorrect(null);
    setShowFeedback(false);
    setTimeLeft(timeLimit);
  }, [question.id, timeLimit]);

  // Timer effect
  useEffect(() => {
    if (!timeLimit || hasAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, hasAnswered, question.id]);

  const handleTimeUp = useCallback(() => {
    if (!hasAnswered) {
      const timeSpent = (new Date().getTime() - startTime.getTime()) / 1000;
      setHasAnswered(true);
      setIsCorrect(false);
      setShowFeedback(true);
      
      // Auto-advance after showing feedback
      setTimeout(() => {
        onAnswer('', timeSpent);
      }, 2000);
    }
  }, [hasAnswered, startTime, onAnswer]);

  const checkAnswer = (answer: string): boolean => {
    return answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
  };

  const handleSubmit = () => {
    if (hasAnswered) return;

    const answer = question.type === 'fill-in-blank' ? textAnswer : selectedAnswer;
    if (!answer.trim()) return;

    const timeSpent = (new Date().getTime() - startTime.getTime()) / 1000;
    const correct = checkAnswer(answer);
    
    console.log('Submitting answer:', { answer, correct, timeSpent });
    
    setHasAnswered(true);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Show feedback for 2 seconds then advance
    setTimeout(() => {
      onAnswer(answer, timeSpent);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !hasAnswered) {
      handleSubmit();
    }
  };

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Question {questionNumber} of {totalQuestions}</span>
          {timeLimit && timeLeft !== undefined && (
            <span className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-500' : 'text-muted-foreground'}`}>
              <Clock className="h-3 w-3" />
              {timeLeft}s
            </span>
          )}
        </div>
        <Progress value={progress} className="h-2" />
        {timeLimit && timeLeft !== undefined && (
          <Progress 
            value={(timeLeft / timeLimit) * 100} 
            className={`h-1 ${timeLeft <= 10 ? 'opacity-100' : 'opacity-50'}`}
          />
        )}
      </div>

      {/* Question Card */}
      <Card className={`
        transition-all duration-300
        ${showFeedback && isCorrect ? 'ring-2 ring-green-500 bg-green-50/50' : ''}
        ${showFeedback && !isCorrect ? 'ring-2 ring-red-500 bg-red-50/50' : ''}
      `}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">{question.question}</span>
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
              {question.type.replace('-', ' ').split(' ').map(w => 
                w.charAt(0).toUpperCase() + w.slice(1)
              ).join(' ')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Word Display */}
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <div className="arabic-text text-4xl mb-2">{question.word.arabic}</div>
            <div className="text-sm text-muted-foreground">/{question.word.transliteration}/</div>
            <div className="text-xs text-muted-foreground mt-2">
              {question.word.level} • {question.word.partOfSpeech}
            </div>
          </div>

          {/* Answer Input */}
          {question.type === 'fill-in-blank' ? (
            <div className="space-y-3">
              <Label htmlFor="answer">Enter your answer:</Label>
              <Input
                id="answer"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type the meaning..."
                disabled={hasAnswered}
                onKeyPress={handleKeyPress}
                className="text-lg"
              />
            </div>
          ) : (
            <RadioGroup 
              value={selectedAnswer} 
              onValueChange={setSelectedAnswer}
              disabled={hasAnswered}
              className="space-y-3"
            >
              {question.options?.map((option, index) => (
                <div 
                  key={index}
                  className={`
                    flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all
                    ${showFeedback && option === question.correctAnswer ? 'bg-green-50 border-green-200 ring-1 ring-green-300' : ''}
                    ${showFeedback && selectedAnswer === option && option !== question.correctAnswer ? 'bg-red-50 border-red-200 ring-1 ring-red-300' : ''}
                    ${!hasAnswered ? 'hover:bg-muted/50 hover:border-primary/20' : ''}
                  `}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className={`flex-1 cursor-pointer ${
                      question.type === 'arabic-to-meaning' || question.type === 'meaning-to-arabic' ? 
                      (option === question.word.arabic ? 'arabic-text text-lg' : '') : ''
                    }`}
                  >
                    {option}
                  </Label>
                  {showFeedback && option === question.correctAnswer && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {showFeedback && selectedAnswer === option && option !== question.correctAnswer && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="flex items-center gap-2 font-medium mb-2">
                {isCorrect ? (
                  <>
                    <Check className="h-4 w-4" />
                    Correct! Well done!
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Incorrect
                  </>
                )}
              </div>
              {!isCorrect && (
                <p className="mb-2">
                  The correct answer is: <strong>{question.correctAnswer}</strong>
                </p>
              )}
              <div className="text-sm space-y-1">
                <p><strong>Root:</strong> {question.word.root}</p>
                <p><strong>Meaning:</strong> {question.word.meaning}</p>
                {question.word.tags.length > 0 && (
                  <p><strong>Tags:</strong> {question.word.tags.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!hasAnswered && (
            <Button 
              onClick={handleSubmit}
              disabled={
                (question.type === 'fill-in-blank' && !textAnswer.trim()) ||
                (question.type !== 'fill-in-blank' && !selectedAnswer)
              }
              className="w-full"
              size="lg"
            >
              Submit Answer
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {/* Loading message during feedback */}
          {showFeedback && (
            <div className="text-center text-sm text-muted-foreground">
              {questionNumber === totalQuestions ? 'Finishing quiz...' : 'Loading next question...'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizQuestion;
