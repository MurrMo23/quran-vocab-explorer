// Shared display helpers for the public collection pages (index cards and detail page).
import type { LucideIcon } from 'lucide-react';
import {
  Bird,
  BookMarked,
  BookOpen,
  BookText,
  Building2,
  Clock,
  CloudRain,
  Coins,
  Compass,
  Crown,
  Feather,
  Footprints,
  GraduationCap,
  Hammer,
  Hash,
  Heart,
  HeartHandshake,
  Home,
  Hourglass,
  Lamp,
  Leaf,
  Lightbulb,
  Link2,
  Map,
  Moon,
  Mountain,
  Orbit,
  Palette,
  PersonStanding,
  Quote,
  Scale,
  ScrollText,
  Shield,
  Shirt,
  Sparkles,
  Sprout,
  Star,
  Stethoscope,
  Sun,
  Sunrise,
  Tent,
  Type,
  Users,
  UsersRound,
  Wheat,
  Zap,
} from 'lucide-react';
import type { Word } from '@/utils/vocabulary-types';

const ICONS: Record<string, LucideIcon> = {
  faith: Sparkles,
  prophets: Lamp,
  ethics: Scale,
  afterlife: Hourglass,
  worship: Moon,
  community: Users,
  knowledge: Lightbulb,
  nature: Leaf,
  'divine-names': Star,
  colors: Palette,
  numbers: Hash,
  body: PersonStanding,
  angels: Feather,
  books: BookOpen,
  people: UsersRound,
  morality: HeartHandshake,
  time: Clock,
  directions: Compass,
  verbs: Zap,
  particles: Link2,
  phrases: Quote,
  actions: Footprints,
  weather: CloudRain,
  family: Home,
  emotions: Heart,
  food: Wheat,
  travel: Map,
  animals: Bird,
  clothing: Shirt,
  business: Coins,
  governance: Crown,
  warfare: Shield,
  architecture: Building2,
  geography: Mountain,
  medicine: Stethoscope,
  crafts: Hammer,
  astronomy: Orbit,
  grammar: Type,
  'advanced-theology': GraduationCap,
  'daily-life': Sun,
  'spiritual-states': Sunrise,
  'quranic-stories': ScrollText,
  'arabic-culture': Tent,
  etymology: Sprout,
};

/** Icon for a collection id (custom collections get a bookmark, unknown ids a book). */
export const collectionIcon = (id: string): LucideIcon =>
  ICONS[id] ?? (id.startsWith('custom-') ? BookMarked : BookText);

export type Level = Word['level'];
export const LEVELS: readonly Level[] = ['beginner', 'intermediate', 'advanced'];

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** Text colour per level; each passes WCAG AA on card and background in both themes. */
export const LEVEL_TEXT: Record<Level, string> = {
  beginner: 'text-primary',
  intermediate: 'text-gold-text',
  advanced: 'text-[#6B3FA0] dark:text-[#C3A6F0]',
};

/** Solid fill per level, for small bars. */
export const LEVEL_FILL: Record<Level, string> = {
  beginner: 'bg-primary',
  intermediate: 'bg-gold',
  advanced: 'bg-[#6B3FA0] dark:bg-[#C3A6F0]',
};

export type LevelCounts = Record<Level, number>;

export const countLevels = (words: readonly Pick<Word, 'level'>[]): LevelCounts => {
  const counts: LevelCounts = { beginner: 0, intermediate: 0, advanced: 0 };
  for (const w of words) if (w.level in counts) counts[w.level] += 1;
  return counts;
};

/** "6 beginner · 16 intermediate · 12 advanced", leaving out empty levels. */
export const levelSplitText = (counts: LevelCounts): string =>
  LEVELS.filter((l) => counts[l] > 0)
    .map((l) => `${counts[l]} ${l}`)
    .join(' · ');

/**
 * SearchBar's input is styled for light mode only; these descendant selectors restyle it with
 * theme tokens (and a 44px target) without changing its behaviour.
 */
export const SEARCH_BAR_CLASS =
  '[&_input]:h-11 [&_input]:bg-card [&_input]:text-foreground [&_input]:border-2 [&_input]:border-border [&_input]:placeholder:text-muted-foreground [&>div.absolute]:bg-card [&>div.absolute]:border-border';
