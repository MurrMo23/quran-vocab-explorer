
import React from 'react';
import { Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AudioPlayer from '@/components/AudioPlayer';
import SelfPracticeRecorder from '@/components/audio/SelfPracticeRecorder';
import { Word } from '@/utils/vocabulary-types';

interface PronunciationGuideProps {
  word: Word;
  /** @deprecated Automatic scoring was removed (it was random); this is never called. */
  onPronunciationScore?: (score: number) => void;
}

interface PhoneticBreakdown {
  syllables: string[];
  stress: number[]; // indices of stressed syllables
  phonemes: { symbol: string; description: string }[];
}

const PronunciationGuide: React.FC<PronunciationGuideProps> = ({ word }) => {
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

        <div className="flex justify-center">
          <AudioPlayer word={word} label="Listen" size="lg" />
        </div>

        {/* Syllable breakdown (visual guide only) */}
        <div>
          <h3 className="font-semibold mb-3">Syllable Breakdown</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {phoneticBreakdown.syllables.map((syllable, index) => (
              <span
                key={index}
                className={`relative rounded-md border px-4 py-2 text-lg ${phoneticBreakdown.stress.includes(index) ? 'font-bold' : ''}`}
              >
                {syllable}
                {phoneticBreakdown.stress.includes(index) && (
                  <span className="absolute -top-1 -right-1 text-xs">ˈ</span>
                )}
              </span>
            ))}
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

        {/* Pronunciation practice: record and compare by ear (no automatic scoring) */}
        <div>
          <h3 className="font-semibold mb-3">Practice: record yourself and compare</h3>
          <SelfPracticeRecorder word={word} />
        </div>

        {/* Pronunciation tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Pronunciation Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Listen to the recitation several times before attempting to repeat</li>
            <li>• Pay attention to stressed syllables (marked with ˈ)</li>
            <li>• Arabic emphatic consonants are pronounced with tongue backing</li>
            <li>• Compare your recording with the recitation and repeat until they sound alike</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PronunciationGuide;
