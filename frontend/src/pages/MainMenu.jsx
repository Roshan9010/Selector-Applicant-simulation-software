import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainMenu = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Applicant Simulation Platform</h1>
          <p className="text-muted">
            Welcome back, <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{username}</span> 
            <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px', marginLeft: '10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>
              {role}
            </span>
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', mt: '4rem' }}>
        
        {/* Mock Sessions Portal - Only for Candidates */}
        {role === 'candidate' && (
          <div 
            className="glass-panel" 
            style={{ cursor: 'pointer', textAlign: 'center', padding: '4rem 2rem', transition: 'transform 0.3s ease' }}
            onClick={() => navigate('/mock-sessions')}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎥</div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-main)' }}>AI Mock Sessions</h2>
            <p className="text-muted">Engage in video-proctored domain interviews analyzed dynamically by our Facial and Vocal ML engines.</p>
            <button className="btn btn-primary" style={{ marginTop: '2rem', width: '80%' }}>Enter Mock Sessions</button>
          </div>
        )}

        {/* Resume Filtering Portal - Only for Admins */}
        {role === 'admin' && (
          <div 
            className="glass-panel" 
            style={{ cursor: 'pointer', textAlign: 'center', padding: '4rem 2rem', transition: 'transform 0.3s ease' }}
            onClick={() => navigate('/resume-filtering')}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📄</div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Resume Filtering</h2>
            <p className="text-muted">Upload candidate CV documents to evaluate internal ATS match density and structural compliance organically.</p>
            <button className="btn btn-primary" style={{ marginTop: '2rem', width: '80%' }}>Enter Resume Filter</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MainMenu;
