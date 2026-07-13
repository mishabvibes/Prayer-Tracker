-- Migration: Add all Arabic checklist columns to daily_records
-- Run this in the Supabase SQL editor

ALTER TABLE daily_records
  -- Daily items
  ADD COLUMN IF NOT EXISTS daily_commitment smallint,
  ADD COLUMN IF NOT EXISTS one_juz_quran smallint,
  ADD COLUMN IF NOT EXISTS ghusl smallint,
  ADD COLUMN IF NOT EXISTS duha smallint,
  -- Sunnah Rawatib (new before/after structure)
  ADD COLUMN IF NOT EXISTS before_dhuhr smallint,
  ADD COLUMN IF NOT EXISTS after_dhuhr smallint,
  ADD COLUMN IF NOT EXISTS before_asr smallint,
  ADD COLUMN IF NOT EXISTS before_maghrib smallint,
  ADD COLUMN IF NOT EXISTS after_maghrib smallint,
  ADD COLUMN IF NOT EXISTS before_isha smallint,
  ADD COLUMN IF NOT EXISTS sunnah_after_isha smallint,
  ADD COLUMN IF NOT EXISTS sunnah_before_fajr smallint,
  -- Adhkar & Ibadah
  ADD COLUMN IF NOT EXISTS tasbih smallint,
  ADD COLUMN IF NOT EXISTS witr smallint,
  ADD COLUMN IF NOT EXISTS hizb_al_bahr smallint,
  ADD COLUMN IF NOT EXISTS ratib_al_haddad smallint,
  -- Lessons & Other
  ADD COLUMN IF NOT EXISTS first_lesson smallint,
  ADD COLUMN IF NOT EXISTS second_lesson smallint,
  ADD COLUMN IF NOT EXISTS waqt_al_faraj smallint,
  ADD COLUMN IF NOT EXISTS reading smallint,
  -- Legacy (from previous migration, safe to re-add)
  ADD COLUMN IF NOT EXISTS adhkar smallint,
  ADD COLUMN IF NOT EXISTS dawrah smallint;