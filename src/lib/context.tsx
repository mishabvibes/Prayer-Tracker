'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Student, DailyRecord, Assignment, Homework, StudentNote,
  ClassInfo, Teacher
} from '@/lib/types';
import {
  STUDENTS, CURRENT_CLASS, CURRENT_TEACHER, ASSIGNMENTS,
  generateAllRecords, generateHomework, generateNotes,
} from '@/lib/mock-data';

interface AppState {
  teacher: Teacher;
  classInfo: ClassInfo;
  students: Student[];
  records: DailyRecord[];
  assignments: Assignment[];
  homeworks: Homework[];
  notes: StudentNote[];
  selectedMonth: number; // 0-indexed
  selectedYear: number;
  setSelectedMonth: (m: number) => void;
  setSelectedYear: (y: number) => void;
  updateRecord: (record: DailyRecord) => void;
  addStudent: (student: Student) => void;
  removeStudent: (id: string) => void;
  addNote: (note: StudentNote) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const now = new Date();
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Generate mock data on client side to avoid hydration mismatch
    setRecords(generateAllRecords());
    setHomeworks(generateHomework());
    setNotes(generateNotes());
    setIsHydrated(true);
  }, []);

  const updateRecord = (record: DailyRecord) => {
    setRecords(prev => {
      const idx = prev.findIndex(r => r.studentId === record.studentId && r.date === record.date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [...prev, record];
    });
  };

  const addStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setRecords(prev => prev.filter(r => r.studentId !== id));
  };

  const addNote = (note: StudentNote) => {
    setNotes(prev => [note, ...prev]);
  };

  if (!isHydrated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid var(--glass-border)',
            borderTopColor: 'var(--primary-400)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p>Loading Swala Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      teacher: CURRENT_TEACHER,
      classInfo: CURRENT_CLASS,
      students,
      records,
      assignments: ASSIGNMENTS,
      homeworks,
      notes,
      selectedMonth,
      selectedYear,
      setSelectedMonth,
      setSelectedYear,
      updateRecord,
      addStudent,
      removeStudent,
      addNote,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
