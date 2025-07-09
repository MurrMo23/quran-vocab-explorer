export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_configs: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          location: string
          name: string
          publisher_id: string | null
          size: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id: string
          is_active?: boolean
          location: string
          name: string
          publisher_id?: string | null
          size: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string
          name?: string
          publisher_id?: string | null
          size?: string
          updated_at?: string
        }
        Relationships: []
      }
      audio_questions: {
        Row: {
          audio_url: string | null
          created_at: string
          difficulty_level: string
          expected_pronunciation: string | null
          id: string
          pronunciation_variants: string[] | null
          question_text: string
          word_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          difficulty_level?: string
          expected_pronunciation?: string | null
          id?: string
          pronunciation_variants?: string[] | null
          question_text: string
          word_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          difficulty_level?: string
          expected_pronunciation?: string | null
          id?: string
          pronunciation_variants?: string[] | null
          question_text?: string
          word_id?: string
        }
        Relationships: []
      }
      audio_recordings: {
        Row: {
          accuracy_score: number | null
          created_at: string | null
          feedback: string | null
          id: string
          recording_url: string
          user_id: string
          word_id: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          recording_url: string
          user_id: string
          word_id: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          recording_url?: string
          user_id?: string
          word_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          category_id: string
          post_id: string
        }
        Insert: {
          category_id: string
          post_id: string
        }
        Update: {
          category_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_sentences: {
        Row: {
          context: string | null
          created_at: string | null
          difficulty_level: string | null
          id: string
          is_approved: boolean | null
          sentence_arabic: string
          sentence_translation: string
          updated_at: string | null
          user_id: string
          votes: number | null
          word_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          is_approved?: boolean | null
          sentence_arabic: string
          sentence_translation: string
          updated_at?: string | null
          user_id: string
          votes?: number | null
          word_id: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          is_approved?: boolean | null
          sentence_arabic?: string
          sentence_translation?: string
          updated_at?: string | null
          user_id?: string
          votes?: number | null
          word_id?: string
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          page_type: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          page_type?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          page_type?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          created_at: string | null
          description: string
          goal_value: number
          id: string
          reward_points: number | null
          target_collection: string | null
          target_words: string[] | null
        }
        Insert: {
          challenge_date: string
          challenge_type: string
          created_at?: string | null
          description: string
          goal_value: number
          id?: string
          reward_points?: number | null
          target_collection?: string | null
          target_words?: string[] | null
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          created_at?: string | null
          description?: string
          goal_value?: number
          id?: string
          reward_points?: number | null
          target_collection?: string | null
          target_words?: string[] | null
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          last_activity: string | null
          reply_count: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          last_activity?: string | null
          reply_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          last_activity?: string | null
          reply_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_solution: boolean | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_solution?: boolean | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_solution?: boolean | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_entries: {
        Row: {
          category: string
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          rank_position: number | null
          score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          rank_position?: number | null
          score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          rank_position?: number | null
          score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_periods: {
        Row: {
          category: string
          category_filter: string | null
          created_at: string
          id: string
          period_end: string
          period_start: string
          period_type: string
        }
        Insert: {
          category?: string
          category_filter?: string | null
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          period_type: string
        }
        Update: {
          category?: string
          category_filter?: string | null
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_public: boolean | null
          name: string
          surahs: number[] | null
          themes: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          surahs?: number[] | null
          themes?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          surahs?: number[] | null
          themes?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          created_at: string | null
          id: string
          last_reviewed: string | null
          next_review: string | null
          path_id: string
          proficiency: number | null
          reviews_count: number | null
          user_id: string
          word_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_reviewed?: string | null
          next_review?: string | null
          path_id: string
          proficiency?: number | null
          reviews_count?: number | null
          user_id: string
          word_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_reviewed?: string | null
          next_review?: string | null
          path_id?: string
          proficiency?: number | null
          reviews_count?: number | null
          user_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: number
          created_at: string | null
          explanation: string | null
          id: string
          options: Json
          question_text: string
          quiz_id: string
        }
        Insert: {
          correct_answer: number
          created_at?: string | null
          explanation?: string | null
          id?: string
          options: Json
          question_text: string
          quiz_id: string
        }
        Update: {
          correct_answer?: number
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json
          question_text?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          adaptive_adjustments: Json | null
          answers: Json | null
          completed_at: string | null
          difficulty_progression: Json | null
          id: string
          max_score: number
          question_breakdown: Json | null
          quiz_id: string
          score: number
          session_id: string | null
          started_at: string | null
          time_per_question: number[] | null
          user_id: string
        }
        Insert: {
          adaptive_adjustments?: Json | null
          answers?: Json | null
          completed_at?: string | null
          difficulty_progression?: Json | null
          id?: string
          max_score: number
          question_breakdown?: Json | null
          quiz_id: string
          score: number
          session_id?: string | null
          started_at?: string | null
          time_per_question?: number[] | null
          user_id: string
        }
        Update: {
          adaptive_adjustments?: Json | null
          answers?: Json | null
          completed_at?: string | null
          difficulty_progression?: Json | null
          id?: string
          max_score?: number
          question_breakdown?: Json | null
          quiz_id?: string
          score?: number
          session_id?: string | null
          started_at?: string | null
          time_per_question?: number[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_challenges: {
        Row: {
          challenge_type: string
          challenged_completed_at: string | null
          challenged_id: string
          challenged_score: number | null
          challenger_completed_at: string | null
          challenger_id: string
          challenger_score: number | null
          created_at: string
          expires_at: string
          id: string
          quiz_settings: Json
          status: string
          updated_at: string
        }
        Insert: {
          challenge_type?: string
          challenged_completed_at?: string | null
          challenged_id: string
          challenged_score?: number | null
          challenger_completed_at?: string | null
          challenger_id: string
          challenger_score?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          quiz_settings?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          challenge_type?: string
          challenged_completed_at?: string | null
          challenged_id?: string
          challenged_score?: number | null
          challenger_completed_at?: string | null
          challenger_id?: string
          challenger_score?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          quiz_settings?: Json
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          accuracy_percentage: number
          adaptive_difficulty_used: boolean | null
          average_time_per_question: number | null
          collection_id: string | null
          completed_at: string | null
          correct_answers: number
          created_at: string
          difficulty: string
          id: string
          incorrect_answers: number
          mode: string
          question_types: string[] | null
          quiz_type: string
          spaced_repetition_words: string[] | null
          started_at: string
          total_questions: number
          total_time_seconds: number
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number
          adaptive_difficulty_used?: boolean | null
          average_time_per_question?: number | null
          collection_id?: string | null
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          difficulty?: string
          id?: string
          incorrect_answers?: number
          mode?: string
          question_types?: string[] | null
          quiz_type?: string
          spaced_repetition_words?: string[] | null
          started_at?: string
          total_questions?: number
          total_time_seconds?: number
          user_id: string
        }
        Update: {
          accuracy_percentage?: number
          adaptive_difficulty_used?: boolean | null
          average_time_per_question?: number | null
          collection_id?: string | null
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          difficulty?: string
          id?: string
          incorrect_answers?: number
          mode?: string
          question_types?: string[] | null
          quiz_type?: string
          spaced_repetition_words?: string[] | null
          started_at?: string
          total_questions?: number
          total_time_seconds?: number
          user_id?: string
        }
        Relationships: []
      }
      quiz_statistics: {
        Row: {
          accuracy_percentage: number | null
          average_quiz_score: number | null
          collections_practiced: string[] | null
          created_at: string
          difficulty_breakdown: Json | null
          id: string
          learning_velocity: number | null
          period_end: string
          period_start: string
          period_type: string
          question_types_used: string[] | null
          streak_count: number | null
          total_correct: number | null
          total_questions: number | null
          total_quizzes: number | null
          total_time_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          average_quiz_score?: number | null
          collections_practiced?: string[] | null
          created_at?: string
          difficulty_breakdown?: Json | null
          id?: string
          learning_velocity?: number | null
          period_end: string
          period_start: string
          period_type: string
          question_types_used?: string[] | null
          streak_count?: number | null
          total_correct?: number | null
          total_questions?: number | null
          total_quizzes?: number | null
          total_time_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          average_quiz_score?: number | null
          collections_practiced?: string[] | null
          created_at?: string
          difficulty_breakdown?: Json | null
          id?: string
          learning_velocity?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          question_types_used?: string[] | null
          streak_count?: number | null
          total_correct?: number | null
          total_questions?: number | null
          total_quizzes?: number | null
          total_time_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          category: string
          created_at: string | null
          created_by: string
          description: string | null
          difficulty: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by: string
          description?: string | null
          difficulty: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          difficulty?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          clicked_result_id: string | null
          created_at: string | null
          id: string
          results_count: number | null
          search_query: string
          search_type: string | null
          user_id: string | null
        }
        Insert: {
          clicked_result_id?: string | null
          created_at?: string | null
          id?: string
          results_count?: number | null
          search_query: string
          search_type?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_result_id?: string | null
          created_at?: string | null
          id?: string
          results_count?: number | null
          search_query?: string
          search_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          file_url: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          created_at: string | null
          created_by: string
          current_members: number | null
          description: string | null
          focus_collections: string[] | null
          id: string
          is_public: boolean | null
          max_members: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_members?: number | null
          description?: string | null
          focus_collections?: string[] | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_members?: number | null
          description?: string | null
          focus_collections?: string[] | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          achievement_type: string
          category: string
          collection_id: string | null
          created_at: string
          id: string
          is_unlocked: boolean | null
          progress_value: number | null
          target_value: number | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          achievement_type: string
          category: string
          collection_id?: string | null
          created_at?: string
          id?: string
          is_unlocked?: boolean | null
          progress_value?: number | null
          target_value?: number | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          achievement_type?: string
          category?: string
          collection_id?: string | null
          created_at?: string
          id?: string
          is_unlocked?: boolean | null
          progress_value?: number | null
          target_value?: number | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_attempts: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          is_completed: boolean | null
          score: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          score: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_attempts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_preferences: {
        Row: {
          adaptive_learning_enabled: boolean | null
          audio_enabled: boolean | null
          created_at: string
          daily_goal: number | null
          difficulty_preference: string | null
          id: string
          notification_preferences: Json | null
          preferred_question_types: string[] | null
          pronunciation_practice_enabled: boolean | null
          spaced_repetition_enabled: boolean | null
          time_limit_preference: number | null
          updated_at: string
          user_id: string
          weak_areas_focus_enabled: boolean | null
        }
        Insert: {
          adaptive_learning_enabled?: boolean | null
          audio_enabled?: boolean | null
          created_at?: string
          daily_goal?: number | null
          difficulty_preference?: string | null
          id?: string
          notification_preferences?: Json | null
          preferred_question_types?: string[] | null
          pronunciation_practice_enabled?: boolean | null
          spaced_repetition_enabled?: boolean | null
          time_limit_preference?: number | null
          updated_at?: string
          user_id: string
          weak_areas_focus_enabled?: boolean | null
        }
        Update: {
          adaptive_learning_enabled?: boolean | null
          audio_enabled?: boolean | null
          created_at?: string
          daily_goal?: number | null
          difficulty_preference?: string | null
          id?: string
          notification_preferences?: Json | null
          preferred_question_types?: string[] | null
          pronunciation_practice_enabled?: boolean | null
          spaced_repetition_enabled?: boolean | null
          time_limit_preference?: number | null
          updated_at?: string
          user_id?: string
          weak_areas_focus_enabled?: boolean | null
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_public: boolean | null
          note_type: string | null
          updated_at: string | null
          user_id: string
          word_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          note_type?: string | null
          updated_at?: string | null
          user_id: string
          word_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          note_type?: string | null
          updated_at?: string | null
          user_id?: string
          word_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          preferred_language: string | null
          preferred_theme: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          preferred_language?: string | null
          preferred_theme?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          preferred_language?: string | null
          preferred_theme?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_word_progress: {
        Row: {
          collection_id: string
          contextual_mastery: number | null
          created_at: string | null
          difficulty_modifier: number | null
          id: string
          last_reviewed: string | null
          level: number | null
          next_review: string | null
          pronunciation_mastery: number | null
          review_count: number | null
          success_streak: number | null
          updated_at: string | null
          user_id: string
          word_id: string
        }
        Insert: {
          collection_id: string
          contextual_mastery?: number | null
          created_at?: string | null
          difficulty_modifier?: number | null
          id?: string
          last_reviewed?: string | null
          level?: number | null
          next_review?: string | null
          pronunciation_mastery?: number | null
          review_count?: number | null
          success_streak?: number | null
          updated_at?: string | null
          user_id: string
          word_id: string
        }
        Update: {
          collection_id?: string
          contextual_mastery?: number | null
          created_at?: string | null
          difficulty_modifier?: number | null
          id?: string
          last_reviewed?: string | null
          level?: number | null
          next_review?: string | null
          pronunciation_mastery?: number | null
          review_count?: number | null
          success_streak?: number | null
          updated_at?: string | null
          user_id?: string
          word_id?: string
        }
        Relationships: []
      }
      vocabulary_words: {
        Row: {
          arabic: string
          audio_url: string | null
          created_at: string | null
          created_by: string | null
          difficulty_score: number | null
          etymology: string | null
          frequency: number | null
          id: string
          is_published: boolean | null
          level: string
          meaning: string
          part_of_speech: string
          pronunciation_guide: string | null
          root: string | null
          tags: string[] | null
          translation: string | null
          transliteration: string
          updated_at: string | null
          usage_notes: string | null
        }
        Insert: {
          arabic: string
          audio_url?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty_score?: number | null
          etymology?: string | null
          frequency?: number | null
          id?: string
          is_published?: boolean | null
          level?: string
          meaning: string
          part_of_speech?: string
          pronunciation_guide?: string | null
          root?: string | null
          tags?: string[] | null
          translation?: string | null
          transliteration: string
          updated_at?: string | null
          usage_notes?: string | null
        }
        Update: {
          arabic?: string
          audio_url?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty_score?: number | null
          etymology?: string | null
          frequency?: number | null
          id?: string
          is_published?: boolean | null
          level?: string
          meaning?: string
          part_of_speech?: string
          pronunciation_guide?: string | null
          root?: string | null
          tags?: string[] | null
          translation?: string | null
          transliteration?: string
          updated_at?: string | null
          usage_notes?: string | null
        }
        Relationships: []
      }
      word_collection_items: {
        Row: {
          collection_id: string | null
          created_at: string | null
          id: string
          sort_order: number | null
          word_id: string | null
        }
        Insert: {
          collection_id?: string | null
          created_at?: string | null
          id?: string
          sort_order?: number | null
          word_id?: string | null
        }
        Update: {
          collection_id?: string | null
          created_at?: string | null
          id?: string
          sort_order?: number | null
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "word_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "word_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_collection_items_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_words"
            referencedColumns: ["id"]
          },
        ]
      }
      word_collections: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_published: boolean | null
          is_system: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          is_system?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          is_system?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      word_examples: {
        Row: {
          arabic_text: string
          ayah_number: number | null
          context: string | null
          created_at: string | null
          id: string
          is_quranic: boolean | null
          surah_number: number | null
          translation: string
          word_id: string | null
        }
        Insert: {
          arabic_text: string
          ayah_number?: number | null
          context?: string | null
          created_at?: string | null
          id?: string
          is_quranic?: boolean | null
          surah_number?: number | null
          translation: string
          word_id?: string | null
        }
        Update: {
          arabic_text?: string
          ayah_number?: number | null
          context?: string | null
          created_at?: string | null
          id?: string
          is_quranic?: boolean | null
          surah_number?: number | null
          translation?: string
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "word_examples_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_words"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
