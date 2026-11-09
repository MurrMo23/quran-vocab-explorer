// "<X> in the Quran" topic pages (/topics/<slug>) and the /topics hub. The numbers, verses and Arabic
// quotations come from src/utils/generated/topics.ts (scripts/vocab/gen-topics.py, checked against the
// Quranic Arabic Corpus); this file only holds the wording around them. Keep it descriptive: say what
// the text says, with the reference, and nothing it does not.
import { PROPHET_MENTIONS, TOPIC_DATA, type TopicData } from './generated/topics';

export const TOPICS_HUB_PATH = '/topics';
export const topicPath = (slug: string) => `${TOPICS_HUB_PATH}/${slug}`;

const num = (n: number) => n.toLocaleString('en-US');
const times = (n: number) => `${num(n)} ${n === 1 ? 'time' : 'times'}`;
const count = (d: TopicData, key: string) => d.counts.find((c) => c.key === key)?.count ?? 0;
const ayahsOf = (d: TopicData, key: string) => d.counts.find((c) => c.key === key)?.ayahs ?? 0;
const surahsOf = (d: TopicData, key: string) => d.counts.find((c) => c.key === key)?.surahs ?? 0;
/** The named prophets, most mentioned first. */
const prophetsByCount = () => [...PROPHET_MENTIONS].sort((a, b) => b.count - a.count);

export interface TopicTitleCopy {
  /** What the phrase is (e.g. "The wife of Pharaoh"); shown as the item heading. */
  label: string;
  tr: string;
  en: string;
  note?: string;
  /** Show "occurs N times in the Quran" (only where the phrase always means this person). */
  showCount?: boolean;
}

export interface TopicCopy {
  slug: string;
  /** Short name for links and the hub ("Jesus"). */
  name: string;
  /** The H1. */
  h1: string;
  /** Large Arabic in the hero. */
  arabic: string;
  badges: string[];
  /** One line for the hub card. */
  summary: string;
  intro: (d: TopicData) => string[];
  /** What the counts table counts. */
  countsNote: string;
  /** Heading of the surah list. */
  surahsHeading?: string;
  /** Caption over each key verse, by "surah:ayah". */
  verseNotes: Record<string, string>;
  titlesHeading?: string;
  titlesIntro?: string;
  titles?: Record<string, TopicTitleCopy>;
  wordsHeading: string;
  faq: (d: TopicData) => { q: string; a: string }[];
  links: { to: string; label: string }[];
}

