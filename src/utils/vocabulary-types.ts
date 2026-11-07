
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

/**
 * How a word that does not occur verbatim in the Quran relates to the Quranic text.
 * - related: the Quran uses another form from the same root family (e.g. تَوَكُّل -> تَوَكَّلَ).
 * - post-quranic: a later Islamic or cultural term; `arabic`/`location` point to the closest
 *   Quranic word when one exists.
 */
export interface QuranicForm {
  status: 'related' | 'post-quranic';
  /** One plain sentence shown to learners. */
  note: string;
  /** The related word exactly as written at `location` (Uthmani script). */
  arabic?: string;
  /** Dictionary form of the related word. */
  lemma?: string;
  /** Where the related word occurs; used for word-by-word recitation audio. */
  location?: WordLocation;
  /** Occurrences of the related word's lemma in the Quran. */
  occurrences?: number;
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
  // Set for words not found verbatim in the Quran (frequency 0).
  quranicForm?: QuranicForm;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
}
