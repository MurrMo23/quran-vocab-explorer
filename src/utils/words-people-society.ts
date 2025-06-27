
import { Word } from './vocabulary-types';

export const peopleAndSocietyWords: Word[] = [
  {
    id: 'al-muminun',
    arabic: 'المؤمنون',
    transliteration: 'Al-Mu\'minun',
    meaning: 'The Believers',
    root: 'أمن',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 230,
    tags: ['believers', 'faith', 'community'],
    collections: ['faith', 'community'],
    examples: [
      {
        surah: 23,
        ayah: 1,
        arabicText: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ',
        translation: 'Certainly will the believers have succeeded'
      }
    ]
  },
  {
    id: 'al-muslimun',
    arabic: 'المسلمون',
    transliteration: 'Al-Muslimun',
    meaning: 'The Muslims',
    root: 'سلم',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 75,
    tags: ['muslims', 'submission', 'community'],
    collections: ['faith', 'community'],
    examples: [
      {
        surah: 3,
        ayah: 64,
        arabicText: 'وَاشْهَدُوا بِأَنَّا مُسْلِمُونَ',
        translation: 'And bear witness that we are Muslims [in submission to Him]'
      }
    ]
  },
  {
    id: 'al-kafirun',
    arabic: 'الكافرون',
    transliteration: 'Al-Kafirun',
    meaning: 'The Disbelievers',
    root: 'كفر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 37,
    tags: ['disbelievers', 'denial', 'opposition'],
    collections: ['faith', 'community'],
    examples: [
      {
        surah: 109,
        ayah: 1,
        arabicText: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ',
        translation: 'Say, "O disbelievers"'
      }
    ]
  },
  {
    id: 'ahl-al-kitab',
    arabic: 'أهل الكتاب',
    transliteration: 'Ahl al-Kitab',
    meaning: 'People of the Book',
    root: 'أهل',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 31,
    tags: ['people of book', 'scripture', 'community'],
    collections: ['community', 'knowledge'],
    examples: [
      {
        surah: 3,
        ayah: 64,
        arabicText: 'قُلْ يَا أَهْلَ الْكِتَابِ تَعَالَوْا إِلَىٰ كَلِمَةٍ سَوَاءٍ بَيْنَنَا وَبَيْنَكُمْ',
        translation: 'Say, "O People of the Scripture, come to a word that is equitable between us and you"'
      }
    ]
  },
  {
    id: 'al-ummah',
    arabic: 'الأمة',
    transliteration: 'Al-Ummah',
    meaning: 'The Community',
    root: 'أمم',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 64,
    tags: ['community', 'nation', 'people'],
    collections: ['community'],
    examples: [
      {
        surah: 2,
        ayah: 143,
        arabicText: 'وَكَذَٰلِكَ جَعَلْنَاكُمْ أُمَّةً وَسَطًا',
        translation: 'And thus we have made you a just community'
      }
    ]
  }
];
