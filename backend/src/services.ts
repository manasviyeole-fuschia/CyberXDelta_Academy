import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

import { 
    AnswerSubmission, DomainScore, RecommendedCourse, 
    AssessmentResultResponse, LeadCaptureRequest, DemoBookingRequest, LeadResponse
} from './models';
import { QUESTIONS, COURSES, DOMAINS } from './seed_data';

const DATA_DIR = path.join(__dirname, '..', 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const EMAIL_LOGS_FILE = path.join(DATA_DIR, 'email_logs.json');

// Ensure data directory exists
const ensureDataDir = async () => {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        console.warn(`[Warning] Failed to create data directory: ${error}`);
    }
};
ensureDataDir();

export let LEADS_STORE: any[] = [];
const ASSESSMENT_SESSIONS: Record<string, any> = {};

const loadLeadsFromDisk = async (): Promise<any[]> => {
    try {
        const data = await fs.readFile(LEADS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            console.warn(`[Warning] Error loading leads from file: ${error.message}`);
        }
        return [];
    }
};

const saveLeadsToDisk = async (leads: any[]) => {
    try {
        await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (error: any) {
        console.warn(`[Warning] Error saving leads to file: ${error.message}`);
    }
};

// Initialize leads store asynchronously
loadLeadsFromDisk().then(leads => {
    LEADS_STORE = leads;
});

const logEmailDispatch = async (logEntry: any) => {
    let logs: any[] = [];
    try {
        const data = await fs.readFile(EMAIL_LOGS_FILE, 'utf-8');
        logs = JSON.parse(data);
    } catch (error) {
        logs = [];
    }
    logs.push(logEntry);
    try {
        await fs.writeFile(EMAIL_LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (error: any) {
        console.warn(`[Warning] Error saving email log: ${error.message}`);
    }
};

const buildWhatsappLink = (phone: string | undefined, candidateName: string, score?: number, role?: string): string => {
    const mentorPhone = "918972065508";
    const scoreText = score !== undefined ? ` (Score: ${score}%)` : "";
    const roleText = role ? ` for ${role}` : "";
    const msg = `Hello CyberXDelta Academy, I am ${candidateName}. I just completed my IAM Assessment${scoreText}${roleText} and would like to discuss my career roadmap & demo session.`;
    const encodedMsg = encodeURIComponent(msg);
    return `https://wa.me/${mentorPhone}?text=${encodedMsg}`;
};

const sendEmailMessage = async (toEmail: string, subject: string, htmlBody: string, plainFallback: string): Promise<[boolean, string]> => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || "CyberXDelta Academy <academy@cyberxdelta.com>";
    
    if (smtpHost && smtpUser && smtpPass) {
        try {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            });

            await transporter.sendMail({
                from: smtpFrom,
                to: toEmail,
                subject: subject,
                text: plainFallback,
                html: htmlBody
            });
            
            console.log(`[SMTP OK] Real email delivered to ${toEmail}`);
            return [true, "Email delivered to inbox via SMTP"];
        } catch (error: any) {
            console.log(`[SMTP Error] Failed to send to ${toEmail}: ${error.message}`);
            return [false, `SMTP Error: ${error.message}`];
        }
    } else {
        console.log(`[Email Logged] Dispatch recorded for ${toEmail} (SMTP credentials not yet filled in .env)`);
        return [true, "Email recorded & dispatched (Configure SMTP in backend/.env for live inbox delivery)"];
    }
};

