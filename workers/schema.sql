-- D1 Database Schema für Email-Verifizierung
-- Erstelle diese Tabellen mit: wrangler d1 execute bjj-auth-db --file=./workers/schema.sql

-- Tabelle für erlaubte Benutzer (ersetzt allowed-users.json)
CREATE TABLE IF NOT EXISTS allowed_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  valid_until TEXT NOT NULL,
  paid_months INTEGER DEFAULT 0,
  added_date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Index für schnelle Email-Suche
CREATE INDEX IF NOT EXISTS idx_allowed_users_email ON allowed_users(email);
CREATE INDEX IF NOT EXISTS idx_allowed_users_valid_until ON allowed_users(valid_until);

-- Tabelle für Verifizierungscodes
CREATE TABLE IF NOT EXISTS verification_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  used INTEGER DEFAULT 0
);

-- Index für schnelle Code-Suche
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);

-- Tabelle für aktive Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  last_activity TEXT DEFAULT (datetime('now'))
);

-- Index für schnelle Session-Suche
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Tabelle für Login-Versuche (Rate Limiting & Security)
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  ip_address TEXT,
  success INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Index für Rate Limiting
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON login_attempts(created_at);

-- Initiale Daten: Admin User (aus allowed-users.json)
INSERT OR IGNORE INTO allowed_users (email, valid_until, paid_months, added_date, notes)
VALUES ('admin@primo-bjj.com', '2099-12-31', 999, '2026-09-11', 'Admin - Lebenslanger Zugang');

-- Trigger für updated_at
CREATE TRIGGER IF NOT EXISTS update_allowed_users_timestamp 
AFTER UPDATE ON allowed_users
BEGIN
  UPDATE allowed_users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Cleanup alte Verifizierungscodes (älter als 1 Stunde)
-- Dieser Query sollte regelmäßig via Cron Job ausgeführt werden
-- DELETE FROM verification_codes WHERE created_at < datetime('now', '-1 hour');

-- Cleanup abgelaufene Sessions
-- DELETE FROM sessions WHERE expires_at < datetime('now');

-- Cleanup alte Login-Versuche (älter als 24 Stunden)
-- DELETE FROM login_attempts WHERE created_at < datetime('now', '-24 hours');
