
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
    location: { surah: 3, ayah: 19, position: 5 },
    frequencyVerified: true,
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
    location: { surah: 49, ayah: 7, position: 17 },
    frequencyVerified: true,
    tags: ['faith', 'belief', 'fundamental'],
    collections: ['faith'],
    examples: [
      {
        surah: 49,
        ayah: 7,
        arabicText: 'وَلَـٰكِنَّ ٱللَّهَ حَبَّبَ إِلَيْكُمُ ٱلْإِيمَـٰنَ وَزَيَّنَهُۥ فِى قُلُوبِكُمْ',
        translation: 'But Allah has endeared to you the faith and has made it pleasing in your hearts'
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
    frequency: 0,
    frequencyVerified: true,
    tags: ['related-form', 'not-in-quran', 'theology', 'monotheism', 'fundamental'],
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
    frequency: 17,
    location: { surah: 2, ayah: 197, position: 26 },
    frequencyVerified: true,
    tags: ['piety', 'consciousness', 'virtue'],
    collections: ['faith', 'ethics'],
    examples: [
      {
        surah: 2,
        ayah: 197,
        arabicText: 'وَتَزَوَّدُوا۟ فَإِنَّ خَيْرَ ٱلزَّادِ ٱلتَّقْوَىٰ',
        translation: 'And take provisions, but indeed, the best provision is fear of Allah'
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
    frequency: 83,
    location: { surah: 2, ayah: 3, position: 5 },
    frequencyVerified: true,
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
    frequency: 32,
    location: { surah: 2, ayah: 43, position: 4 },
    frequencyVerified: true,
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
    frequency: 1,
    location: { surah: 19, ayah: 26, position: 14 },
    frequencyVerified: true,
    tags: ['worship', 'fasting', 'pillar'],
    collections: ['worship'],
    examples: [
      {
        surah: 19,
        ayah: 26,
        arabicText: 'فَقُولِىٓ إِنِّى نَذَرْتُ لِلرَّحْمَـٰنِ صَوْمًا',
        translation: 'Then say, "Indeed, I have vowed to the Most Merciful a fast (abstention)"'
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
    frequency: 10,
    location: { surah: 3, ayah: 97, position: 13 },
    frequencyVerified: true,
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
    frequency: 76,
    location: { surah: 13, ayah: 28, position: 5 },
    frequencyVerified: true,
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
    frequency: 15,
    location: { surah: 2, ayah: 153, position: 5 },
    frequencyVerified: true,
    tags: ['patience', 'virtue', 'character'],
    collections: ['ethics', 'faith'],
    examples: [
      {
        surah: 2,
        ayah: 153,
        arabicText: 'اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
        translation: 'Seek help through patience and prayer. Indeed, Allah is with the patient'
      }
    ]
  }
];
