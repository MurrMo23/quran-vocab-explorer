import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import PhraseVerseCard from '@/components/phrases/PhraseVerseCard';
import TopicWordList from '@/components/topics/TopicWordList';
import { knownWords } from '@/components/topics/known-words';
import { Button } from '@/components/ui/button';
import { reviewWordsUrl } from '@/components/review/review-session';
import { track } from '@/lib/analytics';
import { getSurahName, surahPath, wordPath } from '@/utils/quran-pages';
import { PROPHET_MENTIONS, type TopicData } from '@/utils/generated/topics';
import { TOPICS, TOPICS_HUB_PATH, getTopic, topicData, topicPath, type TopicCopy } from '@/utils/topics';
import { SALAH_WORDS_PATH } from '@/utils/salah-guide';
import { SITE_URL } from '@/utils/seo-templates';
import { faqLd } from '@/utils/seo-pillars';
import { topicSeo } from '@/utils/seo-topics';

const num = (n: number) => n.toLocaleString('en-US');
const chip = 'inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 bg-card px-3 text-sm font-bold hover:border-primary/40';

const RefChip: React.FC<{ s: number; a: number }> = ({ s, a }) => (
  <Link to={surahPath(s)} className={chip}>
    {s}:{a}
    <span className="font-normal text-muted-foreground">{getSurahName(s)?.name}</span>
  </Link>
);

