
import React, { useState, useEffect } from 'react';
import { Word } from '@/utils/vocabulary-types';
import { Check, X, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { shuffle } from '@/lib/utils';
import { toast } from 'sonner';

export type QuestionType = 'multiple-choice' | 'fill-in-blank';

interface EnhancedTestingModeProps {
  word: Word;
  questionType: QuestionType;
  otherWords: Word[];
  onNext: () => void;
  onResult: (success: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
  timeLimit?: number;
}

const EnhancedTestingMode: React.FC<EnhancedTestingModeProps> = ({
  word,
  questionType,
  otherWords,
  onNext,
  onResult,
  questionNumber,
  totalQuestions,
  timeLimit = 30,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [startTime] = useState(new Date());

  // Reset state when word changes
  useEffect(() => {
    setSelectedAnswer('');
    setTextAnswer('');
    setHasAnswered(false);
    setIsCorrect(null);
    setShowFeedback(false);
    setTimeLeft(timeLimit);
  }, [word.id, timeLimit]);

  // Timer effect
  useEffect(() => {
    if (!timeLimit || hasAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, hasAnswered, word.id]);

  const handleTimeUp = () => {
    if (!hasAnswered) {
      setHasAnswered(true);
      setIsCorrect(false);
      setShowFeedback(true);
      
      setTimeout(() => {
        onResult(false);
        onNext();
      }, 2000);
    }
  };

  // Generate choices for multiple choice question
  const generateChoices = () => {
    const alternativeWords = otherWords.slice(0, 3);
    const allChoices = shuffle([word, ...alternativeWords]).map(w => ({
      id: w.id,
      text: w.meaning
    }));
    return allChoices;
  };

  const choices = questionType === 'multiple-choice' ? generateChoices() : [];

  const handleSubmitAnswer = () => {
    if (hasAnswered) return;

    let answer = '';
    let success = false;

    if (questionType === 'multiple-choice') {
      if (!selectedAnswer) {
        toast.error("Please select an answer");
        return;
      }
      answer = selectedAnswer;
      success = selectedAnswer === word.id;
    } else if (questionType === 'fill-in-blank') {
      if (!textAnswer.trim()) {
        toast.error("Please enter an answer");
        return;
      }
      answer = textAnswer.trim();
      success = answer.toLowerCase() === word.meaning.toLowerCase();
    }
    
    setIsCorrect(success);
    setHasAnswered(true);
    setShowFeedback(true);
    
    // Show feedback for 2 seconds then continue
    setTimeout(() => {
      onResult(success);
      onNext();
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !hasAnswered) {
      handleSubmitAnswer();
    }
  };

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Question {questionNumber} of {totalQuestions}</span>
          <span className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-500' : 'text-muted-foreground'}`}>
            <Clock className="h-3 w-3" />
            {timeLeft}s
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <Progress 
          value={(timeLeft / timeLimit) * 100} 
          className={`h-1 ${timeLeft <= 10 ? 'opacity-100' : 'opacity-50'}`}
        />
      </div>

      <Card className={`
        transition-all duration-300
        ${showFeedback && isCorrect ? 'ring-2 ring-green-500 bg-green-50/50' : ''}
        ${showFeedback && !isCorrect ? 'ring-2 ring-red-500 bg-red-50/50' : ''}
      `}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">
              {questionType === 'multiple-choice' ? 'Select the correct meaning:' : 'What does this word mean?'}
            </span>
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
              {questionType === 'multiple-choice' ? 'Multiple Choice' : 'Fill in the Blank'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Word Display */}
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <div className="arabic-text text-4xl mb-2">{word.arabic}</div>
            <div className="text-sm text-muted-foreground">/{word.transliteration}/</div>
            <div className="text-xs text-muted-foreground mt-2">
              {word.level} • {word.partOfSpeech}
            </div>
          </div>

          {/* Answer Options */}
          {questionType === 'multiple-choice' ? (
            <RadioGroup 
              value={selectedAnswer} 
              onValueChange={setSelectedAnswer}
              className="space-y-3" 
              disabled={hasAnswered}
            >
              {choices.map((choice, index) => (
                <div 
                  key={choice.id} 
                  className={`
                    flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all
                    ${showFeedback && choice.id === word.id ? 'bg-green-50 border-green-200 ring-1 ring-green-300' : ''}
                    ${showFeedback && selectedAnswer === choice.id && choice.id !== word.id ? 'bg-red-50 border-red-200 ring-1 ring-red-300' : ''}
                    ${!hasAnswered ? 'hover:bg-muted/50 hover:border-primary/20' : ''}
                  `}
                >
                  <RadioGroupItem value={choice.id} id={choice.id} />
                  <Label htmlFor={choice.id} className="flex-1 cursor-pointer">
                    {choice.text}
                  </Label>
                  {showFeedback && choice.id === word.id && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {showFeedback && selectedAnswer === choice.id && choice.id !== word.id && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="answer">Enter the meaning:</Label>
              <Input
                id="answer"
                placeholder="Type the meaning..."
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={hasAnswered}
                onKeyPress={handleKeyPress}
                className="text-lg"
              />
            </div>
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
                  The correct answer is: <strong>{word.meaning}</strong>
                </p>
              )}
              <div className="text-sm space-y-1">
                <p><strong>Root:</strong> {word.root}</p>
                {word.tags.length > 0 && (
                  <p><strong>Tags:</strong> {word.tags.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!hasAnswered && (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={
                (questionType === 'fill-in-blank' && !textAnswer.trim()) ||
                (questionType === 'multiple-choice' && !selectedAnswer)
              }
              className="w-full"
              size="lg"
            >
              Submit Answer
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {/* Loading message */}
          {showFeedback && (
            <div className="text-center text-sm text-muted-foreground">
              {questionNumber === totalQuestions ? 'Completing practice...' : 'Loading next question...'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTestingMode;
