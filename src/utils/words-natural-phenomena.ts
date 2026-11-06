
import { Word } from './vocabulary-types';

export const naturalPhenomenaWords: Word[] = [
  {
    id: 'as-sahab',
    arabic: 'السحاب',
    transliteration: 'As-Sahab',
    meaning: 'Clouds',
    root: 'سحب',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 9,
    location: { surah: 2, ayah: 164, position: 36 },
    frequencyVerified: true,
    tags: ['nature', 'weather', 'sky'],
    collections: ['nature', 'weather'],
    examples: [
      {
        surah: 2,
        ayah: 164,
        arabicText: 'وَمَا أَنزَلَ اللَّهُ مِنَ السَّمَاءِ مِن مَّاءٍ فَأَحْيَا بِهِ الْأَرْضَ بَعْدَ مَوْتِهَا وَبَثَّ فِيهَا مِن كُلِّ دَابَّةٍ وَتَصْرِيفِ الرِّيَاحِ وَالسَّحَابِ الْمُسَخَّرِ بَيْنَ السَّمَاءِ وَالْأَرْضِ',
        translation: 'And what Allah has sent down from the heaven of rain, giving life thereby to the earth after its lifelessness and dispersing therein every [kind of] moving creature, and [His] directing of the winds and the clouds controlled between the heaven and the earth'
      }
    ]
  },
  {
    id: 'al-barq',
    arabic: 'البرق',
    transliteration: 'Al-Barq',
    meaning: 'Lightning',
    root: 'برق',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 5,
    location: { surah: 2, ayah: 20, position: 2 },
    frequencyVerified: true,
    tags: ['nature', 'weather', 'light'],
    collections: ['nature', 'weather'],
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
    id: 'ar-rad',
    arabic: 'الرعد',
    transliteration: 'Ar-Ra\'d',
    meaning: 'Thunder',
    root: 'رعد',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 2,
    location: { surah: 13, ayah: 13, position: 2 },
    frequencyVerified: true,
    tags: ['nature', 'weather', 'sound'],
    collections: ['nature', 'weather'],
    examples: [
      {
        surah: 13,
        ayah: 13,
        arabicText: 'وَيُسَبِّحُ الرَّعْدُ بِحَمْدِهِ',
        translation: 'And the thunder exalts [Allah] with praise of Him'
      }
    ]
  },
  {
    id: 'ath-thalj',
    arabic: 'الثلج',
    transliteration: 'Ath-Thalj',
    meaning: 'Snow',
    root: 'ثلج',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 0,
    frequencyVerified: true,
    tags: ['related-form', 'not-in-quran', 'nature', 'weather', 'cold'],
    collections: ['nature', 'weather'],
    examples: [
      {
        surah: 2,
        ayah: 19,
        arabicText: 'أَوْ كَصَيِّبٍ مِّنَ السَّمَاءِ فِيهِ ظُلُمَاتٌ وَرَعْدٌ وَبَرْقٌ',
        translation: 'Or [it is] like a rainstorm from the sky within which is darkness, thunder and lightning'
      }
    ]
  },
  {
    id: 'al-barad',
    arabic: 'البرد',
    transliteration: 'Al-Barad',
    meaning: 'Hail',
    root: 'برد',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 1,
    location: { surah: 24, ayah: 43, position: 25 },
    frequencyVerified: true,
    tags: ['nature', 'weather', 'ice'],
    collections: ['nature', 'weather'],
    examples: [
      {
        surah: 24,
        ayah: 43,
        arabicText: 'وَيُنَزِّلُ مِنَ السَّمَاءِ مِن جِبَالٍ فِيهَا مِن بَرَدٍ',
        translation: 'And He sends down from the sky, from mountains [of clouds] within it, hail'
      }
    ]
  },
  {
    id: 'at-turab',
    arabic: 'التراب',
    transliteration: 'At-Turab',
    meaning: 'Dust',
    root: 'ترب',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 17,
    location: { surah: 3, ayah: 59, position: 10 },
    frequencyVerified: true,
    tags: ['nature', 'earth', 'creation'],
    collections: ['nature'],
    examples: [
      {
        surah: 3,
        ayah: 59,
        arabicText: 'إِنَّ مَثَلَ عِيسَىٰ عِندَ اللَّهِ كَمَثَلِ آدَمَ ۖ خَلَقَهُ مِن تُرَابٍ',
        translation: 'Indeed, the example of Jesus to Allah is like that of Adam. He created Him from dust'
      }
    ]
  },
  {
    id: 'al-hawa',
    arabic: 'الهواء',
    transliteration: 'Al-Hawa',
    meaning: 'Void, empty (in 14:43 the hearts are "hawa\'" - void); the sense "air" does not occur in the Quran',
    root: 'هوي',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 1,
    location: { surah: 14, ayah: 43, position: 9 },
    frequencyVerified: true,
    tags: ['nature', 'elements', 'atmosphere'],
    collections: ['nature'],
    examples: [
      {
        surah: 14,
        ayah: 43,
        arabicText: 'مُهْطِعِينَ مُقْنِعِى رُءُوسِهِمْ لَا يَرْتَدُّ إِلَيْهِمْ طَرْفُهُمْ ۖ وَأَفْـِٔدَتُهُمْ هَوَآءٌ',
        translation: 'Racing ahead, their heads raised up, their glance does not come back to them, and their hearts are void'
      }
    ]
  },
  {
    id: 'an-nabat',
    arabic: 'النبات',
    transliteration: 'An-Nabat',
    meaning: 'Plants',
    root: 'نبت',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 9,
    location: { surah: 78, ayah: 15, position: 4 },
    frequencyVerified: true,
    tags: ['nature', 'plants', 'growth'],
    collections: ['nature'],
    examples: [
      {
        surah: 78,
        ayah: 15,
        arabicText: 'لِّنُخْرِجَ بِهِۦ حَبًّا وَنَبَاتًا',
        translation: 'That We may bring forth thereby grain and vegetation'
      }
    ]
  }
];
