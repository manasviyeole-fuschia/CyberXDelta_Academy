import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Search, X, Check } from 'lucide-react';
import type { ProctorSessionRecord } from '../types';

import { fetchAdminProctorSessionsApi, updateAdminProctorReviewApi } from '../services/api';

interface AdminProctorCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminProctorCenter: React.FC<AdminProctorCenterProps> = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState<ProctorSessionRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<ProctorSessionRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [proctorNotes, setProctorNotes] = useState<string>('');
  const [newReviewStatus, setNewReviewStatus] = useState<ProctorSessionRecord['review_status']>('Needs Review');
  const [isSavingReview, setIsSavingReview] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminProctorSessionsApi();
      setSessions(data);
    } catch (e) {
      console.warn("Could not load sessions", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const handleOpenReview = (session: ProctorSessionRecord) => {
    setSelectedSession(session);
    setProctorNotes(session.proctor_notes || '');
    setNewReviewStatus(session.review_status);
    setFeedbackMsg(null);
  };

  const handleSaveReview = async () => {
    if (!selectedSession) return;
    setIsSavingReview(true);
    try {
      await updateAdminProctorReviewApi(selectedSession.session_id, {
        review_status: newReviewStatus,
        proctor_notes: proctorNotes,
        reviewed_by: "Lead Admin Proctor"
      });

      // Update in local state
      setSessions(prev => prev.map(s => {
        if (s.session_id === selectedSession.session_id) {
          return {
            ...s,
            review_status: newReviewStatus,
            proctor_notes: proctorNotes,
            reviewed_by: "Lead Admin Proctor",
            reviewed_at: new Date().toISOString()
          };
        }
        return s;
      }));

      setSelectedSession(prev => prev ? {
        ...prev,
        review_status: newReviewStatus,
        proctor_notes: proctorNotes,
        reviewed_by: "Lead Admin Proctor",
        reviewed_at: new Date().toISOString()
      } : null);

      setFeedbackMsg("Review decision saved successfully.");
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (e) {
      console.error(e);
    }
    setIsSavingReview(false);
  };

  if (!isOpen) return null;

  // Filtered Sessions
  const filteredSessions = sessions.filter(s => {
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'needs_review' && s.review_status === 'Needs Review') ||
      (activeFilter === 'flagged' && s.risk_level === 'Flagged') ||
      (activeFilter === 'reviewed' && s.review_status === 'Reviewed') ||
      (activeFilter === 'in_progress' && s.status === 'IN_PROGRESS');

    const matchesSearch = 
      s.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.candidate_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.session_id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24
    }}>
      <div style={{
        width: '100%',
        maxWidth: 1200,
        height: '92vh',
        background: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          background: 'rgba(30, 41, 59, 0.7)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={22} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>
                AI Proctor & Invigilation Command Center
              </h3>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                CyberXDelta Examination Control • Active Monitoring & Human Review Workflow
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={loadSessions}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#38bdf8',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              <span>Refresh Telemetry</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          padding: '14px 28px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'all', label: `All (${sessions.length})` },
              { id: 'needs_review', label: `Needs Review (${sessions.filter(s => s.review_status === 'Needs Review').length})` },
              { id: 'flagged', label: `Flagged / High Risk (${sessions.filter(s => s.risk_level === 'Flagged').length})` },
              { id: 'reviewed', label: `Reviewed (${sessions.filter(s => s.review_status === 'Reviewed').length})` },
              { id: 'in_progress', label: `Live In-Progress (${sessions.filter(s => s.status === 'IN_PROGRESS').length})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  background: activeFilter === f.id ? '#2563eb' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeFilter === f.id ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                  color: activeFilter === f.id ? '#fff' : '#94a3b8',
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: 9 }} />
            <input
              type="text"
              placeholder="Search candidate or session..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                color: '#fff',
                fontSize: 12
              }}
            />
          </div>
        </div>

        {/* Content Body: Session Table & Inspector */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedSession ? '1fr 460px' : '1fr', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Table / Cards */}
          <div style={{ padding: 24, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 14px' }}>Candidate</th>
                  <th style={{ padding: '12px 14px' }}>Role & Status</th>
                  <th style={{ padding: '12px 14px' }}>Test Score</th>
                  <th style={{ padding: '12px 14px' }}>Proctor Risk</th>
                  <th style={{ padding: '12px 14px' }}>Events Logged</th>
                  <th style={{ padding: '12px 14px' }}>Review Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => {
                  const isSelected = selectedSession?.session_id === session.session_id;
                  return (
                    <tr
                      key={session.session_id}
                      onClick={() => handleOpenReview(session)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{session.candidate_name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{session.candidate_email}</div>
                      </td>

                      <td style={{ padding: '14px' }}>
                        <div>{session.target_role}</div>
                        <span className={`badge ${session.status === 'IN_PROGRESS' ? 'badge-blue' : session.status === 'AUTO_SUBMITTED' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: 10, marginTop: 4 }}>
                          {session.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td style={{ padding: '14px' }}>
                        {session.score !== undefined ? (
                          <strong style={{ fontSize: 14, color: session.score >= 70 ? '#10b981' : '#f59e0b' }}>
                            {session.score}%
                          </strong>
                        ) : (
                          <span style={{ color: '#64748b' }}>In progress</span>
                        )}
                      </td>

                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 800,
                            background: session.risk_score < 25 ? 'rgba(16, 185, 129, 0.15)' : session.risk_score < 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: session.risk_score < 25 ? '#10b981' : session.risk_score < 60 ? '#f59e0b' : '#ef4444'
                          }}>
                            {session.risk_score} / 100
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px' }}>
                        <span style={{ color: session.events.length > 0 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                          {session.events.length} flagged
                        </span>
                      </td>

                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${session.review_status === 'Reviewed' ? 'badge-green' : session.review_status === 'Disqualified' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: 10 }}>
                          {session.review_status}
                        </span>
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#38bdf8',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                        >
                          Inspect Audit →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Inspector Drawer */}
          {selectedSession && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
              padding: 24,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}>
              
              {/* Candidate Profile Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Session ID: {selectedSession.session_id}
                  </div>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                    {selectedSession.candidate_name}
                  </h4>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {selectedSession.candidate_email} • {selectedSession.target_role}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSession(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Risk Score Gauge & Scores */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: 16,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Proctor Risk Score</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: selectedSession.risk_score < 25 ? '#10b981' : selectedSession.risk_score < 60 ? '#f59e0b' : '#ef4444' }}>
                    {selectedSession.risk_score}
                  </div>
                  <div style={{ fontSize: 10, color: '#cbd5e1' }}>Level: {selectedSession.risk_level}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Exam Score</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#38bdf8' }}>
                    {selectedSession.score !== undefined ? `${selectedSession.score}%` : 'N/A'}
                  </div>
                  <div style={{ fontSize: 10, color: '#cbd5e1' }}>Readiness: {selectedSession.readiness_level || 'Pending'}</div>
                </div>
              </div>

              {/* Chronological Event Timeline */}
              <div>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  Event Timeline ({selectedSession.events.length} Flags)
                </h5>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {selectedSession.events.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#10b981', padding: 12, textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 6 }}>
                      ✓ No suspicious events detected. Clean session.
                    </div>
                  ) : (
                    selectedSession.events.map((evt, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: 10,
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 8,
                          fontSize: 12
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <strong style={{ color: evt.severity === 'CRITICAL' ? '#fca5a5' : '#fde68a' }}>
                            {evt.event_type.replace(/_/g, ' ')}
                          </strong>
                          <span style={{ color: '#64748b' }}>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: 11 }}>
                          {evt.description}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Human Proctor Review Decision Bar */}
              <div style={{
                marginTop: 'auto',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: 16
              }}>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  Human Review & Certification Decision
                </h5>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Review Status Decision
                  </label>
                  <select
                    value={newReviewStatus}
                    onChange={e => setNewReviewStatus(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 13
                    }}
                  >
                    <option value="Normal">Normal (Clean Examination)</option>
                    <option value="Needs Review">Needs Review (Under Proctor Investigation)</option>
                    <option value="Reviewed">Reviewed & Approved (Integrity Certified)</option>
                    <option value="Disqualified">Disqualified (Misconduct Confirmed)</option>
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Proctor Audit Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter notes on candidate movements, verification checks..."
                    value={proctorNotes}
                    onChange={e => setProctorNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 12,
                      resize: 'none'
                    }}
                  />
                </div>

                {feedbackMsg && (
                  <div style={{ color: '#10b981', fontSize: 12, marginBottom: 8 }}>
                    ✓ {feedbackMsg}
                  </div>
                )}

                <button
                  onClick={handleSaveReview}
                  disabled={isSavingReview}
                  className="btn primary"
                  style={{ width: '100%', padding: '10px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Check size={14} />
                  <span>{isSavingReview ? 'Saving...' : 'Save Proctor Decision'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
