
import { Word, Collection } from './vocabulary-types';
import { beginnerWords } from './words-beginner';
import { intermediateWords } from './words-intermediate';
import { advancedWords } from './words-advanced';
import { divineNamesWords } from './words-divine-names';
import { religiousConceptsWords } from './words-religious-concepts';
import { prophetsExpandedWords } from './words-prophets-expanded';
import { afterlifeWords } from './words-afterlife';
import { natureExpandedWords } from './words-nature-expanded';
import { numbersWords } from './words-numbers';
import { colorsWords } from './words-colors';
import { bodyPartsWords } from './words-body-parts';
import { extendedDivineNamesWords } from './words-extended-divine-names';
import { worshipExtendedWords } from './words-worship-extended';
import { angelsAndSpiritualWords } from './words-angels-spiritual';
import { booksAndScripturesWords } from './words-books-scriptures';
import { peopleAndSocietyWords } from './words-people-society';
import { moralEthicalWords } from './words-moral-ethical';
import { completeDivineNamesWords } from './words-complete-divine-names';
import { additionalDivineNamesWords } from './words-additional-divine-names';
import { religiousConceptsExtendedWords } from './words-religious-concepts-extended';
import { afterlifeExtendedWords } from './words-afterlife-extended';
import { timeAndCreationWords } from './words-time-creation';
import { additionalProphetsWords } from './words-additional-prophets';
import { additionalAngelsWords } from './words-additional-angels';
import { additionalBooksWords } from './words-additional-books';
import { additionalPeopleWords } from './words-additional-people';
import { ethicalTermsExtendedWords } from './words-ethical-terms-extended';
import { actionsAndDeedsWords } from './words-actions-deeds';
import { particlesAndPrepositionsWords } from './words-particles-prepositions';
import { quranicPhrasesWords } from './words-quranic-phrases';
import { naturalPhenomenaWords } from './words-natural-phenomena';
import { additionalBodyPartsWords } from './words-additional-body-parts';
import { additionalNumbersWords } from './words-additional-numbers';
import { directionsWords } from './words-directions';
import { importantVerbsWords } from './words-important-verbs';
import { expandedCollections } from './expanded-collections';

// Export type and collection definitions
export type { Word, Example, Collection } from './vocabulary-types';
export { expandedCollections as collections } from './expanded-collections';

// Combine all vocabulary words including new comprehensive sets
const allVocabularyWords: Word[] = [
  ...beginnerWords,
  ...intermediateWords,
  ...advancedWords,
  ...divineNamesWords,
  ...religiousConceptsWords,
  ...prophetsExpandedWords,
  ...afterlifeWords,
  ...natureExpandedWords,
  ...numbersWords,
  ...colorsWords,
  ...bodyPartsWords,
  ...extendedDivineNamesWords,
  ...worshipExtendedWords,
  ...angelsAndSpiritualWords,
  ...booksAndScripturesWords,
  ...peopleAndSocietyWords,
  ...moralEthicalWords,
  ...completeDivineNamesWords,
  ...additionalDivineNamesWords,
  ...religiousConceptsExtendedWords,
  ...afterlifeExtendedWords,
  ...timeAndCreationWords,
  ...additionalProphetsWords,
  ...additionalAngelsWords,
  ...additionalBooksWords,
  ...additionalPeopleWords,
  ...ethicalTermsExtendedWords,
  ...actionsAndDeedsWords,
  ...particlesAndPrepositionsWords,
  ...quranicPhrasesWords,
  ...naturalPhenomenaWords,
  ...additionalBodyPartsWords,
  ...additionalNumbersWords,
  ...directionsWords,
  ...importantVerbsWords
];

// Remove duplicates based on ID
const uniqueVocabulary = allVocabularyWords.filter((word, index, self) => 
  index === self.findIndex(w => w.id === word.id)
);

// Export the final vocabulary - this is the main export
export const sampleVocabulary: Word[] = uniqueVocabulary;

