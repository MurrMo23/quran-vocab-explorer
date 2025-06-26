
-- Create user progress tracking table
CREATE TABLE public.user_word_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  level INTEGER DEFAULT 0 CHECK (level >= 0 AND level <= 7),
  next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,
  success_streak INTEGER DEFAULT 0,
  difficulty_modifier DECIMAL DEFAULT 1.0,
  pronunciation_mastery INTEGER DEFAULT 0 CHECK (pronunciation_mastery >= 0 AND pronunciation_mastery <= 100),
  contextual_mastery INTEGER DEFAULT 0 CHECK (contextual_mastery >= 0 AND contextual_mastery <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- Create user notes table
CREATE TABLE public.user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'mnemonic', 'personal_example', 'etymology')),
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community sentences table
CREATE TABLE public.community_sentences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id TEXT NOT NULL,
  sentence_arabic TEXT NOT NULL,
  sentence_translation TEXT NOT NULL,
  context TEXT,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  votes INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study groups table
CREATE TABLE public.study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  max_members INTEGER DEFAULT 50,
  current_members INTEGER DEFAULT 1,
  focus_collections TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study group members table
CREATE TABLE public.study_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create daily challenges table
CREATE TABLE public.daily_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_date DATE NOT NULL UNIQUE,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('vocabulary', 'pronunciation', 'speed', 'accuracy')),
  target_collection TEXT,
  target_words TEXT[],
  goal_value INTEGER NOT NULL,
  description TEXT NOT NULL,
  reward_points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user challenge attempts table
CREATE TABLE public.user_challenge_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, challenge_id)
);

-- Create leaderboard table
CREATE TABLE public.leaderboard_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('daily', 'weekly', 'monthly', 'all_time')),
  score INTEGER DEFAULT 0,
  rank_position INTEGER,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, period_start)
);

-- Create audio recordings table
CREATE TABLE public.audio_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id TEXT NOT NULL,
  recording_url TEXT NOT NULL,
  accuracy_score INTEGER CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'grammar', 'pronunciation', 'vocabulary', 'culture')),
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  reply_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum replies table
CREATE TABLE public.forum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_word_progress
CREATE POLICY "Users can view their own progress" ON public.user_word_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_word_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_word_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_notes
CREATE POLICY "Users can view their own notes" ON public.user_notes
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own notes" ON public.user_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.user_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON public.user_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for community_sentences
CREATE POLICY "Anyone can view approved sentences" ON public.community_sentences
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own sentences" ON public.community_sentences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sentences" ON public.community_sentences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for study_groups
CREATE POLICY "Anyone can view public groups" ON public.study_groups
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create groups" ON public.study_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON public.study_groups
  FOR UPDATE USING (auth.uid() = created_by);

-- Create RLS policies for study_group_members
CREATE POLICY "Members can view group membership" ON public.study_group_members
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.study_groups WHERE id = group_id AND (is_public = true OR created_by = auth.uid()))
  );

CREATE POLICY "Users can join groups" ON public.study_group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON public.study_group_members
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for daily_challenges
CREATE POLICY "Anyone can view challenges" ON public.daily_challenges
  FOR SELECT USING (true);

-- Create RLS policies for user_challenge_attempts
CREATE POLICY "Users can view their own attempts" ON public.user_challenge_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts" ON public.user_challenge_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for leaderboard_entries
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_entries
  FOR SELECT USING (true);

-- Create RLS policies for audio_recordings
CREATE POLICY "Users can view their own recordings" ON public.audio_recordings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings" ON public.audio_recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for forum_posts
CREATE POLICY "Anyone can view forum posts" ON public.forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for forum_replies
CREATE POLICY "Anyone can view replies" ON public.forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Users can create replies" ON public.forum_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" ON public.forum_replies
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_word_progress_user_id ON public.user_word_progress(user_id);
CREATE INDEX idx_user_word_progress_next_review ON public.user_word_progress(next_review);
CREATE INDEX idx_user_notes_user_id ON public.user_notes(user_id);
CREATE INDEX idx_user_notes_word_id ON public.user_notes(word_id);
CREATE INDEX idx_community_sentences_word_id ON public.community_sentences(word_id);
CREATE INDEX idx_community_sentences_approved ON public.community_sentences(is_approved);
CREATE INDEX idx_study_group_members_group_id ON public.study_group_members(group_id);
CREATE INDEX idx_user_challenge_attempts_user_id ON public.user_challenge_attempts(user_id);
CREATE INDEX idx_leaderboard_entries_category_period ON public.leaderboard_entries(category, period_start, period_end);
CREATE INDEX idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX idx_forum_replies_post_id ON public.forum_replies(post_id);

-- Enable realtime for tables that need real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_word_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_sentences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_replies;
