
// Define core types for vocabulary data
export interface Example {
  surah: number;
  ayah: number;
  arabicText: string;
  translation: string;
}

// A specific occurrence of a word in the Quran (1-based word position within the ayah,
// as numbered by the Quranic Arabic Corpus / Quran.com word-by-word data).
// Used to play authentic word-by-word recitation audio.
export interface WordLocation {
  surah: number;
  ayah: number;
  position: number;
}

export interface Word {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  translation?: string; // Made optional for backward compatibility
  root: string;
  partOfSpeech: string;
  examples: Example[];
  level: 'beginner' | 'intermediate' | 'advanced';
  frequency: number;
  tags: string[];
  collections: string[];
  collection?: string; // Made optional for backward compatibility
  audioUrl?: string;
  // Canonical occurrence used for word-by-word recitation audio (verified against corpus data).
  location?: WordLocation;
  // True when `frequency` was computed from corpus data rather than estimated.
  frequencyVerified?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
}
