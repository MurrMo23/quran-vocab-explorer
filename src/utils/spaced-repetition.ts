// A simplified implementation of a spaced repetition system
// In a real application, this would be more sophisticated and user-specific

interface UserWord {
  wordId: string;
  level: number; // familiarity level (0-5)
  nextReview: Date;
  lastReviewed?: Date;
  reviewCount: number;
}

interface UserProgress {
  streak: number;
  lastPracticeDate?: string;
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  mastery: number;
}

// In-memory store for user's learning progress (would be in a database in a real app)
let userWords: UserWord[] = [];
let userProgress: UserProgress = {
  streak: 0,
  totalWords: 0,
  masteredWords: 0,
  learningWords: 0,
  newWords: 0,
  mastery: 0
};

// Initialize a word for learning
export const initializeWord = (wordId: string): UserWord => {
  const existingWord = userWords.find(w => w.wordId === wordId);
  
  if (existingWord) {
    return existingWord;
  }
  
  const newWord: UserWord = {
    wordId,
    level: 0,
    nextReview: new Date(), // review immediately
    reviewCount: 0
  };
  
  userWords.push(newWord);
  return newWord;
};

// Update a word's familiarity based on user's response
export const updateWordFamiliarity = (
  wordId: string, 
  success: boolean
): UserWord => {
  let userWord = userWords.find(w => w.wordId === wordId);
  
  if (!userWord) {
    userWord = initializeWord(wordId);
  }
  
  // Record this review
  userWord.lastReviewed = new Date();
  userWord.reviewCount += 1;
  
  // Adjust familiarity level based on success
  if (success) {
    userWord.level = Math.min(5, userWord.level + 1);
  } else {
    userWord.level = Math.max(0, userWord.level - 1);
  }
  
  // Calculate next review time based on level
  const hours = calculateReviewInterval(userWord.level);
  const nextReview = new Date();
  nextReview.setHours(nextReview.getHours() + hours);
  userWord.nextReview = nextReview;
  
  return userWord;
};

// Get all words due for review
export const getWordsForReview = (): string[] => {
  const now = new Date();
  return userWords
    .filter(word => word.nextReview <= now)
    .map(word => word.wordId);
};

// Calculate the interval before next review (exponential backoff)
const calculateReviewInterval = (level: number): number => {
  // Time in hours before next review
  // Level 0: 1 hour
  // Level 1: 6 hours
  // Level 2: 1 day
  // Level 3: 3 days
  // Level 4: 1 week
  // Level 5: 2 weeks
  const intervals = [1, 6, 24, 72, 168, 336];
  return intervals[level];
};

// Update user's streak when they practice
export const updateUserStreak = (): number => {
  const today = new Date().toDateString();
  
  // If this is the first practice ever
  if (!userProgress.lastPracticeDate) {
    userProgress.streak = 1;
    userProgress.lastPracticeDate = today;
    return 1;
  }
  
  // Convert stored date string back to Date for comparison
  const lastPracticeDate = new Date(userProgress.lastPracticeDate);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // User practiced today already
  if (userProgress.lastPracticeDate === today) {
    return userProgress.streak;
  }
  // User practiced yesterday (maintain streak)
  else if (lastPracticeDate.toDateString() === yesterday.toDateString()) {
    userProgress.streak += 1;
    userProgress.lastPracticeDate = today;
  } 
  // User missed a day or more (reset streak)
  else {
    userProgress.streak = 1;
    userProgress.lastPracticeDate = today;
  }
  
  return userProgress.streak;
};

// Get user's current streak
export const getUserStreak = (): number => {
  return userProgress.streak;
};

// Get a user's progress statistics
export const getUserProgress = (): UserProgress => {
  const totalWords = userWords.length;
  const masteredWords = userWords.filter(w => w.level >= 4).length;
  const learningWords = userWords.filter(w => w.level > 0 && w.level < 4).length;
  const newWords = userWords.filter(w => w.level === 0).length;
  
  const progress = {
    ...userProgress,
    totalWords,
    masteredWords,
    learningWords,
    newWords,
    mastery: totalWords ? Math.round((masteredWords / totalWords) * 100) : 0
  };
  
  return progress;
};

// Reset all user progress (for testing)
export const resetProgress = () => {
  userWords = [];
  userProgress = {
    streak: 0,
    totalWords: 0,
    masteredWords: 0,
    learningWords: 0,
    newWords: 0,
    mastery: 0
  };
};

// Add some sample words to the user's learning queue for demonstration
export const initializeDemoProgress = (wordIds: string[]) => {
  resetProgress();
  wordIds.forEach(id => {
    initializeWord(id);
    // Randomly set some words to different familiarity levels
    const randomLevel = Math.floor(Math.random() * 6);
    for (let i = 0; i < randomLevel; i++) {
      updateWordFamiliarity(id, true);
    }
  });
};
