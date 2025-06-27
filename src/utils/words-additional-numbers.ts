
import { Word } from './vocabulary-types';

export const additionalNumbersWords: Word[] = [
  {
    id: 'thamaniyah',
    arabic: 'ثمانية',
    transliteration: 'Thamaniyah',
    meaning: 'Eight',
    root: 'ثمن',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 1,
    tags: ['numbers', 'basic'],
    collections: ['numbers'],
    examples: [
      {
        surah: 69,
        ayah: 7,
        arabicText: 'سَخَّرَهَا عَلَيْهِمْ سَبْعَ لَيَالٍ وَثَمَانِيَةَ أَيَّامٍ',
        translation: 'Which Allah imposed upon them for seven nights and eight days'
      }
    ]
  },
  {
    id: 'tisah',
    arabic: 'تسعة',
    transliteration: 'Tis\'ah',
    meaning: 'Nine',
    root: 'تسع',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 4,
    tags: ['numbers', 'basic'],
    collections: ['numbers'],
    examples: [
      {
        surah: 27,
        ayah: 48,
        arabicText: 'وَكَانَ فِي الْمَدِينَةِ تِسْعَةُ رَهْطٍ',
        translation: 'And there were in the city nine family heads'
      }
    ]
  },
  {
    id: 'ahad-ashar',
    arabic: 'أحد عشر',
    transliteration: 'Ahad ashar',
    meaning: 'Eleven',
    root: 'وحد',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 1,
    tags: ['numbers', 'teens'],
    collections: ['numbers'],
    examples: [
      {
        surah: 12,
        ayah: 4,
        arabicText: 'إِذْ قَالَ يُوسُفُ لِأَبِيهِ يَا أَبَتِ إِنِّي رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا',
        translation: 'When Joseph said to his father, "O my father, indeed I have seen eleven stars"'
      }
    ]
  },
  {
    id: 'ithna-ashar',
    arabic: 'اثنا عشر',
    transliteration: 'Ithna ashar',
    meaning: 'Twelve',
    root: 'ثني',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 5,
    tags: ['numbers', 'teens'],
    collections: ['numbers'],
    examples: [
      {
        surah: 2,
        ayah: 60,
        arabicText: 'فَانفَجَرَتْ مِنْهُ اثْنَتَا عَشْرَةَ عَيْنًا',
        translation: 'And there gushed forth from it twelve springs'
      }
    ]
  },
  {
    id: 'ishrun',
    arabic: 'عشرون',
    transliteration: 'Ishrun',
    meaning: 'Twenty',
    root: 'عشر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 1,
    tags: ['numbers', 'tens'],
    collections: ['numbers'],
    examples: [
      {
        surah: 8,
        ayah: 65,
        arabicText: 'إِن يَكُن مِّنكُمْ عِشْرُونَ صَابِرُونَ يَغْلِبُوا مِائَتَيْنِ',
        translation: 'If there are among you twenty [who are] steadfast, they will overcome two hundred'
      }
    ]
  }
];
