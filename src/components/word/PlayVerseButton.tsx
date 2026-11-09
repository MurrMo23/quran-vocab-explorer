import React from 'react';
import { Loader2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVerseFollowAlong, type FollowState } from '@/components/quran/useVerseFollowAlong';

interface PlayVerseButtonProps {
  surah: number;
  ayah: number;
  /** Follow-along state from useVerseFollowAlong. */
  state: FollowState;
  onClick: () => void;
  /** Idle label (default "Play verse"). */
  children?: React.ReactNode;
  /** `sm` for tight rows (40px high); default matches ExampleVerseCard. */
  size?: 'sm' | 'default' | 'lg';
  /** Say in the accessible name that the words light up (only when the verse text is shown). */
  followAlong?: boolean;
  className?: string;
}

/** The outline "Play verse" button used wherever an ayah is recited (Mishary Alafasy). */
export const PlayVerseButton: React.FC<PlayVerseButtonProps> = ({
  surah,
  ayah,
  state,
  onClick,
  children = 'Play verse',
  size = 'default',
  followAlong = false,
  className,
}) => {
  const playing = state === 'playing';
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onClick}
      aria-pressed={playing}
      aria-label={playing ? `Stop verse ${surah}:${ayah}` : `Play verse ${surah}:${ayah}${followAlong ? ' and follow each word' : ''}`}
      title="Mishary Alafasy (Quran.com)"
      className={cn('font-extrabold', size === 'sm' ? 'h-10 text-sm [&_svg]:size-4' : '[&_svg]:size-5', className)}
    >
      {state === 'loading' ? <Loader2 className="motion-safe:animate-spin" aria-hidden /> : playing ? <Pause aria-hidden /> : <Play aria-hidden />}
      {playing ? 'Stop' : children}
    </Button>
  );
};

const NO_POSITIONS: number[] = [];

/** A standalone "Play verse" button for an ayah whose text is not shown next to it (no word glow). */
export const AyahPlayButton: React.FC<Omit<PlayVerseButtonProps, 'state' | 'onClick' | 'followAlong'>> = (props) => {
  const { state, toggle } = useVerseFollowAlong(props.surah, props.ayah, NO_POSITIONS);
  return (
    <span className="inline-flex flex-col items-center gap-1">
      <PlayVerseButton {...props} state={state} onClick={toggle} className={cn('w-full', props.className)} />
      {state === 'error' && <span className="text-xs text-gold-text">Audio could not play. Tap again.</span>}
    </span>
  );
};
