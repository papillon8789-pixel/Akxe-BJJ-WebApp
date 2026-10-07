-- Migration: Add metadata column to verification_codes table
-- Date: 2026-10-07
-- Purpose: Store user name and registration info temporarily during verification

-- Add metadata column to verification_codes table
ALTER TABLE verification_codes ADD COLUMN metadata TEXT;

-- This column will store JSON data like:
-- {"name": "Max", "isNewUser": true}
