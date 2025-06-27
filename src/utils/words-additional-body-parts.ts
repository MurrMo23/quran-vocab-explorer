
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
    frequency: 5,
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
    frequency: 1,
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
    frequency: 13,
    tags: ['body', 'walking', 'movement'],
    collections: ['body'],
    examples: [
      {
        surah: 5,
        ayah: 33,
        arabicText: 'أَن تُقَطَّعَ أَيْدِيهِمْ وَأَرْجُلُهُم مِّنْ خِلَافٍ',
        translation: 'That their hands and feet should be cut off from opposite sides'
      }
    ]
  }
];
