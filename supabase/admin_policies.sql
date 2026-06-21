-- Run this in your Supabase SQL editor to enable Admin access

-- Helper function to avoid infinite recursion in RLS
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teachers WHERE auth_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Add admin policies to teachers table
CREATE POLICY "Admins manage teachers" ON public.teachers FOR ALL USING (public.is_admin());

-- Add admin policies to classes table
CREATE POLICY "Admins manage classes" ON public.classes FOR ALL USING (public.is_admin());

-- Allow admins to see/manage all records if needed (optional, currently teachers can only see their own class records)
CREATE POLICY "Admins manage students" ON public.students FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage daily records" ON public.daily_records FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage assignments" ON public.assignments FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage homework" ON public.homework FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage notes" ON public.student_notes FOR ALL USING (public.is_admin());
