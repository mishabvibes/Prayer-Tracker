'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Users, CalendarDays, CheckCircle2, TrendingUp,
  TrendingDown, Plus, ClipboardList, Activity,
  Clock, BookOpen,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import {
  getAttendanceRate, getPrayerCompletionRate,
  getAvgBehaviour, getHomeworkRate,
} from '@/lib/mock-data';
import { FARDH_PRAYERS, PRAYER_LABELS, DailyRecord } from '@/lib/types';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const { students, records, homeworks, selectedMonth, selectedYear, classInfo, teacher, hasClass, dataLoading } = useApp();

  const monthRecords = useMemo(() => {
    return records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [records, selectedMonth, selectedYear]);

  const overallAttendance = useMemo(() => getAttendanceRate(monthRecords), [monthRecords]);
  const overallPrayer = useMemo(() => getPrayerCompletionRate(monthRecords), [monthRecords]);
  const overallBehaviour = useMemo(() => getAvgBehaviour(monthRecords), [monthRecords]);
  const overallHomework = useMemo(() => getHomeworkRate(homeworks), [homeworks]);

  // Prayer completion per prayer
  const prayerStats = useMemo(() => {
    return FARDH_PRAYERS.map(prayer => {
      const total = monthRecords.filter(r => r[prayer] !== null).length;
      const done = monthRecords.filter(r => r[prayer] === 1).length;
      return {
        name: PRAYER_LABELS[prayer],
        key: prayer,
        percent: total === 0 ? 0 : Math.round((done / total) * 100),
      };
    });
  }, [monthRecords]);

  // Top students by prayer completion
  const topStudents = useMemo(() => {
    return students.map(s => {
      const sRecords = monthRecords.filter(r => r.studentId === s.id);
      const rate = getPrayerCompletionRate(sRecords);
      return { ...s, prayerRate: rate };
    }).sort((a, b) => b.prayerRate - a.prayerRate).slice(0, 5);
  }, [students, monthRecords]);

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('en', { month: 'long', year: 'numeric' });

  const prayerColors = ['var(--prayer-fajr)', 'var(--prayer-dhuhr)', 'var(--prayer-asr)', 'var(--prayer-maghrib)', 'var(--prayer-isha)'];

  return (
    <div>
      {/* No Class Assigned */}
      {!hasClass && (
        <div className="glass-panel-static animate-in" style={{ padding: 'var(--space-8)', maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-5)' }}>🕌</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>Welcome to Swala Tracker!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', fontSize: '1.0625rem', lineHeight: 1.6 }}>
            Your teacher account is active, but you have not been assigned to a class yet.
          </p>
          <div style={{ padding: 'var(--space-5)', background: 'rgba(251, 191, 36, 0.1)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(251, 191, 36, 0.2)', color: 'var(--accent-400)', fontWeight: 500 }}>
            Please contact your system administrator to assign a class to your profile.
          </div>
        </div>
      )}

      {hasClass && (
      <>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.greeting}>
          <Clock size={14} />
          {new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <h1 className={styles.title}>
          Assalamu Alaykum, <span className="text-gradient">{teacher?.name || 'Teacher'}</span>
        </h1>
        <div className={styles.subtitle}>
          <span className={styles.classChip}>
            <BookOpen size={13} />
            {classInfo?.name || 'My Class'}
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>•</span>
          <span>{classInfo?.location || ''}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard} animate-in animate-in-delay-1`}>
          <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary-400)' }}>
            <Users size={22} />
          </div>
          <div className={styles.statValue}>{students.length}</div>
          <div className={styles.statLabel}>Total Students</div>
        </div>

        <div className={`glass-panel ${styles.statCard} animate-in animate-in-delay-2`}>
          <div className={styles.statIcon} style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.statValue}>{overallAttendance}%</div>
          <div className={styles.statLabel}>Attendance Rate</div>
          <div className={`${styles.statTrend} ${overallAttendance >= 80 ? styles.trendUp : styles.trendDown}`}>
            {overallAttendance >= 80 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {monthName}
          </div>
        </div>

        <div className={`glass-panel ${styles.statCard} animate-in animate-in-delay-3`}>
          <div className={styles.statIcon} style={{ background: 'rgba(251, 191, 36, 0.12)', color: 'var(--accent-400)' }}>
            <CalendarDays size={22} />
          </div>
          <div className={styles.statValue}>{overallPrayer}%</div>
          <div className={styles.statLabel}>Prayer Completion</div>
          <div className={`${styles.statTrend} ${overallPrayer >= 70 ? styles.trendUp : styles.trendDown}`}>
            {overallPrayer >= 70 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {monthName}
          </div>
        </div>

        <div className={`glass-panel ${styles.statCard} animate-in animate-in-delay-4`}>
          <div className={styles.statIcon} style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <Activity size={22} />
          </div>
          <div className={styles.statValue}>{overallBehaviour}<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>/5</span></div>
          <div className={styles.statLabel}>Avg Behaviour Score</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`animate-in animate-in-delay-3`}>
        <div className={styles.sectionTitle}>
          <span>⚡</span> Quick Actions
        </div>
        <div className={styles.quickActions}>
          <Link href="/grid" className={styles.quickAction}>
            <div className={styles.quickActionIcon} style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary-400)' }}>
              <CalendarDays size={18} />
            </div>
            <span>Open Monthly Grid</span>
          </Link>
          <Link href="/students" className={styles.quickAction}>
            <div className={styles.quickActionIcon} style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <Plus size={18} />
            </div>
            <span>Add New Student</span>
          </Link>
          <Link href="/homework" className={styles.quickAction}>
            <div className={styles.quickActionIcon} style={{ background: 'rgba(251, 191, 36, 0.12)', color: 'var(--accent-400)' }}>
              <ClipboardList size={18} />
            </div>
            <span>View Homework</span>
          </Link>
          <Link href="/export" className={styles.quickAction}>
            <div className={styles.quickActionIcon} style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
              <BookOpen size={18} />
            </div>
            <span>Export Reports</span>
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left: Prayer Overview */}
        <div>
          <div className={`glass-panel-static ${styles.prayerOverview} animate-in animate-in-delay-4`}>
            <div className={styles.sectionTitle}>🕌 Prayer Completion — {monthName}</div>
            <div className={styles.prayerGrid}>
              {prayerStats.map((p, i) => (
                <div key={p.key} className={styles.prayerCard}>
                  <div className={styles.prayerName}>{p.name}</div>
                  <div className={styles.prayerPercent} style={{ color: prayerColors[i] }}>
                    {p.percent}%
                  </div>
                  <div className={styles.prayerSub}>completion</div>
                  {/* Mini progress bar */}
                  <div style={{
                    marginTop: 8,
                    height: 4,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${p.percent}%`,
                      background: prayerColors[i],
                      borderRadius: 2,
                      transition: 'width 0.8s cubic-bezier(0.2, 0, 0, 1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Homework overview */}
          <div className="glass-panel-static animate-in animate-in-delay-5" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
            <div className={styles.sectionTitle}>📋 Homework Overview</div>
            <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, marginBottom: 4, color: overallHomework >= 80 ? 'var(--success)' : 'var(--warning)' }}>
                  {overallHomework}%
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Submission Rate</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {['Submitted', 'Late', 'Missing'].map((label, i) => {
                  const count = homeworks.filter(h =>
                    label === 'Submitted' ? h.status === 'submitted' :
                    label === 'Late' ? h.status === 'late' : h.status === 'missing'
                  ).length;
                  const colors = ['var(--success)', 'var(--warning)', 'var(--danger)'];
                  return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i], flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: colors[i] }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top Students */}
        <div className={`glass-panel-static ${styles.topStudents} animate-in animate-in-delay-5`}>
          <div className={styles.sectionTitle}>🏆 Top Students — Prayer</div>
          {topStudents.map((s, i) => (
            <Link key={s.id} href={`/students/${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.studentRow}>
                <div className={`${styles.rank} ${i === 0 ? styles.rank1 : i === 1 ? styles.rank2 : i === 2 ? styles.rank3 : styles.rankDefault}`}>
                  {i + 1}
                </div>
                <div className={styles.studentName}>{s.nameEn}</div>
                <div className={styles.studentScore}>{s.prayerRate}%</div>
              </div>
            </Link>
          ))}

          <hr className="divider" />

          {/* Recent activity */}
          <div className={styles.sectionTitle}>🕐 Recent Activity</div>
          <div className={styles.activityList}>
            {[
              { text: 'Attendance marked for today', color: 'var(--success)', time: '2 hours ago' },
              { text: 'New homework assigned: Surah Al-Mulk', color: 'var(--primary-400)', time: '5 hours ago' },
              { text: 'Abdullah\'s behaviour note added', color: 'var(--accent-400)', time: 'Yesterday' },
              { text: 'Monthly report exported', color: 'var(--info)', time: '2 days ago' },
            ].map((item, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityDot} style={{ background: item.color }} />
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>{item.text}</div>
                  <div className={styles.activityTime}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
