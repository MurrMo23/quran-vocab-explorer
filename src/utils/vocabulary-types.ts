
// Define core types for vocabulary data
export interface Example {
  surah: number;
  ayah: number;
  arabicText: string;
  translation: string;
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
}

export interface Collection {
  id: string;
  name: string;
  description: string;
}
