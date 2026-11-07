import React, { useMemo } from 'react';
import { AudioWaveform, Square, Volume2, VolumeX } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import type { Word } from '@/utils/vocabulary-types';
import { COMPUTER_VOICE_LABEL, getAudioSources, isSpeechSupported } from '@/utils/audio';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

/**
 * The gold "Hear it" button on the review card. Same playback as AudioPlayer (genuine recitation
 * first, then the clearly labelled computer voice), in the session's tactile style.
 */
const HearItButton: React.FC<{ word: Word; className?: string }> = ({ word, className }) => {
  const { playSources, speak, stop, isPlaying, isLoading, nowPlaying } = useTextToSpeech();
  const sources = useMemo(() => getAudioSources(word), [word]);

  const canSpeak = !!word.arabic && isSpeechSupported();
  const hasRecitation = sources.length > 0;
  const available = hasRecitation || canSpeak;

  const plannedLabel = hasRecitation ? sources[0].shortLabel : canSpeak ? COMPUTER_VOICE_LABEL : 'No audio available';
  const statusLabel = isPlaying && nowPlaying ? nowPlaying.shortLabel : plannedLabel;
  const isComputer = isPlaying ? nowPlaying?.kind === 'computer' : !hasRecitation;

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
      if (!started && canSpeak) started = speak(word.arabic);
    } else if (canSpeak) {
      started = speak(word.arabic);
    }
    if (started)
      track('audio_play', {
        kind: sources[0]?.kind === 'ayah' ? 'ayah' : word.quranicForm && !word.location ? 'related' : 'word',
      });
  };

  const title = available ? `${isPlaying ? 'Stop' : 'Play'}: ${statusLabel}` : 'No recitation audio available for this word';
  const Icon = !available ? VolumeX : isLoading ? AudioWaveform : isPlaying ? Square : Volume2;

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!available || isLoading}
        aria-label={title}
        title={title}
        data-testid="review-audio"
        className={cn(
          'inline-flex h-[52px] items-center gap-2.5 rounded-2xl border-b-4 border-gold-shade bg-gold px-5 text-base font-extrabold text-gold-foreground',
          'transition-[transform,border-width,background-color] hover:bg-gold/95 active:translate-y-[2px] active:border-b-2 motion-reduce:transition-none motion-reduce:active:translate-y-0',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        <Icon className={cn('h-[22px] w-[22px]', isLoading && 'motion-safe:animate-pulse')} aria-hidden />
        {isPlaying ? 'Stop' : 'Hear it'}
      </button>
      {/* The computer voice is never presented as a recitation. */}
      {available && isComputer && <span className="text-xs font-semibold text-gold-text">{statusLabel}</span>}
    </div>
  );
};

export default HearItButton;
