
import { Word } from './vocabulary-types';
import { QuestionType, EnhancedQuizQuestion, DifficultyLevel } from './quiz-types';

export class AdvancedQuestionGenerator {
  private words: Word[];

  constructor(words: Word[]) {
    this.words = words;
  }

  generateQuestionBatch(
    questionTypes: QuestionType[],
    count: number,
    difficulty: DifficultyLevel
  ): EnhancedQuizQuestion[] {
    const questions: EnhancedQuizQuestion[] = [];
    const usedWords = new Set<string>();

    // Filter words by difficulty if not mixed/adaptive
    let availableWords = this.words;
    if (difficulty !== 'mixed' && difficulty !== 'adaptive') {
      availableWords = this.words.filter(word => word.level === difficulty);
    }

    if (availableWords.length === 0) {
      console.warn('No words available for selected difficulty');
      return [];
    }

    for (let i = 0; i < count; i++) {
      // Select question type
      const questionType = questionTypes[i % questionTypes.length];
      
      // Select word that hasn't been used
      let word: Word;
      let attempts = 0;
      do {
        word = availableWords[Math.floor(Math.random() * availableWords.length)];
        attempts++;
      } while (usedWords.has(word.id) && attempts < 50 && availableWords.length > usedWords.size);

      if (attempts >= 50 && usedWords.has(word.id)) {
        // If we can't find unused word, use any word
        word = availableWords[Math.floor(Math.random() * availableWords.length)];
      }

      usedWords.add(word.id);

      // Generate question based on type
      const question = this.generateQuestion(word, questionType, difficulty);
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  private generateQuestion(
    word: Word,
    type: QuestionType,
    difficulty: DifficultyLevel
  ): EnhancedQuizQuestion | null {
    const baseQuestion: Partial<EnhancedQuizQuestion> = {
      id: `${word.id}-${type}-${Date.now()}`,
      type,
      word,
      difficulty: difficulty === 'adaptive' ? word.level as DifficultyLevel : difficulty,
      timeLimit: this.getTimeLimit(type, difficulty)
    };

    switch (type) {
      case 'multiple-choice':
        return this.generateMultipleChoice(baseQuestion as EnhancedQuizQuestion);
      
      case 'fill-in-blank':
        return this.generateFillInBlank(baseQuestion as EnhancedQuizQuestion);
      
      case 'arabic-to-meaning':
        return this.generateArabicToMeaning(baseQuestion as EnhancedQuizQuestion);
      
      case 'meaning-to-arabic':
        return this.generateMeaningToArabic(baseQuestion as EnhancedQuizQuestion);
      
      case 'contextual-completion':
        return this.generateContextualCompletion(baseQuestion as EnhancedQuizQuestion);
      
      case 'root-family':
        return this.generateRootFamily(baseQuestion as EnhancedQuizQuestion);
      
      case 'synonym-antonym':
        return this.generateSynonymAntonym(baseQuestion as EnhancedQuizQuestion);
      
      default:
        // Fallback to multiple choice for unsupported types
        return this.generateMultipleChoice(baseQuestion as EnhancedQuizQuestion);
    }
  }

  private generateMultipleChoice(question: EnhancedQuizQuestion): EnhancedQuizQuestion {
    const word = question.word;
    const options = [word.meaning];
    
    // Add 3 random incorrect options
    const otherWords = this.words.filter(w => w.id !== word.id);
    while (options.length < 4 && otherWords.length > 0) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      if (!options.includes(randomWord.meaning)) {
        options.push(randomWord.meaning);
      }
      otherWords.splice(otherWords.indexOf(randomWord), 1);
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      ...question,
      question: `What does "${word.arabic}" mean?`,
      options,
      correctAnswer: word.meaning,
      explanation: `"${word.arabic}" means "${word.meaning}"`
    };
  }

  private generateFillInBlank(question: EnhancedQuizQuestion): EnhancedQuizQuestion {
    const word = question.word;
    const sentence = word.example || `This word means ${word.meaning}.`;
    const blankedSentence = sentence.replace(new RegExp(word.arabic, 'gi'), '____');

    return {
      ...question,
      question: `Fill in the blank: ${blankedSentence}`,
      correctAnswer: word.arabic,
      explanation: `The correct answer is "${word.arabic}" which means "${word.meaning}"`
    };
  }

  private generateArabicToMeaning(question: EnhancedQuizQuestion): EnhancedQuizQuestion {
    const word = question.word;
    
    return {
      ...question,
      question: `What is the meaning of: ${word.arabic}`,
      correctAnswer: word.meaning,
      explanation: `"${word.arabic}" means "${word.meaning}"`
    };
  }

  private generateMeaningToArabic(question: EnhancedQuizQuestion): EnhancedQuizQuestion {
    const word = question.word;
    const options = [word.arabic];
    
    // Add 3 random incorrect options
    const otherWords = this.words.filter(w => w.id !== word.id);
    while (options.length < 4 && otherWords.length > 0) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      if (!options.includes(randomWord.arabic)) {
        options.push(randomWord.arabic);
      }
      otherWords.splice(otherWords.indexOf(randomWord), 1);
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      ...question,
      question: `Which Arabic word means "${word.meaning}"?`,
      options,
      correctAnswer: word.arabic,
      explanation: `"${word.meaning}" is "${word.arabic}" in Arabic`
    };
  }

