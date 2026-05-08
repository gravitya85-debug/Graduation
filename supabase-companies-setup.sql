-- Create companies table to store additional profile information
CREATE TABLE IF NOT EXISTS companies (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    website TEXT,
    industry TEXT,
    location TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public companies are viewable by everyone" ON companies;
CREATE POLICY "Public companies are viewable by everyone" ON companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Companies can update own info" ON companies;
CREATE POLICY "Companies can update own info" ON companies FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Companies can insert own info" ON companies;
CREATE POLICY "Companies can insert own info" ON companies FOR INSERT WITH CHECK (auth.uid() = user_id);
