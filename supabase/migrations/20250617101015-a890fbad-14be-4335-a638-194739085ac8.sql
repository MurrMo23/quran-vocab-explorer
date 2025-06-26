
-- Phase 1: Database Schema Enhancements

-- Create quiz_sessions table for detailed quiz tracking
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL DEFAULT 'standard',
  mode TEXT NOT NULL DEFAULT 'practice', -- practice, timed, survival, tournament
  collection_id TEXT,
  difficulty TEXT NOT NULL DEFAULT 'mixed',
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  incorrect_answers INTEGER NOT NULL DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  average_time_per_question DECIMAL(8,2),
  question_types TEXT[] DEFAULT '{}',
  adaptive_difficulty_used BOOLEAN DEFAULT false,
  spaced_repetition_words TEXT[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table for badge/trophy system
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL, -- badge, trophy, milestone
  category TEXT NOT NULL, -- completion, streak, social, performance
  collection_id TEXT,
  progress_value INTEGER DEFAULT 0,
  target_value INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create quiz_statistics table for historical analytics
CREATE TABLE public.quiz_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL, -- daily, weekly, monthly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_quizzes INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  average_quiz_score DECIMAL(5,2) DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  collections_practiced TEXT[] DEFAULT '{}',
  question_types_used TEXT[] DEFAULT '{}',
  difficulty_breakdown JSONB DEFAULT '{}',
  learning_velocity DECIMAL(8,2) DEFAULT 0, -- questions per minute
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_type, period_start)
);

-- Create audio_questions table for pronunciation-based questions
CREATE TABLE public.audio_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  audio_url TEXT,
  expected_pronunciation TEXT,
  pronunciation_variants TEXT[] DEFAULT '{}',
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_challenges table for friend challenges
CREATE TABLE public.quiz_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenged_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL DEFAULT 'standard', -- standard, speed, survival
  quiz_settings JSONB NOT NULL DEFAULT '{}',
  challenger_score INTEGER,
  challenged_score INTEGER,
  challenger_completed_at TIMESTAMP WITH TIME ZONE,
  challenged_completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, completed, declined, expired
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard_periods table for different ranking periods
CREATE TABLE public.leaderboard_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_type TEXT NOT NULL, -- daily, weekly, monthly, all_time
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'overall', -- overall, collection_specific, difficulty_specific
  category_filter TEXT, -- collection_id or difficulty level
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(period_type, period_start, category, category_filter)
);

-- Create user_learning_preferences table for adaptive learning
CREATE TABLE public.user_learning_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_question_types TEXT[] DEFAULT '{"multiple-choice", "fill-in-blank"}',
  difficulty_preference TEXT DEFAULT 'adaptive',
  time_limit_preference INTEGER DEFAULT 30,
  daily_goal INTEGER DEFAULT 20,
  adaptive_learning_enabled BOOLEAN DEFAULT true,
  spaced_repetition_enabled BOOLEAN DEFAULT true,
  audio_enabled BOOLEAN DEFAULT true,
  pronunciation_practice_enabled BOOLEAN DEFAULT false,
  weak_areas_focus_enabled BOOLEAN DEFAULT true,
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enhance existing quiz_attempts table
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.quiz_sessions(id);
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS question_breakdown JSONB DEFAULT '{}';
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS time_per_question INTEGER[] DEFAULT '{}';
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS difficulty_progression JSONB DEFAULT '{}';
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS adaptive_adjustments JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed_at ON public.quiz_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_type ON public.user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_quiz_statistics_user_period ON public.quiz_statistics(user_id, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_quiz_challenges_challenger ON public.quiz_challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_quiz_challenges_challenged ON public.quiz_challenges(challenged_id);
CREATE INDEX IF NOT EXISTS idx_quiz_challenges_status ON public.quiz_challenges(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_periods_type_start ON public.leaderboard_periods(period_type, period_start);

-- Enable Row Level Security
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quiz_sessions
CREATE POLICY "Users can view their own quiz sessions" ON public.quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own quiz sessions" ON public.quiz_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quiz sessions" ON public.quiz_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own achievements" ON public.user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for quiz_statistics
CREATE POLICY "Users can view their own statistics" ON public.quiz_statistics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own statistics" ON public.quiz_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own statistics" ON public.quiz_statistics
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for audio_questions (public read access)
CREATE POLICY "Anyone can view audio questions" ON public.audio_questions
  FOR SELECT USING (true);

-- Create RLS policies for quiz_challenges
CREATE POLICY "Users can view challenges they're involved in" ON public.quiz_challenges
  FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);
CREATE POLICY "Users can create challenges" ON public.quiz_challenges
  FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update challenges they're involved in" ON public.quiz_challenges
  FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Create RLS policies for leaderboard_periods (public read access)
CREATE POLICY "Anyone can view leaderboard periods" ON public.leaderboard_periods
  FOR SELECT USING (true);

-- Create RLS policies for user_learning_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_learning_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own preferences" ON public.user_learning_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_learning_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically update quiz statistics
CREATE OR REPLACE FUNCTION public.update_quiz_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily statistics
  INSERT INTO public.quiz_statistics (
    user_id, period_type, period_start, period_end,
    total_quizzes, total_questions, total_correct, accuracy_percentage,
    total_time_seconds, collections_practiced, question_types_used
  )
  VALUES (
    NEW.user_id, 'daily', CURRENT_DATE, CURRENT_DATE,
    1, NEW.total_questions, NEW.correct_answers, NEW.accuracy_percentage,
    NEW.total_time_seconds, ARRAY[NEW.collection_id]::TEXT[], NEW.question_types
  )
  ON CONFLICT (user_id, period_type, period_start)
  DO UPDATE SET
    total_quizzes = quiz_statistics.total_quizzes + 1,
    total_questions = quiz_statistics.total_questions + NEW.total_questions,
    total_correct = quiz_statistics.total_correct + NEW.correct_answers,
    accuracy_percentage = ROUND(
      (quiz_statistics.total_correct + NEW.correct_answers)::DECIMAL / 
      (quiz_statistics.total_questions + NEW.total_questions) * 100, 2
    ),
    total_time_seconds = quiz_statistics.total_time_seconds + NEW.total_time_seconds,
    collections_practiced = ARRAY(
      SELECT DISTINCT unnest(quiz_statistics.collections_practiced || ARRAY[NEW.collection_id]::TEXT[])
    ),
    question_types_used = ARRAY(
      SELECT DISTINCT unnest(quiz_statistics.question_types_used || NEW.question_types)
    ),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update statistics when quiz session completes
CREATE TRIGGER update_quiz_statistics_trigger
  AFTER UPDATE OF completed_at ON public.quiz_sessions
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL)
  EXECUTE FUNCTION public.update_quiz_statistics();
