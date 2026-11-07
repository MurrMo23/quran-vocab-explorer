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

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Roots', path: '/roots' }]} />

        <header className="card-tactile mb-8 rounded-[2rem] p-6 sm:p-9">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Arabic roots in the Quran</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
            Most Arabic words are built from a root of three letters. Learn one root and you can recognise a whole
            family of words. The number next to each root is how many times words from it occur in the Quran
            (Quranic Arabic Corpus).
          </p>

        <nav aria-label="Jump to letter" className="mt-6">
          <ul className="flex flex-wrap gap-2" lang="ar" dir="rtl">
            {groups.map((g) => (
              <li key={g.letter}>
                <a
                  href={`#letter-${g.roots[0].slug.split('-')[0]}`}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-b-4 bg-background font-arabic text-xl transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {g.letter}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        </header>

        {groups.map((g) => (
          <section key={g.letter} id={`letter-${g.roots[0].slug.split('-')[0]}`} className="mb-10 scroll-mt-24" aria-label={`Roots starting with ${g.letter}`}>
            <h2 className="mb-4 flex items-center gap-3" lang="ar" dir="rtl">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary font-quran text-3xl leading-none text-secondary-foreground">{g.letter}</span>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {g.roots.map((r) => (
                <li key={r.slug}>
                  <Link to={rootPath(r.slug)} className="flex h-full flex-col gap-1 rounded-[1.25rem] border-2 border-b-4 bg-card px-4 py-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <span className="flex items-center justify-between gap-2">
                      <span className="shrink-0 rounded-full bg-gold/25 px-2 py-0.5 text-xs font-bold text-gold-text" aria-label={`${r.total} occurrences in the Quran`}>
                        {r.total.toLocaleString('en-US')}×
                      </span>
                      <span className="font-arabic text-2xl leading-snug" lang="ar" dir="rtl">{r.arabic}</span>
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {r.slug} · {r.words.length} {r.words.length === 1 ? 'word' : 'words'}
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
