import React from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { Button } from '@/components/ui/button';
import { reviewWordsUrl } from '@/components/review/review-session';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { getWordById } from '@/utils/vocabulary';
import { PHRASES, PHRASES_HUB_PATH, phrasePath, type Phrase } from '@/utils/phrases';
import { SITE_URL, itemListLd } from '@/utils/seo-templates';
import { PHRASES_HUB_SEO } from '@/utils/seo-pillars';

const STATUS: Record<Phrase['quran']['status'], { label: string; className: string }> = {
  exact: { label: 'In the Quran', className: 'bg-secondary text-secondary-foreground' },
  related: { label: 'Related wording in the Quran', className: 'bg-gold/25 text-gold-text' },
  none: { label: 'Not in the Quran', className: 'border bg-background text-muted-foreground' },
};

const Phrases = () => {
  // Every word the phrases are made of that has a word page (each once, in page order).
  const reviewIds = [
    ...new Set(
      PHRASES.flatMap((p) => [p.wordId, ...p.parts.map((x) => x.wordId)]).filter((id): id is string => !!id && !!getWordById(id)),
    ),
  ];
  const description = PHRASES_HUB_SEO.description(
    PHRASES.length,
    PHRASES.map((p) => p.name),
  );
  const termSet = {
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}${PHRASES_HUB_PATH}#phrases`,
    name: 'Common Islamic phrases',
    url: `${SITE_URL}${PHRASES_HUB_PATH}`,
    hasDefinedTerm: PHRASES.map((p) => ({
      '@type': 'DefinedTerm',
      name: `${p.name} (${p.ar})`,
      description: p.meaning,
      url: `${SITE_URL}${phrasePath(p.slug)}`,
    })),
  };

  return (
    <>
      <SEO
        title={PHRASES_HUB_SEO.title}
        description={description}
        url={PHRASES_HUB_PATH}
        keywords={['Islamic phrases', 'Islamic phrases meaning', 'Arabic Islamic phrases', 'Muslim phrases', 'Inshallah', 'Mashallah']}
        breadcrumbs={[{ name: 'Islamic phrases', path: PHRASES_HUB_PATH }]}
        jsonLd={[
          itemListLd(
            'Common Islamic phrases',
            PHRASES_HUB_PATH,
            PHRASES.map((p) => ({ name: `${p.name} (${p.ar})`, path: phrasePath(p.slug) })),
          ),
          termSet,
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Islamic phrases', path: PHRASES_HUB_PATH }]} />

        <header className="card-tactile mb-8 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Islamic Phrases and Their Meanings</h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              The phrases Muslims say every day, from Inshallah to Assalamu alaikum, explained word by word. Each page shows
              the Arabic with full vowels, what every word means, when the phrase is said, and the Quran verses it comes
              from, or says plainly when a phrase is not in the Quran.
            </p>
          </div>
          {reviewIds.length > 0 && (
            <div className="flex w-full flex-col gap-2 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-xs">
              <Button asChild size="lg" className="h-auto min-h-14 w-full whitespace-normal py-3">
                <Link to={reviewWordsUrl(reviewIds)} onClick={() => track('cta_click', { cta: 'review_phrase_words', location: 'phrases_hub_hero' })}>
                  <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                  Review the words in these phrases
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {reviewIds.length} words and phrases with free spaced-repetition flashcards.
              </p>
            </div>
          )}
        </header>

        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {PHRASES.map((p) => (
            <li key={p.slug}>
              <Link
                to={phrasePath(p.slug)}
                className="flex h-full flex-col gap-2 rounded-[1.375rem] border-2 border-b-4 bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="font-quran text-[1.9rem] leading-[1.9] text-primary" lang="ar" dir="rtl">
                  {p.ar}
                </span>
                <span className="text-lg font-extrabold leading-snug">{p.name}</span>
                <span className="text-[15px] leading-snug">{p.meaning}</span>
                <span className="mt-auto pt-1">
                  <span className={cn('inline-block rounded-full px-2.5 py-1 text-xs font-bold', STATUS[p.quran.status].className)}>
                    {STATUS[p.quran.status].label}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section aria-labelledby="about-phrases" className="mt-12 max-w-3xl">
          <h2 id="about-phrases" className="mb-2 text-xl font-extrabold">
            Phrases from the Quran, and phrases about it
          </h2>
          <div className="space-y-3 text-[17px] leading-relaxed">
            <p>
              Several of these phrases are quoted straight from the Quran: bismillah opens its surahs, alhamdulillah opens
              Al-Fatihah, and the Quran itself teaches saying inshallah about the future (18:23–24). Others, like Allahu akbar
              and astaghfirullah, are built from Quranic words and commands without being quoted word for word. A few, like
              jazakallah khair and ameen, come from the Prophet’s practice rather than the Quran’s text.
            </p>
            <p>
              For Ramadan, see{' '}
              <Link to="/phrases/ramadan-mubarak" className="font-bold text-primary underline-offset-4 hover:underline">
                Ramadan Mubarak
              </Link>
              , the{' '}
              <Link to="/phrases/allahumma-innaka-afuwwun" className="font-bold text-primary underline-offset-4 hover:underline">
                dua for Laylatul Qadr
              </Link>{' '}
              and the other{' '}
              <Link to="/ramadan" className="font-bold text-primary underline-offset-4 hover:underline">
                Ramadan words
              </Link>
              .
            </p>
            <p>
              Learning the handful of words they are made of (Allah, shāʾa “to will”, ḥamd “praise”, ilāh “god”, illā “except”)
              also teaches you some of the most frequent words in the Quran. See the{' '}
              <Link to="/most-common-words-in-the-quran" className="font-bold text-primary underline-offset-4 hover:underline">
                most common words in the Quran
              </Link>{' '}
              or the{' '}
              <Link to="/names-of-allah" className="font-bold text-primary underline-offset-4 hover:underline">
                99 Names of Allah
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default Phrases;
