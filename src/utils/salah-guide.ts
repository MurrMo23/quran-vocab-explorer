// /salah-words: what is said in the prayer, in order. The Quranic parts (Al-Fatiha, the short surahs and
// the verses each phrase echoes) come from src/utils/generated/topics.ts, checked against the corpus.
// The phrases below that are not Quran are given in their standard, most widely used wording; the
// schools of law differ in small details (which opening supplication, some words of the tashahhud,
// what is said aloud), so the page says so instead of picking a side or citing narrations.

export const SALAH_WORDS_PATH = '/salah-words';

export interface SalahStep {
  id: string;
  /** Position in the prayer, e.g. "Bowing (rukūʿ)". */
  position: string;
  ar: string;
  tr: string;
  en: string;
  /** 'quran': recited from the Quran; 'said': the standard words of the prayer (not a verse). */
  kind: 'quran' | 'said';
  /** When and how often it is said. */
  when: string;
  note?: string;
  /** Key in SALAH_RELATED_VERSES of a verse that uses the same words or command. */
  verse?: string;
  verseNote?: string;
  /** /phrases/<slug> page for this phrase. */
  phrase?: string;
  /** Site words in the phrase (missing ids are skipped). */
  words: string[];
  /** Whole surahs shown after this step (keys of SALAH_SURAH_VERSES). */
  surahs?: number[];
}

