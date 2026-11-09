import React from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import PhraseVerseCard from '@/components/phrases/PhraseVerseCard';
import { ArrowLink, FaqSection, MoreForRamadan, RamadanWordCard, inlineLink } from '@/components/ramadan/RamadanBits';
import { Button } from '@/components/ui/button';
import { reviewWordsUrl } from '@/components/review/review-session';
import { track } from '@/lib/analytics';
import { getWordById } from '@/utils/vocabulary';
import { faqLd } from '@/utils/seo-pillars';
import { RAMADAN_HUB_PATH, RAMADAN_PATHS, itikafSeo } from '@/utils/seo-ramadan';
import { RAMADAN_LEMMAS, RAMADAN_ROOTS, RAMADAN_VERSES } from '@/utils/generated/ramadan';

const PATH = RAMADAN_PATHS.itikaf;

const Itikaf = () => {
  const root = RAMADAN_ROOTS['e-k-f'];
  const akif = RAMADAN_LEMMAS.akif;
  const seo = itikafSeo(root.total);
  const reviewIds = ['akif', 'siyam', 'laylah', 'qadr'].filter((id) => !!getWordById(id));

  const faq = [
    {
      q: 'What does itikaf mean?',
      a: 'Iʿtikāf (اعتكاف) means staying in one place devoted to something. In Islam it is staying in the mosque for a period with the intention of worship: prayer, Quran, dhikr and duʿāʾ, away from ordinary business.',
    },
    {
      q: 'Is itikaf in the Quran?',
      a: `The noun iʿtikāf is not, but its root ع ك ف is, ${root.total} times. In 2:187 the Quran speaks of those “staying for worship in the mosques” (ʿākifūna fī l-masājid), and in 2:125 of those who stay at the Kaʿbah for worship.`,
    },
    {
      q: 'When is itikaf done?',
      a: 'It can be done at any time, but it is best known in the last ten days of Ramadan: the Prophet used to make iʿtikāf in the last ten days of Ramadan (Sahih al-Bukhari, Sahih Muslim), the days in which Laylat al-Qadr is sought.',
    },
  ];

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={PATH}
        keywords={['itikaf', 'itikaf meaning', 'i’tikaf', 'what is itikaf', 'itikaf in Ramadan', 'itikaf in the Quran', 'last ten nights of Ramadan']}
        breadcrumbs={[
          { name: 'Ramadan', path: RAMADAN_HUB_PATH },
          { name: 'Iʿtikaf', path: PATH },
        ]}
        jsonLd={[faqLd(PATH, faq)]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Ramadan', path: RAMADAN_HUB_PATH }, { name: 'Iʿtikaf', path: PATH }]} />

        <div className="card-tactile mb-10 flex flex-col gap-6 rounded-[2rem] p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <header className="min-w-0 flex-1">
            <span className="inline-block rounded-full bg-gold/25 px-3 py-1.5 text-[13px] font-bold text-gold-text">The last ten days of Ramadan</span>
            <p className="mt-4 font-quran text-5xl leading-[1.9] text-primary sm:text-6xl sm:leading-[1.9]" lang="ar" dir="rtl">
              اعْتِكَاف
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Itikaf Meaning: Staying in the Mosque for Worship</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              Iʿtikāf is spending days and nights in the mosque devoted to worship, best known in the last ten days of
              Ramadan. Its root, ع ك ف, means to stay devoted to something, and the Quran uses it in 2:187.
            </p>
          </header>
          <section aria-label="Learn the words" className="flex w-full flex-col gap-3 rounded-3xl bg-background p-5 sm:p-6 lg:max-w-sm">
            <Button asChild size="lg" className="h-auto min-h-14 w-full whitespace-normal py-3">
              <Link to={reviewWordsUrl(reviewIds)} onClick={() => track('cta_click', { cta: 'review_itikaf_words', location: 'itikaf_hero' })}>
                <Target className="mr-2 h-4 w-4" aria-hidden="true" />
                Learn {reviewIds.length} words of the last ten nights
              </Link>
            </Button>
            <div className="flex flex-col gap-1 border-t pt-3">
              <ArrowLink to={RAMADAN_PATHS.laylatulQadr}>Laylatul Qadr</ArrowLink>
            </div>
          </section>
        </div>

        <section aria-labelledby="meaning-heading" className="max-w-3xl">
          <h2 id="meaning-heading" className="mb-3 text-xl font-extrabold">
            What does itikaf mean?
          </h2>
          <div className="space-y-3 text-[17px] leading-relaxed">
            <p>
              <strong>Iʿtikāf</strong> (اعتكاف) is a verbal noun from the root{' '}
              <Link to="/root/e-k-f" className={inlineLink}>
                <span className="font-arabic" lang="ar" dir="rtl">ع ك ف</span>
              </Link>
              : to keep to something and stay devoted to it. The person in iʿtikāf is a <strong>muʿtakif</strong>; the
              Quran’s word for those who stay devoted is <strong>ʿākif</strong> (plural ʿākifūn), which occurs {akif.count}{' '}
              times.
            </p>
            <p>
              The root itself is neutral: the Quran also uses it for people devoted to idols, as when Ibrahim asks his people
              “What are these statues to which you are devoted?” (21:52). Iʿtikāf turns that devotion to Allah alone, in His
              house.
            </p>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            <RamadanWordCard w={akif} gloss="devoted, staying (in worship)" />
          </ul>
        </section>

        <section aria-labelledby="quran-heading" className="mt-12 max-w-3xl">
          <h2 id="quran-heading" className="mb-3 text-xl font-extrabold">
            Itikaf in the Quran
          </h2>
          <p className="mb-4 text-[17px] leading-relaxed">
            In the verse about the nights of fasting, the Quran sets a rule for those in iʿtikāf: “do not have relations with
            them [your wives] as long as you are staying for worship in the mosques”.
          </p>
          <PhraseVerseCard verse={RAMADAN_VERSES['itikaf-masjid']} />
          <p className="my-4 text-[17px] leading-relaxed">
            And Ibrahim and Ismaʿil are told to purify the House for those who circle it, those who stay there for worship
            and those who bow and prostrate:
          </p>
          <PhraseVerseCard verse={RAMADAN_VERSES['itikaf-house']} />
        </section>

        <section aria-labelledby="when-heading" className="mt-12 max-w-3xl">
          <h2 id="when-heading" className="mb-3 text-xl font-extrabold">
            Itikaf in Ramadan
          </h2>
          <p className="text-[17px] leading-relaxed">
            The Prophet used to make iʿtikāf in the last ten days of Ramadan (Sahih al-Bukhari, Sahih Muslim), the days in
            which{' '}
            <Link to={RAMADAN_PATHS.laylatulQadr} className={inlineLink}>
              Laylatul Qadr
            </Link>{' '}
            is sought, and many Muslims follow that practice today. The details, such as how long it lasts and when one may
            leave the mosque, differ between the schools of Islamic law; your local mosque can explain its arrangements.
          </p>
        </section>

        <FaqSection id="faq-heading" title="Questions about itikaf" items={faq} />

        <MoreForRamadan current={PATH} />

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Quran text: Tanzil Uthmani, checked word by word against the Quranic Arabic Corpus, which also gives the word
          counts. Translation: Saheeh International. Recitation: Mishary Alafasy (Quran.com).
        </p>
      </div>
    </>
  );
};

export default Itikaf;
