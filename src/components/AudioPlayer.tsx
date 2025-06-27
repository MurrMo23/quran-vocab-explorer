
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, AudioWaveform } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface AudioPlayerProps {
  src?: string;
  label?: string;
  className?: string;
  onPlay?: () => void;
  text?: string; // Text to convert to speech if no src provided
  voice?: string; // Voice for TTS
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  src, 
  label = "Listen", 
  className,
  onPlay,
  text,
  voice = 'Aria', // Changed to Aria for better Arabic support
  size = 'md',
  onClick
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [currentAudioSrc, setCurrentAudioSrc] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { generateSpeech, playAudio, isLoading: ttsLoading } = useTextToSpeech();

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'w-8 h-8',
      icon: 'h-4 w-4',
      mute: 'w-6 h-6'
    },
    md: {
      button: 'w-10 h-10',
      icon: 'h-5 w-5',
      mute: 'w-8 h-8'
    },
    lg: {
      button: 'w-12 h-12',
      icon: 'h-6 w-6',
      mute: 'w-10 h-10'
    }
  };

  // Initialize audio source
  useEffect(() => {
    if (src) {
      setCurrentAudioSrc(src);
      setError(false);
    } else if (text) {
      setCurrentAudioSrc('');
    }
    setIsPlaying(false);
  }, [src, text]);

  // Update audio element source when currentAudioSrc changes
  useEffect(() => {
    if (audioRef.current && currentAudioSrc && currentAudioSrc !== 'web-speech-api') {
      audioRef.current.src = currentAudioSrc;
      audioRef.current.load();
    }
  }, [currentAudioSrc]);

  const togglePlay = async (e: React.MouseEvent) => {
    // Prevent event from bubbling up to parent elements
    e.preventDefault();
    e.stopPropagation();
    
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Stop Web Speech API if it's being used
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    // If we don't have an audio source but have text, generate TTS
    if (!currentAudioSrc && text) {
      try {
        console.log('Generating TTS for:', text, 'with voice:', voice);
        const ttsUrl = await generateSpeech(text, voice);
        if (ttsUrl) {
          setCurrentAudioSrc(ttsUrl);
          setError(false);
          
          if (ttsUrl === 'web-speech-api') {
            // Web Speech API is already playing
            setIsPlaying(true);
            if (onPlay) onPlay();
            return;
          }
          
          // Play after a brief delay to ensure audio is loaded
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  if (onPlay) onPlay();
                })
                .catch(err => {
                  console.error('TTS Audio playback error:', err);
                  setError(true);
                });
            }
          }, 100);
          return;
        } else {
          setError(true);
          return;
        }
      } catch (error) {
        console.error('TTS generation failed:', error);
        setError(true);
        return;
      }
    }

    // Play existing audio source
    if (currentAudioSrc && currentAudioSrc !== 'web-speech-api' && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setError(false);
          if (onPlay) onPlay();
        })
        .catch(err => {
          console.error('Audio playback error:', err);
          setError(true);
          toast({
            title: "Playback Error",
            description: "Could not play audio. Please try again.",
            variant: "destructive"
          });
        });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!audioRef.current) return;
    
    const newMutedState = !isMuted;
    audioRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    console.error('Audio element error for source:', currentAudioSrc);
    setError(true);
    setIsPlaying(false);
  };

  const handleCanPlay = () => {
    console.log('Audio can play:', currentAudioSrc);
    setError(false);
  };

  // Listen for Web Speech API events
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const handleSpeechEnd = () => {
      setIsPlaying(false);
    };

    speechSynthesis.addEventListener('voiceschanged', handleSpeechEnd);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', handleSpeechEnd);
    };
  }, []);

  const isLoadingAudio = ttsLoading && !src && text;
  const isDisabled = Boolean(isLoadingAudio || error);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <audio 
        ref={audioRef} 
        onEnded={handleEnded}
        onError={handleError}
        onCanPlay={handleCanPlay}
        className="hidden"
      />
      
      <div
        onClick={togglePlay}
        className={cn(
          "flex items-center justify-center rounded-full transition-colors cursor-pointer",
          sizeConfig[size].button,
          isPlaying ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20",
          isDisabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoadingAudio ? (
          <AudioWaveform className={cn(sizeConfig[size].icon, "animate-pulse")} />
        ) : isPlaying ? (
          <Pause className={sizeConfig[size].icon} />
        ) : (
          <Play className={sizeConfig[size].icon} />
        )}
      </div>
      
      {label && size !== 'sm' && <span className="text-sm">{label}</span>}
      
      {size !== 'sm' && currentAudioSrc && currentAudioSrc !== 'web-speech-api' && (
        <div
          onClick={toggleMute}
          className={cn(
            "flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ml-auto cursor-pointer",
            sizeConfig[size].mute,
            error && "opacity-50 cursor-not-allowed"
          )}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
