import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { Button } from '@/components/ui/button';
import { reviewWordsUrl } from '@/components/review/review-session';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { getWordById } from '@/utils/vocabulary';
import type { Word } from '@/utils/vocabulary-types';
import { getQuranicUsage } from '@/utils/word-usage';
import { getWordRootSlug, rootPath, wordPath } from '@/utils/quran-pages';
import { getNameForWord, namePath } from '@/utils/names-of-allah';
import { phrasePath } from '@/utils/phrases';
import { BEAUTIFUL_WORD_IDS, ISLAMIC_TERMS, ISLAMIC_TERMS_PATH, phraseFor, termLetter, type IslamicTerm } from '@/utils/islamic-terms';
import { SITE_URL } from '@/utils/seo-templates';
import { faqLd, islamicTermsSeo } from '@/utils/seo-pillars';

const num = (n: number) => n.toLocaleString('en-US');

/** Everything shown for one term, resolved from the site's data. */
const resolve = (t: IslamicTerm) => {
  const word = t.wordId ? getWordById(t.wordId) : undefined;
  const phrase = phraseFor(t.phrase);
  const ar = t.ar ?? (word ? word.arabic : phrase?.ar) ?? '';
  const def = t.def ?? (phrase ? `${phrase.name} means “${phrase.meaning}”.` : '');
  const related = t.relatedWordId ? getWordById(t.relatedWordId) : undefined;
  const rootSlug = t.root ?? (word ? getWordRootSlug(word.id) : undefined);
  const name = word ? getNameForWord(word.id) : undefined;
  // How the term's word occurs in the Quran (phrase terms: the phrase page's own verdict).
  let status: { label: string; tone: 'quran' | 'related' | 'none' } | null = null;
  if (word) {
    const u = getQuranicUsage(word);
    status =
      u.kind === 'verbatim'
        ? { label: `In the Quran ×${num(word.frequency)}`, tone: 'quran' }
        : u.kind === 'related'
          ? { label: 'Not in the Quran in this form', tone: 'related' }
          : { label: 'Not in the Quran', tone: 'none' };
  } else if (phrase) {
    status =
      phrase.quran.status === 'exact'
        ? { label: 'In the Quran', tone: 'quran' }
        : phrase.quran.status === 'related'
          ? { label: 'Related wording in the Quran', tone: 'related' }
          : { label: 'Not in the Quran', tone: 'none' };
  }
  return { word, related, phrase, ar, def, rootSlug, name, status };
};

const TONE: Record<'quran' | 'related' | 'none', string> = {
  quran: 'bg-secondary text-secondary-foreground',
  related: 'bg-gold/25 text-gold-text',
  none: 'border bg-background text-muted-foreground',
};

const chip =
  'inline-flex min-h-11 items-center rounded-full border-2 bg-background px-3 text-sm font-bold transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const TermEntry: React.FC<{ term: IslamicTerm }> = ({ term }) => {
  const r = resolve(term);
  const links: { to: string; label: string; ar?: string; primary?: boolean }[] = [];
  if (r.word) links.push({ to: wordPath(r.word.id), label: `${r.word.transliteration}: meaning & verses`, primary: true });
  if (r.related) links.push({ to: wordPath(r.related.id), label: `Related word: ${r.related.transliteration} (${r.related.meaning})` });
  if (r.phrase) links.push({ to: phrasePath(r.phrase.slug), label: `${r.phrase.name}, word by word`, primary: !r.word });
  if (r.name) links.push({ to: namePath(r.name.slug), label: `Name of Allah: ${r.name.tr}` });
  if (r.rootSlug) links.push({ to: rootPath(r.rootSlug), label: r.word?.root ? 'Root' : `Root ${r.rootSlug}`, ar: r.word?.root || undefined });
  if (term.link) links.push(term.link);

  return (
    <div id={term.id} className="scroll-mt-24 rounded-[1.375rem] border-2 border-b-4 bg-card p-5">
      <dt className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="min-w-0">
          <span className="text-lg font-extrabold leading-snug">{term.name}</span>
          {term.variants && term.variants.length > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">also {term.variants.join(', ')}</span>
          )}
        </span>
        {r.ar && (
          <span className="font-quran text-[1.75rem] leading-[1.8] text-primary" lang="ar" dir="rtl">
            {r.ar}
          </span>
        )}
      </dt>
      <dd className="mt-1">
        <p className="text-[16px] leading-relaxed">{r.def}</p>
        {(r.status || term.notQuranic) && (
          <p className="mt-2 flex flex-wrap gap-2">
            {r.status && (
              <span className={cn('inline-block rounded-full px-2.5 py-1 text-xs font-bold', TONE[r.status.tone])}>{r.status.label}</span>
            )}
            {term.notQuranic && (
              <span className="inline-block rounded-full border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground">
                {term.notQuranic}
              </span>
            )}
          </p>
        )}
        {links.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={cn(chip, l.primary && 'border-primary/30 text-primary')}>
                  {l.label}
                  {l.ar && (
                    <span className="ml-1.5 font-arabic text-base font-normal" lang="ar" dir="rtl">
                      {l.ar}
                    </span>
                  )}
                  {l.primary && <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </dd>
    </div>
  );
};

