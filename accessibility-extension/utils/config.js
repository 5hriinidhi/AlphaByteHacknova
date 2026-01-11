// Configuration for the extension

export const DISABILITY_TYPES = {
  HEARING_IMPAIRED: 'hearing_impaired',
  VISUALLY_IMPAIRED: 'visually_impaired',
  ADHD: 'adhd',
  MOTOR_DISABILITIES: 'motor_disabilities'
};

// Map each disability to its features
export const FEATURE_MAPPING = {
  [DISABILITY_TYPES.HEARING_IMPAIRED]: [
    'live-transcribe',
    'emotion-detector'
  ],
  [DISABILITY_TYPES.VISUALLY_IMPAIRED]: [
    'screen-reader',
    'image-to-audio'
  ],
  [DISABILITY_TYPES.ADHD]: [
    'blinder-mode',
    'bionic-reading',
    'tldr-button'
  ],
  [DISABILITY_TYPES.MOTOR_DISABILITIES]: [
    'hit-area-expansion',
    'voice-navigation'
  ]
};

// Universal features (always active)
export const UNIVERSAL_FEATURES = [
  'ai-companion',
  'feedback-collector'
];

// Supabase table names
export const TABLES = {
  STUDENTS: 'students',
  LAB_SESSIONS: 'lab_sessions',
  FEATURE_USAGE: 'feature_usage',
  FEEDBACK_EVENTS: 'feedback_events',
  AI_INTERACTIONS: 'ai_interactions'
};

// How often to sync data (milliseconds)
export const SYNC_INTERVAL = 30000; // 30 seconds
