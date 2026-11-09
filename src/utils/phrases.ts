// Common Islamic phrases (/phrases and /phrases/<slug>). The Arabic, meanings and word breakdowns
// are written here; every verse, verse text, translation and occurrence count shown with them comes
// from src/utils/generated/pillars.ts (scripts/vocab/gen-pillars.py, checked against the corpus).
import { PHRASE_REFS, PHRASE_VERSES, type PhraseVerse } from './generated/pillars';

export const PHRASES_HUB_PATH = '/phrases';
export const phrasePath = (slug: string) => `${PHRASES_HUB_PATH}/${slug}`;

/** One word (or attached particle) of a phrase. */
export interface PhrasePart {
  ar: string;
  tr: string;
  gloss: string;
  /** Site word with this word's meaning (linked and playable). */
  wordId?: string;
  /** Root page slug (/root/<slug>). */
  root?: string;
  /** One short grammar or usage note. */
  note?: string;
}

export interface PhraseLine {
  ar: string;
  tr: string;
  en: string;
}

export interface Phrase {
  slug: string;
  /** The spelling people search for ("Inshallah"). */
  name: string;
  ar: string;
  /** Transliteration with long vowels marked. */
  tr: string;
  /** Other common spellings. */
  variants: string[];
  /** Short meaning, used in the H1 area, cards and meta description. */
  meaning: string;
  /** Shorter meaning for the page title, when `meaning` makes it too long. */
  titleMeaning?: string;
  /** Word-for-word reading of the parts. */
  literal: string;
  parts: PhrasePart[];
  /** Longer forms, replies and related lines. */
  lines?: { label: string; line: PhraseLine }[];
  /** Paragraphs: when and why Muslims say it. */
  usage: string[];
  /** How the phrase relates to the Quran's text (honest about phrases that are not in it). */
  quran: { status: 'exact' | 'related' | 'none'; text: string };
  /** Label for the occurrence list (PHRASE_REFS[refsKey]). */
  refs?: { key: string; label: string }[];
  /** The site's word page for the same phrase, when there is one. */
  wordId?: string;
  related: string[];
  /** Extra Q&A for the page's FAQ (the meaning and Quran questions are added automatically). */
  faq?: { q: string; a: string }[];
}

