'use client';

import React, { useMemo, useState } from 'react';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/context';
import {
  getAttendanceRate, getPrayerCompletionRate,
  getAvgBehaviour, getHomeworkRate,
} from '@/lib/mock-data';
import { FARDH_PRAYERS, PRAYER_LABELS } from '@/lib/types';
import styles from './analytics.module.css';

export default function AnalyticsPage() {
  const { students, records, homeworks, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useApp();

  const monthRecords = useMemo(() => {
    return records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [records, selectedMonth, selectedYear]);

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('en', { month: 'long', year: 'numeric' });

  // Per-student analytics
  const studentAnalytics = useMemo(() => {
    return students.map(s => {
      const sRecords = monthRecords.filter(r => r.studentId === s.id);
      const sHomeworks = homeworks.filter(h => h.studentId === s.id);
      return {
        student: s,
        attendance: getAttendanceRate(sRecords),
        prayer: getPrayerCompletionRate(sRecords),
        behaviour: getAvgBehaviour(sRecords),
        homework: getHomeworkRate(sHomeworks),
        recordCount: sRecords.length,
      };
    }).sort((a, b) => b.prayer - a.prayer);
  }, [students, monthRecords, homeworks]);

  // Class averages
  const classAvg = useMemo(() => ({
    attendance: Math.round(studentAnalytics.reduce((s, a) => s + a.attendance, 0) / (studentAnalytics.length || 1)),
    prayer: Math.round(studentAnalytics.reduce((s, a) => s + a.prayer, 0) / (studentAnalytics.length || 1)),
    behaviour: Math.round(studentAnalytics.reduce((s, a) => s + a.behaviour, 0) / (studentAnalytics.length || 1) * 10) / 10,
    homework: Math.round(studentAnalytics.reduce((s, a) => s + a.homework, 0) / (studentAnalytics.length || 1)),
  }), [studentAnalytics]);

  // Prayer breakdown for class
  const prayerBreakdown = useMemo(() => {
    return FARDH_PRAYERS.map(p => {
      const total = monthRecords.filter(r => r[p] !== null).length;
      const done = monthRecords.filter(r => r[p] === 1).length;
      return { key: p, name: PRAYER_LABELS[p], percent: total === 0 ? 0 : Math.round((done / total) * 100) };
    });
  }, [monthRecords]);

  const navigateMonth = (delta: number) => {
    let m = selectedMonth + delta;
    let y = selectedYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  const prayerColors = ['var(--prayer-fajr)', 'var(--prayer-dhuhr)', 'var(--prayer-asr)', 'var(--prayer-maghrib)', 'var(--prayer-isha)'];

  const barWidth = (val: number) => `${Math.max(val, 2)}%`;
  const colorForPercent = (val: number) => val >= 80 ? 'var(--success)' : val >= 60 ? 'var(--warning)' : 'var(--danger)';

  // Alerts
  const alerts = useMemo(() => {
    const list: { student: string; type: string; color: string }[] = [];
    studentAnalytics.forEach(a => {
      if (a.attendance < 60) list.push({ student: a.student.nameEn, type: 'Low attendance', color: 'var(--danger)' });
      if (a.prayer < 50) list.push({ student: a.student.nameEn, type: 'Low prayer rate', color: 'var(--warning)' });
      if (a.behaviour < 3) list.push({ student: a.student.nameEn, type: 'Low behaviour', color: 'var(--danger)' });
    });
    return list.slice(0, 6);
  }, [studentAnalytics]);

  return (
    <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.2, 0, 0, 1) both' }}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            <BarChart3 size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
            Analytics
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Class performance insights and trends
          </p>
        </div>
        <div className={styles.monthNav}>
          <button className="btn-icon" onClick={() => navigateMonth(-1)}><ChevronLeft size={18} /></button>
          <span style={{ fontSize: '1rem', fontWeight: 600, minWidth: '120px', textAlign: 'center' }}>{monthName}</span>
          <button className="btn-icon" onClick={() => navigateMonth(1)}><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Class Averages */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Attendance', value: `${classAvg.attendance}%`, color: colorForPercent(classAvg.attendance), icon: '📊' },
          { label: 'Prayer', value: `${classAvg.prayer}%`, color: 'var(--primary-300)', icon: '🕌' },
          { label: 'Behaviour', value: `${classAvg.behaviour}/5`, color: classAvg.behaviour >= 4 ? 'var(--success)' : 'var(--warning)', icon: '⭐' },
          { label: 'Homework', value: `${classAvg.homework}%`, color: colorForPercent(classAvg.homework), icon: '📋' },
        ].map((stat, i) => (
          <div key={stat.label} className="glass-panel-static animate-in" style={{ padding: 'var(--space-5)', textAlign: 'center', animationDelay: `${i * 0.05}s` }}>
            <div style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>{stat.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Class Avg {stat.label}</div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className={styles.mainGrid}>
        {/* Left: Student comparison */}
        <div>
          {/* Prayer Distribution */}
          <div className="glass-panel-static animate-in animate-in-delay-2" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-5)' }}>🕌 Prayer Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {prayerBreakdown.map((p, i) => (
                <div key={p.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    <span style={{ color: prayerColors[i], fontWeight: 600 }}>{p.percent}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: barWidth(p.percent),
                      background: prayerColors[i],
                      borderRadius: 4,
                      transition: 'width 0.8s cubic-bezier(0.2, 0, 0, 1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Ranking Table */}
          <div className="glass-panel-static animate-in animate-in-delay-3" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600 }}>📋 Student Rankings</h3>
            </div>
            <div className={styles.tableContainer}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', minWidth: '600px' }}>
                <thead>
                  <tr>
                    {['#', 'Student', 'Attendance', 'Prayer', 'Behaviour', 'Homework'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Student' ? 'left' : 'center', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--glass-border)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentAnalytics.map((a, idx) => (
                    <tr key={a.student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 'var(--radius-sm)',
                            background: `hsl(${(idx * 30) % 360}, 55%, 50%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.625rem', fontWeight: 700, color: 'white',
                          }}>{a.student.nameEn.charAt(0)}</div>
                          {a.student.nameEn}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', color: colorForPercent(a.attendance), fontWeight: 600, padding: '10px 14px' }}>{a.attendance}%</td>
                      <td style={{ textAlign: 'center', color: 'var(--primary-300)', fontWeight: 600, padding: '10px 14px' }}>{a.prayer}%</td>
                      <td style={{ textAlign: 'center', color: a.behaviour >= 4 ? 'var(--success)' : 'var(--warning)', fontWeight: 600, padding: '10px 14px' }}>{a.behaviour}</td>
                      <td style={{ textAlign: 'center', color: colorForPercent(a.homework), fontWeight: 600, padding: '10px 14px' }}>{a.homework}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="glass-panel-static animate-in animate-in-delay-3" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>⚠️ Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {alerts.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.03)',
                    borderLeft: `3px solid ${a.color}`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{a.student}</div>
                      <div style={{ fontSize: '0.75rem', color: a.color }}>{a.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Distribution */}
          <div className="glass-panel-static animate-in animate-in-delay-4" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📊 Attendance Breakdown</h3>
            {(() => {
              const present = monthRecords.filter(r => r.attendance === 'present').length;
              const late = monthRecords.filter(r => r.attendance === 'late').length;
              const absent = monthRecords.filter(r => r.attendance === 'absent').length;
              const total = present + late + absent || 1;
              return (
                <div>
                  {[
                    { label: 'Present', count: present, color: 'var(--success)', pct: Math.round((present/total)*100) },
                    { label: 'Late', count: late, color: 'var(--warning)', pct: Math.round((late/total)*100) },
                    { label: 'Absent', count: absent, color: 'var(--danger)', pct: Math.round((absent/total)*100) },
                  ].map(item => (
                    <div key={item.label} style={{ marginBottom: 'var(--space-4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                          {item.label}
                        </span>
                        <span style={{ fontWeight: 600, color: item.color }}>{item.pct}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Quick Stats */}
          <div className="glass-panel-static animate-in animate-in-delay-5" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📈 Quick Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Total Records', value: monthRecords.length },
                { label: 'Active Students', value: new Set(monthRecords.map(r => r.studentId)).size },
                { label: 'Days Tracked', value: new Set(monthRecords.map(r => r.date)).size },
                { label: 'Perfect Attendance', value: studentAnalytics.filter(a => a.attendance === 100).length },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
