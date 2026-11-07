import React, { useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWordById, collections } from '@/utils/vocabulary';
import { getWordAudioUrl } from '@/utils/audio';
import { track } from '@/lib/analytics';

const WORD_ID = 'al-kitab';

// The headword and verse in Uthmani script (as the review shows them); the rest comes from the word data.
const HEADWORD_UTHMANI = 'ٱلْكِتَٰب';
const VERSE_UTHMANI = 'ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ';

const word = getWordById(WORD_ID);
const example = word?.examples.find((e) => e.surah === 2 && e.ayah === 2) ?? word?.examples[0];
const collectionName = collections.find((c) => c.id === word?.collections[0])?.name;
const audioUrl = word ? getWordAudioUrl(word) : undefined;

interface SampleWordCardProps {
  /** Where "Again" / "I know it" lead: the same place as the hero's main call to action. */
  startHref: string;
}

/**
 * Hero illustration: what a review card looks like, for الكتاب (2:2). Static apart from the play
 * button, which plays the real word-by-word recitation. Renders the same on the server and client.
 */
const SampleWordCard: React.FC<SampleWordCardProps> = ({ startHref }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioUrl) return;
    try {
      if (!audioRef.current) audioRef.current = new Audio(audioUrl);
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => undefined);
      track('audio_play', { kind: 'word' });
    } catch {
      // Audio unavailable: nothing to do.
    }
  }, []);

  if (!word) return null;

  return (
    <article
      aria-label={`Sample review card: ${word.meaning}`}
      className="card-tactile flex w-full max-w-[440px] flex-col gap-4 rounded-[28px] p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        {collectionName && (
          <span className="rounded-full bg-secondary px-3 py-1.5 text-[13px] font-bold text-secondary-foreground">
            {collectionName}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-sm font-extrabold text-gold-text">
          <Flame className="h-[18px] w-[18px]" aria-hidden="true" />
          5-day streak
        </span>
      </div>

      <div className="h-3 rounded-full bg-track" aria-hidden="true">
        <div className="h-3 w-3/5 rounded-full bg-primary" />
      </div>

      <div className="text-center">
        <p lang="ar" dir="rtl" className="font-quran text-[60px] leading-[1.9] sm:text-[72px]">
          {HEADWORD_UTHMANI}
        </p>
        <p className="text-2xl font-extrabold">{word.meaning}</p>
        <p className="mt-0.5 text-[15px] text-muted-foreground">
          al-kitāb · {word.partOfSpeech} · {word.frequency}× in the Quran
        </p>
      </div>

      {example && (
        <div className="rounded-2xl bg-background px-4 py-3">
          <p lang="ar" dir="rtl" className="font-quran text-2xl leading-[1.9]">
            {VERSE_UTHMANI}
          </p>
          <p className="text-sm text-muted-foreground">
            “{example.translation}.” · {example.surah}:{example.ayah}
          </p>
        </div>
      )}

      <div className="flex gap-2.5">
        <Button
          type="button"
          variant="gold"
          size="icon"
          onClick={play}
          disabled={!audioUrl}
          aria-label="Play recitation"
          className="h-[52px] w-[52px] shrink-0 [&_svg]:size-[22px]"
        >
          <Volume2 aria-hidden="true" />
        </Button>
        <Button asChild variant="outline" className="h-[52px] flex-1 font-extrabold">
          <Link to={startHref}>Again</Link>
        </Button>
        <Button asChild className="h-[52px] flex-1 font-extrabold">
          <Link to={startHref}>I know it</Link>
        </Button>
      </div>
    </article>
  );
};

export default SampleWordCard;
