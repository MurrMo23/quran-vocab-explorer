// The Ramadan 30-day vocabulary plan (/ramadan), built deterministically from the corpus data.
//
// Ordering: every word gets a score = its occurrences in the Quran + JUZ_AMMA_WEIGHT x its occurrences
// in Juz Amma (the short surahs recited most often in prayer), so the first days teach the words you
// will hear most, in taraweeh (which usually covers the whole Quran) and in every other prayer.
// A few days are themed: Day 1 is Al-Fatiha (read in every rak'ah), Day 27 Surah Al-Qadr (the night
// many seek Laylat al-Qadr), Day 30 the last three surahs. A themed day takes its surah's words that
// were not taught earlier (up to THEME_MAX) and is topped up to WORDS_PER_DAY by score; words of a
// later themed day are kept for that day unless they are among the CORE most useful words.
import { getWordById } from '@/utils/vocabulary';
import {
  QURAN_WORD_TOKENS,
  canonicalQuranWords,
  juzAmmaCounts,
  quranCount,
  salahSurahWordIds,
  surahWordIds,
  uniqueWordIds,
} from '@/utils/word-lists';

/**
 * Expected first day of fasting for Ramadan 1448 AH. The exact date depends on the moon sighting and
 * may differ by a day by country; the first taraweeh prayer is the night before.
 */
export const RAMADAN_START = { year: 2027, month: 2, day: 8 } as const;
export const RAMADAN_START_LABEL = '8 February 2027';
export const RAMADAN_DAYS = 30;
export const WORDS_PER_DAY = 10;
const THEME_MAX = 12;
const CORE = 100;
const JUZ_AMMA_WEIGHT = 5;

export interface RamadanTheme {
  title: string;
  note: string;
}

export interface RamadanDay {
  day: number;
  words: string[];
  theme?: RamadanTheme;
  /** Words of the themed surah already taught on earlier days. */
  revisit: string[];
}

interface ThemeDef extends RamadanTheme {
  day: number;
  ids: () => string[];
}

const THEMES: ThemeDef[] = [
  {
    day: 1,
    title: 'Al-Fatiha',
    note: 'The surah recited in every rak‘ah of every prayer.',
    ids: () => salahSurahWordIds(1),
  },
  {
    day: 27,
    title: 'Surah Al-Qadr',
    note: 'The surah about Laylat al-Qadr, sought in the last ten nights.',
    ids: () => surahWordIds(97),
  },
  {
    day: 30,
    title: 'Al-Ikhlas, Al-Falaq and An-Nas',
    note: 'The last three surahs of the Quran, often recited to close a khatm.',
    ids: () => uniqueWordIds([...salahSurahWordIds(112), ...surahWordIds(112), ...surahWordIds(113), ...surahWordIds(114)]),
  },
];

/** Plan words ranked by score (highest first). */
export function rankedPlanWords(): string[] {
  const { counts } = juzAmmaCounts();
  const score = (id: string) => quranCount(id) + JUZ_AMMA_WEIGHT * (counts.get(id) ?? 0);
  return canonicalQuranWords()
    .map((w) => ({ id: w.id, s: score(w.id) }))
    .sort((a, b) => b.s - a.s || (a.id < b.id ? -1 : 1))
    .map((x) => x.id);
}

let planCache: RamadanDay[] | null = null;

export function getRamadanPlan(): RamadanDay[] {
  if (planCache) return planCache;
  const ranked = rankedPlanWords();
  const rank = new Map(ranked.map((id, i) => [id, i]));
  const themeIds = new Map(THEMES.map((t) => [t.day, t.ids()]));
  // Words kept for a later themed day (the earliest one that has them).
  const reservedFor = new Map<string, number>();
  for (const t of THEMES) {
    for (const id of themeIds.get(t.day)!) {
      if ((rank.get(id) ?? Infinity) >= CORE && !reservedFor.has(id)) reservedFor.set(id, t.day);
    }
  }

  const used = new Set<string>();
  const days: RamadanDay[] = [];
  for (let d = 1; d <= RAMADAN_DAYS; d++) {
    const theme = THEMES.find((t) => t.day === d);
    const tIds = theme ? themeIds.get(d)! : [];
    const words = tIds.filter((id) => !used.has(id)).slice(0, THEME_MAX);
    const revisit = tIds.filter((id) => used.has(id));
    for (const id of words) used.add(id);
    for (const id of ranked) {
      if (words.length >= WORDS_PER_DAY) break;
      if (used.has(id) || (reservedFor.get(id) ?? 0) > d) continue;
      words.push(id);
      used.add(id);
    }
    days.push({
      day: d,
      words: words.filter((id) => !!getWordById(id)),
      theme: theme ? { title: theme.title, note: theme.note } : undefined,
      revisit,
    });
  }
  planCache = days;
  return days;
}

