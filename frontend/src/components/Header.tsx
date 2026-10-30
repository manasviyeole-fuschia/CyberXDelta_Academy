import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, RotateCcw, ExternalLink } from 'lucide-react';
import { ORG_CONTACT_INFO } from '../services/api';

interface HeaderProps {
  onReset: () => void;
  onOpenAdmin?: () => void;
  isLanding?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, isLanding = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="top" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 5vw',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #e4e7ec',
      boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
    }}>
      {/* Left Logo */}
      <div
        className="logo"
        onClick={onReset}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          userSelect: 'none',
          fontSize: 20,
          fontWeight: 800,
          color: '#101828'
        }}
      >
        CyberX<span style={{ color: '#155eef' }}>Delta</span>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          background: 'rgba(21, 94, 239, 0.08)',
          color: '#155eef',
          padding: '2px 8px',
          borderRadius: 4,
          marginLeft: 6
        }}>
          AI Assessment
        </span>
      </div>

      {/* Right Navigation & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {isLanding ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="header-nav">
            <a
              href="https://academy.cyberxdelta.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#475467',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#155eef')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475467')}
            >
              About
            </a>
            <a
              href={ORG_CONTACT_INFO.coursesUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#475467',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#155eef')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475467')}
            >
              Courses
            </a>
            <a
              href={ORG_CONTACT_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#475467',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#155eef')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475467')}
            >
              Contact
            </a>
          </nav>
        ) : (
          /* User Avatar Dropdown on assessment & results screens */
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: dropdownOpen ? '#eff8ff' : '#ffffff',
                border: `1px solid ${dropdownOpen ? '#b2ccff' : '#d0d5dd'}`,
                borderRadius: 24,
                padding: '4px 10px 4px 5px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #155eef, #0ea5e9)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: '0 1px 3px rgba(21, 94, 239, 0.3)'
                }}
              >
                M
              </div>
              <ChevronDown
                size={14}
                color="#667085"
                style={{
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </button>

            {dropdownOpen && (
              <div
                className="dropdown-menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 230,
                  background: '#ffffff',
                  borderRadius: 12,
                  border: '1px solid #e4e7ec',
                  boxShadow: '0 12px 28px -4px rgba(16, 24, 40, 0.12), 0 4px 10px -2px rgba(16, 24, 40, 0.04)',
                  padding: '6px',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f2f4f7' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>Candidate Portal</div>
                  <div style={{ fontSize: 11, color: '#667085' }}>Proctored Diagnostic Active</div>
                </div>

                <div style={{ padding: '4px 0' }}>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onReset();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      fontSize: 13,
                      color: '#344054',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.color = '#101828';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#344054';
                    }}
                  >
                    <RotateCcw size={14} color="#667085" /> Restart Assessment
                  </button>

                  <a
                    href="https://cyberxdelta.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      color: '#344054',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.color = '#101828';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#344054';
                    }}
                  >
                    <ExternalLink size={14} color="#667085" /> CyberXDelta Academy
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
