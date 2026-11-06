import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { Word } from '@/utils/vocabulary-types';
import {
  AudioPlaybackError,
  AudioSource,
  COMPUTER_VOICE_LABEL,
  getAudioSources,
  getAyahAudioSource,
  playAudioUrl,
  speakArabicFallback,
  stopAllAudio,
} from '@/utils/audio';

/**
 * Audio playback hook.
 *
 * Plays genuine Quran recitation (Quran.com word-by-word, EveryAyah ayah recitation) whenever
 * a word or ayah reference is known. For arbitrary Arabic text it can fall back to the
 * browser's speech synthesis, which is always labelled as an approximate computer voice.
 *
 * No server-side text-to-speech is used.
 */

/** Sentinel returned by generateSpeech when the browser computer voice is speaking. */
export const WEB_SPEECH_SENTINEL = 'web-speech-api';

export interface NowPlaying {
  kind: 'word' | 'ayah' | 'computer';
  label: string;
  shortLabel: string;
}

const COMPUTER_VOICE: NowPlaying = {
  kind: 'computer',
  label: `${COMPUTER_VOICE_LABEL} — not a Quran recitation`,
  shortLabel: COMPUTER_VOICE_LABEL,
};

export const useTextToSpeech = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const elementRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (elementRef.current) {
        elementRef.current.pause();
        elementRef.current = null;
      }
    };
  }, []);

  const markStopped = useCallback(() => {
    if (!mountedRef.current) return;
    setIsPlaying(false);
    setNowPlaying(null);
  }, []);

  /** Try each recitation source in order; a missing file falls through to the next one. */
  const playSources = useCallback(
    async (sources: AudioSource[]): Promise<boolean> => {
      if (sources.length === 0) {
        toast.error('No recitation available', {
          description: 'There is no recitation audio for this item yet.',
        });
        return false;
      }
      setIsLoading(true);
      try {
        for (const source of sources) {
          try {
            const audio = await playAudioUrl(source.url);
            if (!mountedRef.current) {
              audio.pause();
              return false;
            }
            elementRef.current = audio;
            const onStop = () => {
              if (elementRef.current === audio) {
                elementRef.current = null;
                markStopped();
              }
            };
            audio.addEventListener('ended', onStop, { once: true });
            audio.addEventListener('pause', onStop, { once: true });
            audio.addEventListener('error', onStop, { once: true });
            setAudioUrl(source.url);
            setNowPlaying({ kind: source.kind, label: source.label, shortLabel: source.shortLabel });
            setIsPlaying(true);
            return true;
          } catch (err) {
            if (err instanceof AudioPlaybackError && err.reason === 'blocked') {
              toast.info('Tap play to listen', {
                description: 'Your browser blocked automatic playback.',
              });
              return false;
            }
            // 'unavailable' → try the next source
          }
        }
        toast.error('Recitation unavailable', {
          description: 'The recitation audio could not be loaded. Please check your connection.',
        });
        return false;
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [markStopped]
  );

  /** Play the best genuine recitation for a word (word audio, else its first example's ayah). */
  const playWord = useCallback((word: Word) => playSources(getAudioSources(word)), [playSources]);

  /** Play the recitation of a full ayah. */
  const playAyah = useCallback(
    (surah: number, ayah: number) => {
      const source = getAyahAudioSource(surah, ayah);
      return playSources(source ? [source] : []);
    },
    [playSources]
  );

  /** Speak arbitrary Arabic text with the browser computer voice. Returns false if unsupported. */
  const speak = useCallback(
    (text: string): boolean => {
      elementRef.current = null;
      const started = speakArabicFallback(text, {
        onStart: () => {
          if (!mountedRef.current) return;
          setNowPlaying(COMPUTER_VOICE);
          setIsPlaying(true);
        },
        onEnd: markStopped,
        onError: () => {
          markStopped();
          toast.error('Computer voice failed', {
            description: 'Your browser could not speak this text.',
          });
        },
      });
      if (!started) {
        toast.error('Audio not available', {
          description: 'No recitation exists for this text and your browser has no speech support.',
        });
        return false;
      }
      // Some browsers fire onstart late (or never); reflect state immediately.
      setNowPlaying(COMPUTER_VOICE);
      setIsPlaying(true);
      return true;
    },
    [markStopped]
  );

  const stop = useCallback(() => {
    stopAllAudio();
    elementRef.current = null;
    markStopped();
  }, [markStopped]);

  // ---------------------------------------------------------------------------------------
  // Backwards-compatible API (previously backed by a server-side TTS Edge Function).
  // ---------------------------------------------------------------------------------------

  /**
   * @deprecated Use playWord / playAyah for recitation or speak() for text.
   * Speaks the text with the browser computer voice and returns WEB_SPEECH_SENTINEL, or null
   * if unsupported. The voiceId argument is ignored.
   */
  const generateSpeech = useCallback(
    async (text: string, _voiceId?: string): Promise<string | null> => {
      return speak(text) ? WEB_SPEECH_SENTINEL : null;
    },
    [speak]
  );

  /** @deprecated Plays a URL (no-op for WEB_SPEECH_SENTINEL, which is already speaking). */
  const playAudio = useCallback(
    (url: string) => {
      if (!url || url === WEB_SPEECH_SENTINEL) return;
      void playSources([{ url, kind: 'ayah', label: 'Audio', shortLabel: 'Audio' }]);
    },
    [playSources]
  );

  /** @deprecated Kept for compatibility; stops playback. */
  const cleanup = useCallback(() => {
    stop();
    setAudioUrl(null);
  }, [stop]);

  return {
    playWord,
    playAyah,
    playSources,
    speak,
    stop,
    isPlaying,
    nowPlaying,
    isLoading,
    // compat
    generateSpeech,
    playAudio,
    cleanup,
    audioUrl,
  };
};
