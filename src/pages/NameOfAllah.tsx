import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { track } from '@/lib/analytics';
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Repeat } from 'lucide-react';
import { nameSeo } from '@/utils/seo-templates';
import SEO from '@/components/SEO';
import { ogImage } from '@/utils/og-image';
import PageTrail from '@/components/quran/PageTrail';
import HearItButton from '@/components/word/HearItButton';
import { PlayVerseButton } from '@/components/word/PlayVerseButton';
import AudioAttribution from '@/components/audio/AudioAttribution';
import { useVerseFollowAlong } from '@/components/quran/useVerseFollowAlong';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { rootPath, wordPath } from '@/utils/quran-pages';
import {
  NAMES_HUB_PATH,
  STATUS_LABEL,
  getAdjacentNames,
  getNameAudioVerse,
  getNameBySlug,
  getNameWord,
  getRelatedNames,
  hasRootPage,
  nameSpellings,
  namePath,
  reviewHref,
  verseWordAudioUrl,
  type DivineName,
  type NameVerse,
} from '@/utils/names-of-allah';

const SITE_URL = 'https://quranvocab.com';

/** Arabic without vowel marks (for titles and descriptions). */
const plain = (s: string) => s.replace(/[ً-ْٰ]/g, '');

const ref = (v: NameVerse) => `${v.s}:${v.a}`;

const statusText = (name: DivineName): string => {
  const first = name.verses[0];
  if (name.status === 'quran') return `This name is used of Allah in the Quran${first ? `, for example in ${ref(first)}` : ''}.`;
  if (name.status === 'quran-verb-only')
    return `The name itself is not used of Allah in the Quran, but a word from the same root describes Him${first ? ` (${ref(first)})` : ''}.`;
  return 'This name comes from the hadith list of 99 names; the Quran does not use a word from its root to describe Allah.';
};

/** The verse with the word at position `w` highlighted; `active` is the word being recited. */
const VerseText: React.FC<{ v: NameVerse; words: string[]; active: number; playing: boolean }> = ({ v, words, active, playing }) => (
  <p className="font-quran text-[1.75rem] leading-[1.9] sm:text-[2.125rem]" lang="ar" dir="rtl">
    {words.map((t, i) => (
      <React.Fragment key={i}>
        {i > 0 && ' '}
        <span
          className={cn(
            'rounded-lg [box-decoration-break:clone] motion-safe:transition-[color,text-shadow] motion-safe:duration-200',
            i === v.w - 1 && !playing && 'bg-secondary px-1.5 text-secondary-foreground',
            i === active && 'reciting',
          )}
          data-reciting={i === active ? 'true' : undefined}
        >
          {t}
        </span>
      </React.Fragment>
    ))}{' '}
    <span className="font-arabic text-xl text-muted-foreground">﴿{v.a.toLocaleString('ar-EG')}﴾</span>
  </p>
);

