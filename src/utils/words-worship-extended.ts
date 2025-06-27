
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
    frequency: 65,
    tags: ['worship', 'excellence', 'spiritual'],
    collections: ['worship', 'ethics'],
    examples: [
      {
        surah: 2,
        ayah: 195,
        arabicText: 'وَأَحْسِنُوا ۛ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ',
        translation: 'And do good; indeed, Allah loves the doers of good'
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
    frequency: 12,
    tags: ['theology', 'polytheism', 'negative'],
    collections: ['faith', 'ethics'],
    examples: [
      {
        surah: 4,
        ayah: 116,
        arabicText: 'إِنَّ اللَّهَ لَا يَغْفِرُ أَن يُشْرَكَ بِهِ وَيَغْفِرُ مَا دُونَ ذَٰلِكَ لِمَن يَشَاءُ',
        translation: 'Indeed, Allah does not forgive association with Him, but He forgives what is less than that for whom He wills'
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
    frequency: 48,
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
