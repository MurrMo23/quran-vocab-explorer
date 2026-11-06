
import { Word } from './vocabulary-types';

export const colorsWords: Word[] = [
  {
    id: 'abyad',
    arabic: 'أبيض',
    transliteration: 'Abyad',
    meaning: 'White',
    root: 'بيض',
    partOfSpeech: 'adjective',
    level: 'beginner',
    frequency: 8,
    location: { surah: 2, ayah: 187, position: 37 },
    frequencyVerified: true,
    tags: ['colors', 'description', 'purity'],
    collections: ['colors'],
    examples: [
      {
        surah: 2,
        ayah: 187,
        arabicText: 'حَتَّىٰ يَتَبَيَّنَ لَكُمُ الْخَيْطُ الْأَبْيَضُ مِنَ الْخَيْطِ الْأَسْوَدِ',
        translation: 'Until the white thread of dawn becomes distinct to you from the black thread [of night]'
      }
    ]
  },
  {
    id: 'aswad',
    arabic: 'أسود',
    transliteration: 'Aswad',
    meaning: 'Black',
    root: 'سود',
    partOfSpeech: 'adjective',
    level: 'beginner',
    frequency: 2,
    location: { surah: 2, ayah: 187, position: 40 },
    frequencyVerified: true,
    tags: ['colors', 'description', 'darkness'],
    collections: ['colors'],
    examples: [
      {
        surah: 2,
        ayah: 187,
        arabicText: 'حَتَّىٰ يَتَبَيَّنَ لَكُمُ الْخَيْطُ الْأَبْيَضُ مِنَ الْخَيْطِ الْأَسْوَدِ',
        translation: 'Until the white thread of dawn becomes distinct to you from the black thread [of night]'
      }
    ]
  },
  {
    id: 'ahmar',
    arabic: 'أحمر',
    transliteration: 'Ahmar',
    meaning: 'Red',
    root: 'حمر',
    partOfSpeech: 'adjective',
    level: 'beginner',
    frequency: 1,
    location: { surah: 35, ayah: 27, position: 18 },
    frequencyVerified: true,
    tags: ['colors', 'description'],
    collections: ['colors'],
    examples: [
      {
        surah: 35,
        ayah: 27,
        arabicText: 'جُدَدٌ بِيضٌ وَحُمْرٌ مُّخْتَلِفٌ أَلْوَانُهَا',
        translation: 'White and red stripes of varying shades'
      }
    ]
  },
  {
    id: 'akhdar',
    arabic: 'أخضر',
    transliteration: 'Akhdar',
    meaning: 'Green',
    root: 'خضر',
    partOfSpeech: 'adjective',
    level: 'beginner',
    frequency: 6,
    location: { surah: 55, ayah: 76, position: 4 },
    frequencyVerified: true,
    tags: ['colors', 'description', 'nature'],
    collections: ['colors'],
    examples: [
      {
        surah: 55,
        ayah: 76,
        arabicText: 'مُتَّكِئِينَ عَلَىٰ رَفْرَفٍ خُضْرٍ',
        translation: 'Reclining on green cushions'
      }
    ]
  },
  {
    id: 'asfar',
    arabic: 'أصفر',
    transliteration: 'Asfar',
    meaning: 'Yellow',
    root: 'صفر',
    partOfSpeech: 'adjective',
    level: 'beginner',
    frequency: 2,
    location: { surah: 2, ayah: 69, position: 14 },
    frequencyVerified: true,
    tags: ['colors', 'description'],
    collections: ['colors'],
    examples: [
      {
        surah: 2,
        ayah: 69,
        arabicText: 'إِنَّهَا بَقَرَةٌ صَفْرَاءُ فَاقِعٌ لَّوْنُهَا',
        translation: 'Indeed, it is a yellow cow, bright in color'
      }
    ]
  }
];
