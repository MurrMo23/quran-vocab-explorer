import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Volume2, Mic, Headphones } from 'lucide-react';
import PronunciationTrainer from '@/components/audio/PronunciationTrainer';
import ListeningExercise from '@/components/audio/ListeningExercise';
import AdvancedAudioRecorder from '@/components/audio/AdvancedAudioRecorder';
import { getDailyWords } from '@/utils/vocabulary';
import { Word } from '@/utils/vocabulary-types';
const AudioPractice = () => {
  const navigate = useNavigate();
  const [practiceWords] = useState<Word[]>(getDailyWords(15));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [practicedCount, setPracticedCount] = useState(0);
  const currentWord = practiceWords[currentWordIndex];
  const handlePronunciationComplete = () => {
    setPracticedCount(prev => Math.min(prev + 1, practiceWords.length));
    if (currentWordIndex < practiceWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    }
  };
  const handleListeningComplete = (_score: number) => {
    // Listening quiz scores are shown inside the exercise itself.
  };
  return <div className="max-w-4xl mx-auto space-y-6 my-[20px]">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Audio Practice</h1>
          <p className="text-muted-foreground">Improve your Arabic pronunciation and listening skills</p>
        </div>
      </div>

      <Tabs defaultValue="pronunciation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pronunciation" className="gap-2">
            <Volume2 className="h-4 w-4" />
            Pronunciation
          </TabsTrigger>
          <TabsTrigger value="listening" className="gap-2">
            <Headphones className="h-4 w-4" />
            Listening
          </TabsTrigger>
          <TabsTrigger value="recording" className="gap-2">
            <Mic className="h-4 w-4" />
            Recording
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pronunciation" className="space-y-6">
          <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <CardHeader>
              <CardTitle>Pronunciation Training</CardTitle>
              <p className="text-sm text-muted-foreground">
                Listen to the recitation, record yourself and compare ({currentWordIndex + 1}/{practiceWords.length})
              </p>
            </CardHeader>
            <CardContent>
              {currentWord && <PronunciationTrainer word={currentWord} onComplete={handlePronunciationComplete} />}
            </CardContent>
          </Card>

          {practicedCount > 0 && <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <span>Words practised:</span>
                  <span className="font-semibold">{practicedCount} / {practiceWords.length}</span>
                </div>
              </CardContent>
            </Card>}
        </TabsContent>

        <TabsContent value="listening" className="space-y-6">
          <ListeningExercise words={practiceWords} onComplete={handleListeningComplete} />
        </TabsContent>

        <TabsContent value="recording" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recording Practice</CardTitle>
              <p className="text-sm text-muted-foreground">
                Record yourself and compare with the recitation — recordings stay on your device
              </p>
            </CardHeader>
            <CardContent>
              {currentWord && <AdvancedAudioRecorder word={currentWord} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default AudioPractice;