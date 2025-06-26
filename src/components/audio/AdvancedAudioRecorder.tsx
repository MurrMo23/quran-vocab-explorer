
import React, { useState } from 'react';
import { Mic, MicOff, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { Word } from '@/utils/vocabulary-types';

interface AdvancedAudioRecorderProps {
  word: Word;
  onScoreUpdate?: (score: number) => void;
}

const AdvancedAudioRecorder: React.FC<AdvancedAudioRecorderProps> = ({
  word,
  onScoreUpdate
}) => {
  const {
    isRecording,
    audioBlob,
    analysisResult,
    loading,
    startRecording,
    stopRecording,
    analyzeRecording,
    resetRecording
  } = useAudioRecording();

  const [isPlaying, setIsPlaying] = useState(false);

  const handleAnalyze = async () => {
    const result = await analyzeRecording(word.id, word.transliteration);
    if (result && onScoreUpdate) {
      onScoreUpdate(result.score);
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      setIsPlaying(true);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 95) return 'Perfect! 🎉';
    if (score >= 90) return 'Excellent! 👏';
    if (score >= 80) return 'Very Good! 👍';
    if (score >= 70) return 'Good! Keep practicing! 📚';
    return 'Keep trying! Practice makes perfect! 💪';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Advanced Pronunciation Trainer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Word Display */}
        <div className="text-center">
          <h2 className="arabic-text text-5xl mb-2">{word.arabic}</h2>
          <p className="text-xl text-muted-foreground">/{word.transliteration}/</p>
          <p className="text-lg mt-2">{word.translation}</p>
        </div>

        {/* Recording Controls */}
        <div className="flex justify-center gap-4">
          {!isRecording && !audioBlob && (
            <Button onClick={startRecording} size="lg" className="bg-red-500 hover:bg-red-600">
              <Mic className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button onClick={stopRecording} size="lg" variant="destructive">
              <MicOff className="h-5 w-5 mr-2" />
              Stop Recording
            </Button>
          )}

          {audioBlob && !analysisResult && (
            <div className="flex gap-2">
              <Button onClick={playRecording} variant="outline" disabled={isPlaying}>
                {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isPlaying ? 'Playing...' : 'Play Recording'}
              </Button>
              <Button onClick={handleAnalyze} disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Pronunciation'}
              </Button>
              <Button onClick={resetRecording} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 font-medium">Recording in progress...</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Speak clearly and pronounce: {word.transliteration}
            </p>
          </div>
        )}

        {/* Analysis Loading */}
        {loading && (
          <div className="text-center space-y-2">
            <Progress value={66} className="w-full max-w-xs mx-auto" />
            <p className="text-sm text-muted-foreground">
              Analyzing your pronunciation...
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-4">
            <div className={`text-center p-4 rounded-lg border ${getScoreColor(analysisResult.score)}`}>
              <div className="text-3xl font-bold mb-1">{analysisResult.score}%</div>
              <div className="text-lg font-medium mb-2">
                {getScoreMessage(analysisResult.score)}
              </div>
              <Badge variant="outline" className="mb-3">
                {analysisResult.score >= 90 ? 'Expert' : 
                 analysisResult.score >= 80 ? 'Advanced' : 
                 analysisResult.score >= 70 ? 'Intermediate' : 'Beginner'}
              </Badge>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Feedback</h4>
              <p className="text-blue-800">{analysisResult.feedback}</p>
            </div>

            <div className="flex justify-center gap-2">
              <Button onClick={resetRecording} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={playRecording} variant="outline" disabled={isPlaying}>
                <Play className="h-4 w-4 mr-2" />
                Replay Recording
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">📋 Instructions</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Click "Start Recording" and speak clearly</li>
            <li>• Pronounce the word as shown in the transliteration</li>
            <li>• Keep background noise to a minimum</li>
            <li>• Speak at a normal pace, not too fast or slow</li>
            <li>• The AI will analyze your pronunciation accuracy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedAudioRecorder;
