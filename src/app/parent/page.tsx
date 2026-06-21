'use client';

import React, { useMemo } from 'react';
import { LogOut, Calendar, CheckCircle2, Activity, BookOpen } from 'lucide-react';
import { useApp } from '@/lib/context';
import {
  getAttendanceRate, getPrayerCompletionRate,
  getAvgBehaviour, getHomeworkRate,
} from '@/lib/mock-data';
import { FARDH_PRAYERS, PRAYER_LABELS } from '@/lib/types';

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

  const att = useMemo(() => getAttendanceRate(monthRecords), [monthRecords]);
  const prayer = useMemo(() => getPrayerCompletionRate(monthRecords), [monthRecords]);
  const beh = useMemo(() => getAvgBehaviour(monthRecords), [monthRecords]);
  const hw = useMemo(() => getHomeworkRate(studentHomeworks), [studentHomeworks]);

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('en', { month: 'long', year: 'numeric' });
  const prayerColors = ['var(--prayer-fajr)', 'var(--prayer-dhuhr)', 'var(--prayer-asr)', 'var(--prayer-maghrib)', 'var(--prayer-isha)'];

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
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

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {[
          { label: 'Attendance', value: `${att}%`, color: att >= 80 ? 'var(--success)' : 'var(--warning)', icon: <CheckCircle2 size={20} /> },
          { label: 'Prayer', value: `${prayer}%`, color: 'var(--primary-300)', icon: <span>🕌</span> },
          { label: 'Behaviour', value: `${beh}/5`, color: beh >= 4 ? 'var(--success)' : 'var(--warning)', icon: <Activity size={20} /> },
          { label: 'Homework', value: `${hw}%`, color: hw >= 80 ? 'var(--success)' : 'var(--warning)', icon: <BookOpen size={20} /> },
        ].map((s, i) => (
          <div key={s.label} className="glass-panel-static animate-in" style={{ padding: 'var(--space-5)', textAlign: 'center', animationDelay: `${i * 0.05}s` }}>
            <div style={{ marginBottom: 'var(--space-2)', color: 'var(--text-tertiary)' }}>{s.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-6)' }}>
        {/* Left: Prayer + Records */}
        <div>
          {/* Prayer Breakdown */}
          <div className="glass-panel-static animate-in animate-in-delay-2" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-5)' }}>🕌 Prayer Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)' }}>
              {FARDH_PRAYERS.map((p, i) => {
                const total = monthRecords.filter(r => r[p] !== null).length;
                const done = monthRecords.filter(r => r[p] === 1).length;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                  <div key={p} style={{ textAlign: 'center', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{PRAYER_LABELS[p]}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: prayerColors[i] }}>{pct}%</div>
                    <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: prayerColors[i], borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Records */}
          <div className="glass-panel-static animate-in animate-in-delay-3" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📅 Recent Records</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    {['Date', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Status', 'Score'].map(h => (
                      <th key={h} style={{ padding: '8px', textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--glass-border)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthRecords.slice(-15).reverse().map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </td>
                      {[r.fajr, r.dhuhr, r.asr, r.maghrib, r.isha].map((v, i) => (
                        <td key={i} style={{ padding: '8px', textAlign: 'center' }}>
                          {v === 1 ? '✅' : v === 0 ? '❌' : '—'}
                        </td>
                      ))}
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <span className={`badge ${r.attendance === 'present' ? 'badge-success' : r.attendance === 'late' ? 'badge-warning' : 'badge-danger'}`}>
                          {r.attendance || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center', color: 'var(--accent-400)' }}>
                        {r.behaviourScore ? `${r.behaviourScore}/5` : '—'}
                      </td>
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
