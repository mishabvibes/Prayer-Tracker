-- ═══════════════════════════════════════════════════════════════
--  Swala Tracker — Supabase Database Setup
--  Run this ONCE in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TEACHERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id    UUID UNIQUE NOT NULL,       -- links to auth.users.id
  email      TEXT NOT NULL,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
  class_id   UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── CLASSES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  lesson_name TEXT DEFAULT '',
  location    TEXT DEFAULT '',
  teacher_id  UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Link teacher → class (after both tables exist)
ALTER TABLE teachers
  ADD CONSTRAINT fk_teacher_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;

-- ─── STUDENTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar      TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  class_id     UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  parent_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ─── DAILY RECORDS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_records (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date             DATE NOT NULL,
  -- Fardh prayers: 0 = missed, 1 = performed, NULL = not recorded
  fajr             SMALLINT CHECK (fajr IN (0, 1)),
  dhuhr            SMALLINT CHECK (dhuhr IN (0, 1)),
  asr              SMALLINT CHECK (asr IN (0, 1)),
  maghrib          SMALLINT CHECK (maghrib IN (0, 1)),
  isha             SMALLINT CHECK (isha IN (0, 1)),
  -- Sunnah Rawatib
  rawatib_fajr     SMALLINT CHECK (rawatib_fajr IN (0, 1)),
  rawatib_dhuhr    SMALLINT CHECK (rawatib_dhuhr IN (0, 1)),
  rawatib_asr      SMALLINT CHECK (rawatib_asr IN (0, 1)),
  rawatib_maghrib  SMALLINT CHECK (rawatib_maghrib IN (0, 1)),
  -- Congregation (Jamaa)
  jamaa_fajr       SMALLINT CHECK (jamaa_fajr IN (0, 1)),
  jamaa_dhuhr      SMALLINT CHECK (jamaa_dhuhr IN (0, 1)),
  jamaa_asr        SMALLINT CHECK (jamaa_asr IN (0, 1)),
  jamaa_maghrib    SMALLINT CHECK (jamaa_maghrib IN (0, 1)),
  jamaa_isha       SMALLINT CHECK (jamaa_isha IN (0, 1)),
  -- Other
  attendance       TEXT CHECK (attendance IN ('present', 'absent', 'late')),
  behaviour_score  SMALLINT CHECK (behaviour_score BETWEEN 1 AND 5),
  notes            TEXT DEFAULT '',
  recorded_by      UUID REFERENCES teachers(id),
  created_at       TIMESTAMPTZ DEFAULT now(),
  -- One record per student per day
  UNIQUE(student_id, date)
);

-- ─── ASSIGNMENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id   UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  due_date   DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── HOMEWORK ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homework (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'missing' CHECK (status IN ('submitted', 'late', 'missing')),
  submitted_at  DATE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, assignment_id)
);

-- ─── STUDENT NOTES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tag        TEXT NOT NULL CHECK (tag IN ('behaviour', 'health', 'academic')),
  content    TEXT NOT NULL,
  created_by UUID REFERENCES teachers(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── INDEXES ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_records_student    ON daily_records(student_id);
CREATE INDEX IF NOT EXISTS idx_records_date       ON daily_records(date);
CREATE INDEX IF NOT EXISTS idx_records_student_dt ON daily_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_homework_student   ON homework(student_id);
CREATE INDEX IF NOT EXISTS idx_homework_assign    ON homework(assignment_id);
CREATE INDEX IF NOT EXISTS idx_notes_student      ON student_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_students_class     ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_token     ON students(parent_token);

-- ═══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE teachers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE students       ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework       ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes  ENABLE ROW LEVEL SECURITY;

-- Teachers can read/write their own data
CREATE POLICY "Teachers see own profile"
  ON teachers FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Teachers update own profile"
  ON teachers FOR UPDATE
  USING (auth_id = auth.uid());

-- Teachers can read/write their class
CREATE POLICY "Teachers see own class"
  ON classes FOR SELECT
  USING (teacher_id IN (SELECT id FROM teachers WHERE auth_id = auth.uid()));

CREATE POLICY "Teachers manage own class"
  ON classes FOR ALL
  USING (teacher_id IN (SELECT id FROM teachers WHERE auth_id = auth.uid()));

-- Teachers can manage students in their class
CREATE POLICY "Teachers see class students"
  ON students FOR SELECT
  USING (class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE auth_id = auth.uid())));

CREATE POLICY "Teachers manage class students"
  ON students FOR ALL
  USING (class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE auth_id = auth.uid())));

-- Teachers can manage daily records of their students
CREATE POLICY "Teachers manage records"
  ON daily_records FOR ALL
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    JOIN teachers t ON c.teacher_id = t.id
    WHERE t.auth_id = auth.uid()
  ));

-- Teachers can manage assignments
CREATE POLICY "Teachers manage assignments"
  ON assignments FOR ALL
  USING (class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE auth_id = auth.uid())));

-- Teachers can manage homework
CREATE POLICY "Teachers manage homework"
  ON homework FOR ALL
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    JOIN teachers t ON c.teacher_id = t.id
    WHERE t.auth_id = auth.uid()
  ));

-- Teachers can manage student notes
CREATE POLICY "Teachers manage notes"
  ON student_notes FOR ALL
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    JOIN teachers t ON c.teacher_id = t.id
    WHERE t.auth_id = auth.uid()
  ));

-- ═══════════════════════════════════════════════════════════════
--  HELPER FUNCTION: Auto-create teacher profile on sign-up
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.teachers (auth_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'admin'
  );
  RETURN NEW;
END;
$$;

-- Trigger: create teacher profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
