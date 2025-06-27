
import { Word } from './vocabulary-types';

export const booksAndScripturesWords: Word[] = [
  {
    id: 'al-quran',
    arabic: 'القرآن',
    transliteration: 'Al-Qur\'an',
    meaning: 'The Quran',
    root: 'قرأ',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 70,
    tags: ['book', 'scripture', 'revelation'],
    collections: ['knowledge', 'faith'],
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
    id: 'al-kitab',
    arabic: 'الكتاب',
    transliteration: 'Al-Kitab',
    meaning: 'The Book',
    root: 'كتب',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 319,
    tags: ['book', 'scripture', 'writing'],
    collections: ['knowledge', 'faith'],
    examples: [
      {
        surah: 2,
        ayah: 2,
        arabicText: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ',
        translation: 'This is the Book about which there is no doubt'
      }
    ]
  },
  {
    id: 'al-furqan',
    arabic: 'الفرقان',
    transliteration: 'Al-Furqan',
    meaning: 'The Criterion',
    root: 'فرق',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 7,
    tags: ['book', 'criterion', 'distinction'],
    collections: ['knowledge', 'faith'],
    examples: [
      {
        surah: 25,
        ayah: 1,
        arabicText: 'تَبَارَكَ الَّذِي نَزَّلَ الْفُرْقَانَ عَلَىٰ عَبْدِهِ لِيَكُونَ لِلْعَالَمِينَ نَذِيرًا',
        translation: 'Blessed is He who sent down the Criterion upon His Servant that he may be to the worlds a warner'
      }
    ]
  },
  {
    id: 'at-tawrah',
    arabic: 'التوراة',
    transliteration: 'At-Tawrah',
    meaning: 'The Torah',
    root: 'ورى',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 18,
    tags: ['book', 'scripture', 'torah'],
    collections: ['knowledge', 'prophets'],
    examples: [
      {
        surah: 3,
        ayah: 3,
        arabicText: 'نَزَّلَ عَلَيْكَ الْكِتَابَ بِالْحَقِّ مُصَدِّقًا لِّمَا بَيْنَ يَدَيْهِ وَأَنزَلَ التَّوْرَاةَ وَالْإِنجِيلَ',
        translation: 'He has sent down upon you, [O Muhammad], the Book in truth, confirming what was before it. And He revealed the Torah and the Gospel'
      }
    ]
  },
  {
    id: 'al-injeel',
    arabic: 'الإنجيل',
    transliteration: 'Al-Injeel',
    meaning: 'The Gospel',
    root: 'نجل',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 12,
    tags: ['book', 'scripture', 'gospel'],
    collections: ['knowledge', 'prophets'],
    examples: [
      {
        surah: 3,
        ayah: 3,
        arabicText: 'وَأَنزَلَ التَّوْرَاةَ وَالْإِنجِيلَ',
        translation: 'And He revealed the Torah and the Gospel'
      }
    ]
  }
];
