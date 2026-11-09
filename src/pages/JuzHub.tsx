import { Link } from 'react-router-dom';
import { Moon } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { itemListLd } from '@/utils/seo-templates';
import { PILLAR_PATHS, faqLd } from '@/utils/seo-pillars';
import { JUZ_HUB_SEO } from '@/utils/seo-juz';
import { JUZ, JUZ_HUB_PATH, JUZ_TOP, juzCoverage, juzPath, juzRangeLabel } from '@/utils/juz';

const num = (n: number) => n.toLocaleString('en-US');
const pct = (part: number, whole: number) => `${((100 * part) / whole).toLocaleString('en-US', { maximumFractionDigits: 0 })}%`;
const inlineLink = 'font-semibold text-primary underline underline-offset-4 hover:text-primary-shade';

const FAQ = [
  {
    q: 'How many juz are in the Quran?',
    a: 'The Quran is divided into 30 juz (ajza’) of roughly equal length, so that it can be read in a month: one juz a day. Each juz is split into two hizb and eight quarters.',
  },
  {
    q: 'What is the difference between a juz and a para?',
    a: 'None: juz is the Arabic word (“part”) and para (or sipara) is the name used in Urdu and other South Asian languages. Juz 1 is Para 1, and so on to Juz 30, Juz Amma.',
  },
  {
    q: 'Why does each juz have a name?',
    a: 'Each juz is traditionally known by its opening words, such as Alif Lam Mim for Juz 1, Sayaqul for Juz 2 and Amma for Juz 30.',
  },
];

const JuzHub = () => {
  const totalWords = JUZ.reduce((s, j) => s + j.words, 0);
  const shares = JUZ.map((j) => juzCoverage(j, JUZ_TOP) / j.words);
  return (
    <>
      <SEO
        title={JUZ_HUB_SEO.title}
        description={JUZ_HUB_SEO.description}
        url={JUZ_HUB_PATH}
        type="website"
        keywords={['juz', 'para', 'sipara', '30 juz of the Quran', 'juz names', 'juz vocabulary', 'one juz a day Ramadan']}
        breadcrumbs={[{ name: 'Juz by juz', path: JUZ_HUB_PATH }]}
        jsonLd={[
          itemListLd(
            'The 30 juz of the Quran',
            JUZ_HUB_PATH,
            JUZ.map((j) => ({ name: `Juz ${j.n} (${j.name})`, path: juzPath(j.n) })),
          ),
          faqLd(JUZ_HUB_PATH, FAQ),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Juz by juz', path: JUZ_HUB_PATH }]} />

        <header className="card-tactile mb-8 rounded-[2rem] p-6 sm:p-9">
          <span className="inline-block rounded-full bg-gold/25 px-3 py-1.5 text-[13px] font-bold text-gold-text">30 juz · 30 para</span>
          <p className="mt-3 font-quran text-5xl leading-[1.75] text-primary sm:text-6xl" lang="ar" dir="rtl">
            أجزاء القرآن
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Quran Vocabulary, Juz by Juz</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground sm:text-[17px]">
            The Quran’s {num(totalWords)} words are divided into 30 juz (para), and most Muslims read one a day in Ramadan. Open a
            juz to see its key words, most frequent first: in each juz its top {JUZ_TOP} words make up {pct(Math.min(...shares), 1)}
            to {pct(Math.max(...shares), 1)} of the text.
          </p>
          <p className="mt-4 flex items-start gap-2 text-[15px]">
            <Moon className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              Following one juz a day? The{' '}
              <Link to="/ramadan" className={inlineLink}>
                30-day Ramadan plan
              </Link>{' '}
              links each day to that day’s juz.
            </span>
          </p>
        </header>

        <section aria-labelledby="juz-list">
          <h2 id="juz-list" className="mb-3 text-xl font-extrabold">
            The 30 juz (para) of the Quran
          </h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {JUZ.map((j) => (
              <li key={j.n}>
                <Link
                  to={juzPath(j.n)}
                  className="flex h-full items-center gap-4 rounded-[1.375rem] border-2 border-b-4 bg-card px-4 py-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-base font-extrabold text-secondary-foreground">
                    {j.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold leading-snug">
                      Juz {j.n}: {j.name}
                    </span>
                    <span className="block text-sm text-muted-foreground">{juzRangeLabel(j)}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {num(j.words)} words · {j.siteWords} on QuranVocab · top {JUZ_TOP} cover {pct(juzCoverage(j, JUZ_TOP), j.words)}
                    </span>
                  </span>
                  <span className="shrink-0 font-quran text-2xl leading-[1.9] text-primary" lang="ar" dir="rtl">
                    {j.ar}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            Juz boundaries follow the standard Madani mushaf division. Word counts are from the Quranic Arabic Corpus; a word of the
            text is covered when its dictionary form is one of the listed words. Juz 30 opens the{' '}
            <Link to={PILLAR_PATHS.juzAmma} className={inlineLink}>
              Juz Amma vocabulary
            </Link>{' '}
            page.
          </p>
        </section>

        <section aria-labelledby="juz-faq" className="mt-12 max-w-3xl">
          <h2 id="juz-faq" className="mb-3 text-xl font-extrabold">
            Juz and para: common questions
          </h2>
          <div className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-[1.375rem] border bg-card p-5">
                <h3 className="font-extrabold">{f.q}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <nav aria-label="Keep exploring" className="mt-10 flex flex-wrap gap-2">
          {[
            { to: '/surahs', label: 'All 114 surah word lists' },
            { to: PILLAR_PATHS.commonWords, label: 'Most common words in the Quran' },
            { to: PILLAR_PATHS.stats, label: 'Quran statistics' },
            { to: '/ramadan', label: 'Ramadan 30-day plan' },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="inline-flex min-h-11 items-center rounded-full border-2 bg-card px-4 text-sm font-bold hover:border-primary/40">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default JuzHub;
