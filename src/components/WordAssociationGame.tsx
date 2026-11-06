
import React, { useState, useEffect, useRef } from 'react';
import { Shuffle, Target, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Word, getWordsByCollection, getAllWords } from '@/utils/vocabulary';
import { useProgress } from '@/lib/progress';
import { shuffle } from '@/components/quiz/quiz-utils';
import ProgressSaveNotice from '@/components/practice/ProgressSaveNotice';

interface WordAssociationGameProps {
  collectionId: string;
  onGameComplete?: (score: number, totalQuestions: number) => void;
}

interface GameQuestion {
  word: Word;
  options: Word[];
  type: 'meaning-to-arabic' | 'arabic-to-meaning' | 'root-connection';
}

const QUESTION_COUNT = 10;
const SECONDS_PER_QUESTION = 15;
const FEEDBACK_MS = 2000;

const WordAssociationGame: React.FC<WordAssociationGameProps> = ({
  collectionId,
  onGameComplete
}) => {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [gameStarted, setGameStarted] = useState(false);
  const { recordReview } = useProgress();
  const shownAt = useRef(Date.now());
  const scoreRef = useRef(0);
  const advanceTimer = useRef<number | null>(null);

  const generateQuestions = (): GameQuestion[] => {
    const collectionWords = getWordsByCollection(collectionId);
    const allWords = getAllWords();
    const gameQuestions: GameQuestion[] = [];
    const picked = shuffle(collectionWords).slice(0, QUESTION_COUNT);

    for (const word of picked) {
      // Root questions only make sense when another word shares the root.
      const sameRoot = word.root ? allWords.filter((w) => w.root === word.root && w.id !== word.id) : [];
      const types: GameQuestion['type'][] = ['meaning-to-arabic', 'arabic-to-meaning'];
      if (sameRoot.length > 0) types.push('root-connection');
      const type = types[Math.floor(Math.random() * types.length)];

      let options: Word[];
      if (type === 'root-connection') {
        const partner = shuffle(sameRoot)[0];
        const others = shuffle(allWords.filter((w) => w.root !== word.root)).slice(0, 3);
        // The reference word is shown separately; options are the partner plus distractors.
        options = shuffle([partner, ...others]);
      } else {
        const source = collectionWords.length >= 4 ? collectionWords : allWords;
        const seen = new Set([word.id]);
        const display = (w: Word) => (type === 'meaning-to-arabic' ? w.arabic : w.meaning);
        const seenText = new Set([display(word)]);
        const distractors: Word[] = [];
        for (const w of shuffle(source)) {
          if (distractors.length >= 3) break;
          if (seen.has(w.id) || seenText.has(display(w))) continue;
          seen.add(w.id);
          seenText.add(display(w));
          distractors.push(w);
        }
        options = shuffle([word, ...distractors]);
      }
      gameQuestions.push({ word, options, type });
    }
    return gameQuestions;
  };

  const question = questions[currentQuestion];

  const recordAnswer = (correct: boolean) => {
    if (!question) return;
    void recordReview(question.word.id, correct ? 'good' : 'again', 'quiz', Date.now() - shownAt.current);
  };

  const nextQuestion = () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimeLeft(SECONDS_PER_QUESTION);
      shownAt.current = Date.now();
    } else {
      setGameComplete(true);
      onGameComplete?.(scoreRef.current, questions.length);
    }
  };

  // Countdown: a question left unanswered counts as a miss.
  useEffect(() => {
    if (!gameStarted || gameComplete || answered || !question) return;
    const deadline = shownAt.current + SECONDS_PER_QUESTION * 1000;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
        setAnswered(true);
        recordAnswer(false);
        advanceTimer.current = window.setTimeout(nextQuestion, FEEDBACK_MS);
      }
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameComplete, answered, currentQuestion, questions]);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  const startGame = () => {
    const generated = generateQuestions();
    setQuestions(generated);
    setGameStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    scoreRef.current = 0;
    setGameComplete(generated.length === 0);
    setTimeLeft(SECONDS_PER_QUESTION);
    shownAt.current = Date.now();
  };

  const handleAnswer = (wordId: string) => {
    if (answered || !question) return;
    setSelectedAnswer(wordId);
    setAnswered(true);

    const selectedWord = question.options.find((w) => w.id === wordId);
    const isCorrect =
      question.type === 'root-connection'
        ? !!selectedWord && selectedWord.id !== question.word.id && selectedWord.root === question.word.root
        : wordId === question.word.id;

    if (isCorrect) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
    recordAnswer(isCorrect);
    advanceTimer.current = window.setTimeout(nextQuestion, FEEDBACK_MS);
  };

  const getQuestionText = (question: GameQuestion) => {
    switch (question.type) {
      case 'meaning-to-arabic':
        return `Which Arabic word means "${question.word.meaning}"?`;
      case 'arabic-to-meaning':
        return `What does "${question.word.arabic}" mean?`;
      case 'root-connection':
        return `Which word shares the same root (${question.word.root}) as "${question.word.arabic}"?`;
      default:
        return '';
    }
  };

  const getOptionDisplay = (option: Word, questionType: GameQuestion['type']) => {
    switch (questionType) {
      case 'meaning-to-arabic':
        return option.arabic;
      case 'arabic-to-meaning':
        return option.meaning;
      case 'root-connection':
        return `${option.arabic} (${option.meaning})`;
      default:
        return option.arabic;
    }
  };

  const getCorrectAnswerId = (question: GameQuestion) => {
    switch (question.type) {
      case 'meaning-to-arabic':
      case 'arabic-to-meaning':
        return question.word.id;
      case 'root-connection':
        return question.options.find(w => w.root === question.word.root && w.id !== question.word.id)?.id ?? '';
      default:
        return question.word.id;
    }
  };

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Word Association Game
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Test your knowledge with word associations, meanings, and root connections!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <strong>Arabic ↔ Meaning</strong>
              <p className="text-xs mt-1">Match words with their meanings</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <strong>Root Connections</strong>
              <p className="text-xs mt-1">Find words sharing the same root</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <strong>Timed Challenge</strong>
              <p className="text-xs mt-1">{SECONDS_PER_QUESTION} seconds per question</p>
            </div>
          </div>
          <Button onClick={startGame} size="lg" className="w-full md:w-auto">
            <Shuffle className="h-4 w-4 mr-2" />
            Start Game
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameComplete) {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    if (questions.length === 0) {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-6 text-center text-muted-foreground">This collection has no words to play with yet.</CardContent>
        </Card>
      );
    }
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Game Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '🥈' : '🥉'}
          </div>
          <div>
            <div className="text-3xl font-bold">{score}/{questions.length}</div>
            <div className="text-xl text-muted-foreground">{percentage}% correct</div>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">
              {percentage >= 80 ? 'Excellent work!' : 
               percentage >= 60 ? 'Good job!' : 'Keep practicing!'}
            </p>
            <p className="text-sm text-muted-foreground">
              {percentage >= 80 ? 'You have mastered these word associations!' :
               percentage >= 60 ? 'You\'re getting there. Review the missed words.' :
               'Consider reviewing the collection before trying again.'}
            </p>
          </div>
          <ProgressSaveNotice />
          <div className="flex gap-2 justify-center">
            <Button onClick={startGame} variant="outline">
              <Shuffle className="h-4 w-4 mr-2" />
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!question) return null;
  const correctAnswerId = getCorrectAnswerId(question);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Question {currentQuestion + 1}/{questions.length}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Time: {timeLeft}s</span>
            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-1000"
                style={{ width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <Progress value={(currentQuestion / questions.length) * 100} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">{getQuestionText(question)}</h3>
          {question.type === 'root-connection' && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Reference word:</p>
              <p className="arabic-text text-2xl">{question.word.arabic}</p>
              <p className="text-sm">Root: {question.word.root}</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.id === correctAnswerId;
            const showResult = answered;
            
            let buttonVariant: "default" | "outline" | "destructive" = "outline";
            let className = "";
            
            if (showResult) {
              if (isCorrect) {
                buttonVariant = "default";
                className = "bg-green-500 hover:bg-green-600 text-white";
              } else if (isSelected && !isCorrect) {
                buttonVariant = "destructive";
              }
            }
            
            return (
              <Button
                key={option.id}
                variant={buttonVariant}
                className={`h-auto p-4 text-left justify-start ${className}`}
                onClick={() => handleAnswer(option.id)}
                disabled={answered}
              >
                <div className="flex items-center gap-2">
                  {showResult && isCorrect && <CheckCircle className="h-4 w-4" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4" />}
                  <div>
                    <div className={question.type === 'meaning-to-arabic' ? 'arabic-text text-lg' : ''}>
                      {getOptionDisplay(option, question.type)}
                    </div>
                    {question.type === 'root-connection' && (
                      <div className="text-xs text-muted-foreground">Root: {option.root}</div>
                    )}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WordAssociationGame;
