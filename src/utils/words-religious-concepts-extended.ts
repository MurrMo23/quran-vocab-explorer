
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
    frequency: 3,
    location: { surah: 9, ayah: 77, position: 2 },
    frequencyVerified: true,
    tags: ['religion', 'hypocrisy', 'negative'],
    collections: ['faith', 'ethics'],
    examples: [
      {
        surah: 9,
        ayah: 77,
        arabicText: 'فَأَعْقَبَهُمْ نِفَاقًا فِى قُلُوبِهِمْ إِلَىٰ يَوْمِ يَلْقَوْنَهُۥ',
        translation: 'So He penalized them with hypocrisy in their hearts until the Day they will meet Him'
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
    frequency: 9,
    location: { surah: 19, ayah: 65, position: 8 },
    frequencyVerified: true,
    tags: ['worship', 'service', 'devotion'],
    collections: ['worship', 'faith'],
    examples: [
      {
        surah: 19,
        ayah: 65,
        arabicText: 'رَّبُّ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ وَمَا بَيْنَهُمَا فَٱعْبُدْهُ وَٱصْطَبِرْ لِعِبَـٰدَتِهِۦ ۚ هَلْ تَعْلَمُ لَهُۥ سَمِيًّا',
        translation: 'Lord of the heavens and the earth and whatever is between them - so worship Him and have patience for His worship. Do you know of any similarity to Him?'
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
    frequency: 4,
    location: { surah: 22, ayah: 78, position: 5 },
    frequencyVerified: true,
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
    frequency: 22,
    location: { surah: 14, ayah: 40, position: 9 },
    frequencyVerified: true,
    tags: ['prayer', 'supplication', 'calling'],
    collections: ['worship', 'faith'],
    examples: [
      {
        surah: 14,
        ayah: 40,
        arabicText: 'رَبِّ ٱجْعَلْنِى مُقِيمَ ٱلصَّلَوٰةِ وَمِن ذُرِّيَّتِى ۚ رَبَّنَا وَتَقَبَّلْ دُعَآءِ',
        translation: 'My Lord, make me an establisher of prayer, and [many] from my descendants. Our Lord, and accept my supplication'
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
    frequency: 2,
    location: { surah: 17, ayah: 44, position: 17 },
    frequencyVerified: true,
    tags: ['glorification', 'praise', 'worship'],
    collections: ['worship', 'faith'],
    examples: [
      {
        surah: 17,
        ayah: 44,
        arabicText: 'وَإِن مِّن شَىْءٍ إِلَّا يُسَبِّحُ بِحَمْدِهِۦ وَلَـٰكِن لَّا تَفْقَهُونَ تَسْبِيحَهُمْ',
        translation: 'And there is not a thing except that it exalts [Allah] by His praise, but you do not understand their [way of] exalting'
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
    frequency: 0,
    frequencyVerified: true,
    tags: ['related-form', 'not-in-quran', 'praise', 'thanksgiving', 'worship'],
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
    frequency: 1,
    location: { surah: 17, ayah: 111, position: 21 },
    frequencyVerified: true,
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
    frequency: 0,
    frequencyVerified: true,
    tags: ['related-form', 'not-in-quran', 'declaration', 'oneness', 'worship'],
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
    frequency: 1,
    location: { surah: 9, ayah: 114, position: 3 },
    frequencyVerified: true,
    tags: ['forgiveness', 'repentance', 'worship'],
    collections: ['worship', 'faith', 'ethics'],
    examples: [
      {
        surah: 9,
        ayah: 114,
        arabicText: 'وَمَا كَانَ ٱسْتِغْفَارُ إِبْرَٰهِيمَ لِأَبِيهِ إِلَّا عَن مَّوْعِدَةٍ وَعَدَهَآ إِيَّاهُ',
        translation: 'And the request of forgiveness of Abraham for his father was only because of a promise he had made to him'
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
    frequency: 0,
    frequencyVerified: true,
    tags: ['related-form', 'not-in-quran', 'contentment', 'satisfaction', 'spiritual'],
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
