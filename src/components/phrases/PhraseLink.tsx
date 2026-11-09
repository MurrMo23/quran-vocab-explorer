import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquareQuote } from 'lucide-react';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { phraseForWord, phrasePath } from '@/utils/phrases';

/**
 * On a word page whose entry is a whole phrase (Bismillah, Alhamdulillah, ...): a link to the phrase
 * page, which has the word-by-word breakdown, usage and every verse. Renders nothing for other words.
 */
const PhraseLink: React.FC<{ wordId: string; className?: string }> = ({ wordId, className }) => {
  const phrase = phraseForWord(wordId);
  if (!phrase) return null;
  return (
    <Link
      to={phrasePath(phrase.slug)}
      onClick={() => track('cta_click', { cta: 'phrase_page', location: 'word_phrase_link' })}
      className={cn(
        'flex items-center gap-3 rounded-[1.25rem] border-2 bg-card px-5 py-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <MessageSquareQuote className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold">{phrase.name} meaning, word by word</span>
        <span className="block text-sm text-muted-foreground">When Muslims say it, and every verse it appears in</span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
};

export default PhraseLink;
