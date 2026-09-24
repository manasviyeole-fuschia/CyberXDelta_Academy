import React, { useState } from 'react';

interface RoleSelectProps {
  onContinue: (role: string) => void;
}

const TRACKS = [
  {
    letter: "A",
    title: "Fresher / Student",
    desc: "Building IAM fundamentals or looking for your first role."
  },
  {
    letter: "B",
    title: "Analyst / Engineer",
    desc: "Working with IAM, SSO, governance or identity operations."
  },
  {
    letter: "C",
    title: "Senior / Architect",
    desc: "Designing identity architecture, controls or multi-product environments."
  }
];

export const RoleSelect: React.FC<RoleSelectProps> = ({ onContinue }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <section className="screen active">
      <div className="quiz-wrap">
        <div className="eyebrow">Step 1 of 3</div>
        <h2>Which track best describes you?</h2>
        <p className="lead">
          This only changes the question mix and recommendation. You can start without creating an account.
        </p>

        <div style={{ marginTop: 28 }}>
          {TRACKS.map((t) => {
            const isSelected = selectedRole === t.title;
            return (
              <button
                key={t.title}
                className={`option ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedRole(t.title)}
              >
                <b>{t.letter}</b>
                <strong>{t.title}</strong>
                <br />
                <span className="muted">{t.desc}</span>
              </button>
            );
          })}
        </div>

        <button
          className="btn primary"
          style={{ marginTop: 18 }}
          disabled={!selectedRole}
          onClick={() => selectedRole && onContinue(selectedRole)}
        >
          Continue
        </button>
      </div>
    </section>
  );
};
