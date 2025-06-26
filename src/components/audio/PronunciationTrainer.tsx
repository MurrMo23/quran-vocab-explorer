
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Volume2, Mic, MicOff, RotateCcw, Trophy, Target } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { Word } from '@/utils/vocabulary-types';

interface PronunciationTrainerProps {
  word: Word;
  onComplete?: (score: number) => void;
}

const PronunciationTrainer: React.FC<PronunciationTrainerProps> = ({ word, onComplete }) => {
  const { generateSpeech, playAudio, isLoading: ttsLoading } = useTextToSpeech();
  const { 
    isRecording, 
    audioBlob, 
    analysisResult, 
    loading: analysisLoading,
    startRecording, 
    stopRecording, 
    analyzeRecording, 
    resetRecording 
  } = useAudioRecording();

  const [currentStep, setCurrentStep] = useState<'listen' | 'practice' | 'record' | 'results'>('listen');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const handleListen = async () => {
    const audioUrl = await generateSpeech(word.arabic, 'Aria');
    if (audioUrl) {
      playAudio(audioUrl);
      setCurrentStep('practice');
    }
  };

  const handleStartRecording = async () => {
    await startRecording();
    setCurrentStep('record');
  };

  const handleStopRecording = async () => {
    stopRecording();
    const result = await analyzeRecording(word.id, word.transliteration);
    if (result) {
      setAttempts(prev => prev + 1);
      setCurrentStep('results');
      if (onComplete) {
        onComplete(result.score);
      }
    }
  };

  const handleTryAgain = () => {
    resetRecording();
    setCurrentStep('listen');
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'listen': return 25;
      case 'practice': return 50;
      case 'record': return 75;
      case 'results': return 100;
      default: return 0;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 95) return { variant: 'default' as const, text: 'Perfect!', color: 'bg-green-500' };
    if (score >= 85) return { variant: 'secondary' as const, text: 'Excellent', color: 'bg-blue-500' };
    if (score >= 75) return { variant: 'outline' as const, text: 'Good', color: 'bg-yellow-500' };
    return { variant: 'destructive' as const, text: 'Keep Practicing', color: 'bg-red-500' };
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Pronunciation Trainer
        </CardTitle>
        <Progress value={getStepProgress()} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Word Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-arabic mb-2">{word.arabic}</div>
          <div className="text-lg text-muted-foreground">/{word.transliteration}/</div>
          <div className="text-base">{word.meaning}</div>
        </div>

        {/* Step Content */}
        {currentStep === 'listen' && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Listen</h3>
            <p className="text-muted-foreground">First, listen to the correct pronunciation</p>
            <Button onClick={handleListen} disabled={ttsLoading} size="lg">
              <Volume2 className="h-4 w-4 mr-2" />
              {ttsLoading ? 'Generating Audio...' : 'Play Pronunciation'}
            </Button>
          </div>
        )}

        {currentStep === 'practice' && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Practice</h3>
            <p className="text-muted-foreground">Practice saying the word silently, then click when ready to record</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleListen} variant="outline">
                <Volume2 className="h-4 w-4 mr-2" />
                Listen Again
              </Button>
              <Button onClick={handleStartRecording}>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'record' && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Step 3: Record</h3>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 font-medium">Recording... Speak now!</span>
            </div>
            <p className="text-muted-foreground">Say: {word.transliteration}</p>
            <Button onClick={handleStopRecording} variant="destructive" size="lg">
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          </div>
        )}

        {currentStep === 'results' && analysisResult && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Results</h3>
            <div className="space-y-4">
              <div className="text-3xl font-bold">{analysisResult.score}%</div>
              <Badge {...getScoreBadge(analysisResult.score)}>
                {getScoreBadge(analysisResult.score).text}
              </Badge>
              
              {analysisResult.score >= 85 && (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Trophy className="h-5 w-5" />
                  <span className="font-medium">Great job!</span>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">{analysisResult.feedback}</p>
              </div>

              <div className="flex gap-2 justify-center">
                {attempts < maxAttempts && analysisResult.score < 85 && (
                  <Button onClick={handleTryAgain} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again ({maxAttempts - attempts} left)
                  </Button>
                )}
                <Button onClick={() => setCurrentStep('listen')}>
                  Practice Another Word
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading States */}
        {analysisLoading && (
          <div className="text-center space-y-2">
            <Progress value={66} className="w-full max-w-xs mx-auto" />
            <p className="text-sm text-muted-foreground">Analyzing your pronunciation...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PronunciationTrainer;
