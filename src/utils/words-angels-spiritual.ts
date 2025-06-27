
import { Word } from './vocabulary-types';

export const angelsAndSpiritualWords: Word[] = [
  {
    id: 'al-malaikah',
    arabic: 'الملائكة',
    transliteration: 'Al-Mala\'ikah',
    meaning: 'Angels',
    root: 'ملك',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 88,
    tags: ['angels', 'spiritual beings'],
    collections: ['faith', 'community'],
    examples: [
      {
        surah: 2,
        ayah: 30,
        arabicText: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً',
        translation: 'And [mention, O Muhammad], when your Lord said to the angels, "Indeed, I will make upon the earth a successive authority"'
      }
    ]
  },
  {
    id: 'jibril',
    arabic: 'جبريل',
    transliteration: 'Jibril',
    meaning: 'Gabriel',
    root: 'جبر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 3,
    tags: ['angels', 'archangel', 'messenger'],
    collections: ['prophets', 'faith'],
    examples: [
      {
        surah: 2,
        ayah: 97,
        arabicText: 'قُلْ مَن كَانَ عَدُوًّا لِّجِبْرِيلَ فَإِنَّهُ نَزَّلَهُ عَلَىٰ قَلْبِكَ',
        translation: 'Say, "Whoever is an enemy to Gabriel - it is [none but] he who has brought the Qur\'an down upon your heart"'
      }
    ]
  },
  {
    id: 'al-jinn',
    arabic: 'الجن',
    transliteration: 'Al-Jinn',
    meaning: 'Jinn, genies',
    root: 'جنن',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 22,
    tags: ['spiritual beings', 'creation'],
    collections: ['faith', 'nature'],
    examples: [
      {
        surah: 72,
        ayah: 1,
        arabicText: 'قُلْ أُوحِيَ إِلَيَّ أَنَّهُ اسْتَمَعَ نَفَرٌ مِّنَ الْجِنِّ',
        translation: 'Say, "It has been revealed to me that a group of the jinn listened"'
      }
    ]
  },
  {
    id: 'ash-shayateen',
    arabic: 'الشياطين',
    transliteration: 'Ash-Shayateen',
    meaning: 'Devils',
    root: 'شطن',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 18,
    tags: ['spiritual beings', 'evil', 'temptation'],
    collections: ['faith'],
    examples: [
      {
        surah: 2,
        ayah: 14,
        arabicText: 'وَإِذَا خَلَوْا إِلَىٰ شَيَاطِينِهِمْ قَالُوا إِنَّا مَعَكُمْ',
        translation: 'And when they are alone with their evil ones, they say, "Indeed, we are with you"'
      }
    ]
  },
  {
    id: 'iblis',
    arabic: 'إبليس',
    transliteration: 'Iblis',
    meaning: 'Satan',
    root: 'بلس',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 11,
    tags: ['spiritual beings', 'evil', 'satan'],
    collections: ['faith'],
    examples: [
      {
        surah: 2,
        ayah: 34,
        arabicText: 'وَإِذْ قُلْنَا لِلْمَلَائِكَةِ اسْجُدُوا لِآدَمَ فَسَجَدُوا إِلَّا إِبْلِيسَ أَبَىٰ وَاسْتَكْبَرَ',
        translation: 'And [mention] when We said to the angels, "Prostrate before Adam"; so they prostrated, except for Iblees. He refused and was arrogant'
      }
    ]
  }
];
