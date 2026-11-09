// The Ramadan page cluster: /ramadan, the event pages (/laylatul-qadr, /taraweeh, /itikaf) and the
// Ramadan phrase pages, as links for the hub's "Ramadan words & phrases" section and each page's footer.
import { phrasePath } from './phrases';
import { wordPath } from './quran-pages';
import { RAMADAN_PATHS } from './seo-ramadan';

/** Every page of the Ramadan cluster, for the hub section and the "More for Ramadan" links. */
export const RAMADAN_LINKS: { to: string; label: string; ar: string; note: string; primary?: boolean }[] = [
  { to: phrasePath('ramadan-mubarak'), label: 'Ramadan Mubarak meaning', ar: 'رمضان مبارك', note: '“Blessed Ramadan”, and how to reply', primary: true },
  { to: RAMADAN_PATHS.laylatulQadr, label: 'Laylatul Qadr', ar: 'ليلة القدر', note: 'The Night of Decree and Surah Al-Qadr word by word', primary: true },
  { to: RAMADAN_PATHS.taraweeh, label: 'Taraweeh', ar: 'تراويح', note: 'The night prayer of Ramadan and the words you hear in it', primary: true },
  { to: phrasePath('ramadan-kareem'), label: 'Ramadan Kareem meaning', ar: 'رمضان كريم', note: '“Generous Ramadan”' },
  { to: phrasePath('allahumma-innaka-afuwwun'), label: 'Laylatul Qadr dua', ar: 'اللهم إنك عفو', note: 'Allahumma innaka afuwwun, word by word' },
  { to: RAMADAN_PATHS.itikaf, label: 'Iʿtikaf', ar: 'اعتكاف', note: 'Staying in the mosque for worship' },
  { to: wordPath('siyam'), label: 'Siyam: fasting in Arabic', ar: 'صيام', note: 'The Quran’s word for the fast (2:183)' },
  { to: phrasePath('eid-mubarak'), label: 'Eid Mubarak meaning', ar: 'عيد مبارك', note: '“Blessed Eid”, and how to reply' },
];