export const SALAH_STEPS: SalahStep[] = [
  {
    id: 'takbir',
    position: 'Opening takbīr, standing',
    ar: 'ٱللَّهُ أَكْبَرُ',
    tr: 'Allāhu akbar',
    en: 'Allah is the Greatest',
    kind: 'said',
    when: 'Said to begin the prayer (takbīrat al-iḥrām), raising the hands, and again on moving into each new position.',
    verse: 'takbir',
    verseNote: 'Not a verse itself; the Quran commands magnifying Allah (takbīr) in these words:',
    phrase: 'allahu-akbar',
    words: ['allah', 'al-kabir'],
  },
  {
    id: 'thana',
    position: 'Opening supplication (thanāʾ)',
    ar: 'سُبْحَانَكَ ٱللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ ٱسْمُكَ، وَتَعَالَىٰ جَدُّكَ، وَلَا إِلَٰهَ غَيْرُكَ',
    tr: 'Subḥānaka-llāhumma wa bi-ḥamdik, wa tabāraka-smuk, wa taʿālā jadduk, wa lā ilāha ghayruk',
    en: 'Glory be to You, O Allah, and with Your praise. Blessed is Your name, exalted is Your majesty, and there is no god but You.',
    kind: 'said',
    when: 'Said quietly after the opening takbīr, in the first rakʿah only.',
    note: 'Several opening supplications are taught; this is the most widely used. It is recommended rather than required, and some schools do not say one.',
    words: ['at-tasbih', 'hamd', '115', 'ghayr', 'allah'],
  },
  {
    id: 'taawwudh',
    position: 'Seeking refuge (taʿawwudh)',
    ar: 'أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيْطَانِ ٱلرَّجِيمِ',
    tr: 'Aʿūdhu bi-llāhi mina sh-shayṭāni r-rajīm',
    en: 'I seek refuge in Allah from Satan, the outcast',
    kind: 'said',
    when: 'Said quietly before reciting the Quran.',
    verse: 'taawwudh',
    verseNote: 'The Quran says to seek refuge before reciting it:',
    words: ['allah', 'ash-shayateen'],
  },
  {
    id: 'fatiha',
    position: 'Al-Fatiha, standing',
    ar: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    tr: 'Bismi-llāhi r-raḥmāni r-raḥīm',
    en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful',
    kind: 'quran',
    when: 'Al-Fatiha, the opening surah, is recited in every rakʿah (unit) of every prayer. Here it is word by word.',
    phrase: 'bismillah',
    words: ['bismillah-ir-rahman-ir-raheem', 'al-hamdu-lillahi-rabbil-alameen'],
    surahs: [1],
  },
  {
    id: 'amin',
    position: 'After Al-Fatiha',
    ar: 'آمِين',
    tr: 'Āmīn',
    en: 'O Allah, answer [our prayer]',
    kind: 'said',
    when: 'Said at the end of Al-Fatiha, aloud in the prayers recited aloud in many schools.',
    phrase: 'ameen',
    words: [],
  },
  {
    id: 'surah',
    position: 'A short surah, standing',
    ar: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
    tr: 'Qul huwa-llāhu aḥad',
    en: 'Say, “He is Allah, [who is] One”',
    kind: 'quran',
    when: 'In the first two rakʿahs, another passage of the Quran follows Al-Fatiha, often one of the short surahs of Juz Amma. Four that are often recited are below, word by word.',
    words: [],
    surahs: [112, 108, 103, 110],
  },
  {
    id: 'ruku',
    position: 'Bowing (rukūʿ)',
    ar: 'سُبْحَانَ رَبِّيَ ٱلْعَظِيمِ',
    tr: 'Subḥāna rabbiya l-ʿaẓīm',
    en: 'Glory be to my Lord, the Most Great',
    kind: 'said',
    when: 'Said in the bowing position, usually three times.',
    verse: 'ruku',
    verseNote: 'It echoes the command in Surah Al-Waqiʿah:',
    words: ['at-tasbih', 'rabb', 'al-azeem'],
  },
  {
    id: 'rising',
    position: 'Rising from bowing',
    ar: 'سَمِعَ ٱللَّهُ لِمَنْ حَمِدَهُ',
    tr: 'Samiʿa-llāhu li-man ḥamidah',
    en: 'Allah hears the one who praises Him',
    kind: 'said',
    when: 'Said while rising from the bowing position.',
    words: ['samia', 'allah', 'hamd'],
  },
  {
    id: 'standing',
    position: 'Standing after bowing',
    ar: 'رَبَّنَا وَلَكَ ٱلْحَمْدُ',
    tr: 'Rabbanā wa laka l-ḥamd',
    en: 'Our Lord, and to You belongs [all] praise',
    kind: 'said',
    when: 'Said once upright. “Rabbanā laka l-ḥamd”, without wa, is also used.',
    words: ['rabb', 'hamd'],
  },
  {
    id: 'sujud',
    position: 'Prostration (sujūd)',
    ar: 'سُبْحَانَ رَبِّيَ ٱلْأَعْلَىٰ',
    tr: 'Subḥāna rabbiya l-aʿlā',
    en: 'Glory be to my Lord, the Most High',
    kind: 'said',
    when: 'Said in each prostration, usually three times. There are two prostrations in every rakʿah.',
    verse: 'sujud',
    verseNote: 'It echoes the opening of Surah Al-Aʿla:',
    words: ['at-tasbih', 'rabb', '56'],
  },
  {
    id: 'sitting',
    position: 'Sitting between the prostrations',
    ar: 'رَبِّ ٱغْفِرْ لِي',
    tr: 'Rabbi-ghfir lī',
    en: 'My Lord, forgive me',
    kind: 'said',
    when: 'Said while sitting between the two prostrations.',
    verse: 'sitting',
    verseNote: 'The same words open the supplication of Nuh:',
    words: ['rabb', 'al-maghfirah', 'al-ghafoor'],
  },
  {
    id: 'tashahhud',
    position: 'Sitting: the tashahhud',
    ar: 'ٱلتَّحِيَّاتُ لِلَّهِ وَٱلصَّلَوَاتُ وَٱلطَّيِّبَاتُ، ٱلسَّلَامُ عَلَيْكَ أَيُّهَا ٱلنَّبِيُّ وَرَحْمَةُ ٱللَّهِ وَبَرَكَاتُهُ، ٱلسَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ ٱللَّهِ ٱلصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    tr: 'At-taḥiyyātu li-llāhi wa ṣ-ṣalawātu wa ṭ-ṭayyibāt. As-salāmu ʿalayka ayyuha n-nabiyyu wa raḥmatu-llāhi wa barakātuh. As-salāmu ʿalaynā wa ʿalā ʿibādi-llāhi ṣ-ṣāliḥīn. Ashhadu an lā ilāha illa-llāh, wa ashhadu anna Muḥammadan ʿabduhū wa rasūluh.',
    en: 'All greetings, prayers and good things are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and messenger.',
    kind: 'said',
    when: 'Said in the sitting after the second rakʿah and in the final sitting. In the final sitting it is followed by the prayer for the Prophet (aṣ-ṣalāh al-Ibrāhīmiyyah), asking Allah to bless Muhammad as He blessed Ibrahim.',
    note: 'This is the most widely used wording; the schools use close variants.',
    phrase: 'la-ilaha-illallah',
    words: ['an-nabi', '2', 'abd', 'ar-rasul', 'la-ilaha-illa-allah', 'muhammad', 'allah'],
  },
  {
    id: 'taslim',
    position: 'Closing: the taslīm',
    ar: 'ٱلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللَّهِ',
    tr: 'As-salāmu ʿalaykum wa raḥmatu-llāh',
    en: 'Peace be upon you and the mercy of Allah',
    kind: 'said',
    when: 'Said turning the head to the right, then to the left, to end the prayer.',
    phrase: 'assalamu-alaikum',
    words: ['2', 'allah'],
  },
];
