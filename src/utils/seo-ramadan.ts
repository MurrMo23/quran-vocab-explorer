// Paths, titles and meta descriptions for the Ramadan event pages (/laylatul-qadr, /taraweeh, /itikaf).
// The Ramadan phrase pages (/phrases/ramadan-mubarak, ...) use phraseSeo in seo-pillars.ts, and /ramadan
// itself uses HUB_SEO.ramadan in seo-templates.ts. Same limits as seo-templates.ts: titles within TITLE_MAX
// (SEO adds " | QuranVocab" only when it fits), descriptions within DESC_MAX. Check with: npm run seo:check
import { fitSentences } from './seo-templates';
import type { PageSeo } from './seo-templates';

export const RAMADAN_HUB_PATH = '/ramadan';

export const RAMADAN_PATHS = {
  laylatulQadr: '/laylatul-qadr',
  taraweeh: '/taraweeh',
  itikaf: '/itikaf',
} as const;

/** Phrase pages that belong to the Ramadan cluster (slugs in src/utils/phrases.ts). */
export const RAMADAN_PHRASE_SLUGS = ['ramadan-mubarak', 'ramadan-kareem', 'allahumma-innaka-afuwwun', 'eid-mubarak'] as const;

/** Every Ramadan event page (prerendered and in the pages sitemap). */
export const ramadanPages = (): string[] => Object.values(RAMADAN_PATHS);

const n = (x: number) => x.toLocaleString('en-US');

export const laylatulQadrSeo = (): PageSeo => ({
  title: 'Laylatul Qadr: Meaning, Surah Al-Qadr in English & Dua',
  description: fitSentences(
    'Laylatul Qadr means the Night of Decree (or Night of Power). Surah Al-Qadr word by word in English with audio, when the night is sought, and its dua.',
  ),
});

export const taraweehSeo = (): PageSeo => ({
  title: 'Taraweeh Meaning: What Is Taraweeh Prayer in Ramadan?',
  description: fitSentences(
    'Taraweeh (تراويح) means “rests”: the night prayer of Ramadan. What it is, how much Quran is recited each night, and the Quran words you will hear most.',
  ),
});

export const itikafSeo = (rootTotal: number): PageSeo => ({
  title: 'Itikaf Meaning: I’tikaf in Ramadan and the Quran',
  description: fitSentences(
    `Iʿtikāf (اعتكاف) means staying in the mosque devoted to worship, often in Ramadan’s last ten days. Its root ع ك ف occurs ${n(rootTotal)} times in the Quran, as in 2:187.`,
  ),
});
