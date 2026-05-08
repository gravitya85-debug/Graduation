-- ==========================================
-- 1. EXTEND POSTGRADUATE TABLE
-- ==========================================

ALTER TABLE postgraduate 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS fees NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS university TEXT, -- Already used in UI but might be missing in original DDL
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'masters'; -- masters, phd, diploma

-- ==========================================
-- 2. CREATE POSTGRADUATE APPLICATIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS postgraduate_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES postgraduate(id) ON DELETE CASCADE,
    status app_status DEFAULT 'pending', -- Reuses the app_status enum from original schema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, program_id)
);

-- ==========================================
-- 3. ENABLE RLS & POLICIES
-- ==========================================

ALTER TABLE postgraduate_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own postgraduate applications" ON postgraduate_applications;
CREATE POLICY "Users can view own postgraduate applications" ON postgraduate_applications 
FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can create own postgraduate applications" ON postgraduate_applications;
CREATE POLICY "Users can create own postgraduate applications" ON postgraduate_applications 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all postgraduate applications" ON postgraduate_applications;
CREATE POLICY "Admins can manage all postgraduate applications" ON postgraduate_applications 
FOR ALL USING (is_admin());
