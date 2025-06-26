import { UserAchievement } from './quiz-types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'badge' | 'trophy' | 'milestone';
  category: 'completion' | 'streak' | 'social' | 'performance';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: AchievementRequirement[];
  rewards?: AchievementReward[];
}

export interface AchievementRequirement {
  type: 'quiz_completion' | 'accuracy' | 'streak' | 'time_limit' | 'collection_complete' | 'social_challenge';
  value: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  additionalData?: any;
}

export interface AchievementReward {
  type: 'points' | 'badge' | 'title' | 'unlock';
  value: string | number;
}

export interface UserProgress {
  userId: string;
  totalQuizzes: number;
  totalCorrectAnswers: number;
  currentStreak: number;
  bestStreak: number;
  averageAccuracy: number;
  totalStudyTime: number;
  collectionsCompleted: string[];
  challengesWon: number;
  socialInteractions: number;
}

export class AchievementSystem {
  private achievements: Achievement[] = [
    // Completion Achievements
    {
      id: 'first_quiz',
      name: 'First Steps',
      description: 'Complete your first quiz',
      icon: '🎯',
      type: 'badge',
      category: 'completion',
      rarity: 'common',
      requirements: [
        { type: 'quiz_completion', value: 1 }
      ],
      rewards: [
        { type: 'points', value: 50 }
      ]
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Complete 100 quizzes',
      icon: '🏆',
      type: 'trophy',
      category: 'completion',
      rarity: 'rare',
      requirements: [
        { type: 'quiz_completion', value: 100 }
      ],
      rewards: [
        { type: 'points', value: 1000 },
        { type: 'title', value: 'Quiz Master' }
      ]
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Achieve 100% accuracy in a quiz with at least 10 questions',
      icon: '⭐',
      type: 'badge',
      category: 'performance',
      rarity: 'epic',
      requirements: [
        { type: 'accuracy', value: 100 },
        { type: 'quiz_completion', value: 1, additionalData: { minQuestions: 10 } }
      ],
      rewards: [
        { type: 'points', value: 500 }
      ]
    },

    // Streak Achievements
    {
      id: 'on_fire',
      name: 'On Fire!',
      description: 'Maintain a 7-day study streak',
      icon: '🔥',
      type: 'badge',
      category: 'streak',
      rarity: 'common',
      requirements: [
        { type: 'streak', value: 7, timeframe: 'daily' }
      ],
      rewards: [
        { type: 'points', value: 200 }
      ]
    },
    {
      id: 'unstoppable',
      name: 'Unstoppable',
      description: 'Maintain a 30-day study streak',
      icon: '⚡',
      type: 'trophy',
      category: 'streak',
      rarity: 'epic',
      requirements: [
        { type: 'streak', value: 30, timeframe: 'daily' }
      ],
      rewards: [
        { type: 'points', value: 1500 },
        { type: 'title', value: 'Unstoppable Learner' }
      ]
    },

    // Performance Achievements
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a quiz in under 5 seconds per question',
      icon: '💨',
      type: 'badge',
      category: 'performance',
      rarity: 'rare',
      requirements: [
        { type: 'time_limit', value: 5 }
      ],
      rewards: [
        { type: 'points', value: 300 }
      ]
    },
    {
      id: 'accuracy_ace',
      name: 'Accuracy Ace',
      description: 'Maintain 90%+ accuracy over 50 quizzes',
      icon: '🎯',
      type: 'trophy',
      category: 'performance',
      rarity: 'epic',
      requirements: [
        { type: 'accuracy', value: 90 },
        { type: 'quiz_completion', value: 50 }
      ],
      rewards: [
        { type: 'points', value: 2000 },
        { type: 'title', value: 'Accuracy Ace' }
      ]
    },

    // Collection Achievements
    {
      id: 'collection_explorer',
      name: 'Collection Explorer',
      description: 'Complete quizzes from 5 different collections',
      icon: '📚',
      type: 'badge',
      category: 'completion',
      rarity: 'common',
      requirements: [
        { type: 'collection_complete', value: 5 }
      ],
      rewards: [
        { type: 'points', value: 400 }
      ]
    },
    {
      id: 'vocabulary_scholar',
      name: 'Vocabulary Scholar',
      description: 'Master all words in any collection',
      icon: '🎓',
      type: 'trophy',
      category: 'completion',
      rarity: 'legendary',
      requirements: [
        { type: 'collection_complete', value: 1, additionalData: { mastery: 100 } }
      ],
      rewards: [
        { type: 'points', value: 5000 },
        { type: 'title', value: 'Vocabulary Scholar' }
      ]
    },

