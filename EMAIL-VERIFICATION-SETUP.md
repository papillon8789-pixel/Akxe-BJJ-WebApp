# 🔐 Email-Verifizierung Setup Guide

Diese Anleitung erklärt, wie du die sichere Email-Verifizierung für die PRIMO BJJ App einrichtest.

## 📋 Übersicht

Die neue Email-Verifizierung ersetzt die unsichere `allowed-users.json` Lösung durch:

- ✅ **Echte Email-Verifizierung** - Nur wer Zugang zur Email hat, kann sich anmelden
- ✅ **Cloudflare Workers** - Serverless Backend API
- ✅ **Cloudflare D1 Database** - Sichere User-Datenbank
- ✅ **Resend Email Service** - Professioneller Email-Versand (100 Emails/Tag kostenlos)
- ✅ **JWT Sessions** - Sichere 30-Tage Sessions
- ✅ **6-stellige Codes** - Einfach einzugeben, 15 Minuten gültig

## 🎯 Warum diese Lösung?

### ❌ Problem mit allowed-users.json:
```
1. Datei ist öffentlich im Frontend sichtbar
2. Jeder kann die Email-Liste sehen
3. Bots können einfach eine Email kopieren und sich "einloggen"
4. Keine echte Verifizierung
```

### ✅ Lösung mit Email-Verifizierung:
```
1. User-Daten sind in sicherer Datenbank (nicht öffentlich)
2. Nur wer Zugang zur Email hat, kann sich anmelden
3. 6-stelliger Code wird per Email gesendet
4. Code ist nur 15 Minuten gültig
5. JWT Token für sichere Sessions
```

---

## 🚀 Setup-Schritte

### 1. Cloudflare Account & Wrangler CLI

```bash
# Installiere Wrangler CLI global
npm install -g wrangler

# Login bei Cloudflare
wrangler login

# Navigiere zum Workers-Verzeichnis
cd bjj-app/workers

# Installiere Dependencies
npm install
```

### 2. D1 Database erstellen

```bash
# Erstelle die Datenbank
wrangler d1 create bjj-auth-db

# Output wird sein:
# [[d1_databases]]
# binding = "DB"
# database_name = "bjj-auth-db"
# database_id = "xxxx-xxxx-xxxx-xxxx"

# Kopiere die database_id und füge sie in wrangler.toml ein
```

**Bearbeite `wrangler.toml`:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "bjj-auth-db"
database_id = "DEINE_DATABASE_ID_HIER"  # ← Hier einfügen
```

### 3. Database Schema erstellen

```bash
# Führe das Schema aus
wrangler d1 execute bjj-auth-db --file=./schema.sql

# Verifiziere die Tabellen
wrangler d1 execute bjj-auth-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

**Erwartete Tabellen:**
- `allowed_users` - Autorisierte Benutzer
- `verification_codes` - Temporäre Verifizierungscodes
- `sessions` - Aktive User-Sessions
- `login_attempts` - Rate Limiting & Security

### 4. Resend API Key erstellen