const Counts: React.FC<{ topic: TopicCopy; data: TopicData }> = ({ topic, data }) => (
  <section aria-labelledby="counts-heading" className="mt-10">
    <h2 id="counts-heading" className="mb-3 text-xl font-extrabold">
      How many times {topic.slug === 'women-in-the-quran' || topic.slug === 'prophets-in-the-quran' ? 'these words occur' : `${topic.name} is mentioned`}
    </h2>
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.counts.map((c) => {
        const inner = (
          <>
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-3xl font-extrabold tabular-nums text-primary">{num(c.count)}</span>
                <span className="block font-extrabold leading-snug">{c.label}</span>
                <span className="block text-sm text-muted-foreground">
                  {c.tr} · in {num(c.ayahs)} {c.ayahs === 1 ? 'ayah' : 'ayahs'}, {c.surahs} {c.surahs === 1 ? 'surah' : 'surahs'}
                </span>
              </span>
              <span className="shrink-0 font-quran text-[1.75rem] leading-[1.9]" lang="ar" dir="rtl">
                {c.ar}
              </span>
            </span>
          </>
        );
        const word = c.wordId ? knownWords([c.wordId])[0] : undefined;
        return (
          <li key={c.key}>
            {word ? (
              <Link to={wordPath(word.id)} className="block h-full rounded-[1.375rem] border-2 border-b-4 bg-card p-4 transition-colors hover:border-primary/40">
                {inner}
              </Link>
            ) : (
              <div className="h-full rounded-[1.375rem] border-2 border-b-4 bg-card p-4">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{topic.countsNote}</p>
  </section>
);

const Prophets: React.FC = () => (
  <section aria-labelledby="prophets-heading" className="mt-10">
    <h2 id="prophets-heading" className="mb-3 text-xl font-extrabold">
      The {PROPHET_MENTIONS.length} prophets named in the Quran
    </h2>
    <div className="overflow-x-auto rounded-[1.375rem] border bg-card">
      <table className="w-full min-w-[34rem] text-left text-[15px]">
        <thead>
          <tr className="border-b text-sm text-muted-foreground">
            <th scope="col" className="px-4 py-3 font-bold">#</th>
            <th scope="col" className="px-4 py-3 font-bold">Prophet</th>
            <th scope="col" className="px-4 py-3 font-bold">Arabic</th>
            <th scope="col" className="px-4 py-3 text-right font-bold">Mentions</th>
            <th scope="col" className="px-4 py-3 text-right font-bold">Surahs</th>
            <th scope="col" className="px-4 py-3 font-bold">First</th>
          </tr>
        </thead>
        <tbody>
          {PROPHET_MENTIONS.map((p, i) => {
            const word = p.wordId ? knownWords([p.wordId])[0] : undefined;
            return (
              <tr key={p.key} className="border-b last:border-0">
                <td className="px-4 py-2 text-muted-foreground tabular-nums">{i + 1}</td>
                <th scope="row" className="px-4 py-2 font-extrabold">
                  {word ? (
                    <Link to={wordPath(word.id)} className="text-primary underline-offset-4 hover:underline">
                      {p.name}
                    </Link>
                  ) : (
                    p.name
                  )}
                </th>
                <td className="px-4 py-2 font-arabic text-xl" lang="ar" dir="rtl">
                  {p.ar}
                </td>
                <td className="px-4 py-2 text-right font-extrabold tabular-nums">{num(p.count)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{p.surahs}</td>
                <td className="px-4 py-2">
                  <Link to={surahPath(p.first[0])} className="font-bold text-primary underline-offset-4 hover:underline">
                    {p.first[0]}:{p.first[1]}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
      In the traditional order. Mentions are words whose dictionary form is the name (Quranic Arabic Corpus); “First” is
      the first ayah, in mushaf order, where the name occurs.
    </p>
  </section>
);

const Titles: React.FC<{ topic: TopicCopy; data: TopicData }> = ({ topic, data }) => {
  if (!topic.titles || data.titles.length === 0) return null;
  return (
    <section aria-labelledby="titles-heading" className="mt-10">
      <h2 id="titles-heading" className="mb-1 text-xl font-extrabold">
        {topic.titlesHeading}
      </h2>
      {topic.titlesIntro && <p className="mb-4 max-w-3xl text-muted-foreground">{topic.titlesIntro}</p>}
      <ul className="grid gap-3 md:grid-cols-2">
        {data.titles.map((t) => {
          const copy = topic.titles?.[t.key];
          if (!copy) return null;
          return (
            <li key={t.key} className="flex flex-col gap-2 rounded-[1.375rem] border-2 border-b-4 bg-card p-5">
              <div className="flex flex-col-reverse gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0">
                  <h3 className="font-extrabold leading-snug">{copy.label}</h3>
                  <p className="text-sm italic text-muted-foreground">{copy.tr}</p>
                </div>
                <p className="shrink-0 text-right font-quran text-[1.65rem] leading-[1.9] text-primary sm:max-w-[60%]" lang="ar" dir="rtl">
                  {t.ar}
                </p>
              </div>
              <p className="font-semibold">“{copy.en}”</p>
              {copy.note && <p className="text-sm leading-relaxed text-muted-foreground">{copy.note}</p>}
              {copy.showCount && t.count > 1 && (
                <p className="text-sm font-bold text-gold-text">
                  {num(t.count)} times in the Quran, in {num(t.ayahs)} ayahs
                </p>
              )}
              <ul className="mt-auto flex flex-wrap gap-2 pt-1">
                {t.refs.map(([s, a]) => (
                  <li key={`${s}:${a}`}>
                    <RefChip s={s} a={a} />
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const TopicDetail = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const topic = getTopic(slug);
  const data = topic ? topicData(topic.slug) : undefined;

  if (!topic || !data) {
    return (
      <>
        <SEO title="Topic not found" noindex />
        <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
          <h1 className="mb-2 text-2xl font-extrabold">Topic not found</h1>
          <p className="mb-6 text-muted-foreground">See all the topics in the Quran.</p>
          <Button asChild>
            <Link to={TOPICS_HUB_PATH}>All topics</Link>
          </Button>
        </div>
      </>
    );
  }

  const path = topicPath(topic.slug);
  const seo = topicSeo(topic.slug, data);
  const prophetWords = topic.slug === 'prophets-in-the-quran' ? PROPHET_MENTIONS.map((p) => p.wordId) : [];
  const words = knownWords([...data.counts.map((c) => c.wordId), ...data.words, ...prophetWords]);
  const faq = topic.faq(data);
  const others = TOPICS.filter((t) => t.slug !== topic.slug);
  const crumbs = [
    { name: 'Topics', path: TOPICS_HUB_PATH },
    { name: topic.h1.replace(/:.*$/, ''), path },
  ];

  const article = {
    '@type': 'Article',
    '@id': `${SITE_URL}${path}#article`,
    headline: topic.h1,
    description: seo.description,
    inLanguage: 'en',
    url: `${SITE_URL}${path}`,
    about: { '@type': 'Thing', name: topic.name },
    isPartOf: { '@type': 'CollectionPage', '@id': `${SITE_URL}${TOPICS_HUB_PATH}#topics`, url: `${SITE_URL}${TOPICS_HUB_PATH}` },
  };

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={path}
        keywords={[topic.h1, `${topic.name} in the Quran`, `${topic.name} in Arabic`, ...topic.badges]}
        breadcrumbs={crumbs}
        jsonLd={[article, faqLd(path, faq)]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={crumbs} />

        <div className="card-tactile mb-8 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <header className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              {topic.badges.map((b, i) => (
                <span
                  key={b}
                  className={i === 0 ? 'rounded-full bg-gold/25 px-3 py-1.5 text-[13px] font-bold text-gold-text' : 'rounded-full border bg-background px-3 py-1.5 text-[13px] font-bold'}
                >
                  {b}
                </span>
              ))}
            </div>
            <p className="mt-4 font-quran text-[2.6rem] leading-[2.1] text-primary sm:text-[3.4rem]" lang="ar" dir="rtl">
              {topic.arabic}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{topic.h1}</h1>
            <div className="mt-3 max-w-2xl space-y-2 text-muted-foreground sm:text-[17px]">
              {topic.intro(data).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </header>

          {words.length > 0 && (
            <section aria-label="Learn the words" className="flex w-full flex-col gap-3 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-sm">
              <Button asChild size="lg" className="h-auto min-h-14 w-full whitespace-normal py-3">
                <Link
                  to={reviewWordsUrl(words.map((w) => w.id))}
                  onClick={() => track('cta_click', { cta: 'review_topic_words', location: `topic_${topic.slug}` })}
                >
                  <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                  Review the {words.length} words on this page
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">Free spaced-repetition flashcards with audio.</p>
            </section>
          )}
        </div>

        <Counts topic={topic} data={data} />

        {topic.slug === 'prophets-in-the-quran' && <Prophets />}

        {data.surahs.length > 0 && (
          <section aria-labelledby="surahs-heading" className="mt-10">
            <h2 id="surahs-heading" className="mb-3 text-xl font-extrabold">
              {topic.surahsHeading}
            </h2>
            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.surahs.map(([s, n]) => {
                const name = getSurahName(s);
                return (
                  <li key={s}>
                    <Link to={surahPath(s)} className="flex min-h-14 items-center gap-3 rounded-[1.25rem] border bg-card px-4 py-2.5 transition-colors hover:border-primary/40">
                      <span className="w-8 shrink-0 text-center text-sm font-extrabold text-muted-foreground">{s}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-extrabold leading-snug">{name?.name ?? `Surah ${s}`}</span>
                        <span className="block text-xs text-muted-foreground">
                          {n} {n === 1 ? 'mention' : 'mentions'}
                        </span>
                      </span>
                      {name && (
                        <span className="shrink-0 font-arabic text-xl" lang="ar" dir="rtl">
                          {name.arabic}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        <Titles topic={topic} data={data} />

        <section aria-labelledby="verses-heading" className="mt-10">
          <h2 id="verses-heading" className="mb-1 text-xl font-extrabold">
            Key verses
          </h2>
          <p className="mb-4 max-w-3xl text-muted-foreground">Press “Play verse” to hear each ayah; the words light up as they are recited.</p>
          <div className="grid gap-5">
            {data.verses.map((v) => (
              <div key={`${v.s}:${v.a}`}>
                {topic.verseNotes[`${v.s}:${v.a}`] && <h3 className="mb-2 font-extrabold">{topic.verseNotes[`${v.s}:${v.a}`]}</h3>}
                <PhraseVerseCard verse={v} />
              </div>
            ))}
          </div>
        </section>

        {words.length > 0 && (
          <section aria-labelledby="words-heading" className="mt-10">
            <h2 id="words-heading" className="mb-3 text-xl font-extrabold">
              {topic.wordsHeading}
            </h2>
            <TopicWordList words={words} />
          </section>
        )}

        <section aria-labelledby="faq-heading" className="mt-10 max-w-3xl">
          <h2 id="faq-heading" className="mb-3 text-xl font-extrabold">
            Questions
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

        <nav aria-labelledby="more-heading" className="mt-10">
          <h2 id="more-heading" className="mb-3 text-xl font-extrabold">
            Keep exploring
          </h2>
          <ul className="flex flex-wrap gap-2">
            {topic.links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={chip}>
                  {l.label}
                </Link>
              </li>
            ))}
            {others
              .filter((o) => !topic.links.some((l) => l.to === topicPath(o.slug)))
              .map((o) => (
                <li key={o.slug}>
                  <Link to={topicPath(o.slug)} className={chip}>
                    {o.h1.replace(/:.*$/, '')}
                  </Link>
                </li>
              ))}
            <li>
              <Link to={SALAH_WORDS_PATH} className={chip}>
                Words of salah
              </Link>
            </li>
          </ul>
          <Link to={TOPICS_HUB_PATH} className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-primary underline-offset-4 hover:underline">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            All topics in the Quran
          </Link>
        </nav>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Counts: Quranic Arabic Corpus (morphology v0.4). Verses: Tanzil Uthmani text with the Saheeh International
          translation; every quoted phrase is checked against the text. Recitation: Mishary Alafasy (Quran.com).
        </p>
      </div>
    </>
  );
};

export default TopicDetail;
