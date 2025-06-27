
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Volume2, Check, X, SkipForward, Headphones } from 'lucide-react';
import AudioPlayer from '@/components/AudioPlayer';
import { Word } from '@/utils/vocabulary-types';

interface ListeningExerciseProps {
  words: Word[];
  onComplete?: (score: number) => void;
}

interface Question {
  word: Word;
  options: string[];
  correctIndex: number;
}

const ListeningExercise: React.FC<ListeningExerciseProps> = ({ words, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [words]);

  const generateQuestions = () => {
    const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
    const questionList: Question[] = shuffledWords.map(word => {
      const correctAnswer = word.meaning;
      const wrongAnswers = words
        .filter(w => w.id !== word.id)
        .map(w => w.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(correctAnswer);

      return {
        word,
        options,
        correctIndex
      };
    });
    setQuestions(questionList);
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setHasPlayedAudio(false);
    } else {
      // Exercise complete
      const finalScore = Math.round((score / questions.length) * 100);
      if (onComplete) {
        onComplete(finalScore);
      }
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const handleAudioPlay = () => {
    setHasPlayedAudio(true);
  };

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Headphones className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Loading listening exercise...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentQuestionIndex >= questions.length) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Exercise Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl font-bold text-green-600">
            {Math.round((score / questions.length) * 100)}%
          </div>
          <p className="text-lg">
            You got {score} out of {questions.length} questions correct!
          </p>
          <Badge variant={score >= questions.length * 0.8 ? "default" : "secondary"}>
            {score >= questions.length * 0.8 ? "Excellent!" : "Good effort!"}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5" />
          Listening Exercise
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>Score: {score}/{questions.length}</span>
          </div>
          <Progress value={getProgressPercentage()} className="w-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Control */}
        <div className="text-center space-y-4">
          <div className="text-2xl font-arabic mb-2">{currentQuestion.word.arabic}</div>
          <div className="flex justify-center">
            <AudioPlayer
              text={currentQuestion.word.arabic}
              voice="onwK4e9ZLuTAKqWW03F9"
              label="Play Audio"
              size="lg"
              onPlay={handleAudioPlay}
            />
          </div>
          {!hasPlayedAudio && (
            <p className="text-sm text-muted-foreground">
              Click to hear the pronunciation, then select the correct meaning
            </p>
          )}
        </div>

        {/* Options */}
        {hasPlayedAudio && (
          <div className="space-y-3">
            <h3 className="font-semibold text-center">What does this word mean?</h3>
            <div className="grid gap-2">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    showResult
                      ? index === currentQuestion.correctIndex
                        ? "default"
                        : index === selectedAnswer
                        ? "destructive"
                        : "outline"
                      : "outline"
                  }
                  className={`w-full justify-start text-left h-auto p-3 ${
                    showResult && index === currentQuestion.correctIndex
                      ? "bg-green-100 border-green-500 text-green-800"
                      : showResult && index === selectedAnswer && index !== currentQuestion.correctIndex
                      ? "bg-red-100 border-red-500 text-red-800"
                      : ""
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-2">
                    {showResult && index === currentQuestion.correctIndex && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    {showResult && index === selectedAnswer && index !== currentQuestion.correctIndex && (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                    {option}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Result and Next Button */}
        {showResult && (
          <div className="text-center space-y-4">
            {selectedAnswer === currentQuestion.correctIndex ? (
              <div className="text-green-600 font-semibold">Correct! 🎉</div>
            ) : (
              <div className="space-y-2">
                <div className="text-red-600 font-semibold">Not quite right</div>
                <div className="text-sm text-muted-foreground">
                  The correct answer was: {currentQuestion.options[currentQuestion.correctIndex]}
                </div>
              </div>
            )}
            
            <Button onClick={handleNext}>
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Next Question
                </>
              ) : (
                'Complete Exercise'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListeningExercise;
