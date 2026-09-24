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

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [selectedRole, setSelectedRole] = useState<string>('Analyst / Engineer');
  const [questions, setQuestions] = useState<QuestionPublic[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  
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
    setLoading(true);
    setCandidateProfile(profile);
    setMediaStream(stream);

    try {
      // Fetch relevant questions for target role
      const qList = await fetchQuestions(profile.targetRole, profile.experienceLevel);
      setQuestions(qList);

      // Initialize proctor session with backend
      const session = await startProctorSessionApi({
        candidate_name: profile.name,
        candidate_email: profile.email,
        candidate_id: profile.candidateId,
        target_role: profile.targetRole,
        experience_level: profile.experienceLevel,
        test_duration_minutes: 30,
        verification_snapshot: profile.photoSnapshot
      });

      setSessionId(session.session_id);
      setCurrentScreen('quiz');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error("Exam init error:", e);
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

  // Reset / Retake
  const handleReset = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
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
            onRetake={handleReset}
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
