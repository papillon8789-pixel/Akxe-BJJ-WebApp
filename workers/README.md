# 🔐 BJJ Auth API - Cloudflare Worker

Serverless Authentication API für die PRIMO BJJ App mit Email-Verifizierung.

## 📁 Struktur

```
workers/
├── auth-api.js          # Hauptlogik des Workers
├── schema.sql           # D1 Database Schema
├── wrangler.toml        # Cloudflare Worker Konfiguration
├── package.json         # Dependencies
├── .gitignore          # Git Ignore
└── README.md           # Diese Datei
```

## 🚀 Quick Start

```bash
# 1. Dependencies installieren
npm install

# 2. Bei Cloudflare anmelden
wrangler login

# 3. D1 Database erstellen
wrangler d1 create bjj-auth-db

# 4. Database ID in wrangler.toml eintragen
# (Kopiere die ID aus dem Output von Schritt 3)

# 5. Schema ausführen
wrangler d1 execute bjj-auth-db --file=./schema.sql

# 6. Secrets setzen
wrangler secret put RESEND_API_KEY
wrangler secret put JWT_SECRET

# 7. Lokal testen
wrangler dev

# 8. Deployen
wrangler deploy
```

## 🔌 API Endpoints

### POST `/api/auth/request-verification`

Fordert einen Verifizierungscode an.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verifizierungscode wurde an deine Email gesendet.",
  "expiresIn": 900
}
```

**Response (Error):**
```json
{
  "error": "Email nicht autorisiert. Bitte kontaktiere deinen Professor."
}
```

---

### POST `/api/auth/verify-token`

Verifiziert den Code und gibt JWT Token zurück.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "validUntil": "2027-12-31",
    "paidMonths": 12
  }
}
```

**Response (Error):**
```json
{
  "error": "Ungültiger oder abgelaufener Code. Bitte fordere einen neuen an."
}
```

---

### POST `/api/auth/validate-session`

Validiert einen JWT Token.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success):**
```json
{
  "valid": true,
  "user": {
    "email": "user@example.com",
    "validUntil": "2027-12-31",
    "paidMonths": 12
  }
}
```

**Response (Error):**
```json
{
  "error": "Ungültiger Token"
}
```

## 🗄️ Database Schema

### Tabellen:

- **allowed_users** - Autorisierte Benutzer
- **verification_codes** - Temporäre Verifizierungscodes
- **sessions** - Aktive User-Sessions
- **login_attempts** - Login-Versuche für Rate Limiting

Siehe [`schema.sql`](schema.sql) für Details.

## 🔧 Konfiguration

### Environment Variables (wrangler.toml)

```toml
[vars]
ENVIRONMENT = "production"
```

### Secrets (via CLI)

```bash
# Resend API Key
wrangler secret put RESEND_API_KEY

# JWT Secret (generiere mit: openssl rand -base64 32)
wrangler secret put JWT_SECRET
```

## 📊 Verwaltung

### User hinzufügen

```bash
wrangler d1 execute bjj-auth-db --command="
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes)
VALUES ('user@example.com', '2027-12-31', 12, date('now'), 'Jahres-Abo');
"
```

### User auflisten

```bash
wrangler d1 execute bjj-auth-db --command="SELECT * FROM allowed_users"
```

### User löschen

```bash
wrangler d1 execute bjj-auth-db --command="DELETE FROM allowed_users WHERE email='user@example.com'"
```

### Cleanup

```bash
# Alte Codes löschen
wrangler d1 execute bjj-auth-db --command="DELETE FROM verification_codes WHERE created_at < datetime('now', '-1 hour')"

# Abgelaufene Sessions löschen
wrangler d1 execute bjj-auth-db --command="DELETE FROM sessions WHERE expires_at < datetime('now')"
```

## 🐛 Debugging

### Logs anschauen

```bash
wrangler tail
```

### Lokal testen

```bash
# Worker starten
wrangler dev

# In anderem Terminal:
curl -X POST http://localhost:8787/api/auth/request-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@primo-bjj.com"}'
```

## 📚 Weitere Infos

- Setup-Anleitung: [`../EMAIL-VERIFICATION-SETUP.md`](../EMAIL-VERIFICATION-SETUP.md)
- Sicherheit: [`../SECURITY-IMPROVEMENTS.md`](../SECURITY-IMPROVEMENTS.md)
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Resend: https://resend.com/docs
