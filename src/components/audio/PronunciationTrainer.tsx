import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Mic } from 'lucide-react';
import HearItButton from '@/components/word/HearItButton';
import SelfPracticeRecorder from '@/components/audio/SelfPracticeRecorder';
import { Word } from '@/utils/vocabulary-types';

interface PronunciationTrainerProps {
  word: Word;
  /** Called when the learner finishes practising this word and moves on. */
  onComplete?: () => void;
}

/**
 * Listen → record → compare. Self-practice only; there is no automatic pronunciation scoring.
 */
const PronunciationTrainer: React.FC<PronunciationTrainerProps> = ({ word, onComplete }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div>
          <h2 className="arabic-text text-5xl mb-2">{word.arabic}</h2>
          <p className="text-xl text-muted-foreground">/{word.transliteration}/</p>
          <p className="text-lg mt-2">{word.meaning}</p>
        </div>
        <div className="flex justify-center">
          <HearItButton word={word} attribution>
            1. Listen
          </HearItButton>
        </div>
      </div>

      <Card className="rounded-3xl shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            2. Record yourself and compare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SelfPracticeRecorder word={word} onDone={onComplete} />
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-none border-0 bg-secondary text-secondary-foreground">
        <CardContent className="p-4">
          <h4 className="font-semibold text-secondary-foreground mb-2 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Practice tips
          </h4>
          <ul className="text-sm text-secondary-foreground space-y-1">
            <li>• Listen to the recitation several times before recording</li>
            <li>• Play your recording and the recitation back-to-back and listen for differences</li>
            <li>• Pay attention to long vowels, emphatic letters and letters from the throat</li>
            <li>• For reliable feedback on tajweed, recite to a qualified teacher</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PronunciationTrainer;
