-- Migration: Add user status and admin notification system
-- Date: 2026-09-26

-- Add status column to allowed_users table
ALTER TABLE allowed_users ADD COLUMN status TEXT DEFAULT 'active' CHECK(status IN ('pending', 'active', 'suspended'));

-- Update existing users to 'active' status
UPDATE allowed_users SET status = 'active' WHERE status IS NULL;

-- Add admin_email column to store who approved the user
ALTER TABLE allowed_users ADD COLUMN approved_by TEXT;
ALTER TABLE allowed_users ADD COLUMN approved_at DATETIME;

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_allowed_users_status ON allowed_users(status);

-- Create admin_notifications table for tracking pending registrations
CREATE TABLE IF NOT EXISTS admin_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('new_registration', 'user_approved', 'user_rejected')),
  user_email TEXT NOT NULL,
  message TEXT,
  read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read, created_at);
