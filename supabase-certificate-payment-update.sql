-- Add payment and delivery methods to certificates
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('college', 'online');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_method AS ENUM ('pickup', 'mail');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE certificates ADD COLUMN IF NOT EXISTS payment_method payment_method DEFAULT 'college';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS delivery_method delivery_method DEFAULT 'pickup';

-- Create system settings table for wait times and other configurations
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize wait times
INSERT INTO system_settings (key, value)
VALUES ('certificate_wait_times', '{"college": 7, "online": 14}'::jsonb)
ON CONFLICT (key) DO NOTHING;
