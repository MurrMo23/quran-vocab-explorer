import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { track } from '@/lib/analytics';
import { ArrowRight, Loader2, Pause, Play, Repeat } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { Button } from '@/components/ui/button';
import { useVerseFollowAlong } from '@/components/quran/useVerseFollowAlong';
import { cn } from '@/lib/utils';
import { EmbedStaticData, useStaticData } from '@/lib/static-data';
import { getRootBySlug, getSurahName, hasSurahPage, rootPath, surahPath, wordPath } from '@/utils/quran-pages';
import { reviewWordsUrl } from '@/components/review/review-session';
import {
  FORM_GROUPS,
  ROOT_LETTER_NAMES,
  formLabel,
  rootDataPath,
  rootLetterKey,
  rootLetterPath,
  type RootDoc,
  type RootForm,
} from '@/utils/root-library';
import { SITE_URL, rootSeo } from '@/utils/seo-templates';

const SURAHS_SHOWN = 10;
const capitalize = (t: string) => (t ? t[0].toUpperCase() + t.slice(1) : t);

/** The example verse with the form's word highlighted. */
const ExampleVerse: React.FC<{ form: RootForm }> = ({ form }) => {
  const { ex } = form;
  const surah = getSurahName(ex.s);
  // Root examples show the whole verse: displayed word i is verse word position i + 1.
  const positions = useMemo(() => ex.ar.map((_, i) => i + 1), [ex.ar]);
  const { state, active, toggle } = useVerseFollowAlong(ex.s, ex.a, positions);
  const playing = state === 'playing';
  const label = surah ? `${surah.name} ${ex.s}:${ex.a}` : `${ex.s}:${ex.a}`;
  return (
    <figure className="mt-3 rounded-2xl bg-background p-4" itemScope itemType="https://schema.org/Quotation">
      <p lang="ar" dir="rtl" className="font-quran text-[22px] leading-[2.1] sm:text-[26px]" itemProp="text">
        {ex.ar.map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 && ' '}
            <span
              className={cn(
                'rounded-lg [box-decoration-break:clone] motion-safe:transition-[color,text-shadow] motion-safe:duration-200',
                i === ex.p - 1 && !playing && 'bg-secondary px-1 text-secondary-foreground',
                i === active && 'reciting',
              )}
              data-reciting={i === active ? 'true' : undefined}
            >
              {w}
            </span>
          </React.Fragment>
        ))}
      </p>
      <figcaption className="mt-2 text-[15px] leading-relaxed text-foreground/80">
        <span className="before:content-['\201C'] after:content-['\201D']">{ex.en}</span>
      </figcaption>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        {hasSurahPage(ex.s) ? (
          <Link to={surahPath(ex.s)} className="font-semibold hover:text-primary hover:underline">
            {label}
          </Link>
        ) : (
          <span>{label}</span>
        )}
        <div className="flex items-center gap-2">
          {state === 'error' && <span className="text-xs text-gold-text">Audio could not play. Tap again.</span>}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggle}
            aria-pressed={playing}
            aria-label={playing ? `Stop verse ${ex.s}:${ex.a}` : `Play verse ${ex.s}:${ex.a} and follow each word`}
            title="Mishary Alafasy (Quran.com)"
            className="h-10 text-sm font-extrabold [&_svg]:size-4"
          >
            {state === 'loading' ? <Loader2 className="motion-safe:animate-spin" aria-hidden /> : playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            {playing ? 'Stop' : 'Play verse'}
          </Button>
        </div>
      </div>
    </figure>
  );
};

