import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import HearItButton from '@/components/word/HearItButton';
import PhraseVerseCard from '@/components/phrases/PhraseVerseCard';
import { Button } from '@/components/ui/button';
import { reviewWordsUrl } from '@/components/review/review-session';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { getWordById } from '@/utils/vocabulary';
import { getRootBySlug, getSurahName, rootPath, surahPath, wordPath } from '@/utils/quran-pages';
import { PHRASES, PHRASES_HUB_PATH, getPhrase, phrasePath, phraseRefs, phraseVerses, type Phrase } from '@/utils/phrases';
import { SITE_URL } from '@/utils/seo-templates';
import { faqLd, phraseSeo } from '@/utils/seo-pillars';

const STATUS_LABEL: Record<Phrase['quran']['status'], string> = {
  exact: 'In the Quran',
  related: 'Related wording in the Quran',
  none: 'Not in the Quran’s text',
};

/** Link to a root page, with its Arabic letters when the root has site words (they are in the bundle). */
const RootChip: React.FC<{ slug: string }> = ({ slug }) => {
  const ar = getRootBySlug(slug)?.arabic;
  return (
    <Link
      to={rootPath(slug)}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 bg-card px-3 text-sm font-bold hover:border-primary/40"
    >
      Root
      {ar && (
        <span className="font-arabic text-base font-normal" lang="ar" dir="rtl">
          {ar}
        </span>
      )}
      <span className="font-normal text-muted-foreground">{slug}</span>
    </Link>
  );
};

const faqFor = (p: Phrase, refCount: number): { q: string; a: string }[] => [
  {
    q: `What does ${p.name} mean?`,
    a: `${p.name} (${p.ar}, ${p.tr}) means “${p.meaning}”. Word for word: ${p.literal.replace(/ · /g, ', ')}.`,
  },
  {
    q: `Is ${p.name} in the Quran?`,
    a:
      p.quran.status === 'exact'
        ? `Yes. ${p.quran.text}${refCount > 1 ? ` The phrase occurs in ${refCount} ayahs.` : ''}`
        : p.quran.status === 'related'
          ? `Not word for word. ${p.quran.text}`
          : `No. ${p.quran.text}`,
  },
  ...(p.faq ?? []),
];

