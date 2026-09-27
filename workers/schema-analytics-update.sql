-- Add metadata column to analytics_events table
-- This allows storing additional information like video IDs, category names, etc.

ALTER TABLE analytics_events ADD COLUMN metadata TEXT;
