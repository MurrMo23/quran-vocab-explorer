
import { Word } from './vocabulary-types';

export const additionalBodyPartsWords: Word[] = [
  {
    id: 'an-nafs',
    arabic: 'النفس',
    transliteration: 'An-Nafs',
    meaning: 'Self/Soul',
    root: 'نفس',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 295,
    location: { surah: 2, ayah: 54, position: 8 },
    frequencyVerified: true,
    tags: ['body', 'soul', 'self'],
    collections: ['body', 'faith'],
    examples: [
      {
        surah: 2,
        ayah: 54,
        arabicText: 'فَتُوبُوا إِلَىٰ بَارِئِكُمْ فَاقْتُلُوا أَنفُسَكُمْ',
        translation: 'So repent to your Creator and kill yourselves'
      }
    ]
  },
  {
    id: 'al-fam',
    arabic: 'الفم',
    transliteration: 'Al-Fam',
    meaning: 'Mouth',
    root: 'فوه',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 13,
    location: { surah: 9, ayah: 32, position: 6 },
    frequencyVerified: true,
    tags: ['body', 'speech', 'eating'],
    collections: ['body'],
    examples: [
      {
        surah: 9,
        ayah: 32,
        arabicText: 'يُرِيدُونَ أَن يُطْفِئُوا نُورَ اللَّهِ بِأَفْوَاهِهِمْ',
        translation: 'They want to extinguish the light of Allah with their mouths'
      }
    ]
  },
  {
    id: 'al-anf',
    arabic: 'الأنف',
    transliteration: 'Al-Anf',
    meaning: 'Nose',
    root: 'أنف',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 2,
    location: { surah: 5, ayah: 45, position: 9 },
    frequencyVerified: true,
    tags: ['body', 'smell', 'breathing'],
    collections: ['body'],
    examples: [
      {
        surah: 5,
        ayah: 45,
        arabicText: 'وَالْأَنفَ بِالْأَنفِ',
        translation: 'And the nose for the nose'
      }
    ]
  },
  {
    id: 'ar-rijl',
    arabic: 'الرجل',
    transliteration: 'Ar-Rijl',
    meaning: 'Foot',
    root: 'رجل',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 15,
    location: { surah: 5, ayah: 33, position: 18 },
    frequencyVerified: true,
    tags: ['body', 'walking', 'movement'],
    collections: ['body'],
    examples: [
      {
        surah: 5,
        ayah: 33,
        arabicText: 'أَوْ تُقَطَّعَ أَيْدِيهِمْ وَأَرْجُلُهُم مِّنْ خِلَافٍ',
        translation: 'Or that their hands and feet be cut off from opposite sides'
      }
    ]
  }
];
