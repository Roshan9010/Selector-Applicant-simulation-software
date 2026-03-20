import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Dashboard = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await api.get('/questions/domains');
        setDomains(res.data.domains);
      } catch (err) {
        console.error("Failed to fetch domains", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDomains();
  }, []);

  const startInterview = (domain) => {
    navigate(`/interview/${encodeURIComponent(domain)}`);
  };

  const getDomainIcon = (domain) => {
    switch (domain) {
      case 'Machine Learning': return '🤖';
      case 'Java': return '☕';
      case 'Python': return '🐍';
      case 'SQL': return '🗄️';
      case 'Frontend': return '🎨';
      case 'JavaScript': return '📜';
      case 'C': return '🧩';
      case 'Deep Learning': return '🧠';
      case 'ReactJs': return '⚛️';
      default: return '📝';
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '90vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Interview Hub
          </h1>
          <p className="text-muted" style={{ fontSize: '1.2rem' }}>
            Ready for your session, <span style={{ color: '#fff', fontWeight: '600' }}>{username}</span>?
          </p>
        </div>
        <button onClick={() => navigate('/home')} className="btn btn-secondary">
          <span style={{ marginRight: '0.5rem' }}>←</span> Exit to Home
        </button>
      </header>

      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2rem' }}>🎯</span> Choose Your Domain
        </h2>
        <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '800px' }}>
          Select a specialized technical path below. Our AI will guide you through a real-world interview simulation with live feedback.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div className="spinner" style={{ 
            width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', 
            borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto' 
          }}></div>
          <p className="text-muted">Initializing domain library...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {domains.map((domain, index) => (
            <div 
              key={index} 
              className="glass-panel" 
              style={{ 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2.5rem 2rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'rgba(255, 255, 255, 0.02)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onClick={() => startInterview(domain)}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '3.5rem', 
                  marginBottom: '1.5rem',
                  filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))'
                }}>
                  {getDomainIcon(domain)}
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff' }}>{domain}</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>
                  Systematic analysis of {domain} fundamentals and advanced concepts.
                </p>
              </div>
              
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.8rem', opacity: 0.6, marginBottom: '1.5rem' }}>
                   <span>⏱️ 10 Mins</span>
                   <span>❓ 10 Qs</span>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.8rem' }}
                  onClick={(e) => { e.stopPropagation(); startInterview(domain); }}
                >
                  Start Assessment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .glass-panel:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--accent-primary) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(99, 102, 241, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

