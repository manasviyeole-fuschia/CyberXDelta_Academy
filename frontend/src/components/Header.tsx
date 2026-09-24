import React from 'react';

interface HeaderProps {
  onReset: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="top" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '16px 24px' }}>
      <div className="logo" onClick={onReset} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
        CyberX<span>Delta</span>
        <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(21,94,239,0.1)', color: '#155eef', padding: '2px 8px', borderRadius: 4, marginLeft: 6 }}>
          AI Assessment
        </span>
      </div>
    </header>
  );
};


