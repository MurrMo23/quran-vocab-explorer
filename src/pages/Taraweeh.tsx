import React from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import PhraseVerseCard from '@/components/phrases/PhraseVerseCard';
import { knownWords } from '@/components/topics/known-words';
import { ArrowLink, FaqSection, MoreForRamadan, inlineLink } from '@/components/ramadan/RamadanBits';
import { Button } from '@/components/ui/button';
import { reviewWordsUrl } from '@/components/review/review-session';
import { track } from '@/lib/analytics';
import { wordPath } from '@/utils/quran-pages';
import { PILLAR_PATHS, faqLd } from '@/utils/seo-pillars';
import { RAMADAN_HUB_PATH, RAMADAN_PATHS, taraweehSeo } from '@/utils/seo-ramadan';
import { QURAN_STATS, TOP_WORD_COVERAGE, TOP_WORD_IDS } from '@/utils/generated/pillars';
import { RAMADAN_ROOTS, RAMADAN_VERSES } from '@/utils/generated/ramadan';

const PATH = RAMADAN_PATHS.taraweeh;
/** The other agent's per-juz hub (/juz, /juz/<n>). */
const JUZ_HUB_PATH = '/juz';
const SHOWN = 12;
const REVIEW = 20;
const num = (n: number) => n.toLocaleString('en-US');

