
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
    frequency: 1722,
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
    frequency: 107,
    tags: ['verbs', 'action', 'doing'],
    collections: ['verbs'],
    examples: [
      {
        surah: 2,
        ayah: 74,
        arabicText: 'ثُمَّ قَسَتْ قُلُوبُكُم مِّن بَعْدِ ذَٰلِكَ فَهِيَ كَالْحِجَارَةِ أَوْ أَشَدُّ قَسْوَةً',
        translation: 'Then your hearts became hardened after that, being like stones or even harder'
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
    frequency: 45,
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
    frequency: 277,
    tags: ['verbs', 'coming', 'arrival'],
    collections: ['verbs'],
    examples: [
      {
        surah: 2,
        ayah: 87,
        arabicText: 'فَكُلَّمَا جَاءَكُمْ رَسُولٌ بِمَا لَا تَهْوَىٰ أَنفُسُكُمُ',
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
    frequency: 854,
    tags: ['verbs', 'knowledge', 'understanding'],
    collections: ['verbs', 'knowledge'],
    examples: [
      {
        surah: 2,
        ayah: 31,
        arabicText: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',
        translation: 'And He taught Adam the names - all of them'
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
    frequency: 328,
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
    frequency: 185,
    tags: ['verbs', 'hearing', 'perception'],
    collections: ['verbs'],
    examples: [
      {
        surah: 2,
        ayah: 93,
        arabicText: 'وَقَالُوا سَمِعْنَا وَعَصَيْنَا',
        translation: 'And they said, "We hear and disobey"'
      }
    ]
  }
];
