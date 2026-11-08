import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { Word, getCollectionById, getWordsByCollection } from '@/utils/vocabulary';
import AudioAttribution from './audio/AudioAttribution';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import WordNotesPanel from '@/components/learning/WordNotesPanel';
import { getQuranicUsage } from '@/utils/word-usage';
import { getRootBySlug, getSurahName, getWordRootSlug, getWordSurahPages, hasSurahPage, rootPath, surahPath } from '@/utils/quran-pages';
import { getWordPath } from '@/utils/word-slugs';
import { getNameForWord, namePath } from '@/utils/names-of-allah';
import { getRecitationSources, hasPronunciation } from '@/utils/audio';
import VoicePicker from '@/components/audio/VoicePicker';
import { reviewWordsUrl } from '@/components/review/review-session';
import WordAudioButton from '@/components/word/WordAudioButton';
import { getRecitedForm } from '@/utils/audio';
import { highlightWordInVerse } from '@/components/word/verse-highlight';

/** At most this many "Appears in" surah links; more common words show the surahs where they occur most. */
const SURAH_CHIPS = 12;
const topSurahPages = <T extends { surah: { number: number }; count: number }>(pages: T[]): T[] =>
  pages.length <= SURAH_CHIPS
    ? pages
    : [...pages]
        .sort((a, b) => b.count - a.count || a.surah.number - b.surah.number)
        .slice(0, SURAH_CHIPS)
        .sort((a, b) => a.surah.number - b.surah.number);

/** Root family cards shown on the word page; the root page lists the rest. */
const ROOT_FAMILY_CARDS = 6;

