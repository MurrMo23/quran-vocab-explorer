
import { Word } from './vocabulary-types';
import { DifficultyLevel, QuestionType, EnhancedQuizQuestion } from './quiz-types';

export interface UserPerformanceData {
  userId: string;
  wordId: string;
  attempts: number;
  correctAttempts: number;
  averageResponseTime: number;
  lastAttemptDate: Date;
  difficultyLevel: DifficultyLevel;
  masteryLevel: number; // 0-100
}

export interface AdaptiveLearningState {
  currentDifficulty: DifficultyLevel;
  performanceHistory: UserPerformanceData[];
  learningVelocity: number;
  recommendedQuestionTypes: QuestionType[];
  weakAreas: string[]; // word IDs or topics
  strengths: string[];
}

export class AdaptiveLearningEngine {
  private performanceThreshold = {
    excellent: 90,
    good: 75,
    average: 60,
    poor: 40
  };

  private difficultyProgressionRules = {
    beginner: { minAccuracy: 80, minAttempts: 5 },
    intermediate: { minAccuracy: 75, minAttempts: 8 },
    advanced: { minAccuracy: 70, minAttempts: 10 }
  };

  // Analyze user performance and adjust difficulty
  calculateOptimalDifficulty(
    performanceHistory: UserPerformanceData[],
    currentDifficulty: DifficultyLevel
  ): DifficultyLevel {
    if (performanceHistory.length === 0) return currentDifficulty;

    const recentPerformance = performanceHistory
      .slice(-10) // Last 10 attempts
      .filter(p => this.isRecentAttempt(p.lastAttemptDate));

    if (recentPerformance.length === 0) return currentDifficulty;

    const averageAccuracy = recentPerformance.reduce((sum, p) => 
      sum + (p.correctAttempts / p.attempts * 100), 0
    ) / recentPerformance.length;

    const averageResponseTime = recentPerformance.reduce((sum, p) => 
      sum + p.averageResponseTime, 0
    ) / recentPerformance.length;

    // Decision logic for difficulty adjustment
    if (averageAccuracy >= this.performanceThreshold.excellent && averageResponseTime < 15) {
      return this.increaseDifficulty(currentDifficulty);
    } else if (averageAccuracy <= this.performanceThreshold.poor || averageResponseTime > 45) {
      return this.decreaseDifficulty(currentDifficulty);
    }

    return currentDifficulty;
  }

  // Identify weak areas that need more practice
  identifyWeakAreas(performanceHistory: UserPerformanceData[]): string[] {
    const wordPerformance = new Map<string, number>();
    
    performanceHistory.forEach(p => {
      const accuracy = (p.correctAttempts / p.attempts) * 100;
      if (accuracy < this.performanceThreshold.average) {
        wordPerformance.set(p.wordId, accuracy);
      }
    });

    return Array.from(wordPerformance.entries())
      .sort(([, a], [, b]) => a - b) // Sort by lowest accuracy first
      .slice(0, 10) // Top 10 weak areas
      .map(([wordId]) => wordId);
  }

  // Recommend question types based on performance
  recommendQuestionTypes(
    performanceHistory: UserPerformanceData[],
    currentTypes: QuestionType[]
  ): QuestionType[] {
    const typePerformance = new Map<QuestionType, number>();
    
    // Initialize with current types
    currentTypes.forEach(type => typePerformance.set(type, 0));

    // This would need to be enhanced to track performance per question type
    // For now, return adaptive suggestions based on difficulty progression
    const recommendations: QuestionType[] = ['multiple-choice'];

    // Add more complex types as user progresses
    if (this.calculateOverallMastery(performanceHistory) > 60) {
      recommendations.push('contextual-completion', 'root-family');
    }

    if (this.calculateOverallMastery(performanceHistory) > 80) {
      recommendations.push('audio-recognition', 'synonym-antonym');
    }

    return recommendations;
  }