const FAQ: { q: string; a: string }[] = [
  {
    q: 'What does halal mean in Islam?',
    a: 'Halal (حَلَال) means lawful or permitted. It is used above all for food and earnings that Islamic law allows, as in “eat from whatever is on earth [that is] lawful and good” (2:168). Its opposite is haram, forbidden.',
  },
  {
    q: 'Is the word hijab in the Quran?',
    a: 'Yes, seven times, but in the sense of a screen, partition or barrier, for example “ask them from behind a partition” (33:53). The Quran’s word for women’s head covers is khumur (24:31); using “hijab” for the headscarf is later usage.',
  },
  {
    q: 'Are all of these words in the Quran?',
    a: 'Most are. Each entry says whether its word occurs in the Quran and how often. A few, such as tawhid, fiqh and tajwid, are later terms built from Quranic roots, and some, such as hadith and sunnah, are Quranic words that later took on a technical meaning.',
  },
];

const IslamicTerms = () => {
  const terms = [...ISLAMIC_TERMS].sort((a, b) => a.name.replace(/^[ʿʾ']/, '').localeCompare(b.name.replace(/^[ʿʾ']/, ''), 'en'));
  const letters = [...new Set(terms.map(termLetter))];
  const byLetter = letters.map((l) => ({ letter: l, terms: terms.filter((t) => termLetter(t) === l) }));
  const beautiful = BEAUTIFUL_WORD_IDS.map((id) => getWordById(id)).filter((w): w is Word => !!w);
  // Words with a page, for the review button (each once, verbatim Quranic words first).
  const reviewIds = [...new Set(terms.map((t) => t.wordId).filter((id): id is string => !!id && !!getWordById(id)))];
  const seo = islamicTermsSeo(terms.length, ['halal', 'haram', 'iman', 'deen', 'taqwa', 'sabr']);
  const termSet = {
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}${ISLAMIC_TERMS_PATH}#terms`,
    name: 'Islamic terms and Arabic words',
    url: `${SITE_URL}${ISLAMIC_TERMS_PATH}`,
    hasDefinedTerm: terms.map((t) => {
      const r = resolve(t);
      return {
        '@type': 'DefinedTerm',
        '@id': `${SITE_URL}${ISLAMIC_TERMS_PATH}#${t.id}`,
        name: t.name,
        ...(t.variants?.length ? { alternateName: t.variants } : {}),
        description: r.def,
        url: r.word ? `${SITE_URL}${wordPath(r.word.id)}` : r.phrase ? `${SITE_URL}${phrasePath(r.phrase.slug)}` : `${SITE_URL}${ISLAMIC_TERMS_PATH}#${t.id}`,
        inDefinedTermSet: `${SITE_URL}${ISLAMIC_TERMS_PATH}#terms`,
      };
    }),
  };

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={ISLAMIC_TERMS_PATH}
        keywords={['Islamic terms', 'Islamic words', 'Arabic words', 'Islamic words and meanings', 'beautiful Arabic words', 'halal meaning in Islam']}
        breadcrumbs={[{ name: 'Islamic terms', path: ISLAMIC_TERMS_PATH }]}
        jsonLd={[termSet, faqLd(ISLAMIC_TERMS_PATH, FAQ)]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Islamic terms', path: ISLAMIC_TERMS_PATH }]} />

        <header className="card-tactile mb-6 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Islamic Terms and Arabic Words, A to Z</h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              What {num(terms.length)} common Islamic words mean, from adl to zulm: the Arabic with full vowels, a plain definition,
              and whether the word is in the Quran. Most link to a word page with its verses, its root and recitation.
            </p>
          </div>
          {reviewIds.length > 0 && (
            <div className="flex w-full flex-col gap-2 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-xs">
              <Button asChild size="lg" className="h-auto min-h-14 w-full whitespace-normal py-3">
                <Link to={reviewWordsUrl(reviewIds)} onClick={() => track('cta_click', { cta: 'review_islamic_terms', location: 'islamic_terms_hero' })}>
                  <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                  Learn these words
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">{reviewIds.length} words with free spaced-repetition flashcards.</p>
            </div>
          )}
        </header>

        <nav aria-label="Jump to a letter" className="mb-10">
          <ul className="flex flex-wrap gap-1.5">
            {letters.map((l) => (
              <li key={l}>
                <a
                  href={`#${l.toLowerCase()}`}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border-2 bg-card px-2 text-base font-extrabold hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {l}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#beautiful-words"
                className="inline-flex h-11 items-center justify-center rounded-xl border-2 bg-card px-3 text-sm font-bold hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Beautiful words
              </a>
            </li>
          </ul>
        </nav>

        {byLetter.map(({ letter, terms: group }) => (
          <section key={letter} id={letter.toLowerCase()} aria-labelledby={`letter-${letter}`} className="mb-8 scroll-mt-24">
            <h2 id={`letter-${letter}`} className="mb-3 text-2xl font-extrabold text-primary">
              {letter}
            </h2>
            <dl className="grid gap-3 lg:grid-cols-2">
              {group.map((t) => (
                <TermEntry key={t.id} term={t} />
              ))}
            </dl>
          </section>
        ))}

        <section id="beautiful-words" aria-labelledby="beautiful-heading" className="mt-12 scroll-mt-24">
          <h2 id="beautiful-heading" className="mb-2 text-xl font-extrabold">
            Beautiful Arabic words from the Quran
          </h2>
          <p className="mb-4 max-w-3xl text-[17px] leading-relaxed text-muted-foreground">
            Words for patience, mercy, light and peace that Muslims often choose for names, art and reminders, each one taken from
            the Quran.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {beautiful.map((w) => (
              <li key={w.id}>
                <Link
                  to={wordPath(w.id)}
                  className="flex h-full flex-col gap-1 rounded-[1.375rem] border-2 border-b-4 bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="font-quran text-[2rem] leading-[1.8] text-primary" lang="ar" dir="rtl">
                    {w.arabic}
                  </span>
                  <span className="text-lg font-extrabold leading-snug">{w.transliteration}</span>
                  <span className="text-[15px] leading-snug">{w.meaning}</span>
                  <span className="mt-auto pt-1 text-xs font-bold text-muted-foreground">In the Quran ×{num(w.frequency)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq-heading" className="mt-12 max-w-3xl">
          <h2 id="faq-heading" className="mb-3 text-xl font-extrabold">
            Questions about Islamic terms
          </h2>
          <dl className="divide-y rounded-[1.375rem] border bg-card">
            {FAQ.map((f) => (
              <div key={f.q} className="p-5">
                <dt className="font-extrabold">{f.q}</dt>
                <dd className="mt-1 leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="sources-heading" className="mt-10 max-w-3xl">
          <h2 id="sources-heading" className="mb-2 text-xl font-extrabold">
            How this glossary was made
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The Arabic, occurrence counts and roots come from the Quranic Arabic Corpus, and verse quotations from the Saheeh
            International translation. “In the Quran ×n” counts every form of the word’s dictionary entry (for example, iman
            counts every form of إِيمَان). Terms that are not Quranic words, or not in the sense defined, are marked as such.
          </p>
        </section>

        <nav aria-label="Keep exploring" className="mt-10 flex flex-wrap gap-2">
          {[
            { to: '/phrases', label: 'Islamic phrases' },
            { to: '/names-of-allah', label: '99 Names of Allah' },
            { to: '/most-common-words-in-the-quran', label: 'Most common Quran words' },
            { to: '/roots', label: 'Quranic roots' },
            { to: '/collections', label: 'Word collections' },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="inline-flex min-h-11 items-center rounded-full border-2 bg-card px-4 text-sm font-bold hover:border-primary/40">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default IslamicTerms;
