-- Migration: Add is_admin column
-- Date: 2026-09-26

-- Add is_admin column to allowed_users table
ALTER TABLE allowed_users ADD COLUMN is_admin INTEGER DEFAULT 0;

-- Set your email as admin
UPDATE allowed_users SET is_admin = 1 WHERE email = 'papillon8789@gmail.com';
