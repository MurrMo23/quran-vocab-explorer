
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
    frequency: 1701,
    location: { surah: 85, ayah: 22, position: 1 },
    frequencyVerified: true,
    tags: ['preposition', 'location', 'basic'],
    collections: ['particles'],
    examples: [
      {
        surah: 85,
        ayah: 22,
        arabicText: 'فِى لَوْحٍ مَّحْفُوظٍۭ',
        translation: '[Inscribed] in a Preserved Slate'
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
    frequency: 3226,
    location: { surah: 113, ayah: 2, position: 1 },
    frequencyVerified: true,
    tags: ['preposition', 'source', 'basic'],
    collections: ['particles'],
    examples: [
      {
        surah: 113,
        ayah: 2,
        arabicText: 'مِن شَرِّ مَا خَلَقَ',
        translation: 'From the evil of that which He created'
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
    frequency: 742,
    location: { surah: 94, ayah: 8, position: 1 },
    frequencyVerified: true,
    tags: ['preposition', 'direction', 'basic'],
    collections: ['particles'],
    examples: [
      {
        surah: 94,
        ayah: 8,
        arabicText: 'وَإِلَىٰ رَبِّكَ فَٱرْغَب',
        translation: 'And to your Lord direct [your] longing'
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
    frequency: 1445,
    location: { surah: 2, ayah: 5, position: 2 },
    frequencyVerified: true,
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
    frequency: 465,
    location: { surah: 2, ayah: 186, position: 4 },
    frequencyVerified: true,
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
    frequency: 164,
    location: { surah: 2, ayah: 153, position: 9 },
    frequencyVerified: true,
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
    frequency: 199,
    location: { surah: 2, ayah: 27, position: 6 },
    frequencyVerified: true,
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
    frequency: 242,
    location: { surah: 2, ayah: 25, position: 24 },
    frequencyVerified: true,
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
