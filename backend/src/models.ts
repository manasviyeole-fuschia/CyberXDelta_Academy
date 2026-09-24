import { z } from 'zod';

export const QuestionSchema = z.object({
    id: z.string(),
    domain: z.string(),
    difficulty: z.string(),
    question: z.string(),
    options: z.array(z.string()),
    correct_answer: z.number(),
    explanation: z.string()
});
export type Question = z.infer<typeof QuestionSchema>;

export const QuestionPublicSchema = QuestionSchema.omit({ correct_answer: true, explanation: true });
export type QuestionPublic = z.infer<typeof QuestionPublicSchema>;

export const CourseSchema = z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    primary_domain: z.string(),
    level: z.string(),
    badge: z.string(),
    duration: z.string(),
    description: z.string(),
    key_topics: z.array(z.string()),
    booking_url: z.string(),
    rating: z.number().default(4.9),
    students_enrolled: z.number().default(1250)
});
export type Course = z.infer<typeof CourseSchema>;

export const AssessmentStartRequestSchema = z.object({
    target_role: z.string(),
    experience_level: z.string(),
    user_email: z.string().optional()
});
export type AssessmentStartRequest = z.infer<typeof AssessmentStartRequestSchema>;

export const AnswerSubmissionSchema = z.object({
    question_id: z.string(),
    selected_option: z.number(),
    time_spent_seconds: z.number().optional().default(0)
});
export type AnswerSubmission = z.infer<typeof AnswerSubmissionSchema>;

export const AssessmentEvaluateRequestSchema = z.object({
    target_role: z.string(),
    experience_level: z.string(),
    answers: z.array(AnswerSubmissionSchema),
    lead_info: z.record(z.string(), z.any()).optional()
});
export type AssessmentEvaluateRequest = z.infer<typeof AssessmentEvaluateRequestSchema>;

export const DomainScoreSchema = z.object({
    domain: z.string(),
    correct: z.number(),
    total: z.number(),
    score_percentage: z.number(),
    status: z.string(),
    color: z.string()
});
export type DomainScore = z.infer<typeof DomainScoreSchema>;

export const RecommendedCourseSchema = z.object({
    course: CourseSchema,
    match_score: z.number(),
    gap_reason: z.string(),
    priority: z.number()
});
export type RecommendedCourse = z.infer<typeof RecommendedCourseSchema>;

export const AssessmentResultResponseSchema = z.object({
    assessment_id: z.string(),
    overall_score: z.number(),
    readiness_level: z.string(),
    summary_verdict: z.string(),
    domain_scores: z.array(DomainScoreSchema),
    weakest_domain: z.string(),
    strongest_domain: z.string(),
    recommended_courses: z.array(RecommendedCourseSchema),
    question_review: z.array(z.record(z.string(), z.any()))
});
export type AssessmentResultResponse = z.infer<typeof AssessmentResultResponseSchema>;

export const LeadCaptureRequestSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    target_role: z.string(),
    experience_level: z.string(),
    assessment_id: z.string().optional(),
    consultation_requested: z.boolean().default(false),
    preferred_date: z.string().optional(),
    notes: z.string().optional()
});
export type LeadCaptureRequest = z.infer<typeof LeadCaptureRequestSchema>;

export const DemoBookingRequestSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    target_role: z.string().optional().default("Analyst / Engineer"),
    assessment_id: z.string().optional(),
    preferred_date: z.string().optional(),
    preferred_time_slot: z.string().optional(),
    tool_interest: z.string().optional(),
    notes: z.string().optional()
});
export type DemoBookingRequest = z.infer<typeof DemoBookingRequestSchema>;

export const LeadResponseSchema = z.object({
    lead_id: z.string(),
    status: z.string(),
    message: z.string(),
    email_sent: z.boolean().default(false),
    whatsapp_url: z.string().optional(),
    notification_status: z.string().optional()
});
export type LeadResponse = z.infer<typeof LeadResponseSchema>;

// --- AI PROCTORING & TEST ENGINE SCHEMAS ---

export const ProctorSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type ProctorSeverity = z.infer<typeof ProctorSeveritySchema>;

export const ProctorEventTypeSchema = z.enum([
    'FACE_NOT_DETECTED',
    'MULTIPLE_FACES',
    'LOOKING_AWAY',
    'TAB_SWITCH',
    'WINDOW_BLUR',
    'FULLSCREEN_EXIT',
    'CAMERA_INTERRUPTED',
    'MICROPHONE_INTERRUPTED',
    'AUDIO_ANOMALY',
    'UNAUTHORIZED_OBJECT',
    'TAMPER_SHORTCUT',
    'NETWORK_DISCONNECT'
]);
export type ProctorEventType = z.infer<typeof ProctorEventTypeSchema>;

export const ProctorEventSchema = z.object({
    id: z.string(),
    session_id: z.string().optional(),
    candidate_id: z.string().optional(),
    test_id: z.string().optional(),
    event_type: ProctorEventTypeSchema,
    timestamp: z.string(),
    confidence: z.number().min(0).max(1).default(0.95),
    duration_seconds: z.number().default(0),
    severity: ProctorSeveritySchema,
    evidence_snapshot: z.string().optional(),
    description: z.string(),
    metadata: z.record(z.string(), z.any()).optional()
});
export type ProctorEvent = z.infer<typeof ProctorEventSchema>;

export const RiskBreakdownSchema = z.object({
    visual_gaze_score: z.number(),
    tab_browser_score: z.number(),
    audio_anomaly_score: z.number(),
    multi_person_score: z.number(),
    tampering_score: z.number()
});
export type RiskBreakdown = z.infer<typeof RiskBreakdownSchema>;

export const ProctorReviewStatusSchema = z.enum(['Normal', 'Needs Review', 'Reviewed', 'Disqualified']);
export type ProctorReviewStatus = z.infer<typeof ProctorReviewStatusSchema>;

export const ProctorSessionStartRequestSchema = z.object({
    candidate_name: z.string(),
    candidate_email: z.string().email(),
    candidate_id: z.string().optional(),
    target_role: z.string().default("Analyst / Engineer"),
    experience_level: z.string().default("Intermediate"),
    test_duration_minutes: z.number().default(30),
    verification_snapshot: z.string().optional()
});
export type ProctorSessionStartRequest = z.infer<typeof ProctorSessionStartRequestSchema>;

export const ProctorHeartbeatRequestSchema = z.object({
    answers: z.array(AnswerSubmissionSchema).optional(),
    current_question_index: z.number().optional(),
    time_remaining_seconds: z.number().optional(),
    active_tab_status: z.boolean().optional(),
    proctor_status: z.string().optional()
});
export type ProctorHeartbeatRequest = z.infer<typeof ProctorHeartbeatRequestSchema>;

export const ProctorSubmitRequestSchema = z.object({
    target_role: z.string(),
    experience_level: z.string(),
    answers: z.array(AnswerSubmissionSchema),
    events: z.array(ProctorEventSchema),
    time_spent_seconds: z.number(),
    verification_snapshot: z.string().optional(),
    lead_info: z.record(z.string(), z.any()).optional()
});
export type ProctorSubmitRequest = z.infer<typeof ProctorSubmitRequestSchema>;

export const ProctorReviewUpdateRequestSchema = z.object({
    review_status: ProctorReviewStatusSchema,
    proctor_notes: z.string().optional(),
    reviewed_by: z.string().optional().default("Lead Proctor")
});
export type ProctorReviewUpdateRequest = z.infer<typeof ProctorReviewUpdateRequestSchema>;

