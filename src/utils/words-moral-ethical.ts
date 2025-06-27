
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
    frequency: 17,
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
    frequency: 50,
    tags: ['corruption', 'evil', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 2,
        ayah: 11,
        arabicText: 'وَإِذَا قِيلَ لَهُمْ لَا تُفْسِدُوا فِي الْأَرْضِ قَالُوا إِنَّمَا نَحْنُ مُصْلِحُونَ',
        translation: 'And when it is said to them, "Do not cause corruption on the earth," they say, "We are but reformers"'
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
    frequency: 289,
    tags: ['injustice', 'oppression', 'negative traits'],
    collections: ['ethics'],
    examples: [
      {
        surah: 2,
        ayah: 254,
        arabicText: 'وَالْكَافِرُونَ هُمُ الظَّالِمُونَ',
        translation: 'And the disbelievers - they are the wrongdoers'
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
    frequency: 234,
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
