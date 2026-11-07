import React, { useEffect, useMemo, useState } from 'react';
import { Play, Pause, AudioWaveform, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import type { Word } from '@/utils/vocabulary-types';
import {
  AudioSource,
  COMPUTER_VOICE_LABEL,
  getAudioSources,
  getAyahAudioSource,
  isSpeechSupported,
} from '@/utils/audio';
import AudioAttribution from '@/components/audio/AudioAttribution';
import { track } from '@/lib/analytics';

interface AudioPlayerProps {
  /** Play the best genuine recitation for this word (word-by-word, else example ayah). */
  word?: Word;
  /** Play the recitation of this ayah (both required). */
  surah?: number;
  ayah?: number;
  /** Explicit audio URL (treated as recitation). */
  src?: string;
  /** Fallback label shown next to the button when nothing is playing. */
  label?: string;
  className?: string;
  onPlay?: () => void;
  /**
   * Arabic text to speak with the browser's computer voice when no recitation is available.
   * Always labelled "Computer voice (approximate)".
   */
  text?: string;
  /** @deprecated Ignored — server-side TTS voices are no longer used. */
  voice?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Allow the computer-voice fallback for `text` (default true). */
  allowComputerVoice?: boolean;
  /** Show the recitation attribution line (default: true for md/lg when recitation is used). */
  showAttribution?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const sizeConfig = {
  // The small button stays 32px visually but gets a 44px tap target via an invisible ::after.
  sm: { button: "w-8 h-8 relative after:absolute after:-inset-1.5 after:content-['']", icon: 'h-4 w-4' },
  md: { button: 'w-10 h-10', icon: 'h-5 w-5' },
  lg: { button: 'w-12 h-12', icon: 'h-6 w-6' },
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  word,
  surah,
  ayah,
  src,
  label = 'Listen',
  className,
  onPlay,
  text,
  size = 'md',
  allowComputerVoice = true,
  showAttribution,
  onClick,
}) => {
  const { playSources, speak, stop, isPlaying, isLoading, nowPlaying } = useTextToSpeech();

  const sources: AudioSource[] = useMemo(() => {
    if (src) {
      return [{ url: src, kind: 'ayah', label: 'Recitation', shortLabel: 'Recitation' }];
    }
    if (word) return getAudioSources(word);
    if (surah !== undefined && ayah !== undefined) {
      const s = getAyahAudioSource(surah, ayah);
      return s ? [s] : [];
    }
    return [];
  }, [src, word, surah, ayah]);

  const fallbackText = text ?? word?.arabic;
  // Speech support is a browser fact: check it after mount so prerendered HTML and the first client
  // render agree (no hydration mismatch on words without a recitation).
  const [speechSupported, setSpeechSupported] = useState(false);
  useEffect(() => setSpeechSupported(isSpeechSupported()), []);
  const canSpeak = allowComputerVoice && !!fallbackText && speechSupported;
  const hasRecitation = sources.length > 0;
  const available = hasRecitation || canSpeak;

  // What the button will play, so users know before pressing it.
  const plannedLabel = hasRecitation ? sources[0].shortLabel : canSpeak ? COMPUTER_VOICE_LABEL : 'No audio available';
  const statusLabel = isPlaying && nowPlaying ? nowPlaying.shortLabel : plannedLabel;
  const isComputer = isPlaying ? nowPlaying?.kind === 'computer' : !hasRecitation;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.(e);
    if (!available) return;

    if (isPlaying) {
      stop();
      return;
    }

    let started = false;
    if (hasRecitation) {
      started = await playSources(sources);
      // If every recitation source failed, fall back to the computer voice (clearly labelled).
      if (!started && canSpeak && fallbackText) started = speak(fallbackText);
    } else if (canSpeak && fallbackText) {
      started = speak(fallbackText);
    }
    if (started) track('audio_play', { kind: !word ? 'ayah' : sources[0]?.kind === 'ayah' ? 'ayah' : word.quranicForm && !word.location ? 'related' : 'word' });
    if (started) onPlay?.();
  };

  const showAttr = (showAttribution ?? size !== 'sm') && hasRecitation;
  const title = available
    ? `${isPlaying ? 'Stop' : 'Play'}: ${statusLabel}`
    : 'No recitation audio available for this item';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={!available || isLoading}
          aria-label={title}
          title={title}
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            sizeConfig[size].button,
            isPlaying ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary/10'
          )}
        >
          {!available ? (
            <VolumeX className={sizeConfig[size].icon} />
          ) : isLoading ? (
            <AudioWaveform className={cn(sizeConfig[size].icon, 'animate-pulse')} />
          ) : isPlaying ? (
            <Pause className={sizeConfig[size].icon} />
          ) : (
            <Play className={sizeConfig[size].icon} />
          )}
        </button>

        {size !== 'sm' && (
          <div className="flex min-w-0 flex-col leading-tight">
            {label && <span className="text-sm">{label}</span>}
            <span
              className={cn(
                'text-xs',
                isComputer && available ? 'text-amber-700' : 'text-muted-foreground'
              )}
            >
              {statusLabel}
            </span>
          </div>
        )}
      </div>
      {showAttr && <AudioAttribution />}
    </div>
  );
};

export default AudioPlayer;
