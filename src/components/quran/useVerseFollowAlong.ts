// Plays one ayah (Mishary Alafasy, Quran.com's file) and reports which displayed word is being
// recited, so the page can make that word glow. Word timings come from the bundled
// public/data/verse-timings.json when it has the verse, otherwise live from the Quran.com API
// (recitation 7, the same file). Without timings the ayah still plays, just without the glow.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ALAFASY_AYAH, AudioPlaybackError, getAyahAudioUrl, playAudioUrl, stopAllAudio } from '@/utils/audio';
import { track } from '@/lib/analytics';

/** Word position (1-based) -> start/end in milliseconds from the start of the ayah file. */
type WordTimes = Map<number, { s: number; e: number }>;

interface Bundled {
  verses: Record<string, { f: number; t: number[] }>;
  examples: Record<string, [number, number[]][]>;
}
let bundledPromise: Promise<Bundled | null> | null = null;
export const loadBundledTimings = () =>
  (bundledPromise ??= fetch('/data/verse-timings.json')
    .then((r) => (r.ok ? (r.json() as Promise<Bundled>) : null))
    .catch(() => null));

const fromBundled = (b: Bundled | null, surah: number, ayah: number): WordTimes | null => {
  const v = b?.verses[`${surah}:${ayah}`];
  if (!v) return null;
  const out: WordTimes = new Map();
  v.t.forEach((start, i) => {
    if (i === v.t.length - 1 || start < 0) return;
    // A word ends where the next timed word starts (the last entry is the end of the last word).
    let end = -1;
    for (let j = i + 1; j < v.t.length; j++) if (v.t[j] >= 0) { end = v.t[j]; break; }
    if (end > start) out.set(v.f + i, { s: start * 10, e: end * 10 });
  });
  return out.size ? out : null;
};

const live = new Map<string, Promise<WordTimes | null>>();
const fromQuranCom = (surah: number, ayah: number): Promise<WordTimes | null> => {
  const key = `${surah}:${ayah}`;
  if (!live.has(key)) {
    live.set(
      key,
      fetch(`https://api.quran.com/api/v4/verses/by_key/${key}?audio=7`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          const audio = j?.verse?.audio;
          // Only trust timings that belong to the file we play.
          if (!audio?.segments?.length || !String(audio.url ?? '').includes('Alafasy/mp3')) return null;
          const out: WordTimes = new Map();
          for (const seg of audio.segments as number[][]) {
            const [, pos, s, e] = seg;
            if (seg.length >= 4 && e > s && !out.has(pos)) out.set(pos, { s, e });
          }
          return out.size ? out : null;
        })
        .catch(() => null),
    );
  }
  return live.get(key)!;
};

export type FollowState = 'idle' | 'loading' | 'playing' | 'error';

/**
 * `positions[i]` is the verse word position of displayed word i (0 when it is not a word, e.g. a
 * standalone pause mark). Pass a function to resolve them lazily on the first play.
 */
export function useVerseFollowAlong(
  surah: number,
  ayah: number,
  positions: number[] | (() => Promise<number[] | null>),
) {
  const [state, setState] = useState<FollowState>('idle');
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

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      audioRef.current?.pause();
    },
    [],
  );

  const toggle = async () => {
    if (state === 'playing' || state === 'loading') {
      stopAllAudio();
      stop();
      return;
    }
    setState('loading');
    track('audio_play', { kind: 'ayah' });

    const pos = typeof positions === 'function' ? await positions() : positions;
    let times: WordTimes | null = null;
    if (pos?.some(Boolean)) {
      const needed = pos.filter(Boolean);
      const bundled = fromBundled(await loadBundledTimings(), surah, ayah);
      times = bundled && needed.every((p) => bundled.has(p)) ? bundled : (await fromQuranCom(surah, ayah)) ?? bundled;
    }
    const perToken = pos && times ? pos.map((p) => (p ? times!.get(p) ?? null : null)) : null;
    const timed = perToken?.filter(Boolean) as { s: number; e: number }[] | undefined;
    // Play exactly the words shown: from just before the first to just after the last.
    const clip = timed?.length ? { start: Math.max(0, timed[0].s - 120), end: timed[timed.length - 1].e + 350 } : undefined;

    let audio: HTMLAudioElement;
    try {
      audio = await playAudioUrl(ALAFASY_AYAH(surah, ayah), clip);
    } catch (err) {
      if (err instanceof AudioPlaybackError && err.reason === 'blocked') {
        setState('error');
        return;
      }
      // Quran.com's file failed: play EveryAyah's copy of the same recitation, without the glow.
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
        /* not seekable yet */
      }
    }
    audio.addEventListener('pause', stop, { once: true });
    audio.addEventListener('ended', stop, { once: true });
    if (!perToken || !timed?.length) return;
    const tick = () => {
      if (audioRef.current !== audio) return;
      const ms = audio.currentTime * 1000;
      let now = -1;
      for (let i = 0; i < perToken.length; i++) {
        const t = perToken[i];
        if (t && ms >= t.s - 40 && ms < t.e) now = i;
      }
      setActive((prev) => (prev === now ? prev : now));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  return { state, active, toggle };
}
