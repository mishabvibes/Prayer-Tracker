'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import {
  Student, DailyRecord, Assignment, Homework, StudentNote,
  ClassInfo, Teacher, HomeworkStatus,
} from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import {
  mapTeacher, mapClass, mapStudent, mapRecord,
  mapAssignment, mapHomework, mapNote, toRecordRow,
} from '@/lib/supabase/mappers';

// Analytics helpers (kept from mock-data.ts — pure functions, no mock dependency)
export { getAttendanceRate, getPrayerCompletionRate, getAvgBehaviour, getHomeworkRate } from '@/lib/mock-data';

interface AppState {
  // Auth
  isLoggedIn: boolean;
  loginRole: 'teacher' | 'parent' | null;
  parentStudentId: string | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, name: string) => Promise<string | null>;
  loginAsParent: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // Data
  teacher: Teacher | null;
  classInfo: ClassInfo | null;
  students: Student[];
  records: DailyRecord[];
  assignments: Assignment[];
  homeworks: Homework[];
  notes: StudentNote[];
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (m: number) => void;
  setSelectedYear: (y: number) => void;
  dataLoading: boolean;
  // Actions
  updateRecord: (record: DailyRecord) => Promise<void>;
  addStudent: (nameAr: string, nameEn: string) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  addNote: (note: Omit<StudentNote, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  addAssignment: (title: string, dueDate: string) => Promise<void>;
  updateHomeworkStatus: (studentId: string, assignmentId: string, status: HomeworkStatus) => Promise<void>;
  // Setup (assigned to a class)
  hasClass: boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);
const supabase = createClient();

