import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ALAFASY_AYAH, AudioPlaybackError, getAyahAudioUrl, playAudioUrl, stopAllAudio } from '@/utils/audio';
import { track } from '@/lib/analytics';
import { findWordIndexInVerse } from './verse-highlight';

// Word timings for the example verses (public/data/verse-timings.json), loaded on first play.
interface Timings {
  verses: Record<string, { f: number; t: number[] }>;
  examples: Record<string, [number, number[]][]>;
}
let timingsPromise: Promise<Timings | null> | null = null;
const loadTimings = () =>
  (timingsPromise ??= fetch('/data/verse-timings.json')
    .then((r) => (r.ok ? (r.json() as Promise<Timings>) : null))
    .catch(() => null));

/** Start and end (centiseconds) of each displayed word, or null when it has no timing. */
const tokenTimes = (t: Timings, wordId: string, index: number, surah: number, ayah: number, count: number) => {
  const verse = t.verses[`${surah}:${ayah}`];
  const map = t.examples[wordId]?.find((r) => r[0] === index)?.[1];
  if (!verse || !map || map.length !== count) return null;
  const startOf = (pos: number) => verse.t[pos - verse.f];
  const endOf = (pos: number) => {
    // A word ends where the next timed word starts (the last entry is the end of the last word).
    for (let i = pos - verse.f + 1; i < verse.t.length; i++) if (verse.t[i] >= 0) return verse.t[i];
    return -1;
  };
  const times = map.map((pos) => {
    if (!pos) return null;
    const s = startOf(pos);
    const e = endOf(pos);
    return s >= 0 && e > s ? { s, e } : null;
  });
  return times.some(Boolean) ? times : null;
};

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
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [active, setActive] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const raf = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActive(-1);
    setState('idle');
  }, []);

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    audioRef.current?.pause();
  }, []);

  const play = async () => {
    if (state === 'playing' || state === 'loading') {
      stopAllAudio();
      stop();
      return;
    }
    setState('loading');
    track('audio_play', { kind: 'ayah' });
    const timings = await loadTimings();
    const times = timings ? tokenTimes(timings, wordId, index, surah, ayah, words.length) : null;
    const timed = times?.filter(Boolean) as { s: number; e: number }[] | undefined;
    // Excerpt: from just before its first word to just after its last.
    const clip = timed?.length
      ? { start: Math.max(0, timed[0].s * 10 - 120), end: timed[timed.length - 1].e * 10 + 350 }
      : undefined;
    let audio: HTMLAudioElement;
    try {
      audio = await playAudioUrl(ALAFASY_AYAH(surah, ayah), clip);
    } catch (err) {
      // The Quran.com file failed: play EveryAyah's copy of the same recitation, without the highlight.
      if (err instanceof AudioPlaybackError && err.reason === 'blocked') {
        setState('error');
        return;
      }
      try {
        audio = await playAudioUrl(getAyahAudioUrl(surah, ayah));
      } catch {
        setState('error');
        return;
      }
      audioRef.current = audio;
      setState('playing');
      audio.addEventListener('pause', stop, { once: true });
      audio.addEventListener('ended', stop, { once: true });
      return;
    }
    audioRef.current = audio;
    setState('playing');
    // Some browsers or servers ignore the #t= start of a media fragment: seek there ourselves.
    if (clip && audio.currentTime < clip.start / 1000 - 0.3) {
      try {
        audio.currentTime = clip.start / 1000;
      } catch {
        /* not seekable yet; the highlight still follows currentTime */
      }
    }
    audio.addEventListener('pause', stop, { once: true });
    audio.addEventListener('ended', stop, { once: true });
    if (!times) return;
    const tick = () => {
      if (audioRef.current !== audio) return;
      const cs = audio.currentTime * 100;
      let now = -1;
      for (let i = 0; i < times.length; i++) {
        const t = times[i];
        if (t && cs >= t.s - 4 && cs < t.e) now = i;
      }
      setActive((prev) => (prev === now ? prev : now));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const playing = state === 'playing';

  return (
    <div className="flex flex-col gap-3 rounded-[20px] bg-background p-5 sm:p-6" itemScope itemType="https://schema.org/Quotation">
      <p lang="ar" dir="rtl" className="font-quran text-[26px] leading-[2] sm:text-[34px]" itemProp="text">
        {words.map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 && ' '}
            <span
              className={cn(
                'rounded-lg [box-decoration-break:clone] motion-safe:transition-colors motion-safe:duration-150',
                i === target && 'bg-secondary px-1.5 text-secondary-foreground',
                i === active && 'bg-gold/45 px-1.5 text-foreground ring-2 ring-gold/60',
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
