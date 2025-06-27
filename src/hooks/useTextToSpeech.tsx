
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTextToSpeech = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSpeech = useCallback(async (text: string, voiceId: string = 'Aria') => {
    try {
      setIsLoading(true);
      console.log('Generating speech for:', text, 'with voice ID:', voiceId);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceId }
      });

      if (error) {
        console.error('Supabase function error:', error);
        // Fallback to Web Speech API for Arabic text
        if ('speechSynthesis' in window) {
          return generateWebSpeech(text);
        }
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

      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        return generateWebSpeech(text);
      }

      throw new Error('No audio content received and no fallback available');
    } catch (error: any) {
      console.error('Text-to-speech error:', error);
      
      // Try Web Speech API as fallback
      if ('speechSynthesis' in window) {
        try {
          return generateWebSpeech(text);
        } catch (fallbackError) {
          console.error('Web Speech API fallback failed:', fallbackError);
        }
      }
      
      toast({
        title: "Speech Generation Failed",
        description: 'Using fallback speech synthesis. For better quality, configure your ElevenLabs API key.',
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const generateWebSpeech = useCallback((text: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set Arabic voice if available
      const voices = speechSynthesis.getVoices();
      const arabicVoice = voices.find(voice => 
        voice.lang.includes('ar') || voice.name.includes('Arabic')
      );
      
      if (arabicVoice) {
        utterance.voice = arabicVoice;
        utterance.lang = 'ar-SA';
      } else {
        utterance.lang = 'en-US';
      }
      
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        console.log('Web Speech API started');
        // Create a mock URL for consistency
        resolve('web-speech-api');
      };

      utterance.onerror = (event) => {
        console.error('Web Speech API error:', event);
        reject(new Error('Web Speech API failed'));
      };

      speechSynthesis.speak(utterance);
    });
  }, []);

  const playAudio = useCallback((url: string) => {
    if (url === 'web-speech-api') {
      // Already playing via Web Speech API
      return;
    }
    
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
    if (audioUrl && audioUrl !== 'web-speech-api') {
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
