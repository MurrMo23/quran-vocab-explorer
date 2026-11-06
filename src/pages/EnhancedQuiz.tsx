import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Target, Clock } from 'lucide-react';
import EnhancedQuizSetup from '@/components/quiz/EnhancedQuizSetup';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import QuizResults from '@/components/quiz/QuizResults';
import ProgressSaveNotice from '@/components/practice/ProgressSaveNotice';
import { getAllCollections, getAllWords, getWordsByCollection, getWordsByLevel } from '@/utils/vocabulary';
import type { Word } from '@/utils/vocabulary-types';
import type { QuizConfiguration } from '@/utils/quiz-types';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useProgress } from '@/lib/progress';
import { PRACTICE_COLLECTION_PARAM } from '@/lib/collections';
import {
  buildQuestion,
  pickQuizWords,
  summarizeQuiz,
  type QuestionType as BasicQuestionType,
  type QuizResult,
  type TypedQuizQuestion,
} from '@/components/quiz/quiz-utils';
import { toast } from 'sonner';

// Legacy exports kept for existing importers.
export type QuestionType = BasicQuestionType;
export type QuizQuestion = TypedQuizQuestion;

const SUPPORTED_TYPES: readonly BasicQuestionType[] = ['multiple-choice', 'fill-in-blank', 'arabic-to-meaning', 'meaning-to-arabic'];

function wordsFor(config: QuizConfiguration): Word[] {
  let words = config.collectionId ? getWordsByCollection(config.collectionId) : getAllWords();
  if (config.difficulty === 'beginner' || config.difficulty === 'intermediate' || config.difficulty === 'advanced') {
    const level = config.difficulty;
    words = config.collectionId ? words.filter((w) => w.level === level) : getWordsByLevel(level);
  }
  return words;
}

const EnhancedQuiz = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCollection = searchParams.get(PRACTICE_COLLECTION_PARAM) ?? undefined;
  const { startQuizSession, completeQuizSession } = useQuizSession();
  const { recordReview, cards } = useProgress();

  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [quizConfig, setQuizConfig] = useState<QuizConfiguration | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const startedAt = useRef(0);
  const sessionIdRef = useRef<Promise<string | null> | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    // Leaving the page mid-quiz: answers are already saved per question; nothing else to do.
    return () => {
      finished.current = true;
    };
  }, []);

  const startQuiz = (config: QuizConfiguration) => {
    const pool = wordsFor(config);
    if (pool.length === 0) {
      toast.error('No words available for the selected criteria');
      return;
    }
    const types = config.questionTypes.filter((t): t is BasicQuestionType =>
      (SUPPORTED_TYPES as readonly string[]).includes(t),
    );
    if (types.length === 0) {
      toast.error('Choose at least one question type');
      return;
    }
    const distractorPool = pool.length >= 4 ? pool : getAllWords();
    const picked = pickQuizWords(pool, config.questionCount, {
      cards,
      dueFirst: config.spacedRepetition,
      weakFirst: config.focusOnWeakAreas,
    });
    const generated = picked.map((w, i) => buildQuestion(w, types[i % types.length], distractorPool, i));

    finished.current = false;
    setQuizConfig(config);
    setQuestions(generated);
    setCurrentQuestionIndex(0);
    setQuizResult(null);
    startedAt.current = Date.now();
    // Signed-in learners get a quiz_sessions row (history); failures don't block the quiz.
    sessionIdRef.current = startQuizSession({ ...config, questionCount: generated.length });
    setGameState('playing');
  };

  const finishQuiz = async (finalQuestions: QuizQuestion[]) => {
    if (finished.current) return;
    finished.current = true;
    const result = summarizeQuiz(finalQuestions, startedAt.current, Date.now());
    setQuizResult(result);
    setGameState('results');

    const sessionId = await sessionIdRef.current;
    if (sessionId) void completeQuizSession(sessionId, result);
  };

  const handleAnswer = (answer: string, elapsedMs: number, isCorrect: boolean) => {
    const current = questions[currentQuestionIndex];
    if (!current || current.userAnswer !== undefined) return;

    void recordReview(current.word.id, isCorrect ? 'good' : 'again', 'quiz', elapsedMs);

    const updated = questions.map((q, i) =>
      i === currentQuestionIndex ? { ...q, userAnswer: answer, timeSpent: elapsedMs / 1000, isCorrect } : q,
    );
    setQuestions(updated);

    const survivalOver = quizConfig?.mode === 'survival' && !isCorrect;
    if (survivalOver || currentQuestionIndex >= updated.length - 1) {
      void finishQuiz(updated);
    } else {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const resetQuiz = () => {
    finished.current = true;
    setGameState('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setQuizResult(null);
    sessionIdRef.current = null;
  };

  const timeLimit = quizConfig?.mode === 'timed' ? quizConfig.timeLimit : undefined;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          <span>Back</span>
        </button>

        {gameState === 'playing' && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Target className="mr-1 h-4 w-4" />
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            {timeLimit && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                {timeLimit}s per question
              </div>
            )}
          </div>
        )}
      </div>

      {gameState === 'setup' && (
        <>
          <EnhancedQuizSetup collections={getAllCollections()} onStart={startQuiz} initialCollectionId={initialCollection} />
          <ProgressSaveNotice className="mt-4" />
        </>
      )}

      {gameState === 'playing' && questions[currentQuestionIndex] && (
        <>
          <QuizQuestion
            key={questions[currentQuestionIndex].id}
            question={questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            timeLimit={timeLimit}
            onAnswer={handleAnswer}
          />
          <ProgressSaveNotice className="mt-4" />
        </>
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
