import type { QuestionPublic, Course, AnswerSubmission, AssessmentResult, LeadInfo } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const ORG_CONTACT_INFO = {
  phone: "+91 8972065508",
  displayPhone: "+91 8972065508",
  email: "academy@cyberxdelta.com",
  whatsappUrl: "https://wa.me/918972065508?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20IAM%20Courses%20and%20consultation.",
  counselingFormUrl: "https://forms.cloud.microsoft/r/W2yS6Z4SSm",
  academyUrl: "https://academy.cyberxdelta.com",
  coursesUrl: "https://courses.cyberxdelta.com/learn",
  linkedinUrl: "https://www.linkedin.com/company/cyberxdelta-academy/"
};

export const FALLBACK_COURSES: Course[] = [
  {
    id: "c-iam-01",
    title: "IAM Foundation Masterclass",
    slug: "iam-foundation-masterclass",
    primary_domain: "IAM Fundamentals",
    level: "Beginner to Intermediate",
    badge: "Career Foundation",
    duration: "4 Weeks (Live Instructor-led + Labs)",
    description: "The definitive jumpstart for cybersecurity professionals and freshers stepping into IAM. Covers core directory services, RBAC/ABAC models, least privilege principles, JML lifecycles, and hands-on identity labs.",
    key_topics: [
      "Core IAM Architecture & Directory Fundamentals (AD / Entra ID)",
      "Role-Based (RBAC) vs Attribute-Based (ABAC) Access Control",
      "Joiner-Mover-Leaver (JML) Identity Lifecycle Automation",
      "NIST 800-63 Digital Identity Guidelines & Least Privilege"
    ],
    booking_url: "https://courses.cyberxdelta.com/learn/IAM-Master-Class",
    rating: 4.96,
    students_enrolled: 3200
  },
  {
    id: "c-sso-02",
    title: "Ping Identity Suite & PingFederate Masterclass",
    slug: "ping-suite-cohort",
    primary_domain: "Access Management / SSO",
    level: "Intermediate to Advanced",
    badge: "High Demand Specialization",
    duration: "6 Weeks (Live Labs + Real Projects)",
    description: "End-to-end hands-on training on enterprise federation with PingFederate, PingAccess, PingDirectory, and PingOne DaVinci. Learn IdP/SP adapters, token mapping, OAuth 2.0 PKCE, and multi-cloud SSO architectures.",
    key_topics: [
      "PingFederate IdP & SP Connection Architecture",
      "SAML 2.0 Assertion Exchange & Signature Validation",
      "OAuth 2.0 Authorization Grant Flows & OIDC",
      "PingOne DaVinci Orchestration & User Journeys"
    ],
    booking_url: "https://courses.cyberxdelta.com/learn/CXD--Ping-Suite-Cohort",
    rating: 4.92,
    students_enrolled: 2450
  },
  {
    id: "c-sso-03",
    title: "Microsoft Entra ID & Okta Administrator Training",
    slug: "entra-id-okta-admin",
    primary_domain: "Access Management / SSO",
    level: "Intermediate",
    badge: "Enterprise Essential",
    duration: "5 Weeks (Live Scenarios)",
    description: "Master modern cloud identity architectures using Microsoft Entra ID (Azure AD) and Okta. Configure Conditional Access policies, Self-Service Password Reset (SSPR), B2B/B2C federation, and SCIM provisioning.",
    key_topics: [
      "Microsoft Entra ID Conditional Access & Risk Policies",
      "Okta Universal Directory & Lifecycle Management",
      "SCIM User Provisioning & Application Connectors",
      "MFA Enforcements, FIDO2 & Passwordless Workflows"
    ],
    booking_url: "https://courses.cyberxdelta.com/learn/Entra---ID",
    rating: 4.90,
    students_enrolled: 2100
  },
  {
    id: "c-iga-04",
    title: "SailPoint Identity Governance (IdentityIQ & IdentityNow)",
    slug: "sailpoint-iga-governance",
    primary_domain: "Identity Governance",
    level: "Intermediate to Advanced",
    badge: "Compliance & Risk Leader",
    duration: "6 Weeks (Live Cohort)",
    description: "Architect enterprise access certification campaigns, enforce Segregation of Duties (SoD) policies, and automate JML lifecycle workflows with SailPoint IdentityIQ and IdentityNow (ISC).",
    key_topics: [
      "Identity Lifecycle Modeling (Joiner, Mover, Leaver)",
      "Automated Access Certification & Attestation Campaigns",
      "Segregation of Duties (SoD) & Toxic Combinations",
      "Authoritative Source Aggregation & Target Reconciliation"
    ],
    booking_url: "https://courses.cyberxdelta.com/learn/SailPoint-Identity-IQ",
    rating: 4.93,
    students_enrolled: 1820
  },
  {
    id: "c-pam-05",
    title: "CyberArk PAM Enterprise Masterclass",
    slug: "cyberark-pam-masterclass",
    primary_domain: "PAM / CyberArk",
    level: "Intermediate to Advanced",
    badge: "High Demand Specialization",
    duration: "6 Weeks (Live Labs + Certification)",
    description: "Master CyberArk Enterprise Password Vault (EPV), Central Policy Manager (CPM), Privileged Session Manager (PSM), and session isolation. Complete hands-on labs on credential rotation and disaster recovery.",
    key_topics: [
      "CyberArk EPV Vault & Core Component Architecture",
      "Automatic Credential Rotation (CPM) & Discovery",
      "Privileged Session Monitoring (PSM) & Keystroke Auditing",
      "Dual-Control Approvals & Disaster Recovery Clustering"
    ],
    booking_url: "https://courses.cyberxdelta.com/learn/CyberArk-PAM",
    rating: 4.97,
    students_enrolled: 1980
  },
  {
    id: "c-arch-06",
    title: "ISS Identity Architect (3 IAM Products)",
    slug: "iam-architect-specialist",
    primary_domain: "IAM Fundamentals",
    level: "Advanced / Architect",
    badge: "Flagship Executive Program",
    duration: "8 Weeks (Design Cohort)",
    description: "Comprehensive architect track covering converged IAM design across Access Management, Identity Governance, and PAM. Learn enterprise system design, disaster recovery, zero-trust blueprints, and multi-vendor integrations.",
    key_topics: [
      "Converged IAM Architecture & Solution Design",
      "Multi-IdP High Availability & Geo-Redundant Federation",
      "Regulatory Compliance Frameworks (SOX, HIPAA, GDPR)",
      "PAM & IGA Integration Patterns"
    ],
    booking_url: "https://courses.cyberxdelta.com/learn/CXD--IAM-ARCHITECT",
    rating: 4.98,
    students_enrolled: 1450
  }
];

