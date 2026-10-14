import { useState } from 'react';
import type { 
  ScreenType, QuestionPublic, AnswerSubmission, AssessmentResult, 
  LeadInfo, CandidateProfile, ProctorEvent, RiskBreakdown 
} from './types';
import { fetchQuestions, startProctorSessionApi, submitProctorSessionApi } from './services/api';
import { Header } from './components/Header';
import { Landing } from './components/Landing';
import { RoleSelect } from './components/RoleSelect';
import { PreTestVerification } from './components/PreTestVerification';
import { ExamEngine } from './components/ExamEngine';
import { ResultsDashboard } from './components/ResultsDashboard';
import { AdminProctorCenter } from './components/AdminProctorCenter';

const MAX_RETAKES = 3;

const getStoredRetakes = (email?: string): number => {
  if (!email) return 0;
  try {
    const val = localStorage.getItem(`cxd_retakes_${email.trim().toLowerCase()}`);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
};

const storeRetakes = (email: string, count: number) => {
  if (!email) return;
  try {
    localStorage.setItem(`cxd_retakes_${email.trim().toLowerCase()}`, count.toString());
  } catch {}
};

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [selectedRole, setSelectedRole] = useState<string>('Analyst / Engineer');
  const [questions, setQuestions] = useState<QuestionPublic[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [retakeCount, setRetakeCount] = useState<number>(0);
  
  // Evaluation & Results State
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [submittedLead, setSubmittedLead] = useState<LeadInfo | null>(null);
  const [proctorEvents, setProctorEvents] = useState<ProctorEvent[]>([]);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<'Normal' | 'Needs Review' | 'Flagged'>('Normal');
  const [riskBreakdown, setRiskBreakdown] = useState<RiskBreakdown | undefined>(undefined);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // 1. Landing -> Go to Role Selection
  const handleGoToRoleSelect = () => {
    setCurrentScreen('role');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Role Chosen -> Go to Pre-Test Verification Wizard
  const handleRoleChosen = (role: string) => {
    setSelectedRole(role);
    setCurrentScreen('precheck');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Pre-Test Verification Completed -> Initialize Session and Launch 30-Min Exam
  const handleVerificationComplete = async (profile: CandidateProfile, stream: MediaStream) => {
    const emailKey = profile.email?.trim().toLowerCase();
    const storedCount = getStoredRetakes(emailKey);
    const activeRetakes = Math.max(retakeCount, storedCount);

    if (activeRetakes > MAX_RETAKES) {
      alert("Maximum Retake Limit Reached!");
      return;
    }

    setRetakeCount(activeRetakes);
    setLoading(true);
    setCandidateProfile({ ...profile, retake_count: activeRetakes });
    setMediaStream(stream);

    try {
      // Dynamic question order: shuffle if this is a retake (activeRetakes > 0)
      const shouldShuffle = activeRetakes > 0;
      const qList = await fetchQuestions(profile.targetRole, profile.experienceLevel, shouldShuffle);
      setQuestions(qList);

      // Initialize proctor session with backend
      const session = await startProctorSessionApi({
        candidate_name: profile.name,
        candidate_email: profile.email,
        candidate_id: profile.candidateId,
        target_role: profile.targetRole,
        experience_level: profile.experienceLevel,
        test_duration_minutes: 30,
        verification_snapshot: profile.photoSnapshot,
        retake_count: activeRetakes
      });

      setSessionId(session.session_id);
      setCurrentScreen('quiz');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      console.error("Exam init error:", e);
      if (e?.message?.includes("Maximum retake limit")) {
        alert(e.message);
      }
    }
    setLoading(false);
  };

  // 4. Exam Finished (Manual or Auto-submission at 00:00) -> Calculate Results & Risk
  const handleFinishExam = async (submission: {
    answers: AnswerSubmission[];
    events: ProctorEvent[];
    timeSpentSeconds: number;
    verificationSnapshot?: string;
  }) => {
    setLoading(true);
    try {
      const leadInfo: LeadInfo = {
        name: candidateProfile?.name || 'Candidate',
        email: candidateProfile?.email || 'candidate@cyberxdelta.com',
        target_role: selectedRole,
        experience_level: candidateProfile?.experienceLevel || 'Intermediate (3-5 Years)'
      };

      const result = await submitProctorSessionApi(sessionId || `proc_${Date.now()}`, {
        target_role: selectedRole,
        experience_level: candidateProfile?.experienceLevel || 'Intermediate',
        answers: submission.answers,
        events: submission.events,
        time_spent_seconds: submission.timeSpentSeconds,
        verification_snapshot: submission.verificationSnapshot,
        lead_info: leadInfo
      });

      setAssessmentResult(result.assessment_result);
      setSubmittedLead(leadInfo);
      setProctorEvents(submission.events);
      setRiskScore(result.risk_score);
      setRiskLevel(result.risk_level);
      setRiskBreakdown(result.risk_breakdown);
      setTimeSpentSeconds(submission.timeSpentSeconds);

      setCurrentScreen('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error("Submission processing error:", e);
    }
    setLoading(false);
  };

  // Retake Test (Limit to 3 retakes; Retain candidate name & email, go to Pre-Test Verification)
  const handleRetake = () => {
    const emailKey = candidateProfile?.email?.trim().toLowerCase();
    const currentRetakes = emailKey ? Math.max(retakeCount, getStoredRetakes(emailKey)) : retakeCount;

    if (currentRetakes >= MAX_RETAKES) {
      alert("Maximum Retake Limit Reached!");
      return;
    }

    const nextRetakeCount = currentRetakes + 1;
    setRetakeCount(nextRetakeCount);
    if (emailKey) {
      storeRetakes(emailKey, nextRetakeCount);
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }

    // Reset session and assessment data for the fresh retake
    setQuestions([]);
    setAssessmentResult(null);
    setSubmittedLead(null);
    setProctorEvents([]);
    setRiskScore(0);
    setRiskLevel('Normal');
    setRiskBreakdown(undefined);
    setTimeSpentSeconds(0);
    setSessionId('');

    // Retain candidate name, email & selected role, navigate directly to Pre-Test Verification
    setCurrentScreen('precheck');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to Landing
  const handleReset = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setCurrentScreen('landing');
    setQuestions([]);
    setAssessmentResult(null);
    setSubmittedLead(null);
    setProctorEvents([]);
    setRiskScore(0);
    setTimeSpentSeconds(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="shell">
      <Header onReset={handleReset} onOpenAdmin={() => setIsAdminOpen(true)} />

      <main>
        {loading && (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: '#94a3b8' }}>
            <div className="spin" style={{ width: 44, height: 44, border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              Processing Proctored Security Telemetry...
            </p>
            <p style={{ fontSize: 13 }}>Initializing 30-minute test modules & computer vision engine</p>
          </div>
        )}

        {!loading && currentScreen === 'landing' && (
          <Landing onStartClick={handleGoToRoleSelect} />
        )}

        {!loading && currentScreen === 'role' && (
          <RoleSelect onContinue={handleRoleChosen} />
        )}

        {!loading && currentScreen === 'precheck' && (
          <PreTestVerification
            selectedRole={selectedRole}
            initialProfile={candidateProfile}
            retakeCount={retakeCount}
            maxRetakes={MAX_RETAKES}
            onVerificationComplete={handleVerificationComplete}
            onCancel={handleReset}
          />
        )}

        {!loading && currentScreen === 'quiz' && questions.length > 0 && candidateProfile && (
          <ExamEngine
            questions={questions}
            selectedRole={selectedRole}
            candidateProfile={candidateProfile}
            mediaStream={mediaStream}
            sessionId={sessionId}
            retakeCount={retakeCount}
            onFinishExam={handleFinishExam}
            onExit={handleReset}
          />
        )}

        {!loading && currentScreen === 'results' && assessmentResult && (
          <ResultsDashboard
            result={assessmentResult}
            leadInfo={submittedLead}
            events={proctorEvents}
            riskScore={riskScore}
            riskLevel={riskLevel}
            riskBreakdown={riskBreakdown}
            timeSpentSeconds={timeSpentSeconds}
            verificationSnapshot={candidateProfile?.photoSnapshot}
            retakeCount={retakeCount}
            maxRetakes={MAX_RETAKES}
            onRetake={handleRetake}
          />
        )}
      </main>

      {/* Standalone Admin / Proctor Command Center Modal */}
      <AdminProctorCenter
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}

export default App;

