import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Target, RotateCcw } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getWordsByCollection, Collection, Word, getAllCollections } from '@/utils/vocabulary';
import PreviewMode from '@/components/PreviewMode';
import { Helmet } from 'react-helmet';

// Export types for components to use
export type QuestionType = 'multiple-choice' | 'fill-in-blank' | 'arabic-to-meaning' | 'meaning-to-arabic';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'mixed';

export interface QuizSettings {
  wordCount: number;
  difficulty: DifficultyLevel;
  collectionId?: string;
  questionTypes: QuestionType[];
  timeLimit?: number;
}

export interface QuizResult {
  score: number;
  accuracy: number;
  totalTime: number;
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTimePerQuestion: number;
  difficultyBreakdown: Record<string, { correct: number; total: number }>;
  weakAreas: string[];
  achievements: any[];
  nextRecommendations: QuestionType[];
}

export interface QuizQuestion {
  id: string;
  word: Word;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  timeSpent?: number;
  isCorrect?: boolean;
}

const Quiz = () => {
  const { session } = useAuth();
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const allCollections = getAllCollections();
    setCollections(allCollections);
    if (allCollections.length > 0) {
      setSelectedCollection(allCollections[0].id);
    }
  }, []);

  const generateQuestions = (words: Word[]): QuizQuestion[] => {
    // For preview mode, limit to 3 questions for non-logged in users
    const wordsToUse = !session ? words.slice(0, 3) : words.slice(0, 10);
    
    return wordsToUse.map((word, index) => {
      const correctAnswer = word.meaning;
      const otherWords = words.filter(w => w.id !== word.id);
      const wrongAnswers = otherWords
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.meaning);
      
      const options = [correctAnswer, ...wrongAnswers]
        .sort(() => Math.random() - 0.5);

      return {
        id: `question-${index}-${word.id}`,
        word,
        options,
        correctAnswer
      };
    });
  };

  const startQuiz = () => {
    if (selectedCollection) {
      const collectionWords = getWordsByCollection(selectedCollection);
      const quizQuestions = generateQuestions(collectionWords);
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizStarted(true);
      setShowResult(false);
      setSelectedAnswer('');
      setIsCorrect(null);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer('');
        setShowResult(false);
        setIsCorrect(null);
      } else {
        // Quiz complete
        setQuizStarted(false);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer('');
    setShowResult(false);
    setIsCorrect(null);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const quizContent = (
    <>
      <Helmet>
        <title>Arabic Vocabulary Quiz | Test Your Knowledge</title>
        <meta name="description" content="Test your Arabic vocabulary knowledge with interactive quizzes and track your progress." />
      </Helmet>

      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Quiz Mode</h1>
          <p className="text-muted-foreground">
            {session 
              ? "Test your Arabic vocabulary knowledge with interactive quizzes" 
              : "Try our quiz mode with a preview of available questions"
            }
          </p>
        </div>

        {!quizStarted ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Choose a Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Collection:</label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name} ({getWordsByCollection(collection.id).length} words)
                    </option>
                  ))}
                </select>
              </div>
              
              {!session && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Preview mode: You can try 3 sample questions from this collection.
                  </p>
                </div>
              )}
              
              <Button
                onClick={startQuiz}
                disabled={!selectedCollection}
                className="w-full"
                size="lg"
              >
                Start Quiz ({!session ? '3' : '10'} questions)
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Score: {score}/{questions.length}</span>
                  <Button variant="outline" size="sm" onClick={resetQuiz}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {currentQuestion && (
              <Card className={`mb-4 ${
                isCorrect === true ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
                isCorrect === false ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
                ''
              }`}>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-2 text-primary">
                      {currentQuestion.word.arabic}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {currentQuestion.word.transliteration}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showResult}
                        className={`w-full p-4 text-left border rounded-lg transition-all ${
                          selectedAnswer === option
                            ? showResult
                              ? option === currentQuestion.correctAnswer
                                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                              : 'border-primary bg-primary/10'
                            : showResult && option === currentQuestion.correctAnswer
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {!showResult && selectedAnswer && (
                    <Button onClick={submitAnswer} className="w-full" size="lg">
                      Submit Answer
                    </Button>
                  )}

                  {showResult && (
                    <div className="text-center">
                      {isCorrect ? (
                        <div className="text-green-600 font-medium">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                          Correct! Well done.
                        </div>
                      ) : (
                        <div className="text-red-600 font-medium">
                          <XCircle className="h-8 w-8 mx-auto mb-2" />
                          The correct answer was: {currentQuestion.correctAnswer}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentQuestionIndex === questions.length - 1 && showResult && (
              <Card className="mt-6">
                <CardContent className="p-6 text-center">
                  <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                  <p className="text-lg mb-4">
                    Final Score: {score} out of {questions.length}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Accuracy: {Math.round((score / questions.length) * 100)}%
                  </p>
                  <Button onClick={startQuiz} size="lg">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );

  // Show preview mode for non-logged in users
  if (!session) {
    return <PreviewMode type="quiz">{quizContent}</PreviewMode>;
  }

  return quizContent;
};

export default Quiz;
