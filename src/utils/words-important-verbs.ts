
import { Word } from './vocabulary-types';

export const importantVerbsWords: Word[] = [
  {
    id: 'kana',
    arabic: 'كان',
    transliteration: 'Kana',
    meaning: 'Was/were',
    root: 'كون',
    partOfSpeech: 'verb',
    level: 'beginner',
    frequency: 1358,
    location: { surah: 2, ayah: 117, position: 10 },
    frequencyVerified: true,
    tags: ['verbs', 'existence', 'past'],
    collections: ['verbs'],
    examples: [
      {
        surah: 2,
        ayah: 117,
        arabicText: 'بَدِيعُ السَّمَاوَاتِ وَالْأَرْضِ ۖ وَإِذَا قَضَىٰ أَمْرًا فَإِنَّمَا يَقُولُ لَهُ كُن فَيَكُونُ',
        translation: 'Originator of the heavens and the earth. When He decrees a matter, He only says to it, "Be," and it is'
      }
    ]
  },
  {
    id: 'qala',
    arabic: 'قال',
    transliteration: 'Qala',
    meaning: 'Said',
    root: 'قول',
    partOfSpeech: 'verb',
    level: 'beginner',
    frequency: 1618,
    location: { surah: 2, ayah: 30, position: 2 },
    frequencyVerified: true,
    tags: ['verbs', 'speech', 'communication'],
    collections: ['verbs'],
    examples: [
      {
        surah: 2,
        ayah: 30,
        arabicText: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ',
        translation: 'And [mention, O Muhammad], when your Lord said to the angels'
      }
    ]
  },
  {
    id: 'faala',
    arabic: 'فعل',
    transliteration: 'Fa\'ala',
    meaning: 'Did',
    root: 'فعل',
    partOfSpeech: 'verb',
    level: 'beginner',
    frequency: 88,
    location: { surah: 105, ayah: 1, position: 4 },
    frequencyVerified: true,
    tags: ['verbs', 'action', 'doing'],
    collections: ['verbs'],
    examples: [
      {
        surah: 105,
        ayah: 1,
        arabicText: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَـٰبِ ٱلْفِيلِ',
        translation: 'Have you not considered how your Lord dealt with the companions of the elephant?'
      }
    ]
  },
  {
    id: 'dhahaba',
    arabic: 'ذهب',
    transliteration: 'Dhahaba',
    meaning: 'Went',
    root: 'ذهب',
    partOfSpeech: 'verb',
    level: 'beginner',
    frequency: 35,
    location: { surah: 2, ayah: 17, position: 10 },
    frequencyVerified: true,
    tags: ['verbs', 'movement', 'travel'],
    collections: ['verbs'],
    examples: [
      {
        surah: 2,
        ayah: 17,
        arabicText: 'ذَهَبَ اللَّهُ بِنُورِهِمْ',
        translation: 'Allah took away their light'
      }
    ]
  },
  {
    id: 'jaa',
    arabic: 'جاء',
    transliteration: 'Ja\'a',
    meaning: 'Came',
    root: 'جيأ',
    partOfSpeech: 'verb',
    level: 'beginner',
    frequency: 278,
    location: { surah: 2, ayah: 87, position: 18 },
    frequencyVerified: true,
    tags: ['verbs', 'coming', 'arrival'],
    collections: ['verbs'],
    examples: [
      {
        surah: 2,
        ayah: 87,
        arabicText: 'أَفَكُلَّمَا جَاءَكُمْ رَسُولٌ بِمَا لَا تَهْوَىٰ أَنفُسُكُمُ',
        translation: 'But whenever a messenger came to you, [O Children of Israel], with what your souls did not desire'
      }
    ]
  },
  {
    id: 'alima',
    arabic: 'علم',
    transliteration: 'Alima',
    meaning: 'Knew',
    root: 'علم',
    partOfSpeech: 'verb',
    level: 'beginner',
    frequency: 382,
    location: { surah: 81, ayah: 14, position: 1 },
    frequencyVerified: true,
    tags: ['verbs', 'knowledge', 'understanding'],
    collections: ['verbs', 'knowledge'],
    examples: [
      {
        surah: 81,
        ayah: 14,
        arabicText: 'عَلِمَتْ نَفْسٌ مَّآ أَحْضَرَتْ',
        translation: 'A soul will [then] know what it has brought [with it]'
      }
    ]
  },
  {
    id: 'raa',
    arabic: 'رأى',
    transliteration: 'Ra\'a',
    meaning: 'Saw',
    root: 'رأي',
    partOfSpeech: 'verb',
    level: 'beginner',
    frequency: 271,
    location: { surah: 12, ayah: 4, position: 7 },
    frequencyVerified: true,
    tags: ['verbs', 'sight', 'perception'],
    collections: ['verbs'],
    examples: [
      {
        surah: 12,
        ayah: 4,
        arabicText: 'إِذْ قَالَ يُوسُفُ لِأَبِيهِ يَا أَبَتِ إِنِّي رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا',
        translation: 'When Joseph said to his father, "O my father, indeed I have seen eleven stars"'
      }
    ]
  },
  {
    id: 'samia',
    arabic: 'سمع',
    transliteration: 'Sami\'a',
    meaning: 'Heard',
    root: 'سمع',
    partOfSpeech: 'verb',
    level: 'beginner',
    frequency: 78,
    location: { surah: 2, ayah: 93, position: 13 },
    frequencyVerified: true,
    tags: ['verbs', 'hearing', 'perception'],
    collections: ['verbs'],
    examples: [
      {
        surah: 2,
        ayah: 93,
        arabicText: 'قَالُوا۟ سَمِعْنَا وَعَصَيْنَا',
        translation: 'They said, "We hear and disobey"'
      }
    ]
  }
];
