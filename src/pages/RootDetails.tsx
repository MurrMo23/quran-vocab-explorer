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
        <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
          <h1 className="mb-2 text-2xl font-extrabold">Root not found</h1>
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

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Roots', path: '/roots' }, { name: <span className="font-arabic" lang="ar" dir="rtl">{root.arabic}</span>, path: rootPath(root.slug) }]} />

        <header className="card-tactile mb-8 flex flex-col items-center gap-3 rounded-[2rem] px-6 py-8 text-center sm:px-9 sm:py-10">
          <span className="rounded-full bg-secondary px-3 py-1.5 text-[13px] font-bold text-secondary-foreground">Arabic root</span>
          <p className="font-quran text-6xl leading-[1.6] text-primary sm:text-7xl" lang="ar" dir="rtl">
            {root.arabic}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
            Root <span className="font-arabic font-normal" lang="ar" dir="rtl">{root.arabic}</span>{' '}
            <span className="text-muted-foreground">({root.slug})</span>
          </h1>
          <p className="text-[17px] text-muted-foreground">
            Words from this root occur <strong className="font-extrabold text-foreground">{root.total.toLocaleString('en-US')}</strong>{' '}
            {root.total === 1 ? 'time' : 'times'} in the Quran.
          </p>
        </header>

        <section aria-labelledby="family-heading">
          <h2 id="family-heading" className="mb-4 text-xl font-extrabold">
            {n === 1 ? 'Word' : `${n} words`} from this root on QuranVocab
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {root.words.map((word) => {
              // Same figure as the word page (some entries count several closely related lemmas).
              const occ = getWordOccurrences(word.id) ? word.frequency : undefined;
              return (
                <li key={word.id}>
                  <Link
                    to={wordPath(word.id)}
                    className="flex h-full flex-col gap-1 rounded-[1.375rem] border-2 border-b-4 bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="block text-center font-quran text-4xl leading-[1.75]" lang="ar" dir="rtl">{word.arabic}</span>
                    <span className="block text-[17px] font-extrabold leading-snug">{word.meaning}</span>
                    <span className="block text-sm text-muted-foreground">{word.transliteration}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      <span className="capitalize">{word.partOfSpeech}</span>
                      {occ ? ` · ${occ.toLocaleString('en-US')}× in the Quran` : word.quranicForm ? ' · related form' : ''}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            Root and counts from the Quranic Arabic Corpus. The root total counts every word in the Quran with a
            form derived from this root, including words not listed here.
          </p>
        </section>
      </div>
    </>
  );
};

export default RootDetails;
