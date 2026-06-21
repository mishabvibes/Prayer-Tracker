/* ═══════════════════════════════════════════════════════════════
   Supabase ↔ App Type Mappers
   Converts snake_case DB rows ↔ camelCase TypeScript models
   ═══════════════════════════════════════════════════════════════ */

import type {
  Student, DailyRecord, Assignment, Homework, StudentNote,
  Teacher, ClassInfo,
} from '@/lib/types';

// ─── Row → App Mappers ──────────────────────────────────────────

export function mapTeacher(row: any): Teacher {
  return {
    id: row.id,
    authId: row.auth_id,
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status || 'active',
    classId: row.class_id || '',
  };
}

export function mapClass(row: any): ClassInfo {
  return {
    id: row.id,
    name: row.name,
    location: row.location || '',
    teacherId: row.teacher_id,
    createdAt: row.created_at,
  };
}

export function mapStudent(row: any): Student {
  return {
    id: row.id,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    classId: row.class_id,
    parentToken: row.parent_token,
    createdAt: row.created_at,
  };
}

export function mapRecord(row: any): DailyRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    date: row.date,
    fajr: row.fajr,
    dhuhr: row.dhuhr,
    asr: row.asr,
    maghrib: row.maghrib,
    isha: row.isha,
    rawatibFajr: row.rawatib_fajr,
    rawatibDhuhr: row.rawatib_dhuhr,
    rawatibAsr: row.rawatib_asr,
    rawatibMaghrib: row.rawatib_maghrib,
    jamaaFajr: row.jamaa_fajr,
    jamaaDhuhr: row.jamaa_dhuhr,
    jamaaAsr: row.jamaa_asr,
    jamaaMaghrib: row.jamaa_maghrib,
    jamaaIsha: row.jamaa_isha,
    attendance: row.attendance,
    behaviourScore: row.behaviour_score,
    notes: row.notes || '',
    recordedBy: row.recorded_by || '',
  };
}

export function mapAssignment(row: any): Assignment {
  return {
    id: row.id,
    classId: row.class_id,
    title: row.title,
    dueDate: row.due_date,
  };
}

export function mapHomework(row: any): Homework {
  return {
    id: row.id,
    studentId: row.student_id,
    assignmentId: row.assignment_id,
    status: row.status,
    submittedAt: row.submitted_at,
  };
}

export function mapNote(row: any): StudentNote {
  return {
    id: row.id,
    studentId: row.student_id,
    tag: row.tag,
    content: row.content,
    createdAt: row.created_at,
    createdBy: row.created_by || '',
  };
}

// ─── App → Row Mappers (for inserts/updates) ────────────────────

export function toRecordRow(r: DailyRecord) {
  return {
    id: r.id,
    student_id: r.studentId,
    date: r.date,
    fajr: r.fajr,
    dhuhr: r.dhuhr,
    asr: r.asr,
    maghrib: r.maghrib,
    isha: r.isha,
    rawatib_fajr: r.rawatibFajr,
    rawatib_dhuhr: r.rawatibDhuhr,
    rawatib_asr: r.rawatibAsr,
    rawatib_maghrib: r.rawatibMaghrib,
    jamaa_fajr: r.jamaaFajr,
    jamaa_dhuhr: r.jamaaDhuhr,
    jamaa_asr: r.jamaaAsr,
    jamaa_maghrib: r.jamaaMaghrib,
    jamaa_isha: r.jamaaIsha,
    attendance: r.attendance,
    behaviour_score: r.behaviourScore,
    notes: r.notes,
    recorded_by: r.recordedBy || null,
  };
}
