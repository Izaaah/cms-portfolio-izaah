import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// ──────────────────────────────────────────────
// Auth Guard — redirect based on login state
// ──────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'auth' | 'unauth'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setStatus(user ? 'auth' : 'unauth');
    });
    return unsub;
  }, []);

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'unauth') return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setStatus(user ? 'auth' : 'unauth');
    });
    return unsub;
  }, []);

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'auth') return <Navigate to="/dashboard" replace />;
  return children;
}

// ──────────────────────────────────────────────
// Full-screen loading screen
// ──────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0b10',
      gap: '20px',
    }}>
      <div style={{
        width: '52px',
        height: '52px',
        background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid rgba(124,58,237,0.2)',
        borderTopColor: '#7c3aed',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}

// ──────────────────────────────────────────────
// App Router
// ──────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}