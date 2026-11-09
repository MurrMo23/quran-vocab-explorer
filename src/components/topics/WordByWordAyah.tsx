import React from 'react';
import { cn } from '@/lib/utils';
import type { SalahVerse } from '@/utils/generated/topics';
import { useVerseFollowAlong } from '@/components/quran/useVerseFollowAlong';
import { PlayVerseButton } from '@/components/word/PlayVerseButton';

/**
 * One ayah word by word: each word with its transliteration and English gloss (Quran.com word-by-word),
 * then the Saheeh International translation. "Play" recites the ayah (Mishary Alafasy) and the word
 * being recited lights up. Stand-alone pause marks stay with the word before them.
 */
const WordByWordAyah: React.FC<{ verse: SalahVerse; className?: string }> = ({ verse, className }) => {
  const { s, a, ar, pos, gl, tr, en } = verse;
  const { state, active, toggle } = useVerseFollowAlong(s, a, pos);
  // Tiles: one per word; a pause mark (pos 0) joins the previous tile.
  const tiles: { ar: string; gl: string; tr: string; idx: number[] }[] = [];
  ar.forEach((w, i) => {
    if (pos[i] === 0 && tiles.length) {
      const t = tiles[tiles.length - 1];
      t.ar += ` ${w}`;
      t.idx.push(i);
    } else {
      tiles.push({ ar: w, gl: gl[i], tr: tr[i], idx: [i] });
    }
  });
  return (
    <figure className={cn('rounded-[20px] border bg-background p-3 sm:p-5', className)}>
      <ol dir="rtl" className="flex flex-wrap gap-2" aria-label={`Ayah ${s}:${a}, word by word`}>
        {tiles.map((t, i) => (
          <li
            key={i}
            className={cn(
              'flex min-w-[4rem] flex-col items-center rounded-2xl border bg-card px-2 pb-2 pt-1 text-center motion-safe:transition-colors sm:min-w-[4.5rem] sm:px-2.5',
              t.idx.includes(active) && 'border-gold bg-gold/10',
            )}
          >
            <span lang="ar" className={cn('font-quran text-[1.65rem] leading-[1.9]', t.idx.includes(active) && 'reciting')}>
              {t.ar}
            </span>
            <span dir="ltr" className="text-xs italic text-muted-foreground">
              {t.tr}
            </span>
            <span dir="ltr" className="max-w-[9rem] text-[13px] font-semibold leading-snug">
              {t.gl}
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <p className="min-w-0 flex-1 text-[15px] leading-relaxed text-foreground/80">
          <span className="mr-1.5 font-bold text-muted-foreground">
            {s}:{a}
          </span>
          {en}
        </p>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <PlayVerseButton surah={s} ayah={a} state={state} onClick={toggle} size="sm" followAlong />
          {state === 'error' && <span className="text-xs text-gold-text">Audio could not play. Tap again.</span>}
        </span>
      </figcaption>
    </figure>
  );
};

export default WordByWordAyah;