1. Gehe zu [resend.com](https://resend.com)
2. Erstelle einen kostenlosen Account
3. Verifiziere deine Domain (oder nutze Resend's Test-Domain)
4. Erstelle einen API Key unter "API Keys"
5. Kopiere den Key (beginnt mit `re_...`)

```bash
# Speichere den Resend API Key als Secret
wrangler secret put RESEND_API_KEY
# Füge deinen API Key ein wenn gefragt
```

### 5. JWT Secret erstellen

```bash
# Generiere einen sicheren Random String (z.B. mit OpenSSL)
openssl rand -base64 32

# Oder in PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Speichere als Secret
wrangler secret put JWT_SECRET
# Füge den generierten String ein
```

### 6. Worker deployen

```bash
# Test lokal
wrangler dev

# Deploy zu Production
wrangler deploy

# Output zeigt die Worker URL:
# Published bjj-auth-api
# https://bjj-auth-api.your-subdomain.workers.dev
```

### 7. Frontend konfigurieren

**Erstelle `.env` Datei im `bjj-app` Verzeichnis:**

```env
# Cloudflare Worker URL (von Schritt 6)
VITE_API_URL=https://bjj-auth-api.your-subdomain.workers.dev
```

**Oder für Custom Domain:**
```env
VITE_API_URL=https://your-domain.com
```

### 8. Benutzer zur Datenbank hinzufügen

```bash
# Füge einen neuen User hinzu
wrangler d1 execute bjj-auth-db --command="
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes)
VALUES ('user@example.com', '2027-12-31', 12, date('now'), 'Jahres-Mitgliedschaft');
"

# Liste alle User auf
wrangler d1 execute bjj-auth-db --command="SELECT * FROM allowed_users"

# Lösche einen User
wrangler d1 execute bjj-auth-db --command="DELETE FROM allowed_users WHERE email='user@example.com'"

# Update User Gültigkeit
wrangler d1 execute bjj-auth-db --command="
UPDATE allowed_users 
SET valid_until='2028-12-31', paid_months=24 
WHERE email='user@example.com'
"
```

---

## 🔄 Workflow

### User-Perspektive:

1. **Email eingeben** → User gibt seine Email ein
2. **Code erhalten** → 6-stelliger Code wird per Email gesendet
3. **Code eingeben** → User gibt Code in der App ein
4. **Angemeldet** → 30 Tage Session, kein erneutes Login nötig

### Technischer Ablauf:

```
1. Frontend → POST /api/auth/request-verification
   ↓
2. Worker prüft Email in D1 Database
   ↓
3. Worker generiert 6-stelligen Code
   ↓
4. Worker sendet Email via Resend
   ↓
5. User erhält Email mit Code
   ↓
6. Frontend → POST /api/auth/verify-token
   ↓
7. Worker prüft Code in Database
   ↓
8. Worker generiert JWT Token
   ↓
9. Frontend speichert Token
   ↓
10. Bei jedem App-Start: POST /api/auth/validate-session
```

---

## 🛠️ Verwaltung

### User hinzufügen (Bulk Import)

Erstelle eine `users.sql` Datei:

```sql
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes) VALUES
('user1@example.com', '2027-12-31', 12, date('now'), 'Jahres-Abo'),
('user2@example.com', '2027-06-30', 6, date('now'), 'Halbjahres-Abo'),
('user3@example.com', '2027-03-31', 3, date('now'), 'Quartals-Abo');
```

```bash
wrangler d1 execute bjj-auth-db --file=./users.sql
```

### Cleanup alte Daten

```bash
# Lösche alte Verifizierungscodes (älter als 1 Stunde)
wrangler d1 execute bjj-auth-db --command="
DELETE FROM verification_codes WHERE created_at < datetime('now', '-1 hour')
"

# Lösche abgelaufene Sessions
wrangler d1 execute bjj-auth-db --command="
DELETE FROM sessions WHERE expires_at < datetime('now')
"

# Lösche alte Login-Versuche (älter als 24 Stunden)
wrangler d1 execute bjj-auth-db --command="
DELETE FROM login_attempts WHERE created_at < datetime('now', '-24 hours')
"
```

### Monitoring

```bash
# Live Logs anschauen
wrangler tail

# Statistiken
wrangler d1 execute bjj-auth-db --command="
SELECT 
  (SELECT COUNT(*) FROM allowed_users) as total_users,
  (SELECT COUNT(*) FROM allowed_users WHERE valid_until > datetime('now')) as active_users,
  (SELECT COUNT(*) FROM sessions WHERE expires_at > datetime('now')) as active_sessions
"
```

---

## 📧 Email-Konfiguration (Resend)

### Test-Domain (für Development)

Resend bietet eine Test-Domain für Development:
- Von: `onboarding@resend.dev`
- Limit: 100 Emails/Tag
- Keine Domain-Verifizierung nötig

### Custom Domain (für Production)

1. Gehe zu Resend Dashboard → Domains
2. Klicke "Add Domain"
3. Gib deine Domain ein (z.B. `primo-bjj.com`)
4. Füge die DNS Records hinzu:
   - SPF Record
   - DKIM Record
   - DMARC Record (optional)
5. Warte auf Verifizierung (5-30 Minuten)
6. Update `from` in `auth-api.js`:
   ```javascript
   from: 'PRIMO BJJ <noreply@primo-bjj.com>'
   ```

---

## 🔒 Sicherheit

### Best Practices:

✅ **Secrets niemals im Code** - Nutze `wrangler secret`
✅ **HTTPS only** - Cloudflare Workers nutzen automatisch HTTPS
✅ **Rate Limiting** - `login_attempts` Tabelle für Tracking
✅ **Short-lived Codes** - 15 Minuten Gültigkeit
✅ **JWT Expiration** - 30 Tage Sessions
✅ **Database Cleanup** - Regelmäßig alte Daten löschen

### Rate Limiting implementieren (Optional):

```javascript
// In auth-api.js vor requestVerification:
const recentAttempts = await env.DB.prepare(
  'SELECT COUNT(*) as count FROM login_attempts WHERE email = ? AND created_at > datetime("now", "-15 minutes")'
).bind(email).first();

if (recentAttempts.count >= 5) {
  return jsonResponse({ error: 'Zu viele Versuche. Bitte warte 15 Minuten.' }, 429);
}
```

---

## 🧪 Testing

### Lokales Testing:

```bash
# Starte Worker lokal
cd bjj-app/workers
wrangler dev

# In einem anderen Terminal, teste die API:
curl -X POST http://localhost:8787/api/auth/request-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@primo-bjj.com"}'
```

### Frontend Testing:

```bash
cd bjj-app
npm run dev

# Öffne http://localhost:5173
# Teste den Login-Flow
```

---

## 💰 Kosten

### Cloudflare Workers:
- **Free Tier**: 100.000 Requests/Tag
- **Paid**: $5/Monat für 10 Millionen Requests

### Cloudflare D1:
- **Free Tier**: 5 GB Storage, 5 Millionen Reads/Tag
- **Paid**: $5/Monat für 50 GB

### Resend:
- **Free Tier**: 100 Emails/Tag, 3.000/Monat
- **Paid**: $20/Monat für 50.000 Emails

**Für kleine Teams (< 50 User): Komplett kostenlos! 🎉**

---

## 🐛 Troubleshooting

### "Database not found"
```bash
# Prüfe ob DB existiert
wrangler d1 list

# Erstelle DB neu
wrangler d1 create bjj-auth-db
```

### "Resend API Key invalid"
```bash
# Prüfe Secrets
wrangler secret list

# Update Secret
wrangler secret put RESEND_API_KEY
```

### "CORS Error"
- Prüfe ob `corsHeaders` in `auth-api.js` korrekt sind
- Stelle sicher dass `VITE_API_URL` in `.env` korrekt ist

### "Code not received"
- Prüfe Spam-Ordner
- Prüfe Resend Dashboard für Delivery Status
- Prüfe Worker Logs: `wrangler tail`

---

## 🔄 Migration von allowed-users.json

### Schritt 1: Exportiere bestehende User

```javascript
// Script: export-users.js
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/allowed-users.json'));

const sql = data.users.map(u => 
  `INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes) VALUES ('${u.email}', '${u.validUntil}', ${u.paidMonths}, '${u.addedDate}', '${u.notes}');`
).join('\n');

fs.writeFileSync('./workers/migrate-users.sql', sql);
console.log('✅ Migration SQL erstellt: workers/migrate-users.sql');
```

```bash
node export-users.js
```

### Schritt 2: Importiere in D1

```bash
wrangler d1 execute bjj-auth-db --file=./workers/migrate-users.sql
```

### Schritt 3: Lösche allowed-users.json

```bash
# Nach erfolgreicher Migration
rm bjj-app/public/allowed-users.json

# Entferne aus Git
git rm bjj-app/public/allowed-users.json
git commit -m "Remove insecure allowed-users.json, migrated to D1 database"
```

---

## 📚 Weitere Ressourcen

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Resend Docs](https://resend.com/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## ✅ Checkliste

- [ ] Wrangler CLI installiert
- [ ] Cloudflare Account erstellt
- [ ] D1 Database erstellt
- [ ] Schema ausgeführt
- [ ] Resend Account erstellt
- [ ] Resend API Key als Secret gespeichert
- [ ] JWT Secret generiert und gespeichert
- [ ] Worker deployed
- [ ] Frontend `.env` konfiguriert
- [ ] Test-User hinzugefügt
- [ ] Login-Flow getestet
- [ ] Email-Empfang getestet
- [ ] Code-Verifizierung getestet
- [ ] Session-Validierung getestet
- [ ] allowed-users.json gelöscht

---

**🎉 Fertig! Deine App ist jetzt sicher mit echter Email-Verifizierung geschützt!**

Bei Fragen oder Problemen, siehe Troubleshooting-Sektion oder kontaktiere den Support.
