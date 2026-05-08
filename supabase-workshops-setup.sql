-- Workshops & Seminars Feature Implementation

-- 1. Workshops Table
CREATE TABLE IF NOT EXISTS workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'workshop' CHECK (type IN ('workshop', 'seminar')),
    date TIMESTAMPTZ NOT NULL,
    location TEXT,
    instructor TEXT,
    capacity INTEGER DEFAULT 50,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workshop Registrations (Many-to-Many between users and workshops)
CREATE TABLE IF NOT EXISTS workshop_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workshop_id, user_id)
);

-- 3. RLS - Workshops (Readable by everyone, manageable by Admin)
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workshops are viewable by everyone" ON workshops;
CREATE POLICY "Workshops are viewable by everyone" ON workshops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all workshops" ON workshops;
CREATE POLICY "Admins can manage all workshops" ON workshops 
FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- 4. RLS - Registrations (Users can manage own, Admins can view all)
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own registrations" ON workshop_registrations;
CREATE POLICY "Users can view own registrations" ON workshop_registrations 
FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Users can register themselves" ON workshop_registrations;
CREATE POLICY "Users can register themselves" ON workshop_registrations 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all registrations" ON workshop_registrations;
CREATE POLICY "Admins can manage all registrations" ON workshop_registrations 
FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
