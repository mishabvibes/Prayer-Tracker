'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { useApp } from '@/lib/context';
import {
  getAttendanceRate, getPrayerCompletionRate,
  getAvgBehaviour, getHomeworkRate,
} from '@/lib/mock-data';
import { FARDH_PRAYERS, PRAYER_LABELS, NoteTag } from '@/lib/types';
import styles from './profile.module.css';

const NOTE_TAG_COLORS: Record<NoteTag, string> = {
  behaviour: 'var(--accent-400)',
  health: 'var(--danger)',
  academic: 'var(--primary-400)',
};

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.id as string;
  const { students, records, homeworks, notes, selectedMonth, selectedYear, addNote } = useApp();

  const student = students.find(s => s.id === studentId);

  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState<NoteTag>('academic');

  const monthRecords = useMemo(() => {
    return records.filter(r => {
      const d = new Date(r.date);
      return r.studentId === studentId && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [records, studentId, selectedMonth, selectedYear]);

  const studentHomeworks = useMemo(() => {
    return homeworks.filter(h => h.studentId === studentId);
  }, [homeworks, studentId]);

  const studentNotes = useMemo(() => {
    return notes.filter(n => n.studentId === studentId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notes, studentId]);

  const att = useMemo(() => getAttendanceRate(monthRecords), [monthRecords]);
  const prayer = useMemo(() => getPrayerCompletionRate(monthRecords), [monthRecords]);
  const beh = useMemo(() => getAvgBehaviour(monthRecords), [monthRecords]);
  const hw = useMemo(() => getHomeworkRate(studentHomeworks), [studentHomeworks]);

  const prayerBreakdown = useMemo(() => {
    return FARDH_PRAYERS.map(p => {
      const total = monthRecords.filter(r => r[p] !== null).length;
      const done = monthRecords.filter(r => r[p] === 1).length;
      return {
        key: p,
        name: PRAYER_LABELS[p],
        percent: total === 0 ? 0 : Math.round((done / total) * 100),
      };
    });
  }, [monthRecords]);

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    await addNote({
      studentId,
      tag: noteTag,
      content: noteContent,
    });
    setNoteContent('');
  };

  if (!student) {
    return (
      <div className="empty-state">
        <h3>Student not found</h3>
        <Link href="/students" className="btn btn-glass" style={{ marginTop: 16 }}>
          Back to Students
        </Link>
      </div>
    );
  }

  const prayerColors = ['var(--prayer-fajr)', 'var(--prayer-dhuhr)', 'var(--prayer-asr)', 'var(--prayer-maghrib)', 'var(--prayer-isha)'];
  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('en', { month: 'long', year: 'numeric' });

  return (
    <div>
      <Link href="/students" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Students
      </Link>

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar} style={{ background: 'var(--primary-600)' }}>
          {student.nameEn.charAt(0)}
        </div>
        <div className={styles.profileNames}>
          <h1 className={styles.profileNameEn}>{student.nameEn}</h1>
          <div className={styles.profileNameAr}>{student.nameAr}</div>
        </div>
        <span className="badge badge-primary">{monthName}</span>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={`glass-panel-static ${styles.profileStat} animate-in animate-in-delay-1`}>
          <div className={styles.profileStatValue} style={{ color: att >= 80 ? 'var(--success)' : 'var(--warning)' }}>{att}%</div>
          <div className={styles.profileStatLabel}>Attendance</div>
        </div>
        <div className={`glass-panel-static ${styles.profileStat} animate-in animate-in-delay-2`}>
          <div className={styles.profileStatValue} style={{ color: 'var(--primary-300)' }}>{prayer}%</div>
          <div className={styles.profileStatLabel}>Prayer</div>
        </div>
        <div className={`glass-panel-static ${styles.profileStat} animate-in animate-in-delay-3`}>
          <div className={styles.profileStatValue} style={{ color: beh >= 4 ? 'var(--success)' : 'var(--warning)' }}>{beh}/5</div>
          <div className={styles.profileStatLabel}>Behaviour</div>
        </div>
        <div className={`glass-panel-static ${styles.profileStat} animate-in animate-in-delay-4`}>
          <div className={styles.profileStatValue} style={{ color: hw >= 80 ? 'var(--success)' : 'var(--warning)' }}>{hw}%</div>
          <div className={styles.profileStatLabel}>Homework</div>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        <div>
          {/* Prayer Breakdown */}
          <div className={`glass-panel-static ${styles.section} animate-in animate-in-delay-3`}>
            <div className={styles.sectionTitle}>🕌 Prayer Breakdown</div>
            <div className={styles.prayerMiniGrid}>
              {prayerBreakdown.map((p, i) => (
                <div key={p.key} className={styles.prayerMiniCell}>
                  <div className={styles.prayerMiniName}>{p.name}</div>
                  <div className={styles.prayerMiniValue} style={{ color: prayerColors[i] }}>{p.percent}%</div>
                  <div style={{
                    marginTop: 6,
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
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Records */}
          <div className={`glass-panel-static ${styles.section} animate-in animate-in-delay-4`}>
            <div className={styles.sectionTitle}>📅 Recent Records</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--glass-border)' }}>Date</th>
                    <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--glass-border)' }}>Fajr</th>
                    <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--glass-border)' }}>Dhuhr</th>
                    <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--glass-border)' }}>Asr</th>
                    <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--glass-border)' }}>Magh</th>
                    <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--glass-border)' }}>Isha</th>
                    <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--glass-border)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {monthRecords.slice(-10).reverse().map(r => (
                    <tr key={r.id}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                        {new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </td>
                      {[r.fajr, r.dhuhr, r.asr, r.maghrib, r.isha].map((v, i) => (
                        <td key={i} style={{ padding: '8px', textAlign: 'center' }}>
                          {v === 1 ? '✅' : v === 0 ? '❌' : '—'}
                        </td>
                      ))}
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <span className={`badge ${
                          r.attendance === 'present' ? 'badge-success' :
                          r.attendance === 'late' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {r.attendance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Notes */}
        <div>
          <div className={`glass-panel-static ${styles.section} animate-in animate-in-delay-4`}>
            <div className={styles.sectionTitle}>
              <MessageSquare size={18} /> Teacher Notes
            </div>
            <div className={styles.notesList}>
              {studentNotes.length === 0 && (
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  No notes yet
                </div>
              )}
              {studentNotes.map(note => (
                <div key={note.id} className={styles.noteItem} style={{ borderColor: NOTE_TAG_COLORS[note.tag] }}>
                  <div className={styles.noteContent}>{note.content}</div>
                  <div className={styles.noteMeta}>
                    <span className={`badge`} style={{
                      background: `${NOTE_TAG_COLORS[note.tag]}20`,
                      color: NOTE_TAG_COLORS[note.tag],
                    }}>{note.tag}</span>
                    <span>{note.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add note */}
            <div className={styles.addNoteForm}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {(['academic', 'behaviour', 'health'] as NoteTag[]).map(tag => (
                  <button
                    key={tag}
                    className={`btn btn-sm ${noteTag === tag ? 'btn-primary' : 'btn-glass'}`}
                    onClick={() => setNoteTag(tag)}
                    style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  className="input"
                  placeholder="Add a note..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                />
                <button className="btn btn-primary btn-sm" onClick={handleAddNote}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