// Assign collections to words based on their current collections arrays
const assignCollections = () => {
  // The words already have their collections assigned in their individual files
  // This function now just ensures consistency and adds any missing assignments
  
  // Ensure all faith-related words are properly categorized
  const faithWords = sampleVocabulary.filter(word => 
    word.tags.includes('divine') || 
    word.tags.includes('faith') || 
    word.tags.includes('divine attributes') ||
    word.tags.includes('theology') ||
    word.meaning.toLowerCase().includes('allah') ||
    word.meaning.toLowerCase().includes('god')
  );
  
  faithWords.forEach(word => {
    if (!word.collections.includes('faith')) {
      word.collections.push('faith');
    }
  });
  
  // Ensure prophet-related words are in prophets collection
  const prophetWords = sampleVocabulary.filter(word => 
    word.tags.includes('prophets') || 
    word.partOfSpeech === 'noun' && (
      word.meaning.toLowerCase().includes('prophet') ||
      word.meaning.toLowerCase().includes('messenger') ||
      ['آدم', 'نوح', 'إبراهيم', 'موسى', 'عيسى', 'يوسف', 'داود', 'سليمان', 'أيوب', 'يونس'].includes(word.arabic)
    )
  );
  
  prophetWords.forEach(word => {
    if (!word.collections.includes('prophets')) {
      word.collections.push('prophets');
    }
  });
  
  // Ensure ethics-related words are properly categorized
  const ethicsWords = sampleVocabulary.filter(word => 
    word.tags.includes('ethics') || 
    word.tags.includes('righteousness') ||
    word.tags.includes('virtue') ||
    word.tags.includes('justice') ||
    word.tags.includes('negative traits')
  );
  
  ethicsWords.forEach(word => {
    if (!word.collections.includes('ethics')) {
      word.collections.push('ethics');
    }
  });
  
  // Ensure afterlife-related words are properly categorized
  const afterlifeWords = sampleVocabulary.filter(word => 
    word.tags.includes('afterlife') || 
    word.tags.includes('punishment') ||
    word.tags.includes('reward') ||
    word.tags.includes('paradise') ||
    word.tags.includes('resurrection')
  );
  
  afterlifeWords.forEach(word => {
    if (!word.collections.includes('afterlife')) {
      word.collections.push('afterlife');
    }
  });
  
  // Ensure worship-related words are properly categorized
  const worshipWords = sampleVocabulary.filter(word => 
    word.tags.includes('worship') || 
    word.tags.includes('prayer') ||
    word.tags.includes('pillar') ||
    word.tags.includes('ritual') ||
    word.tags.includes('recitation')
  );
  
  worshipWords.forEach(word => {
    if (!word.collections.includes('worship')) {
      word.collections.push('worship');
    }
  });
  
  // Ensure community-related words are properly categorized
  const communityWords = sampleVocabulary.filter(word => 
    word.tags.includes('community') || 
    word.tags.includes('social') ||
    word.tags.includes('governance') ||
    word.tags.includes('history')
  );
  
  communityWords.forEach(word => {
    if (!word.collections.includes('community')) {
      word.collections.push('community');
    }
  });
  
  // Ensure knowledge-related words are properly categorized
  const knowledgeWords = sampleVocabulary.filter(word => 
    word.tags.includes('knowledge') || 
    word.tags.includes('learning') ||
    word.tags.includes('understanding') ||
    word.tags.includes('wisdom') ||
    word.tags.includes('jurisprudence') ||
    word.tags.includes('interpretation')
  );
  
  knowledgeWords.forEach(word => {
    if (!word.collections.includes('knowledge')) {
      word.collections.push('knowledge');
    }
  });
  
  // Ensure nature-related words are properly categorized
  const natureWords = sampleVocabulary.filter(word => 
    word.tags.includes('nature') || 
    word.tags.includes('creation') ||
    word.tags.includes('sustenance') ||
    word.meaning.toLowerCase().includes('water') ||
    word.meaning.toLowerCase().includes('tree') ||
    word.meaning.toLowerCase().includes('mountain') ||
    word.meaning.toLowerCase().includes('sea')
  );
  
  natureWords.forEach(word => {
    if (!word.collections.includes('nature')) {
      word.collections.push('nature');
    }
  });
};

// Call the function to assign collections
assignCollections();

