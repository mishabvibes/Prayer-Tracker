'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Eye, EyeOff, Link2, UserPlus } from 'lucide-react';
import { useApp } from '@/lib/context';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, loginAsParent, isLoggedIn } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [parentToken, setParentToken] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isLoggedIn) router.push('/');
  }, [isLoggedIn, router]);

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !password.trim() || !name.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const err = await signup(email, password, name);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess('Account created! Check your email for a confirmation link, then sign in.');
      setMode('login');
    }
  };

  const handleParentLogin = async () => {
    setError('');
    if (!parentToken.trim()) {
      setError('Please enter a parent access token');
      return;
    }
    setLoading(true);
    const success = await loginAsParent(parentToken);
    setLoading(false);
    if (success) {
      router.push('/parent');
    } else {
      setError('Invalid parent token. Please check the link sent by your teacher.');
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          {/* Brand */}
          <div className={styles.loginBrand}>
            <div className={styles.loginIcon}>🕌</div>
            <h1 className={styles.loginTitle}>Swala Tracker</h1>
            <p className={styles.loginSubtitle}>جدول السير والسلوك</p>
          </div>

          {/* Messages */}
          {error && <div className={styles.errorMsg}>{error}</div>}
          {success && (
            <div style={{
              padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
              background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)',
              fontSize: '0.8125rem', border: '1px solid rgba(52, 211, 153, 0.2)',
              marginBottom: 'var(--space-4)',
            }}>{success}</div>
          )}

          {/* Toggle Login / Signup */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
            <button
              className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => { setMode('login'); setError(''); }}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              className={`btn btn-sm ${mode === 'signup' ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => { setMode('signup'); setError(''); }}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <UserPlus size={14} /> Sign Up
            </button>
          </div>

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form className={styles.loginForm} onSubmit={handleSignup}>
              <div className={styles.formGroup}>
                <label className="label">Your Name</label>
                <input className="input" placeholder="Ustadh Ahmad" value={name} onChange={e => setName(e.target.value)} autoFocus />
              </div>
              <div className={styles.formGroup}>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="ustadh@school.edu" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Creating Account...' : <><UserPlus size={18} /> Create Account</>}
              </button>
            </form>
          )}

          {/* Sign In Form */}
          {mode === 'login' && (
            <form className={styles.loginForm} onSubmit={handleTeacherLogin}>
              <div className={styles.formGroup}>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="ustadh@school.edu" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
              <div className={styles.formGroup}>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input" type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password" value={password}
                    onChange={e => setPassword(e.target.value)} style={{ paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4,
                  }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Signing In...' : <><LogIn size={18} /> Sign In</>}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className={styles.loginDivider}><span>or</span></div>

          {/* Parent Magic Link */}
          <div className={styles.parentSection}>
            <div className={styles.parentTitle}><Link2 size={14} /> Parent Access (Magic Token)</div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input className="input" placeholder="Enter parent token..." value={parentToken} onChange={e => setParentToken(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-glass" onClick={handleParentLogin} disabled={loading}>View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
