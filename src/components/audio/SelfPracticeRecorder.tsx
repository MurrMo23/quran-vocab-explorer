import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAudioRecording, isRecordingSupported } from '@/hooks/useAudioRecording';
import { stopAllAudio } from '@/utils/audio';
import HearItButton from '@/components/word/HearItButton';
import type { Word } from '@/utils/vocabulary-types';

interface SelfPracticeRecorderProps {
  word: Word;
  /** Called after the learner has made at least one recording and chooses to move on. */
  onDone?: () => void;
  doneLabel?: string;
}

/**
 * Honest self-practice: record yourself, then listen to your recording and the reference
 * recitation back-to-back and compare by ear. No automatic scoring is performed.
 */
const SelfPracticeRecorder: React.FC<SelfPracticeRecorderProps> = ({ word, onDone, doneLabel = 'Next word' }) => {
  const { isRecording, recordingUrl, startRecording, stopRecording, resetRecording } = useAudioRecording();
  const [isPlayingMine, setIsPlayingMine] = useState(false);
  const mineRef = useRef<HTMLAudioElement | null>(null);
  const supported = isRecordingSupported();

  // New word → discard the previous recording.
  useEffect(() => {
    resetRecording();
    setIsPlayingMine(false);
  }, [word.id, resetRecording]);

  useEffect(() => () => mineRef.current?.pause(), []);

  const playMine = () => {
    if (!recordingUrl) return;
    if (isPlayingMine) {
      mineRef.current?.pause();
      setIsPlayingMine(false);
      return;
    }
    stopAllAudio();
    const audio = new Audio(recordingUrl);
    mineRef.current = audio;
    audio.onended = () => setIsPlayingMine(false);
    audio.onpause = () => setIsPlayingMine(false);
    audio
      .play()
      .then(() => setIsPlayingMine(true))
      .catch(() => toast.error('Could not play your recording'));
  };

  if (!supported) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        Microphone recording isn't supported in this browser. You can still listen to the recitation and
        repeat it aloud.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {!isRecording ? (
          <Button onClick={startRecording} size="lg" variant={recordingUrl ? 'outline' : 'default'}>
            {recordingUrl ? <RotateCcw className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {recordingUrl ? 'Record again' : 'Record yourself'}
          </Button>
        ) : (
          <Button onClick={stopRecording} size="lg" variant="destructive">
            <Square className="h-4 w-4 mr-2" />
            Stop recording
          </Button>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span>Recording… say “{word.transliteration}”, then press stop.</span>
        </div>
      )}

      {recordingUrl && !isRecording && (
        <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
          <p className="text-sm font-medium text-center">Compare: listen to both, then try again</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={playMine}
              aria-pressed={isPlayingMine}
              aria-label={isPlayingMine ? 'Stop your recording' : 'Play your recording'}
              className="w-full font-extrabold [&_svg]:size-5"
            >
              {isPlayingMine ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              {isPlayingMine ? 'Stop' : 'Your recording'}
            </Button>
            <HearItButton word={word} size="sm" className="items-stretch">
              Reference
            </HearItButton>
          </div>
          {onDone && (
            <div className="flex justify-center pt-1">
              <Button onClick={onDone}>{doneLabel}</Button>
            </div>
          )}
        </div>
      )}

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        Your recording stays on this device and is not uploaded or automatically scored — compare it
        with the recitation yourself.
      </p>
    </div>
  );
};

export default SelfPracticeRecorder;
