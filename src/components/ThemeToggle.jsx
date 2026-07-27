import { useTheme } from '../contexts/ThemeContext';

/**
 * Tombol toggle dark/light mode.
 * Props:
 *   size    — 'sm' | 'md' (default 'md')
 *   variant — 'pill' | 'icon' (default 'pill')
 */
export default function ThemeToggle({ size = 'md', variant = 'pill' }) {
  const { theme, toggle, isDark } = useTheme();

  const sm = size === 'sm';

  if (variant === 'icon') {
    return (
      <button
        onClick={toggle}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle theme"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: sm ? '6px' : '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          flexShrink: 0,
        }}
      >
        {isDark ? <SunIcon size={sm ? 15 : 18} /> : <MoonIcon size={sm ? 15 : 18} />}
      </button>
    );
  }

  // variant === 'pill'
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: sm ? '6px' : '8px',
        padding: sm ? '5px 10px' : '7px 14px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '999px',
        cursor: 'pointer',
        fontSize: sm ? '12px' : '13px',
        fontWeight: '500',
        fontFamily: 'Inter, sans-serif',
        color: 'var(--text-secondary)',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Track */}
      <div style={{
        width: sm ? '28px' : '34px',
        height: sm ? '16px' : '20px',
        background: isDark ? 'rgba(124,58,237,0.25)' : 'rgba(251,191,36,0.25)',
        borderRadius: '999px',
        position: 'relative',
        border: `1px solid ${isDark ? 'rgba(124,58,237,0.4)' : 'rgba(251,191,36,0.5)'}`,
        transition: 'background 300ms ease, border-color 300ms ease',
        flexShrink: 0,
      }}>
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: '50%',
          transform: `translateY(-50%) translateX(${isDark ? (sm ? '14px' : '16px') : '1px'})`,
          width: sm ? '10px' : '14px',
          height: sm ? '10px' : '14px',
          borderRadius: '50%',
          background: isDark ? '#a78bfa' : '#fbbf24',
          boxShadow: isDark ? '0 0 6px rgba(167,139,250,0.6)' : '0 0 6px rgba(251,191,36,0.6)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), background 300ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        </div>
      </div>
      <span style={{ color: 'var(--text-secondary)' }}>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}

function SunIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
      <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function MoonIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}