const PhraseDetail = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const phrase = getPhrase(slug);

  if (!phrase) {
    return (
      <>
        <SEO title="Phrase not found" noindex />
        <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
          <h1 className="mb-2 text-2xl font-extrabold">Phrase not found</h1>
          <p className="mb-6 text-muted-foreground">See the list of common Islamic phrases and their meanings.</p>
          <Button asChild>
            <Link to={PHRASES_HUB_PATH}>All phrases</Link>
          </Button>
        </div>
      </>
    );
  }

  const path = phrasePath(phrase.slug);
  const seo = phraseSeo(phrase);
  const verses = phraseVerses(phrase.slug);
  const refGroups = (phrase.refs ?? []).map((r) => ({ ...r, refs: phraseRefs(r.key) })).filter((r) => r.refs.length > 0);
  const phraseWord = phrase.wordId ? getWordById(phrase.wordId) : undefined;
  // Review: the phrase's own entry (if any), then each part that has a word page.
  const reviewIds = [...new Set([phrase.wordId, ...phrase.parts.map((p) => p.wordId)].filter((id): id is string => !!id && !!getWordById(id)))];
  const faq = faqFor(phrase, refGroups[0]?.refs.length ?? 0);
  const related = phrase.related.map(getPhrase).filter((p): p is Phrase => !!p);

  const term = {
    '@type': 'DefinedTerm',
    '@id': `${SITE_URL}${path}#term`,
    name: `${phrase.name} (${phrase.ar})`,
    alternateName: [phrase.ar, phrase.tr, ...phrase.variants],
    description: `${phrase.meaning}. Word for word: ${phrase.literal.replace(/ · /g, ', ')}.`,
    inLanguage: 'ar',
    url: `${SITE_URL}${path}`,
    inDefinedTermSet: { '@type': 'DefinedTermSet', '@id': `${SITE_URL}${PHRASES_HUB_PATH}#phrases`, name: 'Common Islamic phrases', url: `${SITE_URL}${PHRASES_HUB_PATH}` },
  };

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={path}
        keywords={[`${phrase.name} meaning`, `${phrase.name} in Arabic`, ...phrase.variants, phrase.ar, 'Islamic phrases']}
        breadcrumbs={[
          { name: 'Islamic phrases', path: PHRASES_HUB_PATH },
          { name: phrase.name, path },
        ]}
        jsonLd={[term, faqLd(path, faq)]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Islamic phrases', path: PHRASES_HUB_PATH }, { name: phrase.name, path }]} />

        <div className="card-tactile mb-8 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <header className="min-w-0 flex-1">
            <span
              className={cn(
                'inline-block rounded-full px-3 py-1.5 text-[13px] font-bold',
                phrase.quran.status === 'none' ? 'border bg-background' : 'bg-secondary text-secondary-foreground',
              )}
            >
              {STATUS_LABEL[phrase.quran.status]}
            </span>
            <p className="mt-4 font-quran text-5xl leading-[1.75] text-primary sm:text-6xl sm:leading-[1.75]" lang="ar" dir="rtl">
              {phrase.ar}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{phrase.name} Meaning</h1>
            <p className="mt-2 text-xl font-bold sm:text-2xl">“{phrase.meaning}”</p>
            <p className="mt-2 text-muted-foreground sm:text-[17px]">
              <span className="italic">{phrase.tr}</span> · also spelled {phrase.variants.join(', ')}
            </p>
          </header>

          <section aria-label="Listen and practise" className="flex w-full flex-col gap-3 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-sm">
            {phraseWord && <HearItButton word={phraseWord} size="lg" className="items-stretch [&>button]:w-full" />}
            {reviewIds.length > 0 && (
              <Button asChild size="lg" variant={phraseWord ? 'outline' : 'default'} className="h-auto min-h-14 w-full whitespace-normal py-3">
                <Link to={reviewWordsUrl(reviewIds)} onClick={() => track('cta_click', { cta: 'review_phrase_words', location: 'phrase_hero' })}>
                  <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                  Review the {reviewIds.length === 1 ? 'word' : `${reviewIds.length} words`} in {phrase.name}
                </Link>
              </Button>
            )}
            {phraseWord && (
              <Link to={wordPath(phraseWord.id)} className="inline-flex min-h-11 items-center justify-center gap-1 text-sm font-bold text-primary underline-offset-4 hover:underline">
                Word page: {phraseWord.transliteration}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </section>
        </div>

        <section aria-labelledby="breakdown-heading">
          <h2 id="breakdown-heading" className="mb-1 text-xl font-extrabold">
            {phrase.name}, word by word
          </h2>
          <p className="mb-4 text-muted-foreground">
            Literally: <span className="font-semibold text-foreground">{phrase.literal}</span>
          </p>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {phrase.parts.map((part, i) => {
              const word = part.wordId ? getWordById(part.wordId) : undefined;
              return (
                <li key={i} className="flex flex-col gap-3 rounded-[1.375rem] border-2 border-b-4 bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold leading-snug">{part.gloss}</p>
                      <p className="text-sm italic text-muted-foreground">{part.tr}</p>
                    </div>
                    <p className="shrink-0 font-quran text-[2rem] leading-[1.8]" lang="ar" dir="rtl">
                      {part.ar}
                    </p>
                  </div>
                  {part.note && <p className="text-sm leading-relaxed text-muted-foreground">{part.note}</p>}
                  {(word || part.root) && (
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      {word && (
                        <>
                          <HearItButton word={word} size="sm" iconOnly>
                            Hear {word.transliteration}
                          </HearItButton>
                          <Link
                            to={wordPath(word.id)}
                            className="inline-flex min-h-11 items-center gap-1 rounded-full border-2 bg-card px-3 text-sm font-bold hover:border-primary/40"
                          >
                            Word: {word.transliteration}
                          </Link>
                        </>
                      )}
                      {part.root && <RootChip slug={part.root} />}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {phrase.lines && phrase.lines.length > 0 && (
          <section aria-labelledby="lines-heading" className="mt-10">
            <h2 id="lines-heading" className="mb-3 text-xl font-extrabold">
              Longer forms and replies
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {phrase.lines.map(({ label, line }) => (
                <li key={label} className="rounded-[1.375rem] border bg-card p-5">
                  <p className="text-sm font-bold text-muted-foreground">{label}</p>
                  <p className="mt-2 font-quran text-[1.75rem] leading-[1.9]" lang="ar" dir="rtl">
                    {line.ar}
                  </p>
                  <p className="mt-1 text-sm italic text-muted-foreground">{line.tr}</p>
                  <p className="mt-1 font-semibold">{line.en}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="usage-heading" className="mt-10 max-w-3xl">
          <h2 id="usage-heading" className="mb-3 text-xl font-extrabold">
            When do Muslims say {phrase.name}?
          </h2>
          <div className="space-y-3 text-[17px] leading-relaxed">
            {phrase.usage.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <section aria-labelledby="quran-heading" className="mt-10">
          <h2 id="quran-heading" className="mb-3 text-xl font-extrabold">
            Is {phrase.name} in the Quran?
          </h2>
          <p className="mb-5 max-w-3xl text-[17px] leading-relaxed">{phrase.quran.text}</p>
          {verses.length > 0 && (
            <div className="grid gap-4">
              {verses.map((v) => (
                <PhraseVerseCard key={`${v.s}:${v.a}`} verse={v} />
              ))}
            </div>
          )}
          {refGroups.map((g) => (
            <div key={g.key} className="mt-6">
              <h3 className="mb-2 font-extrabold">
                {g.label} <span className="font-normal text-muted-foreground">({g.refs.length} {g.refs.length === 1 ? 'ayah' : 'ayahs'})</span>
              </h3>
              <ul className="flex flex-wrap gap-2">
                {g.refs.map(([s, a]) => (
                  <li key={`${s}:${a}`}>
                    <Link
                      to={surahPath(s)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 bg-card px-3 text-sm font-bold hover:border-primary/40"
                    >
                      {s}:{a}
                      <span className="font-normal text-muted-foreground">{getSurahName(s)?.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section aria-labelledby="faq-heading" className="mt-10 max-w-3xl">
          <h2 id="faq-heading" className="mb-3 text-xl font-extrabold">
            Questions about {phrase.name}
          </h2>
          <dl className="divide-y rounded-[1.375rem] border bg-card">
            {faq.map((f) => (
              <div key={f.q} className="p-5">
                <dt className="font-extrabold">{f.q}</dt>
                <dd className="mt-1 leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <nav aria-labelledby="related-heading" className="mt-10">
          <h2 id="related-heading" className="mb-3 text-xl font-extrabold">
            Related phrases
          </h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  to={phrasePath(r.slug)}
                  className="flex h-full items-center justify-between gap-3 rounded-[1.25rem] border-2 border-b-4 bg-card px-4 py-3 transition-colors hover:border-primary/40"
                >
                  <span className="min-w-0">
                    <span className="block font-extrabold">{r.name}</span>
                    <span className="block text-sm text-muted-foreground">{r.meaning}</span>
                  </span>
                  <span className="shrink-0 font-quran text-xl leading-[1.9]" lang="ar" dir="rtl">
                    {r.ar}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to={PHRASES_HUB_PATH} className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-primary underline-offset-4 hover:underline">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            All {PHRASES.length} Islamic phrases
          </Link>
        </nav>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Verses: Tanzil Uthmani text with the Saheeh International translation, checked word by word against the Quranic
          Arabic Corpus. Recitation: Mishary Alafasy (Quran.com). Occurrence lists count every ayah that contains the
          phrase’s words in that order.
        </p>
      </div>
    </>
  );
};

export default PhraseDetail;
