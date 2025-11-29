-- Add registration window and result date columns to events table
-- Run this in Supabase SQL Editor

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS registration_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS registration_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS result_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance on date columns
CREATE INDEX IF NOT EXISTS idx_events_registration_start 
ON events(registration_start);

CREATE INDEX IF NOT EXISTS idx_events_registration_end 
ON events(registration_end);

CREATE INDEX IF NOT EXISTS idx_events_result_date 
ON events(result_date);

-- Add comments for documentation
COMMENT ON COLUMN events.registration_start IS 'When registration opens for the event';
COMMENT ON COLUMN events.registration_end IS 'When registration closes for the event';
COMMENT ON COLUMN events.result_date IS 'When event results will be published';
