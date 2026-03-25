import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';

const InvitationStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (!token) {
      alert('No invitation token provided');
      navigate('/resume-screening');
      return;
    }

    api.get(`/questions/invitations/status/${token}`)
      .then(res => {
        setStatus(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to load invitation status');
        navigate('/resume-screening');
      });
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="app-container text-center" style={{ padding: '5rem' }}>
        <h2>Loading invitation status...</h2>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="app-container">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate('/resume-screening')} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
          ← Back to Resume Screening
        </button>

        <div className="glass-panel" style={{ padding: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Invitation Status</h1>
          <p className="text-muted" style={{ marginBottom: '3rem' }}>Track candidate engagement with interview invitation</p>

          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Candidate Info */}
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Candidate Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Name</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{status.candidate_name}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{status.candidate_email}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Domain</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{status.domain}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Created</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                    {new Date(status.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {/* Link Opened Status */}
              <div style={{ 
                padding: '2rem', 
                background: status.is_opened ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: `2px solid ${status.is_opened ? 'var(--success)' : 'rgba(255,255,255,0.1)'}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {status.is_opened ? '✅' : '⏳'}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  {status.is_opened ? 'Link Opened!' : 'Not Opened Yet'}
                </h3>
                {status.is_opened && status.opened_at && (
                  <p className="text-muted">
                    {new Date(status.opened_at).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Interview Completed Status */}
              <div style={{ 
                padding: '2rem', 
                background: status.is_completed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: `2px solid ${status.is_completed ? 'var(--success)' : 'rgba(255,255,255,0.1)'}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {status.is_completed ? '🎉' : '📝'}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  {status.is_completed ? 'Interview Completed' : 'Interview Pending'}
                </h3>
                <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                  {status.is_completed ? 'Candidate has completed the interview' : 'Waiting for candidate to take interview'}
                </p>
              </div>
            </div>

            {/* Invitation Link */}
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Invitation Link</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={`http://localhost:5173/interview/${status.domain}?token=${status.token || 'N/A'}`}
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontFamily: 'monospace'
                  }}
                />
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigator.clipboard.writeText(`http://localhost:5173/interview/${status.domain}?token=${status.token || window.location.search.split('=')[1]}`)}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const mailtoLink = `mailto:${status.candidate_email}?subject=Interview Invitation - ${status.domain}&body=Hi ${status.candidate_name},%0D%0A%0D%0AClick here to start your interview: http://localhost:5173/interview/${status.domain}?token=${status.token || window.location.search.split('=')[1]}%0D%0A%0D%0ABest regards`;
                  window.open(mailtoLink);
                }}
              >
                ✉️ Email Candidate
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
              >
                🔄 Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationStatus;
