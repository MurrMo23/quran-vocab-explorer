import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { Button } from '@/components/ui/button';
import { getRootBySlug, getWordOccurrences, rootPath, wordPath } from '@/utils/quran-pages';

const RootDetails = () => {
  const { root: slug } = useParams<{ root: string }>();
  const root = useMemo(() => (slug ? getRootBySlug(slug) : undefined), [slug]);

  if (!root) {
    return (
      <>
        <SEO title="Root not found" noindex />
        <div className="py-16 text-center">
          <h1 className="mb-2 text-xl font-semibold">Root not found</h1>
          <p className="mb-6 text-muted-foreground">We have no words from this root yet.</p>
          <Button asChild>
            <Link to="/roots">Browse all roots</Link>
          </Button>
        </div>
      </>
    );
  }

  const n = root.words.length;
  const meanings = root.words.slice(0, 4).map((w) => `${w.transliteration} (${w.meaning})`).join(', ');
  const title = `Arabic root ${root.arabic} (${root.slug}): ${n} Quranic ${n === 1 ? 'word' : 'words'}`;
  const description = `Words from the root ${root.arabic} (${root.slug}) occur ${root.total.toLocaleString('en-US')} times in the Quran. Learn ${n === 1 ? 'the word' : `${n} words`} from this root family: ${meanings}.`;

  return (
    <>
      <SEO
        title={title}
        description={description}
        url={rootPath(root.slug)}
        keywords={[`root ${root.slug}`, `${root.arabic} root`, 'Arabic root words', 'Quranic Arabic roots']}
        breadcrumbs={[
          { name: 'Roots', path: '/roots' },
          { name: `Root ${root.arabic}`, path: rootPath(root.slug) },
        ]}
      />

      <div className="container mx-auto max-w-4xl py-6">
        <PageTrail items={[{ name: 'Roots', path: '/roots' }, { name: <span className="font-arabic" lang="ar" dir="rtl">{root.arabic}</span>, path: rootPath(root.slug) }]} />

        <header className="mb-8">
          <p className="font-arabic text-5xl leading-tight text-primary" lang="ar" dir="rtl">
            {root.arabic}
          </p>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            Root {root.arabic} <span className="text-muted-foreground">({root.slug})</span>
          </h1>
          <p className="mt-2 text-lg">
            Words from this root occur <strong>{root.total.toLocaleString('en-US')}</strong>{' '}
            {root.total === 1 ? 'time' : 'times'} in the Quran.
          </p>
        </header>

        <section aria-labelledby="family-heading">
          <h2 id="family-heading" className="mb-3 text-lg font-semibold">
            {n === 1 ? 'Word' : `${n} words`} from this root on QuranVocab
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {root.words.map((word) => {
              // Same figure as the word page (some entries count several closely related lemmas).
              const occ = getWordOccurrences(word.id) ? word.frequency : undefined;
              return (
                <li key={word.id}>
                  <Link
                    to={wordPath(word.id)}
                    className="glass-card block h-full rounded-xl border border-transparent p-4 transition-all hover:border-primary/20 hover:shadow-md"
                  >
                    <span className="block text-right font-arabic text-2xl" lang="ar" dir="rtl">{word.arabic}</span>
                    <span className="block text-sm text-muted-foreground">{word.transliteration}</span>
                    <span className="block font-medium">{word.meaning}</span>
                    <span className="mt-2 block text-xs capitalize text-muted-foreground">
                      {word.partOfSpeech}
                      {occ ? ` · ${occ.toLocaleString('en-US')}× in the Quran` : word.quranicForm ? ' · related form' : ''}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Root and counts from the Quranic Arabic Corpus. The root total counts every word in the Quran with a
            form derived from this root, including words not listed here.
          </p>
        </section>
      </div>
    </>
  );
};

export default RootDetails;
