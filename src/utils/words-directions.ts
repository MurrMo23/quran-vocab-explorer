
import { Word } from './vocabulary-types';

export const directionsWords: Word[] = [
  {
    id: 'sharq',
    arabic: 'شرق',
    transliteration: 'Sharq',
    meaning: 'East',
    root: 'شرق',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 0,
    frequencyVerified: true,
    tags: ['not-in-quran', 'directions', 'geography', 'orientation'],
    collections: ['directions', 'geography'],
    examples: [
      {
        surah: 2,
        ayah: 177,
        arabicText: 'لَّيْسَ الْبِرَّ أَن تُوَلُّوا وُجُوهَكُمْ قِبَلَ الْمَشْرِقِ وَالْمَغْرِبِ',
        translation: 'Righteousness is not that you turn your faces toward the east or the west'
      }
    ]
  },
  {
    id: 'gharb',
    arabic: 'غرب',
    transliteration: 'Gharb',
    meaning: 'West',
    root: 'غرب',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 0,
    frequencyVerified: true,
    tags: ['not-in-quran', 'directions', 'geography', 'orientation'],
    collections: ['directions', 'geography'],
    examples: [
      {
        surah: 2,
        ayah: 177,
        arabicText: 'لَّيْسَ الْبِرَّ أَن تُوَلُّوا وُجُوهَكُمْ قِبَلَ الْمَشْرِقِ وَالْمَغْرِبِ',
        translation: 'Righteousness is not that you turn your faces toward the east or the west'
      }
    ]
  },
  {
    id: 'shamal',
    arabic: 'شمال',
    transliteration: 'Shamal',
    meaning: 'North',
    root: 'شمل',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 0,
    frequencyVerified: true,
    tags: ['not-in-quran', 'directions', 'geography', 'orientation'],
    collections: ['directions', 'geography'],
    examples: [
      {
        surah: 56,
        ayah: 41,
        arabicText: 'وَأَصْحَابُ الشِّمَالِ مَا أَصْحَابُ الشِّمَالِ',
        translation: 'And the companions of the left - what are the companions of the left?'
      }
    ]
  },
  {
    id: 'janub',
    arabic: 'جنوب',
    transliteration: 'Janub',
    meaning: 'South',
    root: 'جنب',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 0,
    frequencyVerified: true,
    tags: ['not-in-quran', 'directions', 'geography', 'orientation'],
    collections: ['directions', 'geography'],
    examples: [
      {
        surah: 28,
        ayah: 30,
        arabicText: 'فَلَمَّا أَتَاهَا نُودِيَ مِن شَاطِئِ الْوَادِ الْأَيْمَنِ',
        translation: 'But when he came to it, he was called from the right side of the valley'
      }
    ]
  },
  {
    id: 'yameen',
    arabic: 'يمين',
    transliteration: 'Yameen',
    meaning: 'Right',
    root: 'يمن',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 65,
    location: { surah: 2, ayah: 224, position: 5 },
    frequencyVerified: true,
    tags: ['directions', 'side', 'hand'],
    collections: ['directions', 'body'],
    examples: [
      {
        surah: 56,
        ayah: 8,
        arabicText: 'فَأَصْحَابُ الْمَيْمَنَةِ مَا أَصْحَابُ الْمَيْمَنَةِ',
        translation: 'Then the companions of the right - what are the companions of the right?'
      }
    ]
  },
  {
    id: 'shimal',
    arabic: 'شمال',
    transliteration: 'Shimal',
    meaning: 'Left',
    root: 'شمل',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 8,
    location: { surah: 56, ayah: 41, position: 2 },
    frequencyVerified: true,
    tags: ['directions', 'side', 'hand'],
    collections: ['directions', 'body'],
    examples: [
      {
        surah: 56,
        ayah: 41,
        arabicText: 'وَأَصْحَابُ الشِّمَالِ مَا أَصْحَابُ الشِّمَالِ',
        translation: 'And the companions of the left - what are the companions of the left?'
      }
    ]
  }
];