const VerseCard: React.FC<{ v: NameVerse; name: DivineName }> = ({ v, name }) => {
  const words = useMemo(() => v.ar.split(' '), [v.ar]);
  // The whole verse is shown: displayed word i is verse word position i + 1.
  const positions = useMemo(() => words.map((_, i) => i + 1), [words]);
  const { state, active, toggle } = useVerseFollowAlong(v.s, v.a, positions);
  const playing = state === 'playing';
  return (
    <li className="rounded-3xl bg-background p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-extrabold">
          Quran {ref(v)}
          {v.kind === 'related' && (
            <Badge variant="outline" className="ml-2 align-middle font-normal">
              Related word: <span className="ml-1 font-arabic text-base" lang="ar" dir="rtl">{v.word}</span>
            </Badge>
          )}
        </h3>
        <a
          href={`https://quran.com/${v.s}/${v.a}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary underline-offset-4 hover:underline"
        >
          Read on Quran.com <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
      <VerseText v={v} words={words} active={active} playing={playing} />
      <p className="mt-3 text-base leading-relaxed text-foreground/85 sm:text-[17px]">“{v.en}”</p>
      {v.kind === 'related' && (
        <p className="mt-2 text-xs text-muted-foreground">
          The highlighted word comes from the same root as {name.tr}; it is not the name itself.
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <HearItButton src={verseWordAudioUrl(v)} size="sm" allowComputerVoice={false}>
          Hear the word
        </HearItButton>
        <PlayVerseButton surah={v.s} ayah={v.a} state={state} onClick={toggle} followAlong />
        {state === 'error' && <span className="text-xs text-gold-text">Audio could not play. Tap again.</span>}
      </div>
      <AudioAttribution className="mt-2" />
    </li>
  );
};

const NameNotFound = () => (
  <>
    <SEO title="Name not found" noindex />
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <h1 className="mb-2 text-2xl font-extrabold">Name not found</h1>
      <p className="mb-6 text-muted-foreground">We could not find that name.</p>
      <Button asChild>
        <Link to={NAMES_HUB_PATH}>See all 99 names</Link>
      </Button>
    </div>
  </>
);

const NameOfAllah = () => {
  const { slug } = useParams<{ slug: string }>();
  const name = useMemo(() => (slug ? getNameBySlug(slug) : undefined), [slug]);
  if (!name) return <NameNotFound />;

  const word = getNameWord(name);
  const related = getRelatedNames(name);
  const { prev, next } = getAdjacentNames(name);
  const audioVerse = getNameAudioVerse(name);
  const rootLink = hasRootPage(name.root.slug);
  const arPlain = plain(name.ar);
  const path = namePath(name.slug);
  const spellings = nameSpellings(name.tr);

  const { title, description } = nameSeo({
    n: name.n,
    tr: name.tr,
    ar: arPlain,
    en: name.en,
    meaning: name.meaning,
    statusText: statusText(name),
    ya: spellings.ya,
  });

  const term = {
    '@type': 'DefinedTerm',
    '@id': `${SITE_URL}${path}#term`,
    name: `${name.tr} (${name.ar})`,
    alternateName: [arPlain, name.en, ...spellings.variants],
    description: `${name.en}. ${name.meaning}`,
    termCode: String(name.n),
    inLanguage: 'ar',
    url: `${SITE_URL}${path}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      '@id': `${SITE_URL}${NAMES_HUB_PATH}#names`,
      name: "The 99 Names of Allah (al-Asma' al-Husna)",
      url: `${SITE_URL}${NAMES_HUB_PATH}`,
    },
  };

  return (
    <>
      <SEO
        title={title}
        description={description}
        url={path}
        image={ogImage('names', name.slug)}
        imageAlt={`${name.ar} (${name.tr}): ${name.en}`}
        keywords={[`${name.tr} meaning`, `${arPlain}`, spellings.ya, `${name.tr} in the Quran`, '99 names of Allah', 'Asmaul Husna']}
        breadcrumbs={[
          { name: '99 Names of Allah', path: NAMES_HUB_PATH },
          { name: name.tr, path },
        ]}
        jsonLd={[term]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: '99 Names of Allah', path: NAMES_HUB_PATH }, { name: name.tr, path }]} />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 lg:flex-[999_1_560px]">
        <header className="card-tactile mb-6 flex flex-col items-center rounded-[2rem] px-5 py-8 text-center sm:px-9 sm:py-10">
          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-secondary px-3 py-1.5 text-[13px] font-bold text-secondary-foreground">Name {name.n} of 99</span>
            <span className="rounded-full bg-gold/25 px-3 py-1.5 text-[13px] font-bold text-gold-text">{STATUS_LABEL[name.status]}</span>
          </div>
          {/* One H1, "<Name> (<Arabic>) Meaning: <English>": the Arabic is shown first and large (order-first);
              the brackets are for screen readers and the page outline only. */}
          <h1 className="flex flex-col items-center font-extrabold tracking-tight">
            <span className="text-3xl sm:text-4xl">{name.tr}</span>
            <span className="sr-only"> (</span>
            <span className="order-first my-2 font-quran text-6xl font-normal leading-[1.7] text-primary sm:text-8xl sm:leading-[1.6]" lang="ar" dir="rtl">
              {name.ar}
            </span>
            <span className="sr-only">) </span>
            <span className="mt-1 text-xl sm:text-2xl">
              <span className="text-muted-foreground">Meaning:</span> {name.en}
            </span>
          </h1>
          {spellings.variants.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">Also written as: {spellings.variants.join(', ')}</p>
          )}
          <p className="mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-muted-foreground">{name.meaning}</p>
          {audioVerse && (
            <div className="mt-5 flex justify-center">
              <HearItButton
                src={verseWordAudioUrl(audioVerse)}
                allowComputerVoice={false}
                caption={`Recited in ${ref(audioVerse)}`}
                attribution
              />
            </div>
          )}
        </header>

        <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            {word && (
              <Button asChild size="lg">
                <Link to={reviewHref([word.id])} onClick={() => track('cta_click', { cta: 'review_name', location: 'name_actions' })}>
                  <Repeat className="h-5 w-5" aria-hidden="true" />
                  Review this name
                </Link>
              </Button>
            )}
            {word && (
              <Button asChild size="lg" variant="outline">
                <Link to={wordPath(word.id)}>
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                  Study this word
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant="ghost">
              <Link to={NAMES_HUB_PATH}>All 99 names</Link>
            </Button>
        </div>
        </div>

        <aside className="mb-8 flex min-w-0 flex-col gap-5 lg:sticky lg:top-24 lg:flex-[1_1_300px]">
        <section aria-labelledby="glance-heading" className="rounded-3xl border bg-card p-6">
        <h2 id="glance-heading" className="mb-4 text-lg font-extrabold">At a glance</h2>
        <dl className="grid gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Root</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-x-3">
              <span className="font-arabic text-2xl" lang="ar" dir="rtl">{name.root.ar}</span>
              {rootLink && (
                <Link to={rootPath(name.root.slug)} className="inline-flex min-h-11 items-center text-sm font-bold text-primary underline-offset-4 hover:underline">
                  Root family
                </Link>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Quran</dt>
            <dd className="mt-1">
              <span className="font-extrabold">{STATUS_LABEL[name.status]}</span>
              {name.status === 'quran' && name.count !== null && name.lemma && (
                <p className="mt-2 text-sm text-muted-foreground">
                  The word <span className="font-arabic text-base text-foreground" lang="ar" dir="rtl">{name.lemma}</span>{' '}
                  occurs {name.count.toLocaleString('en-US')} {name.count === 1 ? 'time' : 'times'} in the Quran (all uses).
                </p>
              )}
            </dd>
          </div>
          <div className="text-sm leading-relaxed">
            <p>{statusText(name)}</p>
            {name.note && <p className="mt-1 text-muted-foreground">{name.note}</p>}
          </div>
        </dl>
        </section>
        </aside>
        </div>

        <section aria-labelledby="verses-heading" className="mb-10 rounded-[1.75rem] border bg-card p-5 sm:p-7">
          <h2 id="verses-heading" className="mb-4 text-[22px] font-extrabold">
            {name.status === 'quran' ? `${name.tr} in the Quran` : 'Related words in the Quran'}
          </h2>
          {name.verses.length > 0 ? (
            <ul className="space-y-4">
              {name.verses.map((v) => (
                <VerseCard key={`${v.s}:${v.a}:${v.w}`} v={v} name={name} />
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              No word from the root <span className="font-arabic" lang="ar" dir="rtl">{name.root.ar}</span> is used to
              describe Allah in the Quran. This name is known from the hadith list.
            </p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Verse text: Tanzil (Uthmani). Translation: Saheeh International. Word positions and roots: Quranic Arabic
            Corpus. Recitation: Quran.com word by word and EveryAyah (Mishary Alafasy).
          </p>
        </section>

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mb-10">
            <h2 id="related-heading" className="mb-4 text-[22px] font-extrabold">Names from the same root</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link to={namePath(r.slug)} className="flex h-full items-center justify-between gap-3 rounded-[1.375rem] border-2 border-b-4 bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <span>
                      <span className="block font-extrabold">{r.n}. {r.tr}</span>
                      <span className="block text-sm text-muted-foreground">{r.en}</span>
                    </span>
                    <span className="font-quran text-3xl leading-[1.8]" lang="ar" dir="rtl">{r.ar}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="Previous and next name" className="grid grid-cols-2 gap-3">
          {prev ? (
            <Link to={namePath(prev.slug)} className="rounded-[1.25rem] border bg-card px-4 py-3.5 transition-colors hover:border-primary/40 sm:px-5">
              <span className="flex items-center gap-1 text-[13px] text-muted-foreground"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> {prev.n}</span>
              <span className="block font-extrabold">{prev.tr}</span>
              <span className="block font-arabic text-lg" lang="ar" dir="rtl">{prev.ar}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={namePath(next.slug)} className="rounded-[1.25rem] border bg-card px-4 py-3.5 text-right transition-colors hover:border-primary/40 sm:px-5">
              <span className="flex items-center justify-end gap-1 text-[13px] text-muted-foreground">{next.n} <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              <span className="block font-extrabold">{next.tr}</span>
              <span className="block font-arabic text-lg" lang="ar" dir="rtl">{next.ar}</span>
            </Link>
          ) : <span />}
        </nav>
      </div>
    </>
  );
};

export default NameOfAllah;
