import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, Shield, AlertTriangle, CheckCircle2, Bookmark, BookmarkCheck, 
  ChevronLeft, ChevronRight, X, Video
} from 'lucide-react';
import type { QuestionPublic, AnswerSubmission, ProctorEvent, CandidateProfile, ProctorSeverity } from '../types';
import { heartbeatProctorSessionApi, recordProctorEventApi } from '../services/api';
import { useProctoring, type ProctorSignal } from '../proctoring/useProctoring';
import { evaluateStrikes } from '../proctoring/strikeManager';
import { WarningModal } from './WarningModal';

interface ExamEngineProps {
  questions: QuestionPublic[];
  selectedRole: string;
  candidateProfile: CandidateProfile;
  mediaStream: MediaStream | null;
  sessionId: string;
  onFinishExam: (submission: {
    answers: AnswerSubmission[];
    events: ProctorEvent[];
    timeSpentSeconds: number;
    verificationSnapshot?: string;
  }) => void;
  onExit?: () => void;
}

const TOTAL_DURATION_SECONDS = 30 * 60; // 30 Minutes

export const ExamEngine: React.FC<ExamEngineProps> = ({
  questions,
  selectedRole,
  candidateProfile,
  mediaStream,
  sessionId,
  onFinishExam
}) => {
  // Test State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(TOTAL_DURATION_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Proctoring State
  const [events, setEvents] = useState<ProctorEvent[]>([]);
  const [proctorStatus, setProctorStatus] = useState<'SECURE' | 'WARNING' | 'ALERT'>('SECURE');
  const [activeWarning, setActiveWarning] = useState<string | null>(null);
  const [secondaryPerson, setSecondaryPerson] = useState<boolean>(false);
  const [phoneDetected, setPhoneDetected] = useState<boolean>(false);

  const [strikeCount, setStrikeCount] = useState(0);
  const [warningModalInfo, setWarningModalInfo] = useState<{ title: string; message: string; severity: ProctorSeverity } | null>(null);

  // Timed Warnings Triggered State
  const [warned10Min, setWarned10Min] = useState<boolean>(false);
  const [warned5Min, setWarned5Min] = useState<boolean>(false);
  const [warned1Min, setWarned1Min] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Capture current camera snapshot for event evidence
  const captureEvidenceSnapshot = useCallback((): string => {
    if (!videoRef.current) return '';
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      if (ctx && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, 240, 180);
        return canvas.toDataURL('image/jpeg', 0.65);
      }
    } catch {
      // Ignore
    }
    return '';
  }, []);

  // Helper to record proctoring events with persistence
  const recordEvent = useCallback((
    eventType: ProctorEvent['event_type'],
    severity: ProctorSeverity,
    description: string,
    confidence = 0.95,
    duration = 1.0,
    metadata?: any
  ) => {
    const snapshot = captureEvidenceSnapshot();
    const newEvent: ProctorEvent = {
      id: `evt_${Math.random().toString(36).substring(2, 9)}`,
      session_id: sessionId,
      candidate_id: candidateProfile.candidateId,
      test_id: `test_${selectedRole.replace(/\s+/g, '_')}`,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      confidence,
      duration_seconds: duration,
      severity,
      evidence_snapshot: snapshot || undefined,
      description,
      metadata
    };

    setEvents(prev => [...prev, newEvent]);
    setActiveWarning(description);

    if (severity === 'CRITICAL' || severity === 'HIGH') {
      setProctorStatus('ALERT');
    } else {
      setProctorStatus('WARNING');
    }

    // Auto dismiss toast after 6 seconds
    setTimeout(() => {
      setActiveWarning(null);
      setProctorStatus('SECURE');
    }, 6000);

    // Sync event with backend
    recordProctorEventApi(sessionId, newEvent).catch(console.warn);
  }, [sessionId, candidateProfile.candidateId, selectedRole, captureEvidenceSnapshot]);

  // Submit Handler
  const handleFinalSubmit = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const submissionList: AnswerSubmission[] = questions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id] ?? -1,
      time_spent_seconds: 0
    }));

    const timeSpent = Math.min(TOTAL_DURATION_SECONDS, TOTAL_DURATION_SECONDS - timeRemaining);

    // Stop camera tracks
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }

    // Exit fullscreen cleanly
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    onFinishExam({
      answers: submissionList,
      events: events,
      timeSpentSeconds: timeSpent,
      verificationSnapshot: candidateProfile.photoSnapshot
    });
  }, [isSubmitting, questions, answers, timeRemaining, mediaStream, events, candidateProfile.photoSnapshot, onFinishExam]);

  // Initialize Timer and Server Heartbeat
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleFinalSubmit(); // Automatic submission at 00:00!
          return 0;
        }

        // Time Remaining Warnings
        if (prev === 600 && !warned10Min) {
          setWarned10Min(true);
          setActiveWarning("⏰ 10 Minutes Remaining: Please monitor your pacing.");
        } else if (prev === 300 && !warned5Min) {
          setWarned5Min(true);
          setActiveWarning("⚠️ 5 Minutes Remaining: Review your flagged answers.");
        } else if (prev === 60 && !warned1Min) {
          setWarned1Min(true);
          setActiveWarning("🚨 Final 1 Minute Remaining: Automatic submission imminent.");
        }

        return prev - 1;
      });
    }, 1000);

    // Periodic Heartbeat Sync every 15s
    const heartbeatInterval = setInterval(() => {
      setIsSyncing(true);
      const submissionList = questions.map(q => ({
        question_id: q.id,
        selected_option: answers[q.id] ?? 0
      }));
      heartbeatProctorSessionApi(sessionId, {
        answers: submissionList,
        current_question_index: currentIndex,
        time_remaining_seconds: timeRemaining,
        active_tab_status: !document.hidden,
        proctor_status: proctorStatus
      }).then(() => {
        setLastSavedTimestamp(new Date().toLocaleTimeString());
        setIsSyncing(false);
      }).catch(() => {
        setIsSyncing(false);
      });
    }, 15000);

    return () => {
      clearInterval(timerIntervalRef.current);
      clearInterval(heartbeatInterval);
    };
  }, [handleFinalSubmit, warned10Min, warned5Min, warned1Min, answers, currentIndex, proctorStatus, questions, sessionId, timeRemaining]);

  // Attach Video Stream to HUD
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [mediaStream]);

  // Anti-Tampering: Tab Switching & Fullscreen Exit Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordEvent(
          'TAB_SWITCH',
          'HIGH',
          'Exam Window Focus Lost: Candidate switched away from active exam tab.',
          0.99,
          3.0
        );
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmitting) {
        recordEvent(
          'FULLSCREEN_EXIT',
          'MEDIUM',
          'Fullscreen Mode Exited: Candidate dropped full-screen lockdown.',
          0.95,
          2.0
        );
      }
    };

    const handleWindowBlur = () => {
      if (!document.hidden) {
        recordEvent(
          'WINDOW_BLUR',
          'LOW',
          'Application focus shifted away from test canvas.',
          0.90,
          1.5
        );
      }
    };

    // Keyboard and Clipboard Tamper Prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'a' || e.key === 'p')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        e.preventDefault();
        recordEvent(
          'TAMPER_SHORTCUT',
          'HIGH',
          `Prohibited shortcut attempt intercepted (${e.ctrlKey ? 'Ctrl+' : ''}${e.key}).`,
          1.0,
          0
        );
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordEvent(
        'TAMPER_SHORTCUT',
        'LOW',
        'Right-click context menu access attempted and blocked.',
        1.0,
        0
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [recordEvent, isSubmitting]);

  // Format Time Remaining `MM:SS`
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Option selection
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setLastSavedTimestamp('Just now');
  };

  // Toggle Mark for Review
  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // Clear answer
  const handleClearAnswer = (questionId: string) => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  // Navigation counts
  const currentQ = questions[currentIndex] || questions[0];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const handleProctorViolation = useCallback((type: ProctorEvent['event_type'], severity: ProctorSeverity, title: string, message: string) => {
    setStrikeCount(prev => {
      const newCount = prev + 1;
      const action = evaluateStrikes(newCount);
      
      recordEvent(type, severity, `${title}: ${message}`, 1.0, 0, { strikeCount: newCount, action });
      
      if (action === 'TERMINATE') {
        handleFinalSubmit(); // Auto terminate
      } else {
        setWarningModalInfo({ title, message, severity });
      }
      return newCount;
    });
  }, [recordEvent, handleFinalSubmit]);

  const handleProctorSignal = useCallback((s: ProctorSignal) => {
    switch (s.type) {
      case 'GAZE_NUDGE':
        setActiveWarning('Please look back at the screen.');
        setTimeout(() => setActiveWarning(null), 3000);
        break;
      case 'LOOKING_AWAY':
        handleProctorViolation(
          'LOOKING_AWAY', 'MEDIUM', 
          'Looking Away', 
          'You have been looking away from the screen for over 10 seconds. This is a violation.'
        );
        break;
      case 'CUMULATIVE_AWAY':
        recordEvent('CUMULATIVE_AWAY', 'MEDIUM', 'Cumulative looking away exceeded 60s.', 1.0, s.totalMs / 1000);
        break;
      case 'OBJECT_DETECTED':
        setPhoneDetected(true);
        setTimeout(() => setPhoneDetected(false), 3000);
        handleProctorViolation(
          'UNAUTHORIZED_OBJECT', 'CRITICAL',
          `Unauthorized Object (${s.object})`,
          `An unauthorized object (${s.object}) was detected in your camera view.`
        );
        break;
      case 'MULTI_FACE':
        setSecondaryPerson(true);
        setTimeout(() => setSecondaryPerson(false), 3000);
        handleProctorViolation(
          'MULTIPLE_FACES', 'CRITICAL',
          'Multiple Persons Detected',
          'Another person was detected in your camera view. You must be alone.'
        );
        break;
      case 'NO_FACE':
        handleProctorViolation(
          'FACE_NOT_DETECTED', 'MEDIUM',
          'Face Not Detected',
          'Your face has left the camera view. You must remain visible at all times.'
        );
        break;
    }
  }, [recordEvent, handleProctorViolation]);

  useProctoring(videoRef, !isSubmitting, handleProctorSignal);

  return (
    <div className="exam-engine-root" style={{ minHeight: '100vh', background: '#f7f8fa', color: '#101828', paddingBottom: 60 }}>
      
      {/* Top Fixed Examination Header - Minimal Subtle White */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#ffffff',
        borderBottom: '1px solid #e4e7ec',
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
      }}>
        {/* Left: Test Info & Candidate Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: '#eff8ff',
            color: '#155eef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 15
          }}>
            CXD
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>
              IAM Security Assessment ({selectedRole})
            </div>
            <div style={{ fontSize: 12, color: '#475467', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Candidate: <strong>{candidateProfile.name}</strong> ({candidateProfile.candidateId})</span>
              <span>•</span>
              <span style={{ color: '#155eef' }}>{isSyncing ? '🔄 Syncing...' : `✓ Saved ${lastSavedTimestamp}`}</span>
            </div>
          </div>
        </div>

        {/* Center: Live 30-Min Countdown Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: timeRemaining <= 300 ? '#fef3f2' : '#f8fafc',
          border: `1px solid ${timeRemaining <= 300 ? '#fda29b' : '#d0d5dd'}`,
          padding: '6px 16px',
          borderRadius: 30
        }}>
          <Clock size={18} color={timeRemaining <= 300 ? '#d92d20' : '#155eef'} />
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#667085', fontWeight: 700 }}>Time Remaining</div>
            <div style={{
              fontSize: 18,
              fontFamily: 'monospace',
              fontWeight: 800,
              color: timeRemaining <= 300 ? '#d92d20' : '#101828'
            }}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Right: Proctor Status Badge & Submit Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 20,
            background: proctorStatus === 'ALERT' ? '#fef3f2' : proctorStatus === 'WARNING' ? '#fffaeb' : '#ecfdf3',
            border: `1px solid ${proctorStatus === 'ALERT' ? '#fda29b' : proctorStatus === 'WARNING' ? '#fedf89' : '#a6f4c5'}`,
            fontSize: 12,
            fontWeight: 700,
            color: proctorStatus === 'ALERT' ? '#b42318' : proctorStatus === 'WARNING' ? '#b54708' : '#027a48'
          }}>
            <Shield size={14} />
            <span>AI PROCTOR: {proctorStatus}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            style={{
              background: '#155eef',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
            }}
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Floating Active Warning Banner Toast */}
      {activeWarning && (
        <div style={{
          position: 'fixed',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          background: '#fef3f2',
          border: '1px solid #fda29b',
          borderRadius: 10,
          padding: '12px 24px',
          boxShadow: '0 10px 25px rgba(16, 24, 40, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#b42318'
        }}>
          <AlertTriangle size={18} color="#d92d20" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{activeWarning}</span>
          <button onClick={() => setActiveWarning(null)} style={{ background: 'none', border: 'none', color: '#667085', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Exam Layout: Question Area + Question Grid Sidebar */}
      <div style={{
        maxWidth: 1200,
        margin: '24px auto',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        gap: 24,
        alignItems: 'start'
      }}>
        
        {/* Left Column: Question Card & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Question Box - Minimal Subtle White */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e4e7ec',
            borderRadius: 16,
            padding: '30px 32px',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
          }}>
            {/* Question Header Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  background: '#eff8ff',
                  color: '#155eef',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="badge badge-gray" style={{ fontSize: 11 }}>
                  {currentQ.domain}
                </span>
                <span className={`badge ${currentQ.difficulty === 'Advanced' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: 11 }}>
                  {currentQ.difficulty}
                </span>
              </div>

              <button
                onClick={() => toggleMarkForReview(currentQ.id)}
                style={{
                  background: markedForReview[currentQ.id] ? '#fffaeb' : '#ffffff',
                  border: `1px solid ${markedForReview[currentQ.id] ? '#fedf89' : '#d0d5dd'}`,
                  color: markedForReview[currentQ.id] ? '#b54708' : '#344054',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                {markedForReview[currentQ.id] ? <BookmarkCheck size={14} color="#b54708" /> : <Bookmark size={14} color="#667085" />}
                <span>{markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Prompt */}
            <h3 style={{
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.5,
              color: '#101828',
              marginBottom: 26
            }}>
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentQ.options.map((optionText, idx) => {
                const isSelected = answers[currentQ.id] === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(currentQ.id, idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      padding: '16px 20px',
                      borderRadius: 12,
                      background: isSelected ? '#eff8ff' : '#ffffff',
                      border: `1.5px solid ${isSelected ? '#155eef' : '#eaecf0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 1px 3px rgba(21, 94, 239, 0.1)' : '0 1px 2px rgba(16, 24, 40, 0.03)'
                    }}
                  >
                    <div style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#155eef' : '#d0d5dd'}`,
                      background: isSelected ? '#155eef' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: isSelected ? '#ffffff' : '#667085',
                      flexShrink: 0,
                      marginTop: 2
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.5, color: isSelected ? '#101828' : '#344054', fontWeight: isSelected ? 600 : 400 }}>
                      {optionText}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear Choice action */}
            {answers[currentQ.id] !== undefined && (
              <div style={{ marginTop: 14, textAlign: 'right' }}>
                <button
                  onClick={() => handleClearAnswer(currentQ.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667085',
                    fontSize: 12,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid #e4e7ec',
            borderRadius: 12,
            padding: '14px 20px',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
          }}>
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
              style={{
                background: '#ffffff',
                border: '1px solid #d0d5dd',
                color: currentIndex === 0 ? '#98a2b3' : '#344054',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <div style={{ fontSize: 13, color: '#475467', fontWeight: 500 }}>
              Question {currentIndex + 1} of {questions.length}
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))}
                style={{
                  background: '#155eef',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                Save & Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                style={{
                  background: '#12b76a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                Review & Submit <CheckCircle2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Live Camera HUD & Question Palette */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Live AI Proctor Video HUD */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e4e7ec',
            borderRadius: 16,
            padding: 16,
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#344054', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Video size={14} color="#155eef" /> PROCTORING HUD
              </span>
              <span style={{ fontSize: 11, color: '#027a48', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#12b76a' }} /> LIVE
              </span>
            </div>

            {/* Video Viewport */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: 180,
              background: '#0f172a',
              borderRadius: 8,
              overflow: 'hidden',
              border: proctorStatus === 'ALERT' ? '2px solid #d92d20' : '1px solid #e4e7ec'
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />

              {/* HUD Telemetry Labels */}
              <div style={{
                position: 'absolute',
                top: 6,
                left: 6,
                background: 'rgba(0,0,0,0.65)',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 10,
                color: '#38bdf8',
                fontFamily: 'monospace'
              }}>
                SIG: 100% • 30FPS
              </div>

              {secondaryPerson && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(239, 68, 68, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 12
                }}>
                  🚨 MULTIPLE FACES DETECTED
                </div>
              )}

              {phoneDetected && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(239, 68, 68, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 12
                }}>
                  🚨 PHONE DETECTED
                </div>
              )}
            </div>


          </div>

          {/* Question Status Palette - Minimal Subtle White */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e4e7ec',
            borderRadius: 16,
            padding: 18,
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#101828', marginBottom: 12 }}>
              Question Status Palette
            </h4>

            {/* Status Breakdown Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
              <div style={{ background: '#ecfdf3', border: '1px solid #a6f4c5', padding: '6px 4px', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#027a48' }}>{answeredCount}</div>
                <div style={{ fontSize: 10, color: '#027a48', fontWeight: 600 }}>Answered</div>
              </div>
              <div style={{ background: '#fffaeb', border: '1px solid #fedf89', padding: '6px 4px', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#b54708' }}>{markedCount}</div>
                <div style={{ fontSize: 10, color: '#b54708', fontWeight: 600 }}>Review</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #eaecf0', padding: '6px 4px', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#475467' }}>{unansweredCount}</div>
                <div style={{ fontSize: 10, color: '#667085', fontWeight: 600 }}>Unanswered</div>
              </div>
            </div>

            {/* Question Buttons Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = !!markedForReview[q.id];
                const isCurrent = currentIndex === idx;

                let bg = '#ffffff';
                let borderColor = '#d0d5dd';
                let textColor = '#344054';

                if (isMarked) {
                  bg = '#fffaeb';
                  borderColor = '#fedf89';
                  textColor = '#b54708';
                } else if (isAnswered) {
                  bg = '#ecfdf3';
                  borderColor = '#a6f4c5';
                  textColor = '#027a48';
                }

                if (isCurrent) {
                  borderColor = '#155eef';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      height: 38,
                      borderRadius: 8,
                      background: bg,
                      border: `1.5px solid ${borderColor}`,
                      color: textColor,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: isCurrent ? '0 0 0 2px rgba(21, 94, 239, 0.2)' : 'none'
                    }}
                  >
                    {idx + 1}
                    {isMarked && (
                      <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: '50%', background: '#b54708' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security & Anti-Tampering Reminders */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #eaecf0',
            borderRadius: 12,
            padding: 14,
            fontSize: 12,
            color: '#475467',
            lineHeight: 1.5
          }}>
            🔒 <strong>Session Security Active:</strong> Full-screen lockdown enforced. Tab switching and copy/paste attempts are logged in the audit trail.
          </div>
        </div>

      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(16, 24, 40, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            width: '100%',
            maxWidth: 480,
            background: '#ffffff',
            border: '1px solid #e4e7ec',
            borderRadius: 16,
            padding: 28,
            boxShadow: '0 20px 24px -4px rgba(16, 24, 40, 0.1)'
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#101828', marginBottom: 10 }}>
              Submit Proctored Examination?
            </h3>
            <p style={{ color: '#475467', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
              Please confirm your answers before final submission. Once submitted, your results and proctoring audit log will be calculated.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 10, padding: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#027a48' }}>{answeredCount}</div>
                <div style={{ fontSize: 12, color: '#475467' }}>Answered</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#b54708' }}>{markedCount}</div>
                <div style={{ fontSize: 12, color: '#475467' }}>Flagged</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#b42318' }}>{unansweredCount}</div>
                <div style={{ fontSize: 12, color: '#475467' }}>Unanswered</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#ffffff',
                  border: '1px solid #d0d5dd',
                  color: '#344054',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Return to Test
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                style={{
                  flex: 1.5,
                  padding: '10px 16px',
                  background: '#155eef',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Evaluating...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      <WarningModal
        isOpen={!!warningModalInfo}
        title={warningModalInfo?.title || ''}
        message={warningModalInfo?.message || ''}
        strikeCount={strikeCount}
        maxStrikes={3}
        onAcknowledge={() => setWarningModalInfo(null)}
      />

    </div>
  );
};
