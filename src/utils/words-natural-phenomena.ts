
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
    frequency: 10,
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
    frequency: 1,
    tags: ['nature', 'weather', 'cold'],
    collections: ['nature', 'weather'],
    examples: [
      {
        surah: 2,
        ayah: 20,
        arabicText: 'صَيِّبٍ مِّنَ السَّمَاءِ فِيهِ ظُلُمَاتٌ وَرَعْدٌ وَبَرْقٌ',
        translation: 'Like a rainstorm from the sky within which is darkness, thunder and lightning'
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
    meaning: 'Air',
    root: 'هوي',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 1,
    tags: ['nature', 'elements', 'atmosphere'],
    collections: ['nature'],
    examples: [
      {
        surah: 14,
        ayah: 18,
        arabicText: 'كَرَمَادٍ اشْتَدَّتْ بِهِ الرِّيحُ فِي يَوْمٍ عَاصِفٍ',
        translation: 'Like ashes which the wind has blown forcefully on a stormy day'
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
    frequency: 26,
    tags: ['nature', 'plants', 'growth'],
    collections: ['nature'],
    examples: [
      {
        surah: 2,
        ayah: 61,
        arabicText: 'فَادْعُ لَنَا رَبَّكَ يُخْرِجْ لَنَا مِمَّا تُنبِتُ الْأَرْضُ',
        translation: 'So call upon your Lord to bring forth for us from the earth its green herbs'
      }
    ]
  }
];
