import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Repeat } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import AudioPlayer from '@/components/AudioPlayer';
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

/** The verse with the word at position `w` highlighted. */
const VerseText: React.FC<{ v: NameVerse }> = ({ v }) => {
  const words = v.ar.split(' ');
  return (
    <p className="font-arabic text-2xl leading-[2.2] sm:text-3xl" lang="ar" dir="rtl">
      {words.map((t, i) => (
        <React.Fragment key={i}>
          {i > 0 && ' '}
          {i === v.w - 1 ? <mark className="rounded bg-primary/15 px-1 text-primary">{t}</mark> : t}
        </React.Fragment>
      ))}{' '}
      <span className="text-lg text-muted-foreground">﴿{v.a.toLocaleString('ar-EG')}﴾</span>
    </p>
  );
};

const VerseCard: React.FC<{ v: NameVerse; name: DivineName }> = ({ v, name }) => (
  <li className="rounded-xl border p-4 sm:p-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-semibold">
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
        className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        Read on Quran.com <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
    </div>
    <VerseText v={v} />
    <p className="mt-3 text-sm sm:text-base">“{v.en}”</p>
    {v.kind === 'related' && (
      <p className="mt-2 text-xs text-muted-foreground">
        The highlighted word comes from the same root as {name.tr}; it is not the name itself.
      </p>
    )}
    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
      <AudioPlayer src={verseWordAudioUrl(v)} label="Word" allowComputerVoice={false} showAttribution={false} />
      <AudioPlayer surah={v.s} ayah={v.a} label="Whole verse" allowComputerVoice={false} />
    </div>
  </li>
);

const NameNotFound = () => (
  <>
    <SEO title="Name not found" noindex />
    <div className="py-16 text-center">
      <h1 className="mb-2 text-xl font-semibold">Name not found</h1>
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

  const title = `${name.tr} (${arPlain}) meaning: ${name.en} | 99 Names of Allah`;
  const description = `${name.tr} (${arPlain}) means "${name.en}". ${name.meaning} ${statusText(name)} Name ${name.n} of the 99 Names of Allah, with Quran verses and recitation.`;

  const term = {
    '@type': 'DefinedTerm',
    '@id': `${SITE_URL}${path}#term`,
    name: `${name.tr} (${name.ar})`,
    alternateName: [arPlain, name.en],
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
        keywords={[`${name.tr} meaning`, `${arPlain}`, `${name.tr} in the Quran`, '99 names of Allah', 'Asma ul Husna']}
        breadcrumbs={[
          { name: '99 Names of Allah', path: NAMES_HUB_PATH },
          { name: name.tr, path },
        ]}
        jsonLd={[term]}
      />

      <div className="container mx-auto max-w-3xl py-6">
        <PageTrail items={[{ name: '99 Names of Allah', path: NAMES_HUB_PATH }, { name: name.tr, path }]} />

        <header className="mb-8 text-center">
          <p className="text-sm text-muted-foreground">Name {name.n} of 99</p>
          <p className="my-3 font-arabic text-6xl leading-[1.6] text-primary sm:text-7xl" lang="ar" dir="rtl">
            {name.ar}
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {name.tr} <span className="text-muted-foreground">·</span> {name.en}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg">{name.meaning}</p>
          {audioVerse && (
            <div className="mt-5 flex justify-center">
              <AudioPlayer
                src={verseWordAudioUrl(audioVerse)}
                label={`Listen (from ${ref(audioVerse)})`}
                allowComputerVoice={false}
              />
            </div>
          )}
        </header>

        <dl className="mb-8 grid gap-4 rounded-xl border p-4 sm:grid-cols-2 sm:p-5">
          <div>
            <dt className="text-sm text-muted-foreground">Root</dt>
            <dd className="mt-1">
              <span className="font-arabic text-2xl" lang="ar" dir="rtl">{name.root.ar}</span>
              {rootLink && (
                <Link to={rootPath(name.root.slug)} className="ml-3 text-sm text-primary underline-offset-4 hover:underline">
                  Root family
                </Link>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Quran</dt>
            <dd className="mt-1">
              <Badge variant={name.status === 'quran' ? 'default' : 'outline'}>{STATUS_LABEL[name.status]}</Badge>
              {name.status === 'quran' && name.count !== null && name.lemma && (
                <p className="mt-2 text-sm text-muted-foreground">
                  The word <span className="font-arabic text-base text-foreground" lang="ar" dir="rtl">{name.lemma}</span>{' '}
                  occurs {name.count.toLocaleString('en-US')} {name.count === 1 ? 'time' : 'times'} in the Quran (all uses).
                </p>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 text-sm">
            <p>{statusText(name)}</p>
            {name.note && <p className="mt-1 text-muted-foreground">{name.note}</p>}
          </div>
        </dl>

        <div className="mb-8 flex flex-wrap gap-3">
            {word && (
              <Button asChild>
                <Link to={reviewHref([word.id])}>
                  <Repeat className="mr-2 h-4 w-4" aria-hidden="true" />
                  Review this name
                </Link>
              </Button>
            )}
            {word && (
              <Button asChild variant="outline">
                <Link to={wordPath(word.id)}>
                  <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                  Study this word
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link to={NAMES_HUB_PATH}>All 99 names</Link>
            </Button>
        </div>

        <section aria-labelledby="verses-heading" className="mb-10">
          <h2 id="verses-heading" className="mb-3 text-xl font-semibold">
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
          <p className="mt-4 text-xs text-muted-foreground">
            Verse text: Tanzil (Uthmani). Translation: Saheeh International. Word positions and roots: Quranic Arabic
            Corpus. Recitation: Quran.com word by word and EveryAyah (Mishary Alafasy).
          </p>
        </section>

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mb-10">
            <h2 id="related-heading" className="mb-3 text-xl font-semibold">Names from the same root</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link to={namePath(r.slug)} className="flex items-center justify-between gap-3 rounded-xl border p-4 hover:border-primary/40 hover:bg-muted/40">
                    <span>
                      <span className="block font-medium">{r.n}. {r.tr}</span>
                      <span className="block text-sm text-muted-foreground">{r.en}</span>
                    </span>
                    <span className="font-arabic text-2xl" lang="ar" dir="rtl">{r.ar}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="Previous and next name" className="grid grid-cols-2 gap-3 border-t pt-6">
          {prev ? (
            <Link to={namePath(prev.slug)} className="rounded-xl border p-3 hover:bg-muted/40">
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeft className="h-3 w-3" aria-hidden="true" /> {prev.n}</span>
              <span className="block font-medium">{prev.tr}</span>
              <span className="block font-arabic text-lg" lang="ar" dir="rtl">{prev.ar}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={namePath(next.slug)} className="rounded-xl border p-3 text-right hover:bg-muted/40">
              <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">{next.n} <ArrowRight className="h-3 w-3" aria-hidden="true" /></span>
              <span className="block font-medium">{next.tr}</span>
              <span className="block font-arabic text-lg" lang="ar" dir="rtl">{next.ar}</span>
            </Link>
          ) : <span />}
        </nav>
      </div>
    </>
  );
};

export default NameOfAllah;
