
import { Word } from './vocabulary-types';

export const worshipExtendedWords: Word[] = [
  {
    id: 'al-ihsan',
    arabic: 'الإحسان',
    transliteration: 'Al-Ihsan',
    meaning: 'Excellence in worship',
    root: 'حسن',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 12,
    location: { surah: 55, ayah: 60, position: 3 },
    frequencyVerified: true,
    tags: ['worship', 'excellence', 'spiritual'],
    collections: ['worship', 'ethics'],
    examples: [
      {
        surah: 55,
        ayah: 60,
        arabicText: 'هَلْ جَزَآءُ ٱلْإِحْسَـٰنِ إِلَّا ٱلْإِحْسَـٰنُ',
        translation: 'Is the reward for good [anything] but good?'
      }
    ]
  },
  {
    id: 'ash-shirk',
    arabic: 'الشرك',
    transliteration: 'Ash-Shirk',
    meaning: 'Polytheism, idolatry',
    root: 'شرك',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 5,
    location: { surah: 31, ayah: 13, position: 12 },
    frequencyVerified: true,
    tags: ['theology', 'polytheism', 'negative'],
    collections: ['faith', 'ethics'],
    examples: [
      {
        surah: 31,
        ayah: 13,
        arabicText: 'يَـٰبُنَىَّ لَا تُشْرِكْ بِٱللَّهِ ۖ إِنَّ ٱلشِّرْكَ لَظُلْمٌ عَظِيمٌ',
        translation: 'O my son, do not associate [anything] with Allah. Indeed, association [with Him] is great injustice'
      }
    ]
  },
  {
    id: 'al-kufr',
    arabic: 'الكفر',
    transliteration: 'Al-Kufr',
    meaning: 'Disbelief',
    root: 'كفر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 37,
    location: { surah: 2, ayah: 108, position: 13 },
    frequencyVerified: true,
    tags: ['theology', 'disbelief', 'negative'],
    collections: ['faith'],
    examples: [
      {
        surah: 2,
        ayah: 108,
        arabicText: 'وَمَن يَتَبَدَّلِ الْكُفْرَ بِالْإِيمَانِ فَقَدْ ضَلَّ سَوَاءَ السَّبِيلِ',
        translation: 'And whoever exchanges faith for disbelief has certainly strayed from the soundness of the way'
      }
    ]
  },
  {
    id: 'al-khashyah',
    arabic: 'الخشية',
    transliteration: 'Al-Khashyah',
    meaning: 'Reverent fear',
    root: 'خشي',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 8,
    location: { surah: 2, ayah: 74, position: 31 },
    frequencyVerified: true,
    tags: ['fear', 'reverence', 'spiritual'],
    collections: ['faith', 'ethics'],
    examples: [
      {
        surah: 2,
        ayah: 74,
        arabicText: 'وَإِنَّ مِنْهَا لَمَا يَهْبِطُ مِنْ خَشْيَةِ اللَّهِ',
        translation: 'And there are stones which fall down for fear of Allah'
      }
    ]
  }
];
