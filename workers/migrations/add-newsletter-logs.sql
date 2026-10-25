-- Migration: Add newsletter_logs table
-- Run with: wrangler d1 execute bjj-auth-db --file=./workers/migrations/add-newsletter-logs.sql

-- Tabelle für Newsletter Logs
CREATE TABLE IF NOT EXISTS newsletter_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sent_by TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipient_count INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Index für Newsletter Logs
CREATE INDEX IF NOT EXISTS idx_newsletter_logs_created ON newsletter_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_logs_sent_by ON newsletter_logs(sent_by);
