
// Enhanced Quiz Types for Advanced Functionality

export type QuestionType = 
  | 'multiple-choice'
  | 'fill-in-blank'
  | 'arabic-to-meaning'
  | 'meaning-to-arabic'
  | 'audio-recognition'
  | 'contextual-completion'
  | 'root-family'
  | 'synonym-antonym'
  | 'pronunciation-match';

export type QuizMode = 
  | 'practice'
  | 'timed'
  | 'survival'
  | 'tournament'
  | 'challenge'
  | 'adaptive';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'mixed' | 'adaptive';

export interface QuizSession {
  id: string;
  user_id: string;
  quiz_type: string;
  mode: QuizMode;
  collection_id?: string;
  difficulty: DifficultyLevel;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  accuracy_percentage: number;
  total_time_seconds: number;
  average_time_per_question?: number;
  question_types: QuestionType[];
  adaptive_difficulty_used: boolean;
  spaced_repetition_words: string[];
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface UserAchievement {
  id?: string;
  user_id: string;
  achievement_id: string;
  achievement_type: 'badge' | 'trophy' | 'milestone';
  category: 'completion' | 'streak' | 'social' | 'performance';
  collection_id?: string;
  progress_value: number;
  target_value: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  created_at?: string;
}

export interface QuizStatistics {
  id: string;
  user_id: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  total_quizzes: number;
  total_questions: number;
  total_correct: number;
  accuracy_percentage: number;
  total_time_seconds: number;
  average_quiz_score: number;
  streak_count: number;
  collections_practiced: string[];
  question_types_used: QuestionType[];
  difficulty_breakdown: Record<string, number>;
  learning_velocity: number;
  created_at: string;
  updated_at: string;
}

export interface AudioQuestion {
  id: string;
  word_id: string;
  question_text: string;
  audio_url?: string;
  expected_pronunciation?: string;
  pronunciation_variants: string[];
  difficulty_level: DifficultyLevel;
  created_at: string;
}

export interface QuizChallenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenge_type: 'standard' | 'speed' | 'survival';
  quiz_settings: Record<string, any>;
  challenger_score?: number;
  challenged_score?: number;
  challenger_completed_at?: string;
  challenged_completed_at?: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserLearningPreferences {
  id: string;
  user_id: string;
  preferred_question_types: QuestionType[];
  difficulty_preference: DifficultyLevel;
  time_limit_preference: number;
  daily_goal: number;
  adaptive_learning_enabled: boolean;
  spaced_repetition_enabled: boolean;
  audio_enabled: boolean;
  pronunciation_practice_enabled: boolean;
  weak_areas_focus_enabled: boolean;
  notification_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EnhancedQuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  word: any; // Using existing Word type
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: DifficultyLevel;
  timeLimit?: number;
  audioUrl?: string;
  contextualHint?: string;
  rootFamily?: string[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface QuizConfiguration {
  mode: QuizMode;
  questionTypes: QuestionType[];
  difficulty: DifficultyLevel;
  questionCount: number;
  timeLimit?: number;
  adaptiveLearning: boolean;
  spacedRepetition: boolean;
  collectionId?: string;
  focusOnWeakAreas: boolean;
}

export interface QuizResult {
  sessionId?: string;
  score: number;
  accuracy: number;
  totalTime: number;
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTimePerQuestion: number;
  difficultyBreakdown: Record<string, { correct: number; total: number }>;
  difficultyProgression?: Record<string, number>;
  weakAreas: string[];
  achievements: UserAchievement[];
  nextRecommendations: QuestionType[];
}

export interface LeaderboardEntry {
  user_id: string;
  username?: string;
  score: number;
  accuracy_percentage: number;
  total_quizzes: number;
  rank_position: number;
  avatar_url?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'badge' | 'trophy' | 'milestone';
  category: 'completion' | 'streak' | 'social' | 'performance';
  icon: string;
  target_value: number;
  reward_points: number;
}
