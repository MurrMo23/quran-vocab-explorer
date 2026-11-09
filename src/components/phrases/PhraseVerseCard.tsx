import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getSurahName, surahPath } from '@/utils/quran-pages';
import type { PhraseVerse } from '@/utils/generated/pillars';
import { useVerseFollowAlong } from '@/components/quran/useVerseFollowAlong';
import { PlayVerseButton } from '@/components/word/PlayVerseButton';

/**
 * A whole ayah (Tanzil Uthmani) with its Saheeh International translation. The phrase's words are
 * marked; "Play verse" recites it (Mishary Alafasy) and each word lights up as it is recited.
 */
const PhraseVerseCard: React.FC<{ verse: PhraseVerse; className?: string }> = ({ verse, className }) => {
  const { s, a, ar, pos, hl, en } = verse;
  const { state, active, toggle } = useVerseFollowAlong(s, a, pos);
  const surah = getSurahName(s);
  const playing = state === 'playing';
  return (
    <figure className={cn('flex flex-col gap-3 rounded-[20px] border bg-background p-5 sm:p-6', className)}>
      <blockquote lang="ar" dir="rtl" className="font-quran text-[26px] leading-[2] sm:text-[32px]">
        {ar.map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 && ' '}
            <span
              className={cn(
                'rounded-lg [box-decoration-break:clone] motion-safe:transition-[color,text-shadow] motion-safe:duration-200',
                hl && i >= hl[0] && i <= hl[1] && !playing && 'bg-secondary px-1 text-secondary-foreground',
                i === active && 'reciting',
              )}
            >
              {w}
            </span>
          </React.Fragment>
        ))}
      </blockquote>
      <p className="text-[17px] leading-relaxed text-foreground/80 before:content-['\201C'] after:content-['\201D']">{en}</p>
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>
          {surah ? (
            <Link to={surahPath(s)} className="font-bold text-primary underline-offset-4 hover:underline">
              Surah {surah.name}
            </Link>
          ) : (
            'Surah'
          )}{' '}
          {s}:{a} · Saheeh International
        </span>
        <span className="flex flex-col items-end gap-1">
          <PlayVerseButton surah={s} ayah={a} state={state} onClick={toggle} followAlong />
          {state === 'error' && <span className="text-xs text-gold-text">Audio could not play. Tap again.</span>}
        </span>
      </figcaption>
    </figure>
  );
};

export default PhraseVerseCard;
