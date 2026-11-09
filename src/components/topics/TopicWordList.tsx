import React from 'react';
import { Link } from 'react-router-dom';
import HearItButton from '@/components/word/HearItButton';
import type { Word } from '@/utils/vocabulary-types';
import { getRootBySlug, getWordRootSlug, rootPath, wordPath } from '@/utils/quran-pages';

/** Word cards (meaning, transliteration, Arabic) linking to the word page, with audio and the root. */
const TopicWordList: React.FC<{ words: Word[]; id?: string }> = ({ words, id }) => (
  <ul id={id} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {words.map((w) => {
      const root = getWordRootSlug(w.id);
      const rootAr = root ? getRootBySlug(root)?.arabic : undefined;
      return (
        <li key={w.id} className="flex flex-col gap-2 rounded-[1.375rem] border-2 border-b-4 bg-card p-4">
          <Link to={wordPath(w.id)} className="group flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="block font-extrabold leading-snug group-hover:text-primary">{w.meaning}</span>
              <span className="block text-sm text-muted-foreground">{w.transliteration}</span>
            </span>
            <span className="max-w-[55%] shrink-0 text-right font-quran text-[1.75rem] leading-[1.9]" lang="ar" dir="rtl">
              {w.arabic}
            </span>
          </Link>
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <HearItButton word={w} size="sm" iconOnly>
              Hear {w.transliteration}
            </HearItButton>
            {root && (
              <Link
                to={rootPath(root)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 bg-card px-3 text-sm font-bold hover:border-primary/40"
              >
                Root
                {rootAr && (
                  <span className="font-arabic text-base font-normal" lang="ar" dir="rtl">
                    {rootAr}
                  </span>
                )}
              </Link>
            )}
          </div>
        </li>
      );
    })}
  </ul>
);

export default TopicWordList;
