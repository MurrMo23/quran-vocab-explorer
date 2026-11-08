import React, { useEffect, useMemo, useState } from 'react';
import { AudioWaveform, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import type { Word } from '@/utils/vocabulary-types';
import { AudioSource, COMPUTER_VOICE_LABEL, getAudioSources, getAyahAudioSource, getRecitationSources, isSpeechSupported } from '@/utils/audio';
import { track } from '@/lib/analytics';

interface WordAudioButtonProps {
  /** Play this word: its AI-voice pronunciation (default) or, with `quran`, its genuine recitation. */
  word?: Word;
  /** Play the word as recited in the Quran (Alafasy) instead of the AI-voice pronunciation. */
  quran?: boolean;
  /** Play the recitation of this ayah (both required). */
  surah?: number;
  ayah?: number;
  /** Visible button text when nothing is playing. */
  children: React.ReactNode;
  /** Allow the browser computer voice for the word's Arabic when no recitation exists (default true). */
  allowComputerVoice?: boolean;
  /** Icon shown when idle: speaker for the word, play triangle for a verse. */
  icon?: 'speaker' | 'play';
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
}

const nowPlayingKind = (sources: AudioSource[]) => sources[0]?.kind;

/**
 * Word-page audio button: the same playback rules as AudioPlayer (genuine recitation first,
 * clearly labelled computer voice only as a fallback), styled as a full tactile button.
 */
const WordAudioButton: React.FC<WordAudioButtonProps> = ({
  word,
  quran = false,
  surah,
  ayah,
  children,
  allowComputerVoice = true,
  icon = 'speaker',
  variant = 'gold',
  size = 'lg',
  className,
}) => {
  const { playSources, speak, stop, isPlaying, isLoading, nowPlaying } = useTextToSpeech();

  const sources: AudioSource[] = useMemo(() => {
    if (word) return quran ? getRecitationSources(word) : getAudioSources(word);
    if (surah !== undefined && ayah !== undefined) {
      const s = getAyahAudioSource(surah, ayah);
      return s ? [s] : [];
    }
    return [];
  }, [word, quran, surah, ayah]);

  // Speech support is browser-only; checked after mount so the prerendered HTML matches hydration.
  const [speechSupported, setSpeechSupported] = useState(false);
  useEffect(() => setSpeechSupported(isSpeechSupported()), []);

  const fallbackText = word?.arabic;
  const canSpeak = allowComputerVoice && !!fallbackText && speechSupported;
  const hasRecitation = sources.length > 0;
  const available = hasRecitation || canSpeak;

  const plannedLabel = hasRecitation ? sources[0].shortLabel : canSpeak ? COMPUTER_VOICE_LABEL : 'No audio available';
  const statusLabel = isPlaying && nowPlaying ? nowPlaying.shortLabel : plannedLabel;
  const title = available ? `${isPlaying ? 'Stop' : 'Play'}: ${statusLabel}` : 'No recitation audio available for this item';

  const handleClick = async () => {
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
    if (started)
      track('audio_play', {
        kind: !word
          ? 'ayah'
          : nowPlayingKind(sources) === 'pronunciation'
            ? 'pronunciation'
            : sources[0]?.kind === 'ayah'
              ? 'ayah'
              : word.quranicForm && !word.location
                ? 'related'
                : 'word',
      });
  };

  const Icon = !available ? VolumeX : isLoading ? AudioWaveform : isPlaying ? Pause : icon === 'play' ? Play : Volume2;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={!available || isLoading}
      title={title}
      aria-label={`${typeof children === 'string' ? `${children}. ` : ''}${title}`}
      className={cn('font-extrabold [&_svg]:size-5', className)}
    >
      <Icon className={cn(isLoading && 'animate-pulse')} aria-hidden="true" />
      {isPlaying ? 'Stop' : children}
    </Button>
  );
};

export default WordAudioButton;
