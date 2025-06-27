
import { Word } from './vocabulary-types';

export const afterlifeWords: Word[] = [
  {
    id: 'al-akhirah',
    arabic: 'الآخرة',
    transliteration: 'Al-Akhirah',
    meaning: 'The Hereafter',
    root: 'أخر',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 115,
    tags: ['afterlife', 'hereafter', 'future'],
    collections: ['afterlife'],
    examples: [
      {
        surah: 2,
        ayah: 4,
        arabicText: 'وَبِالْآخِرَةِ هُمْ يُوقِنُونَ',
        translation: 'And of the Hereafter they are certain [in faith]'
      }
    ]
  },
  {
    id: 'yawm-al-qiyamah',
    arabic: 'يوم القيامة',
    transliteration: 'Yawm al-Qiyamah',
    meaning: 'Day of Resurrection',
    root: 'قوم',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 70,
    tags: ['afterlife', 'resurrection', 'judgment'],
    collections: ['afterlife'],
    examples: [
      {
        surah: 2,
        ayah: 85,
        arabicText: 'وَيَوْمَ الْقِيَامَةِ يُرَدُّونَ إِلَىٰ أَشَدِّ الْعَذَابِ',
        translation: 'And on the Day of Resurrection they will be sent back to the severest of punishment'
      }
    ]
  },
  {
    id: 'al-jannah',
    arabic: 'الجنة',
    transliteration: 'Al-Jannah',
    meaning: 'Paradise',
    root: 'جنن',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 147,
    tags: ['afterlife', 'paradise', 'reward'],
    collections: ['afterlife'],
    examples: [
      {
        surah: 2,
        ayah: 25,
        arabicText: 'وَبَشِّرِ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أَنَّ لَهُمْ جَنَّاتٍ',
        translation: 'And give good tidings to those who believe and do righteous deeds that they will have gardens'
      }
    ]
  },
  {
    id: 'an-nar',
    arabic: 'النار',
    transliteration: 'An-Nar',
    meaning: 'The Fire',
    root: 'نور',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 145,
    tags: ['afterlife', 'hell', 'punishment'],
    collections: ['afterlife'],
    examples: [
      {
        surah: 2,
        ayah: 24,
        arabicText: 'فَاتَّقُوا النَّارَ الَّتِي وَقُودُهَا النَّاسُ وَالْحِجَارَةُ',
        translation: 'Then fear the Fire, whose fuel is men and stones'
      }
    ]
  },
  {
    id: 'jahannam',
    arabic: 'جهنم',
    transliteration: 'Jahannam',
    meaning: 'Hell',
    root: 'جهنم',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 77,
    tags: ['afterlife', 'hell', 'punishment'],
    collections: ['afterlife'],
    examples: [
      {
        surah: 2,
        ayah: 206,
        arabicText: 'وَبِئْسَ الْمِهَادُ جَهَنَّمُ',
        translation: 'And wretched is the resting place - Hell'
      }
    ]
  },
  {
    id: 'al-hisab',
    arabic: 'الحساب',
    transliteration: 'Al-Hisab',
    meaning: 'The Reckoning',
    root: 'حسب',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 52,
    tags: ['afterlife', 'judgment', 'accounting'],
    collections: ['afterlife'],
    examples: [
      {
        surah: 2,
        ayah: 202,
        arabicText: 'وَاللَّهُ سَرِيعُ الْحِسَابِ',
        translation: 'And Allah is swift in account'
      }
    ]
  },
  {
    id: 'al-mizan',
    arabic: 'الميزان',
    transliteration: 'Al-Mizan',
    meaning: 'The Scale',
    root: 'وزن',
    partOfSpeech: 'noun',
    level: 'advanced',
    frequency: 23,
    tags: ['afterlife', 'judgment', 'balance'],
    collections: ['afterlife'],
    examples: [
      {
        surah: 7,
        ayah: 8,
        arabicText: 'وَالْوَزْنُ يَوْمَئِذٍ الْحَقُّ',
        translation: 'And the weighing [of deeds] that Day will be the truth'
      }
    ]
  },
  {
    id: 'as-sirat',
    arabic: 'الصراط',
    transliteration: 'As-Sirat',
    meaning: 'The Bridge',
    root: 'صرط',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 45,
    tags: ['afterlife', 'bridge', 'path'],
    collections: ['afterlife'],
    examples: [
      {
        surah: 1,
        ayah: 6,
        arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        translation: 'Guide us to the straight path'
      }
    ]
  }
];