const FormCard: React.FC<{ form: RootForm }> = ({ form }) => (
  <li className="rounded-[1.375rem] border-2 border-b-4 bg-card p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <p className="text-[17px] font-extrabold leading-snug">{form.gloss}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {formLabel(form)} · {form.count.toLocaleString('en-US')}× in the Quran
        </p>
        {form.word && (
          <Link to={wordPath(form.word)} className="mt-1 inline-flex min-h-9 items-center gap-1 text-sm font-extrabold text-primary hover:underline">
            Learn this word <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
      <p lang="ar" dir="rtl" className="font-quran text-[34px] leading-[1.7]">
        {form.ar}
      </p>
    </div>
    <ExampleVerse form={form} />
  </li>
);

const RootDetails = () => {
  const { root: slug = '' } = useParams<{ root: string }>();
  const path = slug ? rootDataPath(slug) : null;
  const { data: root, error } = useStaticData<RootDoc>(path);
  const siteFamily = useMemo(() => getRootBySlug(slug), [slug]);

  if (error) {
    return (
      <>
        <SEO title="Root not found" noindex />
        <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
          <h1 className="mb-2 text-2xl font-extrabold">Root not found</h1>
          <p className="mb-6 text-muted-foreground">There is no Quranic root “{slug}”.</p>
          <Button asChild>
            <Link to="/roots">Browse all roots</Link>
          </Button>
        </div>
      </>
    );
  }

  if (!root) {
    return (
      <p className="flex items-center justify-center gap-2 py-24 text-sm font-semibold text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden /> Loading root…
      </p>
    );
  }

  const n = root.forms.length;
  const siteWords = siteFamily?.words ?? [];
  const groups = FORM_GROUPS.map((g) => ({ ...g, forms: root.forms.filter((f) => g.kinds.includes(f.kind)) })).filter((g) => g.forms.length);
  const { title, description } = rootSeo({
    ar: root.ar,
    slug: root.slug,
    core: root.core,
    total: root.total,
    forms: n,
    topForms: root.forms.slice(0, 3).map((f) => f.gloss),
  });
  // Breadcrumb level: the hub of roots with the same first letter (every root is linked from it).
  const letterKey = rootLetterKey(root.slug);
  const firstLetter = root.ar.split(' ')[0];
  const letterHub = {
    name: `${firstLetter} (${ROOT_LETTER_NAMES[letterKey] ?? letterKey})`,
    path: rootLetterPath(letterKey),
  };
  const maxSurah = root.surahs[0]?.[1] ?? 1;

  return (
    <>
      <SEO
        title={title}
        description={description}
        url={rootPath(root.slug)}
        keywords={[`root ${root.slug}`, `${root.ar} root`, `${root.ar.replace(/ /g, '')} meaning`, 'Arabic root words', 'Quranic Arabic roots']}
        breadcrumbs={[
          { name: 'Roots', path: '/roots' },
          ...(letterHub.path === '/roots' ? [] : [letterHub]),
          { name: `Root ${root.ar}`, path: rootPath(root.slug) },
        ]}
        jsonLd={[
          {
            '@type': 'DefinedTerm',
            '@id': `${SITE_URL}${rootPath(root.slug)}#term`,
            name: `${root.ar} (${root.slug})`,
            description: `Arabic root meaning ${root.core}. ${root.total} words in the Quran, ${n} ${n === 1 ? 'form' : 'forms'}.`,
            termCode: root.slug,
            inLanguage: 'ar',
            url: `${SITE_URL}${rootPath(root.slug)}`,
            inDefinedTermSet: {
              '@type': 'DefinedTermSet',
              '@id': `${SITE_URL}/roots#termset`,
              name: 'Arabic roots of the Quran',
              url: `${SITE_URL}/roots`,
            },
          },
        ]}
      />
      <EmbedStaticData path={rootDataPath(root.slug)} data={root} />

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail
          items={[
            { name: 'Roots', path: '/roots' },
            ...(letterHub.path === '/roots'
              ? []
              : [{ name: <span className="font-arabic" lang="ar" dir="rtl">{firstLetter}</span>, path: letterHub.path }]),
            { name: <span className="font-arabic" lang="ar" dir="rtl">{root.ar}</span>, path: rootPath(root.slug) },
          ]}
        />

        <header className="card-tactile mb-8 flex flex-col items-center gap-3 rounded-[2rem] px-6 py-8 text-center sm:px-9 sm:py-10">
          <span className="rounded-full bg-secondary px-3 py-1.5 text-[13px] font-bold text-secondary-foreground">Arabic root</span>
          <p className="pb-3 font-quran text-6xl leading-[2] text-primary sm:text-7xl" lang="ar" dir="rtl">
            {root.ar}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
            {capitalize(root.core)}
            <span className="mt-1 block text-base font-bold text-muted-foreground sm:text-lg">Root {root.slug}</span>
          </h1>
          <dl className="mt-2 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">In the Quran</dt>
              <dd className="text-xl font-extrabold">{root.total.toLocaleString('en-US')}×</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Word forms</dt>
              <dd className="text-xl font-extrabold">{n}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Surahs</dt>
              <dd className="text-xl font-extrabold">{root.surahs.length} of 114</dd>
            </div>
          </dl>
          {siteWords.length > 0 && (
            <Button asChild size="lg" className="mt-3">
              <Link to={reviewWordsUrl(siteWords.map((w) => w.id))} onClick={() => track('cta_click', { cta: 'learn_root_words', location: 'root_hero' })}>
                <Repeat aria-hidden />
                Learn {siteWords.length === 1 ? 'its word' : `its ${siteWords.length} words`}
              </Link>
            </Button>
          )}
        </header>

        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`forms-${g.id}`} className="mb-10">
            <h2 id={`forms-${g.id}`} className="mb-4 text-xl font-extrabold">
              {g.title} <span className="text-muted-foreground">({g.forms.length})</span>
            </h2>
            <ul className="grid gap-4">
              {g.forms.map((f) => (
                <FormCard key={`${f.ar}-${f.kind}-${f.form}`} form={f} />
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="where" className="mb-10 rounded-[1.75rem] border-2 bg-card p-5 sm:p-7">
          <h2 id="where" className="text-xl font-extrabold">Where it appears</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Words from this root occur in {root.surahs.length} of the 114 surahs
            {root.surahs.length > SURAHS_SHOWN ? `, most often in:` : '.'}
          </p>
          <ol className="mt-4 grid gap-2">
            {root.surahs.slice(0, SURAHS_SHOWN).map(([s, count]) => {
              const name = getSurahName(s);
              const label = name ? `${s}. ${name.name}` : `Surah ${s}`;
              return (
                <li key={s} className="grid grid-cols-[minmax(7rem,12rem)_1fr_auto] items-center gap-3 text-sm">
                  {hasSurahPage(s) ? (
                    <Link to={surahPath(s)} className="truncate font-semibold hover:text-primary hover:underline">
                      {label}
                    </Link>
                  ) : (
                    <span className="truncate font-semibold">{label}</span>
                  )}
                  <span className="h-3 overflow-hidden rounded-full bg-track" aria-hidden>
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(4, (count / maxSurah) * 100)}%` }} />
                  </span>
                  <span className="w-12 text-right font-bold tabular-nums">{count}×</span>
                </li>
              );
            })}
          </ol>
        </section>

        {siteWords.some((w) => !root.forms.some((f) => f.word === w.id)) && (
          <section aria-labelledby="related" className="mb-10">
            <h2 id="related" className="mb-3 text-xl font-extrabold">More words from this root on QuranVocab</h2>
            <ul className="flex flex-wrap gap-2">
              {siteWords
                .filter((w) => !root.forms.some((f) => f.word === w.id))
                .map((w) => (
                  <li key={w.id}>
                    <Link
                      to={wordPath(w.id)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 bg-card px-4 text-sm font-bold hover:border-primary/40"
                    >
                      <span className="font-arabic text-lg font-normal" lang="ar" dir="rtl">
                        {w.arabic}
                      </span>
                      {w.meaning}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        )}

        <p className="mb-6 text-sm">
          <Link to={letterHub.path} className="font-bold text-primary underline-offset-4 hover:underline">
            More Quranic roots starting with{' '}
            <bdi lang="ar" className="font-arabic text-base">
              {firstLetter}
            </bdi>{' '}
            ({ROOT_LETTER_NAMES[letterKey] ?? letterKey}) →
          </Link>
        </p>

        <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Root, word forms, verb patterns and counts: Quranic Arabic Corpus (morphology v0.4); a count is the number of
          words in the Quran with that form. Meanings: QuranVocab, written from the Quran.com word-by-word translation.
          Verses: Tanzil Uthmani text with the Saheeh International translation. Each example is the shortest verse
          that uses the form.
        </p>
      </div>
    </>
  );
};

export default RootDetails;
