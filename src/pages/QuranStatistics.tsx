import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { getSurahSummaries, getSurahSummary, juzOf, surahPath, wordPath, type SurahSummary } from '@/utils/quran-pages';
import { getWordById } from '@/utils/vocabulary';
import { AHMAD_REFS, MUHAMMAD_REFS, NAME_MENTIONS, QURAN_STATS, SURAH_TYPES, TOP_WORD_IDS } from '@/utils/generated/pillars';
import { PILLAR_PATHS, faqLd, quranStatsSeo } from '@/utils/seo-pillars';

const PATH = PILLAR_PATHS.stats;
const num = (n: number) => n.toLocaleString('en-US');
const ref = (r: readonly number[]) => `${r[0]}:${r[1]}`;
const surahLabel = (s: SurahSummary | undefined) => (s ? `${s.name} (${s.number})` : '');

const QuranStatistics = () => {
  const st = QURAN_STATS;
  const juz = juzOf(114, getSurahSummary(114)?.ayahs ?? 1);
  const surahs = getSurahSummaries();
  const longest = getSurahSummary(st.longestSurah);
  const fewest = getSurahSummary(st.fewestWordsSurah);
  const shortest3 = st.shortestSurahsByAyahs.map((n) => getSurahSummary(n)).filter((s): s is SurahSummary => !!s);
  const mention = (key: string) => NAME_MENTIONS.find((m) => m.key === key);
  const isa = mention('isa');
  const masih = mention('masih');
  const musa = mention('musa');
  const allah = mention('allah');
  const muhammad = mention('muhammad');
  const topWords = TOP_WORD_IDS.slice(0, 5).map((id) => getWordById(id)).filter((w) => !!w);
  const seo = quranStatsSeo({ surahs: st.surahs, ayahs: st.ayahs, words: st.words, juz, pages: st.pages });

  const tiles: { value: string; label: string; note: string }[] = [
    { value: num(st.surahs), label: 'Surahs', note: 'chapters' },
    { value: num(st.ayahs), label: 'Ayahs', note: 'verses' },
    { value: num(st.words), label: 'Words', note: 'as divided by the Quranic Arabic Corpus' },
    { value: num(juz), label: 'Juz', note: 'equal reading parts' },
    { value: num(st.pages), label: 'Pages', note: 'in the standard Madani mushaf' },
    { value: `${st.meccan} / ${st.medinan}`, label: 'Meccan / Medinan', note: 'surahs' },
    { value: num(st.roots), label: 'Roots', note: 'Arabic root words' },
    { value: num(st.lemmas), label: 'Different words', note: 'dictionary forms (lemmas)' },
  ];

  const faq: { q: string; a: string }[] = [
    { q: 'How many surahs are in the Quran?', a: `The Quran has ${st.surahs} surahs (chapters), from Al-Fatihah (1) to An-Nas (114).` },
    {
      q: 'How many ayahs (verses) are in the Quran?',
      a: `${num(st.ayahs)} ayahs, in the numbering used by most printed mushafs today (the Kufan count, as in the Tanzil text). It counts the basmala as an ayah only in Al-Fatihah. Other early counting traditions divide some verses differently, so slightly different totals exist.`,
    },
    {
      q: 'How many words are in the Quran?',
      a: `${num(st.words)} words, as the Quranic Arabic Corpus divides the text: each written word counts once, with prefixes such as “wa” (and) and attached pronouns counted as part of their word. Counts that split or join words differently give slightly different totals.`,
    },
    { q: 'How many juz are in the Quran?', a: `${juz} juz. Juz Amma, the 30th, holds the short surahs 78–114.` },
    {
      q: 'How many pages are in the Quran?',
      a: `${st.pages} pages in the standard 15-line Madani mushaf. Other printings have a different number of pages.`,
    },
    {
      q: 'What is the shortest surah in the Quran?',
      a: `${fewest ? `Surah ${fewest.name} (${fewest.number})` : ''}: ${st.shortestSurahAyahs} ayahs and ${st.fewestWords} words. ${shortest3
        .filter((s) => s.number !== st.fewestWordsSurah)
        .map((s) => `${s.name} (${s.number}, ${s.totalWords} words)`)
        .join(' and ')} also have ${st.shortestSurahAyahs} ayahs, but more words.`,
    },
    {
      q: 'What is the longest surah in the Quran?',
      a: `Surah ${longest?.name ?? ''} (${st.longestSurah}): ${st.longestSurahAyahs} ayahs and ${num(st.longestSurahWords)} words.`,
    },
    {
      q: 'What is the longest ayah in the Quran?',
      a: `Ayah ${ref(st.longestAyah)}, in Surah Al-Baqarah, about recording debts in writing: ${st.longestAyahWords} words.`,
    },
    {
      q: 'How many times is Jesus mentioned in the Quran?',
      a: `By the name ʿĪsā (Jesus), ${isa?.count} times. He is also called al-Masīḥ (the Messiah) ${masih?.count} times, often in the same verse as his name, and is often called “son of Maryam”.`,
    },
    {
      q: 'How many times is Muhammad mentioned in the Quran?',
      a: `By the name Muhammad ${muhammad?.count} times (${MUHAMMAD_REFS.map(ref).join(', ')}), and once as Aḥmad (${AHMAD_REFS.map(ref).join(', ')}). Elsewhere he is addressed as “O Prophet” or “O Messenger”, or simply “you”.`,
    },
    { q: 'How many times is Moses mentioned in the Quran?', a: `By the name Mūsā (Moses), ${musa?.count} times: more than any other prophet.` },
    {
      q: 'How many times is the word Allah in the Quran?',
      a: `${num(allah?.count ?? 0)} times, counting every form of the word (such as lillāh, “for Allah”) and the basmala of Al-Fatihah, but not the unnumbered basmala at the head of the other surahs.`,
    },
    {
      q: 'How many surahs are Meccan and how many Medinan?',
      a: `${st.meccan} Meccan and ${st.medinan} Medinan, in the classification used by the Tanzil project. Scholars differ on a few surahs.`,
    },
    {
      q: 'Which surah does not begin with Bismillah?',
      a: 'Surah At-Tawbah (9). Every other surah opens with the basmala, and it also appears inside Surah An-Naml (27:30), so it occurs 114 times in all.',
    },
    { q: 'How many books are in the Quran?', a: `The Quran is one book. It is divided into ${st.surahs} surahs, and for reading into ${juz} juz.` },
  ];

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        url={PATH}
        keywords={['Quran statistics', 'how many surahs in the Quran', 'how many verses in the Quran', 'how many words in the Quran', 'Quran facts']}
        breadcrumbs={[{ name: 'Quran statistics', path: PATH }]}
        jsonLd={[faqLd(PATH, faq)]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <PageTrail items={[{ name: 'Quran statistics', path: PATH }]} />

        <header className="card-tactile mb-8 rounded-[2rem] p-6 sm:p-9">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Quran Statistics: The Quran in Numbers</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
            How many surahs, ayahs and words the Quran has, its longest and shortest surahs, and how often key names occur.
            Every number here is counted from the Quran’s text and word data, and each one says how it was counted.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="flex flex-col rounded-[1.25rem] bg-background p-4">
                <dt className="order-2 text-sm font-bold">
                  {t.label}
                  <span className="block text-xs font-normal text-muted-foreground">{t.note}</span>
                </dt>
                <dd className="order-1 text-2xl font-extrabold tabular-nums text-primary sm:text-3xl">{t.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section aria-labelledby="records-heading">
          <h2 id="records-heading" className="mb-3 text-xl font-extrabold">
            Longest and shortest
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <li className="rounded-[1.375rem] border-2 border-b-4 bg-card p-5">
              <p className="text-sm font-bold text-muted-foreground">Longest surah</p>
              <Link to={surahPath(st.longestSurah)} className="mt-1 block text-lg font-extrabold text-primary underline-offset-4 hover:underline">
                {surahLabel(longest)}
              </Link>
              <p className="text-sm">
                {st.longestSurahAyahs} ayahs · {num(st.longestSurahWords)} words
              </p>
            </li>
            <li className="rounded-[1.375rem] border-2 border-b-4 bg-card p-5">
              <p className="text-sm font-bold text-muted-foreground">Shortest surah</p>
              <Link to={surahPath(st.fewestWordsSurah)} className="mt-1 block text-lg font-extrabold text-primary underline-offset-4 hover:underline">
                {surahLabel(fewest)}
              </Link>
              <p className="text-sm">
                {st.shortestSurahAyahs} ayahs · {st.fewestWords} words
              </p>
            </li>
            <li className="rounded-[1.375rem] border-2 border-b-4 bg-card p-5">
              <p className="text-sm font-bold text-muted-foreground">Longest ayah</p>
              <Link to={surahPath(st.longestAyah[0])} className="mt-1 block text-lg font-extrabold text-primary underline-offset-4 hover:underline">
                Al-Baqarah {ref(st.longestAyah)}
              </Link>
              <p className="text-sm">{st.longestAyahWords} words</p>
            </li>
            <li className="rounded-[1.375rem] border-2 border-b-4 bg-card p-5">
              <p className="text-sm font-bold text-muted-foreground">One-word ayahs</p>
              <p className="mt-1 text-lg font-extrabold">{st.oneWordAyahs} ayahs</p>
              <p className="text-sm">
                e.g. <span lang="ar" dir="rtl" className="font-quran text-lg">مُدْهَآمَّتَانِ</span> (55:64) and the opening letters{' '}
                <span lang="ar" dir="rtl" className="font-quran text-lg">طه</span> (20:1)
              </p>
            </li>
          </ul>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            {st.initialsSurahs} surahs open with “disconnected letters” (al-ḥurūf al-muqaṭṭaʿāt) such as Alif Lām Mīm. Three
            surahs have only {st.shortestSurahAyahs} ayahs: {shortest3.map((s) => `${s.name} (${s.number})`).join(', ')}.
          </p>
        </section>

        <section aria-labelledby="names-heading" className="mt-10">
          <h2 id="names-heading" className="mb-1 text-xl font-extrabold">
            How many times names are mentioned
          </h2>
          <p className="mb-3 max-w-3xl text-sm text-muted-foreground">
            Each count is the number of times the name itself occurs, in any grammatical form. Pronouns and titles that refer
            to the same person (“he”, “the Prophet”) are not counted.
          </p>
          <div className="overflow-x-auto rounded-[1.375rem] border bg-card">
            <table className="w-full min-w-[20rem] text-left text-[15px]">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-bold">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Arabic
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">
                    Times
                  </th>
                </tr>
              </thead>
              <tbody>
                {NAME_MENTIONS.map((m) => (
                  <tr key={m.key} className="border-b last:border-0">
                    <th scope="row" className="px-4 py-2.5 font-bold">
                      {m.wordId && getWordById(m.wordId) ? (
                        <Link to={wordPath(m.wordId)} className="text-primary underline-offset-4 hover:underline">
                          {m.label}
                        </Link>
                      ) : (
                        m.label
                      )}
                    </th>
                    <td className="px-4 py-2.5 font-arabic text-lg" lang="ar" dir="rtl">
                      {m.ar}
                    </td>
                    <td className="px-4 py-2.5 text-right font-extrabold tabular-nums">{num(m.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="words-heading" className="mt-10 max-w-3xl">
          <h2 id="words-heading" className="mb-2 text-xl font-extrabold">
            The most frequent words
          </h2>
          <p className="text-[17px] leading-relaxed">
            The most frequent words are short and everywhere:{' '}
            {topWords.map((w, i) => (
              <React.Fragment key={w!.id}>
                {i > 0 && ', '}
                <Link to={wordPath(w!.id)} className="font-bold text-primary underline-offset-4 hover:underline">
                  {w!.transliteration}
                </Link>{' '}
                “{w!.meaning.split(/[;,]/)[0]}”
              </React.Fragment>
            ))}
            . See the{' '}
            <Link to={PILLAR_PATHS.commonWords} className="font-bold text-primary underline-offset-4 hover:underline">
              100 most common words in the Quran
            </Link>{' '}
            and how much of the text they cover.
          </p>
        </section>

        <section aria-labelledby="surahs-heading" className="mt-10">
          <h2 id="surahs-heading" className="mb-3 text-xl font-extrabold">
            Ayahs and words in every surah
          </h2>
          <div className="max-h-[36rem] overflow-auto rounded-[1.375rem] border bg-card">
            <table className="w-full min-w-[22rem] text-left text-[15px]">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b text-sm text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-bold">
                    Surah
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">
                    Ayahs
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">
                    Words
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-bold sm:table-cell">
                    Revealed
                  </th>
                </tr>
              </thead>
              <tbody>
                {surahs.map((s) => (
                  <tr key={s.number} className="border-b last:border-0">
                    <th scope="row" className="px-4 py-2 font-bold">
                      <Link to={surahPath(s.number)} className="text-primary underline-offset-4 hover:underline">
                        {s.number}. {s.name}
                      </Link>
                    </th>
                    <td className="px-4 py-2 text-right tabular-nums">{s.ayahs}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{num(s.totalWords)}</td>
                    <td className="hidden px-4 py-2 sm:table-cell">{SURAH_TYPES[s.number - 1] === 'd' ? 'Medinan' : 'Meccan'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="mt-10 max-w-3xl">
          <h2 id="faq-heading" className="mb-3 text-xl font-extrabold">
            Questions and answers
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

        <section aria-labelledby="method-heading" className="mt-10 max-w-3xl">
          <h2 id="method-heading" className="mb-2 text-xl font-extrabold">
            Sources and how we counted
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Surahs, ayahs and their text: the Tanzil Uthmani text (Kufan numbering).</li>
            <li>
              Words, dictionary forms, roots and name counts: the Quranic Arabic Corpus (version 0.4). A word is a written
              word; its prefixes and attached pronouns are part of it. The unnumbered basmala at the head of surahs 2–114 is
              not counted.
            </li>
            <li>Meccan and Medinan: the classification in Tanzil’s metadata.</li>
            <li>Pages: the {st.pages} pages of the Madani mushaf, as listed in the word-by-word page data we use. Juz: the standard {juz} divisions.</li>
          </ul>
          <p className="mt-4 text-sm">
            Keep exploring:{' '}
            <Link to="/surahs" className="font-bold text-primary underline-offset-4 hover:underline">
              word lists for every surah
            </Link>
            ,{' '}
            <Link to={PILLAR_PATHS.juzAmma} className="font-bold text-primary underline-offset-4 hover:underline">
              Juz Amma vocabulary
            </Link>
            ,{' '}
            <Link to="/roots" className="font-bold text-primary underline-offset-4 hover:underline">
              Quranic roots
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
};

export default QuranStatistics;
