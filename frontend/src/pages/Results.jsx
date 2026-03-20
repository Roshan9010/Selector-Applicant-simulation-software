import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const report = location.state?.report;

  if (!report) {
    return (
      <div className="app-container text-center" style={{ marginTop: '10vh' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
        <h2 style={{ fontSize: '2rem' }}>Report Not Found</h2>
        <p className="text-muted">Oops! We couldn't find your interview analytics.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const scoreColor = report.overall_score > 80 ? 'var(--success)' : 
                     report.overall_score > 60 ? '#f59e0b' : 'var(--error)';
  
  const getScoreMessage = (score) => {
    if (score > 85) return "Exceptional Confidence & Presence";
    if (score > 70) return "Solid Professional Performance";
    return "Foundation Level - Keep Practicing!";
  };

  return (
    <div className="app-container" style={{ paddingBottom: '5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Interview Insights
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>AI-driven Performance Analytics for <strong>{report.domain}</strong></p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          Return to Dashboard
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2.5rem' }}>
        
        {/* Score Ring Section */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%)'
        }}>
          <div style={{ 
            width: '240px', 
            height: '240px', 
            borderRadius: '50%', 
            border: `12px solid rgba(255,255,255,0.05)`,
            borderTopColor: scoreColor,
            borderRightColor: scoreColor,
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            boxShadow: `0 0 50px -10px ${scoreColor}40`
          }}>
            <div style={{ fontSize: '5rem', fontWeight: '800', lineHeight: 1, letterSpacing: '-0.05em' }}>
              {report.overall_score.toFixed(0)}
            </div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.6, marginTop: '0.5rem' }}>
              Overall Score
            </div>
          </div>
          
          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: scoreColor }}>{getScoreMessage(report.overall_score)}</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Aggregate confidence metric based on facial cues and vocal tonality.</p>
          </div>
        </div>

        {/* Detailed Feedback Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ 
            position: 'relative', 
            overflow: 'hidden',
            borderRight: '1px solid rgba(255,255,255,0.05)' 
          }}>
            <div style={{ 
              position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', 
              background: 'linear-gradient(to bottom, var(--accent-primary), transparent)' 
            }}></div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '2.5rem' }}>🎭</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: '700' }}>Facial Expression Insights</h3>
                <p style={{ lineHeight: '1.7', color: 'var(--text-main)', fontSize: '1.1rem', opacity: 0.9 }}>
                  {report.facial_feedback}
                </p>
                <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Captured key micro-expressions used to infer confidence levels and focus.
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ 
            position: 'relative', 
            overflow: 'hidden',
            borderRight: '1px solid rgba(255,255,255,0.05)' 
          }}>
            <div style={{ 
              position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', 
              background: 'linear-gradient(to bottom, var(--accent-secondary), transparent)' 
            }}></div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '2.5rem' }}>🎤</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: '700' }}>Vocal Dynamics</h3>
                <p style={{ lineHeight: '1.7', color: 'var(--text-main)', fontSize: '1.1rem', opacity: 0.9 }}>
                  {report.vocal_feedback}
                </p>
                <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Acoustic analysis focused on pitch variance, volume consistency, and speech pace.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <div className="text-center" style={{ marginTop: '4rem' }}>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Would you like to try another session or refine your current domain knowledge?</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Try Another Domain
          </button>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            Download Report (PDF)
          </button>
        </div>
      </div>

    </div>
  );
};

export default Results;

