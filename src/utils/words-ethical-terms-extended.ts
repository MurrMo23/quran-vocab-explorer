
import { Word } from './vocabulary-types';

export const ethicalTermsExtendedWords: Word[] = [
  {
    id: 'as-salah-righteousness',
    arabic: 'الصلاح',
    transliteration: 'As-Salah',
    meaning: 'Righteousness',
    root: 'صلح',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 0,
    frequencyVerified: true,
    tags: ['related-form', 'not-in-quran', 'righteousness', 'virtue', 'goodness'],
    collections: ['ethics'],
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
    id: 'al-kidhb',
    arabic: 'الكذب',
    transliteration: 'Al-Kidhb',
    meaning: 'Falsehood',
    root: 'كذب',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 33,
    location: { surah: 16, ayah: 105, position: 3 },
    frequencyVerified: true,
    tags: ['falsehood', 'lies', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 16,
        ayah: 105,
        arabicText: 'إِنَّمَا يَفْتَرِي الْكَذِبَ الَّذِينَ لَا يُؤْمِنُونَ بِآيَاتِ اللَّهِ',
        translation: 'They only invent falsehood who do not believe in the verses of Allah'
      }
    ]
  },
  {
    id: 'al-khiyanah',
    arabic: 'الخيانة',
    transliteration: 'Al-Khiyanah',
    meaning: 'Betrayal',
    root: 'خون',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 2,
    location: { surah: 8, ayah: 58, position: 5 },
    frequencyVerified: true,
    tags: ['betrayal', 'treachery', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 8,
        ayah: 58,
        arabicText: 'وَإِمَّا تَخَافَنَّ مِن قَوْمٍ خِيَانَةً فَٱنۢبِذْ إِلَيْهِمْ عَلَىٰ سَوَآءٍ',
        translation: 'If you [have reason to] fear from a people betrayal, throw [their treaty] back to them, [putting you] on equal terms'
      }
    ]
  },
  {
    id: 'al-haya',
    arabic: 'الحياء',
    transliteration: 'Al-Haya',
    meaning: 'Modesty',
    root: 'حيي',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 0,
    frequencyVerified: true,
    tags: ['related-form', 'not-in-quran', 'modesty', 'shyness', 'virtue'],
    collections: ['ethics'],
    examples: [
      {
        surah: 28,
        ayah: 25,
        arabicText: 'فَجَاءَتْهُ إِحْدَاهُمَا تَمْشِي عَلَى اسْتِحْيَاءٍ',
        translation: 'Then one of the two women came to him walking with shyness'
      }
    ]
  },
  {
    id: 'at-tawadu',
    arabic: 'التواضع',
    transliteration: 'At-Tawadu\'',
    meaning: 'Humility',
    root: 'وضع',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 0,
    frequencyVerified: true,
    tags: ['related-form', 'not-in-quran', 'humility', 'modesty', 'virtue'],
    collections: ['ethics'],
    examples: [
      {
        surah: 25,
        ayah: 63,
        arabicText: 'وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا',
        translation: 'And the servants of the Most Merciful are those who walk upon the earth easily'
      }
    ]
  },
  {
    id: 'al-kibr',
    arabic: 'الكبر',
    transliteration: 'Al-Kibr',
    meaning: 'Pride',
    root: 'كبر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 2,
    location: { surah: 40, ayah: 56, position: 14 },
    frequencyVerified: true,
    tags: ['pride', 'arrogance', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 40,
        ayah: 56,
        arabicText: 'إِن فِى صُدُورِهِمْ إِلَّا كِبْرٌ مَّا هُم بِبَـٰلِغِيهِ',
        translation: 'There is not within their breasts except pride, [the extent of] which they cannot reach'
      }
    ]
  },
  {
    id: 'al-hasad',
    arabic: 'الحسد',
    transliteration: 'Al-Hasad',
    meaning: 'Envy',
    root: 'حسد',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 1,
    location: { surah: 2, ayah: 109, position: 12 },
    frequencyVerified: true,
    tags: ['envy', 'jealousy', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 2,
        ayah: 109,
        arabicText: 'وَدَّ كَثِيرٌ مِّنْ أَهْلِ ٱلْكِتَـٰبِ لَوْ يَرُدُّونَكُم مِّنۢ بَعْدِ إِيمَـٰنِكُمْ كُفَّارًا حَسَدًا مِّنْ عِندِ أَنفُسِهِم',
        translation: 'Many of the People of the Scripture wish they could turn you back to disbelief after you have believed, out of envy from themselves'
      }
    ]
  },
  {
    id: 'al-ghadab',
    arabic: 'الغضب',
    transliteration: 'Al-Ghadab',
    meaning: 'Anger',
    root: 'غضب',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 14,
    location: { surah: 7, ayah: 154, position: 5 },
    frequencyVerified: true,
    tags: ['anger', 'wrath', 'emotion'],
    collections: ['ethics', 'emotions'],
    examples: [
      {
        surah: 7,
        ayah: 154,
        arabicText: 'وَلَمَّا سَكَتَ عَن مُّوسَى ٱلْغَضَبُ أَخَذَ ٱلْأَلْوَاحَ',
        translation: 'And when the anger subsided in Moses, he took up the tablets'
      }
    ]
  }
];
