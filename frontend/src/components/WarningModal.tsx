import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  strikeCount: number;
  maxStrikes: number;
  buttonText?: string;
  onAcknowledge: () => void;
}

export const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  title,
  message,
  strikeCount,
  maxStrikes,
  buttonText,
  onAcknowledge
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(850, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.35);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch {}
      if (!audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      }
      audioRef.current.play().catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
      role="alert"
      aria-live="assertive"
    >
      <div style={{
        background: '#ffffff',
        border: '1px solid #fda29b',
        borderRadius: 16,
        padding: 32,
        maxWidth: 480,
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.25)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#fef3f2',
          color: '#d92d20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          border: '4px solid #fee4e2'
        }}>
          <AlertTriangle size={32} />
        </div>
        
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#101828', margin: '0 0 12px' }}>
          {title}
        </h2>
        
        <p style={{ fontSize: 16, color: '#475467', lineHeight: 1.5, margin: '0 0 24px' }}>
          {message}
        </p>

        <div style={{
          background: '#fffbfa',
          border: '1px solid #ffd8d6',
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
          color: '#b42318',
          fontSize: 14,
          fontWeight: 700
        }}>
          {strikeCount >= maxStrikes 
            ? `Final Violation: Strike ${strikeCount} of ${maxStrikes} (Session Terminated)` 
            : `Security Violation: Strike ${strikeCount} of ${maxStrikes}`}
        </div>

        <button
          onClick={onAcknowledge}
          style={{
            width: '100%',
            padding: '14px',
            background: '#d92d20',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#b42318'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#d92d20'}
        >
          {buttonText 
            ? buttonText 
            : strikeCount >= maxStrikes 
              ? 'Exam Terminated - Proceed to Submission' 
              : 'I Understand & Acknowledge Violation'}
        </button>
      </div>
    </div>
  );
};
