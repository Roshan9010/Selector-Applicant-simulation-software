import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const ResumeScreening = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [lastInvitationToken, setLastInvitationToken] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    
    setAnalyzing(true);
    
    const formData = new FormData();
    formData.append('skills', skills);
    formData.append('experience', experience || 0);
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const res = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 2 minutes timeout for large batches
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || "Error analyzing resumes. Make sure they are valid documents.";
      alert(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendInvitation = async (candidateEmail, candidateFilename) => {
    const domain = prompt("Enter interview domain (e.g., Python, Java, ML):", "Python");
    if (!domain) return;
    
    const candidateName = prompt("Enter candidate name:", candidateFilename.split('.')[0]);
    if (!candidateName) return;
    
    setSendingInvite(true);
    try {
      const formData = new FormData();
      formData.append('candidate_email', candidateEmail);
      formData.append('candidate_name', candidateName);
      formData.append('domain', domain);
      
      const res = await api.post('/questions/create-invitation', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const inviteLink = res.data.invitation_link;
      const token = res.data.token;
      
      // Copy link to clipboard
      navigator.clipboard.writeText(inviteLink);
      setLastInvitationToken(token);
      alert(`Invitation link created and copied to clipboard!\n\nLink: ${inviteLink}\n\nYou can now email this link to the candidate.\n\nTrack status at: http://localhost:5173/invitation-status?token=${token}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create invitation. Please try again.");
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Smart Filter
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>AI-driven resume shortlisting at scale</p>
        </div>
        <button onClick={() => navigate('/home')} className="btn btn-secondary">
          <span style={{ marginRight: '0.5rem' }}>←</span> Back to Menu
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: results ? '1fr' : '1fr', gap: '2rem', justifyContent: 'center' }}>
        {!results && !analyzing && (
          <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
               <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Screening Parameters</h2>
               <p className="text-muted">Set your mandatory requirements for the ideal candidate</p>
            </div>

            <form onSubmit={handleUpload}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Required Skills (Comma separated)</label>
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="e.g. React, Node.js, AWS, Python"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    required
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 'bold' }}>
                     * All skills must be present in the document
                  </p>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Min. Experience</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number" 
                      className="input-field"
                      placeholder="Years"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                      min="0"
                      step="0.5"
                    />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>Years</span>
                  </div>
                </div>
              </div>

              <div style={{ 
                border: '2px dashed var(--glass-border)', 
                borderRadius: '16px', 
                padding: '3rem 2rem', 
                textAlign: 'center', 
                marginBottom: '2.5rem',
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onDragOver={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.05)'}
              onDragLeave={(e) => e.target.style.background = 'transparent'}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Upload Documents</h3>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>Drag & drop folders or multiple PDF/DOCX files</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                   <label className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                     Select Files
                     <input type="file" multiple accept=".pdf,.docx,.txt,.csv" onChange={(e) => setFiles(e.target.files)} style={{ display: 'none' }} />
                   </label>
                   <label className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                     Select Folder
                     <input type="file" webkitdirectory="true" directory="true" multiple onChange={(e) => setFiles(e.target.files)} style={{ display: 'none' }} />
                   </label>
                </div>

                {files.length > 0 && (
                  <div style={{ marginTop: '1.5rem', color: 'var(--success)', fontWeight: '600' }}>
                    ✨ {files.length} document(s) loaded and ready
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem' }}>
                Run Match Intelligence Analysis
              </button>
            </form>
          </div>
        )}

        {analyzing && (
          <div className="glass-panel" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '5rem 3rem' }}>
             <div className="spinner" style={{ 
               width: '50px', 
               height: '50px', 
               border: '4px solid rgba(255,255,255,0.1)', 
               borderTopColor: 'var(--accent-primary)', 
               borderRadius: '50%',
               margin: '0 auto 2rem auto',
               animation: 'spin 1s linear infinite'
             }}></div>
             <h2 style={{ marginBottom: '1rem' }}>Analyzing Talent Corpus</h2>
             <p className="text-muted">Running NLP semantic matching against your requirements...</p>
             <style>{`
               @keyframes spin { to { transform: rotate(360deg); } }
             `}</style>
          </div>
        )}

        {results && (
          <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
               <div>
                  <h2 style={{ fontSize: '2rem' }}>Shortlisted Candidates</h2>
                  <p className="text-muted">Ranked by requirements match score</p>
               </div>
               <button className="btn btn-secondary" onClick={() => { setResults(null); setFiles([]); }}>
                  New Search
               </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '1.5rem' }}>
              {results.map((cand, idx) => (
                <div key={idx} className="glass-panel" style={{ textAlign: 'left', padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                       <h4 style={{ fontSize: '1.3rem', marginBottom: '0.25rem', color: '#fff' }}>{cand.filename.split('.')[0]}</h4>
                       <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cand.email}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{cand.score}%</div>
                       <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Match Score</div>
                    </div>
                  </div>

                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                     <div style={{ width: `${cand.score}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}></div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                     <span style={{ 
                       padding: '0.4rem 0.8rem', 
                       background: 'rgba(34, 197, 94, 0.1)', 
                       color: 'var(--success)', 
                       borderRadius: '8px', 
                       fontSize: '0.85rem', 
                       fontWeight: '600',
                       display: 'inline-block'
                     }}>
                       Role: {cand.inferred_category}
                     </span>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleSendInvitation(cand.email, cand.filename)}
                    disabled={sendingInvite}
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    {sendingInvite ? 'Creating Link...' : '📧 Send Interview Invitation'}
                  </button>

                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Analysis Feed: </span>
                      {cand.feedback}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeScreening;

