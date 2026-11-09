import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { TOPICS, TOPICS_HUB_PATH, topicData, topicPath } from '@/utils/topics';
import { SALAH_WORDS_PATH } from '@/utils/salah-guide';
import { SITE_URL, itemListLd } from '@/utils/seo-templates';
import { TOPICS_HUB_SEO } from '@/utils/seo-topics';

const num = (n: number) => n.toLocaleString('en-US');

const Topics = () => {
  const collection = {
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}${TOPICS_HUB_PATH}#topics`,
    name: 'Topics in the Quran',
    url: `${SITE_URL}${TOPICS_HUB_PATH}`,
    inLanguage: 'en',
  };
  return (
    <>
      <SEO
        title={TOPICS_HUB_SEO.title}
        description={TOPICS_HUB_SEO.description}
        url={TOPICS_HUB_PATH}
        keywords={['topics in the Quran', 'Jesus in the Quran', 'Mary in the Quran', 'Moses in the Quran', 'women in the Quran', 'jinn in the Quran', 'prophets in the Quran']}
        breadcrumbs={[{ name: 'Topics', path: TOPICS_HUB_PATH }]}
        jsonLd={[
          collection,
          itemListLd(
            'Topics in the Quran',
            TOPICS_HUB_PATH,
            TOPICS.map((t) => ({ name: t.h1, path: topicPath(t.slug) })),
          ),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Topics', path: TOPICS_HUB_PATH }]} />

        <header className="card-tactile mb-8 rounded-[2rem] p-6 sm:p-9">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Topics in the Quran</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
            What the Quran says about the people and subjects readers ask about most. Each page counts how often the name
            or word occurs, lists the surahs where it occurs most, and shows the key verses in Arabic with a translation and
            recitation, with the Quranic words to learn.
          </p>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {TOPICS.map((t) => {
            const d = topicData(t.slug);
            const lead = d?.counts[0];
            return (
              <li key={t.slug}>
                <Link
                  to={topicPath(t.slug)}
                  className="flex h-full flex-col gap-2 rounded-[1.375rem] border-2 border-b-4 bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="font-quran text-[1.9rem] leading-[1.9] text-primary" lang="ar" dir="rtl">
                    {t.arabic}
                  </span>
                  <span className="text-lg font-extrabold leading-snug">{t.h1.replace(/:.*$/, '')}</span>
                  <span className="text-[15px] leading-snug">{t.summary}</span>
                  {lead && (
                    <span className="mt-auto pt-1">
                      <span className="inline-block rounded-full bg-gold/25 px-2.5 py-1 text-xs font-bold text-gold-text">
                        {lead.label.replace(/,.*$/, '')}: {num(lead.count)} times
                      </span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <section aria-labelledby="more-topics" className="mt-12 grid gap-4 md:grid-cols-2">
          <h2 id="more-topics" className="sr-only">
            More guides
          </h2>
          {[
            { to: SALAH_WORDS_PATH, title: 'Words of salah', text: 'What you say in prayer, in order, with Al-Fatiha word by word.' },
            { to: '/collections/prophets', title: 'Prophets & Messengers collection', text: 'The prophets’ names and related words as flashcards.' },
            { to: '/names-of-allah', title: '99 Names of Allah', text: 'Each name with its meaning, root and the verses it occurs in.' },
            { to: '/quran-statistics', title: 'Quran statistics', text: 'Surahs, ayahs, words and how often names occur.' },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="flex items-center justify-between gap-3 rounded-[1.375rem] border bg-card p-5 transition-colors hover:border-primary/40">
              <span>
                <span className="block font-extrabold">{l.title}</span>
                <span className="block text-sm text-muted-foreground">{l.text}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            </Link>
          ))}
        </section>
      </div>
    </>
  );
};

export default Topics;
