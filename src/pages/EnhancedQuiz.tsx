
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Target, Clock } from 'lucide-react';
import EnhancedQuizSetup from '@/components/quiz/EnhancedQuizSetup';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import QuizResults from '@/components/quiz/QuizResults';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { getAllWords, getWordsByCollection, getWordsByLevel, getAllCollections } from '@/utils/vocabulary';
import { Word } from '@/utils/vocabulary-types';
import { QuizConfiguration, EnhancedQuizQuestion, QuizResult } from '@/utils/quiz-types';
import { AdvancedQuestionGenerator } from '@/utils/advanced-question-generator';
import { useQuizSession } from '@/hooks/useQuizSession';
import { toast } from 'sonner';

// Legacy types for compatibility with existing QuizQuestion component
export type QuestionType = 'multiple-choice' | 'fill-in-blank' | 'arabic-to-meaning' | 'meaning-to-arabic';

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

const EnhancedQuiz = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const { startQuizSession, completeQuizSession } = useQuizSession();
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [quizConfig, setQuizConfig] = useState<QuizConfiguration>({
    mode: 'practice',
    questionTypes: ['multiple-choice', 'fill-in-blank'],
    difficulty: 'mixed',
    questionCount: 10,
    timeLimit: 30,
    adaptiveLearning: true,
    spacedRepetition: true,
    focusOnWeakAreas: false
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize with collection from URL if provided
  useEffect(() => {
    const collection = searchParams.get('collection');
    if (collection) {
      setQuizConfig(prev => ({ ...prev, collectionId: collection }));
    }
  }, [searchParams]);

  const generateQuestions = (config: QuizConfiguration): QuizQuestion[] => {
    let availableWords: Word[] = [];

    // Get words based on configuration
    if (config.collectionId) {
      availableWords = getWordsByCollection(config.collectionId);
    } else if (config.difficulty === 'mixed') {
      availableWords = getAllWords();
    } else {
      if (config.difficulty === 'adaptive') {
        availableWords = getAllWords();
      } else {
        availableWords = getWordsByLevel(config.difficulty);
      }
    }

    if (availableWords.length === 0) return [];

    // Use advanced question generator
    const generator = new AdvancedQuestionGenerator(availableWords);
    const enhancedQuestions = generator.generateQuestionBatch(
      config.questionTypes,
      config.questionCount,
      config.difficulty === 'adaptive' ? 'mixed' : config.difficulty
    );

    // Convert enhanced questions to legacy format for compatibility
    return enhancedQuestions.map((eq, index) => convertToLegacyQuestion(eq, index));
  };

  const convertToLegacyQuestion = (enhancedQ: EnhancedQuizQuestion, index: number): QuizQuestion => {
    const legacyTypeMap: Record<string, QuestionType> = {
      'multiple-choice': 'multiple-choice',
      'fill-in-blank': 'fill-in-blank',
      'arabic-to-meaning': 'arabic-to-meaning',
      'meaning-to-arabic': 'meaning-to-arabic',
      'audio-recognition': 'multiple-choice',
      'contextual-completion': 'multiple-choice',
      'root-family': 'multiple-choice',
      'synonym-antonym': 'multiple-choice',
      'pronunciation-match': 'multiple-choice'
    };

    return {
      id: `question-${index}-${Date.now()}`,
      word: enhancedQ.word,
      type: legacyTypeMap[enhancedQ.type] || 'multiple-choice',
      question: enhancedQ.question,
      options: enhancedQ.options,
      correctAnswer: enhancedQ.correctAnswer
    };
  };

  const startQuiz = async (config: QuizConfiguration) => {
    if (!session?.user?.id) {
      toast.error('Please log in to start a quiz');
      return;
    }

    const generatedQuestions = generateQuestions(config);
    
    if (generatedQuestions.length === 0) {
      toast.error('No words available for the selected criteria');
      return;
    }

    console.log('Starting quiz with', generatedQuestions.length, 'questions');

    // Start quiz session in database
    const newSessionId = await startQuizSession(config);
    if (!newSessionId) {
      toast.error('Failed to start quiz session');
      return;
    }

    setQuizConfig(config);
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setStartTime(new Date());
    setSessionId(newSessionId);
    setGameState('playing');
    toast.success(`Quiz started with ${generatedQuestions.length} questions!`);
  };

  const handleAnswerSubmit = (answer: string, timeSpent: number) => {
    console.log('Answer received:', { 
      answer, 
      timeSpent, 
      currentIndex: currentQuestionIndex,
      totalQuestions: questions.length 
    });
    
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

    console.log('Question updated, advancing to next...');

    // Check if this was the last question
    if (currentQuestionIndex >= questions.length - 1) {
      console.log('Quiz completed, finishing...');
      finishQuiz(updatedQuestions);
    } else {
      console.log('Moving to next question:', currentQuestionIndex + 1);
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const finishQuiz = async (finalQuestions: QuizQuestion[]) => {
    console.log('Finishing quiz with', finalQuestions.length, 'questions');
    
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
      sessionId: sessionId || undefined,
      score: Math.round((correctAnswers / finalQuestions.length) * 100),
      accuracy: (correctAnswers / finalQuestions.length) * 100,
      totalTime,
      totalQuestions: finalQuestions.length,
      questionsAnswered: finalQuestions.length,
      correctAnswers,
      incorrectAnswers: finalQuestions.length - correctAnswers,
      averageTimePerQuestion,
      difficultyBreakdown,
      weakAreas: [],
      achievements: [],
      nextRecommendations: []
    };

    console.log('Quiz result calculated:', result);

    // Complete quiz session in database
    if (sessionId) {
      await completeQuizSession(sessionId, result);
    }

    setQuizResult(result);
    setGameState('results');
    toast.success(`Quiz completed! Score: ${result.score}%`);
  };

  const resetQuiz = () => {
    console.log('Resetting quiz');
    setGameState('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setQuizResult(null);
    setStartTime(null);
    setSessionId(null);
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="text-muted-foreground mb-6">
          Please sign in to access the enhanced quiz features and track your progress.
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
              {quizConfig.timeLimit && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {quizConfig.timeLimit}s per question
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Game States */}
      {gameState === 'setup' && (
        <EnhancedQuizSetup
          collections={getAllCollections()}
          onStart={startQuiz}
        />
      )}

      {gameState === 'playing' && questions.length > 0 && currentQuestionIndex < questions.length && (
        <QuizQuestion
          key={`question-${questions[currentQuestionIndex].id}`}
          question={questions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          timeLimit={quizConfig.timeLimit}
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

export default EnhancedQuiz;
