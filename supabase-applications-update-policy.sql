-- Add update policy for applications table to allow companies to change status
DROP POLICY IF EXISTS "Companies can update application status" ON applications;
CREATE POLICY "Companies can update application status" ON applications 
FOR UPDATE 
USING (
  auth.uid() IN (SELECT company_id FROM jobs WHERE id = job_id)
)
WITH CHECK (
  auth.uid() IN (SELECT company_id FROM jobs WHERE id = job_id)
);

-- Also allow admins to update all applications
DROP POLICY IF EXISTS "Admins can update all applications" ON applications;
CREATE POLICY "Admins can update all applications" ON applications 
FOR UPDATE 
USING (is_admin());

-- Add update policy for jobs table to allow companies to edit their own jobs
DROP POLICY IF EXISTS "Companies can update own jobs" ON jobs;
CREATE POLICY "Companies can update own jobs" ON jobs 
FOR UPDATE 
USING (auth.uid() = company_id)
WITH CHECK (auth.uid() = company_id);

-- Add delete policy for jobs table to allow companies to delete their own jobs
DROP POLICY IF EXISTS "Companies can delete own jobs" ON jobs;
CREATE POLICY "Companies can delete own jobs" ON jobs 
FOR DELETE 
USING (auth.uid() = company_id);
