-- Add project_name and project_description columns to registrations table
-- Run this in Supabase SQL Editor

ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS project_name TEXT,
ADD COLUMN IF NOT EXISTS project_description TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_project_name 
ON registrations(project_name);

COMMENT ON COLUMN registrations.project_name IS 'Name of the project submitted by the team';
COMMENT ON COLUMN registrations.project_description IS 'Brief description of the project (max 80 words)';
