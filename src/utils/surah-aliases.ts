// Other names and popular spellings of surahs, shown as "Also known as" on /surah/<n> pages.
// The rule-based spellings (no ayn/hamza marks, no article) come first; EXTRA adds alternative names
// used in the tradition (e.g. Bara'ah for At-Tawbah) and common English spellings people search.

const EXTRA: Record<number, string[]> = {
  1: ['Fatiha', 'Al-Fatiha', 'Umm al-Kitab'],
  2: ['Baqara'],
  3: ['Al-Imran', 'Aal-e-Imran'],
  9: ['Bara’ah'],
  17: ['Bani Isra’il'],
  18: ['Kahaf'],
  20: ['Taha'],
  36: ['Yasin', 'Yaseen', 'Ya Seen'],
  38: ['Saad'],
  40: ['Al-Mu’min'],
  47: ['Al-Qital'],
  50: ['Qaaf'],
  56: ['Waqia'],
  62: ['Jumma', 'Jummah'],
  67: ['Tabarak'],
  76: ['Ad-Dahr'],
  87: ['Ala'],
  93: ['Dhuha', 'Zuha'],
  94: ['Al-Inshirah', 'Alam Nashrah'],
  99: ['Zilzal', 'Az-Zilzal'],
  108: ['Kauthar', 'Kausar'],
  109: ['Kafiroon'],
  111: ['Al-Lahab', 'Tabbat'],
  112: ['Ikhlaas', 'At-Tawhid'],
  114: ['Naas'],
};

/** "Surah Kahf, Al Kahf, Kahaf" style names for surah `n` whose site name is `name` (e.g. "Al-Kahf"). */
export const getSurahAliases = (n: number, name: string): string[] => {
  const plain = name.replace(/['ʿʾ‘’]/g, '');
  const m = plain.match(/^(A[a-z]{1,2})-(.+)$/);
  const ruled = m ? [plain, `${m[1]} ${m[2]}`, m[2]] : [plain];
  const out = [...ruled, ...(EXTRA[n] ?? [])].filter((v) => v !== name);
  return [...new Set(out)];
};
