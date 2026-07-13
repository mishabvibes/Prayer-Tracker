'use client';

import React, { useMemo } from 'react';
import { LogOut, Calendar, BookOpen } from 'lucide-react';
import { useApp } from '@/lib/context';
import { getPrayerCompletionRate, getHomeworkRate } from '@/lib/mock-data';
import {
  GRID_DAILY, GRID_CONGREGATION, GRID_RAWATIB,
  GRID_ADHKAR, GRID_LESSONS, PRAYER_LABELS,
} from '@/lib/types';

// Group config matching the grid page
const CHECKLIST_GROUPS = [
  { label: 'Daily', fields: GRID_DAILY, color: '#fbbf24' },
  { label: 'Congregation', fields: GRID_CONGREGATION, color: 'var(--primary-400)' },
  { label: 'Sunnah Rawatib', fields: GRID_RAWATIB, color: 'var(--accent-400)' },
  { label: 'Adhkar & Ibadah', fields: GRID_ADHKAR, color: '#a78bfa' },
  { label: 'Lessons & Other', fields: GRID_LESSONS, color: '#38bdf8' },
] as const;

export default function ParentPortal() {
  const {
    students, records, homeworks, notes, assignments,
    parentStudentId, selectedMonth, selectedYear, logout,
  } = useApp();

  const student = students.find(s => s.id === parentStudentId);

  const monthRecords = useMemo(() => {
    if (!parentStudentId) return [];
    return records.filter(r => {
      const d = new Date(r.date);
      return r.studentId === parentStudentId && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [records, parentStudentId, selectedMonth, selectedYear]);

  const studentHomeworks = useMemo(() => {
    return homeworks.filter(h => h.studentId === parentStudentId);
  }, [homeworks, parentStudentId]);

  const studentNotes = useMemo(() => {
    return notes.filter(n => n.studentId === parentStudentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notes, parentStudentId]);

  const prayer = useMemo(() => getPrayerCompletionRate(monthRecords), [monthRecords]);
  const hw = useMemo(() => getHomeworkRate(studentHomeworks), [studentHomeworks]);

  // Per-group completion rates
  const groupStats = useMemo(() => {
    return CHECKLIST_GROUPS.map(group => {
      let total = 0;
      let done = 0;
      for (const r of monthRecords) {
        for (const f of group.fields) {
          const val = r[f as keyof typeof r] as number | null;
          if (val !== null) {
            total++;
            if (val === 1) done++;
          }
        }
      }
      return {
        ...group,
        percent: total === 0 ? 0 : Math.round((done / total) * 100),
      };
    });
  }, [monthRecords]);

  // Overall completion across all 25 columns
  const overallCompletion = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const group of CHECKLIST_GROUPS) {
      for (const r of monthRecords) {
        for (const f of group.fields) {
          const val = r[f as keyof typeof r] as number | null;
          if (val !== null) {
            total++;
            if (val === 1) done++;
          }
        }
      }
    }
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [monthRecords]);

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('en', { month: 'long', year: 'numeric' });

  if (!student) {
    return (
      <div className="empty-state">
        <h3>Student not found</h3>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: 16 }}>The parent token may be invalid.</p>
        <button className="btn btn-glass" onClick={logout}>Back to Login</button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.2, 0, 0, 1) both' }}>
      {/* Header */}
      <div className="page-header-mobile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-xl)',
            background: 'var(--primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 700, color: 'white',
          }}>
            {student.nameEn.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>Parent Portal — Read Only</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{student.nameEn}</h1>
            <div style={{ fontSize: '1rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-arabic)' }}>{student.nameAr}</div>
          </div>
        </div>
        <button className="btn btn-glass" onClick={logout}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Month label */}
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Calendar size={16} style={{ color: 'var(--text-tertiary)' }} />
        <span className="badge badge-primary">{monthName}</span>
      </div>

      {/* Top Stats */}
      <div className="grid-cols-4" style={{ marginBottom: 'var(--space-8)' }}>
        {[
          { label: 'Overall', value: `${overallCompletion}%`, color: overallCompletion >= 70 ? 'var(--success)' : 'var(--warning)', icon: '📊' },
          { label: 'Congregation', value: `${prayer}%`, color: 'var(--primary-300)', icon: '🕌' },
          { label: 'Homework', value: `${hw}%`, color: hw >= 80 ? 'var(--success)' : 'var(--warning)', icon: '📋' },
          { label: 'Days Tracked', value: `${monthRecords.length}`, color: 'var(--info)', icon: '📅' },
        ].map((s, i) => (
          <div key={s.label} className="glass-panel-static animate-in" style={{ padding: 'var(--space-5)', textAlign: 'center', animationDelay: `${i * 0.05}s` }}>
            <div style={{ marginBottom: 'var(--space-2)', fontSize: '1.25rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Left: Checklist Group Breakdown + Records */}
        <div>
          {/* Group Completion Breakdown */}
          <div className="glass-panel-static animate-in animate-in-delay-2" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-5)' }}>📋 Checklist Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {groupStats.map(g => (
                <div key={g.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 500 }}>{g.label}</span>
                    <span style={{ color: g.color, fontWeight: 600 }}>{g.percent}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${Math.max(g.percent, 2)}%`,
                      background: g.color,
                      borderRadius: 4,
                      transition: 'width 0.8s cubic-bezier(0.2, 0, 0, 1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Congregation Prayer Breakdown */}
          <div className="glass-panel-static animate-in animate-in-delay-3" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-5)' }}>🕌 Congregation Prayers</h3>
            <div className="prayer-grid-mobile">
              {GRID_CONGREGATION.map((p, i) => {
                const total = monthRecords.filter(r => r[p] !== null).length;
                const done = monthRecords.filter(r => r[p] === 1).length;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                const colors = ['var(--prayer-fajr)', 'var(--prayer-dhuhr)', 'var(--prayer-asr)', 'var(--prayer-maghrib)', 'var(--prayer-isha)'];
                return (
                  <div key={p} style={{ textAlign: 'center', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{PRAYER_LABELS[p]}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: colors[i] }}>{pct}%</div>
                    <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[i], borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Records — all 25 columns in a scrollable table */}
          <div className="glass-panel-static animate-in animate-in-delay-4" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📅 Recent Records</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--glass-border)', fontSize: '0.625rem', textTransform: 'uppercase', position: 'sticky', left: 0, background: 'rgba(10,10,30,0.95)', zIndex: 1 }}>Date</th>
                    {CHECKLIST_GROUPS.map(group =>
                      group.fields.map(f => (
                        <th key={f} style={{ padding: '6px 4px', textAlign: 'center', color: group.color, fontWeight: 500, borderBottom: '1px solid var(--glass-border)', fontSize: '0.5625rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          {PRAYER_LABELS[f]}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {monthRecords.slice(-15).reverse().map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '6px 8px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', position: 'sticky', left: 0, background: 'rgba(10,10,30,0.95)', zIndex: 1 }}>
                        {new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </td>
                      {CHECKLIST_GROUPS.map(group =>
                        group.fields.map(f => {
                          const val = r[f as keyof typeof r] as number | null;
                          return (
                            <td key={f} style={{ padding: '6px 4px', textAlign: 'center' }}>
                              {val === 1 ? '✅' : val === 0 ? '❌' : '·'}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Homework + Notes */}
        <div>
          {/* Homework */}
          <div className="glass-panel-static animate-in animate-in-delay-3" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📋 Homework</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {studentHomeworks.map(hw => {
                const assignment = assignments.find(a => a.id === hw.assignmentId);
                if (!assignment) return null;
                return (
                  <div key={hw.id} style={{
                    padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{assignment.title}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        Due: {new Date(assignment.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <span className={`badge ${hw.status === 'submitted' ? 'badge-success' : hw.status === 'late' ? 'badge-warning' : 'badge-danger'}`}>
                      {hw.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher Notes */}
          <div className="glass-panel-static animate-in animate-in-delay-4" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📝 Teacher Notes</h3>
            {studentNotes.length === 0 ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No notes yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {studentNotes.map(note => {
                  const tagColor = note.tag === 'behaviour' ? 'var(--accent-400)' : note.tag === 'health' ? 'var(--danger)' : 'var(--primary-400)';
                  return (
                    <div key={note.id} style={{
                      padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                      background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${tagColor}`,
                    }}>
                      <div style={{ fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: 4 }}>{note.content}</div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        <span className="badge" style={{ background: `${tagColor}20`, color: tagColor }}>{note.tag}</span>
                        <span>{note.createdAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
