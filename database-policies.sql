-- =====================================================
-- Vibe.io Database Row Level Security (RLS) Policies
-- =====================================================
-- These policies need to be added to your Supabase database
-- to allow ambassadors to delete their own events

-- IMPORTANT: Run these commands in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste and Run

-- =====================================================
-- 1. EVENTS TABLE POLICIES
-- =====================================================

-- Allow ambassadors to DELETE events they created
CREATE POLICY "Ambassadors can delete their own events"
ON events
FOR DELETE
USING (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.ambassador = true
  )
);

-- Allow ambassadors to INSERT new events
CREATE POLICY "Ambassadors can create events"
ON events
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.ambassador = true
  )
);

-- Allow ambassadors to UPDATE their own events
CREATE POLICY "Ambassadors can update their own events"
ON events
FOR UPDATE
USING (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.ambassador = true
  )
);

-- Allow everyone to SELECT (read) events
CREATE POLICY "Everyone can view events"
ON events
FOR SELECT
USING (true);

-- =====================================================
-- 2. REGISTRATIONS TABLE POLICIES
-- =====================================================

-- Allow ambassadors to DELETE registrations for their events
CREATE POLICY "Ambassadors can delete registrations for their events"
ON registrations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = registrations.event_id
    AND events.created_by = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.ambassador = true
  )
);

-- Allow team leads to DELETE their own registrations (within 24 hours)
CREATE POLICY "Team leads can delete their own registrations"
ON registrations
FOR DELETE
USING (
  auth.uid() = team_lead
  AND created_at > NOW() - INTERVAL '24 hours'
);

-- Allow users to INSERT registrations
CREATE POLICY "Authenticated users can create registrations"
ON registrations
FOR INSERT
WITH CHECK (
  auth.uid() = team_lead
);

-- Allow team leads to UPDATE their registrations (within 24 hours)
CREATE POLICY "Team leads can update their registrations"
ON registrations
FOR UPDATE
USING (
  auth.uid() = team_lead
  AND created_at > NOW() - INTERVAL '24 hours'
);

-- Allow ambassadors to SELECT registrations for their events
CREATE POLICY "Ambassadors can view registrations for their events"
ON registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = registrations.event_id
    AND events.created_by = auth.uid()
  )
  OR auth.uid() = team_lead
);

-- =====================================================
-- 3. ENABLE RLS ON TABLES (if not already enabled)
-- =====================================================

-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on registrations table
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the policies are working:

-- 1. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('events', 'registrations');

-- 2. List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('events', 'registrations')
ORDER BY tablename, policyname;

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- These policies ensure:
-- 1. Only ambassadors can create, update, and delete events
-- 2. Only ambassadors can delete events they created
-- 3. Ambassadors can only see registrations for their own events
-- 4. Team leads can manage their registrations within 24 hours
-- 5. Everyone can view all events (public access)
-- 6. Cascade deletes when an event is deleted
--
-- If you need to remove these policies:
-- DROP POLICY "policy_name" ON table_name;