/** Local calendar date of plan day `day` (1-based). */
export function ramadanDayDate(day: number): Date {
  return new Date(RAMADAN_START.year, RAMADAN_START.month - 1, RAMADAN_START.day + day - 1);
}

export type RamadanPhase = { kind: 'before'; daysUntil: number } | { kind: 'during'; day: number } | { kind: 'after' };

/** Where `now` (local time) falls relative to the expected Ramadan dates. */
export function ramadanPhase(now: Date = new Date()): RamadanPhase {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = ramadanDayDate(1);
  const diff = Math.round((today.getTime() - start.getTime()) / 86_400_000);
  if (diff < 0) return { kind: 'before', daysUntil: -diff };
  if (diff < RAMADAN_DAYS) return { kind: 'during', day: diff + 1 };
  return { kind: 'after' };
}

// --- Calendar file ------------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0');
const icsEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Fold a content line at 75 octets (RFC 5545 §3.1). */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let cur = '';
  let curLen = 0;
  for (const ch of line) {
    const len = new TextEncoder().encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (curLen + len > limit) {
      parts.push(cur);
      cur = '';
      curLen = 0;
    }
    cur += ch;
    curLen += len;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}

export interface IcsOptions {
  /** Absolute site URL, e.g. https://quranvocab.com */
  origin?: string;
  now?: Date;
  hour?: number;
}

/**
 * An iCalendar file with one reminder per plan day at 20:00 (floating local time, so it rings at 8 pm
 * wherever the learner is), each with a 15-minute event and an alert at the start.
 */
export function buildRamadanIcs({ origin = 'https://quranvocab.com', now = new Date(), hour = 20 }: IcsOptions = {}): string {
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QuranVocab//Ramadan Vocabulary Plan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:QuranVocab Ramadan plan',
  ];
  for (const d of getRamadanPlan()) {
    const date = ramadanDayDate(d.day);
    const ymd = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
    const words = d.words
      .map((id) => getWordById(id))
      .filter((w) => !!w)
      .map((w) => w!.transliteration)
      .join(', ');
    const url = `${origin}/ramadan#day-${d.day}`;
    const title = `Ramadan vocabulary – Day ${d.day}${d.theme ? `: ${d.theme.title}` : ''}`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:qv-ramadan-${RAMADAN_START.year}-day-${d.day}@quranvocab.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${ymd}T${pad(hour)}0000`,
      'DURATION:PT15M',
      `SUMMARY:${icsEscape(title)}`,
      `DESCRIPTION:${icsEscape(`Today's ${d.words.length} words: ${words}.\nStart: ${url}\n(Ramadan dates depend on the moon sighting.)`)}`,
      `URL:${url}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${icsEscape(title)}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Mon 8 Feb" (fixed English format so the server and the browser render the same text). */
export const formatPlanDate = (d: Date) => `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;

/** Share (0-100, one decimal) of the Quran's and Juz Amma's words that are forms of the plan words. */
export function ramadanPlanCoverage(): { words: number; quranPercent: number; juzAmmaPercent: number } {
  const ids = getRamadanPlan().flatMap((d) => d.words);
  const { counts, tokens } = juzAmmaCounts();
  const q = ids.reduce((n, id) => n + quranCount(id), 0);
  const j = ids.reduce((n, id) => n + (counts.get(id) ?? 0), 0);
  const pct = (a: number, b: number) => Math.round((1000 * a) / Math.max(1, b)) / 10;
  return { words: ids.length, quranPercent: pct(q, QURAN_WORD_TOKENS), juzAmmaPercent: pct(j, tokens) };
}
