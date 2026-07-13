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
    dailyCommitment: row.daily_commitment ?? null,
    oneJuzQuran: row.one_juz_quran ?? null,
    ghusl: row.ghusl ?? null,
    duha: row.duha ?? null,
    jamaaFajr: row.jamaa_fajr,
    jamaaDhuhr: row.jamaa_dhuhr,
    jamaaAsr: row.jamaa_asr,
    jamaaMaghrib: row.jamaa_maghrib,
    jamaaIsha: row.jamaa_isha,
    beforeDhuhr: row.before_dhuhr ?? null,
    afterDhuhr: row.after_dhuhr ?? null,
    beforeAsr: row.before_asr ?? null,
    beforeMaghrib: row.before_maghrib ?? null,
    afterMaghrib: row.after_maghrib ?? null,
    beforeIsha: row.before_isha ?? null,
    sunnahAfterIsha: row.sunnah_after_isha ?? null,
    sunnahBeforeFajr: row.sunnah_before_fajr ?? null,
    tasbih: row.tasbih ?? null,
    witr: row.witr ?? null,
    hizbAlBahr: row.hizb_al_bahr ?? null,
    ratibAlHaddad: row.ratib_al_haddad ?? null,
    firstLesson: row.first_lesson ?? null,
    secondLesson: row.second_lesson ?? null,
    waqtAlFaraj: row.waqt_al_faraj ?? null,
    reading: row.reading ?? null,
    adhkar: row.adhkar ?? null,
    dawrah: row.dawrah ?? null,
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
  const row: any = {
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
    daily_commitment: r.dailyCommitment,
    one_juz_quran: r.oneJuzQuran,
    ghusl: r.ghusl,
    duha: r.duha,
    jamaa_fajr: r.jamaaFajr,
    jamaa_dhuhr: r.jamaaDhuhr,
    jamaa_asr: r.jamaaAsr,
    jamaa_maghrib: r.jamaaMaghrib,
    jamaa_isha: r.jamaaIsha,
    before_dhuhr: r.beforeDhuhr,
    after_dhuhr: r.afterDhuhr,
    before_asr: r.beforeAsr,
    before_maghrib: r.beforeMaghrib,
    after_maghrib: r.afterMaghrib,
    before_isha: r.beforeIsha,
    sunnah_after_isha: r.sunnahAfterIsha,
    sunnah_before_fajr: r.sunnahBeforeFajr,
    tasbih: r.tasbih,
    witr: r.witr,
    hizb_al_bahr: r.hizbAlBahr,
    ratib_al_haddad: r.ratibAlHaddad,
    first_lesson: r.firstLesson,
    second_lesson: r.secondLesson,
    waqt_al_faraj: r.waqtAlFaraj,
    reading: r.reading,
    adhkar: r.adhkar,
    dawrah: r.dawrah,
    attendance: r.attendance,
    behaviour_score: r.behaviourScore,
    notes: r.notes,
    recorded_by: r.recordedBy || null,
  };

  if (r.id && !r.id.startsWith('rec-')) {
    row.id = r.id;
  }

  return row;
}
