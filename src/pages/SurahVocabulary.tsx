import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { track } from '@/lib/analytics';
import { ArrowLeft, ArrowRight, ChevronDown, Target } from 'lucide-react';
import SEO from '@/components/SEO';
import { ogImage } from '@/utils/og-image';
import PageTrail from '@/components/quran/PageTrail';
import { Button } from '@/components/ui/button';
import { getRootBySlug, getSurahVocabulary, getWordRootSlug, isJuzAmma, rootPath, surahPath, wordPath } from '@/utils/quran-pages';
import { itemListLd, searchSpelling, surahSeo } from '@/utils/seo-templates';
import { getSurahAliases } from '@/utils/surah-aliases';
import { hasSurahEnglish, surahEnglishPath, type SurahEnglish } from '@/utils/surah-english';
import { EmbedStaticData, useStaticData } from '@/lib/static-data';

const pct = (n: number) => `${n.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;

/** Long surahs list this many words until "Show all" is pressed. */
const INITIAL_WORDS = 50;
/** Root links under the word list (the most frequent words' roots). */
const ROOTS_SHOWN = 24;
/** The Review button practises at most this many words (the most frequent ones). */
const REVIEW_WORDS = 20;

const juzLabel = (a: number, b: number) => (a === b ? `Juz ${a}` : `Juz ${a}–${b}`);

const SurahVocabulary = () => {
  const { number } = useParams<{ number: string }>();
  const n = Number(number);
  const surah = useMemo(() => (/^\d+$/.test(number ?? '') ? getSurahVocabulary(n) : undefined), [number, n]);
  // Keyed by surah so moving to the next surah collapses the list again.
  const [expandedFor, setExpandedFor] = useState<number | null>(null);
  const englishPath = surah && hasSurahEnglish(surah.number, surah.ayahs) ? surahEnglishPath(surah.number) : null;
  const { data: english } = useStaticData<SurahEnglish>(englishPath);

  if (!surah) {
    return (
      <>
        <SEO title="Surah vocabulary not found" noindex />
        <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
          <h1 className="mb-2 text-2xl font-extrabold">Surah not found</h1>
          <p className="mb-6 text-muted-foreground">The Quran has 114 surahs; every one has a vocabulary page.</p>
          <Button asChild>
            <Link to="/surahs">Browse surah vocabulary</Link>
          </Button>
        </div>
      </>
    );
  }

  const count = surah.words.length;
  const seo = surahSeo({
    ...surah,
    wordCount: count,
    topWords: surah.words.slice(0, 5).map((w) => w.word.transliteration),
    hasEnglish: !!englishPath,
  });
  const aliases = getSurahAliases(surah.number, surah.name);
  // Roots of the surah's words, in order of first appearance in the (frequency-sorted) list.
  const roots: { slug: string; ar: string }[] = [];
  for (const { word } of surah.words) {
    const slug = getWordRootSlug(word.id);
    if (!slug || roots.some((r) => r.slug === slug)) continue;
    const family = getRootBySlug(slug);
    if (family) roots.push({ slug, ar: family.arabic });
    if (roots.length >= ROOTS_SHOWN) break;
  }
  const reviewWords = surah.words.slice(0, REVIEW_WORDS);
  const practiceHref = `/review?words=${reviewWords.map((w) => encodeURIComponent(w.word.id)).join(',')}`;
  const reviewLabel = count > REVIEW_WORDS ? `Review the ${REVIEW_WORDS} most frequent words` : 'Review these words';
  const showAll = expandedFor === surah.number || count <= INITIAL_WORDS;
  const shownWords = showAll ? surah.words : surah.words.slice(0, INITIAL_WORDS);
  const juz = juzLabel(surah.juzStart, surah.juzEnd);

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={surahPath(surah.number)}
        image={ogImage('surah', surah.number)}
        imageAlt={`Surah ${surah.name} (${surah.arabic}): ${surah.meaning}`}
        keywords={[
          `Surah ${surah.name}`,
          `Surah ${searchSpelling(surah.name)} in English`,
          `${surah.name} vocabulary`,
          `${surah.name} words meaning`,
          surah.arabic,
          ...(isJuzAmma(surah.number) ? ['Juz Amma vocabulary'] : []),
          'Quranic Arabic',
        ]}
        breadcrumbs={[
          { name: 'Surah vocabulary', path: '/surahs' },
          { name: `Surah ${surah.name}`, path: surahPath(surah.number) },
        ]}
        jsonLd={
          count > 0
            ? [
                itemListLd(
                  `Words in Surah ${surah.name}`,
                  surahPath(surah.number),
                  surah.words.slice(0, INITIAL_WORDS).map(({ word }) => ({ name: `${word.transliteration} (${word.arabic})`, path: wordPath(word.id) })),
                ),
              ]
            : undefined
        }
      />
      {englishPath && english && <EmbedStaticData path={englishPath} data={english} />}

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Surah vocabulary', path: '/surahs' }, { name: surah.name, path: surahPath(surah.number) }]} />

        <div className="card-tactile mb-8 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
        <header className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary px-3 py-1.5 text-[13px] font-bold text-secondary-foreground">Surah {surah.number}</span>
            <span className="rounded-full border bg-background px-3 py-1.5 text-[13px] font-bold">{juz}</span>
            {isJuzAmma(surah.number) && (
              <span className="rounded-full bg-gold/25 px-3 py-1.5 text-[13px] font-bold text-gold-text">Juz Amma</span>
            )}
          </div>
          {/* One H1, "Surah <Name> (<Arabic>): Words & Meaning": the Arabic is shown first and large
              (order-first); the brackets and colon are for screen readers and the page outline only. */}
          <h1 className="mt-4 flex flex-col font-extrabold tracking-tight">
            <span className="text-2xl sm:text-4xl">Surah {surah.name}</span>
            <span className="sr-only"> (</span>
            <span className="order-first font-quran text-5xl font-normal leading-[1.75] text-primary sm:text-6xl" lang="ar" dir="rtl">
              سورة {surah.arabic}
            </span>
            <span className="sr-only">): </span>
            <span className="mt-1 text-lg text-muted-foreground sm:text-xl">Words &amp; Meaning</span>
          </h1>
          <p className="mt-2 text-muted-foreground sm:text-[17px]">
            “{surah.meaning}” · {surah.ayahs} ayahs · {surah.totalWords.toLocaleString('en-US')} words · {juz}
          </p>
          {aliases.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">Also known as: {aliases.map((a) => `Surah ${a}`).join(', ')}</p>
          )}
        </header>

        {count > 0 ? (
          <section className="flex w-full flex-col gap-3 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-sm" aria-labelledby="coverage-heading">
            <h2 id="coverage-heading" className="sr-only">Coverage</h2>
            <p className="text-[17px] leading-snug">
              Learning these <strong className="font-extrabold">{count}</strong> {count === 1 ? 'word' : 'words'} covers{' '}
              <strong className="font-extrabold text-primary">{pct(surah.coveragePercent)}</strong> of the surah’s words.
            </p>
            <div
              className="h-3.5 overflow-hidden rounded-full bg-track"
              role="progressbar"
              aria-label="Share of the surah's words covered"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={surah.coveragePercent}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${surah.coveragePercent}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              {surah.coveredWords.toLocaleString('en-US')} of the {surah.totalWords.toLocaleString('en-US')} words in the
              surah are forms of these words.
            </p>
            <Button asChild size="lg" className="mt-1 h-auto min-h-14 w-full whitespace-normal py-3 text-center">
              <Link to={practiceHref} onClick={() => track('cta_click', { cta: 'review_surah_words', location: 'surah_review_box' })}>
                <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                {reviewLabel}
              </Link>
            </Button>
          </section>
        ) : (
          <p className="text-muted-foreground lg:max-w-sm">None of the words on QuranVocab occur in this surah yet.</p>
        )}
        </div>

        {english && (
          <section aria-labelledby="english-heading" className="mb-8 rounded-[1.75rem] border bg-card p-5 sm:p-7">
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <h2 id="english-heading" className="text-xl font-extrabold">
                  Surah {surah.name} in English
                </h2>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary">
                  <span className="group-open:hidden">Show {english.ayahs.length} ayahs</span>
                  <span className="hidden group-open:inline">Hide</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                </span>
              </summary>
              <ol className="mt-4 grid gap-3">
                {english.ayahs.map((t, i) => (
                  <li key={i} className="flex gap-3 text-base leading-relaxed sm:text-[17px]">
                    <span className="mt-0.5 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-extrabold text-secondary-foreground">
                      {i + 1}
                    </span>
                    <p>{t}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">Translation: {english.source}.</p>
            </details>
          </section>
        )}

        {count > 0 && (
          <section aria-labelledby="words-heading">
            <h2 id="words-heading" className="mb-3 text-xl font-extrabold">
              Words in Surah {surah.name}, most frequent first
            </h2>
            {!showAll && (
              <p className="mb-3 text-sm text-muted-foreground">
                Showing the {INITIAL_WORDS} most frequent of {count} words.
              </p>
            )}
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" id="surah-word-list">
              {shownWords.map(({ word, count: c }) => (
                <li key={word.id}>
                  <Link
                    to={wordPath(word.id)}
                    className="flex h-full items-center gap-4 rounded-[1.375rem] border-2 border-b-4 bg-card px-4 py-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-extrabold leading-snug">{word.meaning}</span>
                      <span className="block text-sm text-muted-foreground">{word.transliteration}</span>
                      <span className="mt-1 inline-block rounded-full bg-gold/25 px-2 py-0.5 text-xs font-bold text-gold-text" aria-label={`${c} ${c === 1 ? 'time' : 'times'} in this surah`}>
                        ×{c}
                      </span>
                    </span>
                    <span className="max-w-[55%] shrink-0 text-right font-quran text-[1.75rem] leading-[1.9]" lang="ar" dir="rtl">
                      {word.arabic}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            {!showAll && (
              <Button
                variant="outline"
                size="lg"
                className="mt-4 w-full"
                aria-controls="surah-word-list"
                onClick={() => setExpandedFor(surah.number)}
              >
                Show all {count} words
              </Button>
            )}
            <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              Counts are from the Quranic Arabic Corpus: every form of a word (its dictionary form, or lemma) counts,
              while attached pronouns and one-letter prefixes such as “wa” are not counted as separate words.
            </p>
          </section>
        )}

        {roots.length > 0 && (
          <section aria-labelledby="roots-heading" className="mt-10">
            <h2 id="roots-heading" className="mb-3 text-xl font-extrabold">
              Roots of these words
            </h2>
            <ul className="flex flex-wrap gap-2">
              {roots.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={rootPath(r.slug)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 bg-card px-4 text-sm font-bold hover:border-primary/40"
                  >
                    <span className="font-arabic text-lg font-normal" lang="ar" dir="rtl">
                      {r.ar}
                    </span>
                    {r.slug}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className="mt-12 grid gap-3 sm:grid-cols-2" aria-label="Other surahs">
          {surah.prev ? (
            <Link to={surahPath(surah.prev.number)} className="flex items-center gap-3.5 rounded-[1.25rem] border bg-card px-5 py-4 transition-colors hover:border-primary/40">
              <ArrowLeft className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="font-extrabold">
                <span className="block text-[13px] font-normal text-muted-foreground">Previous surah</span>
                {surah.prev.number}. {surah.prev.name}
              </span>
            </Link>
          ) : <span />}
          {surah.next && (
            <Link to={surahPath(surah.next.number)} className="flex items-center justify-end gap-3.5 rounded-[1.25rem] border bg-card px-5 py-4 text-right transition-colors hover:border-primary/40">
              <span className="font-extrabold">
                <span className="block text-[13px] font-normal text-muted-foreground">Next surah</span>
                {surah.next.number}. {surah.next.name}
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          )}
        </nav>
      </div>
    </>
  );
};

export default SurahVocabulary;
