
import React, { useState } from 'react';
import { Word } from '@/utils/vocabulary-types';
import { Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { shuffle } from '@/lib/utils';
import { toast } from 'sonner';

export type QuestionType = 'multiple-choice' | 'fill-in-blank';

interface TestingModeProps {
  word: Word;
  questionType: QuestionType;
  otherWords: Word[];
  onNext: () => void;
  onResult: (success: boolean) => void;
}

const TestingMode: React.FC<TestingModeProps> = ({
  word,
  questionType,
  otherWords,
  onNext,
  onResult,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Generate choices for multiple choice question
  const generateChoices = () => {
    // Use up to 3 other words
    const alternativeWords = otherWords.slice(0, 3);
    
    // Combine with the correct word and shuffle
    const allChoices = shuffle([
      word, 
      ...alternativeWords
    ]);
    
    return allChoices;
  };

  const choices = questionType === 'multiple-choice' ? generateChoices() : [];

  const handleSubmitAnswer = () => {
    if (questionType === 'multiple-choice') {
      if (!selectedAnswer) {
        toast.error("Please select an answer");
        return;
      }
      
      const success = selectedAnswer === word.id;
      setIsCorrect(success);
      setHasAnswered(true);
      
      // Report result after a delay
      setTimeout(() => {
        onResult(success);
        onNext();
        // Reset the state for next question
        setSelectedAnswer('');
        setHasAnswered(false);
        setIsCorrect(null);
      }, 1500);
    } 
    else if (questionType === 'fill-in-blank') {
      if (!textAnswer.trim()) {
        toast.error("Please enter an answer");
        return;
      }
      
      // Check for the exact match or close match (case insensitive)
      const normalizedAnswer = textAnswer.trim().toLowerCase();
      const normalizedCorrect = word.meaning.toLowerCase();
      
      // Simple matching - in a real app, you might want to use a more sophisticated
      // matching algorithm with fuzzy matching or considering synonyms
      const success = normalizedAnswer === normalizedCorrect;
      
      setIsCorrect(success);
      setHasAnswered(true);
      
      // Report result after a delay
      setTimeout(() => {
        onResult(success);
        onNext();
        // Reset the state for next question
        setTextAnswer('');
        setHasAnswered(false);
        setIsCorrect(null);
      }, 1500);
    }
  };

  return (
    <Card className={`
      glass-card w-full max-w-md mx-auto
      ${hasAnswered && isCorrect ? 'ring-2 ring-green-500' : ''}
      ${hasAnswered && !isCorrect ? 'ring-2 ring-red-500' : ''}
    `}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-medium text-primary/80 bg-primary/10 px-2 py-1 rounded-full">
              {word.level}
            </span>
            <span className="text-xs font-medium text-muted-foreground ml-2">
              {questionType === 'multiple-choice' ? 'Multiple Choice' : 'Fill in the Blank'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[160px] mb-6">
          <h2 className="arabic-text text-4xl my-4 text-center">{word.arabic}</h2>
          <p className="text-sm text-center text-muted-foreground mt-1">
            /{word.transliteration}/
          </p>
        </div>

        {questionType === 'multiple-choice' && (
          <div className="mt-4">
            <p className="text-sm mb-2">Select the correct meaning:</p>
            <RadioGroup 
              value={selectedAnswer} 
              onValueChange={setSelectedAnswer}
              className="space-y-2" 
              disabled={hasAnswered}
            >
              {choices.map((choice) => (
                <div 
                  key={choice.id} 
                  className={`
                    flex items-center space-x-2 p-3 rounded-md border 
                    ${hasAnswered && choice.id === word.id ? 'bg-green-50 border-green-200' : ''}
                    ${hasAnswered && selectedAnswer === choice.id && choice.id !== word.id ? 'bg-red-50 border-red-200' : ''}
                    ${!hasAnswered ? 'hover:bg-gray-50' : ''}
                  `}
                >
                  <RadioGroupItem value={choice.id} id={choice.id} />
                  <Label htmlFor={choice.id} className="flex-1 cursor-pointer">
                    {choice.meaning}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {questionType === 'fill-in-blank' && (
          <div className="mt-4">
            <Label htmlFor="answer" className="text-sm mb-2">
              What is the meaning of this word?
            </Label>
            <Input
              id="answer"
              placeholder="Enter the meaning..."
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              className="mt-1"
              disabled={hasAnswered}
            />
            {hasAnswered && (
              <div className={`mt-2 p-2 rounded-md ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {isCorrect ? (
                  <p>Correct!</p>
                ) : (
                  <p>The correct answer is: <strong>{word.meaning}</strong></p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          {!hasAnswered ? (
            <Button 
              className="w-full" 
              onClick={handleSubmitAnswer}
            >
              Check Answer
            </Button>
          ) : (
            <div className="flex items-center justify-center">
              {isCorrect ? (
                <Check className="h-6 w-6 text-green-500 mr-2" />
              ) : (
                <X className="h-6 w-6 text-red-500 mr-2" />
              )}
              <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestingMode;
