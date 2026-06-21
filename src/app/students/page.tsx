'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, UserCircle, Eye, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { getAttendanceRate, getPrayerCompletionRate, getAvgBehaviour } from '@/lib/mock-data';
import styles from './students.module.css';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #34d399, #10b981)',
  'linear-gradient(135deg, #f87171, #ef4444)',
  'linear-gradient(135deg, #60a5fa, #3b82f6)',
  'linear-gradient(135deg, #f0abfc, #d946ef)',
  'linear-gradient(135deg, #fb923c, #ea580c)',
  'linear-gradient(135deg, #22d3ee, #06b6d4)',
];

export default function StudentsPage() {
  const { students, records, selectedMonth, selectedYear, addStudent, removeStudent } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newNameEn, setNewNameEn] = useState('');
  const [newNameAr, setNewNameAr] = useState('');

  const monthRecords = useMemo(() => {
    return records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [records, selectedMonth, selectedYear]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s =>
      s.nameEn.toLowerCase().includes(q) || s.nameAr.includes(q)
    );
  }, [students, search]);

  const handleAdd = async () => {
    if (!newNameEn.trim()) return;
    await addStudent(newNameAr || newNameEn, newNameEn);
    setNewNameEn('');
    setNewNameAr('');
    setShowAdd(false);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Students</h1>
          <p className={styles.pageSubtitle}>{students.length} students enrolled</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={`input ${styles.searchInput}`}
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button className="btn-icon" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Name (English) *</label>
                <input
                  className="input"
                  placeholder="Enter student name"
                  value={newNameEn}
                  onChange={e => setNewNameEn(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Name (Arabic)</label>
                <input
                  className="input"
                  placeholder="أدخل اسم الطالب"
                  value={newNameAr}
                  onChange={e => setNewNameAr(e.target.value)}
                  dir="rtl"
                  style={{ fontFamily: 'var(--font-arabic)' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-glass" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Student</button>
            </div>
          </div>
        </div>
      )}

      {/* Student Grid */}
      <div className={styles.studentGrid}>
        {filtered.map((student, idx) => {
          const sRecords = monthRecords.filter(r => r.studentId === student.id);
          const att = getAttendanceRate(sRecords);
          const prayer = getPrayerCompletionRate(sRecords);
          const beh = getAvgBehaviour(sRecords);
          const colorIdx = idx % AVATAR_COLORS.length;
          const gradient = AVATAR_COLORS[colorIdx];

          return (
            <div
              key={student.id}
              className={`glass-panel ${styles.studentCard} animate-in`}
              style={{ animationDelay: `${Math.min(idx * 0.04, 0.3)}s`, ['--card-color' as string]: gradient.match(/#[a-f0-9]+/)?.[0] || '#6366f1' }}
            >
              <div style={{ background: gradient, height: 3, position: 'absolute', top: 0, left: 0, right: 0, borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', opacity: 0.6 }} />
              <div className={styles.cardHeader}>
                <div className={styles.avatar} style={{ background: gradient, color: 'white' }}>
                  {student.nameEn.charAt(0)}
                </div>
                <div className={styles.studentInfo}>
                  <div className={styles.studentNameEn}>{student.nameEn}</div>
                  <div className={styles.studentNameAr}>{student.nameAr}</div>
                </div>
                <div className={styles.cardActions}>
                  <Link href={`/students/${student.id}`}>
                    <button className="btn-icon" title="View Profile">
                      <Eye size={16} />
                    </button>
                  </Link>
                  <button
                    className="btn-icon"
                    title="Remove"
                    onClick={e => { e.stopPropagation(); removeStudent(student.id); }}
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className={styles.miniStats}>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatValue} style={{ color: att >= 80 ? 'var(--success)' : att >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                    {att}%
                  </div>
                  <div className={styles.miniStatLabel}>Attendance</div>
                </div>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatValue} style={{ color: 'var(--primary-300)' }}>
                    {prayer}%
                  </div>
                  <div className={styles.miniStatLabel}>Prayer</div>
                </div>
                <div className={styles.miniStat}>
                  <div className={styles.miniStatValue} style={{ color: beh >= 4 ? 'var(--success)' : beh >= 3 ? 'var(--warning)' : 'var(--danger)' }}>
                    {beh}
                  </div>
                  <div className={styles.miniStatLabel}>Behaviour</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <UserCircle size={64} />
          <h3>No students found</h3>
          <p>Try adjusting your search or add a new student</p>
        </div>
      )}
    </div>
  );
}
