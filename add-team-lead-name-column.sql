-- Add team_lead_name column to registrations table
-- This column stores the name of the team lead (first member)
-- Run this in Supabase SQL Editor

ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS team_lead_name TEXT;

-- Update existing records to extract name from team_lead email
UPDATE registrations 
SET team_lead_name = SPLIT_PART(team_lead, '@', 1)
WHERE team_lead_name IS NULL AND team_lead IS NOT NULL;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_team_lead_name 
ON registrations(team_lead_name);
