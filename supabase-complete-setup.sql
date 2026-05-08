-- ==========================================
-- 1. BASE SCHEMA & ENUMS
-- ==========================================

-- CREATE ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('graduate', 'admin', 'company');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cert_status AS ENUM ('pending', 'ready', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE app_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'graduate',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- GRADUATES TABLE
CREATE TABLE IF NOT EXISTS graduates (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization TEXT,
    graduation_year INTEGER,
    skills TEXT[],
    cv_url TEXT
);

-- CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status cert_status DEFAULT 'pending',
    appointment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[],
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    graduate_id UUID REFERENCES graduates(user_id) ON DELETE CASCADE,
    status app_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    content_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- COURSE PROGRESS
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, course_id)
);

-- SUCCESS STORIES TABLE
CREATE TABLE IF NOT EXISTS success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    story TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- POSTGRADUATE TABLE
CREATE TABLE IF NOT EXISTS postgraduate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    requirements TEXT[],
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- NOTIFICATIONS TABLE (Phase 2 Addon)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 2. ENABLING RLS
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE postgraduate ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. SECURITY HELPERS & POLICIES
-- ==========================================

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
CREATE POLICY "Public profiles are viewable by everyone" ON users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Admins can update all users" ON users;
CREATE POLICY "Admins can update all users" ON users FOR UPDATE USING (is_admin());

-- GRADUATES POLICIES
DROP POLICY IF EXISTS "Public graduates are viewable by everyone" ON graduates;
CREATE POLICY "Public graduates are viewable by everyone" ON graduates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Graduates can update own info" ON graduates;
CREATE POLICY "Graduates can update own info" ON graduates FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Graduates can insert own info" ON graduates;
CREATE POLICY "Graduates can insert own info" ON graduates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- JOBS POLICIES
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON jobs;
CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Companies can insert jobs" ON jobs;
CREATE POLICY "Companies can insert jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = company_id);
DROP POLICY IF EXISTS "Admins can manage all jobs" ON jobs;
CREATE POLICY "Admins can manage all jobs" ON jobs FOR ALL USING (is_admin());

-- APPLICATIONS POLICIES
DROP POLICY IF EXISTS "Applications viewable by job owner or applicant" ON applications;
CREATE POLICY "Applications viewable by job owner or applicant" ON applications FOR SELECT USING (
  auth.uid() = graduate_id OR 
  auth.uid() IN (SELECT company_id FROM jobs WHERE id = job_id)
);
DROP POLICY IF EXISTS "Graduates can apply" ON applications;
CREATE POLICY "Graduates can apply" ON applications FOR INSERT WITH CHECK (auth.uid() = graduate_id);
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
CREATE POLICY "Admins can view all applications" ON applications FOR SELECT USING (is_admin());

-- CERTIFICATES POLICIES
DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id OR is_admin());
DROP POLICY IF EXISTS "Users can insert own certificates" ON certificates;
CREATE POLICY "Users can insert own certificates" ON certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can update certificates" ON certificates;
CREATE POLICY "Admins can update certificates" ON certificates FOR UPDATE USING (is_admin());

-- COURSE PROGRESS POLICIES
DROP POLICY IF EXISTS "Users can manage own progress" ON course_progress;
CREATE POLICY "Users can manage own progress" ON course_progress FOR ALL USING (auth.uid() = user_id);

-- COURSES POLICIES
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
CREATE POLICY "Courses are viewable by everyone" ON courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses" ON courses FOR ALL USING (is_admin());

-- SUCCESS STORIES POLICIES
DROP POLICY IF EXISTS "Public success stories are viewable by everyone" ON success_stories;
CREATE POLICY "Public success stories are viewable by everyone" ON success_stories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage success stories" ON success_stories;
CREATE POLICY "Admins can manage success stories" ON success_stories FOR ALL USING (is_admin());

-- POSTGRADUATE POLICIES
DROP POLICY IF EXISTS "Postgraduate programs are viewable by everyone" ON postgraduate;
CREATE POLICY "Postgraduate programs are viewable by everyone" ON postgraduate FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage postgraduate" ON postgraduate;
CREATE POLICY "Admins can manage postgraduate" ON postgraduate FOR ALL USING (is_admin());

-- NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own notifications (mark as read)" ON notifications;
CREATE POLICY "Users can update own notifications (mark as read)" ON notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
