import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainMenu from './pages/MainMenu';
import Dashboard from './pages/Dashboard';
import ResumeScreening from './pages/ResumeScreening';
import Interview from './pages/Interview';
import Results from './pages/Results';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/home" />} />
          
          <Route path="/home" element={
            <PrivateRoute>
              <MainMenu />
            </PrivateRoute>
          } />

          <Route path="/mock-sessions" element={
             <PrivateRoute>
               <Dashboard />
             </PrivateRoute>
          } />

          <Route path="/resume-filtering" element={
             <PrivateRoute>
               <ResumeScreening />
             </PrivateRoute>
          } />
          
          <Route path="/interview/:domain" element={
            <PrivateRoute>
              <Interview />
            </PrivateRoute>
          } />
          
          <Route path="/results/:reportId" element={
            <PrivateRoute>
              <Results />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
