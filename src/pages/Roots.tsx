import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { getAllRoots, rootPath, type RootFamily } from '@/utils/quran-pages';

const Roots = () => {
  // Roots come in Arabic alphabetical order; group them by first radical.
  const groups = useMemo(() => {
    const out: { letter: string; roots: RootFamily[] }[] = [];
    for (const r of getAllRoots()) {
      const letter = r.arabic.split(' ')[0];
      const last = out[out.length - 1];
      if (last && last.letter === letter) last.roots.push(r);
      else out.push({ letter, roots: [r] });
    }
    return out;
  }, []);
  const total = groups.reduce((n, g) => n + g.roots.length, 0);

  return (
    <>
      <SEO
        title={`Quranic Arabic Roots: ${total} Root Families with Their Words`}
        description={`Browse ${total} Arabic roots of the Quran in alphabetical order. See how often each root's words occur in the Quran and learn the words built from it.`}
        url="/roots"
        keywords={['Quranic Arabic roots', 'Arabic root words', 'trilateral roots', 'Quran vocabulary by root']}
        breadcrumbs={[{ name: 'Roots', path: '/roots' }]}
      />

      <div className="container mx-auto max-w-5xl py-6">
        <PageTrail items={[{ name: 'Roots', path: '/roots' }]} />

        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Arabic roots in the Quran</h1>
          <p className="mt-2 text-muted-foreground">
            Most Arabic words are built from a root of three letters. Learn one root and you can recognise a whole
            family of words. The number next to each root is how many times words from it occur in the Quran
            (Quranic Arabic Corpus).
          </p>
        </header>

        <nav aria-label="Jump to letter" className="mb-6">
          <ul className="flex flex-wrap gap-1.5" lang="ar" dir="rtl">
            {groups.map((g) => (
              <li key={g.letter}>
                <a
                  href={`#letter-${g.roots[0].slug.split('-')[0]}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md border font-arabic text-lg hover:bg-muted"
                >
                  {g.letter}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {groups.map((g) => (
          <section key={g.letter} id={`letter-${g.roots[0].slug.split('-')[0]}`} className="mb-8 scroll-mt-20" aria-label={`Roots starting with ${g.letter}`}>
            <h2 className="mb-3 border-b pb-1 text-right font-arabic text-2xl" lang="ar" dir="rtl">{g.letter}</h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {g.roots.map((r) => (
                <li key={r.slug}>
                  <Link to={rootPath(r.slug)} className="flex items-center justify-between gap-2 rounded-lg border p-3 hover:border-primary/30 hover:bg-muted/40">
                    <span className="min-w-0">
                      <span className="block font-arabic text-xl" lang="ar" dir="rtl">{r.arabic}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {r.slug} · {r.words.length} {r.words.length === 1 ? 'word' : 'words'}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium" aria-label={`${r.total} occurrences in the Quran`}>
                      {r.total.toLocaleString('en-US')}×
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
};

export default Roots;
