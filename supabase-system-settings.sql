-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (or authenticated users)
CREATE POLICY "Allow public read access on system_settings" 
ON public.system_settings FOR SELECT 
USING (true);

-- Allow admins to manage system_settings
CREATE POLICY "Allow admins to manage system_settings" 
ON public.system_settings FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Insert default wait times if not exists
INSERT INTO public.system_settings (key, value)
VALUES ('certificate_wait_times', '{"college": 7, "online": 14}'::jsonb)
ON CONFLICT (key) DO NOTHING;
