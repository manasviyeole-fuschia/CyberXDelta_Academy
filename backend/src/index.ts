import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { z } from 'zod';
import path from 'path';
import dotenv from 'dotenv';

// Load .env relative to backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { 
    AssessmentEvaluateRequestSchema, 
    LeadCaptureRequestSchema, 
    DemoBookingRequestSchema,
    ProctorSessionStartRequestSchema,
    ProctorHeartbeatRequestSchema,
    ProctorSubmitRequestSchema,
    ProctorReviewUpdateRequestSchema
} from './models';
import { DOMAINS, COURSES, QUESTIONS } from './seed_data';
import { 
    calculateAssessmentResults, 
    registerLead, 
    bookDemoSession, 
    LEADS_STORE,
    PROCTOR_SESSIONS_STORE,
    startProctorSession,
    heartbeatProctorSession,
    recordProctorEvent,
    submitProctorSession,
    updateProctorReview
} from './services';

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
    credentials: true
}));

// Increase payload limit for base64 photo snapshots
app.use(express.json({ limit: '25mb' }));

// Validation Middleware Helper
const validateBody = (schema: z.ZodType<any, any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsedBody = schema.parse(req.body);
            req.body = parsedBody; // replace with validated/typed object
            next();
        } catch (error: any) {
            return res.status(400).json({ detail: error.errors || "Validation error" });
        }
    };
};

app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: "healthy",
        service: "cyberxdelta-assessment-backend-node",
        version: "2.0.0-proctored",
        persisted_leads_count: LEADS_STORE.length,
        persisted_proctor_sessions_count: PROCTOR_SESSIONS_STORE.length
    });
});

app.get('/api/v1/meta/domains', (req: Request, res: Response) => {
    res.json(DOMAINS);
});

app.get('/api/v1/courses', (req: Request, res: Response) => {
    const domain = req.query.domain as string;
    if (domain) {
        const filtered = COURSES.filter(c => c.primary_domain.toLowerCase() === domain.toLowerCase());
        return res.json(filtered);
    }
    res.json(COURSES);
});

app.get('/api/v1/assessments/questions', (req: Request, res: Response) => {
    const levelParam = (req.query.level as string) || '';

    let targetDifficulty = 'Intermediate'; // Default for Analyst/Engineer
    if (levelParam.includes('Fresher') || levelParam.includes('Student')) {
        targetDifficulty = 'Beginner';
    } else if (levelParam.includes('Senior') || levelParam.includes('Architect')) {
        targetDifficulty = 'Advanced';
    }

    let filteredQuestions = QUESTIONS;
    // Apply filtering if a valid level was passed
    if (levelParam) {
        filteredQuestions = QUESTIONS.filter(q => q.difficulty === targetDifficulty);
    }

    const publicQuestions = filteredQuestions.map(q => ({
        id: q.id,
        domain: q.domain,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options
    }));
    res.json(publicQuestions);
});

app.post('/api/v1/assessments/evaluate', validateBody(AssessmentEvaluateRequestSchema), (req: Request, res: Response) => {
    const payload = req.body;
    if (!payload.answers || payload.answers.length === 0) {
        return res.status(400).json({ detail: "Assessment submission must include answers." });
    }
    const result = calculateAssessmentResults(
        payload.target_role,
        payload.experience_level,
        payload.answers,
        payload.lead_info
    );
    res.json(result);
});

// --- PROCTORED TEST & RISK ENGINE ENDPOINTS ---

app.post('/api/v1/proctor/session/start', validateBody(ProctorSessionStartRequestSchema), async (req: Request, res: Response) => {
    try {
        const session = await startProctorSession(req.body);
        res.json(session);
    } catch (e: any) {
        res.status(500).json({ status: "error", detail: e.message });
    }
});

app.post('/api/v1/proctor/session/:id/heartbeat', async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.id as string;
        const result = await heartbeatProctorSession(sessionId, req.body);
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ status: "error", detail: e.message });
    }
});

app.post('/api/v1/proctor/session/:id/event', async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.id as string;
        const result = await recordProctorEvent(sessionId, req.body);
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ status: "error", detail: e.message });
    }
});

app.post('/api/v1/proctor/session/:id/submit', async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.id as string;
        const result = await submitProctorSession(sessionId, req.body);
        res.json(result);
    } catch (e: any) {
        console.error("Submission error:", e);
        res.status(500).json({ status: "error", detail: e.message });
    }
});

// Admin Proctor Center
app.get('/api/v1/admin/proctor/sessions', (req: Request, res: Response) => {
    res.json({
        total: PROCTOR_SESSIONS_STORE.length,
        sessions: PROCTOR_SESSIONS_STORE
    });
});

app.get('/api/v1/admin/proctor/sessions/:id', (req: Request, res: Response) => {
    const sessionId = req.params.id as string;
    const session = PROCTOR_SESSIONS_STORE.find(s => s.session_id === sessionId);
    if (!session) {
        return res.status(404).json({ detail: "Proctor session not found" });
    }
    res.json(session);
});

app.put('/api/v1/admin/proctor/sessions/:id/review', validateBody(ProctorReviewUpdateRequestSchema), async (req: Request, res: Response) => {
    const sessionId = req.params.id as string;
    const updated = await updateProctorReview(sessionId, req.body);
    if (!updated) {
        return res.status(404).json({ detail: "Proctor session not found" });
    }
    res.json({ status: "success", session: updated });
});

// Leads & Demo Booking
app.post('/api/v1/leads', validateBody(LeadCaptureRequestSchema), async (req: Request, res: Response) => {
    const result = await registerLead(req.body);
    res.json(result);
});

app.post('/api/v1/consultation/schedule', async (req: Request, res: Response) => {
    const { email, phone, name, score } = req.body;
    try {
        const result = await bookDemoSession({
            name,
            email,
            phone,
            target_role: "Assessment Follow-up",
            notes: `Score: ${score}%`,
            consultation_requested: true
        } as any);
        
        res.json({
            status: "success",
            message: "Call booking confirmed. Notification dispatched.",
            contacted_via: phone ? "phone" : "email",
            service_result: result
        });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ status: "error", detail: e.message });
    }
});

app.post('/api/v1/book-demo', validateBody(DemoBookingRequestSchema), async (req: Request, res: Response) => {
    const result = await bookDemoSession(req.body);
    res.json(result);
});

app.get('/api/v1/admin/leads', (req: Request, res: Response) => {
    res.json({
        total: LEADS_STORE.length,
        leads_file: path.join(__dirname, '..', 'data', 'leads.json'),
        leads: LEADS_STORE
    });
});

app.listen(port, () => {
    console.log(`Node.js backend running at http://127.0.0.1:${port}`);
});