export function AppProvider({ children }: { children: ReactNode }) {
  const now = new Date();

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState<'teacher' | 'parent' | null>(null);
  const [parentStudentId, setParentStudentId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Teacher/class data
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [hasClass, setHasClass] = useState(false);

  // App data
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [dataLoading, setDataLoading] = useState(false);

  const fetchedRef = useRef(false);

  // ─── Auth: Check session on mount ──────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      // Check parent mode from localStorage
      const parentData = localStorage.getItem('swala_parent');
      if (parentData) {
        const { studentId } = JSON.parse(parentData);
        setIsLoggedIn(true);
        setLoginRole('parent');
        setParentStudentId(studentId);
        
        // Load parent data on refresh
        const { data: studentRow } = await supabase.from('students').select('*').eq('id', studentId).single();
        if (studentRow) {
          const [recordsRes, homeworkRes, notesRes, assignmentsRes] = await Promise.all([
            supabase.from('daily_records').select('*').eq('student_id', studentId),
            supabase.from('homework').select('*').eq('student_id', studentId),
            supabase.from('student_notes').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
            supabase.from('assignments').select('*').eq('class_id', studentRow.class_id),
          ]);
          setStudents([mapStudent(studentRow)]);
          setRecords((recordsRes.data || []).map(mapRecord));
          setHomeworks((homeworkRes.data || []).map(mapHomework));
          setNotes((notesRes.data || []).map(mapNote));
          setAssignments((assignmentsRes.data || []).map(mapAssignment));
        }

        setAuthLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        setLoginRole('teacher');
        await loadTeacherProfile(session.user.id);
      }
      setAuthLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsLoggedIn(true);
        setLoginRole('teacher');
        await loadTeacherProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setLoginRole(null);
        setTeacher(null);
        setClassInfo(null);
        setHasClass(false);
        setStudents([]);
        setRecords([]);
        setAssignments([]);
        setHomeworks([]);
        setNotes([]);
        fetchedRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Load teacher profile + class ─────────────────────────────
  const loadTeacherProfile = async (authId: string) => {
    const { data: teacherRow } = await supabase
      .from('teachers')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (!teacherRow) return;

    const t = mapTeacher(teacherRow);
    setTeacher(t);

    // Try to find a class assigned to this teacher
    const { data: classRow } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherRow.id)
      .maybeSingle();

    if (classRow) {
      setClassInfo(mapClass(classRow));
      setHasClass(true);
    }
  };

  // ─── Load all data when class is known ────────────────────────
  useEffect(() => {
    if (!classInfo || fetchedRef.current) return;
    fetchedRef.current = true;

    const loadData = async () => {
      setDataLoading(true);

      const [studentsRes, recordsRes, assignmentsRes, homeworkRes, notesRes] = await Promise.all([
        supabase.from('students').select('*').eq('class_id', classInfo.id).order('created_at'),
        supabase.from('daily_records').select('*')
          .in('student_id', (await supabase.from('students').select('id').eq('class_id', classInfo.id)).data?.map(s => s.id) || []),
        supabase.from('assignments').select('*').eq('class_id', classInfo.id).order('due_date', { ascending: false }),
        supabase.from('homework').select('*'),
        supabase.from('student_notes').select('*').order('created_at', { ascending: false }),
      ]);

      setStudents((studentsRes.data || []).map(mapStudent));
      setRecords((recordsRes.data || []).map(mapRecord));
      setAssignments((assignmentsRes.data || []).map(mapAssignment));
      setHomeworks((homeworkRes.data || []).map(mapHomework));
      setNotes((notesRes.data || []).map(mapNote));
      setDataLoading(false);
    };

    loadData();
  }, [classInfo]);

  // ─── Auth Actions ─────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return error.message;
    return null; // "Check your email for confirmation"
  }, []);

  const loginAsParent = useCallback(async (token: string): Promise<boolean> => {
    const { data } = await supabase
      .from('students')
      .select('id, class_id')
      .eq('parent_token', token)
      .single();

    if (!data) return false;

    setIsLoggedIn(true);
    setLoginRole('parent');
    setParentStudentId(data.id);
    localStorage.setItem('swala_parent', JSON.stringify({ studentId: data.id }));

    // Load student's class data for parent view
    const [recordsRes, homeworkRes, notesRes, assignmentsRes] = await Promise.all([
      supabase.from('daily_records').select('*').eq('student_id', data.id),
      supabase.from('homework').select('*').eq('student_id', data.id),
      supabase.from('student_notes').select('*').eq('student_id', data.id).order('created_at', { ascending: false }),
      supabase.from('assignments').select('*').eq('class_id', data.class_id),
    ]);

    // Load the student
    const { data: studentRow } = await supabase.from('students').select('*').eq('id', data.id).single();
    if (studentRow) setStudents([mapStudent(studentRow)]);

    setRecords((recordsRes.data || []).map(mapRecord));
    setHomeworks((homeworkRes.data || []).map(mapHomework));
    setNotes((notesRes.data || []).map(mapNote));
    setAssignments((assignmentsRes.data || []).map(mapAssignment));

    return true;
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('swala_parent');
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setLoginRole(null);
    setParentStudentId(null);
    setTeacher(null);
    setClassInfo(null);
    setHasClass(false);
    fetchedRef.current = false;
  }, []);


  // ─── CRUD Actions ─────────────────────────────────────────────
  const updateRecord = useCallback(async (record: DailyRecord) => {
    const row = toRecordRow(record);

    // Upsert: insert or update if student_id + date conflict
    const { data, error } = await supabase
      .from('daily_records')
      .upsert(row, { onConflict: 'student_id,date' })
      .select()
      .single();

    if (error) {
      console.error('Failed to save record:', error);
      return;
    }

    const mapped = mapRecord(data);
    setRecords(prev => {
      const idx = prev.findIndex(r => r.studentId === mapped.studentId && r.date === mapped.date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = mapped;
        return updated;
      }
      return [...prev, mapped];
    });
  }, []);

  const addStudent = useCallback(async (nameAr: string, nameEn: string) => {
    if (!classInfo) return;

    const { data, error } = await supabase
      .from('students')
      .insert({
        name_ar: nameAr,
        name_en: nameEn,
        class_id: classInfo.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add student:', error);
      return;
    }

    setStudents(prev => [...prev, mapStudent(data)]);
  }, [classInfo]);

  const removeStudent = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to remove student:', error);
      return;
    }

    setStudents(prev => prev.filter(s => s.id !== id));
    setRecords(prev => prev.filter(r => r.studentId !== id));
  }, []);

  const addNote = useCallback(async (note: Omit<StudentNote, 'id' | 'createdAt' | 'createdBy'>) => {
    const { data, error } = await supabase
      .from('student_notes')
      .insert({
        student_id: note.studentId,
        tag: note.tag,
        content: note.content,
        created_by: teacher?.id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add note:', error);
      return;
    }

    setNotes(prev => [mapNote(data), ...prev]);
  }, [teacher]);

  const addAssignment = useCallback(async (title: string, dueDate: string) => {
    if (!classInfo) return;

    const { data: assignRow, error } = await supabase
      .from('assignments')
      .insert({ class_id: classInfo.id, title, due_date: dueDate })
      .select()
      .single();

    if (error || !assignRow) {
      console.error('Failed to create assignment:', error);
      return;
    }

    setAssignments(prev => [mapAssignment(assignRow), ...prev]);

    // Create 'missing' homework entries for all students
    const hwRows = students.map(s => ({
      student_id: s.id,
      assignment_id: assignRow.id,
      status: 'missing' as const,
    }));

    if (hwRows.length > 0) {
      const { data: hwData } = await supabase
        .from('homework')
        .insert(hwRows)
        .select();

      if (hwData) {
        setHomeworks(prev => [...prev, ...hwData.map(mapHomework)]);
      }
    }
  }, [classInfo, students]);

  const updateHomeworkStatus = useCallback(async (studentId: string, assignmentId: string, status: HomeworkStatus) => {
    const submittedAt = status !== 'missing' ? new Date().toISOString().slice(0, 10) : null;

    const { error } = await supabase
      .from('homework')
      .update({ status, submitted_at: submittedAt })
      .eq('student_id', studentId)
      .eq('assignment_id', assignmentId);

    if (error) {
      console.error('Failed to update homework:', error);
      return;
    }

    setHomeworks(prev => prev.map(h => {
      if (h.studentId === studentId && h.assignmentId === assignmentId) {
        return { ...h, status, submittedAt };
      }
      return h;
    }));
  }, []);

  // ─── Loading UI ───────────────────────────────────────────────
  if (authLoading) {
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
            width: 48, height: 48,
            border: '3px solid var(--glass-border)',
            borderTopColor: 'var(--primary-400)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p>Loading FajrFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      isLoggedIn,
      loginRole,
      parentStudentId,
      authLoading,
      login,
      signup,
      loginAsParent,
      logout,
      teacher,
      classInfo,
      students,
      records,
      assignments,
      homeworks,
      notes,
      selectedMonth,
      selectedYear,
      setSelectedMonth,
      setSelectedYear,
      dataLoading,
      updateRecord,
      addStudent,
      removeStudent,
      addNote,
      addAssignment,
      updateHomeworkStatus,
      hasClass,
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
