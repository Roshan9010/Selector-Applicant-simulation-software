import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const Interview = () => {
  const { domain } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes timer

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    // Fetch questions
    api.get(`/questions/${encodeURIComponent(domain)}`)
       .then(res => setQuestions(res.data))
       .catch(err => console.error("Error fetching questions", err));

    // Request permissions and start stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Camera/Mic access denied", err);
        alert("Please grant camera and microphone access to continue.");
      });

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line
  }, [domain]);

  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (isRecording && timeLeft === 0) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
  }, [isRecording, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartRecording = () => {
    if (!mediaStream) return;
    
    chunksRef.current = [];
    const mimeType = 'video/webm;codecs=vp8,opus';
    const mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = handleUpload;

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      if (mediaRecorderRef.current && isRecording && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const handleUpload = async () => {
    setIsRecording(false);
    setProcessing(true);

    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const formData = new FormData();
    const userId = localStorage.getItem('user_id') || 1;
    
    formData.append('user_id', userId);
    formData.append('domain', domain);
    formData.append('video_file', blob, 'interview_cap.webm');
    formData.append('audio_file', blob, 'interview_cap.webm');

    try {
      const response = await api.post('/analyze/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const reportId = response.data.report?.id || 1; 
      navigate(`/results/${reportId}`, { state: { report: response.data.report } });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to analyze the interview. Please try again.");
      setProcessing(false);
    }
  };

  if (!questions.length) return <div className="app-container text-center">Loading Questions...</div>;

  return (
    <div className="app-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}>{domain} Interview</h2>
          <p className="text-muted">Domain Expertise Simulation</p>
        </div>

        <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '1rem', position: 'relative' }}>
          <div style={{ 
            position: 'absolute', top: '2rem', left: '2rem', zIndex: 10,
            background: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem'
          }}>
            {isRecording ? <span style={{ color: 'var(--error)' }}>● REC</span> : 'Camera Active'}
          </div>

          <video ref={videoRef} autoPlay muted playsInline style={{ 
              width: '100%', height: 'auto', borderRadius: '12px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transform: 'scaleX(-1)'
            }}
          />
        </div>

        <div className="glass-panel" style={{ width: '100%', maxWidth: '800px' }}>
          
          {processing ? (
            <div className="text-center" style={{ padding: '3rem 0' }}>
              <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>🤖 Analyzing Your Interview</h2>
              <p className="text-muted">Our AI is currently running your responses through the Facial Expression and Vocal Tone models...</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="text-muted" style={{ fontWeight: '600' }}>Question {currentIdx + 1} of {questions.length}</span>
                <span style={{ 
                  fontWeight: '800', 
                  color: timeLeft <= 60 ? 'var(--error)' : 'var(--accent-primary)', 
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  ⏱️ {formatTime(timeLeft)}
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                {questions[currentIdx].text}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                {!isRecording && currentIdx === 0 && (
                  <button className="btn btn-primary" style={{ background: 'var(--success)' }} onClick={handleStartRecording}>
                    Start Interview (Record)
                  </button>
                )}

                {isRecording && (
                  <button className="btn btn-primary" onClick={handleNext}>
                    {currentIdx < questions.length - 1 ? 'Next Question →' : 'Finish & Submit ✅'}
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Interview;