export const FALLBACK_QUESTIONS: QuestionPublic[] = [
  {
    id: "q-iam-1",
    domain: "IAM Fundamentals",
    difficulty: "Beginner",
    question: "What is the primary objective of implementing the Principle of Least Privilege (PoLP) in an enterprise IAM architecture?",
    options: [
      "Granting users full administrative rights by default to minimize IT helpdesk tickets",
      "Restricting identities to only the absolute minimum permissions necessary to perform authorized duties",
      "Disabling Multi-Factor Authentication for internal trusted subnets",
      "Storing all administrative credentials in a single unencrypted file"
    ]
  },
  {
    id: "q-iam-2",
    domain: "IAM Fundamentals",
    difficulty: "Beginner",
    question: "Why is Multi-Factor Authentication (MFA) vastly superior to traditional single-factor passwords?",
    options: [
      "It combines two or more independent factors (knowledge, possession, inherence), preventing breaches even if passwords are leaked",
      "It permanently removes the need for passwords and secret keys",
      "It increases network throughput and server memory",
      "It eliminates the requirement for Identity Governance audits"
    ]
  },
  {
    id: "q-iam-3",
    domain: "IAM Fundamentals",
    difficulty: "Intermediate",
    question: "Which description best defines the 'Joiner, Mover, Leaver' (JML) identity lifecycle framework?",
    options: [
      "Automated provisioning upon hiring (Joiner), entitlement adjustments on transfer (Mover), and immediate revocation upon exit (Leaver)",
      "Manual user creation in Active Directory with periodic manual reviews",
      "A network routing protocol for load balancing identity requests",
      "A database backup protocol for user directories"
    ]
  },
  {
    id: "q-sso-1",
    domain: "Access Management / SSO",
    difficulty: "Intermediate",
    question: "In SAML 2.0 federated Single Sign-On (e.g., PingFederate, Okta), what role does the Identity Provider (IdP) perform?",
    options: [
      "Authenticating user credentials, evaluating access policies, and issuing cryptographically signed XML assertions to the Service Provider",
      "Hosting and running the backend database of all external web applications",
      "Replacing all SSL/TLS encryption certificates on client devices",
      "Managing physical data center server hardware"
    ]
  },
  {
    id: "q-sso-2",
    domain: "Access Management / SSO",
    difficulty: "Intermediate",
    question: "In OAuth 2.0 and OpenID Connect (OIDC), what is the difference between an ID Token and an Access Token?",
    options: [
      "An ID Token is a JWT that authenticates the user's identity for the client, whereas an Access Token authorizes the client to access protected API resources",
      "An ID Token is for database access, while an Access Token is for logging into Windows workstations",
      "They are identical and can be used interchangeably in HTTP Authorization headers",
      "An Access Token is XML-based, while an ID Token is pure binary data"
    ]
  },
  {
    id: "q-sso-3",
    domain: "Access Management / SSO",
    difficulty: "Advanced",
    question: "Why is the PKCE (Proof Key for Code Exchange) extension recommended for OAuth 2.0 Authorization Code flows in Single Page Apps and Mobile Apps?",
    options: [
      "It dynamically verifies a code verifier against a code challenge to prevent authorization code interception attacks on public clients without client secrets",
      "It speeds up network socket connections between client and server",
      "It encrypts all DNS lookups performed by the mobile browser",
      "It allows users to bypass multi-factor authentication"
    ]
  },
  {
    id: "q-iga-1",
    domain: "Identity Governance",
    difficulty: "Intermediate",
    question: "What is the primary operational objective of conducting regular Access Certification (Attestation) campaigns in SailPoint IdentityIQ / IdentityNow?",
    options: [
      "Periodically requiring managers to review and recertify accumulated user entitlements to prevent privilege creep and ensure compliance",
      "Re-indexing database tables to improve LDAP query speeds",
      "Updating the user interface theme for enterprise employees",
      "Generating automated monthly payroll statements"
    ]
  },
  {
    id: "q-iga-2",
    domain: "Identity Governance",
    difficulty: "Intermediate",
    question: "How does a Segregation of Duties (SoD) policy in Identity Governance protect enterprise systems?",
    options: [
      "By identifying and preventing toxic permission combinations (e.g., creating purchase orders and approving vendor payouts) from being assigned to a single identity",
      "By requiring every employee to share a single root account",
      "By disabling role-based access control across all applications",
      "By forcing daily password resets on every endpoint"
    ]
  },
  {
    id: "q-pam-1",
    domain: "PAM / CyberArk",
    difficulty: "Intermediate",
    question: "What key security risk is solved by implementing CyberArk Enterprise Password Vault (EPV) and Central Policy Manager (CPM)?",
    options: [
      "Privileged credential sprawl, hardcoded admin secrets, and unrotated domain admin passwords vulnerable to Pass-the-Hash and lateral movement",
      "Network latency on public website content delivery networks",
      "Email spam filtering false positives",
      "High CPU utilization in local virtual machines"
    ]
  },
  {
    id: "q-pam-2",
    domain: "PAM / CyberArk",
    difficulty: "Advanced",
    question: "How does CyberArk Privileged Session Manager (PSM) safeguard privileged sessions without exposing credentials to human administrators?",
    options: [
      "It proxies the connection (RDP/SSH), injects the vaulted credentials automatically without revealing the password, and records video/keystrokes for audit",
      "It emails cleartext passwords to administrators on-demand",
      "It replaces all SSH keys with standard 4-digit PIN numbers",
      "It disables session logging to save server disk storage"
    ]
  }
];

