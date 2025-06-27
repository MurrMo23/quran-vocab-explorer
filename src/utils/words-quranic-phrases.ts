
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
    frequency: 114,
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
    frequency: 1,
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
    frequency: 37,
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
    meaning: 'Allah is Greatest',
    root: 'كبر',
    partOfSpeech: 'phrase',
    level: 'beginner',
    frequency: 37,
    tags: ['phrases', 'takbeer', 'magnification'],
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
    frequency: 41,
    tags: ['phrases', 'glorification', 'praise'],
    collections: ['phrases', 'worship'],
    examples: [
      {
        surah: 17,
        ayah: 1,
        arabicText: 'سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا',
        translation: 'Exalted is He who took His Servant by night'
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
    frequency: 17,
    tags: ['phrases', 'condition', 'will'],
    collections: ['phrases', 'faith'],
    examples: [
      {
        surah: 18,
        ayah: 23,
        arabicText: 'وَلَا تَقُولَنَّ لِشَيْءٍ إِنِّي فَاعِلٌ ذَٰلِكَ غَدًا إِلَّا أَن يَشَاءَ اللَّهُ',
        translation: 'And never say of anything, "Indeed, I will do that tomorrow," except [when adding], "If Allah wills"'
      }
    ]
  }
];
