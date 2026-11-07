import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import SEO from '@/components/SEO';
import { ogImage } from '@/utils/og-image';
import { sampleVocabulary, collections, getWordsByCollection } from '@/utils/vocabulary';
import { SURAH_PAGES } from '@/utils/quran-pages';
import GoalChooser from '@/components/onboarding/GoalChooser';
import RamadanPromo from '@/components/RamadanPromo';
import SampleWordCard from '@/components/home/SampleWordCard';

// Computed once from the bundled data so the numbers on the page are always true.
const wordCount = sampleVocabulary.length;
const collectionCount = collections.filter((c) => getWordsByCollection(c.id).length > 0).length;
const surahCount = SURAH_PAGES.length;
// The 99 Names hub always has 99 entries; importing the generated names data (~97 KB) into the home
// chunk only to count it is not worth it.
const NAMES_COUNT = 99;

const stats = [
  { value: wordCount.toLocaleString('en-US'), label: 'Quranic words' },
  { value: String(surahCount), label: 'surah word lists' },
  { value: String(collectionCount), label: 'themed collections' },
  { value: String(NAMES_COUNT), label: 'Names of Allah' },
];

const steps = [
  { title: 'Hear it', body: 'Every word is recited exactly as it sounds in its verse, word by word.' },
  { title: 'Recall it', body: 'Quick meaning checks and flashcards, with the root family to connect words.' },
  { title: 'Keep it', body: 'Spaced repetition brings each word back just before you would forget it.' },
];

const audiences = [
  {
    eyebrow: 'For families',
    title: 'Learn together at home',
    points: [
      'Short sessions you can do together after Maghrib',
      'Recitation audio for every word, so children hear it right',
      'Works on any phone or tablet, with nothing to install',
    ],
  },
  {
    eyebrow: 'For teachers and masjids',
    title: 'Share it with your class',
    points: [
      'Link any collection, surah or word page in your class notes',
      'Nothing for students to sign up for',
      'Free, ad-free, with sources shown on every word',
    ],
  },
];

const container = 'mx-auto max-w-6xl px-4 sm:px-6';
const h2 = 'text-[28px] font-extrabold leading-tight tracking-[-0.02em] sm:text-4xl';

const Index = () => {
  const { session } = useAuth();
  const startHref = session ? '/dashboard' : '/review';

  return (
    <>
      <SEO
        title="QuranVocab — Learn the Words of the Quran"
        description={`Learn ${wordCount} common words of the Quran with flashcards, quizzes and word pages showing root and meaning. Free, no account needed to start.`}
        keywords={["Quranic Arabic", "Quran vocabulary", "Quranic words", "Arabic flashcards", "Quran study"]}
        image={ogImage('pages', 'home')}
        type="website"
      />

      {/* Hero */}
      <section className={`${container} grid items-center gap-10 pb-12 pt-10 sm:pb-14 sm:pt-[72px] lg:grid-cols-[1.15fr_1fr] lg:gap-14`}>
        <div className="flex min-w-0 flex-col gap-6">
          <span className="self-start rounded-full bg-secondary px-3.5 py-2 text-sm font-bold text-secondary-foreground">
            Free · No ads · No account needed
          </span>
          <h1 className="text-[40px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[60px]">
            Understand the Quran you recite.
          </h1>
          <p className="max-w-[540px] text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]">
            Learn the Quran’s most frequent words with word-by-word recitation, root families and a few minutes of
            review a day. Every word is checked against the Quranic Arabic Corpus.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="px-[26px] text-[17px] font-extrabold">
              <Link to={startHref}>{session ? 'Continue learning' : 'Start learning free'}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-6 text-[17px] font-extrabold">
              <Link to="/collections">Browse collections</Link>
            </Button>
          </div>
          <dl className="grid grid-cols-2 gap-x-7 gap-y-4 pt-2 sm:flex sm:flex-wrap">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="text-sm text-muted-foreground">{s.label}</dt>
                <dd className="text-[26px] font-extrabold leading-tight">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex min-w-0 justify-center">
          <SampleWordCard startHref={startHref} />
        </div>
      </section>

      {/* Goals */}
      <GoalChooser variant="cards" />

      {/* How it works */}
      <section className="border-y border-border bg-card" aria-labelledby="how-heading">
        <div className={`${container} flex flex-col gap-8 py-14 sm:py-16`}>
          <h2 id="how-heading" className={`${h2} text-center`}>
            A few minutes a day
          </h2>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map((s, i) => (
              <li key={s.title} className="flex flex-col items-center gap-2.5 px-4 py-2 text-center">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-[22px] font-extrabold text-primary-foreground"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="text-[21px] font-extrabold">{s.title}</h3>
                <p className="max-w-sm text-base leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ramadan plan */}
      <RamadanPromo />

      {/* Families, teachers and masjids */}
      <section className={`${container} grid gap-6 py-12 sm:py-16 md:grid-cols-2`}>
        {audiences.map((a) => (
          <div key={a.title} className="flex flex-col gap-3.5 rounded-[28px] border border-border bg-card p-6 sm:p-8">
            <span className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-gold-text">{a.eyebrow}</span>
            <h2 className="text-2xl font-extrabold sm:text-[28px]">{a.title}</h2>
            <ul className="list-disc space-y-1 pl-5 text-base leading-relaxed text-foreground/80 marker:text-muted-foreground">
              {a.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Sign up */}
      <section className={container} aria-labelledby="signup-heading">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-secondary p-6 sm:p-10">
          <div className="min-w-0 flex-[1_1_420px]">
            <h2 id="signup-heading" className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[32px]">
              Keep your progress on every device
            </h2>
            <p className="mt-2 text-base leading-relaxed text-foreground/80 sm:text-[17px]">
              Create a free account to sync your streak and reviews. Everything else works without one.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            {session ? (
              <Button asChild size="lg" className="px-[26px] text-[17px] font-extrabold">
                <Link to="/dashboard">Continue learning</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="px-[26px] text-[17px] font-extrabold">
                  <Link to="/auth">Create free account</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="px-[22px] text-[17px] font-extrabold text-secondary-foreground hover:bg-background/60 hover:text-secondary-foreground"
                >
                  <Link to="/review">Try without one</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
