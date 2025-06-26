
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export interface AudioRecording {
  id: string;
  user_id: string;
  word_id: string;
  recording_url: string;
  accuracy_score?: number;
  feedback?: string;
  created_at: string;
}

export const useAudioRecording = () => {
  const { session } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    feedback: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording started. Speak clearly!');
    } catch (error: any) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info('Recording stopped. Analyzing...');
    }
  };

  const analyzeRecording = async (wordId: string, expectedPronunciation: string) => {
    if (!audioBlob || !session?.user?.id) return null;

    try {
      setLoading(true);
      
      // Create a mock analysis since we don't have a real speech recognition API
      // In a real implementation, you would send the audio to a speech analysis service
      const mockScore = Math.floor(Math.random() * 30) + 70; // 70-100 range
      const mockFeedback = mockScore >= 90 ? 
        'Excellent pronunciation! Your accent is very clear.' :
        mockScore >= 80 ?
        'Good pronunciation! Try to emphasize the stressed syllables more.' :
        'Keep practicing! Focus on the vowel sounds and consonant clarity.';

      const result = {
        score: mockScore,
        feedback: mockFeedback
      };

      setAnalysisResult(result);
      
      // Save recording to database (in a real app, you'd upload to storage first)
      await saveRecording(wordId, 'mock-url', result.score, result.feedback);
      
      return result;
    } catch (error: any) {
      console.error('Error analyzing recording:', error);
      toast.error('Failed to analyze recording');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveRecording = async (
    wordId: string, 
    recordingUrl: string, 
    accuracyScore?: number, 
    feedback?: string
  ) => {
    if (!session?.user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('audio_recordings')
        .insert({
          user_id: session.user.id,
          word_id: wordId,
          recording_url: recordingUrl,
          accuracy_score: accuracyScore,
          feedback: feedback
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error saving recording:', error);
      toast.error('Failed to save recording');
      return null;
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAnalysisResult(null);
    audioChunksRef.current = [];
  };

  return {
    isRecording,
    audioBlob,
    analysisResult,
    loading,
    startRecording,
    stopRecording,
    analyzeRecording,
    resetRecording
  };
};
