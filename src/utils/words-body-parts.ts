
import { Word } from './vocabulary-types';

export const bodyPartsWords: Word[] = [
  {
    id: 'al-qalb',
    arabic: 'القلب',
    transliteration: 'Al-Qalb',
    meaning: 'Heart',
    root: 'قلب',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 132,
    tags: ['body', 'emotions', 'spiritual'],
    collections: ['body'],
    examples: [
      {
        surah: 2,
        ayah: 7,
        arabicText: 'خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ',
        translation: 'Allah has set a seal upon their hearts'
      }
    ]
  },
  {
    id: 'al-aql',
    arabic: 'العقل',
    transliteration: 'Al-Aql',
    meaning: 'Mind',
    root: 'عقل',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 49,
    tags: ['body', 'intellect', 'reasoning'],
    collections: ['body', 'knowledge'],
    examples: [
      {
        surah: 2,
        ayah: 164,
        arabicText: 'لَآيَاتٍ لِّقَوْمٍ يَعْقِلُونَ',
        translation: 'Are signs for a people who use reason'
      }
    ]
  },
  {
    id: 'ar-ruh',
    arabic: 'الروح',
    transliteration: 'Ar-Ruh',
    meaning: 'Soul',
    root: 'روح',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 21,
    tags: ['body', 'spiritual', 'essence'],
    collections: ['body', 'faith'],
    examples: [
      {
        surah: 17,
        ayah: 85,
        arabicText: 'وَيَسْأَلُونَكَ عَنِ الرُّوحِ ۖ قُلِ الرُّوحُ مِنْ أَمْرِ رَبِّي',
        translation: 'And they ask you, [O Muhammad], about the soul. Say, "The soul is of the affair of my Lord"'
      }
    ]
  },
  {
    id: 'al-ayn',
    arabic: 'العين',
    transliteration: 'Al-Ayn',
    meaning: 'Eye',
    root: 'عين',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 57,
    tags: ['body', 'sight', 'perception'],
    collections: ['body'],
    examples: [
      {
        surah: 2,
        ayah: 20,
        arabicText: 'يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ',
        translation: 'The lightning almost snatches away their sight'
      }
    ]
  },
  {
    id: 'al-udhn',
    arabic: 'الأذن',
    transliteration: 'Al-Udhn',
    meaning: 'Ear',
    root: 'أذن',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 7,
    tags: ['body', 'hearing', 'perception'],
    collections: ['body'],
    examples: [
      {
        surah: 2,
        ayah: 19,
        arabicText: 'يَجْعَلُونَ أَصَابِعَهُمْ فِي آذَانِهِم',
        translation: 'They put their fingers in their ears'
      }
    ]
  },
  {
    id: 'al-lisan',
    arabic: 'اللسان',
    transliteration: 'Al-Lisan',
    meaning: 'Tongue',
    root: 'لسن',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 25,
    tags: ['body', 'speech', 'language'],
    collections: ['body'],
    examples: [
      {
        surah: 16,
        ayah: 103,
        arabicText: 'لِّسَانُ الَّذِي يُلْحِدُونَ إِلَيْهِ أَعْجَمِيٌّ وَهَٰذَا لِسَانٌ عَرَبِيٌّ',
        translation: 'The tongue of the one they refer to is foreign, and this Quran is [in] a clear Arabic language'
      }
    ]
  },
  {
    id: 'al-yad',
    arabic: 'اليد',
    transliteration: 'Al-Yad',
    meaning: 'Hand',
    root: 'يدي',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 120,
    tags: ['body', 'action', 'power'],
    collections: ['body'],
    examples: [
      {
        surah: 5,
        ayah: 64,
        arabicText: 'بَلْ يَدَاهُ مَبْسُوطَتَانِ',
        translation: 'Rather, both His hands are extended'
      }
    ]
  },
  {
    id: 'al-wajh',
    arabic: 'الوجه',
    transliteration: 'Al-Wajh',
    meaning: 'Face',
    root: 'وجه',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 72,
    tags: ['body', 'identity', 'direction'],
    collections: ['body'],
    examples: [
      {
        surah: 2,
        ayah: 115,
        arabicText: 'فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ',
        translation: 'So wherever you [might] turn, there is the face of Allah'
      }
    ]
  }
];