    // Social Achievements
    {
      id: 'challenger',
      name: 'Challenger',
      description: 'Win your first friend challenge',
      icon: '⚔️',
      type: 'badge',
      category: 'social',
      rarity: 'common',
      requirements: [
        { type: 'social_challenge', value: 1 }
      ],
      rewards: [
        { type: 'points', value: 250 }
      ]
    },
    {
      id: 'champion',
      name: 'Champion',
      description: 'Win 25 friend challenges',
      icon: '👑',
      type: 'trophy',
      category: 'social',
      rarity: 'epic',
      requirements: [
        { type: 'social_challenge', value: 25 }
      ],
      rewards: [
        { type: 'points', value: 2500 },
        { type: 'title', value: 'Challenge Champion' }
      ]
    }
  ];

  // Check if user has earned any new achievements
  checkAchievements(userProgress: UserProgress, currentAchievements: UserAchievement[]): UserAchievement[] {
    const newAchievements: UserAchievement[] = [];
    const earnedIds = new Set(currentAchievements.map(a => a.achievement_id));

    for (const achievement of this.achievements) {
      if (earnedIds.has(achievement.id)) continue;

      if (this.meetsRequirements(achievement, userProgress)) {
        newAchievements.push({
          user_id: userProgress.userId,
          achievement_id: achievement.id,
          achievement_type: achievement.type,
          category: achievement.category,
          collection_id: null,
          progress_value: this.calculateProgress(achievement, userProgress),
          target_value: this.getTargetValue(achievement),
          is_unlocked: true,
          unlocked_at: new Date().toISOString()
        });
      }
    }

    return newAchievements;
  }

  // Update achievement progress for partially completed achievements
  updateAchievementProgress(
    userProgress: UserProgress,
    currentAchievements: UserAchievement[]
  ): UserAchievement[] {
    const updatedAchievements: UserAchievement[] = [];

    for (const userAchievement of currentAchievements) {
      if (userAchievement.is_unlocked) continue;

      const achievement = this.achievements.find(a => a.id === userAchievement.achievement_id);
      if (!achievement) continue;

      const newProgress = this.calculateProgress(achievement, userProgress);
      const targetValue = this.getTargetValue(achievement);

      if (newProgress !== userAchievement.progress_value) {
        updatedAchievements.push({
          ...userAchievement,
          progress_value: newProgress,
          is_unlocked: newProgress >= targetValue,
          unlocked_at: newProgress >= targetValue ? new Date().toISOString() : null
        });
      }
    }

    return updatedAchievements;
  }

  // Get all available achievements with user progress
  getAllAchievementsWithProgress(
    userProgress: UserProgress,
    currentAchievements: UserAchievement[]
  ): Array<Achievement & { userProgress?: UserAchievement }> {
    const achievementMap = new Map(currentAchievements.map(a => [a.achievement_id, a]));

    return this.achievements.map(achievement => ({
      ...achievement,
      userProgress: achievementMap.get(achievement.id)
    }));
  }

  // Private helper methods
  private meetsRequirements(achievement: Achievement, userProgress: UserProgress): boolean {
    return achievement.requirements.every(req => this.meetsRequirement(req, userProgress));
  }

  private meetsRequirement(requirement: AchievementRequirement, userProgress: UserProgress): boolean {
    switch (requirement.type) {
      case 'quiz_completion':
        if (requirement.additionalData?.minQuestions) {
          // This would need additional data about quiz question counts
          return userProgress.totalQuizzes >= requirement.value;
        }
        return userProgress.totalQuizzes >= requirement.value;

      case 'accuracy':
        return userProgress.averageAccuracy >= requirement.value;

      case 'streak':
        return requirement.timeframe === 'daily' 
          ? userProgress.currentStreak >= requirement.value
          : userProgress.bestStreak >= requirement.value;

      case 'time_limit':
        // This would need additional data about average response times
        return true; // Placeholder

      case 'collection_complete':
        return userProgress.collectionsCompleted.length >= requirement.value;

      case 'social_challenge':
        return userProgress.challengesWon >= requirement.value;

      default:
        return false;
    }
  }

  private calculateProgress(achievement: Achievement, userProgress: UserProgress): number {
    const primaryReq = achievement.requirements[0];
    
    switch (primaryReq.type) {
      case 'quiz_completion':
        return Math.min(userProgress.totalQuizzes, primaryReq.value);
      case 'accuracy':
        return Math.min(userProgress.averageAccuracy, primaryReq.value);
      case 'streak':
        return Math.min(userProgress.currentStreak, primaryReq.value);
      case 'collection_complete':
        return Math.min(userProgress.collectionsCompleted.length, primaryReq.value);
      case 'social_challenge':
        return Math.min(userProgress.challengesWon, primaryReq.value);
      default:
        return 0;
    }
  }

  private getTargetValue(achievement: Achievement): number {
    return achievement.requirements[0].value;
  }

  // Get achievement by ID
  getAchievementById(id: string): Achievement | undefined {
    return this.achievements.find(a => a.id === id);
  }

  // Get achievements by category
  getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  // Calculate total points earned
  calculateTotalPoints(achievements: UserAchievement[]): number {
    return achievements.reduce((total, userAchv) => {
      if (!userAchv.is_unlocked) return total;
      
      const achievement = this.getAchievementById(userAchv.achievement_id);
      if (!achievement?.rewards) return total;

      const pointReward = achievement.rewards.find(r => r.type === 'points');
      return total + (pointReward ? Number(pointReward.value) : 0);
    }, 0);
  }
}

// Export singleton instance
export const achievementSystem = new AchievementSystem();
