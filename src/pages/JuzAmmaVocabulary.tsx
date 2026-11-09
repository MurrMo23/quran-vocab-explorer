import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { Button } from '@/components/ui/button';
import { reviewWordsUrl } from '@/components/review/review-session';
import { track } from '@/lib/analytics';
import { firstUnstarted, goalWordIds, writeLearningGoal } from '@/lib/learning-goals';
import { useProgress } from '@/lib/progress';
import { getWordById } from '@/utils/vocabulary';
import type { Word } from '@/utils/vocabulary-types';
import { JUZ_AMMA_SURAHS, juzAmmaCounts, juzAmmaWordIds } from '@/utils/word-lists';
import { getSurahSummary, surahPath, wordPath, type SurahSummary } from '@/utils/quran-pages';
import { JUZ_AMMA_COVERAGE, JUZ_AMMA_STATS } from '@/utils/generated/pillars';
import { itemListLd } from '@/utils/seo-templates';
import { PILLAR_PATHS, juzAmmaSeo } from '@/utils/seo-pillars';

const PATH = PILLAR_PATHS.juzAmma;
const INITIAL = 60;
/** First review session of the goal (same size as the goal chooser's). */
const FIRST_SESSION = 10;
const TOP = 100;
const num = (n: number) => n.toLocaleString('en-US');
const pct = (part: number, whole: number) => `${((100 * part) / whole).toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;

const JuzAmmaVocabulary = () => {
  const navigate = useNavigate();
  const { cards } = useProgress();
  const [showAll, setShowAll] = useState(false);
  const { counts } = juzAmmaCounts();
  const words = useMemo(
    () =>
      juzAmmaWordIds()
        .map((id) => getWordById(id))
        .filter((w): w is Word => !!w),
    [],
  );
  const surahs = JUZ_AMMA_SURAHS.map((n) => getSurahSummary(n)).filter((s): s is SurahSummary => !!s);
  const total = JUZ_AMMA_STATS.words;
  const coverage = (n: number) => JUZ_AMMA_COVERAGE.find(([k]) => k === n)?.[1] ?? 0;
  const all = JUZ_AMMA_COVERAGE[JUZ_AMMA_COVERAGE.length - 1];
  const seo = juzAmmaSeo(TOP, coverage(TOP), total);
  const shown = showAll ? words : words.slice(0, INITIAL);
  const goalIds = goalWordIds('juz-amma');
  // Without JavaScript the link still opens a review of the goal's first words.
  const startHref = reviewWordsUrl(goalIds.slice(0, FIRST_SESSION));

  const startGoal = (e: React.MouseEvent) => {
    e.preventDefault();
    writeLearningGoal('juz-amma');
    track('goal_selected', { goal: 'juz-amma' });
    track('cta_click', { cta: 'start_juz_amma_goal', location: 'juz_amma_hero' });
    navigate(reviewWordsUrl(firstUnstarted(goalIds, (id) => !!cards.get(id)?.lastReview, FIRST_SESSION)));
  };

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={PATH}
        keywords={['Juz Amma', 'Juz Amma vocabulary', 'Juz 30', 'short surahs', 'Juz Amma words meaning']}
        breadcrumbs={[
          { name: 'Surah vocabulary', path: '/surahs' },
          { name: 'Juz Amma vocabulary', path: PATH },
        ]}
        jsonLd={[
          itemListLd(
            'Most frequent words in Juz Amma',
            PATH,
            words.slice(0, INITIAL).map((w) => ({ name: `${w.transliteration} (${w.arabic}): ${w.meaning}`, path: wordPath(w.id) })),
          ),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail
          items={[
            { name: 'Surah vocabulary', path: '/surahs' },
            { name: 'Juz Amma', path: PATH },
          ]}
        />

        <div className="card-tactile mb-8 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <header className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gold/25 px-3 py-1.5 text-[13px] font-bold text-gold-text">Juz 30</span>
              <span className="rounded-full border bg-background px-3 py-1.5 text-[13px] font-bold">Surahs 78–114</span>
            </div>
            <p className="mt-4 font-quran text-5xl leading-[1.75] text-primary sm:text-6xl" lang="ar" dir="rtl">
              جزء عمّ
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Juz Amma Vocabulary</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground sm:text-[17px]">
              The words of the 30th juz, from An-Naba (78) to An-Nas (114), most frequent first. These are the short surahs
              most Muslims memorise first and recite in prayer: {surahs.length} surahs, {num(JUZ_AMMA_STATS.ayahs)} ayahs and{' '}
              {num(total)} words.
            </p>
          </header>

          <section aria-labelledby="juz-coverage" className="flex w-full flex-col gap-3 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-sm">
            <h2 id="juz-coverage" className="sr-only">
              Coverage
            </h2>
            <p className="text-[17px] leading-snug">
              The top <strong className="font-extrabold">{TOP}</strong> words below make up{' '}
              <strong className="font-extrabold text-primary">{pct(coverage(TOP), total)}</strong> of the words in Juz Amma.
            </p>
            <div
              className="h-3.5 overflow-hidden rounded-full bg-track"
              role="progressbar"
              aria-label={`Share of Juz Amma's words that are one of the top ${TOP}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round((1000 * coverage(TOP)) / total) / 10}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${(100 * coverage(TOP)) / total}%` }} />
            </div>
            <Button asChild size="lg" className="mt-1 h-auto min-h-14 w-full whitespace-normal py-3">
              <Link to={startHref} onClick={startGoal}>
                <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                Start learning Juz Amma
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Sets Juz Amma as your learning goal: each review brings in its next new words, most frequent first.
            </p>
          </section>
        </div>

        <section aria-labelledby="juz-words">
          <h2 id="juz-words" className="mb-1 text-xl font-extrabold">
            Words in Juz Amma, most frequent first
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            {words.length} words · the count is how often each occurs in Juz Amma.
            {!showAll && words.length > INITIAL && ` Showing the first ${INITIAL}.`}
          </p>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" id="juz-word-list">
            {shown.map((w) => {
              const c = counts.get(w.id) ?? 0;
              return (
                <li key={w.id}>
                  <Link
                    to={wordPath(w.id)}
                    className="flex h-full items-center gap-4 rounded-[1.375rem] border-2 border-b-4 bg-card px-4 py-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-extrabold leading-snug">{w.meaning}</span>
                      <span className="block text-sm text-muted-foreground">{w.transliteration}</span>
                      <span
                        className="mt-1 inline-block rounded-full bg-gold/25 px-2 py-0.5 text-xs font-bold text-gold-text"
                        aria-label={`${c} ${c === 1 ? 'time' : 'times'} in Juz Amma`}
                      >
                        ×{c}
                      </span>
                    </span>
                    <span className="max-w-[55%] shrink-0 text-right font-quran text-[1.75rem] leading-[1.9]" lang="ar" dir="rtl">
                      {w.arabic}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          {!showAll && words.length > INITIAL && (
            <Button variant="outline" size="lg" className="mt-4 w-full" aria-controls="juz-word-list" onClick={() => setShowAll(true)}>
              Show all {words.length} words
            </Button>
          )}
        </section>

        <section aria-labelledby="juz-surahs" className="mt-12">
          <h2 id="juz-surahs" className="mb-3 text-xl font-extrabold">
            The {surahs.length} surahs of Juz Amma
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {surahs.map((s) => (
              <li key={s.number}>
                <Link
                  to={surahPath(s.number)}
                  className="flex min-h-14 items-center gap-3 rounded-[1.25rem] border bg-card px-4 py-2.5 transition-colors hover:border-primary/40"
                >
                  <span className="w-8 shrink-0 text-center text-sm font-extrabold text-muted-foreground">{s.number}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold leading-snug">{s.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {s.ayahs} ayahs · {s.totalWords} words
                    </span>
                  </span>
                  <span className="shrink-0 font-arabic text-xl" lang="ar" dir="rtl">
                    {s.arabic}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="juz-how" className="mt-12 grid gap-6 md:grid-cols-[3fr_2fr]">
          <div>
            <h2 id="juz-how" className="mb-2 text-xl font-extrabold">
              Why learn the words of Juz Amma?
            </h2>
            <div className="space-y-3 text-[17px] leading-relaxed">
              <p>
                Juz Amma is named after its first word, ʿamma (“about what”), in “About what are they asking one another?”
                (78:1). Because its surahs are short, they are the ones most often recited in the daily prayers, so knowing
                their words turns recitation you already know by heart into words you understand.
              </p>
              <p>
                Its {num(total)} words are forms of {num(JUZ_AMMA_STATS.lemmas)} different dictionary words, but a small core
                repeats: the 10 most frequent make up {pct(coverage(10), total)} of the text and the top 50 make up{' '}
                {pct(coverage(50), total)}. The {all[0]} Juz Amma words on QuranVocab cover {pct(all[1], total)}.
              </p>
            </div>
          </div>
          <div className="rounded-[1.375rem] border bg-card p-5">
            <table className="w-full text-left text-[15px]">
              <caption className="mb-2 text-left font-extrabold">Share of Juz Amma’s words covered</caption>
              <tbody>
                {JUZ_AMMA_COVERAGE.map(([n, c]) => (
                  <tr key={n} className="border-b last:border-0">
                    <td className="py-2">{n === all[0] ? `All ${n} words on QuranVocab` : `Top ${n}`}</td>
                    <td className="py-2 text-right font-extrabold tabular-nums">{pct(c, total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Counted with the Quranic Arabic Corpus: a word of the text is covered when its dictionary form is on the list.
              Free-standing pronouns have no dictionary form there and are never counted.
            </p>
          </div>
        </section>

        <nav aria-label="Keep exploring" className="mt-10 flex flex-wrap gap-2">
          {[
            { to: PILLAR_PATHS.commonWords, label: 'Most common words in the Quran' },
            { to: '/surahs', label: 'All 114 surah word lists' },
            { to: PILLAR_PATHS.stats, label: 'Quran statistics' },
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

export default JuzAmmaVocabulary;