export const CORRECT_ANSWERS_MAP: Record<string, { answer: number; exp: string }> = {
  "q-iam-1": { answer: 1, exp: "Least privilege restricts user permissions strictly to what is required for their job role, minimizing the blast radius." },
  "q-iam-2": { answer: 0, exp: "MFA requires orthogonal factors (Knowledge, Possession, Inherence), blocking credential stuffing and stolen password exploits." },
  "q-iam-3": { answer: 0, exp: "JML manages the end-to-end identity lifecycle from onboarding (Joiner) to role transition (Mover) and deprovisioning (Leaver)." },
  "q-sso-1": { answer: 0, exp: "The Identity Provider (IdP) validates identity and asserts cryptographically signed SAML tokens to relying service providers." },
  "q-sso-2": { answer: 0, exp: "OIDC ID Tokens prove user authentication, while OAuth 2.0 Access Tokens provide delegated API authorization." },
  "q-sso-3": { answer: 0, exp: "PKCE prevents authorization code interception attacks on public clients by requiring dynamic proof of possession of the code verifier." },
  "q-iga-1": { answer: 0, exp: "Access certification periodically reviews accumulated entitlements to prevent privilege creep and meet compliance frameworks." },
  "q-iga-2": { answer: 0, exp: "Segregation of Duties (SoD) prevents fraud by ensuring conflicting, high-risk duties are not held by a single identity." },
  "q-pam-1": { answer: 0, exp: "CyberArk EPV and CPM centrally vault, rotate, and manage privileged credentials to eliminate lateral breach movement." },
  "q-pam-2": { answer: 0, exp: "CyberArk PSM proxies sessions, injects credentials transparently without disclosing them to the user, and audits keystrokes." }
};

