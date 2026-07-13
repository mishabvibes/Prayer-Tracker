/* ═══════════════════════════════════════════════════════════════
   Mock Data Layer — Demo data for the Swala Tracker
   Will be replaced by Supabase queries in production
   ═══════════════════════════════════════════════════════════════ */

import {
  Teacher, ClassInfo, Student, DailyRecord, Assignment, Homework,
  StudentNote, AttendanceStatus, HomeworkStatus, NoteTag,
} from './types';

// ─── Helpers ────────────────────────────────────────────────────
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Static Entities ────────────────────────────────────────────
export const CURRENT_TEACHER: Teacher = {
  id: 'teacher-001',
  authId: 'auth-001',
  email: 'ustadh.ahmad@school.edu',
  name: 'Ustadh Ahmad',
  role: 'admin',
  status: 'active',
  classId: 'class-001',
};

export const CURRENT_CLASS: ClassInfo = {
  id: 'class-001',
  name: 'Halaqah Al-Noor',
  location: 'Masjid Al-Rahman — Room 3',
  teacherId: 'teacher-001',
  createdAt: '2026-01-15',
};

const STUDENT_NAMES: [string, string][] = [
  ['عبد الله', 'Abdullah'],
  ['محمد', 'Muhammad'],
  ['يوسف', 'Yusuf'],
  ['إبراهيم', 'Ibrahim'],
  ['عمر', 'Omar'],
  ['أحمد', 'Ahmad'],
  ['خالد', 'Khalid'],
  ['حسن', 'Hassan'],
  ['علي', 'Ali'],
  ['سعد', 'Saad'],
  ['فهد', 'Fahd'],
  ['ياسر', 'Yasser'],
  ['طارق', 'Tariq'],
  ['حمزة', 'Hamza'],
  ['بلال', 'Bilal'],
];

export const STUDENTS: Student[] = STUDENT_NAMES.map(([ar, en], i) => ({
  id: `student-${String(i + 1).padStart(3, '0')}`,
  nameAr: ar,
  nameEn: en,
  classId: 'class-001',
  parentToken: `parent-token-${i + 1}`,
  createdAt: '2026-01-15',
}));

// ─── Daily Records ──────────────────────────────────────────────
function generateRecordsForStudent(studentId: string, year: number, month: number): DailyRecord[] {
  const records: DailyRecord[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);

    // Skip Fridays (weekend in many Islamic countries)
    if (dateObj.getDay() === 5) continue;

    // ~10% chance of no record
    if (Math.random() < 0.1) continue;

    const attendance = randomChoice<AttendanceStatus>(['present', 'present', 'present', 'present', 'present', 'present', 'late', 'absent']);

    const record: DailyRecord = {
      id: uuid(),
      studentId,
      date,
      // Legacy fardh
      fajr: attendance === 'absent' ? 0 : randomInt(0, 1),
      dhuhr: attendance === 'absent' ? 0 : randomInt(0, 1),
      asr: attendance === 'absent' ? 0 : randomInt(0, 1),
      maghrib: attendance === 'absent' ? 0 : randomInt(0, 1),
      isha: attendance === 'absent' ? 0 : randomInt(0, 1),
      // Legacy rawatib
      rawatibFajr: Math.random() > 0.3 ? randomInt(0, 1) : null,
      rawatibDhuhr: Math.random() > 0.3 ? randomInt(0, 1) : null,
      rawatibAsr: Math.random() > 0.3 ? randomInt(0, 1) : null,
      rawatibMaghrib: Math.random() > 0.3 ? randomInt(0, 1) : null,
      // 1. Daily
      dailyCommitment: Math.random() > 0.3 ? randomInt(0, 1) : null,
      oneJuzQuran: Math.random() > 0.5 ? randomInt(0, 1) : null,
      ghusl: Math.random() > 0.6 ? randomInt(0, 1) : null,
      duha: Math.random() > 0.4 ? randomInt(0, 1) : null,
      // 2. Congregation
      jamaaFajr: Math.random() > 0.4 ? randomInt(0, 1) : null,
      jamaaDhuhr: Math.random() > 0.4 ? randomInt(0, 1) : null,
      jamaaAsr: Math.random() > 0.4 ? randomInt(0, 1) : null,
      jamaaMaghrib: Math.random() > 0.4 ? randomInt(0, 1) : null,
      jamaaIsha: Math.random() > 0.4 ? randomInt(0, 1) : null,
      // 3. Sunnah Rawatib
      beforeDhuhr: Math.random() > 0.3 ? randomInt(0, 1) : null,
      afterDhuhr: Math.random() > 0.3 ? randomInt(0, 1) : null,
      beforeAsr: Math.random() > 0.4 ? randomInt(0, 1) : null,
      beforeMaghrib: Math.random() > 0.5 ? randomInt(0, 1) : null,
      afterMaghrib: Math.random() > 0.3 ? randomInt(0, 1) : null,
      beforeIsha: Math.random() > 0.5 ? randomInt(0, 1) : null,
      sunnahAfterIsha: Math.random() > 0.3 ? randomInt(0, 1) : null,
      sunnahBeforeFajr: Math.random() > 0.3 ? randomInt(0, 1) : null,
      // 4. Adhkar & Ibadah
      tasbih: Math.random() > 0.4 ? randomInt(0, 1) : null,
      witr: Math.random() > 0.3 ? randomInt(0, 1) : null,
      hizbAlBahr: Math.random() > 0.5 ? randomInt(0, 1) : null,
      ratibAlHaddad: Math.random() > 0.5 ? randomInt(0, 1) : null,
      // 5. Lessons & Other
      firstLesson: Math.random() > 0.3 ? randomInt(0, 1) : null,
      secondLesson: Math.random() > 0.4 ? randomInt(0, 1) : null,
      waqtAlFaraj: Math.random() > 0.5 ? randomInt(0, 1) : null,
      reading: Math.random() > 0.4 ? randomInt(0, 1) : null,
      // Legacy
      adhkar: Math.random() > 0.3 ? randomInt(0, 1) : null,
      dawrah: Math.random() > 0.6 ? randomInt(0, 1) : null,
      attendance,
      behaviourScore: attendance === 'absent' ? null : randomInt(3, 5),
      notes: '',
      recordedBy: 'teacher-001',
    };

    records.push(record);
  }

  return records;
}