const Taraweeh = () => {
  const total = QURAN_STATS.words;
  const top100 = TOP_WORD_COVERAGE.find(([k]) => k === 100)?.[1] ?? 0;
  const pct100 = Math.round((100 * top100) / total);
  const seo = taraweehSeo();
  const top = knownWords(TOP_WORD_IDS.slice(0, SHOWN));
  const reviewIds = knownWords(TOP_WORD_IDS.slice(0, REVIEW)).map((w) => w.id);
  const rwh = RAMADAN_ROOTS['r-w-hh'];

  const faq = [
    {
      q: 'What does taraweeh mean?',
      a: 'Tarāwīḥ (تراويح) is the plural of tarwīḥah, “a rest” or “a pause”, from the root ر و ح. The prayer is named after the short rest the worshippers take after every four rakʿahs.',
    },
    {
      q: 'Is taraweeh in the Quran?',
      a: 'The word is not. The Quran praises and commands prayer at night, as in “Arise [to pray] the night, except for a little” (73:2) and “recite what is easy [for you] of the Qur’an” (73:20). Taraweeh is the form this night prayer takes in Ramadan, as taught in the Sunnah.',
    },
    {
      q: 'How many rakats is taraweeh?',
      a: 'Mosques commonly pray 8 or 20 rakʿahs, in pairs, followed by witr. Both are long-standing practices; the number differs by school and by mosque.',
    },
    {
      q: 'How much Quran is recited in taraweeh?',
      a: 'Many mosques aim to complete the whole Quran during Ramadan. The Quran is divided into 30 equal parts (juz), so that is about one juz a night.',
    },
    {
      q: 'Is taraweeh obligatory?',
      a: 'No. Taraweeh is a recommended (sunnah) prayer, not one of the five obligatory prayers. It is prayed after ʿIshāʾ, in the mosque or at home.',
    },
  ];

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={PATH}
        keywords={['taraweeh', 'taraweeh meaning', 'tarawih', 'what is taraweeh', 'taraweeh prayer', 'taraweeh in Arabic', 'Ramadan night prayer', 'Quran words in taraweeh']}
        breadcrumbs={[
          { name: 'Ramadan', path: RAMADAN_HUB_PATH },
          { name: 'Taraweeh', path: PATH },
        ]}
        jsonLd={[faqLd(PATH, faq)]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Ramadan', path: RAMADAN_HUB_PATH }, { name: 'Taraweeh', path: PATH }]} />

        <div className="card-tactile mb-10 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <header className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gold/25 px-3 py-1.5 text-[13px] font-bold text-gold-text">The night prayer of Ramadan</span>
              <span className="rounded-full border bg-background px-3 py-1.5 text-[13px] font-bold">Root ر و ح</span>
            </div>
            <p className="mt-4 font-quran text-5xl leading-[1.9] text-primary sm:text-6xl sm:leading-[1.9]" lang="ar" dir="rtl">
              تَرَاوِيح
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Taraweeh Meaning: The Night Prayer of Ramadan</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              Taraweeh (tarāwīḥ) means “rests”. It is the prayer Muslims stand in every night of Ramadan, often hearing the
              whole Quran recited over the month. Here is what the word means, how much is recited, and the Quranic words
              you will hear most, so you can follow along.
            </p>
          </header>

          <section aria-label="Understand taraweeh" className="flex w-full flex-col gap-3 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-sm">
            <Button asChild size="lg" className="h-auto min-h-14 w-full whitespace-normal py-3">
              <Link to={reviewWordsUrl(reviewIds)} onClick={() => track('cta_click', { cta: 'review_top_words', location: 'taraweeh_hero' })}>
                <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                Learn the {reviewIds.length} words you hear most
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">Free flashcards with audio; no account needed.</p>
            <div className="flex flex-col gap-1 border-t pt-3">
              <ArrowLink to={RAMADAN_HUB_PATH}>30-day Ramadan Quran plan</ArrowLink>
              <ArrowLink to={JUZ_HUB_PATH}>The words of each juz</ArrowLink>
            </div>
          </section>
        </div>

        <section aria-labelledby="meaning-heading" className="max-w-3xl">
          <h2 id="meaning-heading" className="mb-3 text-xl font-extrabold">
            What does taraweeh mean?
          </h2>
          <div className="space-y-3 text-[17px] leading-relaxed">
            <p>
              <strong>Tarāwīḥ</strong> (تراويح) is the plural of <strong>tarwīḥah</strong> (ترويحة), “a rest” or “a pause”.
              The prayer is long, so after every four rakʿahs the worshippers sit and rest for a while, and the whole prayer
              took its name from those rests.
            </p>
            <p>
              The word comes from the root{' '}
              <Link to="/root/r-w-hh" className={inlineLink}>
                <span className="font-arabic" lang="ar" dir="rtl">ر و ح</span>
              </Link>
              , whose words are about breath, ease and relief: rāḥah (rest). Tarāwīḥ itself is not in the Quran, but its root
              is, {num(rwh.total)} times, in words such as{' '}
              <Link to={wordPath('ar-ruh')} className={inlineLink}>
                rūḥ
              </Link>{' '}
              (spirit, soul) and{' '}
              <Link to={wordPath('ar-riyah')} className={inlineLink}>
                rīḥ
              </Link>{' '}
              (wind).
            </p>
          </div>
        </section>

        <section aria-labelledby="what-heading" className="mt-12 max-w-3xl">
          <h2 id="what-heading" className="mb-3 text-xl font-extrabold">
            What is taraweeh prayer?
          </h2>
          <div className="space-y-3 text-[17px] leading-relaxed">
            <p>
              Taraweeh is a recommended (sunnah) night prayer prayed only in Ramadan, after the ʿIshāʾ prayer. It is usually
              prayed in congregation in the mosque, behind an imam who recites aloud, in pairs of rakʿahs: commonly 8 or 20,
              followed by witr. It can also be prayed at home.
            </p>
            <p>
              The Quran does not use the word, but it praises standing in prayer at night and reciting the Quran in it:
            </p>
          </div>
          <div className="mt-5 grid gap-4">
            <PhraseVerseCard verse={RAMADAN_VERSES['night-prayer']} />
            <PhraseVerseCard verse={RAMADAN_VERSES['recite-slowly']} />
          </div>
        </section>

        <section aria-labelledby="how-much-heading" className="mt-12 max-w-3xl">
          <h2 id="how-much-heading" className="mb-3 text-xl font-extrabold">
            How much Quran is recited in taraweeh?
          </h2>
          <div className="space-y-3 text-[17px] leading-relaxed">
            <p>
              Many mosques aim to recite the whole Quran in taraweeh over the month, a khatm. The Quran is divided into 30
              equal parts called juz (plural ajzāʾ), so that is about one juz a night, and the last nights often end with
              Juz ʿAmma, the 30th juz of short surahs. Other mosques recite less, and any amount is fine.
            </p>
            <p>
              See{' '}
              <Link to={JUZ_HUB_PATH} className={inlineLink}>
                the 30 juz of the Quran
              </Link>{' '}
              for the words of each night’s juz, or start with{' '}
              <Link to={PILLAR_PATHS.juzAmma} className={inlineLink}>
                Juz Amma vocabulary
              </Link>
              .
            </p>
          </div>
        </section>

        <section aria-labelledby="words-heading" className="mt-12">
          <h2 id="words-heading" className="mb-1 text-xl font-extrabold">
            The words you will hear most in taraweeh
          </h2>
          <p className="mb-4 max-w-3xl text-muted-foreground">
            A small number of words make up much of every night’s recitation. The 100 most frequent words of the Quran
            account for about {pct100}% of its {num(total)} words; here are the first {top.length}.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {top.map((w) => (
              <li key={w.id}>
                <Link
                  to={wordPath(w.id)}
                  className="flex h-full items-center justify-between gap-3 rounded-[1.25rem] border-2 border-b-4 bg-card px-4 py-3 transition-colors hover:border-primary/40"
                >
                  <span className="min-w-0">
                    <span className="block font-extrabold">{w.meaning}</span>
                    <span className="block text-sm text-muted-foreground">
                      {w.transliteration} · {num(w.frequency)}×
                    </span>
                  </span>
                  <span className="shrink-0 font-quran text-2xl leading-[1.9]" lang="ar" dir="rtl">
                    {w.arabic}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to={reviewWordsUrl(reviewIds)} onClick={() => track('cta_click', { cta: 'review_top_words', location: 'taraweeh_words' })}>
                <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                Learn the top {reviewIds.length}
              </Link>
            </Button>
            <Link to={PILLAR_PATHS.commonWords} className={`${inlineLink} inline-flex min-h-11 items-center`}>
              Most common words in the Quran
            </Link>
          </div>
        </section>

        <section aria-labelledby="recite-heading" className="mt-12 max-w-3xl">
          <h2 id="recite-heading" className="mb-3 text-xl font-extrabold">
            “Recite what is easy of the Quran”
          </h2>
          <p className="mb-4 text-[17px] leading-relaxed">
            The last ayah of Surah Al-Muzzammil speaks of the Prophet and his companions standing two thirds, half or a third
            of the night, and makes it easy: recite what you can.
          </p>
          <PhraseVerseCard verse={RAMADAN_VERSES['night-recital']} />
        </section>

        <FaqSection id="faq-heading" title="Questions about taraweeh" items={faq} />

        <MoreForRamadan current={PATH} />

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Quran text: Tanzil Uthmani, checked word by word against the Quranic Arabic Corpus, which also gives the word
          counts. Translation: Saheeh International. Recitation: Mishary Alafasy (Quran.com).
        </p>
      </div>
    </>
  );
};

export default Taraweeh;