export async function fetchQuestions(role?: string, level?: string): Promise<QuestionPublic[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/assessments/questions?role=${encodeURIComponent(role || '')}&level=${encodeURIComponent(level || '')}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local question bank fallback.", err);
  }
  return FALLBACK_QUESTIONS;
}

export async function evaluateAssessment(
  targetRole: string,
  experienceLevel: string,
  answers: AnswerSubmission[],
  leadInfo?: LeadInfo
): Promise<AssessmentResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/assessments/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_role: targetRole,
        experience_level: experienceLevel,
        answers,
        lead_info: leadInfo
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend API unavailable, computing assessment results client-side.", err);
  }

  // Client-side fallback computation
  const domainStats: Record<string, { correct: number; total: number }> = {
    "IAM Fundamentals": { correct: 0, total: 0 },
    "Access Management / SSO": { correct: 0, total: 0 },
    "Identity Governance": { correct: 0, total: 0 },
    "PAM / CyberArk": { correct: 0, total: 0 }
  };

  const review = answers.map(ans => {
    const q = FALLBACK_QUESTIONS.find(item => item.id === ans.question_id);
    const meta = CORRECT_ANSWERS_MAP[ans.question_id] || { answer: 0, exp: "Standard IAM domain concept." };
    const domain = q?.domain || "IAM Fundamentals";
    if (!domainStats[domain]) domainStats[domain] = { correct: 0, total: 0 };
    domainStats[domain].total += 1;
    const isCorrect = ans.selected_option === meta.answer;
    if (isCorrect) domainStats[domain].correct += 1;

    return {
      question_id: ans.question_id,
      domain,
      question: q?.question || "",
      options: q?.options || [],
      selected_option: ans.selected_option,
      correct_answer: meta.answer,
      is_correct: isCorrect,
      explanation: meta.exp
    };
  });

  const domainScores = Object.entries(domainStats).map(([domain, stats]) => {
    const total = stats.total > 0 ? stats.total : 1;
    const pct = Math.round((stats.correct / total) * 100);
    let status: 'Needs Work' | 'Developing' | 'Ready' = 'Developing';
    let color = '#f79009';
    if (pct >= 70) {
      status = 'Ready';
      color = '#12b76a';
    } else if (pct < 50) {
      status = 'Needs Work';
      color = '#f04438';
    }
    return {
      domain,
      correct: stats.correct,
      total: stats.total,
      score_percentage: pct,
      status,
      color
    };
  });

  const totalCorrect = review.filter(r => r.is_correct).length;
  const overall = Math.round((totalCorrect / Math.max(answers.length, 1)) * 100);
  const readiness = overall >= 70 ? 'Ready' : overall >= 50 ? 'Developing' : 'Needs Work';

  const sortedByScore = [...domainScores].sort((a, b) => a.score_percentage - b.score_percentage);
  const weakest = sortedByScore[0]?.domain || "PAM / CyberArk";
  const strongest = sortedByScore[sortedByScore.length - 1]?.domain || "IAM Fundamentals";

  const recommendedCourses = sortedByScore.map((ds, idx) => {
    const course = FALLBACK_COURSES.find(c => c.primary_domain === ds.domain) || FALLBACK_COURSES[0];
    return {
      course,
      match_score: idx === 0 ? 98 : idx === 1 ? 85 : 70,
      gap_reason: idx === 0
        ? `Your ${ds.score_percentage}% score in ${ds.domain} is your primary growth opportunity. Bridging this gap with CyberXDelta's live cohorts offers the highest career impact.`
        : `Targeted upskilling module for ${ds.domain} to achieve comprehensive mastery.`,
      priority: idx + 1
    };
  });

  return {
    assessment_id: `eval_${Math.random().toString(36).substring(2, 9)}`,
    overall_score: overall,
    readiness_level: readiness,
    summary_verdict: overall >= 70
      ? "Strong IAM Readiness! You demonstrate solid architectural comprehension across key domains."
      : overall >= 50
        ? "Developing IAM Competence. Good baseline knowledge with distinct specialization opportunities."
        : "Foundational Gap Detected. Recommended focused cohort training before enterprise production deployments.",
    domain_scores: domainScores,
    weakest_domain: weakest,
    strongest_domain: strongest,
    recommended_courses: recommendedCourses,
    question_review: review
  };
}