// Generate records for current month and previous months
export function generateAllRecords(): DailyRecord[] {
  const allRecords: DailyRecord[] = [];
  const now = new Date();

  for (const student of STUDENTS) {
    // Generate 3 months of data
    for (let m = -2; m <= 0; m++) {
      const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
      allRecords.push(...generateRecordsForStudent(student.id, d.getFullYear(), d.getMonth() + 1));
    }
  }

  return allRecords;
}

// ─── Assignments ────────────────────────────────────────────────
export const ASSIGNMENTS: Assignment[] = [
  { id: 'assign-001', classId: 'class-001', title: 'Memorize Surah Al-Mulk (1-10)', dueDate: '2026-06-15' },
  { id: 'assign-002', classId: 'class-001', title: 'Prayer Positions Worksheet', dueDate: '2026-06-10' },
  { id: 'assign-003', classId: 'class-001', title: 'Write Dua after Salah', dueDate: '2026-06-18' },
  { id: 'assign-004', classId: 'class-001', title: 'Wudu Steps Diagram', dueDate: '2026-06-08' },
];

export function generateHomework(): Homework[] {
  const homeworks: Homework[] = [];
  for (const student of STUDENTS) {
    for (const assignment of ASSIGNMENTS) {
      const status = randomChoice<HomeworkStatus>(['submitted', 'submitted', 'submitted', 'submitted', 'late', 'missing']);
      homeworks.push({
        id: uuid(),
        studentId: student.id,
        assignmentId: assignment.id,
        status,
        submittedAt: status !== 'missing' ? assignment.dueDate : null,
      });
    }
  }
  return homeworks;
}

// ─── Student Notes ──────────────────────────────────────────────
const NOTE_TEMPLATES: { tag: NoteTag; content: string }[] = [
  { tag: 'behaviour', content: 'Excellent focus during today\'s lesson. Very attentive.' },
  { tag: 'behaviour', content: 'Had some difficulty staying focused today. Needs gentle reminders.' },
  { tag: 'academic', content: 'Making great progress in memorization. Keep it up!' },
  { tag: 'academic', content: 'Struggling with tajweed rules. Consider extra practice.' },
  { tag: 'health', content: 'Feeling unwell today. Left class early.' },
  { tag: 'behaviour', content: 'Helped younger students during break. MashaAllah.' },
  { tag: 'academic', content: 'Completed extra credit assignment. Impressive work.' },
];

export function generateNotes(): StudentNote[] {
  const notes: StudentNote[] = [];
  for (const student of STUDENTS) {
    const numNotes = randomInt(1, 4);
    for (let i = 0; i < numNotes; i++) {
      const template = randomChoice(NOTE_TEMPLATES);
      notes.push({
        id: uuid(),
        studentId: student.id,
        tag: template.tag,
        content: template.content,
        createdAt: `2026-06-${String(randomInt(1, 20)).padStart(2, '0')}`,
        createdBy: 'teacher-001',
      });
    }
  }
  return notes;
}

// ─── Analytics Helpers ──────────────────────────────────────────
export function getAttendanceRate(records: DailyRecord[]): number {
  if (records.length === 0) return 0;
  const present = records.filter(r => r.attendance === 'present' || r.attendance === 'late').length;
  return Math.round((present / records.length) * 100);
}

export function getPrayerCompletionRate(records: DailyRecord[]): number {
  if (records.length === 0) return 0;
  let total = 0;
  let performed = 0;
  for (const r of records) {
    const prayers = [r.jamaaFajr, r.jamaaDhuhr, r.jamaaAsr, r.jamaaMaghrib, r.jamaaIsha];
    for (const p of prayers) {
      if (p !== null) {
        total++;
        if (p === 1) performed++;
      }
    }
  }
  return total === 0 ? 0 : Math.round((performed / total) * 100);
}

export function getAvgBehaviour(records: DailyRecord[]): number {
  const scored = records.filter(r => r.behaviourScore !== null);
  if (scored.length === 0) return 0;
  const sum = scored.reduce((acc, r) => acc + (r.behaviourScore || 0), 0);
  return Math.round((sum / scored.length) * 10) / 10;
}

export function getHomeworkRate(homeworks: Homework[]): number {
  if (homeworks.length === 0) return 0;
  const submitted = homeworks.filter(h => h.status === 'submitted' || h.status === 'late').length;
  return Math.round((submitted / homeworks.length) * 100);
}
