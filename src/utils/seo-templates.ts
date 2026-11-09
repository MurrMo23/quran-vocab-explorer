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
export const wordSeo = (w: {
  arabic: string;
  transliteration: string;
  meaning: string;
  /** Root letters in Arabic (e.g. "ص ل و"). */
  root?: string;
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
  const head = headTerm(tr, w.arabic);
  return {
    title: w.divineName ? fitTitle(`${head} in the Quran: `, [gloss]) : fitTitle(`${head} Meaning: `, [gloss]),
    description: fitSentences(
      `${tr} (${w.arabic}) means "${gloss}" in Quranic Arabic.`,
      w.root && `Root ${w.root}.`,
      w.usage,
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
    title: fitTitle(`Root ${r.ar} (${r.slug}) Meaning: `, senses),
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
}): PageSeo => {
  const pct = `${s.coveragePercent.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
  return {
    title:
      s.wordCount > 0
        ? fitTitle(`Surah ${s.name} Vocabulary: `, [`${s.wordCount} ${s.wordCount === 1 ? 'Word' : 'Words'} & Meanings`])
        : `Surah ${s.name} (${s.number}) Vocabulary`,
    description:
      s.wordCount > 0
        ? fitSentences(
            `Learn the ${s.wordCount} Arabic ${s.wordCount === 1 ? 'word' : 'words'} of Surah ${s.name} (${s.arabic}, "${s.meaning}") with their meanings.`,
            `Most frequent first: ${s.topWords.join(', ')}.`,
            `They cover ${pct} of the surah.`,
          )
        : fitSentences(`Vocabulary of Surah ${s.name} (${s.arabic}, "${s.meaning}"): ${s.ayahs} ayahs and ${s.totalWords} words.`),
  };
};

// ---- Collection pages: /collections/<id> -------------------------------------------------------
export const collectionSeo = (c: { name: string; description: string; count: number }): PageSeo => {
  const first = `${c.description.replace(/\.\s*$/, '')}.`;
  const words = `${c.count} Quranic Arabic ${c.count === 1 ? 'word' : 'words'}`;
  const long = `Learn ${words} with meanings, roots, example verses and recitation audio.`;
  return {
    title: fitTitle(`${c.name}: `, [`${c.count} Quranic Arabic ${c.count === 1 ? 'Word' : 'Words'}`]),
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
}): PageSeo => {
  const base = fitTitle(`${headTerm(n.tr, n.ar)} Meaning: `, [n.en], ', ');
  const withSection = `${base} | 99 Names of Allah`;
  return {
    title: len(withSection) <= TITLE_MAX ? withSection : base,
    description: fitSentences(
      `${n.tr} (${n.ar}) means "${n.en}".`,
      n.meaning,
      n.statusText,
      `Name ${n.n} of the 99 Names of Allah.`,
    ),
  };
};

// ---- Hubs and one-off pages --------------------------------------------------------------------
export const HUB_SEO = {
  home: {
    title: 'QuranVocab — Learn the Words of the Quran',
    description: (wordCount: number) =>
      `Learn ${wordCount} common words of the Quran with flashcards, quizzes and word pages showing root and meaning. Free, no account needed to start.`,
  },
  collections: {
    title: 'Quranic Arabic Vocabulary Lists by Theme',
    description: (count: number, words: number) =>
      `${count} themed lists of Quranic Arabic vocabulary (${words} words): prophets, afterlife, worship, nature and more, each with meanings, roots, verses and audio.`,
  },
  roots: {
    title: (count: number) => `Quranic Arabic Roots: All ${count.toLocaleString('en-US')} Roots & Meanings`,
    description: (count: number) =>
      `Every Arabic root in the Quran (${count.toLocaleString('en-US')}), with its core meaning, all the word forms built from it, how often each occurs and an example verse.`,
  },
  surahs: {
    title: 'Surah Vocabulary: Word Lists for All 114 Surahs',
    description:
      'The Arabic words of every surah, from Al-Fatihah to An-Nas, ordered by how often they occur, with how much of the surah they cover. Juz Amma included.',
  },
  names: {
    title: '99 Names of Allah: Meanings, Arabic & Quran Verses',
    description: (inQuran: number) =>
      `All 99 Names of Allah (Asma ul Husna) in Arabic with transliteration and meaning: see which ${inQuran} are used of Allah in the Quran, with verses and recitation.`,
  },
  ramadan: {
    title: 'Ramadan Quran Vocabulary Plan: 30 Days of Words',
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
