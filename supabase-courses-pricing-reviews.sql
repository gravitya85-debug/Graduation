-- =============================================
-- Migration: Add pricing, instructor, and reviews
-- =============================================

-- 1. Add new columns to the existing 'courses' table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_name TEXT DEFAULT '';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT TRUE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0;

-- 2. Create 'course_reviews' table
CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 3. Enable RLS on course_reviews
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews
CREATE POLICY "Anyone can view reviews"
    ON course_reviews FOR SELECT
    USING (true);

-- Authenticated users can insert their own review
CREATE POLICY "Users can insert own reviews"
    ON course_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own review
CREATE POLICY "Users can update own reviews"
    ON course_reviews FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own review
CREATE POLICY "Users can delete own reviews"
    ON course_reviews FOR DELETE
    USING (auth.uid() = user_id);