export const PHRASES: Phrase[] = [
  {
    slug: 'inshallah',
    name: 'Inshallah',
    ar: 'إِنْ شَاءَ اللَّهُ',
    tr: 'in shāʾ Allāh',
    variants: ['Insha Allah', 'In sha Allah', 'InshaAllah', 'Insha’Allah'],
    meaning: 'If Allah wills',
    literal: 'if · (He) willed · Allah',
    parts: [
      { ar: 'إِنْ', tr: 'in', gloss: 'if', wordId: 'in-conditional' },
      {
        ar: 'شَاءَ',
        tr: 'shāʾa',
        gloss: 'willed, wills',
        wordId: 'shaa',
        root: 'sh-y-a',
        note: 'A past-tense verb after إِنْ (“if”) points to the future, so “if Allah willed” means “if Allah wills”.',
      },
      { ar: 'اللَّهُ', tr: 'Allāhu', gloss: 'Allah', wordId: 'allah', root: 'a-l-h' },
    ],
    usage: [
      'Muslims say inshallah when speaking about something they intend or hope to do in the future: “See you tomorrow, inshallah.” It places the outcome with Allah, since no one knows for certain what tomorrow holds.',
      'The habit comes straight from the Quran. In Surah Al-Kahf, Allah tells the Prophet never to say of anything “I will do that tomorrow” without adding “if Allah wills” (18:23–24).',
      'In Arabic it is written as three words: إن شاء الله. Writing it as one word, إنشاء الله, changes the meaning, because إنشاء (inshāʾ) means “creating” or “bringing about”.',
    ],
    quran: {
      status: 'exact',
      text: 'The exact words in shāʾ Allāh occur in the Quran, for example when Yusuf welcomes his family: “Enter Egypt, Allah willing, safe [and secure]” (12:99). Verses 18:23–24 teach the habit itself, using the same verb in another form: illā an yashāʾa Allāh, “except [when adding] if Allah wills”.',
    },
    refs: [{ key: 'inshallah', label: 'Every ayah with إن شاء الله' }],
    wordId: 'in-sha-allah',
    related: ['mashallah', 'wallahi', 'bismillah'],
    faq: [
      {
        q: 'What is the difference between inshallah and mashallah?',
        a: 'Inshallah (“if Allah wills”) is said about the future: plans, hopes and promises. Mashallah (“what Allah has willed”) is said about something good that already exists or has happened.',
      },
    ],
  },
  {
    slug: 'wallahi',
    name: 'Wallahi',
    ar: 'وَاللَّهِ',
    tr: 'wallāhi',
    variants: ['Wallah', 'Wallahy', 'Wallaahi'],
    meaning: 'By Allah (I swear by Allah)',
    literal: 'by · Allah',
    parts: [
      {
        ar: 'وَ',
        tr: 'wa',
        gloss: 'by (oath)',
        note: 'The same letter usually means “and”; before the name it swears by, it is the particle of an oath.',
      },
      {
        ar: 'اللَّهِ',
        tr: 'Allāhi',
        gloss: 'Allah',
        wordId: 'allah',
        root: 'a-l-h',
        note: 'The ending -i (genitive) follows the oath particle.',
      },
    ],
    usage: [
      'Wallahi is an oath: the speaker swears by Allah that what they are saying is true. “Wallah”, without the final vowel, is the same oath in everyday speech.',
      'Because it is an oath by Allah, Muslims are taught to take it seriously. The Quran distinguishes careless, meaningless oaths from deliberate ones, and sets an expiation for breaking a deliberate oath (5:89). It also warns against using an oath by Allah as an excuse not to do good (2:224).',
    ],
    quran: {
      status: 'exact',
      text: 'The form wallāhi occurs once in the Quran, in 6:23, quoting people who will swear on the Day of Judgement “By Allah, our Lord, we were not those who associated”. The oath with the letter tāʾ, tallāhi (“by Allah”), is more frequent: it occurs in 9 ayahs, for example when Ibrahim says “And [I swear] by Allah, I will surely plan against your idols” (21:57).',
    },
    refs: [
      { key: 'wallahi', label: 'وَاللَّهِ (wallāhi)' },
      { key: 'tallahi', label: 'تَاللَّهِ (tallāhi)' },
    ],
    related: ['inshallah', 'astaghfirullah', 'la-ilaha-illallah'],
  },
  {
    slug: 'mashallah',
    name: 'Mashallah',
    ar: 'مَا شَاءَ اللَّهُ',
    tr: 'mā shāʾ Allāh',
    variants: ['Masha Allah', 'Ma sha Allah', 'MashaAllah', 'Masha’Allah'],
    meaning: 'What Allah has willed',
    literal: 'what · (He) willed · Allah',
    parts: [
      { ar: 'مَا', tr: 'mā', gloss: 'what, that which', wordId: 'ma' },
      { ar: 'شَاءَ', tr: 'shāʾa', gloss: 'willed', wordId: 'shaa', root: 'sh-y-a' },
      { ar: 'اللَّهُ', tr: 'Allāhu', gloss: 'Allah', wordId: 'allah', root: 'a-l-h' },
    ],
    usage: [
      'Muslims say mashallah when they see or hear of something good: a newborn, a child’s progress, a beautiful home, someone’s success. It acknowledges that the good thing exists because Allah willed it.',
      'Saying it when praising something ties the praise to Allah rather than to the person or thing, which is why many Muslims say it to show admiration without envy.',
    ],
    quran: {
      status: 'exact',
      text: 'In Surah Al-Kahf, a believer tells the proud owner of two gardens: “Why, when you entered your garden, did you not say, ‘What Allah willed [has occurred]; there is no power except in Allah’?” (18:39). The same words also occur in other verses as illā mā shāʾ Allāh, “except what Allah wills”.',
    },
    refs: [{ key: 'mashallah', label: 'Every ayah with ما شاء الله' }],
    related: ['inshallah', 'subhanallah', 'alhamdulillah'],
    faq: [
      {
        q: 'What is the difference between mashallah and inshallah?',
        a: 'Mashallah is said about something good that already exists or has happened (“what Allah has willed”). Inshallah is said about the future (“if Allah wills”).',
      },
    ],
  },
  {
    slug: 'bismillah',
    name: 'Bismillah',
    ar: 'بِسْمِ اللَّهِ',
    tr: 'bismillāh',
    variants: ['Bismillahi', 'Bismi Allah', 'Bismillahir Rahmanir Rahim'],
    meaning: 'In the name of Allah',
    literal: 'in (the) name (of) · Allah',
    parts: [
      { ar: 'بِ', tr: 'bi', gloss: 'in, with', note: 'A one-letter preposition written joined to the next word.' },
      {
        ar: 'سْمِ',
        tr: 'ism(i)',
        gloss: 'name',
        wordId: '115',
        root: 's-m-w',
        note: 'The word is اسْم (ism); its first alif is not written in بِسْمِ. The linked word page is its plural, asmāʾ (names).',
      },
      { ar: 'اللَّهِ', tr: 'Allāhi', gloss: 'Allah', wordId: 'allah', root: 'a-l-h' },
    ],
    lines: [
      {
        label: 'The full basmala',
        line: {
          ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
          tr: 'bismillāhi r-raḥmāni r-raḥīm',
          en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful',
        },
      },
    ],
    usage: [
      'Muslims say bismillah before starting something: eating, drinking, reading, travelling, beginning work. It means the action is begun with Allah’s name, seeking His help and blessing.',
      'The full form, the basmala, adds two names of Allah from the root r-ḥ-m (mercy): Ar-Raḥmān and Ar-Raḥīm.',
    ],
    quran: {
      status: 'exact',
      text: 'The basmala opens every surah except At-Tawbah (9). In the numbering used here it is counted as an ayah only in Al-Fatihah (1:1). It also occurs inside a surah, at the start of Sulayman’s letter to the Queen of Sheba (27:30), and Nuh says “in the name of Allah is its course and its anchorage” as the ark sets sail (11:41).',
    },
    refs: [{ key: 'bismillah', label: 'Every ayah with بسم الله' }],
    wordId: 'bismillah-ir-rahman-ir-raheem',
    related: ['alhamdulillah', 'assalamu-alaikum', 'ameen'],
  },
  {
    slug: 'allahu-akbar',
    name: 'Allahu Akbar',
    ar: 'اللَّهُ أَكْبَرُ',
    tr: 'Allāhu akbar',
    variants: ['Allah Akbar', 'Allahuakbar', 'Allahu Akbar'],
    meaning: 'Allah is greater (Allah is the Greatest)',
    literal: 'Allah · greater',
    parts: [
      { ar: 'اللَّهُ', tr: 'Allāhu', gloss: 'Allah', wordId: 'allah', root: 'a-l-h' },
      {
        ar: 'أَكْبَرُ',
        tr: 'akbar',
        gloss: 'greater, greatest',
        root: 'k-b-r',
        note: 'The comparative form of kabīr (great): Allah is greater than anything one could compare.',
      },
    ],
    usage: [
      'Saying Allahu akbar is called the takbīr. It opens every prayer and is repeated at each change of position, it is called out in the adhan, and it is said on the days of Eid.',
      'Muslims also say it in moments of joy or wonder, when they see something great, as a reminder that Allah is greater than all of it.',
    ],
    quran: {
      status: 'related',
      text: 'The two-word sentence Allāhu akbar does not occur in the Quran. The command to magnify Allah does: “and glorify Him with [great] glorification” (17:111) and “And your Lord glorify” (74:3) use the same root, k-b-r. The words Allah and akbar stand side by side in a few verses, but there akbar describes something else, as in “the remembrance of Allah is greater” (29:45).',
    },
    wordId: 'allahu-akbar',
    related: ['subhanallah', 'alhamdulillah', 'la-ilaha-illallah'],
  },
  {
    slug: 'alhamdulillah',
    name: 'Alhamdulillah',
    ar: 'الْحَمْدُ لِلَّهِ',
    tr: 'al-ḥamdu lillāh',
    variants: ['Al-hamdu lillah', 'Alhamdolillah', 'Alhamdulilah', 'Hamdulillah'],
    meaning: 'All praise is for Allah',
    literal: 'the praise · for Allah',
    parts: [
      { ar: 'الْ', tr: 'al-', gloss: 'the', note: 'With the article, al-ḥamd means all praise, praise in full.' },
      { ar: 'حَمْدُ', tr: 'ḥamdu', gloss: 'praise', wordId: 'hamd', root: 'hh-m-d' },
      { ar: 'لِ', tr: 'li', gloss: 'for, belongs to', note: 'Joined to Allah it is written لِلَّهِ (lillāh).' },
      { ar: 'لَّهِ', tr: '(A)llāhi', gloss: 'Allah', wordId: 'allah', root: 'a-l-h' },
    ],
    lines: [
      {
        label: 'As it opens Al-Fatihah',
        line: {
          ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
          tr: 'al-ḥamdu lillāhi rabbi l-ʿālamīn',
          en: 'Praise to Allah, Lord of the worlds',
        },
      },
    ],
    usage: [
      'Alhamdulillah is how Muslims thank and praise Allah: after eating, on good news, when asked “How are you?”, and also in hardship, as an act of patience.',
      'Saying it after sneezing is a practice taught in hadith (Sahih al-Bukhari).',
    ],
    quran: {
      status: 'exact',
      text: 'Al-ḥamdu lillāh are the first words of Al-Fatihah after the basmala (1:2), and they also open Surahs Al-An’am (6), Al-Kahf (18), Saba’ (34) and Fatir (35). In Paradise, “the last of their call will be, ‘Praise to Allah, Lord of the worlds’” (10:10).',
    },
    refs: [{ key: 'alhamdulillah', label: 'Every ayah with الحمد لله (also with “and” or “so”)' }],
    wordId: 'al-hamdu-lillahi-rabbil-alameen',
    related: ['subhanallah', 'mashallah', 'inna-lillahi-wa-inna-ilayhi-rajiun'],
  },
  {
    slug: 'subhanallah',
    name: 'SubhanAllah',
    ar: 'سُبْحَانَ اللَّهِ',
    tr: 'subḥān Allāh',
    variants: ['Subhanallah', 'Subhan Allah', 'Subhana Allah'],
    meaning: 'Glory be to Allah (Allah is far above any imperfection)',
    literal: 'glory (of) · Allah',
    parts: [
      {
        ar: 'سُبْحَانَ',
        tr: 'subḥāna',
        gloss: 'glory be to, exalted is',
        root: 's-b-hh',
        note: 'From the root s-b-ḥ: declaring Allah free of every fault. The act of saying it is tasbīḥ.',
      },
      { ar: 'اللَّهِ', tr: 'Allāhi', gloss: 'Allah', wordId: 'allah', root: 'a-l-h' },
    ],
    usage: [
      'SubhanAllah declares that Allah is above every imperfection and above anything wrongly said about Him. Muslims also say it in wonder, on seeing something remarkable in creation.',
      'After the prescribed prayers many Muslims say subhanAllah 33 times, together with alhamdulillah and Allahu akbar, following a practice taught in hadith (Sahih Muslim).',
    ],
    quran: {
      status: 'exact',
      text: 'Subḥān Allāh occurs in the Quran, often followed by what Allah is exalted above: “Exalted is Allah above what they describe” (37:159). The Quran also commands it for the evening and the morning (30:17).',
    },
    refs: [{ key: 'subhanallah', label: 'Every ayah with سبحان الله (also with “and” or “so”)' }],
    wordId: 'subhan-allah',
    related: ['alhamdulillah', 'allahu-akbar', 'astaghfirullah'],
  },
  {
    slug: 'astaghfirullah',
    name: 'Astaghfirullah',
    ar: 'أَسْتَغْفِرُ اللَّهَ',
    tr: 'astaghfiru llāh',
    variants: ['Astagfirullah', 'Astaghfir Allah', 'Astaghfirullah al-Azim'],
    meaning: 'I seek forgiveness from Allah',
    literal: 'I ask forgiveness (of) · Allah',
    parts: [
      {
        ar: 'أَسْتَغْفِرُ',
        tr: 'astaghfiru',
        gloss: 'I ask forgiveness',
        wordId: 'al-istighfar',
        root: 'gh-f-r',
        note: 'Pattern istafʿala of the root gh-f-r (forgive); the ista- form often means asking for something. The linked word is the noun, istighfār.',
      },
      {
        ar: 'اللَّهَ',
        tr: 'Allāha',
        gloss: 'Allah',
        wordId: 'allah',
        root: 'a-l-h',
        note: 'The ending -a (accusative) marks the One who is asked.',
      },
    ],
    usage: [
      'Muslims say astaghfirullah to ask Allah’s forgiveness after a sin or mistake, and many repeat it through the day as remembrance. Saying it three times after finishing a prayer is a practice taught in hadith (Sahih Muslim).',
      'It is also said on hearing something wrong or inappropriate, as a way of distancing oneself from it.',
    ],
    quran: {
      status: 'related',
      text: 'The first-person words astaghfiru llāh do not occur in the Quran as a phrase, but the Quran repeatedly commands seeking forgiveness with the same verb: Nuh tells his people “Ask forgiveness of your Lord. Indeed, He is ever a Perpetual Forgiver” (71:10), and the Prophet is told “And seek forgiveness of Allah” (4:106).',
    },
    related: ['subhanallah', 'wallahi', 'inna-lillahi-wa-inna-ilayhi-rajiun'],
  },
  {
    slug: 'assalamu-alaikum',
    name: 'Assalamu Alaikum',
    ar: 'السَّلَامُ عَلَيْكُمْ',
    tr: 'as-salāmu ʿalaykum',
    variants: ['As-salamu alaykum', 'Assalamualaikum', 'Asalamualaikum', 'Salam alaikum'],
    meaning: 'Peace be upon you',
    literal: 'the peace · upon you',
    parts: [
      {
        ar: 'السَّلَامُ',
        tr: 'as-salāmu',
        gloss: 'the peace',
        wordId: 'as-salaam',
        root: 's-l-m',
        note: 'As-Salām is also one of the 99 Names of Allah (59:23).',
      },
      { ar: 'عَلَى', tr: 'ʿalā', gloss: 'on, upon', wordId: 'ala' },
      { ar: 'كُمْ', tr: '-kum', gloss: 'you (plural)', note: 'Joined to ʿalā it is written عَلَيْكُمْ. The plural is used even when greeting one person.' },
    ],
    lines: [
      {
        label: 'The full greeting',
        line: {
          ar: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
          tr: 'as-salāmu ʿalaykum wa raḥmatu llāhi wa barakātuh',
          en: 'Peace be upon you, and the mercy of Allah and His blessings',
        },
      },
      {
        label: 'The reply',
        line: {
          ar: 'وَعَلَيْكُمُ السَّلَامُ',
          tr: 'wa ʿalaykumu s-salām',
          en: 'And upon you be peace',
        },
      },
    ],
    usage: [
      'Assalamu alaikum is the greeting Muslims use when they meet and when they part. The reply is wa alaikum as-salam, “and upon you be peace”, and either can be lengthened with “and the mercy of Allah and His blessings”.',
      'The Quran tells believers to answer a greeting with a better one or at least the same (4:86).',
    ],
    quran: {
      status: 'related',
      text: 'The Quran uses the greeting without the article, salāmun ʿalaykum, “peace be upon you”: the Prophet is told to greet the believers with it (6:54), and the angels greet the people of Paradise with it (13:24). With the article, Isa says “And peace is on me the day I was born…” (19:33).',
    },
    refs: [{ key: 'assalamu-alaikum', label: 'Every ayah with سلام عليكم' }],
    related: ['jazakallah-khair', 'inshallah', 'bismillah'],
    faq: [
      {
        q: 'How do you reply to assalamu alaikum?',
        a: 'Reply wa alaikum as-salam (وَعَلَيْكُمُ السَّلَامُ), “and upon you be peace”. You can add wa rahmatullahi wa barakatuh, “and the mercy of Allah and His blessings”.',
      },
    ],
  },
  {
    slug: 'jazakallah-khair',
    name: 'JazakAllah Khair',
    ar: 'جَزَاكَ اللَّهُ خَيْرًا',
    tr: 'jazāka llāhu khayran',
    variants: ['Jazakallah khayr', 'Jazak Allahu khairan', 'JazakAllah'],
    meaning: 'May Allah reward you with good',
    literal: '(may He) reward you · Allah · (with) good',
    parts: [
      {
        ar: 'جَزَا',
        tr: 'jazā',
        gloss: 'rewarded, repaid',
        root: 'j-z-y',
        note: 'A past-tense verb used as a prayer (duʿāʾ): “may He reward”.',
      },
      {
        ar: 'كَ',
        tr: '-ka',
        gloss: 'you',
        note: 'To one man. To a woman: jazāki llāhu khayran; to a group: jazākumu llāhu khayran.',
      },
      { ar: 'اللَّهُ', tr: 'Allāhu', gloss: 'Allah', wordId: 'allah', root: 'a-l-h' },
      { ar: 'خَيْرًا', tr: 'khayran', gloss: 'good', wordId: '58', root: 'kh-y-r' },
    ],
    usage: [
      'Muslims say jazakallah khair to thank someone: instead of only “thank you”, it asks Allah to reward the person with good. Its use as thanks comes from a hadith recorded by at-Tirmidhi.',
      'A common reply is wa iyyāk (to one person) or wa iyyākum, “and you too”.',
    ],
    quran: {
      status: 'none',
      text: 'The phrase itself is not in the Quran. Its two key words are: jazāʾ (reward, recompense) from the root j-z-y, and khayr (good). Surah Ar-Rahman asks “Is the reward for good [anything] but good?” (55:60).',
    },
    related: ['assalamu-alaikum', 'ameen', 'mashallah'],
  },
  {
    slug: 'ameen',
    name: 'Ameen',
    ar: 'آمِين',
    tr: 'āmīn',
    variants: ['Amin', 'Aameen', 'Amen'],
    meaning: 'O Allah, answer (our prayer)',
    literal: 'answer (us)',
    parts: [
      {
        ar: 'آمِين',
        tr: 'āmīn',
        gloss: 'answer, accept',
        root: 'a-m-n',
        note: 'Arabic grammarians explain it as a word meaning “O Allah, respond”. Also said with a short first vowel, amīn.',
      },
    ],
    usage: [
      'Muslims say ameen at the end of a duʿāʾ (supplication), their own or someone else’s, asking Allah to accept it. In prayer it is said after reciting Al-Fatihah, whose last verses are a prayer for guidance.',
      'The English “Amen”, used at the end of prayers by Christians and Jews, is a related word with a similar use.',
    ],
    quran: {
      status: 'none',
      text: 'Ameen is not part of the Quran’s text. It is said after the last verse of Al-Fatihah (1:7), shown below. Do not confuse it with أَمِين (amīn, “trustworthy”), a different word from the same root that does occur, as in “Indeed, I am to you a trustworthy messenger” (26:107).',
    },
    related: ['alhamdulillah', 'jazakallah-khair', 'bismillah'],
  },
  {
    slug: 'la-ilaha-illallah',
    name: 'La ilaha illallah',
    ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    tr: 'lā ilāha illā llāh',
    variants: ['La ilaha illa Allah', 'Lailahaillallah', 'La ilaha ilallah'],
    meaning: 'There is no god but Allah',
    titleMeaning: 'No God but Allah',
    literal: 'no · god · except · Allah',
    parts: [
      { ar: 'لَا', tr: 'lā', gloss: 'no (there is no)', wordId: 'la-negation' },
      { ar: 'إِلَٰهَ', tr: 'ilāha', gloss: 'god, deity', wordId: 'ilah', root: 'a-l-h' },
      { ar: 'إِلَّا', tr: 'illā', gloss: 'except, but', wordId: 'illa' },
      { ar: 'اللَّهُ', tr: 'Allāhu', gloss: 'Allah', wordId: 'allah', root: 'a-l-h' },
    ],
    lines: [
      {
        label: 'The shahada (testimony of faith)',
        line: {
          ar: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
          tr: 'ashhadu an lā ilāha illā llāh, wa ashhadu anna Muḥammadan rasūlu llāh',
          en: 'I bear witness that there is no god but Allah, and I bear witness that Muhammad is the Messenger of Allah',
        },
      },
    ],
    usage: [
      'La ilaha illallah is the first half of the shahada, the testimony of faith. It is called out in every adhan, said in the tashahhud of the prayer and repeated as remembrance.',
      'Its two halves are a denial and an affirmation: “there is no god” denies every false object of worship, and “except Allah” affirms that worship belongs to Allah alone.',
    ],
    quran: {
      status: 'exact',
      text: 'The exact words lā ilāha illā llāh occur twice: “So know, [O Muhammad], that there is no deity except Allah” (47:19) and 37:35. The Quran more often says lā ilāha illā huwa, “there is no deity except Him”.',
    },
    refs: [{ key: 'la-ilaha-illallah', label: 'Every ayah with لا إله إلا الله' }],
    wordId: 'la-ilaha-illa-allah',
    related: ['allahu-akbar', 'subhanallah', 'wallahi'],
  },
  {
    slug: 'inna-lillahi-wa-inna-ilayhi-rajiun',
    name: 'Inna lillahi wa inna ilayhi raji’un',
    ar: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
    tr: 'innā lillāhi wa innā ilayhi rājiʿūn',
    variants: ['Innalillahi wa inna ilaihi rajiun', 'Inna lillahi wa inna ilayhi rajioon', 'Inna lillah'],
    meaning: 'Indeed we belong to Allah, and indeed to Him we will return',
    literal: 'indeed we · (belong) to Allah · and indeed we · to Him · (are) returning',
    parts: [
      { ar: 'إِنَّا', tr: 'innā', gloss: 'indeed we', wordId: 'inna', note: 'inna (indeed) + nā (we).' },
      { ar: 'لِلَّهِ', tr: 'lillāhi', gloss: 'to Allah, belonging to Allah', wordId: 'allah', root: 'a-l-h', note: 'li (for, belonging to) + Allah.' },
      { ar: 'وَ', tr: 'wa', gloss: 'and' },
      { ar: 'إِنَّا', tr: 'innā', gloss: 'indeed we', wordId: 'inna' },
      { ar: 'إِلَيْهِ', tr: 'ilayhi', gloss: 'to Him', wordId: 'ila', note: 'ilā (to) + hi (him).' },
      { ar: 'رَاجِعُونَ', tr: 'rājiʿūn', gloss: 'returning (ones)', root: 'r-j-e', note: 'Active participle, plural, of rajaʿa (to return).' },
    ],
    usage: [
      'Muslims say this on hearing of a death, and at any loss or hardship, large or small. It is called the istirjāʿ.',
      'It is a statement of faith in a hard moment: everything we have belongs to Allah, and we ourselves will return to Him.',
    ],
    quran: {
      status: 'exact',
      text: 'The words are from Surah Al-Baqarah. Allah describes the patient as those “who, when disaster strikes them, say, ‘Indeed we belong to Allah, and indeed to Him we will return’” (2:156), and the next verse says that upon them are blessings from their Lord and mercy (2:157).',
    },
    related: ['alhamdulillah', 'astaghfirullah', 'ameen'],
  },
];

const bySlug = new Map(PHRASES.map((p) => [p.slug, p]));
export const getPhrase = (slug: string): Phrase | undefined => bySlug.get(slug);

/** Verses shown on a phrase page (generated, verified against the corpus). */
export const phraseVerses = (slug: string): PhraseVerse[] => PHRASE_VERSES[slug] ?? [];
/** Every ayah containing the phrase, for the occurrence list. */
export const phraseRefs = (key: string): [number, number][] => PHRASE_REFS[key] ?? [];

/** Word page id -> the phrase page that covers the same phrase (for the link on the word page). */
const PHRASE_FOR_WORD = new Map(PHRASES.filter((p) => p.wordId).map((p) => [p.wordId as string, p]));
export const phraseForWord = (wordId: string): Phrase | undefined => PHRASE_FOR_WORD.get(wordId);

/** Phrases with this word among their parts (for "Said in" links on the word page). */
export const phrasesUsingWord = (wordId: string): Phrase[] => PHRASES.filter((p) => p.parts.some((x) => x.wordId === wordId));
