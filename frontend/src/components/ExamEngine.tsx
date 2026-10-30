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
  retakeCount?: number;
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
  retakeCount = 0,
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
  const [isFullScreen, setIsFullScreen] = useState<boolean>(() => !!document.fullscreenElement);
  const [isWindowFocused, setIsWindowFocused] = useState<boolean>(true);
  const [warningModalInfo, setWarningModalInfo] = useState<{ title: string; message: string; severity: ProctorSeverity } | null>(null);
  const awayStartTimeRef = useRef<number | null>(null);
  const blurStartTimeRef = useRef<number | null>(null);
  const tabSwitchCountRef = useRef<number>(0);
  const awayWatchdogTimerRef = useRef<any>(null);

  // Synthesize instant audible security alarm for tamper events
  const playSecurityAlarm = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext may be restricted by browser policy before interaction
    }
  }, []);

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

  // Re-enter Fullscreen Handler
  const reEnterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullScreen(true);
      setIsWindowFocused(true);
    } catch (err) {
      console.warn("Fullscreen request error:", err);
      setIsFullScreen(!!document.fullscreenElement);
    }
  }, []);

  // Central Proctor Violation Handler (Strikes, Audit Logging, Auto-Submission)
  const handleProctorViolation = useCallback((type: ProctorEvent['event_type'], severity: ProctorSeverity, title: string, message: string) => {
    if (isSubmitting) return;

    setStrikeCount(prev => {
      const newCount = prev + 1;
      const action = evaluateStrikes(newCount);
      
      recordEvent(type, severity, `${title}: ${message}`, 1.0, 0, { strikeCount: newCount, action });
      
      if (action === 'TERMINATE' || newCount >= 3) {
        setWarningModalInfo({ 
          title: "Exam Terminated: Multiple Security Breaches", 
          message: "You have accumulated security violation strikes for unauthorized tab switching and/or dropping full-screen lockdown. Your examination is now permanently locked and submitted for administrative integrity review.", 
          severity: 'CRITICAL' 
        });
        setTimeout(() => {
          handleFinalSubmit();
        }, 2200);
      } else {
        setWarningModalInfo({ title, message, severity });
      }
      return newCount;
    });
  }, [recordEvent, handleFinalSubmit, isSubmitting]);

  // Anti-Tampering: Tab Switching & Fullscreen Exit Listeners
  useEffect(() => {
    // Initial check: ensure fullscreen on mount
    if (!document.fullscreenElement && !isSubmitting) {
      setIsFullScreen(false);
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(() => {
        setIsFullScreen(false);
      });
    }

    const handleVisibilityChange = () => {
      if (isSubmitting) return;

      if (document.hidden) {
        // Candidate switched away from active exam tab
        playSecurityAlarm();
        awayStartTimeRef.current = Date.now();
        tabSwitchCountRef.current += 1;
        const currentTabSwitches = tabSwitchCountRef.current;

        recordEvent(
          'TAB_SWITCH',
          'CRITICAL',
          `Exam Tab Switched: Navigated away from active examination tab (Violation #${currentTabSwitches}).`,
          0.99,
          1.0
        );

        // Immediate termination if tab switch limit reached (Max 1 warning grace; 2nd tab switch = TERMINATE)
        if (currentTabSwitches >= 2) {
          handleProctorViolation(
            'TAB_SWITCH',
            'CRITICAL',
            'Exam Terminated: Repeated Tab Switching Violation',
            'Multiple unauthorized tab switches intercepted. Tab switching is strictly prohibited during proctored examinations. Your session is now terminated and submitted.'
          );
          return;
        }

        // Live Watchdog: If away for > 5 seconds, auto-terminate in the background
        if (awayWatchdogTimerRef.current) clearInterval(awayWatchdogTimerRef.current);
        awayWatchdogTimerRef.current = setInterval(() => {
          if (document.hidden && awayStartTimeRef.current) {
            const awaySecs = Math.round((Date.now() - awayStartTimeRef.current) / 1000);
            if (awaySecs >= 5) {
              clearInterval(awayWatchdogTimerRef.current);
              handleProctorViolation(
                'TAB_SWITCH',
                'CRITICAL',
                'Exam Terminated: Extended Absence from Exam Tab',
                `You were away from the examination tab for more than 5 seconds (${awaySecs}s). External browsing and multi-tab usage are strictly forbidden. Session terminated.`
              );
            }
          }
        }, 500);
      } else {
        // Candidate returned from another tab
        if (awayWatchdogTimerRef.current) {
          clearInterval(awayWatchdogTimerRef.current);
          awayWatchdogTimerRef.current = null;
        }
        const awayMs = awayStartTimeRef.current ? Date.now() - awayStartTimeRef.current : 0;
        awayStartTimeRef.current = null;
        const awaySecs = Math.max(1, Math.round(awayMs / 1000));

        if (tabSwitchCountRef.current >= 2) {
          return;
        }

        handleProctorViolation(
          'TAB_SWITCH',
          'CRITICAL',
          'Critical Violation: Tab Switching Intercepted',
          `You navigated away from the active examination tab for ${awaySecs} second(s). Tab switching is strictly forbidden. WARNING: You have 1 final strike; any further tab or window switch will trigger immediate automatic exam disqualification.`
        );

        if (!document.fullscreenElement) {
          setIsFullScreen(false);
        }
      }
    };

    const handleFullscreenChange = () => {
      if (isSubmitting) return;

      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        playSecurityAlarm();
        handleProctorViolation(
          'FULLSCREEN_EXIT',
          'HIGH',
          'Full-Screen Mode Exited',
          'You exited dedicated full-screen mode. The test interface is locked and obscured until full-screen integrity is restored. Tab and screen switching are strictly forbidden.'
        );
      } else {
        setIsFullScreen(true);
      }
    };

    const handleWindowBlur = () => {
      if (isSubmitting) return;
      setIsWindowFocused(false);
      playSecurityAlarm();
      blurStartTimeRef.current = Date.now();
      recordEvent(
        'WINDOW_BLUR',
        'HIGH',
        'Window Focus Lost: Exam window lost focus to an external application or screen.',
        0.95,
        1.0
      );

      // Start focus loss watchdog: if blurred for > 5 seconds, auto-terminate
      if (awayWatchdogTimerRef.current) clearInterval(awayWatchdogTimerRef.current);
      awayWatchdogTimerRef.current = setInterval(() => {
        if (blurStartTimeRef.current) {
          const blurSecs = Math.round((Date.now() - blurStartTimeRef.current) / 1000);
          if (blurSecs >= 5) {
            clearInterval(awayWatchdogTimerRef.current);
            handleProctorViolation(
              'WINDOW_BLUR',
              'CRITICAL',
              'Exam Terminated: Extended Window Focus Loss',
              `Application focus was lost for more than 5 seconds (${blurSecs}s). Dual-monitor and external application usage are strictly prohibited.`
            );
          }
        }
      }, 500);
    };

    const handleWindowFocus = () => {
      if (isSubmitting) return;
      setIsWindowFocused(true);
      if (awayWatchdogTimerRef.current) {
        clearInterval(awayWatchdogTimerRef.current);
        awayWatchdogTimerRef.current = null;
      }
      if (blurStartTimeRef.current) {
        const blurMs = Date.now() - blurStartTimeRef.current;
        blurStartTimeRef.current = null;
        const blurSecs = Math.round(blurMs / 1000);
        if (blurSecs >= 1) {
          handleProctorViolation(
            'WINDOW_BLUR',
            'HIGH',
            'Window Focus Lost',
            `Application focus shifted away from the examination window for ${blurSecs}s. Dual monitors and background applications are strictly prohibited.`
          );
        }
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (isSubmitting) return;
      if (e.clientY <= 2) {
        setActiveWarning('⚠️ Proctor Boundary Warning: Cursor left exam viewport towards browser tabs/controls. Keep cursor inside the examination canvas.');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmitting) return;
      e.preventDefault();
      e.returnValue = 'Leaving or closing the examination will result in immediate disqualification.';
      return e.returnValue;
    };

    // Keyboard and Clipboard Tamper Prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'a' || e.key === 'p' || e.key === 't' || e.key === 'n' || e.key === 'w' || e.key === 'r' || e.key === 'Tab')) ||
        (e.altKey && e.key === 'Tab') ||
        e.key === 'F11' ||
        e.key === 'F12' ||
        e.key === 'F5' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        e.preventDefault();
        recordEvent(
          'TAMPER_SHORTCUT',
          'HIGH',
          `Prohibited shortcut attempt intercepted (${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}).`,
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
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      if (awayWatchdogTimerRef.current) clearInterval(awayWatchdogTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleProctorViolation, recordEvent, isSubmitting, playSecurityAlarm]);

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
    <div 
      className="exam-engine-root" 
      style={{ 
        minHeight: '100vh', 
        background: '#f7f8fa', 
        color: '#101828', 
        paddingBottom: 60,
        filter: (!isFullScreen || !isWindowFocused) ? 'blur(20px) grayscale(80%)' : 'none',
        pointerEvents: (!isFullScreen || !isWindowFocused) ? 'none' : 'auto',
        transition: 'filter 0.2s ease'
      }}
    >
      
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
              {retakeCount > 0 && (
                <>
                  <span>•</span>
                  <span style={{ color: '#b54708', fontWeight: 700, background: '#fffaeb', padding: '1px 6px', borderRadius: 4, border: '1px solid #fedf89' }}>
                    Retake #{retakeCount}
                  </span>
                </>
              )}
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
                      borderRadius: 8,
                      border: isSelected ? '1.5px solid #155eef' : '1.5px solid #d0d5dd',
                      background: isSelected ? '#eff8ff' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: isSelected ? '#155eef' : '#667085',
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

      {/* FULL-SCREEN & FOCUS LOCKDOWN OVERLAY - Obscures test content when not in fullscreen or focus is lost */}
      {(!isFullScreen || !isWindowFocused) && !isSubmitting && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          zIndex: 99990,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            border: '2px solid #fda29b',
            borderRadius: 20,
            padding: '36px 32px',
            maxWidth: 520,
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.35)'
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#fef3f2',
              color: '#d92d20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '4px solid #fee4e2'
            }}>
              <AlertTriangle size={36} />
            </div>
            
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#101828', margin: '0 0 10px' }}>
              {!isFullScreen ? 'Full-Screen Lockdown Violated' : 'Exam Window Focus Lost'}
            </h2>
            
            <p style={{ fontSize: 15, color: '#475467', lineHeight: 1.6, margin: '0 0 20px' }}>
              {!isFullScreen 
                ? 'You have exited full-screen mode. Examination questions and answer options are locked and obscured to prevent window switching, screen sharing, and external browsing.'
                : 'Application focus shifted away from the examination window. Dual screens, split screen windows, and external applications are prohibited. Click below to return focus.'}
            </p>

            <div style={{
              background: '#fffbfa',
              border: '1px solid #ffd8d6',
              borderRadius: 8,
              padding: '12px',
              marginBottom: 24,
              color: '#b42318',
              fontSize: 14,
              fontWeight: 700
            }}>
              Security Alert: Strike {strikeCount} of 3 {strikeCount >= 3 ? '(Disqualified)' : ''}
              {tabSwitchCountRef.current > 0 && ` • Tab Switches: ${tabSwitchCountRef.current}/2`}
            </div>

            <button
              onClick={reEnterFullscreen}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: '#155eef',
                color: '#ffffff',
                border: 'none',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(21, 94, 239, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#124ec4'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#155eef'}
            >
              ↗ {!isFullScreen ? 'Re-Enter Full-Screen Mode to Resume Test' : 'Return Focus & Resume Test'}
            </button>
          </div>
        </div>
      )}

      <WarningModal
        isOpen={!!warningModalInfo}
        title={warningModalInfo?.title || ''}
        message={warningModalInfo?.message || ''}
        strikeCount={strikeCount}
        maxStrikes={3}
        buttonText={
          strikeCount >= 3 
            ? 'Exam Terminated - Proceed to Submission' 
            : !isFullScreen 
              ? '🔒 Re-Enter Full-Screen Mode to Resume Test' 
              : undefined
        }
        onAcknowledge={() => {
          setWarningModalInfo(null);
          if (!document.fullscreenElement && !isSubmitting) {
            reEnterFullscreen();
          }
        }}
      />

    </div>
  );
};
