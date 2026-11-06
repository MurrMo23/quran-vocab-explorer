
import { Word } from './vocabulary-types';

export const quranicPhrasesWords: Word[] = [
  {
    id: 'bismillah-ir-rahman-ir-raheem',
    arabic: 'بسم الله الرحمن الرحيم',
    transliteration: 'Bismillah ir-Rahman ir-Raheem',
    meaning: 'In the name of Allah, Most Gracious, Most Merciful',
    root: 'سمي',
    partOfSpeech: 'phrase',
    level: 'beginner',
    // Opens 113 surahs (numbered as an ayah only in 1:1) and appears within 27:30.
    frequency: 114,
    location: { surah: 1, ayah: 1, position: 1 },
    frequencyVerified: true,
    tags: ['phrases', 'opening', 'basmala'],
    collections: ['phrases', 'worship'],
    examples: [
      {
        surah: 1,
        ayah: 1,
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful'
      }
    ]
  },
  {
    id: 'al-hamdu-lillahi-rabbil-alameen',
    arabic: 'الحمد لله رب العالمين',
    transliteration: 'Al-hamdu lillahi rabbil alameen',
    meaning: 'Praise be to Allah, Lord of the worlds',
    root: 'حمد',
    partOfSpeech: 'phrase',
    level: 'beginner',
    frequency: 6,
    location: { surah: 1, ayah: 2, position: 1 },
    frequencyVerified: true,
    tags: ['phrases', 'praise', 'gratitude'],
    collections: ['phrases', 'worship'],
    examples: [
      {
        surah: 1,
        ayah: 2,
        arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        translation: 'Praise to Allah, Lord of the worlds'
      }
    ]
  },
  {
    id: 'la-ilaha-illa-allah',
    arabic: 'لا إله إلا الله',
    transliteration: 'La ilaha illa Allah',
    meaning: 'There is no god but Allah',
    root: 'أله',
    partOfSpeech: 'phrase',
    level: 'beginner',
    frequency: 2,
    location: { surah: 37, ayah: 35, position: 6 },
    frequencyVerified: true,
    tags: ['phrases', 'tawheed', 'declaration'],
    collections: ['phrases', 'faith'],
    examples: [
      {
        surah: 37,
        ayah: 35,
        arabicText: 'إِنَّهُمْ كَانُوا إِذَا قِيلَ لَهُمْ لَا إِلَٰهَ إِلَّا اللَّهُ يَسْتَكْبِرُونَ',
        translation: 'Indeed they, when it was said to them, "There is no deity but Allah," were arrogant'
      }
    ]
  },
  {
    id: 'allahu-akbar',
    arabic: 'الله أكبر',
    transliteration: 'Allahu Akbar',
    meaning: 'Allah is Greatest (this exact phrase does not occur in the Quran; the related command "and glorify Him with [great] glorification" occurs in 17:111)',
    root: 'كبر',
    partOfSpeech: 'phrase',
    level: 'beginner',
    frequency: 0,
    frequencyVerified: true,
    tags: ['related-form', 'phrases', 'takbeer', 'magnification'],
    collections: ['phrases', 'worship'],
    examples: [
      {
        surah: 17,
        ayah: 111,
        arabicText: 'وَكَبِّرْهُ تَكْبِيرًا',
        translation: 'And glorify Him with [great] glorification'
      }
    ]
  },
  {
    id: 'subhan-allah',
    arabic: 'سبحان الله',
    transliteration: 'Subhan Allah',
    meaning: 'Glory be to Allah',
    root: 'سبح',
    partOfSpeech: 'phrase',
    level: 'beginner',
    frequency: 9,
    location: { surah: 37, ayah: 159, position: 1 },
    frequencyVerified: true,
    tags: ['phrases', 'glorification', 'praise'],
    collections: ['phrases', 'worship'],
    examples: [
      {
        surah: 37,
        ayah: 159,
        arabicText: 'سُبْحَـٰنَ ٱللَّهِ عَمَّا يَصِفُونَ',
        translation: 'Exalted is Allah above what they describe'
      }
    ]
  },
  {
    id: 'in-sha-allah',
    arabic: 'إن شاء الله',
    transliteration: 'In sha Allah',
    meaning: 'If Allah wills',
    root: 'شيأ',
    partOfSpeech: 'phrase',
    level: 'beginner',
    frequency: 6,
    location: { surah: 48, ayah: 27, position: 10 },
    frequencyVerified: true,
    tags: ['phrases', 'condition', 'will'],
    collections: ['phrases', 'faith'],
    examples: [
      {
        surah: 48,
        ayah: 27,
        arabicText: 'لَتَدْخُلُنَّ الْمَسْجِدَ الْحَرَامَ إِن شَاءَ اللَّهُ آمِنِينَ',
        translation: 'You will surely enter al-Masjid al-Haram, if Allah wills, in safety'
      },
      {
        surah: 18,
        ayah: 24,
        arabicText: 'إِلَّا أَن يَشَاءَ اللَّهُ',
        translation: 'Except [when adding], "If Allah wills"'
      }
    ]
  }
];