export const TOPICS: TopicCopy[] = [
  {
    slug: 'jesus-in-the-quran',
    name: 'Jesus',
    h1: 'Jesus (Isa) in the Quran',
    arabic: 'عِيسَى ٱبْنُ مَرْيَمَ',
    badges: ['ʿĪsā ibn Maryam', 'Prophet'],
    summary: 'How often Isa is named, his titles in the Quran and the key verses about him.',
    intro: (d) => [
      `Jesus is called ʿĪsā (عيسى) in the Quran. The name occurs ${times(count(d, 'isa'))}, in ${surahsOf(d, 'isa')} surahs. He is also called al-Masīḥ, “the Messiah” (${times(count(d, 'masih'))}), and he is most often named with his mother: “son of Maryam” (ibn Maryam) occurs ${times(count(d, 'ibn-maryam'))}.`,
      'The Quran describes his birth to Maryam without a father, calls him a messenger to the Children of Israel who was given the Injil (Gospel), and lists the signs he brought by the permission of Allah. Below are the key verses with the Arabic, a translation and the recitation, and the Quranic words that describe him.',
    ],
    countsNote:
      'Counted with the Quranic Arabic Corpus: every word whose dictionary form is the name (with any prefix or suffix). “Son of Maryam” counts the two-word phrase. Pronouns that refer to him are not counted.',
    surahsHeading: 'Surahs where the name Isa occurs most',
    verseNotes: {
      '3:45': 'The good news given to Maryam: “a word from Him, whose name will be the Messiah, Jesus, the son of Mary”',
      '19:30': 'His first words, spoken as a baby: “Indeed, I am the servant of Allah”',
      '3:49': 'The signs he brought, each “by permission of Allah”',
      '3:59': 'His creation compared to the creation of Adam',
      '4:171': 'A messenger of Allah, His word and a spirit from Him',
      '5:46': 'He was given the Injil (Gospel), confirming the Torah',
      '61:6': 'Good tidings of a messenger to come after him, named Ahmad',
      '4:157': 'What the Quran says about the crucifixion: “they did not kill him, nor did they crucify him” (followed by 4:158, “Allah raised him to Himself”)',
    },
    titlesHeading: 'Titles of Isa in the Quran',
    titlesIntro: 'The names and descriptions the Quran itself uses for him, quoted from the verse they come from.',
    titles: {
      'ibn-maryam': { label: 'Son of Maryam', tr: 'ibnu Maryam', en: 'son of Mary', showCount: true },
      'al-masih': { label: 'The Messiah', tr: 'al-Masīḥ', en: 'the Messiah', note: 'Always used for Isa in the Quran.' },
      'kalimah-minhu': { label: 'A word from Allah', tr: 'bi-kalimatin minhu', en: 'of a word from Him' },
      kalimatuhu: { label: 'His word', tr: 'wa kalimatuhū', en: 'and His word' },
      'ruh-minhu': { label: 'A spirit from Him', tr: 'wa rūḥun minhu', en: 'and a spirit (rūḥ) from Him', note: 'Saheeh International: “a soul [created at a command] from Him”.' },
      abdullah: { label: 'Servant of Allah', tr: 'innī ʿabdu-llāh', en: 'Indeed, I am the servant of Allah' },
      rasul: { label: 'Messenger of Allah', tr: 'rasūlu-llāh', en: 'the messenger of Allah' },
      wajih: { label: 'Distinguished', tr: 'wajīhan', en: 'distinguished (in this world and the Hereafter)' },
      ayah: { label: 'A sign to the people', tr: 'āyatan li-n-nās', en: 'a sign to the people' },
    },
    wordsHeading: 'Quranic words about Isa',
    faq: (d) => [
      {
        q: 'How many times is Jesus mentioned in the Quran?',
        a: `By name, ʿĪsā (Jesus) occurs ${times(count(d, 'isa'))} in the Quran, in ${num(ayahsOf(d, 'isa'))} verses. The title al-Masīḥ (the Messiah) occurs ${times(count(d, 'masih'))}, and “son of Maryam” ${times(count(d, 'ibn-maryam'))}; many verses use more than one of these together.`,
      },
      {
        q: 'Is Jesus in the Quran?',
        a: 'Yes. The Quran names him ʿĪsā, son of Maryam, and calls him a messenger and prophet of Allah (19:30, 4:171). It tells of his birth to Maryam (Surah Maryam, 19:16–34) and the signs he brought (3:49).',
      },
      {
        q: 'What is Jesus called in Arabic?',
        a: 'ʿĪsā (عيسى). The Quran also calls him al-Masīḥ (المسيح), “the Messiah”, and ibn Maryam (ابن مريم), “son of Mary”.',
      },
      {
        q: 'Which surah talks about Jesus?',
        a: 'Surah Al ʿImran (3) and Surah Maryam (19) tell the story of his birth; Surah Al-Maʾidah (5) has the most mentions of his name. Surah Maryam is named after his mother.',
      },
    ],
    links: [
      { to: '/topics/mary-in-the-quran', label: 'Mary (Maryam) in the Quran' },
      { to: '/topics/prophets-in-the-quran', label: 'Prophets in the Quran' },
      { to: '/surah/19', label: 'Surah Maryam (19)' },
      { to: '/surah/3', label: 'Surah Al ʿImran (3)' },
    ],
  },
  {
    slug: 'mary-in-the-quran',
    name: 'Mary',
    h1: 'Mary (Maryam) in the Quran',
    arabic: 'مَرْيَمَ ٱبْنَتَ عِمْرَٰنَ',
    badges: ['Maryam', 'Surah 19 is named after her'],
    summary: 'The only woman named in the Quran: her mentions, titles and key verses.',
    intro: (d) => [
      `Maryam (مريم), Mary, is the only woman the Quran calls by name. Her name occurs ${times(count(d, 'maryam'))} in ${surahsOf(d, 'maryam')} surahs, and Surah 19 is named after her. Most of these mentions name her son: “son of Maryam” occurs ${times(count(d, 'ibn-maryam'))}.`,
      'The Quran tells of her birth and dedication by her mother, her upbringing in the care of Zakariya, the angel’s news of a son, and the birth of Isa. Below are those verses with the Arabic, a translation and the recitation, and the titles the Quran gives her.',
    ],
    countsNote:
      'Counted with the Quranic Arabic Corpus: every word whose dictionary form is the name Maryam. “Son of Maryam” counts the two-word phrase.',
    surahsHeading: 'Surahs where the name Maryam occurs most',
    verseNotes: {
      '3:36': 'Her mother names her: “I have named her Maryam”',
      '3:37': 'Zakariya finds provision with her in the prayer chamber (miḥrāb)',
      '3:42': 'Chosen and purified: “chosen you above the women of the worlds”',
      '19:16': 'The start of her story in Surah Maryam',
      '19:20': '“How can I have a boy while no man has touched me?”',
      '19:25': 'The palm tree: “shake toward you the trunk of the palm tree”',
      '5:75': 'Her son a messenger, and “his mother was a supporter of truth”',
      '66:12': 'Maryam, daughter of ʿImran, given as an example to the believers',
    },
    titlesHeading: 'How the Quran describes Maryam',
    titlesIntro: 'Phrases the Quran uses for her, quoted from the verse they come from.',
    titles: {
      'ibnat-imran': { label: 'Daughter of ʿImran', tr: 'wa Maryama-bnata ʿImrān', en: 'and Mary, the daughter of ʿImran' },
      'ukht-harun': { label: 'Sister of Harun', tr: 'yā ukhta Hārūn', en: 'O sister of Aaron', note: 'How her people address her when she returns with her baby.' },
      siddiqah: { label: 'A supporter of truth', tr: 'ṣiddīqah', en: 'a supporter of truth (truthful, sincere)' },
      chosen: { label: 'Chosen above the women of the worlds', tr: 'waṣṭafāki ʿalā nisāʾi l-ʿālamīn', en: 'and chosen you above the women of the worlds' },
      ayah: { label: 'A sign, with her son', tr: 'wa jaʿalnā-bna Maryama wa ummahū āyah', en: 'And We made the son of Mary and his mother a sign' },
    },
    wordsHeading: 'Quranic words in her story',
    faq: (d) => [
      {
        q: 'How many times is Mary mentioned in the Quran?',
        a: `Her name, Maryam, occurs ${times(count(d, 'maryam'))} in the Quran, in ${num(ayahsOf(d, 'maryam'))} verses. ${num(count(d, 'ibn-maryam'))} of those are in the phrase “son of Maryam”, used for Isa.`,
      },
      {
        q: 'Is Mary the only woman named in the Quran?',
        a: 'Yes. Maryam is the only woman mentioned by name. Other women are referred to by their relation to someone, such as “the wife of Pharaoh” (66:11) or “the mother of Musa” (28:7).',
      },
      {
        q: 'Is there a surah named after Mary?',
        a: 'Yes, Surah Maryam, the 19th surah. Its story of her and the birth of Isa is in verses 16–34. Al ʿImran (3), named after her family, also tells her story.',
      },
      {
        q: 'Where is Mary mentioned most in the Quran?',
        a: 'In Surah Al-Maʾidah (5) and Surah Al ʿImran (3). Most of the mentions in Al-Maʾidah are in the phrase “son of Maryam”.',
      },
    ],
    links: [
      { to: '/topics/jesus-in-the-quran', label: 'Jesus (Isa) in the Quran' },
      { to: '/topics/women-in-the-quran', label: 'Women in the Quran' },
      { to: '/surah/19', label: 'Surah Maryam (19)' },
      { to: '/surah/3', label: 'Surah Al ʿImran (3)' },
    ],
  },
  {
    slug: 'moses-in-the-quran',
    name: 'Moses',
    h1: 'Moses (Musa) in the Quran',
    arabic: 'مُوسَىٰ',
    badges: ['Mūsā', 'The most-named prophet'],
    summary: 'The prophet named most often: his story, key verses and the words around it.',
    intro: (d) => [
      `Moses is called Mūsā (موسى) in the Quran. His name occurs ${times(count(d, 'musa'))}, in ${surahsOf(d, 'musa')} surahs: more than any other prophet. His story is told across many surahs, from his birth and rescue from Pharaoh to the revelation at the valley of Tuwa, the parting of the sea and the giving of the Torah.`,
      `Pharaoh (Firʿawn) is named ${times(count(d, 'firawn'))}, his brother Harun (Aaron) ${times(count(d, 'harun'))}, and the Children of Israel (Banī Isrāʾīl) ${times(count(d, 'bani-israil'))}. Below are key verses with the Arabic, a translation and the recitation, including two of the best-known supplications in the Quran.`,
    ],
    countsNote:
      'Counted with the Quranic Arabic Corpus: every word whose dictionary form is the name (with any prefix or suffix). “Children of Israel” counts the two-word phrase.',
    surahsHeading: 'Surahs where the name Musa occurs most',
    verseNotes: {
      '28:7': 'His mother is inspired to place the baby in the river',
      '20:12': 'At the sacred valley of Tuwa: “remove your sandals”',
      '20:14': '“Indeed, I am Allah. There is no deity except Me”',
      '20:25': 'His supplication: “My Lord, expand for me my breast”',
      '4:164': '“And Allah spoke to Moses with [direct] speech”',
      '26:63': 'The sea parts: “Strike with your staff the sea”',
      '28:24': 'In Madyan: “My Lord, indeed I am, for whatever good You would send down to me, in need”',
      '19:51': 'Chosen, a messenger and a prophet',
    },
    wordsHeading: 'Quranic words in the story of Musa',
    faq: (d) => [
      {
        q: 'How many times is Moses mentioned in the Quran?',
        a: `The name Mūsā occurs ${times(count(d, 'musa'))} in the Quran, in ${num(ayahsOf(d, 'musa'))} verses across ${surahsOf(d, 'musa')} surahs. It is the most frequent name of any prophet.`,
      },
      {
        q: 'Which surah has the most about Moses?',
        a: `By mentions of his name: Al-Aʿraf (7), Al-Qasas (28) and Ta-Ha (20). Al-Qasas tells his life in order, from his birth to his mission to Pharaoh.`,
      },
      {
        q: 'What is Moses called in Arabic?',
        a: 'Mūsā (موسى). His brother Aaron is Hārūn (هارون), Pharaoh is Firʿawn (فرعون) and the Torah is at-Tawrāh (التوراة).',
      },
      {
        q: 'What is the dua of Musa?',
        a: 'Two are well known: “Rabbi-shraḥ lī ṣadrī” (My Lord, expand for me my breast, 20:25–28) and “Rabbi innī limā anzalta ilayya min khayrin faqīr” (My Lord, I am in need of whatever good You send down to me, 28:24).',
      },
    ],
    links: [
      { to: '/topics/prophets-in-the-quran', label: 'Prophets in the Quran' },
      { to: '/surah/28', label: 'Surah Al-Qasas (28)' },
      { to: '/surah/20', label: 'Surah Ta-Ha (20)' },
      { to: '/surah/7', label: 'Surah Al-Aʿraf (7)' },
    ],
  },
  {
    slug: 'prophets-in-the-quran',
    name: 'Prophets',
    h1: 'Prophets in the Quran: the 25 Named Prophets',
    arabic: 'ٱلنَّبِيُّونَ',
    badges: ['25 named', 'Anbiyāʾ and rusul'],
    summary: 'The 25 prophets named in the Quran, how often each is mentioned, and the key verses.',
    intro: (d) => [
      `The Quran names ${PROPHET_MENTIONS.length} prophets, from Adam to Muhammad. Together their names occur ${times(d.extra?.total ?? 0)}. ${prophetsByCount().slice(0, 3).map((p) => p.name).join(', ').replace(/, ([^,]*)$/, ' and $1')} are named most often. The Quran also says there were messengers it does not tell about (4:164).`,
      `Two words are used: nabiyy (نبي), a prophet, and rasūl (رسول), a messenger. Below is every named prophet with the number of times the name occurs, then the verses that list them. For their names as flashcards, see the Prophets & Messengers collection.`,
    ],
    countsNote:
      'Counted with the Quranic Arabic Corpus: every word whose dictionary form is the name, with any prefix or suffix. Titles (such as Dhun-Nun for Yunus) and pronouns are not counted. Dhul-Kifl counts only where kifl is part of his name (21:85, 38:48); Ilyas includes Il-Yasin (37:130).',
    verseNotes: {
      '4:163': 'Revelation to Muhammad as to Nuh and the prophets after him',
      '4:164': 'Messengers the Quran tells about, and messengers it does not',
      '6:84': 'Part of the list of prophets in Surah Al-Anʿam (6:83–86)',
      '6:85': 'Zakariya, Yahya, Isa and Ilyas',
      '6:86': 'Ismail, Al-Yasa, Yunus and Lut',
      '2:136': '“We make no distinction between any of them”',
      '16:36': 'A messenger sent to every nation',
      '33:40': 'Muhammad, “the messenger of Allah and seal of the prophets”',
    },
    wordsHeading: 'Quranic words about prophethood',
    faq: (d) => [
      {
        q: 'How many prophets are mentioned in the Quran?',
        a: `25 prophets are named in the Quran. Their names occur ${times(d.extra?.total ?? 0)} in all. The Quran also says that some messengers were not told about (4:164) and that a messenger was sent to every nation (16:36).`,
      },
      {
        q: 'Which prophet is mentioned most in the Quran?',
        a: (() => {
          const [a, b, c] = prophetsByCount();
          return `${a.name}, whose name occurs ${times(a.count)}. ${b.name} is next with ${num(b.count)}, then ${c.name} with ${num(c.count)}.`;
        })(),
      },
      {
        q: 'What is the difference between a nabi and a rasul?',
        a: `Both words are used in the Quran: nabiyy (prophet, ${times(count(d, 'nabi'))} in its forms) and rasūl (messenger, ${times(count(d, 'rasul'))}). A common explanation is that a rasul is sent with a message or law to a people, so every rasul is also a nabi; 19:51 and 19:54 call Musa and Ismail both “a messenger and a prophet”.`,
      },
      {
        q: 'How many times is Muhammad mentioned by name?',
        a: 'Four times (3:144, 33:40, 47:2, 48:29), and once as Ahmad (61:6). He is more often addressed as “O Prophet” or “O Messenger”.',
      },
    ],
    links: [
      { to: '/collections/prophets', label: 'Prophets & Messengers collection' },
      { to: '/topics/moses-in-the-quran', label: 'Moses (Musa) in the Quran' },
      { to: '/topics/jesus-in-the-quran', label: 'Jesus (Isa) in the Quran' },
      { to: '/quran-statistics', label: 'Quran statistics' },
    ],
  },
  {
    slug: 'women-in-the-quran',
    name: 'Women',
    h1: 'Women in the Quran',
    arabic: 'ٱلنِّسَآء',
    badges: ['An-Nisāʾ', 'Maryam is the only woman named'],
    summary: 'The women in the Quran’s stories, how it refers to them, and the key verses.',
    intro: (d) => [
      `The word nisāʾ (نساء), women, occurs ${times(count(d, 'nisa'))} in the Quran, and the 4th surah, An-Nisāʾ, is named after it. Maryam is the only woman called by name. The others are referred to by their relation to someone: the wife of Pharaoh, the mother of Musa, the queen of Sheba (“a woman ruling them”) and more.`,
      'Below is each of them with the Arabic phrase the Quran uses and where it occurs, followed by key verses on women and men, with the Arabic, a translation and the recitation.',
    ],
    countsNote:
      'Counted with the Quranic Arabic Corpus: every word whose dictionary form is the word, with any prefix or suffix. Imraʾah is also the word used for “wife”.',
    surahsHeading: 'Surahs where the word nisāʾ (women) occurs most',
    verseNotes: {
      '4:1': 'Created from a single soul, and from it its mate',
      '33:35': 'The believing men and women, quality by quality',
      '16:97': '“Whoever does righteousness, whether male or female”',
      '30:21': 'Spouses “that you may find tranquillity in them”',
      '66:11': 'The wife of Pharaoh, an example for the believers',
      '3:195': '“Never will I allow to be lost the work of [any] worker among you, whether male or female”',
    },
    titlesHeading: 'The women in the Quran, by how it refers to them',
    titlesIntro: 'Each phrase is quoted from the first verse listed; the other references use the same words or tell the same story.',
    titles: {
      maryam: { label: 'Maryam (Mary), daughter of ʿImran', tr: 'wa Maryama-bnata ʿImrān', en: 'and Mary, the daughter of ʿImran', note: 'The only woman named.' },
      'wife-of-imran': { label: 'The wife of ʿImran, mother of Maryam', tr: 'imraʾatu ʿImrān', en: 'the wife of ʿImran' },
      'wife-of-adam': { label: 'The wife of Adam', tr: 'anta wa zawjuka l-jannah', en: 'you and your wife, [dwell] in Paradise', note: 'Not named in the Quran; the name Hawwa (Eve) comes from other sources.' },
      'wives-of-nuh-and-lut': { label: 'The wives of Nuh and Lut', tr: 'imraʾata Nūḥin wa-mraʾata Lūṭ', en: 'the wife of Noah and the wife of Lot' },
      'wife-of-ibrahim': { label: 'The wife of Ibrahim', tr: 'wa-mraʾatuhū', en: 'and his wife', note: 'Given the good news of Ishaq in her old age.' },
      'wife-of-aziz': { label: 'The wife of al-ʿAziz', tr: 'imraʾatu l-ʿAzīz', en: 'the wife of al-ʿAzeez', note: 'In the story of Yusuf.' },
      'mother-of-musa': { label: 'The mother of Musa', tr: 'ummi Mūsā', en: 'the mother of Moses' },
      'sister-of-musa': { label: 'The sister of Musa', tr: 'li-ukhtihī', en: 'to his sister', note: 'Told to follow the baby Musa.' },
      'wife-of-pharaoh': { label: 'The wife of Pharaoh', tr: 'imraʾatu Firʿawn', en: 'the wife of Pharaoh' },
      'women-of-madyan': { label: 'The two women of Madyan', tr: 'imraʾatayni tadhūdān', en: 'two women driving back [their flocks]', note: 'Their father offers Musa marriage to one of them (28:27).' },
      'queen-of-sheba': { label: 'The queen of Sheba (Saba’)', tr: 'imraʾatan tamlikuhum', en: 'a woman ruling them', note: 'Not named in the Quran; the name Bilqis comes from later sources.' },
      'wife-of-zakariya': { label: 'The wife of Zakariya', tr: 'wa-mraʾatī ʿāqir', en: 'and my wife is barren', note: 'The mother of Yahya.' },
      'woman-who-disputed': { label: 'The woman who argued about her husband', tr: 'allatī tujādiluka fī zawjihā', en: 'the one who argues with you concerning her husband', note: 'Surah Al-Mujadilah (58) begins with her case.' },
      'wives-of-the-prophet': { label: 'The wives of the Prophet', tr: 'yā nisāʾa n-nabiyy', en: 'O wives of the Prophet' },
      'wife-of-abu-lahab': { label: 'The wife of Abu Lahab', tr: 'wa-mraʾatuhū ḥammālata l-ḥaṭab', en: 'and his wife, the carrier of firewood' },
    },
    wordsHeading: 'Quranic words about women and family',
    faq: (d) => [
      {
        q: 'Which woman is named in the Quran?',
        a: 'Only Maryam (Mary), the mother of Isa. Every other woman is referred to by her relation to someone, such as “the wife of Pharaoh” (66:11) or “the mother of Musa” (28:7).',
      },
      {
        q: 'How many times are women mentioned in the Quran?',
        a: `The word nisāʾ (women) occurs ${times(count(d, 'nisa'))}, imraʾah (woman, wife) ${times(count(d, 'imraah'))} and unthā (female) ${times(count(d, 'untha'))}.`,
      },
      {
        q: 'Which surah is about women?',
        a: 'Surah An-Nisāʾ (4), “The Women”, has the most uses of the word and many rulings on family and inheritance. Surah Maryam (19) is named after Maryam, and Surah Al-Mujadilah (58) opens with a woman’s complaint about her husband.',
      },
      {
        q: 'Is the queen of Sheba named in the Quran?',
        a: 'No. The Quran calls her “a woman ruling them” (27:23) and tells of her meeting with Sulayman in Surah An-Naml (27:22–44). The name Bilqis comes from later sources.',
      },
    ],
    links: [
      { to: '/topics/mary-in-the-quran', label: 'Mary (Maryam) in the Quran' },
      { to: '/topics/moses-in-the-quran', label: 'Moses (Musa) in the Quran' },
      { to: '/surah/4', label: 'Surah An-Nisaʾ (4)' },
      { to: '/surah/58', label: 'Surah Al-Mujadilah (58)' },
    ],
  },
  {
    slug: 'jinn-in-the-quran',
    name: 'Jinn',
    h1: 'Jinn in the Quran',
    arabic: 'ٱلْجِنّ',
    badges: ['Al-Jinn', 'Surah 72 is named after them'],
    summary: 'What the Quran says about the jinn, how often they are mentioned and Surah Al-Jinn.',
    intro: (d) => [
      `The Quran uses three words for the jinn: al-jinn (${times(count(d, 'jinn'))}), al-jānn (${times(count(d, 'jann'))}) and al-jinnah (${times(count(d, 'jinnah'))} with this meaning). Together they occur in ${num(d.extra?.ayahs ?? 0)} verses, and in ${num(d.extra?.withMankind ?? 0)} of them the jinn are named together with mankind.`,
      `The Quran says the jinn were created from fire, before mankind, and were created, like mankind, to worship Allah. Iblis “was of the jinn” (18:50). Surah Al-Jinn (72) begins with a group of jinn who listen to the Quran and believe in it.`,
    ],
    countsNote:
      'Counted with the Quranic Arabic Corpus by dictionary form. Jānn also means a snake (27:10, 28:31, Musa’s staff) and jinnah also means madness (in five verses such as 7:184); those are left out.',
    surahsHeading: 'Surahs where the jinn are mentioned most',
    verseNotes: {
      '72:1': 'The opening of Surah Al-Jinn: a group of jinn listen to the Quran',
      '51:56': '“I did not create the jinn and mankind except to worship Me”',
      '55:15': 'Created “from a smokeless flame of fire”',
      '18:50': 'Iblis “was of the jinn”',
      '46:29': 'Jinn listen to the Quran and return to their people as warners',
      '17:88': 'The challenge to jinn and mankind to produce the like of the Quran',
      '55:33': '“O company of jinn and men”',
      '114:6': 'The last verse of the Quran: “from among the jinn and mankind”',
    },
    wordsHeading: 'Quranic words about the jinn',
    faq: (d) => [
      {
        q: 'How many times are jinn mentioned in the Quran?',
        a: `The word al-jinn occurs ${times(count(d, 'jinn'))}. With al-jānn (${times(count(d, 'jann'))}) and al-jinnah where it means the jinn (${times(count(d, 'jinnah'))}), the jinn are mentioned ${times(count(d, 'jinn') + count(d, 'jann') + count(d, 'jinnah'))} in ${num(d.extra?.ayahs ?? 0)} verses.`,
      },
      {
        q: 'What are jinn made of according to the Quran?',
        a: 'Fire: “And He created the jinn from a smokeless flame of fire” (55:15), and “the jinn We created before from scorching fire” (15:27).',
      },
      {
        q: 'Is there a surah about the jinn?',
        a: `Yes, Surah Al-Jinn, the 72nd surah (${d.extra?.surah72Ayahs ?? 28} verses). It opens with jinn who heard the Quran and said, “Indeed, we have heard an amazing Qur'an” (72:1).`,
      },
      {
        q: 'Is Iblis a jinn or an angel?',
        a: 'The Quran says that when the angels were told to prostrate to Adam, Iblis refused, and that “he was of the jinn” (18:50).',
      },
    ],
    links: [
      { to: '/surah/72', label: 'Surah Al-Jinn (72)' },
      { to: '/surah/55', label: 'Surah Ar-Rahman (55)' },
      { to: '/surah/114', label: 'Surah An-Nas (114)' },
      { to: '/topics/prophets-in-the-quran', label: 'Prophets in the Quran' },
    ],
  },
];

const bySlug = new Map(TOPICS.map((t) => [t.slug, t]));
export const getTopic = (slug: string): TopicCopy | undefined => bySlug.get(slug);
export const topicData = (slug: string): TopicData | undefined => TOPIC_DATA[slug];
