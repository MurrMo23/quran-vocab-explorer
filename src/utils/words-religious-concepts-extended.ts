
import { Word } from './vocabulary-types';

export const religiousConceptsExtendedWords: Word[] = [
  {
    id: 'an-nifaq',
    arabic: 'النفاق',
    transliteration: 'An-Nifaq',
    meaning: 'Hypocrisy',
    root: 'نفق',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 20,
    tags: ['religion', 'hypocrisy', 'negative'],
    collections: ['faith', 'ethics'],
    examples: [
      {
        surah: 2,
        ayah: 8,
        arabicText: 'وَمِنَ النَّاسِ مَن يَقُولُ آمَنَّا بِاللَّهِ وَبِالْيَوْمِ الْآخِرِ وَمَا هُم بِمُؤْمِنِينَ',
        translation: 'And of the people are some who say, "We believe in Allah and the Last Day," but they are not believers'
      }
    ]
  },
  {
    id: 'al-ibadah',
    arabic: 'العبادة',
    transliteration: 'Al-Ibadah',
    meaning: 'Worship',
    root: 'عبد',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 7,
    tags: ['worship', 'service', 'devotion'],
    collections: ['worship', 'faith'],
    examples: [
      {
        surah: 51,
        ayah: 56,
        arabicText: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',
        translation: 'And I did not create the jinn and mankind except to worship Me'
      }
    ]
  },
  {
    id: 'al-jihad',
    arabic: 'الجهاد',
    transliteration: 'Al-Jihad',
    meaning: 'Struggle, striving',
    root: 'جهد',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 41,
    tags: ['struggle', 'effort', 'striving'],
    collections: ['worship', 'ethics'],
    examples: [
      {
        surah: 22,
        ayah: 78,
        arabicText: 'وَجَاهِدُوا فِي اللَّهِ حَقَّ جِهَادِهِ',
        translation: 'And strive for Allah with the striving due to Him'
      }
    ]
  },
  {
    id: 'ad-dua',
    arabic: 'الدعاء',
    transliteration: 'Ad-Du\'a',
    meaning: 'Supplication',
    root: 'دعو',
    partOfSpeech: 'noun',
    level: 'beginner',
    frequency: 213,
    tags: ['prayer', 'supplication', 'calling'],
    collections: ['worship', 'faith'],
    examples: [
      {
        surah: 2,
        ayah: 186,
        arabicText: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
        translation: 'And when My servants ask you, [O Muhammad], concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me'
      }
    ]
  },
  {
    id: 'at-tasbih',
    arabic: 'التسبيح',
    transliteration: 'At-Tasbih',
    meaning: 'Glorification',
    root: 'سبح',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 4,
    tags: ['glorification', 'praise', 'worship'],
    collections: ['worship', 'faith'],
    examples: [
      {
        surah: 17,
        ayah: 44,
        arabicText: 'تُسَبِّحُ لَهُ السَّمَاوَاتُ السَّبْعُ وَالْأَرْضُ وَمَن فِيهِنَّ',
        translation: 'The seven heavens and the earth and whatever is in them exalt Him'
      }
    ]
  },
  {
    id: 'at-tahmeed',
    arabic: 'التحميد',
    transliteration: 'At-Tahmeed',
    meaning: 'Praise',
    root: 'حمد',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 68,
    tags: ['praise', 'thanksgiving', 'worship'],
    collections: ['worship', 'faith'],
    examples: [
      {
        surah: 1,
        ayah: 2,
        arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        translation: 'Praise to Allah, Lord of the worlds'
      }
    ]
  },
  {
    id: 'at-takbeer',
    arabic: 'التكبير',
    transliteration: 'At-Takbeer',
    meaning: 'Magnification',
    root: 'كبر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 37,
    tags: ['magnification', 'greatness', 'worship'],
    collections: ['worship', 'faith'],
    examples: [
      {
        surah: 17,
        ayah: 111,
        arabicText: 'وَكَبِّرْهُ تَكْبِيرًا',
        translation: 'And glorify Him with [great] glorification'
      }
    ]
  },
  {
    id: 'at-tahleel',
    arabic: 'التهليل',
    transliteration: 'At-Tahleel',
    meaning: 'Declaration of Allah\'s oneness',
    root: 'هلل',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 1,
    tags: ['declaration', 'oneness', 'worship'],
    collections: ['worship', 'faith'],
    examples: [
      {
        surah: 37,
        ayah: 35,
        arabicText: 'إِنَّهُمْ كَانُوا إِذَا قِيلَ لَهُمْ لَا إِلَٰهَ إِلَّا اللَّهُ يَسْتَكْبِرُونَ',
        translation: 'Indeed they, when it was said to them, "There is no deity but Allah," were arrogant'
      }
    ]
  },
  {
    id: 'al-istighfar',
    arabic: 'الاستغفار',
    transliteration: 'Al-Istighfar',
    meaning: 'Seeking forgiveness',
    root: 'غفر',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 234,
    tags: ['forgiveness', 'repentance', 'worship'],
    collections: ['worship', 'faith', 'ethics'],
    examples: [
      {
        surah: 71,
        ayah: 10,
        arabicText: 'فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا',
        translation: 'And said, "Ask forgiveness of your Lord. Indeed, He is ever a Perpetual Forgiver"'
      }
    ]
  },
  {
    id: 'ar-rida',
    arabic: 'الرضا',
    transliteration: 'Ar-Rida',
    meaning: 'Contentment',
    root: 'رضي',
    partOfSpeech: 'noun',
    level: 'intermediate',
    frequency: 73,
    tags: ['contentment', 'satisfaction', 'spiritual'],
    collections: ['faith', 'ethics'],
    examples: [
      {
        surah: 9,
        ayah: 21,
        arabicText: 'يُبَشِّرُهُمْ رَبُّهُم بِرَحْمَةٍ مِّنْهُ وَرِضْوَانٍ',
        translation: 'Their Lord gives them good tidings of mercy from Him and approval'
      }
    ]
  }
];
