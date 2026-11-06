
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
    frequency: 71,
    location: { surah: 99, ayah: 6, position: 6 },
    frequencyVerified: true,
    tags: ['work', 'action', 'deed'],
    collections: ['actions'],
    examples: [
      {
        surah: 99,
        ayah: 6,
        arabicText: 'يَوْمَئِذٍ يَصْدُرُ ٱلنَّاسُ أَشْتَاتًا لِّيُرَوْا۟ أَعْمَـٰلَهُمْ',
        translation: 'That Day, the people will depart separated [into categories] to be shown [the result of] their deeds'
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
    frequency: 71,
    location: { surah: 18, ayah: 103, position: 5 },
    frequencyVerified: true,
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
    frequency: 3,
    location: { surah: 11, ayah: 114, position: 9 },
    frequencyVerified: true,
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
    frequency: 36,
    location: { surah: 11, ayah: 114, position: 11 },
    frequencyVerified: true,
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
    frequency: 3,
    location: { surah: 47, ayah: 21, position: 1 },
    frequencyVerified: true,
    tags: ['obedience', 'submission', 'compliance'],
    collections: ['actions', 'worship'],
    examples: [
      {
        surah: 47,
        ayah: 21,
        arabicText: 'طَاعَةٌ وَقَوْلٌ مَّعْرُوفٌ',
        translation: 'Obedience and good words'
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
    frequency: 2,
    location: { surah: 58, ayah: 9, position: 10 },
    frequencyVerified: true,
    tags: ['disobedience', 'rebellion', 'sin'],
    collections: ['actions', 'ethics'],
    examples: [
      {
        surah: 58,
        ayah: 9,
        arabicText: 'فَلَا تَتَنَـٰجَوْا۟ بِٱلْإِثْمِ وَٱلْعُدْوَٰنِ وَمَعْصِيَتِ ٱلرَّسُولِ',
        translation: 'Do not converse in sin and aggression and disobedience to the Messenger'
      }
    ]
  }
];
