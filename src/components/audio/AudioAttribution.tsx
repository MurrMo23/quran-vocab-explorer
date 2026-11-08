import React from 'react';
import { cn } from '@/lib/utils';

interface AudioAttributionProps {
  className?: string;
  /** Mention the AI-voice word pronunciation (default false). */
  pronunciation?: boolean;
  /** Mention the recitation sources (default true). */
  recitation?: boolean;
}

const ext = (href: string, text: string) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="underline-offset-2 hover:underline"
    onClick={e => e.stopPropagation()}
  >
    {text}
  </a>
);

/** Credit line for audio: AI-voice pronunciation and/or recitation sources. Place near the players. */
const AudioAttribution: React.FC<AudioAttributionProps> = ({ className, pronunciation = false, recitation = true }) => (
  <p className={cn('text-[11px] text-muted-foreground', className)}>
    {pronunciation && <>Word pronunciation: AI voice, not a recitation.{recitation && ' '}</>}
    {recitation && (
      <>
        Recitation: {ext('https://quran.com', 'Quran.com')} / {ext('https://everyayah.com', 'EveryAyah')} (Mishary Alafasy)
      </>
    )}
  </p>
);

export default AudioAttribution;
