export type ScreenType = 'landing' | 'role' | 'precheck' | 'quiz' | 'lead' | 'results' | 'admin';

export interface QuestionPublic {
  id: string;
  domain: string;
  difficulty: string;
  question: string;
  options: string[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  primary_domain: string;
  level: string;
  badge: string;
  duration: string;
  description: string;
  key_topics: string[];
  booking_url: string;
  rating: number;
  students_enrolled: number;
}

export interface AnswerSubmission {
  question_id: string;
  selected_option: number;
  time_spent_seconds?: number;
}

export interface DomainScore {
  domain: string;
  correct: number;
  total: number;
  score_percentage: number;
  status: 'Needs Work' | 'Developing' | 'Ready';
  color: string;
}

export interface RecommendedCourse {
  course: Course;
  match_score: number;
  gap_reason: string;
  priority: number;
}

export interface QuestionReviewItem {
  question_id: string;
  domain: string;
  question: string;
  options: string[];
  selected_option: number;
  correct_answer: number;
  is_correct: boolean;
  explanation: string;
}

export interface AssessmentResult {
  assessment_id: string;
  overall_score: number;
  readiness_level: 'Needs Work' | 'Developing' | 'Ready';
  summary_verdict: string;
  domain_scores: DomainScore[];
  weakest_domain: string;
  strongest_domain: string;
  recommended_courses: RecommendedCourse[];
  question_review: QuestionReviewItem[];
}

export interface LeadInfo {
  name: string;
  email: string;
  phone?: string;
  target_role: string;
  experience_level: string;
  consultation_requested?: boolean;
  preferred_date?: string;
  notes?: string;
}

// --- AI PROCTORING TYPES ---

export type ProctorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ProctorEventType =
  | 'FACE_NOT_DETECTED'
  | 'MULTIPLE_FACES'
  | 'LOOKING_AWAY'
  | 'CUMULATIVE_AWAY'
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR'
  | 'FULLSCREEN_EXIT'
  | 'CAMERA_INTERRUPTED'
  | 'MICROPHONE_INTERRUPTED'
  | 'AUDIO_ANOMALY'
  | 'UNAUTHORIZED_OBJECT'
  | 'TAMPER_SHORTCUT'
  | 'NETWORK_DISCONNECT';

export interface ProctorEvent {
  id: string;
  session_id?: string;
  candidate_id?: string;
  test_id?: string;
  event_type: ProctorEventType;
  timestamp: string;
  confidence: number;
  duration_seconds: number;
  severity: ProctorSeverity;
  evidence_snapshot?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface RiskBreakdown {
  visual_gaze_score: number;
  tab_browser_score: number;
  audio_anomaly_score: number;
  multi_person_score: number;
  tampering_score: number;
}

export interface ProctorSessionRecord {
  session_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  target_role: string;
  experience_level: string;
  test_duration_minutes: number;
  start_time: string;
  end_time?: string;
  time_spent_seconds: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'AUTO_SUBMITTED' | 'TERMINATED';
  proctor_status: 'SECURE' | 'WARNING' | 'ALERT';
  risk_score: number;
  risk_level: 'Normal' | 'Needs Review' | 'Flagged';
  review_status: 'Normal' | 'Needs Review' | 'Reviewed' | 'Disqualified';
  proctor_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  events: ProctorEvent[];
  answers: AnswerSubmission[];
  score?: number;
  readiness_level?: string;
  verification_snapshot?: string;
  risk_breakdown: RiskBreakdown;
  created_at: string;
  updated_at: string;
}

export interface PreTestChecksState {
  authValid: boolean;
  cameraPassed: boolean;
  micPassed: boolean;
  facePassed: boolean;
  singlePersonPassed: boolean;
  networkPassed: boolean;
  fullscreenGranted: boolean;
  consentAgreed: boolean;
}

export interface CandidateProfile {
  name: string;
  email: string;
  candidateId: string;
  targetRole: string;
  experienceLevel: string;
  photoSnapshot?: string;
}

