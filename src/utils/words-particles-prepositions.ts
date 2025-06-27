
import { Word } from './vocabulary-types';

export const particlesAndPrepositionsWords: Word[] = [
  {
    id: 'fi',
    arabic: 'في',
    transliteration: 'Fi',
    meaning: 'In, at',
    root: 'في',
    partOfSpeech: 'preposition',
    level: 'beginner',
    frequency: 1204,
    tags: ['preposition', 'location', 'basic'],
    collections: ['particles'],
    examples: [
      {
        surah: 1,
        ayah: 1,
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful'
      }
    ]
  },
  {
    id: 'min',
    arabic: 'من',
    transliteration: 'Min',
    meaning: 'From, of',
    root: 'من',
    partOfSpeech: 'preposition',
    level: 'beginner',
    frequency: 1595,
    tags: ['preposition', 'source', 'basic'],
    collections: ['particles'],
    examples: [
      {
        surah: 2,
        ayah: 2,
        arabicText: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
        translation: 'This is the Book about which there is no doubt, a guidance for those conscious of Allah'
      }
    ]
  },
  {
    id: 'ila',
    arabic: 'إلى',
    transliteration: 'Ila',
    meaning: 'To, towards',
    root: 'إلي',
    partOfSpeech: 'preposition',
    level: 'beginner',
    frequency: 747,
    tags: ['preposition', 'direction', 'basic'],
    collections: ['particles'],
    examples: [
      {
        surah: 1,
        ayah: 6,
        arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        translation: 'Guide us to the straight path'
      }
    ]
  },
  {
    id: 'ala',
    arabic: 'على',
    transliteration: 'Ala',
    meaning: 'On, upon',
    root: 'علو',
    partOfSpeech: 'preposition',
    level: 'beginner',
    frequency: 904,
    tags: ['preposition', 'position', 'basic'],
    collections: ['particles'],
    examples: [
      {
        surah: 2,
        ayah: 5,
        arabicText: 'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ',
        translation: 'Those are upon [right] guidance from their Lord'
      }
    ]
  },
  {
    id: 'an',
    arabic: 'عن',
    transliteration: 'An',
    meaning: 'About, from',
    root: 'عن',
    partOfSpeech: 'preposition',
    level: 'beginner',
    frequency: 180,
    tags: ['preposition', 'concerning', 'basic'],
    collections: ['particles'],
    examples: [
      {
        surah: 2,
        ayah: 186,
        arabicText: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي',
        translation: 'And when My servants ask you, [O Muhammad], concerning Me'
      }
    ]
  },
  {
    id: 'maa',
    arabic: 'مع',
    transliteration: 'Ma\'a',
    meaning: 'With',
    root: 'مع',
    partOfSpeech: 'preposition',
    level: 'beginner',
    frequency: 76,
    tags: ['preposition', 'accompaniment', 'basic'],
    collections: ['particles'],
    examples: [
      {
        surah: 2,
        ayah: 153,
        arabicText: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
        translation: 'Indeed, Allah is with the patient'
      }
    ]
  },
  {
    id: 'bad',
    arabic: 'بعد',
    transliteration: 'Ba\'d',
    meaning: 'After',
    root: 'بعد',
    partOfSpeech: 'preposition',
    level: 'beginner',
    frequency: 120,
    tags: ['preposition', 'time', 'basic'],
    collections: ['particles', 'time'],
    examples: [
      {
        surah: 2,
        ayah: 27,
        arabicText: 'الَّذِينَ يَنقُضُونَ عَهْدَ اللَّهِ مِن بَعْدِ مِيثَاقِهِ',
        translation: 'Who break the covenant of Allah after contracting it'
      }
    ]
  },
  {
    id: 'qabl',
    arabic: 'قبل',
    transliteration: 'Qabl',
    meaning: 'Before',
    root: 'قبل',
    partOfSpeech: 'preposition',
    level: 'beginner',
    frequency: 83,
    tags: ['preposition', 'time', 'basic'],
    collections: ['particles', 'time'],
    examples: [
      {
        surah: 2,
        ayah: 25,
        arabicText: 'كُلَّمَا رُزِقُوا مِنْهَا مِن ثَمَرَةٍ رِّزْقًا ۙ قَالُوا هَٰذَا الَّذِي رُزِقْنَا مِن قَبْلُ',
        translation: 'Every time they are provided with a provision of fruit therefrom, they will say, "This is what we were provided with before"'
      }
    ]
  }
];