  // Calculate spaced repetition intervals
  calculateNextReviewDate(
    wordId: string,
    performanceData: UserPerformanceData,
    wasCorrect: boolean
  ): Date {
    const baseInterval = 1; // 1 day
    const masteryBonus = performanceData.masteryLevel / 100;
    
    let interval = baseInterval;

    if (wasCorrect) {
      // Successful recall - increase interval
      interval = Math.max(1, Math.floor(
        baseInterval * Math.pow(2, performanceData.correctAttempts) * (1 + masteryBonus)
      ));
    } else {
      // Failed recall - reset to minimum interval
      interval = 1;
    }

    // Cap maximum interval at 30 days
    interval = Math.min(interval, 30);

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    return nextReview;
  }

  // Generate personalized learning path
  generateLearningPath(
    availableWords: Word[],
    userState: AdaptiveLearningState,
    targetCount: number
  ): Word[] {
    const weightedWords = availableWords.map(word => {
      let weight = 1;

      // Boost weak areas
      if (userState.weakAreas.includes(word.id)) {
        weight *= 3;
      }

      // Reduce weight for strengths (but don't eliminate)
      if (userState.strengths.includes(word.id)) {
        weight *= 0.5;
      }

      // Difficulty matching
      if (word.level === userState.currentDifficulty) {
        weight *= 2;
      }

      // Spaced repetition consideration
      const performance = userState.performanceHistory.find(p => p.wordId === word.id);
      if (performance && this.isDueForReview(performance)) {
        weight *= 2.5;
      }

      return { word, weight };
    });

    // Sort by weight and return top words
    return weightedWords
      .sort((a, b) => b.weight - a.weight)
      .slice(0, targetCount)
      .map(({ word }) => word);
  }

  // Update user performance data
  updatePerformanceData(
    userId: string,
    wordId: string,
    wasCorrect: boolean,
    responseTime: number,
    difficulty: DifficultyLevel
  ): UserPerformanceData {
    // This would typically fetch existing data from database
    // For now, create or update performance record
    
    return {
      userId,
      wordId,
      attempts: 1, // Would increment existing
      correctAttempts: wasCorrect ? 1 : 0, // Would increment existing
      averageResponseTime: responseTime,
      lastAttemptDate: new Date(),
      difficultyLevel: difficulty,
      masteryLevel: this.calculateMasteryLevel(1, wasCorrect ? 1 : 0, responseTime)
    };
  }

  // Private helper methods
  private isRecentAttempt(date: Date): boolean {
    const daysSince = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7; // Within last week
  }

  private increaseDifficulty(current: DifficultyLevel): DifficultyLevel {
    const progression: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
    const currentIndex = progression.indexOf(current);
    return currentIndex < progression.length - 1 ? progression[currentIndex + 1] : current;
  }

  private decreaseDifficulty(current: DifficultyLevel): DifficultyLevel {
    const progression: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
    const currentIndex = progression.indexOf(current);
    return currentIndex > 0 ? progression[currentIndex - 1] : current;
  }

  private calculateOverallMastery(performanceHistory: UserPerformanceData[]): number {
    if (performanceHistory.length === 0) return 0;
    
    return performanceHistory.reduce((sum, p) => sum + p.masteryLevel, 0) / performanceHistory.length;
  }

  private calculateMasteryLevel(attempts: number, correct: number, avgTime: number): number {
    const accuracy = (correct / attempts) * 100;
    const speedBonus = Math.max(0, (30 - avgTime) / 30 * 20); // Up to 20 bonus points for speed
    return Math.min(100, Math.max(0, accuracy + speedBonus));
  }

  private isDueForReview(performance: UserPerformanceData): boolean {
    const daysSinceLastAttempt = (Date.now() - performance.lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24);
    const reviewInterval = Math.pow(2, performance.correctAttempts); // Exponential backoff
    return daysSinceLastAttempt >= reviewInterval;
  }
}

// Export singleton instance
export const adaptiveLearning = new AdaptiveLearningEngine();
