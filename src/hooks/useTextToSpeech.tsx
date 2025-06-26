
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useTextToSpeech = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSpeech = useCallback(async (text: string, voice: string = 'Aria') => {
    try {
      setIsLoading(true);
      console.log('Generating speech for:', text, 'with voice:', voice);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.audioContent) {
        // Create blob URL from base64 audio
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        console.log('Audio generated successfully');
        return url;
      }

      throw new Error('No audio content received');
    } catch (error: any) {
      console.error('Text-to-speech error:', error);
      toast({
        title: "Speech Generation Failed",
        description: error.message || 'Please try again. Make sure your ElevenLabs API key is configured correctly.',
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const playAudio = useCallback((url: string) => {
    const audio = new Audio(url);
    audio.play().catch(error => {
      console.error('Audio playback error:', error);
      toast({
        title: "Playback Failed",
        description: 'Could not play audio',
        variant: "destructive"
      });
    });
  }, [toast]);

  const cleanup = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  return {
    generateSpeech,
    playAudio,
    cleanup,
    isLoading,
    audioUrl
  };
};
