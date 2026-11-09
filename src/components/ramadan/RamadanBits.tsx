// Shared pieces of the Ramadan pages (/laylatul-qadr, /taraweeh, /itikaf and the /ramadan hub).
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWordById } from '@/utils/vocabulary';
import { rootPath, wordPath } from '@/utils/quran-pages';
import { RAMADAN_HUB_PATH } from '@/utils/seo-ramadan';
import { RAMADAN_LINKS } from '@/utils/ramadan-pages';
import type { RamadanWord } from '@/utils/generated/ramadan';

export const inlineLink = 'font-semibold text-primary underline underline-offset-4 hover:text-primary-shade';
const chip = 'inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 bg-card px-3 text-sm font-bold hover:border-primary/40';
const num = (n: number) => n.toLocaleString('en-US');

/** "Root ع ف و" chip linking the root page. */
export const RootChip: React.FC<{ slug: string; ar?: string | null }> = ({ slug, ar }) => (
  <Link to={rootPath(slug)} className={chip}>
    Root
    {ar && (
      <span className="font-arabic text-base font-normal" lang="ar" dir="rtl">
        {ar}
      </span>
    )}
  </Link>
);

/** A Quranic word quoted on a Ramadan page: its form in the verse, gloss, Quran count and links. */
export const RamadanWordCard: React.FC<{ w: RamadanWord; gloss?: string }> = ({ w, gloss }) => {
  const word = w.wordId ? getWordById(w.wordId) : undefined;
  return (
    <li className="flex flex-col gap-3 rounded-[1.375rem] border-2 border-b-4 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-extrabold leading-snug">{gloss ?? w.gloss}</p>
          {word && <p className="text-sm italic text-muted-foreground">{word.transliteration}</p>}
          <p className="mt-1 text-sm text-muted-foreground">
            {w.count === 1 ? 'Once' : `${num(w.count)} times`} in the Quran
          </p>
        </div>
        <p className="shrink-0 font-quran text-[2rem] leading-[1.8]" lang="ar" dir="rtl">
          {w.ar}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {word && (
          <Link to={wordPath(word.id)} className={chip}>
            Word: {word.transliteration}
          </Link>
        )}
        {w.root && <RootChip slug={w.root} ar={w.rootAr} />}
      </div>
    </li>
  );
};

export const FaqSection: React.FC<{ id: string; title: string; items: { q: string; a: string }[]; className?: string }> = ({
  id,
  title,
  items,
  className,
}) => (
  <section aria-labelledby={id} className={cn('mt-12 max-w-3xl', className)}>
    <h2 id={id} className="mb-3 text-xl font-extrabold">
      {title}
    </h2>
    <dl className="divide-y rounded-[1.375rem] border bg-card">
      {items.map((f) => (
        <div key={f.q} className="p-5">
          <dt className="font-extrabold">{f.q}</dt>
          <dd className="mt-1 leading-relaxed text-muted-foreground">{f.a}</dd>
        </div>
      ))}
    </dl>
  </section>
);

/** Links to the rest of the Ramadan cluster (all but the current page). */
export const MoreForRamadan: React.FC<{ current: string }> = ({ current }) => (
  <nav aria-labelledby="more-ramadan" className="mt-12">
    <h2 id="more-ramadan" className="mb-3 text-xl font-extrabold">
      More Ramadan words
    </h2>
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[{ to: RAMADAN_HUB_PATH, label: '30-day Ramadan Quran plan', ar: 'رمضان', note: 'About 10 Quranic words a day' }, ...RAMADAN_LINKS]
        .filter((l) => l.to !== current)
        .map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="flex h-full items-center justify-between gap-3 rounded-[1.25rem] border-2 border-b-4 bg-card px-4 py-3 transition-colors hover:border-primary/40"
            >
              <span className="min-w-0">
                <span className="block font-extrabold">{l.label}</span>
                <span className="block text-sm text-muted-foreground">{l.note}</span>
              </span>
              <span className="shrink-0 font-arabic text-xl" lang="ar" dir="rtl">
                {l.ar}
              </span>
            </Link>
          </li>
        ))}
    </ul>
  </nav>
);

/** Small "Go to …" link with an arrow. */
export const ArrowLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => (
  <Link to={to} onClick={onClick} className="inline-flex min-h-11 items-center justify-between gap-2 font-bold text-primary underline-offset-4 hover:underline">
    <span>{children}</span>
    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
  </Link>
);
