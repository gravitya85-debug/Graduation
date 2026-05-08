-- Update certificates table to include personal data and documents
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS national_id TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS college_id_number TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS document_urls TEXT[];
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update status enum to include 'rejected'
DO $$ BEGIN
    ALTER TYPE cert_status ADD VALUE 'rejected';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create bucket for certificate documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificate-docs', 'certificate-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'certificate-docs');
CREATE POLICY "Users can upload own docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificate-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
