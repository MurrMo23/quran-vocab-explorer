
import { Word } from './vocabulary-types';

export const moralEthicalWords: Word[] = [
  {
    id: 'al-birr',
    arabic: 'البر',
    transliteration: 'Al-Birr',
    meaning: 'Righteousness',
    root: 'برر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 8,
    location: { surah: 2, ayah: 177, position: 2 },
    frequencyVerified: true,
    tags: ['righteousness', 'virtue', 'goodness'],
    collections: ['ethics'],
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
    id: 'al-fasad',
    arabic: 'الفساد',
    transliteration: 'Al-Fasad',
    meaning: 'Corruption',
    root: 'فسد',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 11,
    location: { surah: 30, ayah: 41, position: 2 },
    frequencyVerified: true,
    tags: ['corruption', 'evil', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 30,
        ayah: 41,
        arabicText: 'ظَهَرَ ٱلْفَسَادُ فِى ٱلْبَرِّ وَٱلْبَحْرِ بِمَا كَسَبَتْ أَيْدِى ٱلنَّاسِ',
        translation: 'Corruption has appeared throughout the land and sea by [reason of] what the hands of people have earned'
      }
    ]
  },
  {
    id: 'az-zulm',
    arabic: 'الظلم',
    transliteration: 'Az-Zulm',
    meaning: 'Injustice',
    root: 'ظلم',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 20,
    location: { surah: 11, ayah: 117, position: 6 },
    frequencyVerified: true,
    tags: ['injustice', 'oppression', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 11,
        ayah: 117,
        arabicText: 'وَمَا كَانَ رَبُّكَ لِيُهْلِكَ ٱلْقُرَىٰ بِظُلْمٍ وَأَهْلُهَا مُصْلِحُونَ',
        translation: 'And your Lord would not have destroyed the cities unjustly while their people were reformers'
      }
    ]
  },
  {
    id: 'al-maghfirah',
    arabic: 'المغفرة',
    transliteration: 'Al-Maghfirah',
    meaning: 'Forgiveness',
    root: 'غفر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 28,
    location: { surah: 2, ayah: 221, position: 33 },
    frequencyVerified: true,
    tags: ['forgiveness', 'mercy', 'virtue'],
    collections: ['ethics', 'faith'],
    examples: [
      {
        surah: 2,
        ayah: 221,
        arabicText: 'وَاللَّهُ يَدْعُو إِلَى الْجَنَّةِ وَالْمَغْفِرَةِ بِإِذْنِهِ',
        translation: 'But Allah invites to Paradise and to forgiveness, by His permission'
      }
    ]
  }
];
