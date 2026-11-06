
import { Word } from './vocabulary-types';

export const timeAndCreationWords: Word[] = [
  {
    id: 'al-khalq',
    arabic: 'الخلق',
    transliteration: 'Al-Khalq',
    meaning: 'Creation',
    root: 'خلق',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 52,
    location: { surah: 2, ayah: 164, position: 3 },
    frequencyVerified: true,
    tags: ['creation', 'making', 'formation'],
    collections: ['nature', 'faith'],
    examples: [
      {
        surah: 2,
        ayah: 164,
        arabicText: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ',
        translation: 'Indeed, in the creation of the heavens and earth'
      }
    ]
  },
  {
    id: 'al-anhar',
    arabic: 'الأنهار',
    transliteration: 'Al-Anhar',
    meaning: 'Rivers',
    root: 'نهر',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 54,
    location: { surah: 2, ayah: 25, position: 12 },
    frequencyVerified: true,
    tags: ['nature', 'water', 'rivers'],
    collections: ['nature', 'geography'],
    examples: [
      {
        surah: 2,
        ayah: 25,
        arabicText: 'لَهُمْ جَنَّاتٌ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ',
        translation: 'They will have gardens beneath which rivers flow'
      }
    ]
  },
  {
    id: 'al-layl',
    arabic: 'الليل',
    transliteration: 'Al-Layl',
    meaning: 'Night',
    root: 'ليل',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 84,
    location: { surah: 92, ayah: 1, position: 1 },
    frequencyVerified: true,
    tags: ['time', 'night', 'darkness'],
    collections: ['time', 'nature'],
    examples: [
      {
        surah: 92,
        ayah: 1,
        arabicText: 'وَالَّيْلِ إِذَا يَغْشَىٰ',
        translation: 'By the night when it covers'
      }
    ]
  },
  {
    id: 'an-nahar',
    arabic: 'النهار',
    transliteration: 'An-Nahar',
    meaning: 'Day',
    root: 'نهر',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 57,
    location: { surah: 91, ayah: 3, position: 1 },
    frequencyVerified: true,
    tags: ['time', 'day', 'light'],
    collections: ['time', 'nature'],
    examples: [
      {
        surah: 91,
        ayah: 3,
        arabicText: 'وَالنَّهَارِ إِذَا جَلَّاهَا',
        translation: 'And [by] the day when it displays it'
      }
    ]
  },
  {
    id: 'al-fajr',
    arabic: 'الفجر',
    transliteration: 'Al-Fajr',
    meaning: 'Dawn',
    root: 'فجر',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 6,
    location: { surah: 89, ayah: 1, position: 1 },
    frequencyVerified: true,
    tags: ['time', 'dawn', 'prayer'],
    collections: ['time', 'worship'],
    examples: [
      {
        surah: 89,
        ayah: 1,
        arabicText: 'وَالْفَجْرِ',
        translation: 'By the dawn'
      }
    ]
  },
  {
    id: 'ad-duha',
    arabic: 'الضحى',
    transliteration: 'Ad-Duha',
    meaning: 'Morning',
    root: 'ضحو',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 6,
    location: { surah: 93, ayah: 1, position: 1 },
    frequencyVerified: true,
    tags: ['time', 'morning', 'brightness'],
    collections: ['time', 'nature'],
    examples: [
      {
        surah: 93,
        ayah: 1,
        arabicText: 'وَالضُّحَىٰ',
        translation: 'By the morning brightness'
      }
    ]
  },
  {
    id: 'al-asr',
    arabic: 'العصر',
    transliteration: 'Al-Asr',
    meaning: 'Afternoon',
    root: 'عصر',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 1,
    location: { surah: 103, ayah: 1, position: 1 },
    frequencyVerified: true,
    tags: ['time', 'afternoon', 'era'],
    collections: ['time', 'worship'],
    examples: [
      {
        surah: 103,
        ayah: 1,
        arabicText: 'وَالْعَصْرِ',
        translation: 'By time'
      }
    ]
  },
  {
    id: 'al-maghrib',
    arabic: 'المغرب',
    transliteration: 'Al-Maghrib',
    meaning: 'Sunset',
    root: 'غرب',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 10,
    location: { surah: 2, ayah: 177, position: 8 },
    frequencyVerified: true,
    tags: ['time', 'sunset', 'west'],
    collections: ['time', 'directions'],
    examples: [
      {
        surah: 2,
        ayah: 177,
        arabicText: 'لَّيْسَ الْبِرَّ أَن تُوَلُّوا وُجُوهَكُمْ قِبَلَ الْمَشْرِقِ وَالْمَغْرِبِ',
        translation: 'Righteousness is not that you turn your faces toward the east or the west'
      }
    ]
  },
  {
    id: 'al-isha',
    arabic: 'العشاء',
    transliteration: 'Al-Isha',
    meaning: 'Evening',
    root: 'عشو',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 2,
    location: { surah: 24, ayah: 58, position: 27 },
    frequencyVerified: true,
    tags: ['time', 'evening', 'night'],
    collections: ['time', 'worship'],
    examples: [
      {
        surah: 24,
        ayah: 58,
        arabicText: 'وَمِن بَعْدِ صَلَاةِ الْعِشَاءِ',
        translation: 'And after the night prayer'
      }
    ]
  },
  {
    id: 'as-sahar',
    arabic: 'السحر',
    transliteration: 'As-Sahar',
    meaning: 'Pre-dawn',
    root: 'سحر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 3,
    location: { surah: 51, ayah: 18, position: 1 },
    frequencyVerified: true,
    tags: ['time', 'pre-dawn', 'magic'],
    collections: ['time'],
    examples: [
      {
        surah: 51,
        ayah: 18,
        arabicText: 'وَبِالْأَسْحَارِ هُمْ يَسْتَغْفِرُونَ',
        translation: 'And in the hours before dawn they would ask forgiveness'
      }
    ]
  }
];
