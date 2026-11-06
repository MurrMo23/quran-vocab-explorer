import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, X, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { isAnswerCorrect, type TypedQuizQuestion } from './quiz-utils';

interface QuizQuestionProps {
  question: TypedQuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  /** Seconds per question. Omit for untimed questions. */
  timeLimit?: number;
  /** Called once per question after feedback. `elapsedMs` is real answer time; empty answer = timed out. */
  onAnswer: (answer: string, elapsedMs: number, isCorrect: boolean) => void;
}

const FEEDBACK_MS = 1800;

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, questionNumber, totalQuestions, timeLimit, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | undefined>(timeLimit);
  const [result, setResult] = useState<{ answer: string; correct: boolean; elapsedMs: number } | null>(null);
  const startedAt = useRef(Date.now());
  const advanceTimer = useRef<number | null>(null);
  const onAnswerRef = useRef(onAnswer);
  onAnswerRef.current = onAnswer;
  const typed = question.type === 'fill-in-blank';

  // Reset when the question changes.
  useEffect(() => {
    setSelectedAnswer('');
    setTextAnswer('');
    setResult(null);
    setTimeLeft(timeLimit);
    startedAt.current = Date.now();
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    };
  }, [question.id, timeLimit]);

  const finish = useCallback(
    (answer: string) => {
      if (result) return;
      const elapsedMs = Date.now() - startedAt.current;
      const correct = isAnswerCorrect(answer, question.correctAnswer, typed);
      setResult({ answer, correct, elapsedMs });
      advanceTimer.current = window.setTimeout(() => {
        advanceTimer.current = null;
        onAnswerRef.current(answer, elapsedMs, correct);
      }, correct ? FEEDBACK_MS : FEEDBACK_MS * 1.5);
    },
    [result, question.correctAnswer, typed],
  );

  // Countdown (timed mode only).
  useEffect(() => {
    if (!timeLimit || result) return;
    const deadline = startedAt.current + timeLimit * 1000;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
        finish('');
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [timeLimit, result, question.id, finish]);

  const handleSubmit = () => {
    const answer = typed ? textAnswer : selectedAnswer;
    if (!answer.trim()) return;
    finish(answer);
  };

  const skipFeedback = () => {
    if (!result || !advanceTimer.current) return;
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    onAnswerRef.current(result.answer, result.elapsedMs, result.correct);
  };

  const showFeedback = result !== null;
  const isCorrect = result?.correct ?? null;
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>
            Question {questionNumber} of {totalQuestions}
          </span>
          {timeLimit && timeLeft !== undefined && (
            <span className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-500' : 'text-muted-foreground'}`}>
              <Clock className="h-3 w-3" />
              {timeLeft}s
            </span>
          )}
        </div>
        <Progress value={progress} className="h-2" />
        {timeLimit && timeLeft !== undefined && (
          <Progress value={(timeLeft / timeLimit) * 100} className={`h-1 ${timeLeft <= 10 ? 'opacity-100' : 'opacity-50'}`} />
        )}
      </div>

      <Card
        className={`transition-all duration-300 ${
          showFeedback && isCorrect ? 'bg-green-50/50 ring-2 ring-green-500 dark:bg-green-950/20' : ''
        } ${showFeedback && !isCorrect ? 'bg-red-50/50 ring-2 ring-red-500 dark:bg-red-950/20' : ''}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="text-lg">{question.question}</span>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-sm text-primary">
              {question.type
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted/50 p-6 text-center">
            {question.type === 'meaning-to-arabic' ? (
              <div className="text-2xl font-semibold">{question.word.meaning}</div>
            ) : (
              <>
                <div className="arabic-text mb-2 text-4xl" lang="ar" dir="rtl">
                  {question.word.arabic}
                </div>
                <div className="text-sm text-muted-foreground">/{question.word.transliteration}/</div>
              </>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              {question.word.level} • {question.word.partOfSpeech}
            </div>
          </div>

          {typed ? (
            <div className="space-y-3">
              <Label htmlFor="answer">Enter your answer:</Label>
              <Input
                id="answer"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type the meaning…"
                disabled={showFeedback}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
                className="text-lg"
                autoComplete="off"
                autoFocus
              />
            </div>
          ) : (
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showFeedback} className="space-y-3">
              {question.options.map((option, index) => (
                <div
                  key={option}
                  className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-all ${
                    showFeedback && option === question.correctAnswer
                      ? 'border-green-200 bg-green-50 ring-1 ring-green-300 dark:bg-green-950/20'
                      : ''
                  } ${
                    showFeedback && selectedAnswer === option && option !== question.correctAnswer
                      ? 'border-red-200 bg-red-50 ring-1 ring-red-300 dark:bg-red-950/20'
                      : ''
                  } ${!showFeedback ? 'hover:border-primary/20 hover:bg-muted/50' : ''}`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className={`flex-1 cursor-pointer ${question.type === 'meaning-to-arabic' ? 'arabic-text text-lg' : ''}`}
                  >
                    {option}
                  </Label>
                  {showFeedback && option === question.correctAnswer && <Check className="h-4 w-4 text-green-500" />}
                  {showFeedback && selectedAnswer === option && option !== question.correctAnswer && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </RadioGroup>
          )}

          {showFeedback && (
            <div
              className={`rounded-lg p-4 ${
                isCorrect ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
              }`}
            >
              <div className="mb-2 flex items-center gap-2 font-medium">
                {isCorrect ? (
                  <>
                    <Check className="h-4 w-4" />
                    Correct!
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    {result?.answer ? 'Incorrect' : "Time's up"}
                  </>
                )}
              </div>
              {!isCorrect && (
                <p className="mb-2">
                  The correct answer is: <strong>{question.correctAnswer}</strong>
                </p>
              )}
              <div className="space-y-1 text-sm">
                {question.word.root && (
                  <p>
                    <strong>Root:</strong> {question.word.root}
                  </p>
                )}
                <p>
                  <strong>Meaning:</strong> {question.word.meaning}
                </p>
              </div>
            </div>
          )}

          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={typed ? !textAnswer.trim() : !selectedAnswer}
              className="w-full"
              size="lg"
            >
              Submit Answer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" onClick={skipFeedback} className="w-full">
              {questionNumber === totalQuestions ? 'See results' : 'Next question'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizQuestion;
