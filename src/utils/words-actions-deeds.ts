
import { Word } from './vocabulary-types';

export const actionsAndDeedsWords: Word[] = [
  {
    id: 'al-amal',
    arabic: 'العمل',
    transliteration: 'Al-Amal',
    meaning: 'Work, deed',
    root: 'عمل',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 360,
    tags: ['work', 'action', 'deed'],
    collections: ['actions'],
    examples: [
      {
        surah: 2,
        ayah: 25,
        arabicText: 'وَبَشِّرِ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ',
        translation: 'And give good tidings to those who believe and do righteous deeds'
      }
    ]
  },
  {
    id: 'al-aamal',
    arabic: 'الأعمال',
    transliteration: 'Al-A\'mal',
    meaning: 'Deeds',
    root: 'عمل',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 109,
    tags: ['deeds', 'actions', 'works'],
    collections: ['actions'],
    examples: [
      {
        surah: 18,
        ayah: 103,
        arabicText: 'قُلْ هَلْ نُنَبِّئُكُم بِالْأَخْسَرِينَ أَعْمَالًا',
        translation: 'Say, "Shall we [believers] inform you of the greatest losers as to [their] deeds?"'
      }
    ]
  },
  {
    id: 'al-hasanat',
    arabic: 'الحسنات',
    transliteration: 'Al-Hasanat',
    meaning: 'Good deeds',
    root: 'حسن',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 13,
    tags: ['good deeds', 'righteousness', 'virtue'],
    collections: ['actions', 'ethics'],
    examples: [
      {
        surah: 11,
        ayah: 114,
        arabicText: 'إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ',
        translation: 'Indeed, good deeds do away with misdeeds'
      }
    ]
  },
  {
    id: 'as-sayyiat',
    arabic: 'السيئات',
    transliteration: 'As-Sayyi\'at',
    meaning: 'Bad deeds',
    root: 'سوأ',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 35,
    tags: ['bad deeds', 'sins', 'wrongdoing'],
    collections: ['actions', 'ethics'],
    examples: [
      {
        surah: 11,
        ayah: 114,
        arabicText: 'إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ',
        translation: 'Indeed, good deeds do away with misdeeds'
      }
    ]
  },
  {
    id: 'at-taah',
    arabic: 'الطاعة',
    transliteration: 'At-Ta\'ah',
    meaning: 'Obedience',
    root: 'طوع',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 132,
    tags: ['obedience', 'submission', 'compliance'],
    collections: ['actions', 'worship'],
    examples: [
      {
        surah: 4,
        ayah: 59,
        arabicText: 'وَأَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ',
        translation: 'And obey Allah and obey the Messenger'
      }
    ]
  },
  {
    id: 'al-masiyah',
    arabic: 'المعصية',
    transliteration: 'Al-Ma\'siyah',
    meaning: 'Disobedience',
    root: 'عصي',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 42,
    tags: ['disobedience', 'rebellion', 'sin'],
    collections: ['actions', 'ethics'],
    examples: [
      {
        surah: 18,
        ayah: 50,
        arabicText: 'فَفَسَقَ عَنْ أَمْرِ رَبِّهِ',
        translation: 'And he departed from the command of his Lord'
      }
    ]
  }
];
