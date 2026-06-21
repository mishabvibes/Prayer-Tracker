/* ═══════════════════════════════════════════════════════════════
   Supabase Database Types — Maps directly to PostgreSQL tables
   ═══════════════════════════════════════════════════════════════ */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string;
          auth_id: string;
          email: string;
          name: string;
          role: 'admin' | 'teacher';
          class_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['teachers']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['teachers']['Insert']>;
      };
      classes: {
        Row: {
          id: string;
          name: string;
          lesson_name: string;
          location: string;
          teacher_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['classes']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['classes']['Insert']>;
      };
      students: {
        Row: {
          id: string;
          name_ar: string;
          name_en: string;
          class_id: string;
          parent_token: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['students']['Insert']>;
      };
      daily_records: {
        Row: {
          id: string;
          student_id: string;
          date: string;
          fajr: number | null;
          dhuhr: number | null;
          asr: number | null;
          maghrib: number | null;
          isha: number | null;
          rawatib_fajr: number | null;
          rawatib_dhuhr: number | null;
          rawatib_asr: number | null;
          rawatib_maghrib: number | null;
          jamaa_fajr: number | null;
          jamaa_dhuhr: number | null;
          jamaa_asr: number | null;
          jamaa_maghrib: number | null;
          jamaa_isha: number | null;
          attendance: 'present' | 'absent' | 'late' | null;
          behaviour_score: number | null;
          notes: string;
          recorded_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_records']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['daily_records']['Insert']>;
      };
      assignments: {
        Row: {
          id: string;
          class_id: string;
          title: string;
          due_date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assignments']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['assignments']['Insert']>;
      };
      homework: {
        Row: {
          id: string;
          student_id: string;
          assignment_id: string;
          status: 'submitted' | 'late' | 'missing';
          submitted_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['homework']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['homework']['Insert']>;
      };
      student_notes: {
        Row: {
          id: string;
          student_id: string;
          tag: 'behaviour' | 'health' | 'academic';
          content: string;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['student_notes']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['student_notes']['Insert']>;
      };
    };
  };
}
