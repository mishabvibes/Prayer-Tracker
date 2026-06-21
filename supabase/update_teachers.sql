-- Run this to update the teachers table
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended'));
