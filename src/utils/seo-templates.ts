// Every page title and meta description pattern on the site, in one place.
//
// To retarget a page type at different keywords, edit only the template function for it below
// (wordSeo, rootSeo, rootLetterSeo, surahSeo, collectionSeo, nameSeo) or the HUB_SEO strings.
// The helpers keep titles within TITLE_MAX characters (the brand suffix is only added when it fits)
// and descriptions within DESC_MAX, cutting at a word boundary.
//
// Check the result after a build with: node scripts/seo-check.mjs

export const SITE_NAME = 'QuranVocab';
export const SITE_URL = 'https://quranvocab.com';
/** Google shows roughly 50-60 characters of a title. */
export const TITLE_MAX = 60;
/** Google shows roughly 150-160 characters of a description. */
export const DESC_MAX = 155;
const BRAND_SUFFIX = ` | ${SITE_NAME}`;

const len = (s: string) => [...s].length;
const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Cut `s` to at most `max` characters at a word boundary, adding an ellipsis when cut. */
export const clip = (s: string, max: number): string => {
  const t = s.replace(/\s+/g, ' ').trim();
  if (len(t) <= max) return t;
  const chars = [...t].slice(0, max - 1).join('');
  const cut = chars.replace(/[\s,;:(–—-]+[^\s,;:(–—-]*$/, '');
  return `${(cut.length > max / 2 ? cut : chars).replace(/[\s,;:(–—-]+$/, '')}…`;
};

/** Append " | QuranVocab" when the title still fits in TITLE_MAX (and does not name the site already). */
export const brandTitle = (title: string): string =>
  title.includes(SITE_NAME) || len(title + BRAND_SUFFIX) > TITLE_MAX ? title : `${title}${BRAND_SUFFIX}`;

/** Description clipped to DESC_MAX. */
export const fitDescription = (s: string): string => clip(s, DESC_MAX);

/**
 * A description from sentences: `first` is always used (clipped if it alone is too long); each
 * following sentence is added only if the whole still fits in DESC_MAX, so nothing is cut mid-way.
 */
export const fitSentences = (first: string, ...more: (string | false | undefined)[]): string => {
  let out = clip(first, DESC_MAX);
  for (const m of more) {
    if (m && len(`${out} ${m}`) <= DESC_MAX) out = `${out} ${m}`;
  }
  return out;
};

/**
 * The short form of a gloss for titles: no parenthetical notes, first sense only
 * ("Void, empty (in 14:43 ...); the sense ..." -> "Void, empty").
 */
export const shortGloss = (s: string): string => {
  const noParens = s.replace(/\s*\([^)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '');
  return (noParens.split(/\s*[;–—]\s*|\s+-\s+/)[0] || s).trim();
};

/**
 * `prefix` + as many of `parts` as fit in TITLE_MAX (joined by `sep`); the first part is always
 * kept (clipped if needed). The result is not branded; pass it to SEO, which brands it if it fits.
 */
export const fitTitle = (prefix: string, parts: string[], sep = '; '): string => {
  const room = TITLE_MAX - len(prefix);
  const first = parts[0] ?? '';
  let out = len(first) > room ? clip(first, Math.max(room, 8)) : first;
  for (const p of parts.slice(1)) {
    if (len(prefix + out + sep + p) > TITLE_MAX) break;
    out += sep + p;
  }
  return prefix + out;
};

/** "Salah (صَلاة)", or just "Salah" when a long phrase would leave no room in the title. */
const headTerm = (tr: string, ar: string) => (len(`${tr} (${ar})`) > 36 ? tr : `${tr} (${ar})`);

export interface PageSeo {
  title: string;
  description: string;
}

// ---- Word pages: /word/<slug> ------------------------------------------------------------------
/**
 * Phrase words people search by a popular spelling ("bismillah meaning", "subhanallah meaning"):
 * the title leads with that spelling, and the page lists the spellings ("Also written as") while
 * keeping the site's transliteration in the heading. `title` is optional; without it the page uses
 * the normal word template (in-sha-allah: the /phrases pages target "inshallah meaning").
 * Phrase word pages use "in the Quran: Word by Word" titles so the /phrases/<slug> pages own "<phrase> meaning".
 */
export const PHRASE_SPELLINGS: Record<string, { name?: string; title?: string; aka: string[]; note?: string }> = {
  'bismillah-ir-rahman-ir-raheem': {
    name: 'Bismillah',
    title: 'Bismillah ir-Rahman ir-Raheem in the Quran: Word by Word',
    aka: ['Bismillahir Rahmanir Raheem', 'Bismillah ir-Rahman ir-Rahim', 'Bismillah'],
    note: 'The phrase is called the basmala.',
  },
  'al-hamdu-lillahi-rabbil-alameen': {
    name: 'Alhamdulillah',
    title: 'Alhamdulillahi Rabbil Alamin in the Quran: Word by Word',
    aka: ['Alhamdulillahi Rabbil Alamin', 'Alhamdulillah'],
    note: 'Saying it is called the tahmid.',
  },
  'allahu-akbar': {
    name: 'Allahu Akbar',
    title: 'Allahu Akbar in Arabic: Word by Word (الله أكبر)',
    aka: ['Allah-u-Akbar', 'Allah Akbar'],
    note: 'Saying it is called the takbir.',
  },
  'subhan-allah': {
    name: 'SubhanAllah',
    title: 'SubhanAllah in the Quran: Word by Word (سبحان الله)',
    aka: ['SubhanAllah', 'Subhanallah'],
    note: 'Saying it is called tasbih.',
  },
  'la-ilaha-illa-allah': {
    name: 'La ilaha illallah',
    title: 'La ilaha illallah in the Quran: Word by Word',
    aka: ['La ilaha illallah', 'Laa ilaaha illallah'],
    note: 'Saying it is called the tahlil.',
  },
  'in-sha-allah': {
    title: 'In sha Allah in the Quran: Word by Word (إن شاء الله)',
    aka: ['Inshallah', 'Insha Allah', "In shaa' Allah"],
  },
};

/** "Prayer" from "Prayer, salah (the ritual ...)": the first sense, for "How to say ... in Arabic". */
export const firstSense = (meaning: string, partOfSpeech?: string): string => {
  const g = shortGloss(meaning);
  return partOfSpeech === 'phrase' ? g : (g.split(/\s*,\s*/)[0] || g).trim();
};

export const wordSeo = (w: {
  /** Word id: phrase words get the title of their popular spelling (PHRASE_SPELLINGS). */
  id?: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  /** Root letters in Arabic (e.g. "ص ل و"). */
  root?: string;
  /** Occurrences in the Quran (0 when the word is not found verbatim). */
  count?: number;
  /** "Used 83 times in the Quran." or how the word relates to the Quran. */
  usage: string;
  /**
   * Set when the word is one of the 99 Names: the name page (/names-of-allah/<slug>) targets
   * "<name> meaning", so the word page uses a different pattern and the two never share a title.
   */
  divineName?: boolean;
}): PageSeo => {
  const tr = capitalize(w.transliteration.trim());
  const gloss = shortGloss(w.meaning);
  const Gloss = capitalize(gloss);
  const phrase = w.id ? PHRASE_SPELLINGS[w.id] : undefined;
  let title: string;
  if (phrase?.title) title = phrase.title;
  else if (w.divineName) title = fitTitle(`${headTerm(tr, w.arabic)} in the Quran: `, [gloss]);
  else {
    // "<Translit> Meaning in the Quran: <English> (<Arabic>)"; drop "in the Quran", then the Arabic.
    const options = [`${tr} Meaning in the Quran: ${Gloss} (${w.arabic})`, `${tr} Meaning: ${Gloss} (${w.arabic})`];
    title = options.find((t) => len(t) <= TITLE_MAX) ?? fitTitle(`${tr} Meaning: `, [Gloss]);
  }
  const n = w.count ?? 0;
  const head = phrase?.title && phrase.name ? phrase.name : tr;
  const lead =
    n > 0
      ? `${head} (${w.arabic}) means "${gloss}" and appears ${n.toLocaleString('en-US')} ${n === 1 ? 'time' : 'times'} in the Quran.`
      : `${head} (${w.arabic}) means "${gloss}".`;
  return {
    title,
    description: fitSentences(
      lead,
      n > 0 ? undefined : w.usage,
      w.root && `Root ${w.root}.`,
      'See example verses, the root family and audio.',
    ),
  };
};

// ---- Root pages: /root/<slug> ------------------------------------------------------------------
export const rootSeo = (r: {
  ar: string;
  slug: string;
  /** Core meaning, senses separated by "; ". */
  core: string;
  total: number;
  forms: number;
  /** Glosses of the most frequent forms. */
  topForms: string[];
}): PageSeo => {
  const senses = r.core.split(/\s*;\s*/).filter(Boolean).map((s, i) => (i === 0 ? capitalize(s) : s));
  const n = r.total.toLocaleString('en-US');
  const words = `${n} ${r.total === 1 ? 'word in the Quran comes' : 'words in the Quran come'} from it, in ${r.forms} ${r.forms === 1 ? 'form' : 'forms'}`;
  return {
    title: fitTitle(`${r.ar} (${r.slug}) Root Meaning: `, senses),
    description: fitSentences(
      `The Arabic root ${r.ar} (${r.slug}) means ${r.core}.`,
      len(`${words} (${r.topForms.join(', ')}).`) < 90 ? `${words} (${r.topForms.join(', ')}).` : `${words}.`,
      'Each form has an example verse.',
    ),
  };
};

// ---- Root letter hubs: /roots (first letter) and /roots/<letter> --------------------------------
export const rootLetterSeo = (l: { arabic: string; name: string; count: number }): PageSeo => ({
  title: `Quranic Roots Starting with ${l.arabic} (${l.name}): ${l.count} Roots`,
  description: fitDescription(
    `All ${l.count} Arabic roots in the Quran that begin with the letter ${l.arabic} (${l.name}), with each root's core meaning, its word forms and how often they occur.`,
  ),
});

// ---- Surah pages: /surah/<n> -------------------------------------------------------------------
/** "Al-Waqi'ah" -> "Al-Waqiah": the spelling people type (an apostrophe splits the word in search). */
export const searchSpelling = (s: string) => s.replace(/['ʿʾ‘’]/g, '');

export const surahSeo = (s: {
  number: number;
  name: string;
  arabic: string;
  meaning: string;
  ayahs: number;
  totalWords: number;
  wordCount: number;
  coveragePercent: number;
  topWords: string[];
  /** The page shows the full English translation (Saheeh International), ayah by ayah. */
  hasEnglish?: boolean;
}): PageSeo => {
  const pct = `${s.coveragePercent.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
  const name = searchSpelling(s.name);
  const base = `Surah ${name} in English: Word-by-Word Meaning`;
  const words = `${s.wordCount} Arabic ${s.wordCount === 1 ? 'word' : 'words'}`;
  return {
    title:
      s.wordCount > 0 || s.hasEnglish
        ? len(`${base} & Vocabulary`) <= TITLE_MAX
          ? `${base} & Vocabulary`
          : base
        : `Surah ${name} (${s.number}) Vocabulary`,
    description: s.hasEnglish
      ? fitSentences(
          `Surah ${name} (${s.arabic}, "${s.meaning}") in English: the Saheeh International translation of all ${s.ayahs} ayahs.`,
          s.wordCount > 0 && `Plus the meaning of its ${words}, word by word.`,
        )
      : s.wordCount > 0
        ? fitSentences(
            `Surah ${name} (${s.arabic}, "${s.meaning}") word by word: the English meaning of its ${words}, most frequent first.`,
            `Top words: ${s.topWords.join(', ')}.`,
            `They cover ${pct} of the surah.`,
          )
        : fitSentences(`Vocabulary of Surah ${name} (${s.arabic}, "${s.meaning}"): ${s.ayahs} ayahs and ${s.totalWords} words.`),
  };
};

// ---- Collection pages: /collections/<id> -------------------------------------------------------
/**
 * Collections are titled in the form people search ("Colors in Arabic"). `heading` is also the page's
 * H1; `title` may use {n} for the word count. Collections not listed use "<Name> in Arabic: N Quranic Words".
 */
const COLLECTION_SEO: Record<string, { heading: string; title: string }> = {
  colors: { heading: 'Colors in Arabic', title: 'Colors in Arabic: {n} Color Words from the Quran' },
  time: { heading: 'Days of the Week in Arabic & Time Words', title: 'Days of the Week in Arabic & Time Words' },
  family: { heading: 'Family Words in Arabic', title: 'Family in Arabic: {n} Family Words from the Quran' },
  prophets: { heading: 'Prophets in the Quran: Names in Arabic & English', title: 'Prophets in the Quran: Names in Arabic & English' },
  animals: { heading: 'Animals in Arabic', title: 'Animals in Arabic: Names of Animals in the Quran' },
  body: { heading: 'Body Parts in Arabic', title: 'Body Parts in Arabic: Quranic Words for the Body' },
  numbers: { heading: 'Numbers in Arabic', title: 'Numbers in Arabic: {n} Number Words in the Quran' },
  food: { heading: 'Food in Arabic', title: 'Food in Arabic: {n} Quranic Words for Food & Drink' },
  nature: { heading: 'Nature Words in Arabic', title: 'Nature in Arabic: {n} Quranic Words for Creation' },
  weather: { heading: 'Weather Words in Arabic', title: 'Weather in Arabic: {n} Quranic Words' },
  astronomy: { heading: 'Stars & Planets in Arabic', title: 'Stars & Astronomy in Arabic: {n} Quranic Words' },
  emotions: { heading: 'Emotions in Arabic', title: 'Emotions in Arabic: {n} Quranic Words for Feelings' },
  clothing: { heading: 'Clothing in Arabic', title: 'Clothing in Arabic: {n} Quranic Words' },
  directions: { heading: 'Directions in Arabic', title: 'Directions in Arabic: {n} Quranic Words' },
  afterlife: { heading: 'The Afterlife in the Quran: Arabic Words', title: 'Afterlife in the Quran: {n} Arabic Words & Meanings' },
  angels: { heading: 'Angels in the Quran: Arabic Words', title: 'Angels in the Quran: {n} Arabic Words & Names' },
  worship: { heading: 'Worship Words in Arabic', title: 'Worship in Arabic: {n} Quranic Words for Prayer & Ritual' },
  phrases: { heading: 'Quranic Phrases in Arabic', title: 'Quranic Phrases in Arabic: {n} Phrases & Meanings' },
  'quranic-stories': { heading: 'Stories in the Quran: Key Arabic Words', title: 'Stories in the Quran: {n} Key Arabic Words' },
  'divine-names': { heading: 'Names & Attributes of Allah in Arabic', title: 'Attributes of Allah in Arabic: {n} Quranic Words' },
  verbs: { heading: 'Common Arabic Verbs in the Quran', title: 'Common Arabic Verbs in the Quran: {n} Verbs' },
  particles: { heading: 'Arabic Particles & Prepositions', title: 'Arabic Particles & Prepositions: {n} Quranic Words' },
  grammar: { heading: 'Arabic Grammar Patterns in the Quran', title: 'Arabic Grammar Patterns: {n} Quranic Words' },
  etymology: { heading: 'Arabic Word Origins', title: 'Arabic Word Origins: {n} Quranic Words & Roots' },
  'advanced-theology': { heading: 'Islamic Theology Terms in Arabic', title: 'Islamic Theology Terms in Arabic: {n} Words' },
  'arabic-culture': { heading: 'Arabic Culture Words in the Quran', title: 'Arabic Culture in the Quran: {n} Words' },
  'daily-life': { heading: 'Everyday Arabic Words in the Quran', title: 'Everyday Arabic Words: {n} from the Quran' },
};

/** The H1 of a collection page (the search form, e.g. "Colors in Arabic"). */
export const collectionHeading = (c: { id: string; name: string }): string =>
  COLLECTION_SEO[c.id]?.heading ?? `${c.name} in Arabic`;

export const collectionSeo = (c: { id: string; name: string; description: string; count: number }): PageSeo => {
  const first = `${c.description.replace(/\.\s*$/, '')}.`;
  const words = `${c.count} Quranic Arabic ${c.count === 1 ? 'word' : 'words'}`;
  const long = `Learn ${words} with meanings, roots, example verses and recitation audio.`;
  const custom = COLLECTION_SEO[c.id]?.title.replace('{n}', String(c.count));
  const fallback = fitTitle(`${c.name} in Arabic: `, [`${c.count} Quranic ${c.count === 1 ? 'Word' : 'Words'}`]);
  return {
    title: custom && len(custom) <= TITLE_MAX ? custom : fallback,
    description: fitSentences(first, len(`${first} ${long}`) <= DESC_MAX ? long : `Learn ${words} with meanings and verses.`),
  };
};

// ---- 99 Names of Allah: /names-of-allah/<slug> -------------------------------------------------
export const nameSeo = (n: {
  n: number;
  tr: string;
  ar: string;
  en: string;
  meaning: string;
  /** Sentence on where the name is found (Quran / hadith). */
  statusText: string;
  /** The vocative form people search ("Ya Rahman"). */
  ya: string;
}): PageSeo => {
  const tr = searchSpelling(n.tr);
  // "<Name> Meaning: <English> | 99 Names of Allah (Ya <Name>)", shortened step by step to fit.
  const options = [
    `${tr} Meaning: ${n.en} | 99 Names of Allah (${n.ya})`,
    `${tr} Meaning: ${n.en} | 99 Names of Allah`,
    `${tr} Meaning: ${n.en} (${n.ya})`,
  ];
  return {
    title: options.find((t) => len(t) <= TITLE_MAX) ?? fitTitle(`${tr} Meaning: `, [n.en], ', '),
    description: fitSentences(
      `${tr} (${n.ar}) means "${n.en}".`,
      n.meaning,
      n.statusText,
      `Name ${n.n} of the 99 Names of Allah (Asmaul Husna).`,
    ),
  };
};

// ---- Hubs and one-off pages --------------------------------------------------------------------
export const HUB_SEO = {
  home: {
    title: 'Learn Quranic Arabic Vocabulary: Understand the Quran',
    description: (wordCount: number) =>
      `Learn ${wordCount} common words of the Quran with flashcards, quizzes and word pages showing root and meaning. Free, no account needed to start.`,
  },
  collections: {
    title: 'Quranic Arabic Vocabulary Lists by Theme',
    description: (count: number, words: number) =>
      `${count} themed lists of Quranic Arabic vocabulary (${words} words): prophets, afterlife, worship, nature and more, each with meanings, roots, verses and audio.`,
  },
  roots: {
    title: (count: number) => `Arabic Root Words in the Quran: All ${count.toLocaleString('en-US')} Roots`,
    heading: 'Arabic Root Words in the Quran',
    description: (count: number) =>
      `Arabic root words in the Quran: all ${count.toLocaleString('en-US')} roots, with each root's core meaning, every word form built from it, how often it occurs and an example verse.`,
  },
  surahs: {
    title: 'List of Surahs: All 114 Surahs of the Quran Word by Word',
    heading: 'List of Surahs of the Quran, Word by Word',
    description:
      'List of all 114 surahs of the Quran, Al-Fatihah to An-Nas: open a surah for its words and meanings in English, word by word. Juz Amma included.',
  },
  names: {
    title: '99 Names of Allah with Meaning (Asmaul Husna)',
    heading: '99 Names of Allah with Meaning (Asmaul Husna)',
    description: (inQuran: number) =>
      `The 99 Names of Allah with meaning (Asmaul Husna) in Arabic, transliteration and English: see which ${inQuran} are used of Allah in the Quran, with verses.`,
  },
  ramadan: {
    title: 'Ramadan Quran Plan: Words of Taraweeh & Laylatul Qadr',
  },
  blog: {
    title: 'Quranic Arabic Learning Blog',
    description: 'Articles on learning Quranic Arabic vocabulary: roots, word meanings, study methods and tips for understanding the Quran in Arabic.',
  },
} as const;

// ---- JSON-LD helpers ---------------------------------------------------------------------------
/** schema.org ItemList of links (hub pages, collections, surah word lists). */
export const itemListLd = (name: string, path: string, items: { name: string; path: string }[]) => ({
  '@type': 'ItemList',
  '@id': `${SITE_URL}${path}#list`,
  name,
  numberOfItems: items.length,
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    url: `${SITE_URL}${it.path}`,
  })),
});
