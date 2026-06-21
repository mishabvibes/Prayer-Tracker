/* ═══════════════════════════════════════════════════════════════
   Type definitions for the Swala Tracker application
   ═══════════════════════════════════════════════════════════════ */

export type UserRole = 'admin' | 'teacher';
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type HomeworkStatus = 'submitted' | 'late' | 'missing';
export type NoteTag = 'behaviour' | 'health' | 'academic';

export interface Teacher {
  id: string;
  authId: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'suspended';
  classId: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  location: string;
  teacherId: string;
  createdAt: string;
}

export interface Student {
  id: string;
  nameAr: string;
  nameEn: string;
  classId: string;
  parentToken: string;
  createdAt: string;
}

export interface DailyRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  // Fardh prayers (0 = missed, 1 = performed, null = not recorded)
  fajr: number | null;
  dhuhr: number | null;
  asr: number | null;
  maghrib: number | null;
  isha: number | null;
  // Sunnah Rawatib
  rawatibFajr: number | null;
  rawatibDhuhr: number | null;
  rawatibAsr: number | null;
  rawatibMaghrib: number | null;
  // Congregation (Salah al-Jamaa)
  jamaaFajr: number | null;
  jamaaDhuhr: number | null;
  jamaaAsr: number | null;
  jamaaMaghrib: number | null;
  jamaaIsha: number | null;
  // Other tracking
  attendance: AttendanceStatus | null;
  behaviourScore: number | null; // 1-5
  notes: string;
  recordedBy: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  dueDate: string;
}

export interface Homework {
  id: string;
  studentId: string;
  assignmentId: string;
  status: HomeworkStatus;
  submittedAt: string | null;
}

export interface StudentNote {
  id: string;
  studentId: string;
  tag: NoteTag;
  content: string;
  createdAt: string;
  createdBy: string;
}

// Prayer column definitions for the grid
export const FARDH_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export const RAWATIB_PRAYERS = ['rawatibFajr', 'rawatibDhuhr', 'rawatibAsr', 'rawatibMaghrib'] as const;
export const JAMAA_PRAYERS = ['jamaaFajr', 'jamaaDhuhr', 'jamaaAsr', 'jamaaMaghrib', 'jamaaIsha'] as const;

export type FardhPrayer = typeof FARDH_PRAYERS[number];
export type RawatibPrayer = typeof RAWATIB_PRAYERS[number];
export type JamaaPrayer = typeof JAMAA_PRAYERS[number];
export type PrayerField = FardhPrayer | RawatibPrayer | JamaaPrayer;

export const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  rawatibFajr: 'Fajr',
  rawatibDhuhr: 'Dhuhr',
  rawatibAsr: 'Asr',
  rawatibMaghrib: 'Maghrib',
  jamaaFajr: 'Fajr',
  jamaaDhuhr: 'Dhuhr',
  jamaaAsr: 'Asr',
  jamaaMaghrib: 'Maghrib',
  jamaaIsha: 'Isha',
};

export const PRAYER_COLORS: Record<string, string> = {
  fajr: 'var(--prayer-fajr)',
  dhuhr: 'var(--prayer-dhuhr)',
  asr: 'var(--prayer-asr)',
  maghrib: 'var(--prayer-maghrib)',
  isha: 'var(--prayer-isha)',
};