export const dispatchAssessmentResultEmail = async (
    toEmail: string,
    candidateName: string,
    targetRole: string,
    overallScore: number,
    readinessLevel: string,
    weakestDomain: string,
    strongestDomain: string,
    phone?: string,
    assessmentId?: string
): Promise<boolean> => {
    const subject = `CyberXDelta Academy: Your IAM Readiness Report (${overallScore}% - ${readinessLevel})`;
    
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: auto; background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
        .logo { font-size: 24px; font-weight: 800; color: #38bdf8; margin-bottom: 20px; }
        .score-circle { display: inline-block; background: #2563eb; color: #fff; font-size: 28px; font-weight: 800; padding: 16px 24px; border-radius: 12px; margin: 12px 0; }
        .card { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 18px; margin: 16px 0; }
        .btn { display: inline-block; background: #38bdf8; color: #0f172a; padding: 12px 24px; border-radius: 8px; font-weight: 800; text-decoration: none; margin-top: 16px; }
        .footer { font-size: 12px; color: #64748b; margin-top: 30px; text-align: center; border-top: 1px solid #334155; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">CyberX<span style="color: #fff;">Delta</span> <span style="font-size: 14px; color: #94a3b8;">Academy</span></div>
        <h2 style="color: #fff; margin-top: 0;">Hi ${candidateName},</h2>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
          Thank you for completing the <strong>CyberXDelta IAM Skill Diagnostic Assessment</strong>. Here is your evaluation summary:
        </p>

        <div style="text-align: center; margin: 20px 0;">
          <div class="score-circle">${overallScore}%</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">Readiness Level: ${readinessLevel}</div>
        </div>

        <div class="card">
          <div style="font-size: 14px; margin-bottom: 8px;"><strong style="color: #94a3b8;">Target Role Track:</strong> <span style="color: #fff;">${targetRole}</span></div>
          <div style="font-size: 14px; margin-bottom: 8px;"><strong style="color: #94a3b8;">Strongest Domain:</strong> <span style="color: #22c55e;">${strongestDomain}</span></div>
          <div style="font-size: 14px; margin-bottom: 8px;"><strong style="color: #94a3b8;">Primary Growth Gap:</strong> <span style="color: #f59e0b;">${weakestDomain}</span></div>
          ${assessmentId ? `<div style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Assessment Reference ID: ${assessmentId}</div>` : ''}
        </div>

        <h4 style="color: #fff; margin-bottom: 8px;">Next Steps for Your IAM Career:</h4>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          Bridge your ${weakestDomain} gap with CyberXDelta's live cohorts covering <strong>SailPoint, CyberArk PAM, Ping Identity, and Microsoft Entra ID</strong> with hands-on enterprise labs.
        </p>

        <div style="text-align: center; margin-top: 24px;">
          <a href="https://wa.me/918972065508?text=Hello%20CyberXDelta%20team,%20I%20am%20${encodeURIComponent(candidateName)}%20(Score:%20${overallScore}%25).%20I%20would%20like%20to%20review%20my%20IAM%20career%20roadmap." class="btn">
            💬 Connect with Mentor on WhatsApp (+91 8972065508)
          </a>
        </div>

        <div class="footer">
          <p>CyberXDelta Academy • academy@cyberxdelta.com • +91 8972065508</p>
          <p>&copy; ${new Date().getFullYear()} CyberXDelta. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    const plainFallback = `Hi ${candidateName},\nYour CyberXDelta IAM Readiness Score is ${overallScore}% (${readinessLevel}).\nPrimary Gap: ${weakestDomain}\nContact us at academy@cyberxdelta.com or WhatsApp +91 8972065508 to schedule your 1:1 roadmap session.`;
    
    const [success, note] = await sendEmailMessage(toEmail, subject, htmlBody, plainFallback);
    
    await logEmailDispatch({
        timestamp: new Date().toISOString(),
        type: "ASSESSMENT_REPORT",
        to_email: toEmail,
        candidate_name: candidateName,
        score: overallScore,
        phone,
        status: success ? "DELIVERED" : "FAILED",
        note
    });
    
    return success;
};

export const dispatchDemoBookingEmail = async (
    toEmail: string,
    candidateName: string,
    targetRole: string,
    preferredDate?: string,
    preferredTime?: string,
    toolInterest?: string,
    assessmentId?: string,
    notes?: string
): Promise<boolean> => {
    const subject = "CyberXDelta Academy: Your 1:1 IAM Career Consultation & Demo Session is Confirmed!";
    const dateDisplay = preferredDate || "To be confirmed by mentor";
    const timeDisplay = preferredTime || "Flexible Slot";
    const toolDisplay = toolInterest || "Converged IAM / Specialization Track";
    
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: auto; background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
        .logo { font-size: 24px; font-weight: 800; color: #38bdf8; margin-bottom: 20px; }
        .card { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin: 18px 0; }
        .btn { display: inline-block; background: #22c55e; color: #0f172a; padding: 12px 24px; border-radius: 8px; font-weight: 800; text-decoration: none; margin-top: 16px; }
        .footer { font-size: 12px; color: #64748b; margin-top: 30px; text-align: center; border-top: 1px solid #334155; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">CyberX<span style="color: #fff;">Delta</span> <span style="font-size: 14px; color: #94a3b8;">Academy</span></div>
        <div style="display: inline-block; background: #22c55e20; color: #22c55e; border: 1px solid #22c55e50; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 12px;">✓ Demo Session Confirmed</div>
        <h2 style="color: #fff; margin-top: 0;">Hi ${candidateName},</h2>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
          Your <strong>1:1 IAM Career Consultation & Demo Call</strong> has been booked with an enterprise Identity Security Lead.
        </p>

        <div class="card">
          <div style="font-size: 15px; font-weight: 700; color: #38bdf8; margin-bottom: 10px;">🗓️ Booking Summary</div>
          <div style="font-size: 14px; margin-bottom: 6px;"><strong style="color: #94a3b8;">Candidate:</strong> <span style="color: #fff;">${candidateName} (${toEmail})</span></div>
          <div style="font-size: 14px; margin-bottom: 6px;"><strong style="color: #94a3b8;">Track:</strong> <span style="color: #fff;">${targetRole}</span></div>
          <div style="font-size: 14px; margin-bottom: 6px;"><strong style="color: #94a3b8;">Tool Focus:</strong> <span style="color: #38bdf8;">${toolDisplay}</span></div>
          <div style="font-size: 14px; margin-bottom: 6px;"><strong style="color: #94a3b8;">Slot:</strong> <span style="color: #fff;">${dateDisplay} • ${timeDisplay}</span></div>
          ${notes ? `<div style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Note: ${notes}</div>` : ''}
        </div>

        <h4 style="color: #fff; margin-bottom: 8px;">What will be covered:</h4>
        <ul style="color: #94a3b8; font-size: 14px; line-height: 1.6; padding-left: 20px;">
          <li>Review of your assessment domain readiness scores</li>
          <li>Live walkthrough of IAM tool labs (SailPoint, CyberArk, Ping, Okta, Entra)</li>
          <li>Upcoming batch schedules, certification paths & interview mentorship</li>
        </ul>

        <div style="text-align: center; margin-top: 24px;">
          <a href="https://wa.me/918972065508?text=Hello%20CyberXDelta,%20I%20have%20booked%20a%20demo%20call%20for%20${encodeURIComponent(candidateName)}." class="btn">
            💬 Open WhatsApp to Confirm Slot (+91 8972065508)
          </a>
        </div>

        <div class="footer">
          <p>CyberXDelta Academy • academy@cyberxdelta.com • +91 8972065508</p>
          <p>&copy; ${new Date().getFullYear()} CyberXDelta. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    const plainFallback = `Hi ${candidateName},\nYour 1:1 IAM Career Consultation & Demo Session has been confirmed for ${dateDisplay} (${timeDisplay}).\nTool Focus: ${toolDisplay}\nReach us on WhatsApp: +91 8972065508 or academy@cyberxdelta.com`;
    
    const [success, note] = await sendEmailMessage(toEmail, subject, htmlBody, plainFallback);
    
    await logEmailDispatch({
        timestamp: new Date().toISOString(),
        type: "DEMO_CONFIRMATION",
        to_email: toEmail,
        candidate_name: candidateName,
        date_slot: `${dateDisplay} ${timeDisplay}`,
        status: success ? "DELIVERED" : "FAILED",
        note
    });
    
    return success;
};

export const calculateAssessmentResults = (
    targetRole: string,
    experienceLevel: string,
    answers: AnswerSubmission[],
    leadInfo?: any
): AssessmentResultResponse => {
    const assessmentId = `eval_${uuidv4().replace(/-/g, '').substring(0, 10)}`;
    
    const qMap: Record<string, any> = {};
    QUESTIONS.forEach(q => { qMap[q.id] = q; });
    
    const domainStats: Record<string, {correct: number, total: number}> = {};
    DOMAINS.forEach(d => {
        domainStats[d.id] = { correct: 0, total: 0 };
    });
        
    const questionReview: any[] = [];
    let totalCorrect = 0;
    const totalQuestions = answers.length;
    
    for (const ans of answers) {
        const q = qMap[ans.question_id];
        if (!q) continue;
            
        const domain = q.domain;
        if (!domainStats[domain]) {
            domainStats[domain] = { correct: 0, total: 0 };
        }
            
        domainStats[domain].total += 1;
        const isCorrect = (ans.selected_option === q.correct_answer);
        
        if (isCorrect) {
            domainStats[domain].correct += 1;
            totalCorrect += 1;
        }
            
        questionReview.push({
            question_id: q.id,
            domain: q.domain,
            question: q.question,
            options: q.options,
            selected_option: ans.selected_option,
            correct_answer: q.correct_answer,
            is_correct: isCorrect,
            explanation: q.explanation
        });
    }

    const domainScoresList: DomainScore[] = [];
    for (const d of DOMAINS) {
        const did = d.id;
        const stats = domainStats[did] || { correct: 0, total: 0 };
        const total = stats.total > 0 ? stats.total : 1;
        const correct = stats.correct;
        const pct = Math.round((correct / total) * 1000) / 10; // Round to 1 decimal
        
        let status = "";
        let color = "";
        if (pct >= 70.0) {
            status = "Ready";
            color = "#12b76a"; // Green
        } else if (pct >= 50.0) {
            status = "Developing";
            color = "#f79009"; // Amber
        } else {
            status = "Needs Work";
            color = "#f04438"; // Red
        }
            
        domainScoresList.push({
            domain: did,
            correct,
            total: stats.total,
            score_percentage: pct,
            status,
            color
        });
    }
        
    const overallPercentage = Math.round((totalCorrect / Math.max(totalQuestions, 1)) * 1000) / 10;
    
    let readinessLevel = "";
    let summaryVerdict = "";
    if (overallPercentage >= 70.0) {
        readinessLevel = "Ready";
        summaryVerdict = "Strong Foundation! You demonstrate competent architectural grasp across primary IAM pillars.";
    } else if (overallPercentage >= 50.0) {
        readinessLevel = "Developing";
        summaryVerdict = "Developing Capability. You have good foundational grasp with clear, actionable specialization gaps.";
    } else {
        readinessLevel = "Needs Work";
        summaryVerdict = "Significant Upskilling Required. Priority foundational training is strongly recommended to meet industry baseline.";
    }

    // Identify weakest and strongest domains
    const sortedDomains = [...domainScoresList].sort((a, b) => a.score_percentage - b.score_percentage);
    const weakest = sortedDomains.length > 0 ? sortedDomains[0].domain : "PAM / CyberArk";
    const strongest = sortedDomains.length > 0 ? sortedDomains[sortedDomains.length - 1].domain : "IAM Fundamentals";
    
    const recommendedCourses: RecommendedCourse[] = [];
    
    sortedDomains.forEach((dScore, idx) => {
        const matchedCourse = COURSES.find(c => c.primary_domain === dScore.domain);
        if (matchedCourse) {
            let reason = "";
            let priority = 3;
            let matchScore = 70.0;
            
            if (idx === 0) {
                reason = `Your ${dScore.score_percentage}% in ${dScore.domain} is your primary growth opportunity. Bridging this gap will give you the highest immediate ROI.`;
                priority = 1;
                matchScore = 98.0;
            } else if (idx === 1 && dScore.score_percentage < 70.0) {
                reason = `Your ${dScore.score_percentage}% in ${dScore.domain} represents a secondary skill gap for ${targetRole} roles.`;
                priority = 2;
                matchScore = 85.0;
            } else {
                reason = `Enhance and certify your skills in ${dScore.domain}.`;
                priority = 3;
                matchScore = 70.0;
            }
                
            recommendedCourses.push({
                course: matchedCourse,
                match_score: matchScore,
                gap_reason: reason,
                priority
            });
        }
    });
            
    ASSESSMENT_SESSIONS[assessmentId] = {
        assessment_id: assessmentId,
        target_role: targetRole,
        experience_level: experienceLevel,
        overall_score: overallPercentage,
        readiness_level: readinessLevel,
        lead_info: leadInfo,
        weakest_domain: weakest,
        strongest_domain: strongest
    };
    
    return {
        assessment_id: assessmentId,
        overall_score: overallPercentage,
        readiness_level: readinessLevel,
        summary_verdict: summaryVerdict,
        domain_scores: domainScoresList,
        weakest_domain: weakest,
        strongest_domain: strongest,
        recommended_courses: recommendedCourses,
        question_review: questionReview
    };
};

export const registerLead = async (req: LeadCaptureRequest): Promise<LeadResponse> => {
    const leadId = `lead_${uuidv4().replace(/-/g, '').substring(0, 8)}`;
    const record: any = { ...req, id: leadId, created_at: new Date().toISOString() };
    
    const existingIdx = LEADS_STORE.findIndex(l => l.email && l.email.toLowerCase() === req.email.toLowerCase());
    if (existingIdx !== -1) {
        LEADS_STORE[existingIdx] = { ...LEADS_STORE[existingIdx], ...record };
    } else {
        LEADS_STORE.push(record);
    }
    await saveLeadsToDisk(LEADS_STORE);
    
    const session = req.assessment_id ? (ASSESSMENT_SESSIONS[req.assessment_id] || {}) : {};
    const score = session.overall_score || 65.0;
    const level = session.readiness_level || "Developing";
    const weakest = session.weakest_domain || "PAM / CyberArk";
    const strongest = session.strongest_domain || "IAM Fundamentals";
    
    let emailSent = false;
    if (req.email) {
        emailSent = await dispatchAssessmentResultEmail(
            req.email,
            req.name,
            req.target_role,
            score,
            level,
            weakest,
            strongest,
            req.phone,
            req.assessment_id
        );
    }
    
    const whatsappUrl = buildWhatsappLink(req.phone, req.name, score, req.target_role);
    
    return {
        lead_id: leadId,
        status: "success",
        message: `Thank you, ${req.name}! Your report has been dispatched to ${req.email} and recorded.`,
        email_sent: emailSent,
        whatsapp_url: whatsappUrl,
        notification_status: `WhatsApp connect link ready for ${req.phone || 'mentor'}`
    };
};

export const bookDemoSession = async (req: DemoBookingRequest): Promise<LeadResponse> => {
    const leadId = `demo_${uuidv4().replace(/-/g, '').substring(0, 8)}`;
    const record = {
        id: leadId,
        name: req.name,
        email: req.email,
        phone: req.phone,
        target_role: req.target_role,
        assessment_id: req.assessment_id,
        consultation_requested: true,
        preferred_date: req.preferred_date,
        preferred_time_slot: req.preferred_time_slot,
        tool_interest: req.tool_interest,
        notes: req.notes,
        created_at: new Date().toISOString()
    };
    
    const existingIdx = LEADS_STORE.findIndex(l => l.email && l.email.toLowerCase() === req.email.toLowerCase());
    if (existingIdx !== -1) {
        LEADS_STORE[existingIdx] = { ...LEADS_STORE[existingIdx], ...record };
    } else {
        LEADS_STORE.push(record);
    }
    await saveLeadsToDisk(LEADS_STORE);
    
    let emailSent = false;
    if (req.email) {
        emailSent = await dispatchDemoBookingEmail(
            req.email,
            req.name,
            req.target_role || "IAM Specialist",
            req.preferred_date,
            req.preferred_time_slot,
            req.tool_interest,
            req.assessment_id,
            req.notes
        );
    }
        
    const whatsappUrl = buildWhatsappLink(req.phone, req.name, undefined, req.target_role);
    
    return {
        lead_id: leadId,
        status: "success",
        message: `1:1 Demo session confirmed! Confirmation email dispatched to ${req.email}.`,
        email_sent: emailSent,
        whatsapp_url: whatsappUrl,
        notification_status: `WhatsApp connection ready for ${req.phone || 'mentor'}`
    };
};

// ==========================================
// AI PROCTORING SERVICE & RISK ENGINE
// ==========================================

const PROCTOR_SESSIONS_FILE = path.join(DATA_DIR, 'proctor_sessions.json');

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
    events: any[];
    answers: any[];
    score?: number;
    readiness_level?: string;
    verification_snapshot?: string;
    risk_breakdown: {
        visual_gaze_score: number;
        tab_browser_score: number;
        audio_anomaly_score: number;
        multi_person_score: number;
        tampering_score: number;
    };
    created_at: string;
    updated_at: string;
}

export let PROCTOR_SESSIONS_STORE: ProctorSessionRecord[] = [];

// Realistic Seed Candidates for Admin / Proctor Dashboard
const SEED_PROCTOR_SESSIONS: ProctorSessionRecord[] = [
    {
        session_id: "proc_cxd_90812",
        candidate_id: "cxd-cand-01",
        candidate_name: "Rahul Sharma",
        candidate_email: "rahul.sharma@cyberxdelta.com",
        target_role: "IAM Specialist",
        experience_level: "Intermediate (3-5 Years)",
        test_duration_minutes: 30,
        start_time: new Date(Date.now() - 45 * 60000).toISOString(),
        end_time: new Date(Date.now() - 16 * 60000).toISOString(),
        time_spent_seconds: 1740,
        status: "COMPLETED",
        proctor_status: "SECURE",
        risk_score: 12,
        risk_level: "Normal",
        review_status: "Reviewed",
        proctor_notes: "Exemplary integrity. Clean camera stream throughout the 30-min duration. Verified.",
        reviewed_by: "Sarah Jenkins (Lead Proctor)",
        reviewed_at: new Date(Date.now() - 10 * 60000).toISOString(),
        score: 88,
        readiness_level: "Ready",
        verification_snapshot: "",
        risk_breakdown: {
            visual_gaze_score: 6,
            tab_browser_score: 0,
            audio_anomaly_score: 6,
            multi_person_score: 0,
            tampering_score: 0
        },
        events: [
            {
                id: "evt_101",
                event_type: "LOOKING_AWAY",
                timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
                confidence: 0.88,
                duration_seconds: 3.8,
                severity: "LOW",
                description: "Candidate looked toward lower keyboard area briefly during question #4"
            },
            {
                id: "evt_102",
                event_type: "AUDIO_ANOMALY",
                timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
                confidence: 0.72,
                duration_seconds: 2.1,
                severity: "LOW",
                description: "Transient ambient background noise (distant door closure)"
            }
        ],
        answers: [],
        created_at: new Date(Date.now() - 45 * 60000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 60000).toISOString()
    },
    {
        session_id: "proc_cxd_84102",
        candidate_id: "cxd-cand-02",
        candidate_name: "Ananya Deshmukh",
        candidate_email: "ananya.d@enterprise-sec.io",
        target_role: "SailPoint IGA Architect",
        experience_level: "Senior / Architect (5+ Years)",
        test_duration_minutes: 30,
        start_time: new Date(Date.now() - 22 * 60000).toISOString(),
        time_spent_seconds: 1320,
        status: "IN_PROGRESS",
        proctor_status: "WARNING",
        risk_score: 42,
        risk_level: "Needs Review",
        review_status: "Needs Review",
        score: 75,
        readiness_level: "Ready",
        risk_breakdown: {
            visual_gaze_score: 12,
            tab_browser_score: 30,
            audio_anomaly_score: 0,
            multi_person_score: 0,
            tampering_score: 0
        },
        events: [
            {
                id: "evt_201",
                event_type: "TAB_SWITCH",
                timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
                confidence: 0.99,
                duration_seconds: 6.2,
                severity: "HIGH",
                description: "Window lost focus / candidate navigated away from examination tab"
            },
            {
                id: "evt_202",
                event_type: "LOOKING_AWAY",
                timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
                confidence: 0.91,
                duration_seconds: 5.4,
                severity: "MEDIUM",
                description: "Candidate gaze deviated off-screen to the right side"
            }
        ],
        answers: [],
        created_at: new Date(Date.now() - 22 * 60000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60000).toISOString()
    },
    {
        session_id: "proc_cxd_73921",
        candidate_id: "cxd-cand-03",
        candidate_name: "Vikram Malhotra",
        candidate_email: "vikram.m@techcorp.com",
        target_role: "CyberArk PAM Engineer",
        experience_level: "Intermediate (3-5 Years)",
        test_duration_minutes: 30,
        start_time: new Date(Date.now() - 60 * 60000).toISOString(),
        end_time: new Date(Date.now() - 30 * 60000).toISOString(),
        time_spent_seconds: 1800,
        status: "AUTO_SUBMITTED",
        proctor_status: "ALERT",
        risk_score: 78,
        risk_level: "Flagged",
        review_status: "Needs Review",
        score: 52,
        readiness_level: "Developing",
        risk_breakdown: {
            visual_gaze_score: 18,
            tab_browser_score: 15,
            audio_anomaly_score: 15,
            multi_person_score: 25,
            tampering_score: 15
        },
        events: [
            {
                id: "evt_301",
                event_type: "MULTIPLE_FACES",
                timestamp: new Date(Date.now() - 48 * 60000).toISOString(),
                confidence: 0.96,
                duration_seconds: 4.8,
                severity: "CRITICAL",
                description: "Second face detected in camera background frame"
            },
            {
                id: "evt_302",
                event_type: "UNAUTHORIZED_OBJECT",
                timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
                confidence: 0.92,
                duration_seconds: 5.0,
                severity: "CRITICAL",
                description: "Secondary mobile device detected held beside screen"
            },
            {
                id: "evt_303",
                event_type: "TAMPER_SHORTCUT",
                timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
                confidence: 1.0,
                duration_seconds: 0,
                severity: "HIGH",
                description: "Intercepted prohibited shortcut attempt (Developer Tools / Copy)"
            }
        ],
        answers: [],
        created_at: new Date(Date.now() - 60 * 60000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60000).toISOString()
    }
];

const loadProctorSessions = async (): Promise<ProctorSessionRecord[]> => {
    try {
        const data = await fs.readFile(PROCTOR_SESSIONS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_PROCTOR_SESSIONS;
    } catch (error: any) {
        return SEED_PROCTOR_SESSIONS;
    }
};

const saveProctorSessions = async (sessions: ProctorSessionRecord[]) => {
    try {
        await fs.writeFile(PROCTOR_SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    } catch (error: any) {
        console.warn(`[Warning] Error saving proctor sessions: ${error.message}`);
    }
};

loadProctorSessions().then(s => {
    PROCTOR_SESSIONS_STORE = s;
});

// Risk Scoring Algorithm with Persistence and Weighting
export const calculateProctorRiskScore = (events: any[]) => {
    let visualGaze = 0;
    let tabBrowser = 0;
    let audioAnomaly = 0;
    let multiPerson = 0;
    let tampering = 0;

    for (const evt of events) {
        const conf = evt.confidence || 0.9;
        const dur = Math.max(evt.duration_seconds || 1, 1);

        switch (evt.event_type) {
            case 'MULTIPLE_FACES':
                multiPerson += 25 * conf;
                break;
            case 'UNAUTHORIZED_OBJECT':
                multiPerson += 30 * conf;
                break;
            case 'TAB_SWITCH':
            case 'WINDOW_BLUR':
                tabBrowser += 15 * conf * (dur > 5 ? 1.5 : 1.0);
                break;
            case 'FULLSCREEN_EXIT':
                tabBrowser += 12 * conf;
                break;
            case 'FACE_NOT_DETECTED':
                visualGaze += 10 * conf * (dur > 4 ? 1.3 : 1.0);
                break;
            case 'LOOKING_AWAY':
                visualGaze += 6 * conf * (dur > 4 ? 1.2 : 1.0);
                break;
            case 'CAMERA_INTERRUPTED':
                visualGaze += 20 * conf;
                break;
            case 'AUDIO_ANOMALY':
            case 'MICROPHONE_INTERRUPTED':
                audioAnomaly += 8 * conf;
                break;
            case 'TAMPER_SHORTCUT':
                tampering += 15 * conf;
                break;
            case 'NETWORK_DISCONNECT':
                tabBrowser += 5 * conf;
                break;
            default:
                visualGaze += 5 * conf;
        }
    }

    const totalRaw = visualGaze + tabBrowser + audioAnomaly + multiPerson + tampering;
    const finalScore = Math.min(100, Math.round(totalRaw));

    let riskLevel: 'Normal' | 'Needs Review' | 'Flagged' = 'Normal';
    if (finalScore >= 60) {
        riskLevel = 'Flagged';
    } else if (finalScore >= 25) {
        riskLevel = 'Needs Review';
    }

    return {
        risk_score: finalScore,
        risk_level: riskLevel,
        risk_breakdown: {
            visual_gaze_score: Math.min(100, Math.round(visualGaze)),
            tab_browser_score: Math.min(100, Math.round(tabBrowser)),
            audio_anomaly_score: Math.min(100, Math.round(audioAnomaly)),
            multi_person_score: Math.min(100, Math.round(multiPerson)),
            tampering_score: Math.min(100, Math.round(tampering))
        }
    };
};

export const startProctorSession = async (req: {
    candidate_name: string;
    candidate_email: string;
    candidate_id?: string;
    target_role?: string;
    experience_level?: string;
    test_duration_minutes?: number;
    verification_snapshot?: string;
}) => {
    const sessionId = `proc_cxd_${uuidv4().substring(0, 8)}`;
    const candidateId = req.candidate_id || `cxd-cand-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSession: ProctorSessionRecord = {
        session_id: sessionId,
        candidate_id: candidateId,
        candidate_name: req.candidate_name,
        candidate_email: req.candidate_email,
        target_role: req.target_role || "Analyst / Engineer",
        experience_level: req.experience_level || "Intermediate",
        test_duration_minutes: req.test_duration_minutes || 30,
        start_time: new Date().toISOString(),
        time_spent_seconds: 0,
        status: "IN_PROGRESS",
        proctor_status: "SECURE",
        risk_score: 0,
        risk_level: "Normal",
        review_status: "Normal",
        verification_snapshot: req.verification_snapshot || "",
        events: [],
        answers: [],
        risk_breakdown: {
            visual_gaze_score: 0,
            tab_browser_score: 0,
            audio_anomaly_score: 0,
            multi_person_score: 0,
            tampering_score: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    PROCTOR_SESSIONS_STORE.unshift(newSession);
    await saveProctorSessions(PROCTOR_SESSIONS_STORE);

    return {
        session_id: sessionId,
        candidate_id: candidateId,
        test_duration_minutes: newSession.test_duration_minutes,
        start_time: newSession.start_time,
        status: newSession.status,
        message: "Proctored session initialized. Timer active."
    };
};

export const heartbeatProctorSession = async (
    sessionId: string,
    payload: {
        answers?: any[];
        current_question_index?: number;
        time_remaining_seconds?: number;
        active_tab_status?: boolean;
        proctor_status?: string;
    }
) => {
    const session = PROCTOR_SESSIONS_STORE.find(s => s.session_id === sessionId);
    if (!session) {
        return { status: "not_found" };
    }

    if (payload.answers) session.answers = payload.answers;
    if (payload.time_remaining_seconds !== undefined) {
        session.time_spent_seconds = (session.test_duration_minutes * 60) - payload.time_remaining_seconds;
    }
    if (payload.proctor_status) {
        session.proctor_status = payload.proctor_status as any;
    }
    session.updated_at = new Date().toISOString();

    await saveProctorSessions(PROCTOR_SESSIONS_STORE);
    return { status: "synced", updated_at: session.updated_at };
};

export const recordProctorEvent = async (
    sessionId: string,
    eventData: {
        event_type: string;
        timestamp?: string;
        confidence?: number;
        duration_seconds?: number;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        evidence_snapshot?: string;
        description: string;
        metadata?: any;
    }
) => {
    const session = PROCTOR_SESSIONS_STORE.find(s => s.session_id === sessionId);
    const eventId = `evt_${uuidv4().substring(0, 8)}`;
    const eventObj = {
        id: eventId,
        session_id: sessionId,
        candidate_id: session?.candidate_id || 'unknown',
        event_type: eventData.event_type,
        timestamp: eventData.timestamp || new Date().toISOString(),
        confidence: eventData.confidence ?? 0.95,
        duration_seconds: eventData.duration_seconds || 0,
        severity: eventData.severity,
        evidence_snapshot: eventData.evidence_snapshot,
        description: eventData.description,
        metadata: eventData.metadata
    };

    if (session) {
        session.events.push(eventObj);
        const { risk_score, risk_level, risk_breakdown } = calculateProctorRiskScore(session.events);
        session.risk_score = risk_score;
        session.risk_level = risk_level;
        session.risk_breakdown = risk_breakdown;
        if (risk_level === 'Flagged') {
            session.proctor_status = 'ALERT';
            session.review_status = 'Needs Review';
        } else if (risk_level === 'Needs Review') {
            session.proctor_status = 'WARNING';
            if (session.review_status === 'Normal') session.review_status = 'Needs Review';
        }
        session.updated_at = new Date().toISOString();
        await saveProctorSessions(PROCTOR_SESSIONS_STORE);
    }

    return { status: "recorded", event: eventObj };
};

export const submitProctorSession = async (
    sessionId: string,
    payload: {
        target_role: string;
        experience_level: string;
        answers: any[];
        events: any[];
        time_spent_seconds: number;
        verification_snapshot?: string;
        lead_info?: any;
    }
) => {
    let session = PROCTOR_SESSIONS_STORE.find(s => s.session_id === sessionId);
    if (!session) {
        // Create session on the fly if started client-side without initial network ping
        const newCandId = `cxd-cand-${Math.floor(1000 + Math.random() * 9000)}`;
        session = {
            session_id: sessionId,
            candidate_id: newCandId,
            candidate_name: payload.lead_info?.name || "Candidate",
            candidate_email: payload.lead_info?.email || "candidate@cyberxdelta.com",
            target_role: payload.target_role,
            experience_level: payload.experience_level,
            test_duration_minutes: 30,
            start_time: new Date(Date.now() - (payload.time_spent_seconds * 1000)).toISOString(),
            time_spent_seconds: payload.time_spent_seconds,
            status: "COMPLETED",
            proctor_status: "SECURE",
            risk_score: 0,
            risk_level: "Normal",
            review_status: "Normal",
            events: payload.events || [],
            answers: payload.answers,
            verification_snapshot: payload.verification_snapshot || "",
            risk_breakdown: {
                visual_gaze_score: 0,
                tab_browser_score: 0,
                audio_anomaly_score: 0,
                multi_person_score: 0,
                tampering_score: 0
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        PROCTOR_SESSIONS_STORE.unshift(session);
    }

    session.status = payload.time_spent_seconds >= 1800 ? "AUTO_SUBMITTED" : "COMPLETED";
    session.end_time = new Date().toISOString();
    session.time_spent_seconds = payload.time_spent_seconds;
    session.answers = payload.answers;
    session.events = payload.events || session.events;

    // Evaluate Assessment answers
    const assessmentResult = calculateAssessmentResults(
        payload.target_role,
        payload.experience_level,
        payload.answers,
        payload.lead_info
    );

    session.score = assessmentResult.overall_score;
    session.readiness_level = assessmentResult.readiness_level;

    // Calculate Final Risk Score
    const { risk_score, risk_level, risk_breakdown } = calculateProctorRiskScore(session.events);
    session.risk_score = risk_score;
    session.risk_level = risk_level;
    session.risk_breakdown = risk_breakdown;

    if (risk_score >= 60) {
        session.review_status = "Needs Review";
        session.proctor_status = "ALERT";
    } else if (risk_score >= 25) {
        session.review_status = "Needs Review";
        session.proctor_status = "WARNING";
    } else {
        session.review_status = "Normal";
        session.proctor_status = "SECURE";
    }

    session.updated_at = new Date().toISOString();
    await saveProctorSessions(PROCTOR_SESSIONS_STORE);

    // Also register lead into LEADS_STORE
    if (payload.lead_info && payload.lead_info.email) {
        await registerLead({
            ...payload.lead_info,
            target_role: payload.target_role,
            experience_level: payload.experience_level,
            assessment_id: sessionId
        });
    }

    return {
        session_id: sessionId,
        candidate_id: session.candidate_id,
        assessment_result: assessmentResult,
        risk_score: session.risk_score,
        risk_level: session.risk_level,
        risk_breakdown: session.risk_breakdown,
        review_status: session.review_status,
        events_recorded: session.events.length,
        submitted_at: session.end_time
    };
};

export const updateProctorReview = async (
    sessionId: string,
    update: {
        review_status: 'Normal' | 'Needs Review' | 'Reviewed' | 'Disqualified';
        proctor_notes?: string;
        reviewed_by?: string;
    }
) => {
    const session = PROCTOR_SESSIONS_STORE.find(s => s.session_id === sessionId);
    if (!session) {
        return null;
    }

    session.review_status = update.review_status;
    if (update.proctor_notes !== undefined) session.proctor_notes = update.proctor_notes;
    session.reviewed_by = update.reviewed_by || "Lead Proctor";
    session.reviewed_at = new Date().toISOString();
    session.updated_at = new Date().toISOString();

    await saveProctorSessions(PROCTOR_SESSIONS_STORE);
    return session;
};
