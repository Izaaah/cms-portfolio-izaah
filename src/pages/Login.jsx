import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Email atau password salah.'
        : err.code === 'auth/user-not-found'
        ? 'Akun tidak ditemukan.'
        : err.code === 'auth/too-many-requests'
        ? 'Terlalu banyak percobaan. Coba lagi nanti.'
        : 'Login gagal. Cek kembali kredensial kamu.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Theme toggle — top right */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 20 }}>
        <ThemeToggle size="sm" />
      </div>

      {/* Animated background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      {/* Grid pattern overlay */}
      <div style={styles.gridOverlay} />

      {/* Login card */}
      <div style={styles.card} className="animate-scale-in">
        {/* Logo */}
        <div style={styles.logoWrapper}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 style={styles.logoTitle}>CMS Portofolio</h1>
            <p style={styles.logoSub}>Panel Admin</p>
          </div>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.heading}>Selamat Datang</h2>
        <p style={styles.subheading}>Masuk untuk mengelola portofolio kamu</p>

        {error && (
          <div style={styles.errorBox} className="animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          {/* Email field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="email">Email</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                required
                style={styles.input}
                onFocus={e => Object.assign(e.target.style, styles.inputFocused)}
                onBlur={e => Object.assign(e.target.style, { borderColor: 'rgba(255,255,255,0.08)', boxShadow: 'none' })}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
                onFocus={e => Object.assign(e.target.style, styles.inputFocused)}
                onBlur={e => Object.assign(e.target.style, { borderColor: 'rgba(255,255,255,0.08)', boxShadow: 'none' })}
              />
              <button
                type="button"
                style={styles.togglePass}
                onClick={() => setShowPass(!showPass)}
                aria-label="Toggle password"
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
            onMouseEnter={e => !loading && Object.assign(e.target.style, styles.submitBtnHover)}
            onMouseLeave={e => !loading && Object.assign(e.target.style, { background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', transform: 'translateY(0)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' })}
          >
            {loading ? (
              <span style={styles.spinnerWrapper}>
                <span style={styles.spinner} />
                Memproses...
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Masuk ke Dashboard
              </>
            )}
          </button>
        </form>

        <p style={styles.footerNote}>
          © 2025 Izaah Portfolio CMS · Hanya untuk admin
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-base)',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
  },
  blob1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
    borderRadius: '50%',
    top: '-100px',
    left: '-100px',
    animation: 'blobMove 12s ease-in-out infinite',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    bottom: '-80px',
    right: '-80px',
    animation: 'blobMove 15s ease-in-out infinite reverse',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  blob3: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    top: '50%',
    left: '60%',
    animation: 'float 8s ease-in-out infinite',
    filter: 'blur(30px)',
    pointerEvents: 'none',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '420px',
    background: 'var(--bg-surface)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid var(--border)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: 'var(--shadow-lg), 0 0 0 1px var(--accent-subtle)',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '28px',
  },
  logoIcon: {
    width: '52px',
    height: '52px',
    background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
    flexShrink: 0,
  },
  logoTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    margin: 0,
  },
  logoSub: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: 0,
    marginTop: '2px',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    marginBottom: '28px',
  },
  heading: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.03em',
    marginBottom: '6px',
  },
  subheading: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '28px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.25)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#f87171',
    fontSize: '13px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#c0c0d0',
    letterSpacing: '0.01em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#5a5e78',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '13px 14px 13px 44px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'all 200ms ease',
    letterSpacing: '0.01em',
  },
  inputFocused: {
    borderColor: 'rgba(124,58,237,0.6)',
    boxShadow: '0 0 0 3px rgba(124,58,237,0.15)',
  },
  togglePass: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '4px',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
    marginTop: '4px',
  },
  submitBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 28px rgba(124,58,237,0.55)',
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
  },
  spinnerWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  footerNote: {
    marginTop: '28px',
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
};
