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
  // === Legacy Fardh fields (kept for backward compat) ===
  fajr: number | null;
  dhuhr: number | null;
  asr: number | null;
  maghrib: number | null;
  isha: number | null;
  // === Legacy Rawatib fields (kept for backward compat) ===
  rawatibFajr: number | null;
  rawatibDhuhr: number | null;
  rawatibAsr: number | null;
  rawatibMaghrib: number | null;
  // === Grid columns — Arabic checklist order ===
  // 1. Daily (العهد، القرآن، الاغتسال، الضحى)
  dailyCommitment: number | null;  // العهد
  oneJuzQuran: number | null;      // قراءة جزء من القرآن
  ghusl: number | null;            // الاغتسال
  duha: number | null;             // الضحى
  // 2. Congregation Prayers (صلاة الجماعة)
  jamaaFajr: number | null;        // الصبح
  jamaaDhuhr: number | null;       // الظهر
  jamaaAsr: number | null;         // العصر
  jamaaMaghrib: number | null;     // المغرب
  jamaaIsha: number | null;        // العشاء
  // 3. Sunnah Rawatib (السنن الرواتب)
  beforeDhuhr: number | null;      // قبل الظهر
  afterDhuhr: number | null;       // بعد الظهر
  beforeAsr: number | null;        // قبل العصر
  beforeMaghrib: number | null;    // قبل المغرب
  afterMaghrib: number | null;     // بعد المغرب
  beforeIsha: number | null;       // قبل العشاء
  sunnahAfterIsha: number | null;  // بعد العشاء
  sunnahBeforeFajr: number | null; // قبل الصبح
  // 4. Adhkar & Ibadah (أذكار وعبادات)
  tasbih: number | null;           // التسبيح ٣٣ دقائق
  witr: number | null;             // الوتر
  hizbAlBahr: number | null;       // حزب البر (field name kept)
  ratibAlHaddad: number | null;    // الحداد
  // 5. Lessons & Other (الدروس وأخرى)
  firstLesson: number | null;      // الدرس الأول
  secondLesson: number | null;     // الدرس الثاني
  waqtAlFaraj: number | null;      // وقت ثلث (field name kept)
  reading: number | null;          // القراءة
  // === Legacy fields (kept for backward compat) ===
  adhkar: number | null;
  dawrah: number | null;
  attendance: AttendanceStatus | null;
  behaviourScore: number | null;
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

// ─── Legacy arrays (used by dashboard, analytics, export, parent pages) ──────
export const FARDH_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export const RAWATIB_PRAYERS = ['rawatibFajr', 'rawatibDhuhr', 'rawatibAsr', 'rawatibMaghrib'] as const;
export const JAMAA_PRAYERS = ['jamaaFajr', 'jamaaDhuhr', 'jamaaAsr', 'jamaaMaghrib', 'jamaaIsha'] as const;

// ─── Grid column arrays — Arabic checklist order ─────────────────────────────
export const GRID_DAILY = ['dailyCommitment', 'oneJuzQuran', 'ghusl', 'duha'] as const;
export const GRID_CONGREGATION = ['jamaaFajr', 'jamaaDhuhr', 'jamaaAsr', 'jamaaMaghrib', 'jamaaIsha'] as const;
export const GRID_RAWATIB = ['beforeDhuhr', 'afterDhuhr', 'beforeAsr', 'beforeMaghrib', 'afterMaghrib', 'beforeIsha', 'sunnahAfterIsha', 'sunnahBeforeFajr'] as const;
export const GRID_ADHKAR = ['tasbih', 'witr', 'hizbAlBahr', 'ratibAlHaddad'] as const;
export const GRID_LESSONS = ['firstLesson', 'secondLesson', 'waqtAlFaraj', 'reading'] as const;

export type FardhPrayer = typeof FARDH_PRAYERS[number];
export type RawatibPrayer = typeof RAWATIB_PRAYERS[number];
export type JamaaPrayer = typeof JAMAA_PRAYERS[number];
export type GridField = typeof GRID_DAILY[number] | typeof GRID_CONGREGATION[number]
  | typeof GRID_RAWATIB[number] | typeof GRID_ADHKAR[number] | typeof GRID_LESSONS[number];
export type PrayerField = FardhPrayer | RawatibPrayer | JamaaPrayer | GridField
  | 'adhkar' | 'dawrah';

export const PRAYER_LABELS: Record<string, string> = {
  // Legacy
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  rawatibFajr: 'Fajr',
  rawatibDhuhr: 'Dhuhr',
  rawatibAsr: 'Asr',
  rawatibMaghrib: 'Maghrib',
  // 1. Daily
  dailyCommitment: 'Tahajjud',
  oneJuzQuran: 'Juz\' Qur\'an',
  ghusl: 'Ghusl',
  duha: 'Duha',
  // 2. Congregation
  jamaaFajr: 'Fajr',
  jamaaDhuhr: 'Dhuhr',
  jamaaAsr: 'Asr',
  jamaaMaghrib: 'Maghrib',
  jamaaIsha: 'Isha',
  // 3. Sunnah Rawatib
  beforeDhuhr: 'Bfr Dhuhr',
  afterDhuhr: 'Aft Dhuhr',
  beforeAsr: 'Bfr Asr',
  beforeMaghrib: 'Bfr Maghrib',
  afterMaghrib: 'Aft Maghrib',
  beforeIsha: 'Bfr Isha',
  sunnahAfterIsha: 'Aft Isha',
  sunnahBeforeFajr: 'Bfr Fajr',
  // 4. Adhkar & Ibadah
  tasbih: 'Tasbih',
  witr: 'Witr',
  hizbAlBahr: 'Hizb al-Barr',
  ratibAlHaddad: 'Al-Haddad',
  // 5. Lessons & Other
  firstLesson: '1st Lesson',
  secondLesson: '2nd Lesson',
  waqtAlFaraj: '⅓ Time',
  reading: 'Reading',
  // Legacy
  adhkar: 'Adhkar',
  dawrah: 'Dawrah',
};

export const PRAYER_COLORS: Record<string, string> = {
  fajr: 'var(--prayer-fajr)',
  dhuhr: 'var(--prayer-dhuhr)',
  asr: 'var(--prayer-asr)',
  maghrib: 'var(--prayer-maghrib)',
  isha: 'var(--prayer-isha)',
};
