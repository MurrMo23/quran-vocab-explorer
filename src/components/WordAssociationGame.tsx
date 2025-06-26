
import React, { useState, useEffect } from 'react';
import { Shuffle, Target, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Word, getWordsByCollection, getAllWords } from '@/utils/vocabulary';

interface WordAssociationGameProps {
  collectionId: string;
  onGameComplete?: (score: number, totalQuestions: number) => void;
}

interface GameQuestion {
  word: Word;
  options: Word[];
  type: 'meaning-to-arabic' | 'arabic-to-meaning' | 'root-connection';
}

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
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameStarted, setGameStarted] = useState(false);

  const generateQuestions = () => {
    const collectionWords = getWordsByCollection(collectionId);
    const allWords = getAllWords();
    const gameQuestions: GameQuestion[] = [];
    
    // Generate 10 questions
    for (let i = 0; i < Math.min(10, collectionWords.length); i++) {
      const word = collectionWords[i];
      const questionTypes: GameQuestion['type'][] = ['meaning-to-arabic', 'arabic-to-meaning', 'root-connection'];
      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      
      let options: Word[] = [word];
      
      if (questionType === 'root-connection') {
        // Find words with the same root
        const sameRootWords = allWords.filter(w => w.root === word.root && w.id !== word.id);
        const differentRootWords = allWords.filter(w => w.root !== word.root);
        
        // Add 1 same root word and 2 different root words
        if (sameRootWords.length > 0) {
          options.push(sameRootWords[0]);
        }
        options.push(...differentRootWords.slice(0, 2));
      } else {
        // For meaning/arabic questions, get random words from collection or all words
        const otherWords = collectionWords.filter(w => w.id !== word.id);
        if (otherWords.length >= 3) {
          options.push(...otherWords.slice(0, 3));
        } else {
          const additionalWords = allWords.filter(w => 
            w.id !== word.id && !otherWords.find(ow => ow.id === w.id)
          );
          options.push(...otherWords, ...additionalWords.slice(0, 3 - otherWords.length));
        }
      }
      
      // Shuffle options
      options = options.sort(() => 0.5 - Math.random()).slice(0, 4);
      
      gameQuestions.push({
        word,
        options,
        type: questionType
      });
    }
    
    setQuestions(gameQuestions);
  };

  useEffect(() => {
    if (gameStarted && !gameComplete) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameStarted, currentQuestion, gameComplete]);

  const startGame = () => {
    generateQuestions();
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setGameComplete(false);
    setTimeLeft(15);
  };

  const handleTimeUp = () => {
    if (!answered) {
      setAnswered(true);
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    }
  };

  const handleAnswer = (wordId: string) => {
    if (answered) return;
    
    setSelectedAnswer(wordId);
    setAnswered(true);
    
    const question = questions[currentQuestion];
    let isCorrect = false;
    
    switch (question.type) {
      case 'meaning-to-arabic':
      case 'arabic-to-meaning':
        isCorrect = wordId === question.word.id;
        break;
      case 'root-connection':
        const selectedWord = question.options.find(w => w.id === wordId);
        isCorrect = selectedWord?.root === question.word.root;
        break;
    }
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimeLeft(15);
    } else {
      setGameComplete(true);
      if (onGameComplete) {
        onGameComplete(score, questions.length);
      }
    }
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
        return question.options.find(w => w.root === question.word.root && w.id !== question.word.id)?.id || question.word.id;
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
              <p className="text-xs mt-1">15 seconds per question</p>
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
    const percentage = Math.round((score / questions.length) * 100);
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

  const question = questions[currentQuestion];
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
                style={{ width: `${(timeLeft / 15) * 100}%` }}
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
