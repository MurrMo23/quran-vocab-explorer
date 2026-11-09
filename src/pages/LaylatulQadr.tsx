import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import PhraseVerseCard from '@/components/phrases/PhraseVerseCard';
import WordByWordAyah from '@/components/topics/WordByWordAyah';
import { ArrowLink, FaqSection, MoreForRamadan, RamadanWordCard, inlineLink } from '@/components/ramadan/RamadanBits';
import { Button } from '@/components/ui/button';
import { reviewWordsUrl } from '@/components/review/review-session';
import { track } from '@/lib/analytics';
import { RAMADAN_START_LABEL, formatPlanDate, ramadanDayDate } from '@/lib/ramadan-plan';
import { getWordById } from '@/utils/vocabulary';
import { getPhrase, phrasePath } from '@/utils/phrases';
import { surahPath } from '@/utils/quran-pages';
import { faqLd } from '@/utils/seo-pillars';
import { RAMADAN_HUB_PATH, RAMADAN_PATHS, laylatulQadrSeo } from '@/utils/seo-ramadan';
import { LAYLATUL_QADR_REFS, QADR_SURAH, QADR_WORDS, RAMADAN_LEMMAS, RAMADAN_VERSES } from '@/utils/generated/ramadan';

const PATH = RAMADAN_PATHS.laylatulQadr;
const DUA_SLUG = 'allahumma-innaka-afuwwun';

/** The evening a Ramadan night begins: night n starts at sunset before fasting day n. */
const nightStart = (n: number) => formatPlanDate(ramadanDayDate(n - 1));

