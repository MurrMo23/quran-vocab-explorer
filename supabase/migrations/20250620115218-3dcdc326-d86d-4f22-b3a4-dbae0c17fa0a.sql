
-- Create vocabulary_words table for comprehensive word management
CREATE TABLE public.vocabulary_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  arabic TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  meaning TEXT NOT NULL,
  translation TEXT,
  root TEXT,
  part_of_speech TEXT NOT NULL DEFAULT 'noun',
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  frequency INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  audio_url TEXT,
  pronunciation_guide TEXT,
  etymology TEXT,
  usage_notes TEXT,
  difficulty_score DECIMAL DEFAULT 0.5,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create word_examples table for managing examples
CREATE TABLE public.word_examples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_id UUID REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
  surah_number INTEGER,
  ayah_number INTEGER,
  arabic_text TEXT NOT NULL,
  translation TEXT NOT NULL,
  context TEXT,
  is_quranic BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create word_collections table for collection management
CREATE TABLE public.word_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_system BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create junction table for word-collection relationships
CREATE TABLE public.word_collection_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_id UUID REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.word_collections(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(word_id, collection_id)
);

-- Create content_pages table for SEO and dynamic content
CREATE TABLE public.content_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  is_published BOOLEAN DEFAULT true,
  page_type TEXT DEFAULT 'static',
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create search_analytics table for tracking searches
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  search_query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  clicked_result_id TEXT,
  search_type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vocabulary_words
CREATE POLICY "Anyone can view published vocabulary words" 
  ON public.vocabulary_words FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage all vocabulary words" 
  ON public.vocabulary_words FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create RLS policies for word_examples
CREATE POLICY "Anyone can view word examples" 
  ON public.word_examples FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage word examples" 
  ON public.word_examples FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create RLS policies for word_collections
CREATE POLICY "Anyone can view published collections" 
  ON public.word_collections FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage collections" 
  ON public.word_collections FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create RLS policies for word_collection_items
CREATE POLICY "Anyone can view collection items" 
  ON public.word_collection_items FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage collection items" 
  ON public.word_collection_items FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create RLS policies for content_pages
CREATE POLICY "Anyone can view published content pages" 
  ON public.content_pages FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage content pages" 
  ON public.content_pages FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create RLS policies for search_analytics
CREATE POLICY "Users can view their own search analytics" 
  ON public.search_analytics FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert search analytics" 
  ON public.search_analytics FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view all search analytics" 
  ON public.search_analytics FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create indexes for performance
CREATE INDEX idx_vocabulary_words_level ON public.vocabulary_words(level);
CREATE INDEX idx_vocabulary_words_published ON public.vocabulary_words(is_published);
CREATE INDEX idx_vocabulary_words_search ON public.vocabulary_words USING gin(to_tsvector('english', arabic || ' ' || transliteration || ' ' || meaning));
CREATE INDEX idx_word_collections_slug ON public.word_collections(slug);
CREATE INDEX idx_word_collections_published ON public.word_collections(is_published);
CREATE INDEX idx_content_pages_slug ON public.content_pages(slug);
CREATE INDEX idx_search_analytics_query ON public.search_analytics(search_query);

-- Insert default collections from the existing data
INSERT INTO public.word_collections (name, slug, description, is_system, sort_order) VALUES
('Faith & Belief', 'faith', 'Core concepts of Islamic faith and belief', true, 1),
('Prophets & Messengers', 'prophets', 'Words related to prophets and messengers in Islam', true, 2),
('Ethics & Morality', 'ethics', 'Moral and ethical concepts in Islamic teachings', true, 3),
('Afterlife & Judgment', 'afterlife', 'Concepts related to the afterlife and divine judgment', true, 4),
('Worship & Prayer', 'worship', 'Terms related to Islamic worship and prayer', true, 5),
('Community & Society', 'community', 'Social and community aspects of Islamic life', true, 6),
('Knowledge & Learning', 'knowledge', 'Terms related to knowledge, learning, and wisdom', true, 7),
('Nature & Creation', 'nature', 'Words describing nature and divine creation', true, 8);

-- Insert essential content pages
INSERT INTO public.content_pages (slug, title, content, seo_title, seo_description, page_type) VALUES
('privacy-policy', 'Privacy Policy', 'Your privacy is important to us. This privacy policy explains how we collect, use, and protect your information when you use our Arabic Vocabulary Learning platform.', 'Privacy Policy - Arabic Vocabulary', 'Learn about how we protect your privacy and handle your data on our Arabic vocabulary learning platform.', 'legal'),
('terms-of-service', 'Terms of Service', 'By using our Arabic Vocabulary Learning platform, you agree to these terms of service. Please read them carefully.', 'Terms of Service - Arabic Vocabulary', 'Terms and conditions for using our Arabic vocabulary learning platform and services.', 'legal'),
('about', 'About Us', 'Arabic Vocabulary is a comprehensive platform for learning Quranic and Classical Arabic vocabulary. Our mission is to make Arabic learning accessible and effective for everyone.', 'About Us - Arabic Vocabulary Learning Platform', 'Learn about our mission to make Arabic vocabulary learning accessible and effective through our comprehensive platform.', 'static'),
('contact', 'Contact Us', 'Get in touch with our team. We are here to help you with your Arabic learning journey.', 'Contact Us - Arabic Vocabulary', 'Contact our team for support with Arabic vocabulary learning and platform questions.', 'static'),
('help', 'Help & Support', 'Find answers to common questions and get help with using our Arabic vocabulary learning platform.', 'Help & Support - Arabic Vocabulary', 'Get help and find answers to common questions about our Arabic vocabulary learning platform.', 'static');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_vocabulary_words_updated_at BEFORE UPDATE ON public.vocabulary_words FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_word_collections_updated_at BEFORE UPDATE ON public.word_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_pages_updated_at BEFORE UPDATE ON public.content_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
