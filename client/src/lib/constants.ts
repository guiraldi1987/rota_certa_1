/**
 * Application constants
 */

// Routes
export const ROUTES = {
  HOME: '/',
  LANDING: '/landing',
  ONBOARDING: '/onboarding',
  QUESTIONS: '/questions',
  SIMULADOS: '/simulados',
} as const;

// User types
export const USER_TYPES = {
  CONCURSEIRO: 'concurseiro',
  MILITAR: 'militar',
} as const;

// Question difficulties
export const DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

// Simulado types
export const SIMULADO_TYPES = {
  DIAGNOSTIC: 'diagnostic',
  PRACTICE: 'practice',
  MOCK_EXAM: 'mock_exam',
} as const;

// Simulado status
export const SIMULADO_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;

// Study time options
export const STUDY_TIME_OPTIONS = [
  '1-5 horas',
  '5-10 horas',
  '10-20 horas',
  '20-30 horas',
  'Mais de 30 horas'
] as const;

// Study periods
export const STUDY_PERIODS = [
  'Manhã',
  'Tarde',
  'Noite',
  'Madrugada'
] as const;

// Common subjects
export const SUBJECTS = [
  'Direito Constitucional',
  'Direito Administrativo',
  'Direito Penal',
  'Direito Civil',
  'Direito Processual Civil',
  'Direito Processual Penal',
  'Português',
  'Matemática',
  'Informática',
  'Atualidades',
  'História',
  'Geografia',
  'Física',
  'Química',
  'Biologia'
] as const;

// Exam boards
export const EXAM_BOARDS = [
  'VUNESP',
  'FCC',
  'CESPE/CEBRASPE',
  'FGV',
  'ESAF',
  'IBFC',
  'AOCP',
  'CONSULPLAN',
  'QUADRIX',
  'IDECAN'
] as const;

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: false,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    USER: '/api/auth/user',
  },
  USER: {
    PROFILE: '/api/user/profile',
  },
  QUESTIONS: {
    LIST: '/api/questions',
    CREATE: '/api/questions',
    UPDATE: '/api/questions',
    DELETE: '/api/questions',
  },
  SIMULADOS: {
    LIST: '/api/simulados',
    CREATE: '/api/simulados',
    UPDATE: '/api/simulados',
    DELETE: '/api/simulados',
  },
  ANSWERS: {
    CREATE: '/api/answers',
    LIST: '/api/answers',
  },
  STATS: {
    USER: '/api/stats/user',
  },
  TEST: {
    FIREBASE: '/api/test-firebase',
  },
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'rota_certa_user_preferences',
  THEME: 'rota_certa_theme',
  LAST_STUDY_SESSION: 'rota_certa_last_study_session',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Timeouts and delays
export const TIMEOUTS = {
  DEBOUNCE_SEARCH: 300,
  TOAST_DURATION: 5000,
  AUTO_SAVE_DELAY: 2000,
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;