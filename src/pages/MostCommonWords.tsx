import React from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { Button } from '@/components/ui/button';
import { reviewWordsUrl } from '@/components/review/review-session';
import { track } from '@/lib/analytics';
import { getWordById } from '@/utils/vocabulary';
import type { Word } from '@/utils/vocabulary-types';
import { quranCount } from '@/utils/word-lists';
import { wordPath } from '@/utils/quran-pages';
import { CORPUS_LEMMA_COVERAGE, QURAN_STATS, TOP_WORD_COVERAGE, TOP_WORD_IDS } from '@/utils/generated/pillars';
import { itemListLd } from '@/utils/seo-templates';
import { PILLAR_PATHS, commonWordsSeo } from '@/utils/seo-pillars';

const COMMON_WORDS_PATH = PILLAR_PATHS.commonWords;
const TOP = 100;

const pct = (part: number, whole: number) => `${((100 * part) / whole).toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
const num = (n: number) => n.toLocaleString('en-US');

const MostCommonWords = () => {
  const total = QURAN_STATS.words;
  const words = TOP_WORD_IDS.slice(0, TOP)
    .map((id) => getWordById(id))
    .filter((w): w is Word => !!w);
  const covered = TOP_WORD_COVERAGE.find(([n]) => n === TOP)?.[1] ?? 0;
  const coverPct = (100 * covered) / total;
  const seo = commonWordsSeo(TOP, covered, total);
  const reviewIds = words.map((w) => w.id);
  const siteAll = TOP_WORD_COVERAGE[TOP_WORD_COVERAGE.length - 1];

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={COMMON_WORDS_PATH}
        keywords={['most common words in the Quran', 'Quran words', 'Quranic words', 'Quran word frequency', 'high frequency Quranic vocabulary']}
        breadcrumbs={[{ name: 'Most common words in the Quran', path: COMMON_WORDS_PATH }]}
        jsonLd={[
          itemListLd(
            `The ${TOP} most common words in the Quran`,
            COMMON_WORDS_PATH,
            words.map((w) => ({ name: `${w.transliteration} (${w.arabic}): ${w.meaning}`, path: wordPath(w.id) })),
          ),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Most common words in the Quran', path: COMMON_WORDS_PATH }]} />

        <div className="card-tactile mb-8 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <header className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">The {TOP} Most Common Words in the Quran</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              The Quran has {num(total)} words, but most of them are forms of a small set of very frequent words. These are the{' '}
              {TOP} that occur most often, counted across every form they take, with what each one means.
            </p>
          </header>

          <section aria-labelledby="coverage-heading" className="flex w-full flex-col gap-3 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-sm">
            <h2 id="coverage-heading" className="sr-only">
              Coverage
            </h2>
            <p className="text-[17px] leading-snug">
              Together these {TOP} words make up <strong className="font-extrabold text-primary">{pct(covered, total)}</strong> of the
              words in the Quran.
            </p>
            <div
              className="h-3.5 overflow-hidden rounded-full bg-track"
              role="progressbar"
              aria-label={`Share of the Quran's words that are one of these ${TOP}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(coverPct * 10) / 10}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${coverPct}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              {num(covered)} of {num(total)} words.
            </p>
            <Button asChild size="lg" className="mt-1 h-auto min-h-14 w-full whitespace-normal py-3">
              <Link to={reviewWordsUrl(reviewIds)} onClick={() => track('cta_click', { cta: 'learn_top_100', location: 'common_words_hero' })}>
                <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                Learn the top {TOP}
              </Link>
            </Button>
          </section>
        </div>

        <section aria-labelledby="list-heading">
          <h2 id="list-heading" className="mb-3 text-xl font-extrabold">
            Quranic words by frequency
          </h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" id="common-word-list">
            {words.map((w, i) => (
              <li key={w.id}>
                <Link
                  to={wordPath(w.id)}
                  className="flex h-full items-center gap-3 rounded-[1.375rem] border-2 border-b-4 bg-card px-4 py-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="w-8 shrink-0 text-center text-sm font-extrabold text-muted-foreground" aria-label={`Rank ${i + 1}`}>
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold leading-snug">{w.meaning}</span>
                    <span className="block text-sm text-muted-foreground">{w.transliteration}</span>
                    <span
                      className="mt-1 inline-block rounded-full bg-gold/25 px-2 py-0.5 text-xs font-bold text-gold-text"
                      aria-label={`${num(quranCount(w.id))} times in the Quran`}
                    >
                      ×{num(quranCount(w.id))}
                    </span>
                  </span>
                  <span className="max-w-[45%] shrink-0 text-right font-quran text-[1.75rem] leading-[1.9]" lang="ar" dir="rtl">
                    {w.arabic}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="few-words-heading" className="mt-12 grid gap-6 md:grid-cols-[3fr_2fr]">
          <div>
            <h2 id="few-words-heading" className="mb-3 text-xl font-extrabold">
              How a few hundred words cover most of the Quran
            </h2>
            <div className="space-y-3 text-[17px] leading-relaxed">
              <p>
                Word frequency in the Quran is very uneven. The ten most common words alone (small words like min “from”,
                fī “in” and mā “what”, and the name Allah) make up {pct(TOP_WORD_COVERAGE[0][1], total)} of the text. After
                that each new word adds less, but the curve stays steep for a long time.
              </p>
              <p>
                Counting every dictionary word in the Quran, the 300 most frequent make up{' '}
                {pct(CORPUS_LEMMA_COVERAGE.find(([n]) => n === 300)?.[1] ?? 0, total)} of its words, and the 1,000 most frequent{' '}
                {pct(CORPUS_LEMMA_COVERAGE.find(([n]) => n === 1000)?.[1] ?? 0, total)}, out of {num(QURAN_STATS.lemmas)}{' '}
                different words in all. So a learner who knows a few hundred words recognises most of the words on any page,
                even though understanding a verse still needs grammar and context.
              </p>
            </div>
          </div>
          <div className="rounded-[1.375rem] border bg-card p-5">
            <table className="w-full text-left text-[15px]">
              <caption className="mb-2 text-left font-extrabold">Share of the Quran’s words covered</caption>
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th scope="col" className="py-2 font-bold">
                    Most frequent words
                  </th>
                  <th scope="col" className="py-2 text-right font-bold">
                    Coverage
                  </th>
                </tr>
              </thead>
              <tbody>
                {CORPUS_LEMMA_COVERAGE.map(([n, c]) => (
                  <tr key={n} className="border-b last:border-0">
                    <td className="py-2">Top {num(n)}</td>
                    <td className="py-2 text-right font-extrabold tabular-nums">{pct(c, total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="method-heading" className="mt-10 max-w-3xl">
          <h2 id="method-heading" className="mb-2 text-xl font-extrabold">
            How the words were counted
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Counts come from the Quranic Arabic Corpus, which divides the Quran into {num(total)} words (as written, with
            prefixes like “wa” and attached pronouns belonging to their word). Each word is counted under its dictionary form
            (lemma), so qāla “he said”, qālū “they said” and yaqūlu “he says” all count for qāla. Coverage counts a word of the
            text when its main dictionary form is on the list. {num(QURAN_STATS.noLemmaTokens)} words are free-standing
            pronouns such as huwa “he”, which the corpus gives no dictionary form, so they are never counted as covered and
            the percentages err on the low side. The list shows one entry per dictionary word; QuranVocab’s{' '}
            {num(siteAll[0])} Quranic words together cover {pct(siteAll[1], total)}.
          </p>
        </section>

        <nav aria-label="Keep exploring" className="mt-10 flex flex-wrap gap-2">
          {[
            { to: PILLAR_PATHS.juzAmma, label: 'Juz Amma vocabulary' },
            { to: PILLAR_PATHS.stats, label: 'Quran statistics' },
            { to: '/surahs', label: 'Word lists for every surah' },
            { to: '/roots', label: 'Quranic roots' },
            { to: '/phrases', label: 'Islamic phrases' },
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

export default MostCommonWords;