const LEVEL_LABEL: Record<Word['level'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Letters in the headword (vowel marks excluded), used to scale very long words down. */
const letterCount = (arabic: string) => arabic.replace(/[ً-ٰٟۖ-ۭـ\s]/g, '').length;

const sectionCard = 'rounded-[28px] border border-border bg-card p-5 sm:p-7';
const asideCard = 'rounded-3xl border border-border bg-card p-6';

interface WordDetailProps {
  word: Word;
  className?: string;
  nextWord?: Word;
  previousWord?: Word;
  relatedWords?: Word[];
  recommendedWords?: Word[];
}

const WordLinkGrid: React.FC<{ title: string; words: Word[] }> = ({ title, words }) => (
  <div className="flex flex-col gap-3">
    <h3 className="text-base font-extrabold">{title}</h3>
    <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {words.map((w) => (
        <li key={w.id} className="min-w-0">
          <Link
            to={getWordPath(w)}
            className="flex min-h-11 flex-col rounded-2xl border-2 border-border bg-card px-3 py-2 text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
          >
            <span className="font-arabic text-xl leading-relaxed" lang="ar" dir="rtl">
              {w.arabic}
            </span>
            <span className="truncate text-sm text-muted-foreground">{w.meaning}</span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const WordDetail: React.FC<WordDetailProps> = ({
  word,
  className,
  nextWord,
  previousWord,
  relatedWords = [],
  recommendedWords = [],
}) => {
  const usage = getQuranicUsage(word);
  const recited = getRecitedForm(word);
  const related = word.quranicForm;
  const rootSlug = getWordRootSlug(word.id);
  const rootFamily = rootSlug ? getRootBySlug(rootSlug) : undefined;
  const rootArabic = rootFamily?.arabic || word.root;
  const rootMembers = rootFamily ? rootFamily.words.filter((w) => w.id !== word.id).slice(0, ROOT_FAMILY_CARDS) : [];
  const surahPages = getWordSurahPages(word.id);
  const divineName = getNameForWord(word.id);
  // Highlight the word itself when it occurs verbatim, or the related form the Quran uses instead.
  const highlightTarget =
    usage.kind === 'verbatim' ? word.arabic : related?.status === 'related' && related.arabic ? related.arabic : null;
  const highlightIsVerb = usage.kind === 'verbatim' && word.partOfSpeech.toLowerCase() === 'verb';
  const firstExample = word.examples[0];
  const reviewHref = reviewWordsUrl([word.id]);
  const hasWordRecitation = getRecitationSources(word).length > 0;
  const hasPron = hasPronunciation(word);
  const collections = (word.collections ?? [])
    .map((id) => getCollectionById(id))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .map((c) => ({ id: c.id, name: c.name, count: getWordsByCollection(c.id).length }))
    .filter((c) => c.count > 0);

  const letters = letterCount(word.arabic);
  const headwordSize =
    letters > 9 || /\s/.test(word.arabic.trim())
      ? 'text-[52px] sm:text-[76px] lg:text-[88px]'
      : 'text-[72px] sm:text-[96px] lg:text-[112px]';

  return (
    <div className={cn('grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]', className)}>
      <div className="flex min-w-0 flex-col gap-6">
        {/* Headword */}
        <article className="card-tactile flex flex-col items-center gap-[18px] rounded-[32px] px-5 py-8 text-center sm:px-8 sm:py-10">
          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-secondary px-3 py-1.5 text-[13px] font-bold text-secondary-foreground">
              {LEVEL_LABEL[word.level] ?? capitalize(word.level)}
            </span>
            {usage.kind === 'verbatim' ? (
              <span className="rounded-full bg-gold/20 px-3 py-1.5 text-[13px] font-bold text-gold-text">
                {word.frequency}× in the Quran
              </span>
            ) : (
              <span className="rounded-full border border-border px-3 py-1.5 text-[13px] font-bold text-muted-foreground">
                {usage.short}
              </span>
            )}
          </div>

          <h1
            lang="ar"
            dir="rtl"
            className={cn('m-0 max-w-full font-quran font-normal leading-[1.85] [overflow-wrap:anywhere]', headwordSize)}
          >
            {word.arabic}
          </h1>

          <div className="flex flex-col gap-1">
            <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[34px]">{word.meaning}</h2>
            <p className="text-[17px] text-muted-foreground">
              {word.transliteration}
              {word.partOfSpeech && <> · {word.partOfSpeech}</>}
              {rootArabic && (
                <>
                  {' '}
                  · root{' '}
                  <bdi lang="ar" className="font-arabic text-xl text-foreground">
                    {rootArabic}
                  </bdi>
                </>
              )}
            </p>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 pt-1.5 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
            <WordAudioButton word={word} variant="gold">
              Hear the word
            </WordAudioButton>
            {hasPron && hasWordRecitation && (
              <WordAudioButton word={word} quran allowComputerVoice={false} variant="outline">
                Hear it in the Quran
              </WordAudioButton>
            )}
            {firstExample && (
              <WordAudioButton
                surah={firstExample.surah}
                ayah={firstExample.ayah}
                allowComputerVoice={false}
                icon="play"
                variant="outline"
              >
                Hear the verse
              </WordAudioButton>
            )}
            <Button asChild size="lg" className="font-extrabold [&_svg]:size-5">
              <Link to={reviewHref}>
                <Plus aria-hidden="true" />
                Add to my review
              </Link>
            </Button>
          </div>
          {recited && (
            <p className="text-[15px] text-muted-foreground">
              {recited.differs ? 'Recited in the Quran as ' : 'Recited as '}
              <bdi lang="ar" className="font-quran text-[22px] leading-none text-foreground">
                {recited.text}
              </bdi>{' '}
              ({recited.surah}:{recited.ayah})
            </p>
          )}
          {hasPron && <VoicePicker label="Pronunciation voice" />}
          {hasPron || hasWordRecitation ? (
            <AudioAttribution pronunciation={hasPron} recitation={hasWordRecitation} />
          ) : (
            <p className="text-[13px] text-gold-text">
              No audio of this word is available. Hear the word plays a computer voice (approximate), not a Quran recitation.
            </p>
          )}
        </article>

        {/* In the Quran */}
        <section className={cn(sectionCard, 'flex flex-col gap-4')} aria-labelledby="in-the-quran">
          <h2 id="in-the-quran" className="text-[22px] font-extrabold">
            In the Quran
          </h2>

          {usage.kind !== 'verbatim' && (
            <aside className="rounded-2xl bg-secondary p-4 text-[15px] text-secondary-foreground" aria-label="How this word relates to the Quran">
              <p>{usage.long}</p>
              {related?.arabic && related.location && (
                <p className="mt-2">
                  Related Quranic form:{' '}
                  <bdi className="font-arabic text-lg" lang="ar">
                    {related.arabic}
                  </bdi>{' '}
                  ({related.location.surah}:{related.location.ayah}
                  {related.occurrences ? `, ${related.occurrences}× in the Quran` : ''}). The word recitation on this page plays this form.
                </p>
              )}
            </aside>
          )}

          {word.examples.map((example, index) => {
            const parts = highlightTarget ? highlightWordInVerse(example.arabicText, highlightTarget, highlightIsVerb) : null;
            const surahName = getSurahName(example.surah);
            return (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-[20px] bg-background p-5 sm:p-6"
                itemScope
                itemType="https://schema.org/Quotation"
              >
                <p lang="ar" dir="rtl" className="font-quran text-[26px] leading-[2] sm:text-[34px]" itemProp="text">
                  {parts
                    ? parts.map((p, i) =>
                        p.highlight ? (
                          <mark key={i} className="rounded-lg bg-secondary px-1.5 text-secondary-foreground [box-decoration-break:clone]">
                            {p.text}
                          </mark>
                        ) : (
                          <React.Fragment key={i}>{p.text}</React.Fragment>
                        ),
                      )
                    : example.arabicText}
                </p>
                <p
                  className="text-[17px] leading-relaxed text-foreground/80 before:content-['\201C'] after:content-['\201D']"
                  itemProp="translationOfWork"
                >
                  {example.translation}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span itemProp="isPartOf">
                    {surahName ? `${surahName.name} ${example.surah}:${example.ayah}` : `Surah ${example.surah}, Ayah ${example.ayah}`}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <WordAudioButton
                      surah={example.surah}
                      ayah={example.ayah}
                      allowComputerVoice={false}
                      icon="play"
                      variant="outline"
                      size="default"
                    >
                      Play verse
                    </WordAudioButton>
                    {hasSurahPage(example.surah) && (
                      <Link
                        to={surahPath(example.surah)}
                        className="inline-flex min-h-11 items-center font-bold text-primary underline-offset-4 hover:underline"
                      >
                        Open surah word list <span aria-hidden="true">&nbsp;→</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {surahPages.length > 0 && (
            <nav aria-label="Surahs containing this word" className="flex flex-col gap-2">
              <h3 className="text-sm text-muted-foreground">
                {surahPages.length > SURAH_CHIPS
                  ? `Appears in ${surahPages.length} surahs, most often in`
                  : `Appears in ${surahPages.length === 1 ? '1 surah' : `${surahPages.length} surahs`}`}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {topSurahPages(surahPages).map(({ surah, count }) => (
                  <li key={surah.number}>
                    <Link
                      to={surahPath(surah.number)}
                      className="inline-flex min-h-9 items-center rounded-full border border-border px-3 text-[13px] font-semibold text-foreground hover:border-primary/40 hover:bg-muted"
                      title={`${count}× in Surah ${surah.name}`}
                    >
                      {surah.number}. {surah.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {word.examples.length > 0 && <AudioAttribution />}
        </section>

        {/* Root family */}
        {rootArabic && (
          <section className={cn(sectionCard, 'flex flex-col gap-4')} aria-labelledby="root-family">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="root-family" className="text-[22px] font-extrabold">
                Root family{' '}
                <span lang="ar" className="font-arabic text-[26px] font-normal text-primary">
                  {rootArabic}
                </span>
              </h2>
              {rootSlug && (
                <Link to={rootPath(rootSlug)} className="inline-flex min-h-11 items-center text-[15px] font-bold text-primary underline-offset-4 hover:underline">
                  See the whole root <span aria-hidden="true">&nbsp;→</span>
                </Link>
              )}
            </div>
            <p className="text-[15px] text-muted-foreground">
              Words built on the same root letters
              {rootFamily && rootFamily.total > 0 ? `. The Quran uses words from this root ${rootFamily.total} times.` : '.'}
            </p>
            {rootMembers.length > 0 && (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {rootMembers.map((w) => (
                  <li key={w.id} className="min-w-0">
                    <Link
                      to={getWordPath(w)}
                      className="flex h-full flex-col gap-1 rounded-[18px] border-2 border-b-4 border-border p-4 text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
                    >
                      <span lang="ar" dir="rtl" className="font-quran text-[30px] leading-[1.7] [overflow-wrap:anywhere]">
                        {w.arabic}
                      </span>
                      <span className="text-base font-extrabold">{w.meaning}</span>
                      <span className="text-[13px] text-muted-foreground">
                        {w.transliteration} · {w.partOfSpeech}
                        {w.frequency > 0 && ` · ${w.frequency}×`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Similar and recommended words */}
        {(relatedWords.length > 0 || recommendedWords.length > 0) && (
          <section className={cn(sectionCard, 'flex flex-col gap-6')} aria-label="More words to explore">
            {relatedWords.length > 0 && <WordLinkGrid title="Similar words" words={relatedWords.slice(0, 4)} />}
            {recommendedWords.length > 0 && <WordLinkGrid title="People also studied" words={recommendedWords.slice(0, 4)} />}
          </section>
        )}

        <WordNotesPanel wordId={word.id} className={sectionCard} />

        {/* Previous / next */}
        {(previousWord || nextWord) && (
          <nav aria-label="Next and previous words" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {previousWord ? (
              <Link
                to={getWordPath(previousWord.id)}
                className="flex items-center gap-3.5 rounded-[20px] border border-border bg-card px-5 py-4 text-foreground transition-colors hover:border-primary/40"
              >
                <ArrowLeft className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="flex min-w-0 flex-col">
                  <span className="text-[13px] text-muted-foreground">Previous</span>
                  <span className="text-base font-extrabold">
                    {previousWord.meaning}{' '}
                    <span lang="ar" className="font-arabic text-xl font-normal">
                      {previousWord.arabic}
                    </span>
                  </span>
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {nextWord && (
              <Link
                to={getWordPath(nextWord.id)}
                className="flex items-center justify-end gap-3.5 rounded-[20px] border border-border bg-card px-5 py-4 text-right text-foreground transition-colors hover:border-primary/40"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-[13px] text-muted-foreground">Next</span>
                  <span className="text-base font-extrabold">
                    {nextWord.meaning}{' '}
                    <span lang="ar" className="font-arabic text-xl font-normal">
                      {nextWord.arabic}
                    </span>
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            )}
          </nav>
        )}
      </div>

      {/* Aside */}
      <aside className="flex min-w-0 flex-col gap-5">
        <section className={cn(asideCard, 'flex flex-col gap-3.5')} aria-labelledby="at-a-glance">
          <h2 id="at-a-glance" className="text-lg font-extrabold">
            At a glance
          </h2>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-3.5 text-sm">
            <div>
              <dt className="text-muted-foreground">Part of speech</dt>
              <dd className="mt-0.5 font-extrabold">{capitalize(word.partOfSpeech)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{usage.kind === 'verbatim' ? 'Occurrences' : 'In the Quran'}</dt>
              <dd className="mt-0.5 font-extrabold">{usage.kind === 'verbatim' ? word.frequency : usage.short}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Root</dt>
              <dd lang="ar" className="mt-0.5 font-arabic text-xl">
                {rootSlug ? (
                  <Link to={rootPath(rootSlug)} className="text-foreground underline-offset-4 hover:text-primary hover:underline">
                    {rootArabic}
                  </Link>
                ) : (
                  rootArabic || '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Level</dt>
              <dd className="mt-0.5 font-extrabold">{LEVEL_LABEL[word.level] ?? capitalize(word.level)}</dd>
            </div>
          </dl>
          {word.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
              {word.tags.map((tag) => (
                <li key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground" itemProp="keywords">
                  {tag}
                </li>
              ))}
            </ul>
          )}
          {usage.kind === 'verbatim' && (
            <p className="border-t border-border pt-3 text-[13px] leading-normal text-muted-foreground">
              {word.frequencyVerified
                ? 'Occurrence count computed from the Quranic Arabic Corpus.'
                : 'Occurrence count is approximate and not yet checked against the Quranic Arabic Corpus.'}
            </p>
          )}
        </section>

        {collections.length > 0 && (
          <section className={cn(asideCard, 'flex flex-col gap-3')} aria-labelledby="in-collections">
            <h2 id="in-collections" className="text-lg font-extrabold">
              In these collections
            </h2>
            <ul className="flex flex-col gap-2">
              {collections.map((c, i) => (
                <li key={c.id}>
                  <Link
                    to={`/collections/${c.id}`}
                    className={cn(
                      'flex min-h-11 items-center justify-between gap-3 rounded-[14px] px-3.5 py-3 font-bold transition-colors',
                      i === 0
                        ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        : 'bg-background text-foreground hover:bg-muted',
                    )}
                  >
                    <span className="min-w-0">{c.name}</span>
                    <span className={cn('shrink-0 text-[13px]', i === 0 ? '' : 'font-semibold text-muted-foreground')}>
                      {c.count} {c.count === 1 ? 'word' : 'words'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {divineName && (
          <section className={cn(asideCard, 'flex flex-col gap-2')} aria-labelledby="divine-name">
            <h2 id="divine-name" className="text-lg font-extrabold">
              99 Names of Allah
            </h2>
            <Link to={namePath(divineName.slug)} className="inline-flex min-h-11 items-center font-bold text-primary underline-offset-4 hover:underline">
              {divineName.tr} is name {divineName.n} of the 99 Names of Allah →
            </Link>
          </section>
        )}

        {/* Dark ink in both themes */}
        <section className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#10231F] p-6 text-[#EEF3F0]" aria-labelledby="learn-for-good">
          <h2 id="learn-for-good" className="text-lg font-extrabold">
            Learn it for good
          </h2>
          <p className="text-sm leading-[1.55] text-[#A3B5AE]">
            Add this word to your review and it comes back just before you would forget it.
          </p>
          <Link
            to={reviewHref}
            className="inline-flex h-[52px] items-center justify-center rounded-2xl border-b-4 border-[#2A9580] bg-[#3CC4A6] text-base font-extrabold text-[#062019] transition-transform hover:bg-[#3CC4A6]/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3CC4A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10231F] active:translate-y-[2px] active:border-b-2"
          >
            Start a review
          </Link>
        </section>
      </aside>
    </div>
  );
};

export default WordDetail;
