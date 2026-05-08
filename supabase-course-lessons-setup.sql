-- ==========================================
-- MULTI-LESSON COURSE UPGRADE SCHEMA
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. COURSE LESSONS TABLE
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT,
    pdf_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. LESSON PROGRESS TABLE
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, lesson_id)
);

-- ==========================================
-- ENABLING RLS
-- ==========================================
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLICIES
-- ==========================================

-- Helper function assumption: is_admin() already exists from previous setup.
-- If not, it should be created. Assuming it exists.

-- COURSE LESSONS POLICIES
DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON course_lessons;
CREATE POLICY "Lessons are viewable by everyone" ON course_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage lessons" ON course_lessons;
CREATE POLICY "Admins can manage lessons" ON course_lessons FOR ALL USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- LESSON PROGRESS POLICIES
DROP POLICY IF EXISTS "Users can manage own lesson progress" ON lesson_progress;
CREATE POLICY "Users can manage own lesson progress" ON lesson_progress FOR ALL USING (auth.uid() = user_id);
