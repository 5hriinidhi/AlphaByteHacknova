/*
  # SaralClass Adaptive Learning Platform Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `roll_number` (text, unique) - Used for kiosk login
      - `name` (text)
      - `email` (text, optional)
      - `created_at` (timestamptz)
      - `last_login` (timestamptz)
    
    - `disability_profiles`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `disability_type` (text) - visually_impaired, hearing_impaired, adhd, motor_disabilities
      - `severity` (text) - mild, moderate, severe
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `accessibility_settings`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `semantic_reader_enabled` (boolean)
      - `ai_image_descriptions_enabled` (boolean)
      - `braille_input_enabled` (boolean)
      - `live_captions_enabled` (boolean)
      - `emotion_tags_enabled` (boolean)
      - `focus_tunnel_enabled` (boolean)
      - `bionic_reading_enabled` (boolean)
      - `ai_summaries_enabled` (boolean)
      - `voice_navigation_enabled` (boolean)
      - `big_click_zones_enabled` (boolean)
      - `font_size` (integer, default 16)
      - `contrast_mode` (text)
      - `updated_at` (timestamptz)
    
    - `learning_health_records`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `subject` (text)
      - `topic` (text)
      - `comprehension_score` (numeric) - 0-100
      - `confusion_level` (numeric) - 0-100
      - `engagement_score` (numeric) - 0-100
      - `recorded_at` (timestamptz)
    
    - `classroom_feedback`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `session_id` (text)
      - `feedback_type` (text) - confusion, question, engagement
      - `content` (text)
      - `ai_analysis` (jsonb) - AI-generated insights
      - `created_at` (timestamptz)
    
    - `remedial_assignments`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `difficulty_level` (text)
      - `topic` (text)
      - `ai_generated` (boolean, default true)
      - `status` (text) - pending, in_progress, completed
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `score` (numeric)

  2. Security
    - Enable RLS on all tables
    - Add policies for students to access their own data
*/

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_number text UNIQUE NOT NULL,
  name text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own data"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Students can update own data"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Disability profiles table
CREATE TABLE IF NOT EXISTS disability_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  disability_type text NOT NULL CHECK (disability_type IN ('visually_impaired', 'hearing_impaired', 'adhd', 'motor_disabilities')),
  severity text DEFAULT 'moderate' CHECK (severity IN ('mild', 'moderate', 'severe')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE disability_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own disability profiles"
  ON disability_profiles FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can update own disability profiles"
  ON disability_profiles FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Accessibility settings table
CREATE TABLE IF NOT EXISTS accessibility_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE UNIQUE NOT NULL,
  semantic_reader_enabled boolean DEFAULT false,
  ai_image_descriptions_enabled boolean DEFAULT false,
  braille_input_enabled boolean DEFAULT false,
  live_captions_enabled boolean DEFAULT false,
  emotion_tags_enabled boolean DEFAULT false,
  focus_tunnel_enabled boolean DEFAULT false,
  bionic_reading_enabled boolean DEFAULT false,
  ai_summaries_enabled boolean DEFAULT false,
  voice_navigation_enabled boolean DEFAULT false,
  big_click_zones_enabled boolean DEFAULT false,
  font_size integer DEFAULT 16,
  contrast_mode text DEFAULT 'normal',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE accessibility_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own accessibility settings"
  ON accessibility_settings FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can update own accessibility settings"
  ON accessibility_settings FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Learning health records table
CREATE TABLE IF NOT EXISTS learning_health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  comprehension_score numeric DEFAULT 0 CHECK (comprehension_score >= 0 AND comprehension_score <= 100),
  confusion_level numeric DEFAULT 0 CHECK (confusion_level >= 0 AND confusion_level <= 100),
  engagement_score numeric DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE learning_health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own learning records"
  ON learning_health_records FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Classroom feedback table
CREATE TABLE IF NOT EXISTS classroom_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  session_id text NOT NULL,
  feedback_type text NOT NULL CHECK (feedback_type IN ('confusion', 'question', 'engagement')),
  content text NOT NULL,
  ai_analysis jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classroom_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own feedback"
  ON classroom_feedback FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert own feedback"
  ON classroom_feedback FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Remedial assignments table
CREATE TABLE IF NOT EXISTS remedial_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  topic text NOT NULL,
  ai_generated boolean DEFAULT true,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  score numeric CHECK (score >= 0 AND score <= 100)
);

ALTER TABLE remedial_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own assignments"
  ON remedial_assignments FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can update own assignments"
  ON remedial_assignments FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_disability_profiles_student_id ON disability_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_health_records_student_id ON learning_health_records(student_id);
CREATE INDEX IF NOT EXISTS idx_classroom_feedback_student_id ON classroom_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_remedial_assignments_student_id ON remedial_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_remedial_assignments_status ON remedial_assignments(status);