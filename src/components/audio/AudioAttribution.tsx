import React from 'react';
import { cn } from '@/lib/utils';

interface AudioAttributionProps {
  className?: string;
}

/** Credit line for recitation audio sources. Place near any recitation player. */
const AudioAttribution: React.FC<AudioAttributionProps> = ({ className }) => (
  <p className={cn('text-[11px] text-muted-foreground', className)}>
    Recitation audio:{' '}
    <a
      href="https://quran.com"
      target="_blank"
      rel="noopener noreferrer"
      className="underline-offset-2 hover:underline"
      onClick={e => e.stopPropagation()}
    >
      Quran.com
    </a>{' '}
    /{' '}
    <a
      href="https://everyayah.com"
      target="_blank"
      rel="noopener noreferrer"
      className="underline-offset-2 hover:underline"
      onClick={e => e.stopPropagation()}
    >
      EveryAyah
    </a>{' '}
    (Mishary Alafasy)
  </p>
);

export default AudioAttribution;
