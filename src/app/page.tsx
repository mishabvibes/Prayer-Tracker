'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { ArrowRight, BookOpen, HeartPulse, Activity, Sparkles, LayoutDashboard } from 'lucide-react';
import styles from './landing.module.css';

export default function LandingPage() {
  const { isLoggedIn, loginRole } = useApp();

  return (
    <div className={styles.landingPage}>
      <div className={styles.heroBackground}>
        <div className={styles.meshOrb1} />
        <div className={styles.meshOrb2} />
      </div>

      <nav className={styles.nav}>
        <div className={styles.brand}>
          <span style={{ fontSize: '1.5rem' }}>🕌</span>
          <span>Swala Tracker</span>
          <span className={styles.brandAr}>جدول السير والسلوك</span>
        </div>
        <div className={styles.navActions}>
          {isLoggedIn ? (
            <Link href={loginRole === 'parent' ? '/parent' : '/dashboard'} className="btn btn-primary">
              <LayoutDashboard size={16} /> Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-glass">Parent Login</Link>
              <Link href="/login" className="btn btn-primary">Teacher Login</Link>
            </>
          )}
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={`${styles.badge} animate-in`}>
          <Sparkles size={16} /> Modern Islamic Education Tracking
        </div>

        <h1 className={`${styles.title} animate-in animate-in-delay-1`}>
          Nurture Faith and <br />
          <span className={styles.titleHighlight}>Excellence</span>
        </h1>

        <p className={`${styles.description} animate-in animate-in-delay-2`}>
          The complete digital companion for Islamic schools and Halaqas. Seamlessly track daily prayers, attendance, behaviour, and homework with a beautiful, modern interface.
        </p>

        <div className={`${styles.ctaGroup} animate-in animate-in-delay-3`}>
          {isLoggedIn ? (
            <Link href={loginRole === 'parent' ? '/parent' : '/dashboard'} className="btn btn-primary btn-lg">
              Open Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary btn-lg">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="btn btn-glass btn-lg">
                Access Parent Portal
              </Link>
            </>
          )}
        </div>

        <div className={`${styles.featuresGrid} animate-in animate-in-delay-4`}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-400)' }}>
              <HeartPulse size={24} />
            </div>
            <h3 className={styles.featureTitle}>Prayer Tracking</h3>
            <p className={styles.featureDesc}>
              Monitor Fardh, Sunnah Rawatib, and Jama'ah prayers daily. Instantly spot trends and encourage consistency in student worship.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-400)' }}>
              <BookOpen size={24} />
            </div>
            <h3 className={styles.featureTitle}>Homework & Records</h3>
            <p className={styles.featureDesc}>
              Keep a structured log of Quran memorization and Islamic studies assignments. Mark as submitted, missing, or late with one click.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <Activity size={24} />
            </div>
            <h3 className={styles.featureTitle}>Parent Portal</h3>
            <p className={styles.featureDesc}>
              Provide parents with secure, unique access tokens. Let them view their child's progress, teacher notes, and attendance in real-time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
