import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { loadBundledTimings, useVerseFollowAlong } from '@/components/quran/useVerseFollowAlong';
import { findWordIndexInVerse } from './verse-highlight';

interface ExampleVerseCardProps {
  wordId: string;
  index: number;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
  /** The word to mark in the verse (and whether it is a verb), when it can be found. */
  highlight?: { target: string; isVerb: boolean };
  reference: string;
  surahLink?: string;
}

/**
 * An example verse whose words light up one by one as Mishary Alafasy recites them. The verse is
 * played exactly as shown (an excerpt plays only its words). Without timings it plays the whole
 * ayah with the word marked as before.
 */
const ExampleVerseCard: React.FC<ExampleVerseCardProps> = ({ wordId, index, surah, ayah, arabic, translation, highlight, reference, surahLink }) => {
  const words = useMemo(() => arabic.trim().split(/\s+/), [arabic]);
  const target = useMemo(
    () => (highlight ? findWordIndexInVerse(arabic, highlight.target, highlight.isVerb) : -1),
    [arabic, highlight],
  );
  // Displayed word -> verse word position (examples are often excerpts), from the bundled alignment.
  const resolvePositions = useCallback(async () => {
    const t = await loadBundledTimings();
    const map = t?.examples[wordId]?.find((r) => r[0] === index)?.[1];
    return map && map.length === words.length ? map : null;
  }, [wordId, index, words.length]);
  const { state, active, toggle: play } = useVerseFollowAlong(surah, ayah, resolvePositions);

  const playing = state === 'playing';

  return (
    <div className="flex flex-col gap-3 rounded-[20px] bg-background p-5 sm:p-6" itemScope itemType="https://schema.org/Quotation">
      <p lang="ar" dir="rtl" className="font-quran text-[26px] leading-[2] sm:text-[34px]" itemProp="text">
        {words.map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 && ' '}
            <span
              className={cn(
                'rounded-lg [box-decoration-break:clone] motion-safe:transition-[color,text-shadow] motion-safe:duration-200',
                i === target && state !== 'playing' && 'bg-secondary px-1.5 text-secondary-foreground',
                i === active && 'reciting',
              )}
              data-reciting={i === active ? 'true' : undefined}
            >
              {w}
            </span>
          </React.Fragment>
        ))}
      </p>
      <p className="text-[17px] leading-relaxed text-foreground/80 before:content-['\201C'] after:content-['\201D']" itemProp="translationOfWork">
        {translation}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span itemProp="isPartOf">{reference}</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={play}
            aria-pressed={playing}
            aria-label={playing ? `Stop verse ${surah}:${ayah}` : `Play verse ${surah}:${ayah} and follow each word`}
            title="Mishary Alafasy (Quran.com)"
            className="font-extrabold [&_svg]:size-5"
          >
            {state === 'loading' ? (
              <Loader2 className="motion-safe:animate-spin" aria-hidden />
            ) : playing ? (
              <Pause aria-hidden />
            ) : (
              <Play aria-hidden />
            )}
            {playing ? 'Stop' : 'Play verse'}
          </Button>
          {state === 'error' && <span className="text-xs text-gold-text">Audio could not play. Tap again.</span>}
          {surahLink && (
            <Link to={surahLink} className="inline-flex min-h-11 items-center font-bold text-primary underline-offset-4 hover:underline">
              Open surah word list <span aria-hidden="true">&nbsp;→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExampleVerseCard;
