'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { ArrowRight, BookOpen, HeartPulse, Activity, ShieldCheck, BarChart3, LayoutDashboard } from 'lucide-react';
import styles from './landing.module.css';

export default function LandingPage() {
  const { isLoggedIn, loginRole } = useApp();

  return (
    <div className={styles.landingPage}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🕌</span>
          <span className={styles.brandText}>Swala Tracker</span>
        </div>
        <div className={styles.navActions}>
          {isLoggedIn ? (
            <Link href={loginRole === 'parent' ? '/parent' : '/dashboard'} className={styles.navBtn}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>Parent Portal</Link>
              <Link href="/login" className={styles.navBtn}>Teacher Login</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={`${styles.badge} animate-in`}>
            <ShieldCheck size={16} /> Secure & Private
          </div>
          <h1 className={`${styles.heroTitle} animate-in animate-in-delay-1`}>
            Modern Tracking for <br/> Islamic Education
          </h1>
          <p className={`${styles.heroDescription} animate-in animate-in-delay-2`}>
            Empower your institution with a clean, intuitive platform to track daily prayers, attendance, behaviour, and Quran memorization.
          </p>
          <div className={`${styles.heroActions} animate-in animate-in-delay-3`}>
            {isLoggedIn ? (
              <Link href={loginRole === 'parent' ? '/parent' : '/dashboard'} className={styles.primaryBtn}>
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link href="/login" className={styles.primaryBtn}>
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link href="/login" className={styles.secondaryBtn}>
                  View Demo
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={`${styles.sectionHeader} animate-in animate-in-delay-4`}>
          <h2>Everything you need, simplified</h2>
          <p>Designed for mobile and built for speed, making daily logging effortless.</p>
        </div>
        
        <div className={`${styles.featuresGrid} animate-in animate-in-delay-5`}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <HeartPulse size={24} className={styles.featureIcon} />
            </div>
            <h3>Prayer Logs</h3>
            <p>Track Fardh and Sunnah prayers effortlessly. Help students build consistent habits.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <BookOpen size={24} className={styles.featureIcon} />
            </div>
            <h3>Quran & Academics</h3>
            <p>Log memorization progress, Islamic studies homework, and class participation.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Activity size={24} className={styles.featureIcon} />
            </div>
            <h3>Real-time Parent Access</h3>
            <p>Keep parents informed instantly with secure access to their child's daily reports.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <BarChart3 size={24} className={styles.featureIcon} />
            </div>
            <h3>Analytics & Trends</h3>
            <p>Spot behavioral trends and attendance patterns with intuitive dashboards.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>🕌</span>
            <span className={styles.brandText}>Swala Tracker</span>
          </div>
          <p className={styles.copyright}>© {new Date().getFullYear()} Swala Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
