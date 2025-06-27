
import { Word } from './vocabulary-types';

export const additionalAngelsWords: Word[] = [
  {
    id: 'mikaail',
    arabic: 'ميكائيل',
    transliteration: 'Mika\'il',
    meaning: 'Michael',
    root: 'ميك',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 1,
    tags: ['angels', 'archangel', 'protection'],
    collections: ['faith', 'angels'],
    examples: [
      {
        surah: 2,
        ayah: 98,
        arabicText: 'مَن كَانَ عَدُوًّا لِّلَّهِ وَمَلَائِكَتِهِ وَرُسُلِهِ وَجِبْرِيلَ وَمِيكَالَ',
        translation: 'Whoever is an enemy to Allah and His angels and His messengers and Gabriel and Michael'
      }
    ]
  },
  {
    id: 'israfil',
    arabic: 'إسرافيل',
    transliteration: 'Israfil',
    meaning: 'Israfil',
    root: 'سرف',
    partOfSpeech: 'noun',
    level: 'advanced',
    frequency: 1,
    tags: ['angels', 'archangel', 'trumpet'],
    collections: ['faith', 'angels'],
    examples: [
      {
        surah: 39,
        ayah: 68,
        arabicText: 'وَنُفِخَ فِي الصُّورِ فَصَعِقَ مَن فِي السَّمَاوَاتِ وَمَن فِي الْأَرْضِ',
        translation: 'And the Horn will be blown, and whoever is in the heavens and whoever is on the earth will fall dead'
      }
    ]
  },
  {
    id: 'azrail',
    arabic: 'عزرائيل',
    transliteration: 'Azra\'il',
    meaning: 'Angel of Death',
    root: 'عزر',
    partOfSpeech: 'noun',
    level: 'advanced',
    frequency: 1,
    tags: ['angels', 'death', 'soul'],
    collections: ['faith', 'angels'],
    examples: [
      {
        surah: 32,
        ayah: 11,
        arabicText: 'قُلْ يَتَوَفَّاكُم مَّلَكُ الْمَوْتِ الَّذِي وُكِّلَ بِكُمْ',
        translation: 'Say, "The angel of death will take you who has been entrusted with you"'
      }
    ]
  }
];