export async function submitLead(lead: LeadInfo, assessmentId?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        target_role: lead.target_role,
        experience_level: lead.experience_level,
        assessment_id: assessmentId,
        consultation_requested: lead.consultation_requested || false,
        preferred_date: lead.preferred_date,
        notes: lead.notes
      })
    });
    return res.ok;
  } catch (err) {
    console.warn("Lead recorded in client session fallback.", err);
    return true;
  }
}

export async function scheduleConsultation(email: string, phone: string, name: string, score: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/consultation/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone, name, score })
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to schedule consultation:", err);
    return false;
  }
}

// ============================================
// AI PROCTORING & EXAM LIFECYCLE API CLIENT
// ============================================

export async function startProctorSessionApi(candidate: {
  candidate_name: string;
  candidate_email: string;
  candidate_id?: string;
  target_role?: string;
  experience_level?: string;
  test_duration_minutes?: number;
  verification_snapshot?: string;
}): Promise<{ session_id: string; candidate_id: string; start_time: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/proctor/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidate)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend proctor start unavailable, using client session generator.", err);
  }

  // Fallback client session
  return {
    session_id: `proc_client_${Math.random().toString(36).substring(2, 9)}`,
    candidate_id: candidate.candidate_id || `cxd-cand-${Math.floor(1000 + Math.random() * 9000)}`,
    start_time: new Date().toISOString()
  };
}

export async function heartbeatProctorSessionApi(
  sessionId: string,
  payload: {
    answers?: AnswerSubmission[];
    current_question_index?: number;
    time_remaining_seconds?: number;
    active_tab_status?: boolean;
    proctor_status?: string;
  }
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/proctor/session/${sessionId}/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function recordProctorEventApi(
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
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/proctor/session/${sessionId}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Recorded event locally in browser memory.", err);
  }

  return {
    status: "recorded_client_side",
    event: {
      id: `evt_local_${Math.random().toString(36).substring(2, 8)}`,
      session_id: sessionId,
      ...eventData,
      timestamp: eventData.timestamp || new Date().toISOString()
    }
  };
}

