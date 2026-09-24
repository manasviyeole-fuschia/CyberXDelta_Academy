import React from 'react';
import { ORG_CONTACT_INFO } from '../services/api';

interface LandingProps {
  onStartClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStartClick }) => {
  return (
    <section className="screen active">
      <div className="hero">
        <div>
          <div className="eyebrow">CyberXDelta Academy · Free IAM Skill Diagnostic</div>
          <h1>Find the IAM skills holding your career back.</h1>
          <p className="lead">
            A targeted diagnostic assessment built around industry-standard IAM platforms (Okta, Ping Identity, SailPoint, CyberArk, Microsoft Entra ID). Get a domain-level breakdown and direct recommendation for live cohorts.
          </p>
          <div className="actions">
            <button className="btn primary" onClick={onStartClick}>
              Start Free Assessment →
            </button>
            <a
              href={ORG_CONTACT_INFO.coursesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn secondary"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Browse All Courses ↗
            </a>
          </div>
          <div className="micro" style={{ marginTop: 16 }}>
            10 questions · Covers IAM Fundamentals, SSO & Federation, Governance (IGA), PAM · Instant Report
          </div>
        </div>

        <div className="preview">
          <div className="mini-head">
            <strong>Diagnostic Readiness Profile</strong>
            <span className="pill">Sample Score</span>
          </div>
          <div className="score-ring">
            <div>74%</div>
          </div>
          <div className="domain">
            <div className="domain-row">
              <span>Access & Federation (Ping/Okta)</span>
              <span>85%</span>
            </div>
            <div className="bar">
              <i style={{ width: '85%' }}></i>
            </div>
          </div>
          <div className="domain">
            <div className="domain-row">
              <span>SailPoint Identity Governance</span>
              <span>65%</span>
            </div>
            <div className="bar">
              <i style={{ width: '65%' }}></i>
            </div>
          </div>
          <div className="domain">
            <div className="domain-row">
              <span>CyberArk PAM</span>
              <span>50%</span>
            </div>
            <div className="bar">
              <i style={{ width: '50%' }}></i>
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
        background: '#f8fafc',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
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
            padding: '8px 14px',
            borderRadius: 6,
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