const LaylatulQadr = () => {
  const seo = laylatulQadrSeo();
  const dua = getPhrase(DUA_SLUG);
  const qadr = RAMADAN_LEMMAS.qadr;
  // 97:3 begins with the two words of the name, as written in the mushaf.
  const nameAr = QADR_SURAH[2].ar.slice(0, 2).join(' ');
  const surahEn = QADR_SURAH.map((v) => (/[.?!"”]$/.test(v.en) ? v.en : `${v.en}.`)).join(' ');
  const reviewIds = [...new Set(QADR_WORDS.map((w) => w.wordId).filter((id): id is string => !!id && !!getWordById(id)))];
  const refs = LAYLATUL_QADR_REFS.map(([s, a]) => `${s}:${a}`).join(', ');

  const faq = [
    {
      q: 'What does Laylatul Qadr mean?',
      a: 'Laylat al-Qadr (لَيْلَةُ الْقَدْرِ) means “the Night of Decree”, also translated “the Night of Power”. Laylah is “night”; qadr means decree and measure, and also value and honour. It is the night the Quran was first sent down, and the night in which “every precise matter is made distinct” (44:4).',
    },
    {
      q: 'Is Laylatul Qadr in the Quran?',
      a: `Yes. The name laylat al-qadr occurs three times, all in Surah Al-Qadr (${refs}), and Surah Ad-Dukhan calls the same night “a blessed night” (44:3).`,
    },
    {
      q: 'When is Laylatul Qadr in 2027?',
      a: `It is sought in the last ten nights of Ramadan, especially the odd nights. If Ramadan 2027 begins around ${RAMADAN_START_LABEL}, the last ten nights would start around the evening of ${nightStart(21)} and the 27th night would fall around the evening of ${nightStart(27)}. These dates depend on the sighting of the moon and may differ by a day where you live; the exact night is not known.`,
    },
    {
      q: 'Why is Laylatul Qadr better than a thousand months?',
      a: 'The Quran says so in Surah Al-Qadr: “The Night of Decree is better than a thousand months” (97:3). A thousand months is more than 83 years, longer than most lifetimes.',
    },
    {
      q: 'What dua should I say on Laylatul Qadr?',
      a: 'Allāhumma innaka ʿafuwwun tuḥibbu l-ʿafwa faʿfu ʿannī: “O Allah, You are Pardoning and You love to pardon, so pardon me.” The Prophet taught it to ʿĀʾishah for this night (recorded by at-Tirmidhi).',
    },
  ];

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={PATH}
        keywords={['Laylatul Qadr', 'Laylat al-Qadr meaning', 'Night of Decree', 'Night of Power', 'Surah Qadr in English', 'Surah Al-Qadr', 'Laylatul Qadr 2027', 'Laylatul Qadr dua']}
        breadcrumbs={[
          { name: 'Ramadan', path: RAMADAN_HUB_PATH },
          { name: 'Laylatul Qadr', path: PATH },
        ]}
        jsonLd={[faqLd(PATH, faq)]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Ramadan', path: RAMADAN_HUB_PATH }, { name: 'Laylatul Qadr', path: PATH }]} />

        <div className="card-tactile mb-10 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <header className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gold/25 px-3 py-1.5 text-[13px] font-bold text-gold-text">The last ten nights of Ramadan</span>
              <span className="rounded-full bg-secondary px-3 py-1.5 text-[13px] font-bold text-secondary-foreground">In the Quran: Surah 97</span>
            </div>
            <p className="mt-4 font-quran text-5xl leading-[1.9] text-primary sm:text-6xl sm:leading-[1.9]" lang="ar" dir="rtl">
              {nameAr}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Laylatul Qadr: The Night of Decree</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              Laylat al-Qadr is the night the Quran was first sent down, “better than a thousand months” (97:3). Here is
              what its name means, Surah Al-Qadr word by word in English with recitation, when the night is sought, and the
              duʿāʾ for it.
            </p>
          </header>

          <section aria-label="Learn the words of Surah Al-Qadr" className="flex w-full flex-col gap-3 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-sm">
            <Button asChild size="lg" className="h-auto min-h-14 w-full whitespace-normal py-3">
              <Link to={reviewWordsUrl(reviewIds)} onClick={() => track('cta_click', { cta: 'review_qadr_words', location: 'laylatul_qadr_hero' })}>
                <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                Learn the {reviewIds.length} key words of Surah Al-Qadr
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">Free flashcards with audio; no account needed.</p>
            <div className="flex flex-col gap-1 border-t pt-3">
              <ArrowLink to={phrasePath(DUA_SLUG)}>Laylatul Qadr dua, word by word</ArrowLink>
              <ArrowLink to={`${RAMADAN_HUB_PATH}#day-27`}>Day 27 of the Ramadan plan</ArrowLink>
            </div>
          </section>
        </div>

        <section aria-labelledby="meaning-heading" className="max-w-3xl">
          <h2 id="meaning-heading" className="mb-3 text-xl font-extrabold">
            What does Laylatul Qadr mean?
          </h2>
          <div className="space-y-3 text-[17px] leading-relaxed">
            <p>
              <strong>Laylah</strong> (لَيْلَة) is “a night”. <strong>Al-qadr</strong> (الْقَدْر) is from the root{' '}
              <Link to="/root/q-d-r" className={inlineLink}>
                <span className="font-arabic" lang="ar" dir="rtl">ق د ر</span>
              </Link>
              , which joins the ideas of measure, decree and power: to determine the measure of a thing. So Laylat al-Qadr is
              translated “the Night of Decree” (Saheeh International, used on this site) and “the Night of Power”. Qadr
              also carries value and honour: a night of great worth.
            </p>
            <p>
              The word qadr occurs {qadr.count} times in the Quran. Surah Ad-Dukhan describes the same night without naming
              it: a blessed night, in which every precise matter is made distinct.
            </p>
          </div>
          <div className="mt-5 grid gap-4">
            <PhraseVerseCard verse={RAMADAN_VERSES['blessed-night']} />
            <PhraseVerseCard verse={RAMADAN_VERSES.decreed} />
          </div>
        </section>

        <section aria-labelledby="surah-heading" className="mt-12">
          <h2 id="surah-heading" className="mb-1 text-xl font-extrabold">
            Surah Al-Qadr in English, word by word
          </h2>
          <p className="mb-4 max-w-3xl text-muted-foreground">
            Surah 97, five ayahs. Press Play on an ayah to hear it recited; each word lights up as it is read.
          </p>
          <div className="grid gap-3">
            {QADR_SURAH.map((v) => (
              <WordByWordAyah key={`${v.s}:${v.a}`} verse={v} />
            ))}
          </div>
          <div className="mt-5 max-w-3xl rounded-[1.375rem] border bg-card p-5">
            <h3 className="font-extrabold">Surah Al-Qadr translation (Saheeh International)</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{surahEn}</p>
            <Link to={surahPath(97)} className={`${inlineLink} mt-3 inline-flex min-h-11 items-center`}>
              Surah Al-Qadr word list
            </Link>
          </div>
        </section>

        <section aria-labelledby="words-heading" className="mt-12">
          <h2 id="words-heading" className="mb-1 text-xl font-extrabold">
            The key words of Surah Al-Qadr
          </h2>
          <p className="mb-4 max-w-3xl text-muted-foreground">
            Learn these and you can follow the whole surah in Arabic. Counts are every occurrence of the word in the Quran.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QADR_WORDS.map((w) => (
              <RamadanWordCard key={w.key} w={w} />
            ))}
          </ul>
          <Button asChild size="lg" className="mt-5">
            <Link to={reviewWordsUrl(reviewIds)} onClick={() => track('cta_click', { cta: 'review_qadr_words', location: 'laylatul_qadr_words' })}>
              <Target className="mr-2 h-4 w-4" aria-hidden="true" />
              Review these words
            </Link>
          </Button>
        </section>

        <section aria-labelledby="when-heading" className="mt-12 max-w-3xl">
          <h2 id="when-heading" className="mb-3 flex items-center gap-2 text-xl font-extrabold">
            <Moon className="h-5 w-5 text-primary" aria-hidden="true" />
            When is Laylatul Qadr?
          </h2>
          <div className="space-y-3 text-[17px] leading-relaxed">
            <p>
              The Quran says the night is in Ramadan, the month in which the Quran was revealed (2:185), but does not say
              which night. The Prophet taught Muslims to seek it in the last ten nights of Ramadan, especially the odd nights:
              the 21st, 23rd, 25th, 27th and 29th (Sahih al-Bukhari). Many Muslims hold that it is most likely the 27th, and
              many spend all ten nights in extra prayer, Quran recitation, duʿāʾ and{' '}
              <Link to={RAMADAN_PATHS.itikaf} className={inlineLink}>
                iʿtikāf
              </Link>
              .
            </p>
            <p>
              An Islamic night begins at sunset, so the 27th night is the evening before the 27th day of fasting.
            </p>
          </div>
          <div className="mt-4 rounded-[1.375rem] border bg-card p-5 text-[15px] leading-relaxed">
            <p className="font-extrabold">Laylatul Qadr 2027: expected dates</p>
            <p className="mt-1 text-muted-foreground">
              If Ramadan 2027 begins around {RAMADAN_START_LABEL}, the last ten nights would begin around the evening of{' '}
              <strong className="text-foreground">{nightStart(21)}</strong>, and the 27th night would fall around the evening of{' '}
              <strong className="text-foreground">{nightStart(27)}</strong> 2027. These are estimates: the start of the month
              depends on the sighting of the moon and can differ by a day between countries, and the exact night of
              Laylat al-Qadr is not known.
            </p>
          </div>
        </section>

        {dua && (
          <section aria-labelledby="dua-heading" className="mt-12 max-w-3xl">
            <h2 id="dua-heading" className="mb-3 text-xl font-extrabold">
              The dua for Laylatul Qadr
            </h2>
            <div className="rounded-[1.375rem] border-2 border-b-4 bg-card p-5 sm:p-6">
              <p className="font-quran text-[1.9rem] leading-[1.9] text-primary sm:text-[2.2rem]" lang="ar" dir="rtl">
                {dua.ar}
              </p>
              <p className="mt-1 italic text-muted-foreground">{dua.tr}</p>
              <p className="mt-1 text-[17px] font-bold">“{dua.meaning}”</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Taught by the Prophet to ʿĀʾishah for this night (recorded by at-Tirmidhi). It is a duʿāʾ from the hadith,
                not a verse of the Quran.
              </p>
              <ArrowLink to={phrasePath(DUA_SLUG)}>The dua word by word</ArrowLink>
            </div>
          </section>
        )}

        <FaqSection id="faq-heading" title="Questions about Laylatul Qadr" items={faq} />

        <MoreForRamadan current={PATH} />

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Quran text: Tanzil Uthmani, checked word by word against the Quranic Arabic Corpus, which also gives the word
          counts. Word-by-word glosses and transliteration: Quran.com. Translation: Saheeh International. Recitation: Mishary
          Alafasy (Quran.com).
        </p>
      </div>
    </>
  );
};

export default LaylatulQadr;
