import React from 'react';
import { Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HearItButton from '@/components/word/HearItButton';
import SelfPracticeRecorder from '@/components/audio/SelfPracticeRecorder';
import { Word } from '@/utils/vocabulary-types';

interface AdvancedAudioRecorderProps {
  word: Word;
}

/**
 * Recording practice: record yourself and compare with the reference recitation.
 * (Previously displayed a randomly generated "accuracy score"; that has been removed.)
 */
const AdvancedAudioRecorder: React.FC<AdvancedAudioRecorderProps> = ({ word }) => {
  return (
    <Card className="rounded-3xl shadow-none w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Record and compare
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <h2 className="arabic-text text-5xl mb-2">{word.arabic}</h2>
          <p className="text-xl text-muted-foreground">/{word.transliteration}/</p>
          <p className="text-lg mt-2">{word.meaning}</p>
        </div>

        <div className="flex justify-center">
          <HearItButton word={word} attribution>
            Hear the reference
          </HearItButton>
        </div>

        <SelfPracticeRecorder word={word} />

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">How to practise</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Listen to the reference recitation</li>
            <li>• Record yourself saying the word clearly</li>
            <li>• Play both back and listen for differences in vowels, length and letter sounds</li>
            <li>• Repeat until your recording sounds close to the recitation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedAudioRecorder;
