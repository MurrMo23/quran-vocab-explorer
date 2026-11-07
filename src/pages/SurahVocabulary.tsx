import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { Button } from '@/components/ui/button';
import { getSurahVocabulary, isJuzAmma, surahPath, wordPath } from '@/utils/quran-pages';

const pct = (n: number) => `${n.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;

/** Long surahs list this many words until "Show all" is pressed. */
const INITIAL_WORDS = 50;
/** The Review button practises at most this many words (the most frequent ones). */
const REVIEW_WORDS = 20;

const juzLabel = (a: number, b: number) => (a === b ? `Juz ${a}` : `Juz ${a}–${b}`);

const SurahVocabulary = () => {
  const { number } = useParams<{ number: string }>();
  const n = Number(number);
  const surah = useMemo(() => (/^\d+$/.test(number ?? '') ? getSurahVocabulary(n) : undefined), [number, n]);
  // Keyed by surah so moving to the next surah collapses the list again.
  const [expandedFor, setExpandedFor] = useState<number | null>(null);

  if (!surah) {
    return (
      <>
        <SEO title="Surah vocabulary not found" noindex />
        <div className="py-16 text-center">
          <h1 className="mb-2 text-xl font-semibold">Surah not found</h1>
          <p className="mb-6 text-muted-foreground">The Quran has 114 surahs; every one has a vocabulary page.</p>
          <Button asChild>
            <Link to="/surahs">Browse surah vocabulary</Link>
          </Button>
        </div>
      </>
    );
  }

  const title = `Vocabulary of Surah ${surah.name} (${surah.number})`;
  const count = surah.words.length;
  const topWords = surah.words.slice(0, 5).map((w) => w.word.transliteration).join(', ');
  const description =
    count > 0
      ? `${count} Quranic Arabic ${count === 1 ? 'word' : 'words'} from Surah ${surah.name} (${surah.arabic}, "${surah.meaning}"), most frequent first: ${topWords}. Learning them covers ${pct(surah.coveragePercent)} of the surah's ${surah.totalWords} words.`
      : `Vocabulary of Surah ${surah.name} (${surah.arabic}, "${surah.meaning}"), ${surah.ayahs} ayahs and ${surah.totalWords} words.`;
  const reviewWords = surah.words.slice(0, REVIEW_WORDS);
  const practiceHref = `/review?words=${reviewWords.map((w) => encodeURIComponent(w.word.id)).join(',')}`;
  const reviewLabel = count > REVIEW_WORDS ? `Review the ${REVIEW_WORDS} most frequent words` : 'Review these words';
  const showAll = expandedFor === surah.number || count <= INITIAL_WORDS;
  const shownWords = showAll ? surah.words : surah.words.slice(0, INITIAL_WORDS);
  const juz = juzLabel(surah.juzStart, surah.juzEnd);

  return (
    <>
      <SEO
        title={title}
        description={description}
        url={surahPath(surah.number)}
        keywords={[
          `Surah ${surah.name}`,
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
      />

      <div className="container mx-auto max-w-4xl py-6">
        <PageTrail items={[{ name: 'Surah vocabulary', path: '/surahs' }, { name: surah.name, path: surahPath(surah.number) }]} />

        <header className="mb-6">
          <p className="font-arabic text-3xl text-primary" lang="ar" dir="rtl">
            سورة {surah.arabic}
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-1 text-muted-foreground">
            “{surah.meaning}” · {surah.ayahs} ayahs · {surah.totalWords.toLocaleString('en-US')} words · {juz}
          </p>
        </header>

        {count > 0 ? (
          <section className="mb-8 rounded-xl border bg-secondary/30 p-4 sm:p-5" aria-labelledby="coverage-heading">
            <h2 id="coverage-heading" className="sr-only">Coverage</h2>
            <p className="text-lg">
              Learning these <strong>{count}</strong> {count === 1 ? 'word' : 'words'} covers{' '}
              <strong>{pct(surah.coveragePercent)}</strong> of the surah’s words.
            </p>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Share of the surah's words covered"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={surah.coveragePercent}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${surah.coveragePercent}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {surah.coveredWords.toLocaleString('en-US')} of the {surah.totalWords.toLocaleString('en-US')} words in the
              surah are forms of these words.
            </p>
            <Button asChild className="mt-4 w-full sm:w-auto">
              <Link to={practiceHref}>
                <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                {reviewLabel}
              </Link>
            </Button>
          </section>
        ) : (
          <p className="mb-8 text-muted-foreground">None of the words on QuranVocab occur in this surah yet.</p>
        )}

        {count > 0 && (
          <section aria-labelledby="words-heading">
            <h2 id="words-heading" className="mb-3 text-lg font-semibold">
              Words in Surah {surah.name}, most frequent first
            </h2>
            {!showAll && (
              <p className="mb-3 text-sm text-muted-foreground">
                Showing the {INITIAL_WORDS} most frequent of {count} words.
              </p>
            )}
            <ol className="divide-y rounded-xl border" id="surah-word-list">
              {shownWords.map(({ word, count: c }) => (
                <li key={word.id}>
                  <Link
                    to={wordPath(word.id)}
                    className="flex items-center gap-4 p-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 sm:p-4"
                  >
                    <span className="min-w-[4.5rem] text-right font-arabic text-2xl" lang="ar" dir="rtl">
                      {word.arabic}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{word.meaning}</span>
                      <span className="block text-sm text-muted-foreground">{word.transliteration}</span>
                    </span>
                    <span className="shrink-0 text-sm text-muted-foreground" aria-label={`${c} ${c === 1 ? 'time' : 'times'} in this surah`}>
                      ×{c}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            {!showAll && (
              <Button
                variant="outline"
                className="mt-3 w-full"
                aria-controls="surah-word-list"
                onClick={() => setExpandedFor(surah.number)}
              >
                Show all {count} words
              </Button>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Counts are from the Quranic Arabic Corpus: every form of a word (its dictionary form, or lemma) counts,
              while attached pronouns and one-letter prefixes such as “wa” are not counted as separate words.
            </p>
          </section>
        )}

        <nav className="mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between" aria-label="Other surahs">
          {surah.prev ? (
            <Link to={surahPath(surah.prev.number)} className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted/50">
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="block text-xs text-muted-foreground">Previous surah</span>
                {surah.prev.number}. {surah.prev.name}
              </span>
            </Link>
          ) : <span />}
          {surah.next && (
            <Link to={surahPath(surah.next.number)} className="flex items-center justify-end gap-2 rounded-lg border p-3 text-right hover:bg-muted/50">
              <span>
                <span className="block text-xs text-muted-foreground">Next surah</span>
                {surah.next.number}. {surah.next.name}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          )}
        </nav>
      </div>
    </>
  );
};

export default SurahVocabulary;
