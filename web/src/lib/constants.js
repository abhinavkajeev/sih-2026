export const API_ENDPOINTS = {
  AUTH: { LOGIN: '/auth/login', REGISTER: '/auth/register', ME: '/auth/me', VERIFY_OTP: '/auth/verify-otp', LOGOUT: '/auth/logout' },
  USERS: { BASE: '/users', PROFILE: '/users/profile/update' },
  LESSONS: { BASE: '/lessons', MY_LESSONS: '/lessons/my-lessons', BY_SUBJECT: (s) => `/lessons/subject/${s}`, BY_ID: (id) => `/lessons/${id}`, COMPLETE: (id) => `/lessons/${id}/complete` },
  DOUBTS: { BASE: '/doubts', MY_DOUBTS: '/doubts/my-doubts', BY_LESSON: (id) => `/doubts/lesson/${id}`, BY_ID: (id) => `/doubts/${id}`, RESPOND: (id) => `/doubts/${id}/respond`, HELPFUL: (id) => `/doubts/${id}/helpful` },
  QUIZZES: { BASE: '/quizzes', BY_ID: (id) => `/quizzes/${id}`, ATTEMPT: (id) => `/quizzes/${id}/attempt`, GENERATE_AI: '/quizzes/generate-ai', RESULTS: (id) => `/quizzes/${id}/results` },
  PROGRESS: { BASE: '/progress', STUDENT: (id) => `/progress/student/${id}`, CLASS: '/progress/class' },
  GAMIFICATION: { PROFILE: '/gamification/profile', LEADERBOARD: '/gamification/leaderboard', CHALLENGES: '/gamification/challenges', COMPLETE_CHALLENGE: (id) => `/gamification/challenges/${id}/complete`, REWARDS: '/gamification/rewards', REDEEM: (id) => `/gamification/rewards/${id}/redeem`, BADGES: '/gamification/badges' },
  NOTIFICATIONS: { BASE: '/notifications', UNREAD: '/notifications/unread-count', READ: (id) => `/notifications/${id}/read`, READ_ALL: '/notifications/read-all' },
  CALLS: { LOGS: '/calls/logs' },
};

export const SUBJECTS = [
  { id: 'mathematics', label: 'Mathematics', emoji: '🔢' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'english', label: 'English', emoji: '📝' },
  { id: 'hindi', label: 'Hindi', emoji: '🇮🇳' },
  { id: 'punjabi', label: 'Punjabi', emoji: '🏵️' },
  { id: 'social_studies', label: 'Social Studies', emoji: '🌍' },
  { id: 'computer_science', label: 'Computer Science', emoji: '💻' },
];

export const GRADES = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  label: `Class ${i + 1}`,
}));

export const LEVEL_NAMES = ['Beginner', 'Scholar', 'Expert', 'Master', 'Guru', 'Legend'];

export const BADGE_RARITIES = {
  common: { color: '#9ca3af', label: 'Common' },
  rare: { color: '#3b82f6', label: 'Rare' },
  epic: { color: '#8b5cf6', label: 'Epic' },
  legendary: { color: '#fbbf24', label: 'Legendary' },
};
