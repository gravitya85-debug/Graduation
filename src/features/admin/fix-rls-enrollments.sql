-- Fix missing column and RLS Policies for Admin Enrollments Dashboard

-- 1. Add missing created_at column to course_progress
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='course_progress' AND column_name='created_at') THEN
        ALTER TABLE course_progress ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. Course Progress Admin Access
DROP POLICY IF EXISTS "Admins can view all progress" ON course_progress;
CREATE POLICY "Admins can view all progress" ON course_progress 
FOR SELECT USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- 3. Postgraduate Applications Admin Access
DROP POLICY IF EXISTS "Admins can manage all postgraduate applications" ON postgraduate_applications;
CREATE POLICY "Admins can manage all postgraduate applications" ON postgraduate_applications 
FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
