
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Volume2, Mic, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import AudioPlayer from '@/components/AudioPlayer';
import { Word } from '@/utils/vocabulary-types';

interface PronunciationTrainerProps {
  word: Word;
  onComplete?: (score: number) => void;
}

const PronunciationTrainer: React.FC<PronunciationTrainerProps> = ({ 
  word, 
  onComplete 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const startRecording = () => {
    setIsRecording(true);
    setHasRecorded(false);
    setPronunciationScore(null);
    
    // Mock recording process - in real implementation, this would use actual speech recognition
    setTimeout(() => {
      const mockScore = Math.floor(Math.random() * 30) + 70; // 70-100 range
      setIsRecording(false);
      setHasRecorded(true);
      setPronunciationScore(mockScore);
      
      // Generate feedback based on score
      if (mockScore >= 90) {
        setFeedback('Excellent pronunciation! Your accent is very clear.');
      } else if (mockScore >= 80) {
        setFeedback('Good job! Try to emphasize the stressed syllables more.');
      } else {
        setFeedback('Keep practicing! Focus on the vowel sounds and rhythm.');
      }
      
      if (onComplete) {
        onComplete(mockScore);
      }
    }, 3000);
  };

  const resetPractice = () => {
    setIsRecording(false);
    setHasRecorded(false);
    setPronunciationScore(null);
    setFeedback('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Word Display */}
      <div className="text-center space-y-4">
        <div>
          <h2 className="arabic-text text-5xl mb-2">{word.arabic}</h2>
          <p className="text-xl text-muted-foreground">/{word.transliteration}/</p>
          <p className="text-lg mt-2">{word.meaning}</p>
        </div>
        
        {/* Listen Button - Updated to use Arabic male voice */}
        <div className="flex justify-center">
          <AudioPlayer
            text={word.arabic}
            voice="onwK4e9ZLuTAKqWW03F9"
            label="Listen to pronunciation"
            size="lg"
          />
        </div>
      </div>

      {/* Recording Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Your Turn to Practice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isRecording && !hasRecorded && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Click the microphone to record your pronunciation
              </p>
              <Button onClick={startRecording} size="lg">
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            </div>
          )}

          {isRecording && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium">Recording... Speak now!</span>
              </div>
              <Progress value={66} className="w-full max-w-xs mx-auto" />
              <p className="text-sm text-muted-foreground">
                Say "{word.transliteration}" clearly into your microphone
              </p>
            </div>
          )}

          {hasRecorded && pronunciationScore !== null && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                {pronunciationScore >= 80 ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-orange-600" />
                )}
                <div className={`text-3xl font-bold ${getScoreColor(pronunciationScore)}`}>
                  {pronunciationScore}%
                </div>
              </div>
              
              <Badge variant={getScoreBadgeVariant(pronunciationScore)} className="text-sm">
                {pronunciationScore >= 90 ? 'Excellent!' : 
                 pronunciationScore >= 80 ? 'Good Job!' : 'Keep Practicing!'}
              </Badge>
              
              {feedback && (
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {feedback}
                </p>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={resetPractice}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <AudioPlayer
                  text={word.arabic}
                  voice="onwK4e9ZLuTAKqWW03F9"
                  label="Listen Again"
                  size="md"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pronunciation Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Pronunciation Tips
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Listen to the pronunciation multiple times before recording</li>
            <li>• Speak clearly and at a moderate pace</li>
            <li>• Focus on the emphasis and rhythm of the word</li>
            <li>• Practice in a quiet environment for best results</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PronunciationTrainer;
