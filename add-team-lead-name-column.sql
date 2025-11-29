-- Add team_lead_name column to registrations table
-- This column stores the name of the team lead (first member)
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies that depend on team_lead column
DROP POLICY IF EXISTS "Team lead can update project link" ON registrations;
DROP POLICY IF EXISTS "Team leads can delete their own registrations" ON registrations;
DROP POLICY IF EXISTS "Authenticated users can create registrations" ON registrations;
DROP POLICY IF EXISTS "Team leads can update their registrations" ON registrations;
DROP POLICY IF EXISTS "Ambassadors can view registrations for their events" ON registrations;

-- Drop foreign key constraint on team_lead
ALTER TABLE registrations 
DROP CONSTRAINT IF EXISTS registrations_team_lead_fkey;

-- First, change team_lead column from UUID to TEXT to store emails
ALTER TABLE registrations 
ALTER COLUMN team_lead TYPE TEXT USING team_lead::TEXT;

-- Add team_lead_name column
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS team_lead_name TEXT;

-- Recreate the policy for team lead to update project link
CREATE POLICY "Team lead can update project link"
ON registrations
FOR UPDATE
USING (team_lead = current_setting('request.jwt.claims', true)::json->>'email');

-- Recreate the policy for team lead to delete registration
CREATE POLICY "Team leads can delete their own registrations"
ON registrations
FOR DELETE
USING (team_lead = current_setting('request.jwt.claims', true)::json->>'email');

-- Recreate the policy for authenticated users to create registrations
CREATE POLICY "Authenticated users can create registrations"
ON registrations
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Recreate the policy for team leads to update their registrations
CREATE POLICY "Team leads can update their registrations"
ON registrations
FOR UPDATE
USING (team_lead = current_setting('request.jwt.claims', true)::json->>'email');

-- Recreate the policy for ambassadors to view registrations for their events
CREATE POLICY "Ambassadors can view registrations for their events"
ON registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = registrations.event_id
    AND events.created_by = auth.uid()
  )
);

-- Update existing records to extract name from team_lead email
UPDATE registrations 
SET team_lead_name = SPLIT_PART(team_lead, '@', 1)
WHERE team_lead_name IS NULL AND team_lead IS NOT NULL;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_team_lead_name 
ON registrations(team_lead_name);
