import { Student, DisabilityProfile, AccessibilitySettings } from './supabase';

export const mockStudents: Student[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    roll_number: '2024001',
    name: 'Arjun Sharma',
    email: 'arjun@example.com',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    roll_number: '2024002',
    name: 'Priya Patel',
    email: 'priya@example.com',
    created_at: new Date().toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    roll_number: '2024003',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    created_at: new Date().toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    roll_number: '2024004',
    name: 'Ananya Singh',
    email: 'ananya@example.com',
    created_at: new Date().toISOString()
  }
];

export const mockDisabilityProfiles: DisabilityProfile[] = [

  {
    id: 'dp-2',
    student_id: '00000000-0000-0000-0000-000000000001',
    disability_type: 'adhd',
    severity: 'mild',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Priya: Hearing Impaired
  {
    id: 'dp-3',
    student_id: '00000000-0000-0000-0000-000000000002',
    disability_type: 'hearing_impaired',
    severity: 'moderate',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Rahul: Motor Disabilities
  {
    id: 'dp-4',
    student_id: '00000000-0000-0000-0000-000000000003',
    disability_type: 'motor_disabilities',
    severity: 'severe',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Ananya: ADHD
  {
    id: 'dp-5',
    student_id: '00000000-0000-0000-0000-000000000004',
    disability_type: 'adhd',
    severity: 'moderate',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockAccessibilitySettings: AccessibilitySettings[] = [
  // Arjun
  {
    id: 'as-1',
    student_id: '00000000-0000-0000-0000-000000000001',
    semantic_reader_enabled: true,
    ai_image_descriptions_enabled: true,
    braille_input_enabled: true,
    live_captions_enabled: false,
    emotion_tags_enabled: false,
    focus_tunnel_enabled: true,
    bionic_reading_enabled: true,
    ai_summaries_enabled: true,
    voice_navigation_enabled: false,
    big_click_zones_enabled: false,
    font_size: 18,
    contrast_mode: 'high',
    updated_at: new Date().toISOString()
  },
  // Priya
  {
    id: 'as-2',
    student_id: '00000000-0000-0000-0000-000000000002',
    semantic_reader_enabled: false,
    ai_image_descriptions_enabled: false,
    braille_input_enabled: false,
    live_captions_enabled: true,
    emotion_tags_enabled: true,
    focus_tunnel_enabled: false,
    bionic_reading_enabled: false,
    ai_summaries_enabled: false,
    voice_navigation_enabled: false,
    big_click_zones_enabled: false,
    font_size: 16,
    contrast_mode: 'normal',
    updated_at: new Date().toISOString()
  },
  // Rahul
  {
    id: 'as-3',
    student_id: '00000000-0000-0000-0000-000000000003',
    semantic_reader_enabled: false,
    ai_image_descriptions_enabled: false,
    braille_input_enabled: false,
    live_captions_enabled: false,
    emotion_tags_enabled: false,
    focus_tunnel_enabled: false,
    bionic_reading_enabled: false,
    ai_summaries_enabled: false,
    voice_navigation_enabled: true,
    big_click_zones_enabled: true,
    font_size: 20,
    contrast_mode: 'normal',
    updated_at: new Date().toISOString()
  },
  // Ananya
  {
    id: 'as-4',
    student_id: '00000000-0000-0000-0000-000000000004',
    semantic_reader_enabled: false,
    ai_image_descriptions_enabled: false,
    braille_input_enabled: false,
    live_captions_enabled: false,
    emotion_tags_enabled: false,
    focus_tunnel_enabled: true,
    bionic_reading_enabled: true,
    ai_summaries_enabled: true,
    voice_navigation_enabled: false,
    big_click_zones_enabled: false,
    font_size: 16,
    contrast_mode: 'normal',
    updated_at: new Date().toISOString()
  }
];
