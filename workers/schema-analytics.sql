-- Analytics Tabelle für Login-Tracking
-- Ausführen mit: wrangler d1 execute bjj-auth-db --file=./workers/schema-analytics.sql

-- Tabelle für Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,  -- 'login', 'session_validate'
  user_email TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  date TEXT NOT NULL  -- YYYY-MM-DD für einfache Gruppierung
);

-- Indices für schnelle Queries
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(date);
CREATE INDEX IF NOT EXISTS idx_analytics_email ON analytics_events(user_email);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);

-- Cleanup alte Events (älter als 90 Tage) - kann via Cron Job ausgeführt werden
-- DELETE FROM analytics_events WHERE created_at < datetime('now', '-90 days');
