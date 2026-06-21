'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Eye, EyeOff, ArrowLeft, Mail, Lock, Key } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsParent, isLoggedIn } = useApp();
  const [mode, setMode] = useState<'teacher' | 'parent'>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!parentToken.trim()) {
      setError('Please enter your secure access token');
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
    <div className={styles.splitPage}>
      {/* Left Branding Section */}
      <div className={styles.brandSection} style={{ background: mode === 'parent' ? 'linear-gradient(135deg, var(--success), #059669)' : 'var(--primary-600)' }}>
        <div className={styles.brandHeader}>
          <span className={styles.brandIcon}>🕌</span>
          <span className={styles.brandText}>Swala Tracker</span>
        </div>
        
        <div className={styles.brandContent}>
          <h2 className={styles.quote}>
            {mode === 'teacher' 
              ? '"Empowering educators to guide the next generation with clarity and purpose."'
              : '"Stay connected with your child\'s journey in faith and knowledge."'}
          </h2>
          <p className={styles.author}>{mode === 'teacher' ? 'Teacher & Admin Portal' : 'Parent Portal'}</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className={styles.formSection}>
        <div className={styles.formWrapper}>
          
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className={styles.mobileBrand}>
            <span className={styles.brandIcon} style={{ color: mode === 'parent' ? 'var(--success)' : 'var(--primary-400)' }}>🕌</span>
            <span className={styles.brandText} style={{ color: 'var(--text-primary)' }}>Swala Tracker</span>
          </div>

          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Welcome back</h1>
            <p className={styles.formSubtitle}>
              {mode === 'teacher' ? 'Sign in to manage your classes and students.' : 'Enter your secure token to view your child\'s progress.'}
            </p>
          </div>

          <div className={styles.tabGroup}>
            <button 
              className={`${styles.tab} ${mode === 'teacher' ? styles.tabActive : ''}`} 
              onClick={() => { setMode('teacher'); setError(''); setSuccess(''); }}
            >
              Teacher Login
            </button>
            <button 
              className={`${styles.tab} ${mode === 'parent' ? styles.tabActive : ''}`} 
              onClick={() => { setMode('parent'); setError(''); setSuccess(''); }}
            >
              Parent Portal
            </button>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}
          {success && <div className={styles.successMsg}>{success}</div>}

          {/* Teacher Sign In Form */}
          {mode === 'teacher' && (
            <form className={styles.form} onSubmit={handleTeacherLogin}>
              <div className={styles.formGroup}>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input className="input" type="email" placeholder="ustadh@school.edu" value={email} onChange={e => setEmail(e.target.value)} autoFocus style={{ paddingLeft: 44, height: 52 }} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    className="input" type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password" value={password}
                    onChange={e => setPassword(e.target.value)} 
                    style={{ paddingLeft: 44, paddingRight: 44, height: 52 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4,
                  }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', height: 52, marginTop: 'var(--space-2)' }} disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Parent Sign In Form */}
          {mode === 'parent' && (
            <form className={styles.form} onSubmit={handleParentLogin}>
              <div className={styles.formGroup}>
                <label className="label">Access Token</label>
                <div style={{ position: 'relative' }}>
                  <Key size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input 
                    className="input" 
                    placeholder="e.g. token-abdullah-123" 
                    value={parentToken} 
                    onChange={e => setParentToken(e.target.value)} 
                    autoFocus 
                    style={{ paddingLeft: 44, height: 52 }}
                  />
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', height: 52, marginTop: 'var(--space-2)' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Access Portal'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
