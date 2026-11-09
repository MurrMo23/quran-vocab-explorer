import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquareQuote } from 'lucide-react';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { phraseForWord, phrasePath, phrasesUsingWord } from '@/utils/phrases';

/**
 * On the word page. For an entry that is a whole phrase (Bismillah, Alhamdulillah, ...): a link to the
 * phrase page, which has the word-by-word breakdown, usage and every verse. For a word that phrases
 * are built from (Allah, shāʾa, ḥamd, ...): links to those phrases. Renders nothing otherwise.
 */
const PhraseLink: React.FC<{ wordId: string; className?: string }> = ({ wordId, className }) => {
  const phrase = phraseForWord(wordId);
  if (phrase) {
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
  }
  const used = phrasesUsingWord(wordId);
  if (!used.length) return null;
  return (
    <nav aria-label="Everyday phrases with this word" className={cn('rounded-[1.25rem] border bg-card px-5 py-4', className)}>
      <p className="mb-2 flex items-center gap-2 text-sm font-extrabold">
        <MessageSquareQuote className="h-4 w-4 text-primary" aria-hidden="true" />
        Said in everyday phrases
      </p>
      <ul className="flex flex-wrap gap-2">
        {used.map((p) => (
          <li key={p.slug}>
            <Link
              to={phrasePath(p.slug)}
              onClick={() => track('cta_click', { cta: 'phrase_page', location: 'word_phrase_chips' })}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 bg-background px-3 text-sm font-bold hover:border-primary/40"
            >
              {p.name}
              <span className="font-arabic text-base font-normal" lang="ar" dir="rtl">
                {p.ar}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default PhraseLink;
