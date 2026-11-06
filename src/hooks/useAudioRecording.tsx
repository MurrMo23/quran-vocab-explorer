import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Microphone recording for self-practice. Recordings stay in the browser (an object URL);
 * nothing is uploaded and no automatic "accuracy score" is produced — learners compare their
 * own recording with the reference recitation by ear.
 */

// Row shape of the `audio_recordings` table (kept for type compatibility).
export interface AudioRecording {
  id: string;
  user_id: string;
  word_id: string;
  recording_url: string;
  accuracy_score?: number;
  feedback?: string;
  created_at: string;
}

export const isRecordingSupported = (): boolean =>
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof window !== 'undefined' &&
  'MediaRecorder' in window;

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);

  const releaseUrl = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  useEffect(
    () => () => {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      releaseStream();
      releaseUrl();
    },
    []
  );

  const startRecording = useCallback(async () => {
    if (!isRecordingSupported()) {
      toast.error('Recording not supported', {
        description: 'Your browser does not support microphone recording.',
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        releaseUrl();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setAudioBlob(blob);
        setRecordingUrl(url);
        releaseStream();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      releaseStream();
      toast.error('Could not start recording', {
        description: 'Please allow microphone access and try again.',
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const resetRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    releaseStream();
    releaseUrl();
    setIsRecording(false);
    setAudioBlob(null);
    setRecordingUrl(null);
    audioChunksRef.current = [];
  }, []);

  return {
    isRecording,
    audioBlob,
    recordingUrl,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
