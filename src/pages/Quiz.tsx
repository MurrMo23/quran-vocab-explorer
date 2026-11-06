import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Target, RotateCcw, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getPublishedCollections, getAllWords, getWordById, getWordsByCollection } from '@/utils/vocabulary';
import type { Word } from '@/utils/vocabulary-types';
import { useProgress } from '@/lib/progress';
import { useUserCollections, PRACTICE_COLLECTION_PARAM } from '@/lib/collections';
import { usePracticePool, ALL_WORDS } from '@/components/practice/usePracticePool';
import ProgressSaveNotice from '@/components/practice/ProgressSaveNotice';
import QuizResults from '@/components/quiz/QuizResults';
import {
  buildQuestion,
  pickQuizWords,
  summarizeQuiz,
  type QuizQuestion,
  type QuizResult,
} from '@/components/quiz/quiz-utils';
import SEO from '@/components/SEO';

// Re-exported for existing importers.
export type { QuestionType, DifficultyLevel, QuizSettings, QuizResult, QuizQuestion } from '@/components/quiz/quiz-utils';

const QUESTION_COUNTS = [5, 10, 20] as const;
const FEEDBACK_MS = 1500;

const Quiz = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get(PRACTICE_COLLECTION_PARAM) ?? '';
  const [selected, setSelected] = useState<string>(collectionParam || ALL_WORDS);
  const [questionCount, setQuestionCount] = useState<number>(10);

  useEffect(() => {
    if (collectionParam) setSelected(collectionParam);
  }, [collectionParam]);

  const { recordReview, cards } = useProgress();
  const collections = useMemo(() => getPublishedCollections(), []);
  const { items: userCollections } = useUserCollections();
  const pool = usePracticePool(selected);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'playing' | 'results'>('setup');
  const [result, setResult] = useState<QuizResult | null>(null);
  const startedAt = useRef(0);
  const shownAt = useRef(0);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  const chooseCollection = (id: string) => {
    setSelected(id);
    const next = new URLSearchParams(searchParams);
    if (id && id !== ALL_WORDS) next.set(PRACTICE_COLLECTION_PARAM, id);
    else next.delete(PRACTICE_COLLECTION_PARAM);
    setSearchParams(next, { replace: true });
  };

  const startQuiz = () => {
    const words = pool.wordIds.map((id) => getWordById(id)).filter((w): w is Word => !!w);
    if (words.length === 0) return;
    // Distractors come from the pool, padded with all words for small collections.
    const distractorPool = words.length >= 4 ? words : getAllWords();
    const picked = pickQuizWords(words, questionCount, { dueFirst: true, cards });
    setQuestions(picked.map((w, i) => buildQuestion(w, 'multiple-choice', distractorPool, i)));
    setIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setResult(null);
    startedAt.current = Date.now();
    shownAt.current = Date.now();
    setPhase('playing');
  };

  const current = questions[index];
  const correctSoFar = questions.filter((q) => q.isCorrect).length;

  const goNext = (answered: QuizQuestion[]) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    if (index + 1 >= answered.length) {
      setResult(summarizeQuiz(answered, startedAt.current, Date.now()));
      setPhase('results');
    } else {
      setIndex(index + 1);
      setSelectedAnswer('');
      setShowResult(false);
      shownAt.current = Date.now();
    }
  };

  const submitAnswer = () => {
    if (!current || showResult || !selectedAnswer) return;
    const elapsedMs = Date.now() - shownAt.current;
    const isCorrect = selectedAnswer === current.correctAnswer;
    const answered = questions.map((q, i) =>
      i === index ? { ...q, userAnswer: selectedAnswer, isCorrect, timeSpent: elapsedMs / 1000 } : q,
    );
    setQuestions(answered);
    setShowResult(true);
    void recordReview(current.word.id, isCorrect ? 'good' : 'again', 'quiz', elapsedMs);
    advanceTimer.current = window.setTimeout(() => goNext(answered), isCorrect ? FEEDBACK_MS : FEEDBACK_MS * 2);
  };

  const resetQuiz = () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setPhase('setup');
    setQuestions([]);
    setResult(null);
  };

  const progressValue = questions.length > 0 ? (index / questions.length) * 100 : 0;
  const plannedCount = Math.min(questionCount, pool.wordIds.length);

  return (
    <>
      <SEO
        title="Quranic Vocabulary Quiz"
        description="Test your Quranic Arabic vocabulary with multiple-choice quizzes. Every answer updates your spaced-repetition schedule."
        keywords={['Arabic quiz', 'vocabulary test', 'Quranic Arabic', 'interactive learning']}
        url="https://quranvocab.com/quiz"
        type="website"
      />

      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold">Quiz Mode</h1>
          <p className="text-muted-foreground">
            Test your vocabulary. Every answer updates your review schedule.
          </p>
        </div>

        {phase === 'setup' && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Choose a Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="quiz-collection" className="mb-2 block text-sm font-medium">
                  Collection
                </label>
                <select
                  id="quiz-collection"
                  value={selected}
                  onChange={(e) => chooseCollection(e.target.value)}
                  className="w-full rounded-md border bg-background p-2"
                >
                  <option value={ALL_WORDS}>All words ({getAllWords().length})</option>
                  <optgroup label="Collections">
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({getWordsByCollection(c.id).length} words)
                      </option>
                    ))}
                  </optgroup>
                  {userCollections.length > 0 && (
                    <optgroup label="My collections">
                      {userCollections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.wordIds.length} words)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {selected !== ALL_WORDS &&
                    !collections.some((c) => c.id === selected) &&
                    !userCollections.some((c) => c.id === selected) && (
                      <option value={selected}>{pool.loading ? 'Loading collection…' : 'Collection not found'}</option>
                    )}
                </select>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium">Questions</span>
                <div className="flex gap-2" role="group" aria-label="Number of questions">
                  {QUESTION_COUNTS.map((n) => (
                    <Button
                      key={n}
                      type="button"
                      size="sm"
                      variant={questionCount === n ? 'default' : 'outline'}
                      onClick={() => setQuestionCount(n)}
                      aria-pressed={questionCount === n}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>

              {pool.notFound && (
                <p className="text-sm text-amber-700 dark:text-amber-300">That collection could not be found.</p>
              )}

              <Button onClick={startQuiz} disabled={plannedCount === 0 || pool.loading} className="w-full" size="lg">
                Start Quiz ({plannedCount} questions)
              </Button>
              <ProgressSaveNotice />
            </CardContent>
          </Card>
        )}

        {phase === 'playing' && current && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Question {index + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    Score: {correctSoFar}/{index + (showResult ? 1 : 0)}
                  </span>
                  <Button variant="outline" size="sm" onClick={resetQuiz}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>

            <Card
              className={`mb-4 ${
                showResult
                  ? current.isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                  : ''
              }`}
            >
              <CardContent className="p-8">
                <div className="mb-6 text-center">
                  <h2 className="arabic-text mb-2 text-3xl font-bold text-primary" lang="ar" dir="rtl">
                    {current.word.arabic}
                  </h2>
                  <p className="text-lg text-muted-foreground">{current.word.transliteration}</p>
                </div>

                <div className="mb-6 space-y-3">
                  {current.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => !showResult && setSelectedAnswer(option)}
                      disabled={showResult}
                      className={`w-full rounded-lg border p-4 text-left transition-all ${
                        showResult && option === current.correctAnswer
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                          : showResult && option === selectedAnswer
                            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                            : selectedAnswer === option
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {!showResult && (
                  <Button onClick={submitAnswer} disabled={!selectedAnswer} className="w-full" size="lg">
                    Submit Answer
                  </Button>
                )}

                {showResult && (
                  <div className="space-y-4 text-center">
                    {current.isCorrect ? (
                      <div className="font-medium text-green-600">
                        <CheckCircle className="mx-auto mb-2 h-8 w-8" />
                        Correct! Well done.
                      </div>
                    ) : (
                      <div className="font-medium text-red-600">
                        <XCircle className="mx-auto mb-2 h-8 w-8" />
                        The correct answer was: {current.correctAnswer}
                      </div>
                    )}
                    <Button variant="outline" onClick={() => goNext(questions)}>
                      {index + 1 >= questions.length ? 'See results' : 'Next'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <ProgressSaveNotice />
          </div>
        )}

        {phase === 'results' && result && (
          <div className="mx-auto max-w-3xl">
            <QuizResults
              result={result}
              questions={questions}
              onRestart={resetQuiz}
              onBackToDashboard={() => navigate('/dashboard')}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Quiz;