// Custom collections storage - in a real app, this would be in a database
let customCollections: Collection[] = [];

// Function to add a custom collection
export const addCustomCollection = (collection: Collection): Collection => {
  customCollections.push(collection);
  return collection;
};

// Function to get all collections including custom ones
export const getAllCollections = (): Collection[] => {
  return [...expandedCollections, ...customCollections];
};

// Map to store custom words
const customWords: Map<string, Word> = new Map();

// Function to add a custom word
export const addCustomWord = (word: Word): Word => {
  customWords.set(word.id, word);
  return word;
};

// Get all words including custom ones
export const getAllWords = (): Word[] => {
  return [...sampleVocabulary, ...Array.from(customWords.values())];
};

// Add audio URLs to words that don't have them
sampleVocabulary.forEach(word => {
  // Only add audio URL if it doesn't already have one
  if (!word.audioUrl) {
    // Generate a placeholder audio URL based on the word ID
    word.audioUrl = `https://arabic-vocabulary.com/audio/${word.id}.mp3`;
  }
});

// Get a list of words based on level
export const getWordsByLevel = (level: 'beginner' | 'intermediate' | 'advanced'): Word[] => {
  return getAllWords().filter(word => word.level === level);
};

// Get a list of daily words (would be based on user progress in a real app)
export const getDailyWords = (count: number = 5): Word[] => {
  // In a real app, this would select words based on the user's learning algorithm
  // For now, randomly select 'count' words from the sample vocabulary
  const shuffled = [...getAllWords()].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get words filtered by collection and optionally by level
export const getDailyWordsFromCollection = (collectionId: string, count: number = 5): Word[] => {
  const collectionWords = getWordsByCollection(collectionId);
  const shuffled = [...collectionWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Get a single word by ID
export const getWordById = (id: string): Word | undefined => {
  // Check custom words first
  if (customWords.has(id)) {
    return customWords.get(id);
  }
  // Then check sample vocabulary
  return sampleVocabulary.find(word => word.id === id);
};

// Search words by query (arabic, meaning, or transliteration)
export const searchWords = (query: string): Word[] => {
  const normalizedQuery = query.toLowerCase();
  return getAllWords().filter(word => 
    word.arabic.includes(query) || 
    word.meaning.toLowerCase().includes(normalizedQuery) || 
    word.transliteration.toLowerCase().includes(normalizedQuery)
  );
};

// Get words by collection
export const getWordsByCollection = (collectionId: string): Word[] => {
  return getAllWords().filter(word => 
    word.collections.includes(collectionId)
  );
};

// Get collection by ID
export const getCollectionById = (id: string) => {
  // Check built-in collections
  const builtInCollection = expandedCollections.find(collection => collection.id === id);
  if (builtInCollection) return builtInCollection;
  
  // Check custom collections
  return customCollections.find(collection => collection.id === id);
};

// Add word to collection
export const addWordToCollection = (wordId: string, collectionId: string): boolean => {
  const word = getWordById(wordId);
  if (!word) return false;
  
  // Check if word already in collection
  if (word.collections.includes(collectionId)) return true;
  
  // Add collection to word
  word.collections.push(collectionId);
  return true;
};

// Remove word from collection
export const removeWordFromCollection = (wordId: string, collectionId: string): boolean => {
  const word = getWordById(wordId);
  if (!word) return false;
  
  // Check if word in collection
  const index = word.collections.indexOf(collectionId);
  if (index === -1) return false;
  
  // Remove collection from word
  word.collections.splice(index, 1);
  return true;
};

// Generate audio for a word using Text-to-Speech
export const generateAudioForWord = async (word: Word): Promise<string | null> => {
  // In a real application, this would call a Text-to-Speech API
  // For this demo, we'll return a placeholder URL
  
  console.log(`Generating audio for word: ${word.arabic}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a placeholder URL - in a real app this would be the actual audio URL
  const audioUrl = `https://arabic-vocabulary.com/generated-audio/${word.id}.mp3`;
  
  // Update the word's audio URL
  word.audioUrl = audioUrl;
  
  return audioUrl;
};
