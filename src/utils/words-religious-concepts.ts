
import { Word } from './vocabulary-types';

export const religiousConceptsWords: Word[] = [
  {
    id: 'al-islam',
    arabic: 'الإسلام',
    transliteration: 'Al-Islam',
    meaning: 'Islam, submission',
    root: 'سلم',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 8,
    tags: ['religion', 'submission', 'fundamental'],
    collections: ['faith', 'worship'],
    examples: [
      {
        surah: 3,
        ayah: 19,
        arabicText: 'إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ',
        translation: 'Indeed, the religion in the sight of Allah is Islam'
      }
    ]
  },
  {
    id: 'al-iman',
    arabic: 'الإيمان',
    transliteration: 'Al-Iman',
    meaning: 'Faith, belief',
    root: 'أمن',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 45,
    tags: ['faith', 'belief', 'fundamental'],
    collections: ['faith'],
    examples: [
      {
        surah: 2,
        ayah: 3,
        arabicText: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ',
        translation: 'Who believe in the unseen'
      }
    ]
  },
  {
    id: 'at-tawheed',
    arabic: 'التوحيد',
    transliteration: 'At-Tawheed',
    meaning: 'Monotheism',
    root: 'وحد',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 15,
    tags: ['theology', 'monotheism', 'fundamental'],
    collections: ['faith'],
    examples: [
      {
        surah: 112,
        ayah: 1,
        arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        translation: 'Say, He is Allah, [who is] One'
      }
    ]
  },
  {
    id: 'at-taqwa',
    arabic: 'التقوى',
    transliteration: 'At-Taqwa',
    meaning: 'God-consciousness, piety',
    root: 'وقي',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 15,
    tags: ['piety', 'consciousness', 'virtue'],
    collections: ['faith', 'ethics'],
    examples: [
      {
        surah: 2,
        ayah: 2,
        arabicText: 'هُدًى لِّلْمُتَّقِينَ',
        translation: 'Guidance for those conscious of Allah'
      }
    ]
  },
  {
    id: 'as-salah',
    arabic: 'الصلاة',
    transliteration: 'As-Salah',
    meaning: 'Prayer',
    root: 'صلو',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 67,
    tags: ['worship', 'prayer', 'pillar'],
    collections: ['worship'],
    examples: [
      {
        surah: 2,
        ayah: 3,
        arabicText: 'وَيُقِيمُونَ الصَّلَاةَ',
        translation: 'And they establish prayer'
      }
    ]
  },
  {
    id: 'az-zakah',
    arabic: 'الزكاة',
    transliteration: 'Az-Zakah',
    meaning: 'Obligatory charity',
    root: 'زكو',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 30,
    tags: ['worship', 'charity', 'pillar'],
    collections: ['worship', 'ethics'],
    examples: [
      {
        surah: 2,
        ayah: 43,
        arabicText: 'وَآتُوا الزَّكَاةَ',
        translation: 'And give zakah'
      }
    ]
  },
  {
    id: 'as-sawm',
    arabic: 'الصوم',
    transliteration: 'As-Sawm',
    meaning: 'Fasting',
    root: 'صوم',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 14,
    tags: ['worship', 'fasting', 'pillar'],
    collections: ['worship'],
    examples: [
      {
        surah: 2,
        ayah: 183,
        arabicText: 'كُتِبَ عَلَيْكُمُ الصِّيَامُ',
        translation: 'Fasting has been prescribed for you'
      }
    ]
  },
  {
    id: 'al-hajj',
    arabic: 'الحج',
    transliteration: 'Al-Hajj',
    meaning: 'Pilgrimage',
    root: 'حجج',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 15,
    tags: ['worship', 'pilgrimage', 'pillar'],
    collections: ['worship'],
    examples: [
      {
        surah: 3,
        ayah: 97,
        arabicText: 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ',
        translation: 'And [due] to Allah from the people is a pilgrimage to the House'
      }
    ]
  },
  {
    id: 'adh-dhikr',
    arabic: 'الذكر',
    transliteration: 'Adh-Dhikr',
    meaning: 'Remembrance of Allah',
    root: 'ذكر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 292,
    tags: ['remembrance', 'worship', 'spiritual'],
    collections: ['worship', 'faith'],
    examples: [
      {
        surah: 13,
        ayah: 28,
        arabicText: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
        translation: 'Unquestionably, by the remembrance of Allah hearts are assured'
      }
    ]
  },
  {
    id: 'as-sabr',
    arabic: 'الصبر',
    transliteration: 'As-Sabr',
    meaning: 'Patience',
    root: 'صبر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 103,
    tags: ['patience', 'virtue', 'character'],
    collections: ['ethics', 'faith'],
    examples: [
      {
        surah: 2,
        ayah: 153,
        arabicText: 'وَاصْبِرُوا ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
        translation: 'And be patient. Indeed, Allah is with the patient'
      }
    ]
  }
];
