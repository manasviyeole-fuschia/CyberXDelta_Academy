import React from 'react';

export const TechBackground: React.FC = () => {
  return (
    <div
      className="tech-background-layer"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* 1. Ambient Radial Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '650px',
          height: '650px',
          background: 'radial-gradient(circle, rgba(21, 94, 239, 0.09) 0%, rgba(56, 189, 248, 0.06) 45%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '-8%',
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '15%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, transparent 65%)',
          borderRadius: '50%',
          filter: 'blur(45px)',
        }}
      />

      {/* 2. SVG Decorative Tech Overlays (Orbital rings, constellation nodes) */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyberLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#155eef" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Right-Side Concentric Orbital Radar Circles */}
        <g transform="translate(1250, 240)" opacity="0.85">
          <circle r="460" fill="none" stroke="#d0e1fd" strokeWidth="1" strokeDasharray="6 8" />
          <circle r="360" fill="none" stroke="#bfdbfe" strokeWidth="1.2" />
          <circle r="260" fill="none" stroke="#dbeafe" strokeWidth="1" strokeDasharray="4 6" />
          <circle r="160" fill="none" stroke="#bfdbfe" strokeWidth="1" />
          <circle r="60" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Orbiting nodes */}
          <circle cx="260" cy="0" r="4" fill="#155eef" />
          <circle cx="-184" cy="184" r="3.5" fill="#0ea5e9" />
          <circle cx="0" cy="-360" r="5" fill="#2563eb" />
          <circle cx="254" cy="-254" r="3" fill="#60a5fa" />
        </g>

        {/* Top-Right Constellation Network Nodes */}
        <g opacity="0.75">
          <line x1="92%" y1="12%" x2="98%" y2="18%" stroke="url(#cyberLineGrad)" strokeWidth="1.2" />
          <line x1="98%" y1="18%" x2="94%" y2="28%" stroke="url(#cyberLineGrad)" strokeWidth="1.2" />
          <line x1="94%" y1="28%" x2="88%" y2="22%" stroke="url(#cyberLineGrad)" strokeWidth="1.2" />
          <line x1="88%" y1="22%" x2="92%" y2="12%" stroke="url(#cyberLineGrad)" strokeWidth="1.2" />
          <line x1="94%" y1="28%" x2="99%" y2="34%" stroke="url(#cyberLineGrad)" strokeWidth="1.2" />
          <line x1="88%" y1="22%" x2="82%" y2="28%" stroke="url(#cyberLineGrad)" strokeWidth="1" strokeDasharray="3 3" />

          <circle cx="92%" cy="12%" r="4" fill="#155eef" />
          <circle cx="98%" cy="18%" r="4.5" fill="#0ea5e9" />
          <circle cx="94%" cy="28%" r="3.5" fill="#155eef" />
          <circle cx="88%" cy="22%" r="4" fill="#2563eb" />
          <circle cx="99%" cy="34%" r="3" fill="#38bdf8" />
          <circle cx="82%" cy="28%" r="3" fill="#93c5fd" />
        </g>

        {/* Bottom-Left Constellation Network Nodes */}
        <g opacity="0.65">
          <line x1="2%" y1="78%" x2="8%" y2="84%" stroke="url(#cyberLineGrad)" strokeWidth="1.2" />
          <line x1="8%" y1="84%" x2="5%" y2="94%" stroke="url(#cyberLineGrad)" strokeWidth="1.2" />
          <line x1="5%" y1="94%" x2="1%" y2="88%" stroke="url(#cyberLineGrad)" strokeWidth="1.2" />
          <line x1="8%" y1="84%" x2="14%" y2="89%" stroke="url(#cyberLineGrad)" strokeWidth="1" />
          <line x1="2%" y1="78%" x2="6%" y2="70%" stroke="url(#cyberLineGrad)" strokeWidth="1" strokeDasharray="3 3" />

          <circle cx="2%" cy="78%" r="3.5" fill="#155eef" />
          <circle cx="8%" cy="84%" r="4.5" fill="#0ea5e9" />
          <circle cx="5%" cy="94%" r="4" fill="#2563eb" />
          <circle cx="1%" cy="88%" r="3" fill="#93c5fd" />
          <circle cx="14%" cy="89%" r="3.5" fill="#155eef" />
          <circle cx="6%" cy="70%" r="3" fill="#38bdf8" />
        </g>
      </svg>
    </div>
  );
};

