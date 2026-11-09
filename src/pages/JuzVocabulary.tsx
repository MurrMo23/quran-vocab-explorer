import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Moon, Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { Button } from '@/components/ui/button';
import { reviewWordsUrl } from '@/components/review/review-session';
import { track } from '@/lib/analytics';
import { EmbedStaticData, useStaticData } from '@/lib/static-data';
import { getWordById } from '@/utils/vocabulary';
import type { Word } from '@/utils/vocabulary-types';
import { surahPath, wordPath } from '@/utils/quran-pages';
import { itemListLd } from '@/utils/seo-templates';
import { PILLAR_PATHS } from '@/utils/seo-pillars';
import { juzSeo } from '@/utils/seo-juz';
import {
  JUZ_AMMA,
  JUZ_COUNT,
  JUZ_HUB_PATH,
  JUZ_TOP,
  getJuz,
  juzCoverage,
  juzDataPath,
  juzParts,
  juzPath,
  juzRangeLabel,
  juzRangeText,
  type JuzAyah,
  type JuzDetail,
} from '@/utils/juz';

/** Words the "Learn" button reviews (the most frequent ones, as on the surah pages). */
const REVIEW_WORDS = 20;
const num = (n: number) => n.toLocaleString('en-US');
const pct = (part: number, whole: number) => `${((100 * part) / whole).toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;

const AyahCard: React.FC<{ label: string; a: JuzAyah; name: string }> = ({ label, a, name }) => (
  <figure className="flex min-w-0 flex-col rounded-[1.375rem] border bg-card p-5">
    <figcaption className="mb-2 text-sm font-bold text-muted-foreground">
      {label}:{' '}
      <Link to={surahPath(a.s)} className="text-primary underline underline-offset-4 hover:text-primary-shade">
        {name} {a.s}:{a.a}
      </Link>
    </figcaption>
    <p className="font-quran text-2xl leading-[2] sm:text-[1.75rem]" lang="ar" dir="rtl">
      {a.ar}
    </p>
    <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">“{a.en}”</p>
  </figure>
);

const JuzVocabulary = () => {
  const { n: param } = useParams<{ n: string }>();
  const n = /^\d+$/.test(param ?? '') ? Number(param) : NaN;
  const juz = getJuz(n);
  const dataPath = juz && juz.n !== JUZ_AMMA ? juzDataPath(juz.n) : null;
  const { data, error } = useStaticData<JuzDetail>(dataPath);

  if (juz?.n === JUZ_AMMA) return <Navigate to={PILLAR_PATHS.juzAmma} replace />;
  if (!juz) {
    return (
      <>
        <SEO title="Juz not found" noindex />
        <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
          <h1 className="mb-2 text-2xl font-extrabold">Juz not found</h1>
          <p className="mb-6 text-muted-foreground">The Quran is divided into 30 juz; each one has a vocabulary page.</p>
          <Button asChild>
            <Link to={JUZ_HUB_PATH}>All 30 juz</Link>
          </Button>
        </div>
      </>
    );
  }

  const path = juzPath(juz.n);
  const words = (data?.top ?? [])
    .map(([id, count]) => ({ word: getWordById(id), count }))
    .filter((w): w is { word: Word; count: number } => !!w.word);
  const shownTop = Math.min(JUZ_TOP, juz.siteWords);
  const covered = juzCoverage(juz, shownTop);
  const all = juz.cov[juz.cov.length - 1];
  const range = juzRangeLabel(juz);
  const seo = juzSeo(juz, juzRangeText(juz), shownTop, covered);
  const parts = juzParts(juz);
  const reviewIds = words.slice(0, REVIEW_WORDS).map((w) => w.word.id);
  const prev = juz.n > 1 ? getJuz(juz.n - 1) : undefined;
  const next = juz.n < JUZ_COUNT ? getJuz(juz.n + 1) : undefined;
  const nameNote =
    juz.nameRef[0] !== juz.start[0] || juz.nameRef[1] !== juz.start[1]
      ? juz.n === 1
        ? ` The name comes from the opening of Al-Baqarah (2:1), the first surah after Al-Fatiha.`
        : ` The name comes from ${juz.nameRef[0]}:${juz.nameRef[1]}, where this juz begins in many printed mushafs; this page follows the standard Madani division, which starts it at ${juz.start[0]}:${juz.start[1]}.`
      : '';

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={path}
        keywords={[`Juz ${juz.n}`, `Para ${juz.n}`, `Juz ${juz.n} vocabulary`, `${juz.name} juz`, `Sipara ${juz.n}`, 'Quranic Arabic words']}
        breadcrumbs={[
          { name: 'Juz by juz', path: JUZ_HUB_PATH },
          { name: `Juz ${juz.n}`, path },
        ]}
        jsonLd={
          words.length
            ? [
                itemListLd(
                  `Most frequent words in Juz ${juz.n}`,
                  path,
                  words.map(({ word }) => ({ name: `${word.transliteration} (${word.arabic}): ${word.meaning}`, path: wordPath(word.id) })),
                ),
              ]
            : undefined
        }
      />
      {dataPath && data && <EmbedStaticData path={dataPath} data={data} />}

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail
          items={[
            { name: 'Juz by juz', path: JUZ_HUB_PATH },
            { name: `Juz ${juz.n}`, path },
          ]}
        />

        <div className="card-tactile mb-8 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <header className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-secondary px-3 py-1.5 text-[13px] font-bold text-secondary-foreground">Juz {juz.n}</span>
              <span className="rounded-full border bg-background px-3 py-1.5 text-[13px] font-bold">Para {juz.n}</span>
              <span className="rounded-full bg-gold/25 px-3 py-1.5 text-[13px] font-bold text-gold-text">Ramadan Day {juz.n}</span>
            </div>
            <h1 className="mt-4 flex flex-col font-extrabold tracking-tight">
              <span className="order-first font-quran text-5xl font-normal leading-[1.75] text-primary sm:text-6xl" lang="ar" dir="rtl">
                {juz.ar}
              </span>
              <span className="sr-only"> </span>
              <span className="text-2xl sm:text-4xl">
                Juz {juz.n} ({juz.name}) Vocabulary
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground sm:text-[17px]">
              {range} · {num(juz.ayahs)} ayahs · {num(juz.words)} words
            </p>
          </header>

          <section aria-labelledby="juz-coverage" className="flex w-full flex-col gap-3 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-sm">
            <h2 id="juz-coverage" className="sr-only">
              Coverage
            </h2>
            <p className="text-[17px] leading-snug">
              The top <strong className="font-extrabold">{shownTop}</strong> words below make up{' '}
              <strong className="font-extrabold text-primary">{pct(covered, juz.words)}</strong> of the words in Juz {juz.n}.
            </p>
            <div
              className="h-3.5 overflow-hidden rounded-full bg-track"
              role="progressbar"
              aria-label={`Share of Juz ${juz.n}'s words that are one of the top ${shownTop}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round((1000 * covered) / juz.words) / 10}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${(100 * covered) / juz.words}%` }} />
            </div>
            <Button asChild size="lg" className="mt-1 h-auto min-h-14 w-full whitespace-normal py-3">
              {reviewIds.length ? (
                <Link to={reviewWordsUrl(reviewIds)} onClick={() => track('cta_click', { cta: 'review_juz_words', location: 'juz_hero' })}>
                  <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                  Learn Juz {juz.n}’s top {reviewIds.length} words
                </Link>
              ) : (
                <span aria-disabled="true">
                  <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                  Learn Juz {juz.n}’s top words
                </span>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">Flashcards of the {REVIEW_WORDS} most frequent words, free.</p>
          </section>
        </div>

        <section aria-labelledby="juz-words">
          <h2 id="juz-words" className="mb-1 text-xl font-extrabold">
            Key words of Juz {juz.n} (Para {juz.n}), most frequent first
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            The {shownTop} most frequent of the {juz.siteWords} QuranVocab words in this juz · the count is how often each occurs in
            Juz {juz.n}.
          </p>
          {!data ? (
            <p className="rounded-[1.375rem] border bg-card p-5 text-muted-foreground" aria-live="polite">
              {error ? 'The word list could not be loaded. Please check your connection and reload.' : 'Loading the word list…'}
            </p>
          ) : (
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {words.map(({ word: w, count: c }) => (
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
                          aria-label={`${c} ${c === 1 ? 'time' : 'times'} in Juz ${juz.n}`}
                        >
                          ×{c}
                        </span>
                      </span>
                      <span className="max-w-[55%] shrink-0 text-right font-quran text-[1.75rem] leading-[1.9]" lang="ar" dir="rtl">
                        {w.arabic}
                      </span>
                    </Link>
                  </li>
                ))}
            </ol>
          )}
        </section>

        {data && data.other.length > 0 && (
          <section aria-labelledby="juz-other" className="mt-10">
            <h2 id="juz-other" className="mb-1 text-xl font-extrabold">
              Other frequent words in Juz {juz.n}
            </h2>
            <p className="mb-3 text-sm text-muted-foreground">
              Not on QuranVocab yet, so there is no word page or flashcard for them. Each shows its most common form in this juz
              with its word-by-word meaning there, and the dictionary form.
            </p>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.other.map((o) => (
                <li key={o.lemma} className="flex items-center gap-4 rounded-[1.25rem] border border-dashed bg-background px-4 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-snug">{o.gl}</span>
                    <span className="block text-xs text-muted-foreground">
                      ×{o.n} · dictionary form{' '}
                      <span className="font-arabic text-base" lang="ar" dir="rtl">
                        {o.lemma}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 font-quran text-2xl leading-[1.9]" lang="ar" dir="rtl">
                    {o.ar}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data && (
          <section aria-labelledby="juz-bounds" className="mt-12">
            <h2 id="juz-bounds" className="mb-3 text-xl font-extrabold">
              Where Juz {juz.n} begins and ends
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <AyahCard label="First ayah" a={data.first} name={parts[0].name} />
              <AyahCard label="Last ayah" a={data.last} name={parts[parts.length - 1].name} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Translation: Saheeh International.</p>
          </section>
        )}

        <section aria-labelledby="juz-surahs" className="mt-12">
          <h2 id="juz-surahs" className="mb-3 text-xl font-extrabold">
            Surahs in Juz {juz.n}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {parts.map((p) => (
              <li key={p.surah}>
                <Link
                  to={surahPath(p.surah)}
                  className="flex min-h-14 items-center gap-3 rounded-[1.25rem] border bg-card px-4 py-2.5 transition-colors hover:border-primary/40"
                >
                  <span className="w-8 shrink-0 text-center text-sm font-extrabold text-muted-foreground">{p.surah}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold leading-snug">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {p.whole ? `Whole surah · ${p.ayahs} ayahs` : `Ayahs ${p.from}–${p.to} of ${p.ayahs}`}
                    </span>
                  </span>
                  <span className="shrink-0 font-arabic text-xl" lang="ar" dir="rtl">
                    {p.arabic}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="juz-how" className="mt-12 grid gap-6 md:grid-cols-[3fr_2fr]">
          <div>
            <h2 id="juz-how" className="mb-2 text-xl font-extrabold">
              About Juz {juz.n}
            </h2>
            <div className="space-y-3 text-[17px] leading-relaxed">
              <p>
                Juz {juz.n} of 30, also called Para {juz.n} or Sipara {juz.n}, is traditionally named{' '}
                <span className="font-arabic text-xl" lang="ar" dir="rtl">
                  {juz.ar}
                </span>{' '}
                ({juz.name}) after its opening words.{nameNote}
              </p>
              <p>
                Its {num(juz.words)} words are forms of {num(juz.lemmas)} different dictionary words, but a small core repeats: the
                10 most frequent QuranVocab words make up {pct(juzCoverage(juz, 10), juz.words)} of the text, and all {all[0]}{' '}
                QuranVocab words in it cover {pct(all[1], juz.words)}.
              </p>
              <p className="flex items-start gap-2 rounded-2xl bg-secondary/60 p-4 text-[15px]">
                <Moon className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  Reading one juz a day in Ramadan, or hearing one a night in taraweeh? Juz {juz.n} is{' '}
                  <Link to={`/ramadan#day-${juz.n}`} className="font-semibold text-primary underline underline-offset-4 hover:text-primary-shade">
                    Day {juz.n} of the Ramadan plan
                  </Link>
                  .
                </span>
              </p>
            </div>
          </div>
          <div className="rounded-[1.375rem] border bg-card p-5">
            <table className="w-full text-left text-[15px]">
              <caption className="mb-2 text-left font-extrabold">Share of Juz {juz.n}’s words covered</caption>
              <tbody>
                {juz.cov.map(([k, c]) => (
                  <tr key={k} className="border-b last:border-0">
                    <td className="py-2">{k === all[0] ? `All ${k} words on QuranVocab` : `Top ${k}`}</td>
                    <td className="py-2 text-right font-extrabold tabular-nums">{pct(c, juz.words)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Counted with the Quranic Arabic Corpus over the {num(juz.words)} words of {range}: a word of the text is covered when
              its dictionary form is on the list. Free-standing pronouns have no dictionary form there and are never counted.
            </p>
          </div>
        </section>

        <nav className="mt-12 grid gap-3 sm:grid-cols-2" aria-label="Other juz">
          {prev ? (
            <Link to={juzPath(prev.n)} className="flex items-center gap-3.5 rounded-[1.25rem] border bg-card px-5 py-4 transition-colors hover:border-primary/40">
              <ArrowLeft className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="font-extrabold">
                <span className="block text-[13px] font-normal text-muted-foreground">Previous juz</span>
                Juz {prev.n}: {prev.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={juzPath(next.n)}
              className="flex items-center justify-end gap-3.5 rounded-[1.25rem] border bg-card px-5 py-4 text-right transition-colors hover:border-primary/40"
            >
              <span className="font-extrabold">
                <span className="block text-[13px] font-normal text-muted-foreground">Next juz</span>
                Juz {next.n}: {next.name}
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          )}
        </nav>
        <p className="mt-4 text-center">
          <Link to={JUZ_HUB_PATH} className="inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4 hover:text-primary-shade">
            All 30 juz
          </Link>
        </p>
      </div>
    </>
  );
};

export default JuzVocabulary;
