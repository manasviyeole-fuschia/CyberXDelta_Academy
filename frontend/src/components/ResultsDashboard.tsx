import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, Printer, RotateCcw, Award, Lock, X, MessageCircle
} from 'lucide-react';
import type { AssessmentResult, LeadInfo, ProctorEvent, RiskBreakdown, Course } from '../types';
import { scheduleConsultation } from '../services/api';

interface ResultsDashboardProps {
  result: AssessmentResult;
  leadInfo?: LeadInfo | null;
  events?: ProctorEvent[];
  riskScore?: number;
  riskLevel?: 'Normal' | 'Needs Review' | 'Flagged';
  riskBreakdown?: RiskBreakdown;
  timeSpentSeconds?: number;
  verificationSnapshot?: string;
  onRetake: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  leadInfo,
  events = [],
  riskScore = 8,
  riskLevel = 'Normal',
  riskBreakdown = {
    visual_gaze_score: 4,
    tab_browser_score: 0,
    audio_anomaly_score: 4,
    multi_person_score: 0,
    tampering_score: 0
  },
  timeSpentSeconds = 1680,
  onRetake,
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'proctor' | 'review'>('skills');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lockedCourseModal, setLockedCourseModal] = useState<{ course: Course; matchScore: number } | null>(null);
  const [customWhatsappMsg, setCustomWhatsappMsg] = useState<string>(
    `Hello CyberXDelta Academy, I am ${leadInfo?.name || 'Candidate'}. I completed my IAM Assessment with a score of ${result.overall_score}% (${result.readiness_level} Readiness, Proctor Risk: ${riskScore}/100). I would like to discuss my personalized career roadmap and upcoming live masterclasses.`
  );

  const overallScore = result.overall_score;

  const handleBookCall = async () => {
    if (!leadInfo) return;
    setBookingStatus('loading');
    try {
      const success = await scheduleConsultation(
        leadInfo.email,
        leadInfo.phone || '',
        leadInfo.name || 'Candidate',
        overallScore
      );
      setBookingStatus(success ? 'success' : 'error');
    } catch {
      setBookingStatus('error');
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <section className="screen active" style={{ maxWidth: 1120, margin: '0 auto', padding: '10px 10px 40px' }}>
      
      {/* Top Results Banner - Minimal Subtle White */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e4e7ec',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#155eef', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Award size={14} />
            <span>CyberXDelta Examination Certification Report</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#101828', margin: '6px 0 4px' }}>
            IAM Assessment & Proctoring Audit
          </h2>
          <p style={{ color: '#475467', fontSize: 14, margin: 0 }}>
            Candidate: <strong>{leadInfo?.name || 'Verified Candidate'}</strong> ({leadInfo?.email || 'N/A'}) • Time Spent: {formatSeconds(timeSpentSeconds)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onRetake}
            style={{
              background: '#ffffff',
              border: '1px solid #d0d5dd',
              color: '#344054',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} /> Retake Test
          </button>
          <button
            onClick={() => window.print()}
            style={{
              background: '#155eef',
              border: 'none',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
            }}
          >
            <Printer size={14} /> Save Report / PDF
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs - Minimal */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 20,
        borderBottom: '1px solid #e4e7ec',
        paddingBottom: 10
      }}>
        <button
          onClick={() => setActiveTab('skills')}
          style={{
            background: activeTab === 'skills' ? '#eff8ff' : 'transparent',
            border: activeTab === 'skills' ? '1px solid #b2ddff' : '1px solid transparent',
            color: activeTab === 'skills' ? '#155eef' : '#475467',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📊 IAM Technical Readiness ({overallScore}%)
        </button>



        <button
          onClick={() => setActiveTab('review')}
          style={{
            background: activeTab === 'review' ? '#eff8ff' : 'transparent',
            border: activeTab === 'review' ? '1px solid #b2ddff' : '1px solid transparent',
            color: activeTab === 'review' ? '#155eef' : '#475467',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📝 Question Breakdown ({result.question_review.length})
        </button>
      </div>

      {/* TAB 1: IAM TECHNICAL READINESS */}
      {activeTab === 'skills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Dual Score & Domain Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            
            {/* Score Summary Box - Subtle White */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e4e7ec',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
            }}>
              <span style={{ background: '#eff8ff', color: '#155eef', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                Diagnostic Readiness Score
              </span>
              <div style={{
                fontSize: 48,
                fontWeight: 900,
                color: overallScore >= 70 ? '#12b76a' : overallScore >= 50 ? '#f79009' : '#f04438',
                margin: '12px 0'
              }}>
                {overallScore}%
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', marginBottom: 6 }}>
                {result.readiness_level} Level
              </div>
              <p style={{ fontSize: 13, color: '#475467', lineHeight: 1.5, margin: 0 }}>
                {result.summary_verdict}
              </p>
            </div>

            {/* Domain Strengths & Weaknesses */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e4e7ec',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#101828', marginBottom: 16 }}>
                Domain Proficiency Breakdown
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {result.domain_scores.map((ds, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: '#344054' }}>{ds.domain}</span>
                      <span style={{ color: ds.color, fontWeight: 700 }}>{ds.score_percentage}% ({ds.correct}/{ds.total})</span>
                    </div>
                    <div style={{ height: 8, background: '#f2f4f7', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${ds.score_percentage}%`,
                        background: ds.color,
                        borderRadius: 4
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Masterclass Cohorts */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e4e7ec',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#101828', marginBottom: 16 }}>
              🎯 Recommended Live Cohorts to Bridge Growth Gaps
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {result.recommended_courses.slice(0, 3).map((rec, idx) => (
                <div
                  key={idx}
                  onClick={() => setLockedCourseModal({ course: rec.course, matchScore: rec.match_score })}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #eaecf0',
                    borderRadius: 12,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#b2ccff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 24, 40, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#eaecf0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(16, 24, 40, 0.04)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ background: '#eff8ff', color: '#155eef', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                        {rec.course.badge}
                      </span>
                      <span style={{ fontSize: 12, color: '#027a48', fontWeight: 700 }}>{rec.match_score}% Gap Match</span>
                    </div>
                    <strong style={{ fontSize: 15, color: '#101828', display: 'block', marginBottom: 6 }}>
                      {rec.course.title}
                    </strong>
                    <p style={{ fontSize: 13, color: '#475467', lineHeight: 1.4, marginBottom: 14 }}>
                      {rec.gap_reason}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLockedCourseModal({ course: rec.course, matchScore: rec.match_score });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      width: '100%',
                      padding: '9px 14px',
                      fontSize: 13,
                      background: '#155eef',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1048b8'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#155eef'}
                  >
                    <Lock size={14} />
                    <span>Explore Syllabus & Cohort 🔒</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}


      {/* TAB 3: QUESTION-BY-QUESTION REVIEW */}
      {activeTab === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result.question_review.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: `1px solid ${item.is_correct ? '#a6f4c5' : (item.selected_option === -1 ? '#fde68a' : '#fda29b')}`,
                borderRadius: 14,
                padding: 20,
                boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: item.is_correct ? '#027a48' : (item.selected_option === -1 ? '#b54708' : '#b42318') }}>
                  {item.is_correct ? '✓ Correct Answer' : (item.selected_option === -1 ? '⚠ Unattempted' : '✗ Incorrect Answer')}
                </span>
                <span style={{ background: '#f2f4f7', color: '#344054', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                  {item.domain}
                </span>
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: '#101828', marginBottom: 12 }}>
                {idx + 1}. {item.question}
              </h4>

              <div style={{ fontSize: 13, color: '#344054', marginBottom: 6 }}>
                <strong>Your Selected Answer:</strong> {item.selected_option === -1 ? 'Not Attempted' : item.options[item.selected_option]}
              </div>
              {!item.is_correct && (
                <div style={{ fontSize: 13, color: '#027a48', marginBottom: 6 }}>
                  <strong>Correct Answer:</strong> {item.options[item.correct_answer]}
                </div>
              )}
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12, color: '#475467', lineHeight: 1.4, border: '1px solid #eaecf0', marginTop: 8 }}>
                💡 <strong>Explanation:</strong> {item.explanation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact & WhatsApp Message Box Section - Minimal Subtle White with WhatsApp Accent */}
      <div style={{
        marginTop: 36,
        background: '#ffffff',
        border: '1.5px solid #25D366',
        borderRadius: 16,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#25D366', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
              <span>💬 Direct WhatsApp Mentorship & Counseling</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#101828', margin: '4px 0' }}>
              Connect with Senior IAM Lead on WhatsApp
            </h3>
            <p style={{ color: '#475467', fontSize: 13, margin: 0 }}>
              Discuss your score ({overallScore}%), domain gap analysis, and fast-track your enterprise certification roadmap.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', padding: '6px 14px', borderRadius: 20, border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 12, fontWeight: 700 }}>
            <span>📞 Mentor Hotline: +91 8972065508</span>
          </div>
        </div>

        {/* WhatsApp Message Box Editor */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #eaecf0',
          borderRadius: 12,
          padding: '16px'
        }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#344054', display: 'block', marginBottom: 6 }}>
            Customize your message to the CyberXDelta admissions team:
          </label>
          <textarea
            rows={3}
            value={customWhatsappMsg}
            onChange={e => setCustomWhatsappMsg(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#ffffff',
              border: '1px solid #d0d5dd',
              borderRadius: 8,
              color: '#101828',
              fontSize: 13,
              lineHeight: 1.5,
              resize: 'vertical',
              fontFamily: 'inherit',
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
            }}
          />

          {/* Quick template chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: '#667085', alignSelf: 'center', marginRight: 4 }}>
              Quick Templates:
            </span>
            <button
              onClick={() => setCustomWhatsappMsg(`Hello CyberXDelta, I completed the IAM test with a score of ${overallScore}% (${result.readiness_level}). I would like to book a 1:1 roadmap consultation session.`)}
              style={{ background: '#ffffff', border: '1px solid #d0d5dd', color: '#344054', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
            >
              📅 1:1 Career Counseling
            </button>
            <button
              onClick={() => setCustomWhatsappMsg(`Hello CyberXDelta, my assessment identified gaps in ${result.weakest_domain}. Please share syllabus and batch schedules for relevant live cohorts.`)}
              style={{ background: '#ffffff', border: '1px solid #d0d5dd', color: '#344054', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
            >
              📚 Cohort Syllabus & Fees
            </button>
            <button
              onClick={() => setCustomWhatsappMsg(`Hello CyberXDelta, I want to prepare for Okta/Ping/SailPoint/CyberArk certifications. What is the recommended timeline from my current ${overallScore}% baseline?`)}
              style={{ background: '#ffffff', border: '1px solid #d0d5dd', color: '#344054', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
            >
              🎯 Certification Strategy
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#667085' }}>
            ⚡ Instant Response via Official WhatsApp Business Channel
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleBookCall}
              disabled={bookingStatus === 'loading' || bookingStatus === 'success'}
              style={{
                padding: '10px 16px',
                fontSize: 13,
                background: '#ffffff',
                border: '1px solid #d0d5dd',
                color: '#344054',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {bookingStatus === 'loading' ? 'Scheduling...' : bookingStatus === 'success' ? '✓ Call Requested' : 'Schedule Phone Callback'}
            </button>

            <a
              href={`https://wa.me/918972065508?text=${encodeURIComponent(customWhatsappMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25D366',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 1px 3px rgba(37, 211, 102, 0.3)',
                cursor: 'pointer'
              }}
            >
              <span>Send via WhatsApp 💬</span>
            </a>
          </div>
        </div>
      </div>

      {/* COURSE LOCKED POPUP MODAL */}
      {lockedCourseModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(16, 24, 40, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
          onClick={() => setLockedCourseModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e4e7ec',
              boxShadow: '0 25px 50px -12px rgba(16, 24, 40, 0.25)',
              maxWidth: 520,
              width: '100%',
              padding: 28,
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLockedCourseModal(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f2f4f7',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475467'
              }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Lock Icon & Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: '#fef3f2',
                border: '1px solid #fee4e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d92d20',
                flexShrink: 0
              }}>
                <Lock size={22} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#b42318', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Live Cohort Enrollment
                </span>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: '#101828', margin: 0 }}>
                  Course Syllabus is Locked
                </h3>
              </div>
            </div>

            {/* Course Preview Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #eaecf0',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ background: '#eff8ff', color: '#155eef', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                  {lockedCourseModal.course.badge}
                </span>
                <span style={{ fontSize: 12, color: '#027a48', fontWeight: 700 }}>
                  {lockedCourseModal.matchScore}% Gap Match
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#101828', marginBottom: 4 }}>
                {lockedCourseModal.course.title}
              </div>
              <div style={{ fontSize: 12, color: '#667085' }}>
                Specialization: {lockedCourseModal.course.primary_domain} • {lockedCourseModal.course.duration || '6 Weeks Live'}
              </div>
            </div>

            {/* Explanatory Message */}
            <p style={{ fontSize: 13, color: '#475467', lineHeight: 1.6, marginBottom: 20 }}>
              To ensure prerequisite alignment and cohort standard, detailed syllabus modules, live batch schedules, and customized fee structures are locked. Please reach out to the <strong>CyberXDelta Admissions & Mentorship Team</strong> directly on WhatsApp for further requirements and course communication.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href={`https://wa.me/918972065508?text=${encodeURIComponent(
                  `Hello CyberXDelta Academy, I have completed my IAM Diagnostic Assessment (Score: ${overallScore}%, Readiness: ${result.readiness_level}).\n\nI want to unlock the syllabus, live batch schedule, and fee requirements for "${lockedCourseModal.course.title}". Please guide me on next steps.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: '#25D366',
                  color: '#ffffff',
                  padding: '12px 18px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(37, 211, 102, 0.35)',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setLockedCourseModal(null)}
                style={{
                  padding: '10px',
                  background: '#ffffff',
                  border: '1px solid #d0d5dd',
                  color: '#344054',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel / Return to Results
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
