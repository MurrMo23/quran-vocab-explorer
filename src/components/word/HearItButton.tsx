import React, { useEffect, useMemo, useState } from 'react';
import { AudioWaveform, Square, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import type { Word } from '@/utils/vocabulary-types';
import { type AudioSource, COMPUTER_VOICE_LABEL, getAudioSources, isSpeechSupported } from '@/utils/audio';
import AudioAttribution from '@/components/audio/AudioAttribution';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export interface HearItButtonProps {
  /** Play this word: its AI-voice pronunciation, then genuine recitation, then the computer voice. */
  word?: Word;
  /** Explicit recitation URL (e.g. a word-by-word clip) instead of the word's sources. */
  src?: string;
  /** Arabic for the computer-voice fallback (defaults to the word's Arabic). */
  text?: string;
  /** Allow the clearly labelled browser computer voice when no recitation plays (default true). */
  allowComputerVoice?: boolean;
  /**
   * `sm`: compact 44px button for list rows and tiles (no caption). `md`: the 52px review-card
   * button. `lg`: 56px, to line up with other large page actions.
   */
  size?: 'sm' | 'md' | 'lg';
  /** Show only the icon (sm rows where space is tight); the label stays as the accessible name. */
  iconOnly?: boolean;
  /** Visible label when idle (default "Hear it"). */
  children?: React.ReactNode;
  /** Caption under the button when idle, replacing the automatic "AI voice" / computer-voice note. */
  caption?: string;
  /** Show the recitation credit line under the button. */
  attribution?: boolean;
  onPlay?: () => void;
  /** Applied to the wrapper (layout, positioning). */
  className?: string;
}

const SIZE = {
  sm: { button: 'h-11 gap-2 rounded-xl px-3.5 text-sm [&_svg]:size-[18px]', iconOnly: 'w-11 px-0' },
  md: { button: 'h-[52px] gap-2.5 px-5 text-base [&_svg]:size-[22px]', iconOnly: 'w-[52px] px-0' },
  lg: { button: 'h-14 gap-2.5 px-7 text-base [&_svg]:size-[22px]', iconOnly: 'w-14 px-0' },
};

/**
 * The gold "Hear it" button: the one design for single-word audio across the site. Plays the word's
 * AI-voice pronunciation (labelled), then genuine recitation, then the clearly labelled computer voice.
 */
const HearItButton: React.FC<HearItButtonProps> = ({
  word,
  src,
  text,
  allowComputerVoice = true,
  size = 'md',
  iconOnly = false,
  children = 'Hear it',
  caption,
  attribution = false,
  onPlay,
  className,
}) => {
  const { playSources, speak, stop, isPlaying, isLoading, nowPlaying } = useTextToSpeech();

  const sources: AudioSource[] = useMemo(() => {
    if (src) return [{ url: src, kind: 'word', label: 'Recitation', shortLabel: 'Recitation' }];
    return word ? getAudioSources(word) : [];
  }, [src, word]);

  // Speech support is browser-only; checked after mount so the prerendered HTML matches hydration.
  const [speechSupported, setSpeechSupported] = useState(false);
  useEffect(() => setSpeechSupported(isSpeechSupported()), []);

  const fallbackText = text ?? word?.arabic;
  const canSpeak = allowComputerVoice && !!fallbackText && speechSupported;
  const hasRecitation = sources.length > 0;
  const available = hasRecitation || canSpeak;

  const plannedLabel = hasRecitation ? sources[0].shortLabel : canSpeak ? COMPUTER_VOICE_LABEL : 'No audio available';
  const statusLabel = isPlaying && nowPlaying ? nowPlaying.shortLabel : plannedLabel;
  const isComputer = isPlaying ? nowPlaying?.kind === 'computer' : !hasRecitation;
  const isAiVoice = isPlaying ? nowPlaying?.kind === 'pronunciation' : sources[0]?.kind === 'pronunciation';

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    if (!started) return;
    track('audio_play', {
      kind: !word
        ? 'ayah'
        : sources[0]?.kind === 'pronunciation'
          ? 'pronunciation'
          : sources[0]?.kind === 'ayah'
            ? 'ayah'
            : word.quranicForm && !word.location
              ? 'related'
              : 'word',
    });
    onPlay?.();
  };

  const labelText = typeof children === 'string' ? children : 'Hear it';
  const title = available ? `${isPlaying ? 'Stop' : 'Play'}: ${statusLabel}` : 'No recitation audio available for this item';
  const Icon = !available ? VolumeX : isLoading ? AudioWaveform : isPlaying ? Square : Volume2;

  // The computer voice is never presented as a recitation, whatever the caption says.
  const captionText = !available || size === 'sm'
    ? null
    : isComputer
      ? statusLabel
      : isPlaying
        ? isAiVoice ? 'AI voice' : null
        : caption ?? (isAiVoice ? 'AI voice' : null);

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <Button
        type="button"
        variant="gold"
        onClick={handleClick}
        disabled={!available || isLoading}
        aria-label={`${isPlaying ? 'Stop' : labelText}. ${title}`}
        title={title}
        className={cn(
          'font-extrabold motion-reduce:transition-none motion-reduce:active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60',
          SIZE[size].button,
          iconOnly && SIZE[size].iconOnly,
        )}
      >
        <Icon className={cn(isLoading && 'motion-safe:animate-pulse')} aria-hidden="true" />
        {!iconOnly && (isPlaying ? 'Stop' : children)}
      </Button>
      {captionText && (
        <span className={cn('text-center text-xs font-semibold', isComputer ? 'text-gold-text' : 'text-muted-foreground')}>
          {captionText}
        </span>
      )}
      {attribution && hasRecitation && <AudioAttribution className="text-center" pronunciation={sources[0]?.kind === 'pronunciation'} />}
    </div>
  );
};

export default HearItButton;
