
import React, { useState } from 'react';
import { Volume2, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Word } from '@/utils/vocabulary-types';

interface PronunciationGuideProps {
  word: Word;
  onPronunciationScore?: (score: number) => void;
}

interface PhoneticBreakdown {
  syllables: string[];
  stress: number[]; // indices of stressed syllables
  phonemes: { symbol: string; description: string }[];
}

const PronunciationGuide: React.FC<PronunciationGuideProps> = ({ 
  word, 
  onPronunciationScore 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSyllable, setCurrentSyllable] = useState(-1);
  const [userRecording, setUserRecording] = useState(false);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);

  // Mock phonetic breakdown - in a real app, this would come from a phonetic API
  const getPhoneticBreakdown = (word: Word): PhoneticBreakdown => {
    const syllablePatterns: { [key: string]: PhoneticBreakdown } = {
      'اللّٰه': {
        syllables: ['Al', 'lah'],
        stress: [1],
        phonemes: [
          { symbol: 'ʔ', description: 'Glottal stop' },
          { symbol: 'a', description: 'Short a' },
          { symbol: 'l', description: 'Clear L' },
          { symbol: 'l', description: 'Emphatic L' },
          { symbol: 'a', description: 'Long a' },
          { symbol: 'h', description: 'Aspirated h' }
        ]
      },
      'صَلاة': {
        syllables: ['Sa', 'lah'],
        stress: [0],
        phonemes: [
          { symbol: 'sˤ', description: 'Emphatic S' },
          { symbol: 'a', description: 'Short a' },
          { symbol: 'l', description: 'Clear L' },
          { symbol: 'a', description: 'Long a' },
          { symbol: 'h', description: 'Soft h' }
        ]
      }
    };

    return syllablePatterns[word.arabic] || {
      syllables: word.transliteration.split(/[-\s]/),
      stress: [0],
      phonemes: []
    };
  };

  const phoneticBreakdown = getPhoneticBreakdown(word);

  const playPronunciation = async (syllableIndex?: number) => {
    setIsPlaying(true);
    
    if (syllableIndex !== undefined) {
      setCurrentSyllable(syllableIndex);
      // Simulate syllable-by-syllable playback
      setTimeout(() => {
        setCurrentSyllable(-1);
        setIsPlaying(false);
      }, 800);
    } else {
      // Play full word
      for (let i = 0; i < phoneticBreakdown.syllables.length; i++) {
        setCurrentSyllable(i);
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      setCurrentSyllable(-1);
      setIsPlaying(false);
    }
  };

  const startRecording = () => {
    setUserRecording(true);
    // Mock recording and analysis
    setTimeout(() => {
      const mockScore = Math.floor(Math.random() * 30) + 70; // 70-100 range
      setPronunciationScore(mockScore);
      setUserRecording(false);
      if (onPronunciationScore) {
        onPronunciationScore(mockScore);
      }
    }, 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Pronunciation Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main word display */}
        <div className="text-center">
          <h2 className="arabic-text text-6xl mb-2">{word.arabic}</h2>
          <p className="text-xl text-muted-foreground">/{word.transliteration}/</p>
        </div>

        {/* Syllable breakdown */}
        <div>
          <h3 className="font-semibold mb-3">Syllable Breakdown</h3>
          <div className="flex justify-center gap-2 mb-4">
            {phoneticBreakdown.syllables.map((syllable, index) => (
              <Button
                key={index}
                variant={currentSyllable === index ? "default" : "outline"}
                size="lg"
                onClick={() => playPronunciation(index)}
                className={`relative ${phoneticBreakdown.stress.includes(index) ? 'font-bold' : ''}`}
              >
                {syllable}
                {phoneticBreakdown.stress.includes(index) && (
                  <span className="absolute -top-1 -right-1 text-xs">ˈ</span>
                )}
              </Button>
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <Button onClick={() => playPronunciation()} disabled={isPlaying}>
              {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Play Full Word
            </Button>
          </div>
        </div>

        {/* Phonetic details */}
        {phoneticBreakdown.phonemes.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Phonetic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {phoneticBreakdown.phonemes.map((phoneme, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  <span className="font-mono text-lg font-bold w-8">[{phoneme.symbol}]</span>
                  <span className="text-sm text-muted-foreground">{phoneme.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pronunciation practice */}
        <div>
          <h3 className="font-semibold mb-3">Practice Your Pronunciation</h3>
          <div className="text-center space-y-4">
            {!userRecording && !pronunciationScore && (
              <Button onClick={startRecording} size="lg" className="w-full md:w-auto">
                <Volume2 className="h-4 w-4 mr-2" />
                Record Your Pronunciation
              </Button>
            )}
            
            {userRecording && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Recording... Speak now!</span>
                </div>
                <Progress value={66} className="w-full max-w-xs mx-auto" />
              </div>
            )}
            
            {pronunciationScore && (
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${getScoreColor(pronunciationScore)}`}>
                  {pronunciationScore}%
                </div>
                <p className="text-muted-foreground">
                  {pronunciationScore >= 90 ? 'Excellent!' : 
                   pronunciationScore >= 80 ? 'Good job!' : 'Keep practicing!'}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPronunciationScore(null);
                    setUserRecording(false);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Pronunciation tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Pronunciation Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Listen carefully to each syllable before attempting to repeat</li>
            <li>• Pay attention to stressed syllables (marked with ˈ)</li>
            <li>• Arabic emphatic consonants are pronounced with tongue backing</li>
            <li>• Practice in a quiet environment for better recording quality</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PronunciationGuide;
