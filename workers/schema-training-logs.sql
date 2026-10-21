-- D1 Database Schema für Training Analytics / Mat Log
-- Erstelle diese Tabelle mit: wrangler d1 execute bjj-auth-db --file=./workers/schema-training-logs.sql

-- Tabelle für Training Log Einträge
CREATE TABLE IF NOT EXISTS training_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  date TEXT NOT NULL,
  weekday TEXT NOT NULL,
  session_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  gi_type TEXT NOT NULL CHECK(gi_type IN ('Gi', 'NoGi')),
  calories_burned INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indizes für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_training_logs_user_email ON training_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_training_logs_date ON training_logs(date);
CREATE INDEX IF NOT EXISTS idx_training_logs_user_date ON training_logs(user_email, date);

-- Trigger für updated_at
CREATE TRIGGER IF NOT EXISTS update_training_logs_timestamp 
AFTER UPDATE ON training_logs
BEGIN
  UPDATE training_logs SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Cleanup alte Logs (optional - älter als 2 Jahre)
-- DELETE FROM training_logs WHERE date < date('now', '-2 years');
