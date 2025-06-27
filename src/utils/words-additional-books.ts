
import { Word } from './vocabulary-types';

export const additionalBooksWords: Word[] = [
  {
    id: 'az-zabur',
    arabic: 'الزبور',
    transliteration: 'Az-Zabur',
    meaning: 'The Psalms',
    root: 'زبر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 3,
    tags: ['book', 'scripture', 'psalms'],
    collections: ['knowledge', 'prophets'],
    examples: [
      {
        surah: 4,
        ayah: 163,
        arabicText: 'وَآتَيْنَا داوُودَ زَبُورًا',
        translation: 'And We gave David the book [of Psalms]'
      }
    ]
  },
  {
    id: 'as-suhuf',
    arabic: 'الصحف',
    transliteration: 'As-Suhuf',
    meaning: 'The Scrolls',
    root: 'صحف',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 9,
    tags: ['book', 'scripture', 'scrolls'],
    collections: ['knowledge', 'prophets'],
    examples: [
      {
        surah: 87,
        ayah: 18,
        arabicText: 'إِنَّ هَٰذَا لَفِي الصُّحُفِ الْأُولَىٰ',
        translation: 'Indeed, this is in the former scriptures'
      }
    ]
  },
  {
    id: 'al-lawh-al-mahfuz',
    arabic: 'اللوح المحفوظ',
    transliteration: 'Al-Lawh al-Mahfuz',
    meaning: 'The Preserved Tablet',
    root: 'لوح',
    partOfSpeech: 'noun',
    level: 'advanced',
    frequency: 1,
    tags: ['book', 'preserved', 'divine'],
    collections: ['knowledge', 'faith'],
    examples: [
      {
        surah: 85,
        ayah: 22,
        arabicText: 'بَلْ هُوَ قُرْآنٌ مَّجِيدٌ فِي لَوْحٍ مَّحْفُوظٍ',
        translation: 'But this is an honored Qur\'an [Inscribed] in a Preserved Slate'
      }
    ]
  },
  {
    id: 'umm-al-kitab',
    arabic: 'أم الكتاب',
    transliteration: 'Umm al-Kitab',
    meaning: 'Mother of the Book',
    root: 'أمم',
    partOfSpeech: 'noun',
    level: 'advanced',
    frequency: 1,
    tags: ['book', 'source', 'divine'],
    collections: ['knowledge', 'faith'],
    examples: [
      {
        surah: 43,
        ayah: 4,
        arabicText: 'وَإِنَّهُ فِي أُمِّ الْكِتَابِ لَدَيْنَا لَعَلِيٌّ حَكِيمٌ',
        translation: 'And indeed it is, in the Mother of the Book with Us, exalted and full of wisdom'
      }
    ]
  }
];
