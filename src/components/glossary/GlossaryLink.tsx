import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenText } from 'lucide-react';
import { ISLAMIC_TERMS, ISLAMIC_TERMS_PATH } from '@/utils/islamic-terms';

const byWord = new Map(ISLAMIC_TERMS.filter((t) => t.wordId).map((t) => [t.wordId as string, t]));

/** On a word page: a link to the word's entry in the Islamic terms glossary. Renders nothing for other words. */
const GlossaryLink: React.FC<{ wordId: string }> = ({ wordId }) => {
  const term = byWord.get(wordId);
  if (!term) return null;
  return (
    <p className="flex items-center gap-2 px-1 text-[15px]">
      <BookOpenText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <Link to={`${ISLAMIC_TERMS_PATH}#${term.id}`} className="font-bold text-primary underline-offset-4 hover:underline">
        {term.name} in the A–Z glossary of Islamic terms
      </Link>
    </p>
  );
};

export default GlossaryLink;
