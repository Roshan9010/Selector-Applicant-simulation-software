import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../index.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        // OAuth2 expects Form Data for Login
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await api.post('/auth/login', formData);
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('username', username);
        localStorage.setItem('role', response.data.role);
        // Save user_id if present
        if (response.data.user_id) localStorage.setItem('user_id', response.data.user_id);
        navigate('/home');
      } else {
        // Register expects JSON body
        await api.post('/auth/register', { username, password, role });
        // Automatically switch to login on success
        setIsLogin(true);
        setErrorMsg('Registration successful! Please log in.');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.5s ease' }}>
        <h2 className="text-center mb-1">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-muted mb-4">
          Applicant Simulation Platform
        </p>

        {errorMsg && (
          <div style={{ 
            color: errorMsg.includes('successful') ? 'var(--success)' : 'var(--error)', 
            marginBottom: '1rem', 
            textAlign: 'center',
            fontSize: '0.875rem'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <label className="input-label">I am a...</label>
              <select 
                className="input-field"
                style={{ background: '#1a1a2e', color: '#fff' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="candidate">Candidate (Practice Interviews)</option>
                <option value="admin">Admin (Recruiter / Filter Resumes)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
              style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '500' }}
            >
              {isLogin ? 'Register Here' : 'Login Here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
