import React, { useState, useEffect } from 'react';
import { Clock, Network, BarChart3, FileCheck, GraduationCap } from 'lucide-react';
import { ORG_CONTACT_INFO } from '../services/api';

interface LandingProps {
  onStartClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStartClick }) => {
  const [animateBars, setAnimateBars] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateBars(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="screen active">
      <div className="hero">
        <div>
          <div
            className="eyebrow"
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: '#155eef',
              marginBottom: 10
            }}
          >
            CYBERXDELTA ACADEMY
          </div>

          <h1>
            Find the IAM skills <br />
            holding <span style={{ color: '#155eef' }}>your career back.</span>
          </h1>

          <p className="lead">
            A targeted diagnostic assessment built around industry-standard IAM platforms (Okta, Ping Identity, SailPoint, CyberArk, Microsoft Entra ID). Get a domain-level breakdown and direct recommendation for live cohorts.
          </p>

          <div className="actions">
            <button className="btn primary" onClick={onStartClick} style={{ padding: '12px 22px', fontSize: 15 }}>
              Start Free Assessment →
            </button>
          </div>

          {/* 4 Feature Pills Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 12,
              marginTop: 28
            }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e4e7ec',
                borderRadius: 12,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={16} color="#155eef" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#101828', lineHeight: 1.2 }}>10 Questions</div>
                <div style={{ fontSize: 11, color: '#667085', lineHeight: 1.2 }}>5–10 Minutes</div>
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e4e7ec',
                borderRadius: 12,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Network size={16} color="#155eef" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#101828', lineHeight: 1.2 }}>Covers 5 Major</div>
                <div style={{ fontSize: 11, color: '#667085', lineHeight: 1.2 }}>IAM Domains</div>
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e4e7ec',
                borderRadius: 12,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BarChart3 size={16} color="#155eef" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#101828', lineHeight: 1.2 }}>Personalized</div>
                <div style={{ fontSize: 11, color: '#667085', lineHeight: 1.2 }}>Learning Roadmap</div>
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e4e7ec',
                borderRadius: 12,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileCheck size={16} color="#155eef" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#101828', lineHeight: 1.2 }}>Instant Report</div>
                <div style={{ fontSize: 11, color: '#667085', lineHeight: 1.2 }}>with Recommendations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Card with Floating Badges */}
        <div style={{ position: 'relative' }}>
          <div
            className="preview"
            style={{
              position: 'relative',
              borderRadius: 20,
              padding: '28px 24px 34px'
            }}
          >
            {/* Top-Right Pill: Your IAM Readiness */}
            <div
              style={{
                position: 'absolute',
                top: -14,
                right: 24,
                background: '#155eef',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                padding: '5px 14px',
                borderRadius: 20,
                boxShadow: '0 4px 12px rgba(21, 94, 239, 0.3)'
              }}
            >
              Your IAM Readiness
            </div>

            <div
              className="score-ring"
              style={{
                background: animateBars
                  ? 'conic-gradient(#155eef 0 74%, #edf0f4 74% 100%)'
                  : 'conic-gradient(#155eef 0 0%, #edf0f4 0% 100%)',
                transition: 'background 1.1s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div>74%</div>
            </div>

            <div className="domain">
              <div className="domain-row">
                <span>Access & Federation (Ping/Okta)</span>
                <span>85%</span>
              </div>
              <div className="bar">
                <i style={{ width: animateBars ? '85%' : '0%', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }}></i>
              </div>
            </div>

            <div className="domain">
              <div className="domain-row">
                <span>SailPoint Identity Governance</span>
                <span>65%</span>
              </div>
              <div className="bar">
                <i style={{ width: animateBars ? '65%' : '0%', transition: 'width 1.1s cubic-bezier(0.16, 1, 0.3, 1)' }}></i>
              </div>
            </div>

            <div className="domain">
              <div className="domain-row">
                <span>CyberArk PAM</span>
                <span>50%</span>
              </div>
              <div className="bar">
                <i style={{ width: animateBars ? '50%' : '0%', transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}></i>
              </div>
            </div>
          </div>

          {/* Overlapping Floating Cohort Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: -18,
              right: 16,
              background: '#ffffff',
              border: '1px solid #e4e7ec',
              borderRadius: 12,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 20px -4px rgba(16, 24, 40, 0.12), 0 2px 6px -1px rgba(16, 24, 40, 0.04)',
              zIndex: 5
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#155eef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <GraduationCap size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#101828', lineHeight: 1.2 }}>Get Cohort Recommendations</div>
              <div style={{ fontSize: 11, color: '#667085', lineHeight: 1.2 }}>based on your gaps</div>
            </div>
          </div>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Targeted Tool Scenarios</h3>
          <p className="muted">
            Questions mirror real enterprise challenges with SAML, OAuth/OIDC, SailPoint certifications, and CyberArk vaults.
          </p>
        </div>
        <div className="card">
          <h3>Domain Gap Analytics</h3>
          <p className="muted">
            Identify exact weaknesses across fundamentals, SSO federation, compliance, and privileged access.
          </p>
        </div>
        <div className="card">
          <h3>Direct Cohort Matching</h3>
          <p className="muted">
            Receive matched CyberXDelta Academy masterclasses and 1:1 consultation with IAM leads.
          </p>
        </div>
      </div>

      {/* Support footer card */}
      <div style={{
        marginTop: 40,
        padding: '20px 24px',
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e4e7ec',
        boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ fontSize: 13, color: '#475467' }}>
          💬 Have questions about IAM tracks or cohorts? Reach our admissions team at{' '}
          <a href={`mailto:${ORG_CONTACT_INFO.email}`} style={{ color: '#155eef', fontWeight: 700 }}>
            {ORG_CONTACT_INFO.email}
          </a>{' '}
          or call{' '}
          <a href={`tel:${ORG_CONTACT_INFO.phone.replace(/\s+/g, '')}`} style={{ color: '#155eef', fontWeight: 700 }}>
            {ORG_CONTACT_INFO.displayPhone}
          </a>
        </div>
        <a
          href={ORG_CONTACT_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#25D366',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          WhatsApp Us
        </a>
      </div>
    </section>
  );
};
