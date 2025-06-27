
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
    frequency: 5,
    tags: ['directions', 'geography', 'orientation'],
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
    frequency: 4,
    tags: ['directions', 'geography', 'orientation'],
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
    frequency: 2,
    tags: ['directions', 'geography', 'orientation'],
    collections: ['directions', 'geography'],
    examples: [
      {
        surah: 56,
        ayah: 9,
        arabicText: 'وَأَصْحَابُ الْمَشْأَمَةِ مَا أَصْحَابُ الْمَشْأَمَةِ',
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
    frequency: 1,
    tags: ['directions', 'geography', 'orientation'],
    collections: ['directions', 'geography'],
    examples: [
      {
        surah: 27,
        ayah: 8,
        arabicText: 'فَلَمَّا جَاءَهَا نُودِيَ مِن شَاطِئِ الْوَادِ الْأَيْمَنِ',
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
    frequency: 38,
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
    frequency: 2,
    tags: ['directions', 'side', 'hand'],
    collections: ['directions', 'body'],
    examples: [
      {
        surah: 56,
        ayah: 9,
        arabicText: 'وَأَصْحَابُ الْمَشْأَمَةِ مَا أَصْحَابُ الْمَشْأَمَةِ',
        translation: 'And the companions of the left - what are the companions of the left?'
      }
    ]
  }
];
