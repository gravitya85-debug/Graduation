-- Create doctors table to store additional profile information for faculty members
CREATE TABLE IF NOT EXISTS doctors (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    degree TEXT,
    department TEXT,
    specialization TEXT,
    bio TEXT,
    office_hours TEXT,
    research_interests TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public doctors are viewable by everyone" ON doctors;
CREATE POLICY "Public doctors are viewable by everyone" ON doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Doctors can update own info" ON doctors;
CREATE POLICY "Doctors can update own info" ON doctors FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Doctors can insert own info" ON doctors;
CREATE POLICY "Doctors can insert own info" ON doctors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update user_role enum if doctor is missing (in case it was added only in code)
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE 'doctor';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
