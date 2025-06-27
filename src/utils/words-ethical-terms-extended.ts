
import { Word } from './vocabulary-types';

export const ethicalTermsExtendedWords: Word[] = [
  {
    id: 'as-salah',
    arabic: 'الصلاح',
    transliteration: 'As-Salah',
    meaning: 'Righteousness',
    root: 'صلح',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 180,
    tags: ['righteousness', 'virtue', 'goodness'],
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
    frequency: 12,
    tags: ['falsehood', 'lies', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 2,
        ayah: 42,
        arabicText: 'وَلَا تَلْبِسُوا الْحَقَّ بِالْبَاطِلِ وَتَكْتُمُوا الْحَقَّ وَأَنتُمْ تَعْلَمُونَ',
        translation: 'And do not mix the truth with falsehood or conceal the truth while you know [it]'
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
    frequency: 16,
    tags: ['betrayal', 'treachery', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 8,
        ayah: 27,
        arabicText: 'وَلَا تَخُونُوا اللَّهَ وَالرَّسُولَ وَتَخُونُوا أَمَانَاتِكُمْ',
        translation: 'And do not betray Allah and the Messenger or betray your trusts'
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
    frequency: 1,
    tags: ['modesty', 'shyness', 'virtue'],
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
    frequency: 1,
    tags: ['humility', 'modesty', 'virtue'],
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
    frequency: 14,
    tags: ['pride', 'arrogance', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 7,
        ayah: 13,
        arabicText: 'قَالَ مَا مَنَعَكَ أَلَّا تَسْجُدَ إِذْ أَمَرْتُكَ ۖ قَالَ أَنَا خَيْرٌ مِّنْهُ',
        translation: '[Allah] said, "What prevented you from prostrating when I commanded you?" [Satan] said, "I am better than him"'
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
    frequency: 2,
    tags: ['envy', 'jealousy', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 113,
        ayah: 5,
        arabicText: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        translation: 'And from the evil of an envier when he envies'
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
    frequency: 23,
    tags: ['anger', 'wrath', 'emotion'],
    collections: ['ethics', 'emotions'],
    examples: [
      {
        surah: 3,
        ayah: 134,
        arabicText: 'وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ',
        translation: 'Who repress anger and who pardon the people'
      }
    ]
  }
];
