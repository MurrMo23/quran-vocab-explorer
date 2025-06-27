
import { Word } from './vocabulary-types';

export const additionalPeopleWords: Word[] = [
  {
    id: 'al-munafiqun',
    arabic: 'المنافقون',
    transliteration: 'Al-Munafiqun',
    meaning: 'The Hypocrites',
    root: 'نفق',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 20,
    tags: ['people', 'hypocrisy', 'opposition'],
    collections: ['community', 'faith'],
    examples: [
      {
        surah: 63,
        ayah: 1,
        arabicText: 'إِذَا جَاءَكَ الْمُنَافِقُونَ',
        translation: 'When the hypocrites come to you'
      }
    ]
  },
  {
    id: 'al-mushrikun',
    arabic: 'المشركون',
    transliteration: 'Al-Mushrikun',
    meaning: 'The Polytheists',
    root: 'شرك',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 18,
    tags: ['people', 'polytheism', 'opposition'],
    collections: ['community', 'faith'],
    examples: [
      {
        surah: 9,
        ayah: 1,
        arabicText: 'بَرَاءَةٌ مِّنَ اللَّهِ وَرَسُولِهِ إِلَى الَّذِينَ عَاهَدتُّم مِّنَ الْمُشْرِكِينَ',
        translation: '[This is a declaration of] disassociation, from Allah and His Messenger, to those with whom you made a treaty among the polytheists'
      }
    ]
  },
  {
    id: 'al-yahud',
    arabic: 'اليهود',
    transliteration: 'Al-Yahud',
    meaning: 'The Jews',
    root: 'هود',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 8,
    tags: ['people', 'jews', 'scripture'],
    collections: ['community'],
    examples: [
      {
        surah: 5,
        ayah: 18,
        arabicText: 'وَقَالَتِ الْيَهُودُ وَالنَّصَارَىٰ نَحْنُ أَبْنَاءُ اللَّهِ وَأَحِبَّاؤُهُ',
        translation: 'But the Jews and the Christians say, "We are the children of Allah and His beloved"'
      }
    ]
  },
  {
    id: 'an-nasara',
    arabic: 'النصارى',
    transliteration: 'An-Nasara',
    meaning: 'The Christians',
    root: 'نصر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 14,
    tags: ['people', 'christians', 'scripture'],
    collections: ['community'],
    examples: [
      {
        surah: 5,
        ayah: 18,
        arabicText: 'وَقَالَتِ الْيَهُودُ وَالنَّصَارَىٰ نَحْنُ أَبْنَاءُ اللَّهِ وَأَحِبَّاؤُهُ',
        translation: 'But the Jews and the Christians say, "We are the children of Allah and His beloved"'
      }
    ]
  },
  {
    id: 'al-majus',
    arabic: 'المجوس',
    transliteration: 'Al-Majus',
    meaning: 'The Magians',
    root: 'مجس',
    partOfSpeech: 'noun',
    level: 'advanced',
    frequency: 1,
    tags: ['people', 'magians', 'fire-worshippers'],
    collections: ['community'],
    examples: [
      {
        surah: 22,
        ayah: 17,
        arabicText: 'إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالصَّابِئِينَ وَالنَّصَارَىٰ وَالْمَجُوسَ',
        translation: 'Indeed, those who have believed and those who were Jews and the Sabeans and the Christians and the Magians'
      }
    ]
  },
  {
    id: 'as-sabiun',
    arabic: 'الصابئون',
    transliteration: 'As-Sabi\'un',
    meaning: 'The Sabeans',
    root: 'صبأ',
    partOfSpeech: 'noun',
    level: 'advanced',
    frequency: 3,
    tags: ['people', 'sabeans', 'religion'],
    collections: ['community'],
    examples: [
      {
        surah: 2,
        ayah: 62,
        arabicText: 'إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالنَّصَارَىٰ وَالصَّابِئِينَ',
        translation: 'Indeed, those who believed and those who were Jews or Christians or Sabeans'
      }
    ]
  },
  {
    id: 'an-nas',
    arabic: 'الناس',
    transliteration: 'An-Nas',
    meaning: 'People',
    root: 'أنس',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 240,
    tags: ['people', 'humanity', 'mankind'],
    collections: ['community'],
    examples: [
      {
        surah: 114,
        ayah: 1,
        arabicText: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        translation: 'Say, "I seek refuge in the Lord of mankind"'
      }
    ]
  },
  {
    id: 'al-bashar',
    arabic: 'البشر',
    transliteration: 'Al-Bashar',
    meaning: 'Human beings',
    root: 'بشر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 37,
    tags: ['people', 'humanity', 'human'],
    collections: ['community'],
    examples: [
      {
        surah: 18,
        ayah: 110,
        arabicText: 'قُلْ إِنَّمَا أَنَا بَشَرٌ مِّثْلُكُمْ',
        translation: 'Say, "I am only a man like you"'
      }
    ]
  },
  {
    id: 'al-insan',
    arabic: 'الإنسان',
    transliteration: 'Al-Insan',
    meaning: 'Man, human',
    root: 'أنس',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 65,
    tags: ['people', 'human', 'individual'],
    collections: ['community'],
    examples: [
      {
        surah: 76,
        ayah: 1,
        arabicText: 'هَلْ أَتَىٰ عَلَى الْإِنسَانِ حِينٌ مِّنَ الدَّهْرِ',
        translation: 'Has there [not] come upon man a period of time'
      }
    ]
  }
];
