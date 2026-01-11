import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Initialize safe client - if config is missing, create a dummy client to prevent crash
// The app will check isSupabaseConfigured and show an error screen instead
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder');

export type DisabilityType = 'visually_impaired' | 'hearing_impaired' | 'adhd' | 'motor_disabilities';
export type Severity = 'mild' | 'moderate' | 'severe';
export type FeedbackType = 'confusion' | 'question' | 'engagement';
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed';

export interface Student {
  id: string;
  roll_number: string;
  name: string;
  email?: string;
  created_at: string;
  last_login?: string;
}

export interface DisabilityProfile {
  id: string;
  student_id: string;
  disability_type: DisabilityType;
  severity: Severity;
  created_at: string;
  updated_at: string;
}

export interface AccessibilitySettings {
  id: string;
  student_id: string;
  semantic_reader_enabled: boolean;
  ai_image_descriptions_enabled: boolean;
  braille_input_enabled: boolean;
  live_captions_enabled: boolean;
  emotion_tags_enabled: boolean;
  focus_tunnel_enabled: boolean;
  bionic_reading_enabled: boolean;
  ai_summaries_enabled: boolean;
  voice_navigation_enabled: boolean;
  big_click_zones_enabled: boolean;
  font_size: number;
  contrast_mode: string;
  updated_at: string;
}

export interface LearningHealthRecord {
  id: string;
  student_id: string;
  subject: string;
  topic: string;
  comprehension_score: number;
  confusion_level: number;
  engagement_score: number;
  recorded_at: string;
}

export interface ClassroomFeedback {
  id: string;
  student_id: string;
  session_id: string;
  feedback_type: FeedbackType;
  content: string;
  ai_analysis?: Record<string, unknown>;
  created_at: string;
}

export interface RemedialAssignment {
  id: string;
  student_id: string;
  title: string;
  description: string;
  difficulty_level: string;
  topic: string;
  ai_generated: boolean;
  status: AssignmentStatus;
  created_at: string;
  completed_at?: string;
  score?: number;
}

export interface Lecture {
  id: string;
  created_at: string;
  title: string;
  content: any; // Using any for the JSONB content structure
  stats: any;   // Using any for the JSONB stats structure
}

