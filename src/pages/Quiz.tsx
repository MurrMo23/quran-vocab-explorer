
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Settings, Trophy, Target, Clock } from 'lucide-react';
import QuizSetup from '@/components/quiz/QuizSetup';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import QuizResults from '@/components/quiz/QuizResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { getAllWords, getWordsByCollection, getWordsByLevel } from '@/utils/vocabulary';
import { Word } from '@/utils/vocabulary-types';
import { toast } from 'sonner';

export type QuestionType = 'multiple-choice' | 'fill-in-blank' | 'arabic-to-meaning' | 'meaning-to-arabic';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'mixed';

export interface QuizSettings {
  wordCount: number;
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  collectionId?: string;
  timeLimit?: number; // seconds per question
}

export interface QuizQuestion {
  id: string;
  word: Word;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  timeSpent?: number;
  isCorrect?: boolean;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  totalTime: number;
  averageTimePerQuestion: number;
  difficultyBreakdown: Record<string, { correct: number; total: number }>;
}

const Quiz = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    wordCount: 10,
    difficulty: 'mixed',
    questionTypes: ['multiple-choice', 'fill-in-blank'],
    timeLimit: 30
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Initialize with collection from URL if provided
  useEffect(() => {
    const collection = searchParams.get('collection');
    if (collection) {
      setQuizSettings(prev => ({ ...prev, collectionId: collection }));
    }
  }, [searchParams]);

  const generateQuestions = (settings: QuizSettings): QuizQuestion[] => {
    let availableWords: Word[] = [];

    // Get words based on settings
    if (settings.collectionId) {
      availableWords = getWordsByCollection(settings.collectionId);
    } else if (settings.difficulty === 'mixed') {
      availableWords = getAllWords();
    } else {
      availableWords = getWordsByLevel(settings.difficulty);
    }

    // Shuffle and limit words
    const shuffledWords = [...availableWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, settings.wordCount);

    const generatedQuestions: QuizQuestion[] = [];
    
    shuffledWords.forEach((word, index) => {
      // Randomly select question type from enabled types
      const questionType = settings.questionTypes[
        Math.floor(Math.random() * settings.questionTypes.length)
      ];

      const question = createQuestion(word, questionType, availableWords);
      generatedQuestions.push({
        ...question,
        id: `question-${index}`
      });
    });

    return generatedQuestions;
  };

  const createQuestion = (word: Word, type: QuestionType, allWords: Word[]): Omit<QuizQuestion, 'id'> => {
    switch (type) {
      case 'multiple-choice':
        return createMultipleChoiceQuestion(word, allWords);
      case 'fill-in-blank':
        return createFillInBlankQuestion(word);
      case 'arabic-to-meaning':
        return createArabicToMeaningQuestion(word, allWords);
      case 'meaning-to-arabic':
        return createMeaningToArabicQuestion(word, allWords);
      default:
        return createMultipleChoiceQuestion(word, allWords);
    }
  };

  const createMultipleChoiceQuestion = (word: Word, allWords: Word[]): Omit<QuizQuestion, 'id'> => {
    const otherWords = allWords
      .filter(w => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [word.meaning, ...otherWords.map(w => w.meaning)]
      .sort(() => Math.random() - 0.5);

    return {
      word,
      type: 'multiple-choice',
      question: `What does "${word.arabic}" mean?`,
      options,
      correctAnswer: word.meaning
    };
  };

  const createFillInBlankQuestion = (word: Word): Omit<QuizQuestion, 'id'> => {
    return {
      word,
      type: 'fill-in-blank',
      question: `What is the meaning of "${word.arabic}"?`,
      correctAnswer: word.meaning
    };
  };

  const createArabicToMeaningQuestion = (word: Word, allWords: Word[]): Omit<QuizQuestion, 'id'> => {
    const otherWords = allWords
      .filter(w => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [word.arabic, ...otherWords.map(w => w.arabic)]
      .sort(() => Math.random() - 0.5);

    return {
      word,
      type: 'arabic-to-meaning',
      question: `Which Arabic word means "${word.meaning}"?`,
      options,
      correctAnswer: word.arabic
    };
  };

  const createMeaningToArabicQuestion = (word: Word, allWords: Word[]): Omit<QuizQuestion, 'id'> => {
    const otherWords = allWords
      .filter(w => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [word.meaning, ...otherWords.map(w => w.meaning)]
      .sort(() => Math.random() - 0.5);

    return {
      word,
      type: 'meaning-to-arabic',
      question: `What does "${word.arabic}" mean?`,
      options,
      correctAnswer: word.meaning
    };
  };

  const startQuiz = (settings: QuizSettings) => {
    const generatedQuestions = generateQuestions(settings);
    
    if (generatedQuestions.length === 0) {
      toast.error('No words available for the selected criteria');
      return;
    }

    setQuizSettings(settings);
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setStartTime(new Date());
    setGameState('playing');
    toast.success(`Quiz started with ${generatedQuestions.length} questions!`);
  };

  const handleAnswerSubmit = (answer: string, timeSpent: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

    // Update question with user answer
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: answer,
      timeSpent,
      isCorrect
    };
    setQuestions(updatedQuestions);

    // Move to next question or finish quiz
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 1500); // Show feedback for 1.5 seconds
    } else {
      setTimeout(() => {
        finishQuiz(updatedQuestions);
      }, 1500);
    }
  };

  const finishQuiz = (finalQuestions: QuizQuestion[]) => {
    const correctAnswers = finalQuestions.filter(q => q.isCorrect).length;
    const totalTime = startTime ? (new Date().getTime() - startTime.getTime()) / 1000 : 0;
    const averageTimePerQuestion = totalTime / finalQuestions.length;

    // Calculate difficulty breakdown
    const difficultyBreakdown: Record<string, { correct: number; total: number }> = {};
    finalQuestions.forEach(q => {
      const level = q.word.level;
      if (!difficultyBreakdown[level]) {
        difficultyBreakdown[level] = { correct: 0, total: 0 };
      }
      difficultyBreakdown[level].total++;
      if (q.isCorrect) {
        difficultyBreakdown[level].correct++;
      }
    });

    const result: QuizResult = {
      totalQuestions: finalQuestions.length,
      correctAnswers,
      incorrectAnswers: finalQuestions.length - correctAnswers,
      accuracy: (correctAnswers / finalQuestions.length) * 100,
      totalTime,
      averageTimePerQuestion,
      difficultyBreakdown
    };

    setQuizResult(result);
    setGameState('results');
  };

  const resetQuiz = () => {
    setGameState('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setQuizResult(null);
    setStartTime(null);
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="text-muted-foreground mb-6">
          Please sign in to access the quiz feature and track your progress.
        </p>
        <Button onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground flex items-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </button>
        
        <div className="flex items-center space-x-4">
          {gameState === 'playing' && (
            <>
              <div className="flex items-center text-sm text-muted-foreground">
                <Target className="h-4 w-4 mr-1" />
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              {quizSettings.timeLimit && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {quizSettings.timeLimit}s per question
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Game States */}
      {gameState === 'setup' && (
        <QuizSetup
          initialSettings={quizSettings}
          onStartQuiz={startQuiz}
        />
      )}

      {gameState === 'playing' && questions.length > 0 && (
        <QuizQuestion
          question={questions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          timeLimit={quizSettings.timeLimit}
          onAnswer={handleAnswerSubmit}
        />
      )}

      {gameState === 'results' && quizResult && (
        <QuizResults
          result={quizResult}
          questions={questions}
          onRestart={resetQuiz}
          onBackToDashboard={() => navigate('/dashboard')}
        />
      )}
    </div>
  );
};

export default Quiz;