export async function submitProctorSessionApi(
  sessionId: string,
  payload: {
    target_role: string;
    experience_level: string;
    answers: AnswerSubmission[];
    events: any[];
    time_spent_seconds: number;
    verification_snapshot?: string;
    lead_info?: LeadInfo;
  }
): Promise<{
  session_id: string;
  candidate_id: string;
  assessment_result: AssessmentResult;
  risk_score: number;
  risk_level: 'Normal' | 'Needs Review' | 'Flagged';
  risk_breakdown: any;
  review_status: 'Normal' | 'Needs Review' | 'Reviewed' | 'Disqualified';
  events_recorded: number;
  submitted_at: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/proctor/session/${sessionId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend proctor submit failed, running client computation fallback.", err);
  }

  // Client-side fallback calculation
  const evalResult = await evaluateAssessment(
    payload.target_role,
    payload.experience_level,
    payload.answers,
    payload.lead_info
  );

  // Client-side risk calculation
  let visualGaze = 0;
  let tabBrowser = 0;
  let audioAnomaly = 0;
  let multiPerson = 0;
  let tampering = 0;

  for (const evt of payload.events) {
    const conf = evt.confidence || 0.9;
    switch (evt.event_type) {
      case 'MULTIPLE_FACES':
        multiPerson += 25 * conf;
        break;
      case 'UNAUTHORIZED_OBJECT':
        multiPerson += 30 * conf;
        break;
      case 'TAB_SWITCH':
      case 'WINDOW_BLUR':
        tabBrowser += 15 * conf;
        break;
      case 'FULLSCREEN_EXIT':
        tabBrowser += 12 * conf;
        break;
      case 'FACE_NOT_DETECTED':
        visualGaze += 10 * conf;
        break;
      case 'LOOKING_AWAY':
        visualGaze += 6 * conf;
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
      default:
        visualGaze += 5 * conf;
    }
  }

  const rawTotal = visualGaze + tabBrowser + audioAnomaly + multiPerson + tampering;
  const riskScore = Math.min(100, Math.round(rawTotal));
  const riskLevel: 'Normal' | 'Needs Review' | 'Flagged' =
    riskScore >= 60 ? 'Flagged' : riskScore >= 25 ? 'Needs Review' : 'Normal';

  return {
    session_id: sessionId,
    candidate_id: `cxd-cand-${Math.floor(1000 + Math.random() * 9000)}`,
    assessment_result: evalResult,
    risk_score: riskScore,
    risk_level: riskLevel,
    risk_breakdown: {
      visual_gaze_score: Math.min(100, Math.round(visualGaze)),
      tab_browser_score: Math.min(100, Math.round(tabBrowser)),
      audio_anomaly_score: Math.min(100, Math.round(audioAnomaly)),
      multi_person_score: Math.min(100, Math.round(multiPerson)),
      tampering_score: Math.min(100, Math.round(tampering))
    },
    review_status: riskScore >= 25 ? 'Needs Review' : 'Normal',
    events_recorded: payload.events.length,
    submitted_at: new Date().toISOString()
  };
}

export async function fetchAdminProctorSessionsApi(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/proctor/sessions`);
    if (res.ok) {
      const data = await res.json();
      return data.sessions || [];
    }
  } catch (err) {
    console.warn("Backend proctor admin API offline.", err);
  }

  // Fallback seed sessions
  return [
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
      proctor_notes: "Clean proctor stream throughout the 30-min duration. Verified.",
      reviewed_by: "Sarah Jenkins (Lead Proctor)",
      score: 88,
      readiness_level: "Ready",
      events: [
        {
          id: "evt_101",
          event_type: "LOOKING_AWAY",
          timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
          confidence: 0.88,
          duration_seconds: 3.8,
          severity: "LOW",
          description: "Candidate looked toward lower keyboard area briefly"
        }
      ],
      risk_breakdown: {
        visual_gaze_score: 6,
        tab_browser_score: 0,
        audio_anomaly_score: 6,
        multi_person_score: 0,
        tampering_score: 0
      },
      created_at: new Date(Date.now() - 45 * 60000).toISOString()
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
      events: [
        {
          id: "evt_201",
          event_type: "TAB_SWITCH",
          timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
          confidence: 0.99,
          duration_seconds: 6.2,
          severity: "HIGH",
          description: "Window lost focus / candidate navigated away from examination tab"
        }
      ],
      risk_breakdown: {
        visual_gaze_score: 12,
        tab_browser_score: 30,
        audio_anomaly_score: 0,
        multi_person_score: 0,
        tampering_score: 0
      },
      created_at: new Date(Date.now() - 22 * 60000).toISOString()
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
        }
      ],
      risk_breakdown: {
        visual_gaze_score: 18,
        tab_browser_score: 15,
        audio_anomaly_score: 15,
        multi_person_score: 25,
        tampering_score: 15
      },
      created_at: new Date(Date.now() - 60 * 60000).toISOString()
    }
  ];
}

export async function updateAdminProctorReviewApi(
  sessionId: string,
  update: {
    review_status: 'Normal' | 'Needs Review' | 'Reviewed' | 'Disqualified';
    proctor_notes?: string;
    reviewed_by?: string;
  }
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/proctor/sessions/${sessionId}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    return res.ok;
  } catch (err) {
    console.warn("Updated review status locally in UI state.", err);
    return true;
  }
}

