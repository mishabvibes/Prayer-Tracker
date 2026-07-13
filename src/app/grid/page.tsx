'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/context';
import {
  GRID_DAILY, GRID_CONGREGATION, GRID_RAWATIB,
  GRID_ADHKAR, GRID_LESSONS,
  PRAYER_LABELS, DailyRecord, PrayerField,
} from '@/lib/types';
import styles from './grid.module.css';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function GridPage() {
  const { students, records, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, updateRecord, teacher } = useApp();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Generate days of the month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(selectedYear, selectedMonth, i + 1);
      return {
        num: i + 1,
        day: DAYS_SHORT[d.getDay()],
        isFriday: d.getDay() === 5,
        isToday: d.toDateString() === new Date().toDateString(),
      };
    });
  }, [daysInMonth, selectedMonth, selectedYear]);

  // Filter to selected day
  const activeDay = selectedDay || new Date().getDate();
  const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(activeDay).padStart(2, '0')}`;

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('en', { month: 'long', year: 'numeric' });

  // Get or create record for a student on the active day
  const getRecord = useCallback((studentId: string): DailyRecord | null => {
    return records.find(r => r.studentId === studentId && r.date === dateStr) || null;
  }, [records, dateStr]);

  const togglePrayer = useCallback((studentId: string, field: PrayerField) => {
    const existing = getRecord(studentId);
    const current = existing ? (existing[field] as number | null) : null;
    const next = current === null ? 1 : current === 1 ? 0 : null;

    const record: DailyRecord = existing ? { ...existing, [field]: next } : {
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      studentId,
      date: dateStr,
      // Legacy
      fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null,
      rawatibFajr: null, rawatibDhuhr: null, rawatibAsr: null, rawatibMaghrib: null,
      // 1. Daily
      dailyCommitment: null, oneJuzQuran: null, ghusl: null, duha: null,
      // 2. Congregation
      jamaaFajr: null, jamaaDhuhr: null, jamaaAsr: null, jamaaMaghrib: null, jamaaIsha: null,
      // 3. Sunnah Rawatib
      beforeDhuhr: null, afterDhuhr: null, beforeAsr: null,
      beforeMaghrib: null, afterMaghrib: null, beforeIsha: null,
      sunnahAfterIsha: null, sunnahBeforeFajr: null,
      // 4. Adhkar & Ibadah
      tasbih: null, witr: null, hizbAlBahr: null, ratibAlHaddad: null,
      // 5. Lessons & Other
      firstLesson: null, secondLesson: null, waqtAlFaraj: null, reading: null,
      // Legacy
      adhkar: null, dawrah: null,
      attendance: null, behaviourScore: null, notes: '', recordedBy: teacher?.id || '',
      [field]: next,
    };

    updateRecord(record);
  }, [getRecord, dateStr, updateRecord, teacher]);

  const navigateMonth = (delta: number) => {
    let m = selectedMonth + delta;
    let y = selectedYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setSelectedMonth(m);
    setSelectedYear(y);
    setSelectedDay(null);
  };

  const renderPrayerCell = (studentId: string, field: PrayerField) => {
    const record = getRecord(studentId);
    const value = record ? (record[field] as number | null) : null;
    const cellClass = value === 1 ? styles.cellPerformed : value === 0 ? styles.cellMissed : styles.cellNull;

    return (
      <td key={field} className={styles.prayerCell}>
        <button
          className={`${styles.cellToggle} ${cellClass}`}
          onClick={() => togglePrayer(studentId, field)}
          title={`${value === 1 ? 'Performed' : value === 0 ? 'Missed' : 'Not recorded'} — Click to toggle`}
        >
          {value === 1 ? '✓' : value === 0 ? '✕' : '·'}
        </button>
      </td>
    );
  };

  return (
    <div className={styles.gridPage}>
      {/* Header */}
      <div className={styles.gridHeader}>
        <div>
          <h1 className={styles.gridTitle}>Monthly Tracking Grid</h1>
          <p className={styles.gridSubtitle}>Daily prayer, attendance & behaviour records</p>
        </div>
        <div className={styles.monthSelector}>
          <button className="btn-icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft size={18} />
          </button>
          <span className={styles.monthLabel}>{monthName}</span>
          <button className="btn-icon" onClick={() => navigateMonth(1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day tabs */}
      <div className={styles.dayTabs}>
        {days.map(d => (
          <button
            key={d.num}
            className={`${styles.dayTab} ${d.num === activeDay ? styles.dayTabActive : ''} ${d.isToday ? styles.dayTabToday : ''}`}
            onClick={() => setSelectedDay(d.num)}
            style={d.isFriday ? { opacity: 0.4 } : {}}
          >
            <span className={styles.dayTabDay}>{d.day}</span>
            <span className={styles.dayTabNum}>{d.num}</span>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: 'var(--success-bg)', border: '1px solid rgba(52,211,153,0.3)' }} />
          Performed
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.3)' }} />
          Missed
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
          Not Recorded
        </div>
      </div>

      {/* Grid Table */}
      <div className={`glass-panel-static ${styles.gridContainer}`}>
        <div className={styles.gridScroll}>
          <table className={styles.trackingTable}>
            <thead>
              <tr>
                <th className={styles.stickyCol} rowSpan={2}>Student</th>
                {/* 1. Daily — العهد، القرآن، الاغتسال، الضحى */}
                <th className={styles.groupHeader} colSpan={4} style={{ borderColor: '#fbbf24', color: '#fbbf24' }}>
                  Daily
                </th>
                {/* 2. Congregation — صلاة الجماعة */}
                <th className={styles.groupHeader} colSpan={5} style={{ borderColor: 'var(--primary-400)', color: 'var(--primary-300)' }}>
                  Congregation
                </th>
                {/* 3. Sunnah Rawatib — السنن الرواتب */}
                <th className={styles.groupHeader} colSpan={8} style={{ borderColor: 'var(--accent-400)', color: 'var(--accent-400)' }}>
                  Sunnah Rawatib
                </th>
                {/* 4. Adhkar & Ibadah — أذكار وعبادات */}
                <th className={styles.groupHeader} colSpan={4} style={{ borderColor: '#a78bfa', color: '#a78bfa' }}>
                  Adhkar & Ibadah
                </th>
                {/* 5. Lessons & Other — الدروس وأخرى */}
                <th className={styles.groupHeader} colSpan={4} style={{ borderColor: '#38bdf8', color: '#38bdf8' }}>
                  Lessons & Other
                </th>
              </tr>
              <tr>
                {GRID_DAILY.map(p => (
                  <th key={p} style={{ textAlign: 'center', color: '#fbbf24' }}>{PRAYER_LABELS[p]}</th>
                ))}
                {GRID_CONGREGATION.map(p => (
                  <th key={p} style={{ textAlign: 'center', color: 'var(--primary-200)' }}>{PRAYER_LABELS[p]}</th>
                ))}
                {GRID_RAWATIB.map(p => (
                  <th key={p} style={{ textAlign: 'center', color: 'var(--accent-400)' }}>{PRAYER_LABELS[p]}</th>
                ))}
                {GRID_ADHKAR.map(p => (
                  <th key={p} style={{ textAlign: 'center', color: '#a78bfa' }}>{PRAYER_LABELS[p]}</th>
                ))}
                {GRID_LESSONS.map(p => (
                  <th key={p} style={{ textAlign: 'center', color: '#38bdf8' }}>{PRAYER_LABELS[p]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                return (
                  <tr key={student.id} className="animate-in" style={{ animationDelay: `${idx * 0.02}s` }}>
                    <td className={styles.stickyCol}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--radius-sm)',
                          background: `hsl(${(idx * 35) % 360}, 60%, 50%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: 'white',
                          flexShrink: 0,
                        }}>
                          {student.nameEn.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{student.nameEn}</span>
                      </div>
                    </td>

                    {/* 1. Daily */}
                    {GRID_DAILY.map(p => renderPrayerCell(student.id, p))}

                    {/* 2. Congregation */}
                    {GRID_CONGREGATION.map(p => renderPrayerCell(student.id, p))}

                    {/* 3. Sunnah Rawatib */}
                    {GRID_RAWATIB.map(p => renderPrayerCell(student.id, p))}

                    {/* 4. Adhkar & Ibadah */}
                    {GRID_ADHKAR.map(p => renderPrayerCell(student.id, p))}

                    {/* 5. Lessons & Other */}
                    {GRID_LESSONS.map(p => renderPrayerCell(student.id, p))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