  private generateContextualCompletion(question: EnhancedQuizQuestion): EnhancedQuizQuestion {
    const word = question.word;
    const context = word.example || `In Islamic context, ${word.arabic} refers to ${word.meaning}.`;
    
    return {
      ...question,
      question: `Complete this sentence: ${context.replace(word.arabic, '____')}`,
      correctAnswer: word.arabic,
      contextualHint: `This word relates to: ${word.meaning}`,
      explanation: `"${word.arabic}" fits perfectly in this context as it means "${word.meaning}"`
    };
  }

  private generateRootFamily(question: EnhancedQuizQuestion): EnhancedQuizQuestion {
    const word = question.word;
    const rootWords = this.words.filter(w => 
      w.root === word.root && w.id !== word.id
    ).slice(0, 3);

    const options = [word.arabic, ...rootWords.map(w => w.arabic)];
    
    // Add random words if not enough root family words
    while (options.length < 4) {
      const randomWord = this.words[Math.floor(Math.random() * this.words.length)];
      if (!options.includes(randomWord.arabic)) {
        options.push(randomWord.arabic);
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      ...question,
      question: `Which word from the root "${word.root}" means "${word.meaning}"?`,
      options: options.slice(0, 4),
      correctAnswer: word.arabic,
      rootFamily: [word.arabic, ...rootWords.map(w => w.arabic)],
      explanation: `"${word.arabic}" comes from the root "${word.root}" and means "${word.meaning}"`
    };
  }

  private generateSynonymAntonym(question: EnhancedQuizQuestion): EnhancedQuizQuestion {
    const word = question.word;
    
    // Try to find words with similar meanings (synonyms)
    const synonyms = this.words.filter(w => 
      w.id !== word.id && 
      w.meaning.toLowerCase().includes(word.meaning.toLowerCase().split(' ')[0])
    ).slice(0, 2);

    const options = [word.meaning];
    synonyms.forEach(syn => options.push(syn.meaning));
    
    // Fill remaining slots with random meanings
    const otherWords = this.words.filter(w => w.id !== word.id && !synonyms.some(s => s.id === w.id));
    while (options.length < 4 && otherWords.length > 0) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      if (!options.includes(randomWord.meaning)) {
        options.push(randomWord.meaning);
      }
      otherWords.splice(otherWords.indexOf(randomWord), 1);
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      ...question,
      question: `Which meaning is closest to "${word.arabic}"?`,
      options,
      correctAnswer: word.meaning,
      synonyms: synonyms.map(s => s.meaning),
      explanation: `"${word.arabic}" means "${word.meaning}"`
    };
  }

  private getTimeLimit(type: QuestionType, difficulty: DifficultyLevel): number {
    const baseTime = {
      'multiple-choice': 15,
      'fill-in-blank': 20,
      'arabic-to-meaning': 15,
      'meaning-to-arabic': 15,
      'audio-recognition': 25,
      'contextual-completion': 30,
      'root-family': 25,
      'synonym-antonym': 20,
      'pronunciation-match': 30
    };

    const difficultyMultiplier = {
      'beginner': 1.5,
      'intermediate': 1.0,
      'advanced': 0.8,
      'mixed': 1.0,
      'adaptive': 1.0
    };

    return Math.round(baseTime[type] * difficultyMultiplier[difficulty]);
  }
}
