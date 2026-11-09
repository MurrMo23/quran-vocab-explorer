import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import PhraseVerseCard from '@/components/phrases/PhraseVerseCard';
import WordByWordAyah from '@/components/topics/WordByWordAyah';
import { knownWords } from '@/components/topics/known-words';
import { Button } from '@/components/ui/button';
import { reviewWordsUrl } from '@/components/review/review-session';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { firstUnstarted, goalWordIds, writeLearningGoal } from '@/lib/learning-goals';
import { useProgress } from '@/lib/progress';
import { getSurahName, surahPath, wordPath } from '@/utils/quran-pages';
import { phrasePath } from '@/utils/phrases';
import { SALAH_RELATED_VERSES, SALAH_STATS, SALAH_SURAH_VERSES } from '@/utils/generated/topics';
import { SALAH_STEPS, SALAH_WORDS_PATH, type SalahStep } from '@/utils/salah-guide';
import { TOPICS_HUB_PATH } from '@/utils/topics';
import { SITE_URL } from '@/utils/seo-templates';
import { faqLd } from '@/utils/seo-pillars';
import { salahWordsSeo } from '@/utils/seo-topics';

const FIRST_SESSION = 10;
const num = (n: number) => n.toLocaleString('en-US');

const StepWords: React.FC<{ ids: string[] }> = ({ ids }) => {
  const words = knownWords(ids);
  if (!words.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Words in this phrase">
      {words.map((w) => (
        <li key={w.id}>
          <Link
            to={wordPath(w.id)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 bg-card px-3 text-sm font-bold hover:border-primary/40"
          >
            <span className="font-quran text-lg font-normal leading-none" lang="ar" dir="rtl">
              {w.arabic}
            </span>
            {w.transliteration}
            <span className="font-normal text-muted-foreground">{w.meaning}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

const Step: React.FC<{ step: SalahStep; n: number }> = ({ step, n }) => {
  const related = step.verse ? SALAH_RELATED_VERSES[step.verse] : undefined;
  return (
    <li className="relative scroll-mt-20 rounded-[1.75rem] border-2 border-b-4 bg-card p-4 sm:p-7" id={step.id}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground" aria-hidden="true">
          {n}
        </span>
        <h3 className="text-lg font-extrabold sm:text-xl">{step.position}</h3>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-bold',
            step.kind === 'quran' ? 'bg-secondary text-secondary-foreground' : 'border bg-background text-muted-foreground',
          )}
        >
          {step.kind === 'quran' ? 'Recited from the Quran' : 'Words of the prayer'}
        </span>
      </div>
      {!step.surahs && (
        <>
          <p className="mt-4 font-quran text-[2rem] leading-[1.9] text-primary sm:text-[2.4rem]" lang="ar" dir="rtl">
            {step.ar}
          </p>
          <p className="mt-1 italic text-muted-foreground">{step.tr}</p>
          <p className="mt-1 text-[17px] font-bold">“{step.en}”</p>
        </>
      )}
      <p className="mt-3 max-w-3xl leading-relaxed">{step.when}</p>
      {step.note && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{step.note}</p>}
      {(step.words.length > 0 || step.phrase) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StepWords ids={step.words} />
          {step.phrase && (
            <Link to={phrasePath(step.phrase)} className="inline-flex min-h-11 items-center gap-1 px-1 text-sm font-bold text-primary underline-offset-4 hover:underline">
              Phrase page
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
      {related && (
        <div className="mt-5">
          {step.verseNote && <p className="mb-2 text-sm font-bold text-muted-foreground">{step.verseNote}</p>}
          <PhraseVerseCard verse={related} />
        </div>
      )}
      {step.surahs?.map((s) => {
        const ayahs = SALAH_SURAH_VERSES[s] ?? [];
        const name = getSurahName(s);
        return (
          <section key={s} aria-label={`Surah ${name?.name ?? s}, word by word`} className="mt-6">
            <h4 className="mb-3 flex flex-wrap items-baseline gap-x-2 font-extrabold">
              <Link to={surahPath(s)} className="text-primary underline-offset-4 hover:underline">
                Surah {name?.name ?? s} ({s})
              </Link>
              <span className="text-sm font-normal text-muted-foreground">
                {ayahs.length} ayahs, word by word
              </span>
            </h4>
            <div className="grid gap-3">
              {ayahs.map((v) => (
                <WordByWordAyah key={`${v.s}:${v.a}`} verse={v} />
              ))}
            </div>
          </section>
        );
      })}
    </li>
  );
};

const SalahWords = () => {
  const navigate = useNavigate();
  const { cards } = useProgress();
  const seo = salahWordsSeo(SALAH_STATS.salahCount);
  const goalIds = goalWordIds('salah');
  const startHref = reviewWordsUrl(goalIds.slice(0, FIRST_SESSION));
  const salahWord = SALAH_STATS.salahWordId ? knownWords([SALAH_STATS.salahWordId])[0] : undefined;

  const startGoal = (e: React.MouseEvent) => {
    e.preventDefault();
    writeLearningGoal('salah');
    track('goal_selected', { goal: 'salah' });
    track('cta_click', { cta: 'start_salah_goal', location: 'salah_words_hero' });
    navigate(reviewWordsUrl(firstUnstarted(goalIds, (id) => !!cards.get(id)?.lastReview, FIRST_SESSION)));
  };

  const faq = [
    {
      q: 'What does salah mean?',
      a: `Salah (صلاة, ṣalāh) is the Arabic word for the ritual prayer Muslims perform five times a day. The word occurs ${num(SALAH_STATS.salahCount)} times in the Quran, often in the command “establish prayer” (aqīmū ṣ-ṣalāh), as in 2:43.`,
    },
    {
      q: 'What is prayer in Arabic?',
      a: 'Ṣalāh (صلاة) is the ritual prayer, with its standing, bowing and prostration. A personal supplication, said at any time, is duʿāʾ (دعاء).',
    },
    {
      q: 'What do you say in salah?',
      a: 'In order: “Allahu akbar” to begin; an opening supplication; Al-Fatiha and, in the first two rakʿahs, another passage such as a short surah; “Subhana rabbiyal-azim” when bowing; “Samiʿallahu liman hamidah” and “Rabbana wa lakal-hamd” when rising; “Subhana rabbiyal-aʿla” in prostration; “Rabbighfir li” between the prostrations; the tashahhud when sitting; and “As-salamu alaykum wa rahmatullah” to finish.',
    },
    {
      q: 'Is everything said in salah from the Quran?',
      a: 'No. Al-Fatiha and the surah after it are recited from the Quran. The takbir, the glorifications in bowing and prostration, the tashahhud and the closing salam are the words of the prayer as taught by the Prophet; several of them echo verses of the Quran, such as 87:1 and 56:74.',
    },
    {
      q: 'How many words are in Al-Fatiha?',
      a: `${num(SALAH_STATS.fatihaWords)} words in 7 ayahs, counting the basmala as its first ayah (Quranic Arabic Corpus word count).`,
    },
  ];

  const howTo = {
    '@type': 'HowTo',
    '@id': `${SITE_URL}${SALAH_WORDS_PATH}#steps`,
    name: 'What to say in salah, in order',
    inLanguage: 'en',
    step: SALAH_STEPS.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.position,
      text: `${s.tr}: “${s.en}”. ${s.when}`,
      url: `${SITE_URL}${SALAH_WORDS_PATH}#${s.id}`,
    })),
  };

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={SALAH_WORDS_PATH}
        keywords={['prayer in Arabic', 'what does salah mean', 'salah translation', 'what to say in salah', 'words in salah', 'salah meaning']}
        breadcrumbs={[{ name: 'Words of salah', path: SALAH_WORDS_PATH }]}
        jsonLd={[howTo, faqLd(SALAH_WORDS_PATH, faq)]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Words of salah', path: SALAH_WORDS_PATH }]} />

        <div className="card-tactile mb-8 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <header className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gold/25 px-3 py-1.5 text-[13px] font-bold text-gold-text">Prayer in Arabic</span>
              <span className="rounded-full border bg-background px-3 py-1.5 text-[13px] font-bold">{SALAH_STEPS.length} parts, in order</span>
            </div>
            <p className="mt-4 font-quran text-5xl leading-[2] text-primary sm:text-6xl" lang="ar" dir="rtl">
              ٱلصَّلَوٰة
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Words of Salah: What You Say in Prayer</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground sm:text-[17px]">
              Salah (صلاة) is the Arabic word for prayer. Here is everything said in it, from the first “Allahu akbar” to the
              closing salam, with the Arabic, transliteration and meaning, and Al-Fatiha and four short surahs word by word.
            </p>
          </header>

          <section aria-label="Learn the words of your salah" className="flex w-full flex-col gap-3 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-sm">
            <Button asChild size="lg" className="h-auto min-h-14 w-full whitespace-normal py-3">
              <Link to={startHref} onClick={startGoal}>
                <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                Learn the words of your salah
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Sets “The words in my salah” as your goal: {goalIds.length} words from Al-Fatiha, Al-Ikhlas and the prayer
              phrases, with free flashcards.
            </p>
            <div className="flex flex-col gap-1 border-t pt-3">
              {salahWord && (
                <Link to={wordPath(salahWord.id)} className="inline-flex min-h-11 items-center justify-between gap-2 font-bold text-primary underline-offset-4 hover:underline">
                  <span>
                    Salah meaning: <span className="font-quran font-normal" lang="ar" dir="rtl">{salahWord.arabic}</span>
                  </span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              <Link to={phrasePath('allahu-akbar')} className="inline-flex min-h-11 items-center justify-between gap-2 font-bold text-primary underline-offset-4 hover:underline">
                <span>Allahu akbar meaning</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>

        <nav aria-label="Parts of the prayer" className="mb-8">
          <ol className="flex flex-wrap gap-2">
            {SALAH_STEPS.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border bg-card px-3 text-sm font-bold hover:border-primary/40">
                  <span className="text-muted-foreground">{i + 1}</span>
                  {s.position.replace(/,.*$/, '')}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <section aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="mb-1 text-xl font-extrabold">
            What to say in salah, in order
          </h2>
          <p className="mb-4 max-w-3xl text-muted-foreground">
            One rakʿah (unit) is standing and reciting, bowing, rising, two prostrations with a sitting between them. The
            parts below follow that order; the tashahhud and the salam come in the sitting at the end.
          </p>
          <ol className="grid gap-5">
            {SALAH_STEPS.map((s, i) => (
              <Step key={s.id} step={s} n={i + 1} />
            ))}
          </ol>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            The schools of Islamic law differ in small details, such as the wording of the opening supplication and the
            tashahhud and what is said aloud. This page gives the most widely used wording; your local mosque or teacher can
            show you the practice of your school.
          </p>
        </section>

        <section aria-labelledby="salah-meaning" className="mt-12 max-w-3xl">
          <h2 id="salah-meaning" className="mb-2 text-xl font-extrabold">
            What does salah mean?
          </h2>
          <div className="space-y-3 text-[17px] leading-relaxed">
            <p>
              Ṣalāh (صلاة) is the ritual prayer. The word occurs {num(SALAH_STATS.salahCount)} times in the Quran, in{' '}
              {num(SALAH_STATS.salahAyahs)} ayahs, often in the command “establish prayer” (aqīmū ṣ-ṣalāh):
            </p>
          </div>
          <PhraseVerseCard verse={SALAH_RELATED_VERSES.salah} className="mt-4" />
        </section>

        <section aria-labelledby="salah-faq" className="mt-12 max-w-3xl">
          <h2 id="salah-faq" className="mb-3 text-xl font-extrabold">
            Questions about the words of salah
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

        <nav aria-label="Keep exploring" className="mt-10 flex flex-wrap gap-2">
          {[
            { to: '/juz-amma-vocabulary', label: 'Juz Amma vocabulary' },
            { to: '/surah/1', label: 'Surah Al-Fatiha word list' },
            { to: '/phrases', label: 'Islamic phrases' },
            { to: TOPICS_HUB_PATH, label: 'Topics in the Quran' },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 bg-card px-4 text-sm font-bold hover:border-primary/40">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Quran text: Tanzil Uthmani, checked word by word against the Quranic Arabic Corpus. Word-by-word glosses and
          transliteration: Quran.com. Translation: Saheeh International. Recitation: Mishary Alafasy (Quran.com).
        </p>
      </div>
    </>
  );
};

export default SalahWords;
