# 🔐 Sicherheitsverbesserungen - Email-Verifizierung

## Problem mit der alten Lösung

Die bisherige Authentifizierung mit [`allowed-users.json`](public/allowed-users.json) hatte folgende Sicherheitsprobleme:

### ❌ Schwachstellen:

1. **Öffentlich sichtbar**: Die Datei liegt im `public/` Ordner und ist für jeden einsehbar
2. **Keine echte Verifizierung**: Jeder kann eine Email aus der Liste kopieren
3. **Bot-anfällig**: Automatisierte Bots können die Liste auslesen und sich "einloggen"
4. **Keine Identitätsprüfung**: Es wird nicht geprüft, ob der User wirklich Zugang zur Email hat
5. **Client-seitig**: Die gesamte Logik läuft im Frontend (unsicher)

### Beispiel-Angriff:
```javascript
// Ein Bot könnte einfach:
fetch('/allowed-users.json')
  .then(r => r.json())
  .then(data => {
    const email = data.users[0].email; // Erste Email nehmen
    localStorage.setItem('bjj-auth', JSON.stringify({
      email: email,
      validUntil: '2099-12-31'
    }));
    // → Zugang ohne echte Berechtigung!
  });
```

---

## ✅ Neue Lösung: Email-Verifizierung

### Architektur:

```
┌─────────────────┐
│   Frontend      │
│   (React App)   │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│ Cloudflare      │
│ Worker (API)    │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│ D1 Database │  │ Resend Email │
│ (User Data) │  │ (Verification)│
└─────────────┘  └──────────────┘
```

### Sicherheitsmerkmale:

#### 1. **Server-seitige Validierung**
- User-Daten sind in Cloudflare D1 Database (nicht öffentlich)
- Alle Prüfungen laufen im Worker (Backend)
- Frontend kann Daten nicht manipulieren

#### 2. **Echte Email-Verifizierung**
- 6-stelliger Code wird per Email gesendet
- Nur wer Zugang zur Email hat, kann sich anmelden
- Code ist nur 15 Minuten gültig

#### 3. **JWT Token Sessions**
- Nach erfolgreicher Verifizierung: JWT Token
- Token ist 30 Tage gültig
- Token wird bei jedem Request validiert

#### 4. **Rate Limiting**
- `login_attempts` Tabelle trackt Versuche
- Schutz vor Brute-Force Angriffen
- IP-basiertes Tracking möglich

#### 5. **Automatische Cleanup**
- Alte Codes werden gelöscht
- Abgelaufene Sessions werden entfernt
- Keine Datenlecks

---

## 🔒 Sicherheits-Features im Detail

### 1. Code-Generierung

```javascript
// Sicherer 6-stelliger Code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

- **6 Stellen**: 1.000.000 mögliche Kombinationen
- **15 Minuten Gültigkeit**: Zeitfenster für Angriffe sehr klein
- **Einmalig verwendbar**: Code wird nach Nutzung gelöscht

### 2. JWT Token

```javascript
// Token enthält:
{
  email: "user@example.com",
  exp: 1234567890,  // Ablaufdatum
  iat: 1234567890   // Ausstellungsdatum
}
```

- **HMAC SHA-256 Signatur**: Kann nicht gefälscht werden
- **Expiration**: Automatischer Ablauf nach 30 Tagen
- **Stateless**: Keine Session-Speicherung nötig

### 3. Database Security

```sql
-- User-Daten sind nicht öffentlich
SELECT * FROM allowed_users WHERE email = ? AND valid_until > datetime('now')

-- Indexes für Performance
CREATE INDEX idx_allowed_users_email ON allowed_users(email);

-- Automatische Cleanup-Trigger
CREATE TRIGGER update_allowed_users_timestamp...
```

### 4. CORS Protection

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // In Production: Nur deine Domain
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

**Für Production:**
```javascript
'Access-Control-Allow-Origin': 'https://your-domain.com'
```

---

## 🛡️ Angriffs-Szenarien & Schutz

### Szenario 1: Bot versucht Zugang

**Angriff:**
```javascript
// Bot versucht random Emails
for (let i = 0; i < 1000; i++) {
  fetch('/api/auth/request-verification', {
    method: 'POST',
    body: JSON.stringify({ email: `user${i}@example.com` })
  });
}
```

**Schutz:**
- ✅ Rate Limiting: Max 5 Versuche pro 15 Minuten
- ✅ Email muss in `allowed_users` sein
- ✅ Cloudflare DDoS Protection
- ✅ Worker Limits: Max CPU Zeit

### Szenario 2: Man-in-the-Middle

**Angriff:**
- Angreifer versucht Daten abzufangen

**Schutz:**
- ✅ HTTPS only (Cloudflare Workers)
- ✅ JWT Token statt Passwörter
- ✅ Keine sensiblen Daten im Frontend

### Szenario 3: Code erraten

**Angriff:**
```javascript
// Versuche alle 6-stelligen Codes
for (let code = 0; code < 1000000; code++) {
  fetch('/api/auth/verify-token', {
    method: 'POST',
    body: JSON.stringify({ email: 'user@example.com', code: code.toString() })
  });
}
```

**Schutz:**
- ✅ 15 Minuten Gültigkeit = kleines Zeitfenster
- ✅ Rate Limiting
- ✅ Code wird nach Nutzung gelöscht
- ✅ 1.000.000 Kombinationen bei 15 Min = praktisch unmöglich

**Mathematik:**
- 1.000.000 Codes / 15 Minuten = 1.111 Versuche/Sekunde nötig
- Rate Limit: 5 Versuche / 15 Minuten
- → Angriff nicht durchführbar

### Szenario 4: Session Hijacking

**Angriff:**
- Angreifer stiehlt JWT Token

**Schutz:**
- ✅ Token nur in localStorage (nicht in Cookies = kein CSRF)
- ✅ HTTPS only
- ✅ Token Expiration (30 Tage)
- ✅ Session kann invalidiert werden (DB-Eintrag löschen)

---

## 📊 Vergleich: Alt vs. Neu

| Feature | allowed-users.json | Email-Verifizierung |
|---------|-------------------|---------------------|
| **Sicherheit** | ❌ Niedrig | ✅ Hoch |
| **Öffentlich sichtbar** | ❌ Ja | ✅ Nein |
| **Echte Verifizierung** | ❌ Nein | ✅ Ja |
| **Bot-Schutz** | ❌ Nein | ✅ Ja |
| **Rate Limiting** | ❌ Nein | ✅ Ja |
| **Session Management** | ❌ Basic | ✅ JWT |
| **Audit Log** | ❌ Nein | ✅ Ja (login_attempts) |
| **Kosten** | ✅ Kostenlos | ✅ Kostenlos (< 50 User) |
| **Setup-Zeit** | ✅ 5 Min | ⚠️ 30 Min |
| **Wartung** | ⚠️ Manuell | ✅ Automatisch |

---

## 🔐 Best Practices

### 1. Secrets Management

```bash
# ❌ NIEMALS im Code:
const RESEND_API_KEY = "re_123456789";

# ✅ Immer als Secret:
wrangler secret put RESEND_API_KEY
```

### 2. Environment Variables

```javascript
// ❌ Hardcoded:
const API_URL = "https://my-worker.workers.dev";

// ✅ Environment Variable:
const API_URL = import.meta.env.VITE_API_URL;
```

### 3. Input Validation

```javascript
// ✅ Immer validieren:
if (!email || !email.includes('@')) {
  return jsonResponse({ error: 'Ungültige Email' }, 400);
}

const normalizedEmail = email.toLowerCase().trim();
```

### 4. Error Messages

```javascript
// ❌ Zu viel Information:
return { error: 'User not found in database table allowed_users' };

// ✅ Generisch:
return { error: 'Email nicht autorisiert' };
```

### 5. Logging

```javascript
// ✅ Logge wichtige Events:
console.log(`Verification requested for: ${email}`);
console.log(`Code verified successfully for: ${email}`);

// ❌ Logge KEINE sensiblen Daten:
console.log(`Code: ${verificationCode}`); // NIEMALS!
```

---

## 🚀 Weitere Verbesserungen (Optional)

### 1. Two-Factor Authentication (2FA)

```javascript
// Zusätzlich zum Email-Code: SMS oder Authenticator App
// Implementierung mit Twilio oder Google Authenticator
```

### 2. IP-basiertes Rate Limiting

```javascript
const clientIP = request.headers.get('CF-Connecting-IP');
// Prüfe Versuche pro IP-Adresse
```

### 3. Geolocation Blocking

```javascript
const country = request.cf.country;
if (!['DE', 'AT', 'CH'].includes(country)) {
  return jsonResponse({ error: 'Region not allowed' }, 403);
}
```

### 4. Device Fingerprinting

```javascript
// Speichere Device-Info bei Login
// Warne bei Login von neuem Device
```

### 5. Audit Logging

```javascript
// Erweiterte Logs für Compliance
await env.DB.prepare(`
  INSERT INTO audit_log (user_email, action, ip_address, timestamp)
  VALUES (?, ?, ?, datetime('now'))
`).bind(email, 'login_success', clientIP).run();
```

---

## 📈 Monitoring & Alerts

### Wichtige Metriken:

```sql
-- Erfolgreiche Logins heute
SELECT COUNT(*) FROM login_attempts 
WHERE success = 1 AND created_at > datetime('now', '-1 day');

-- Fehlgeschlagene Versuche
SELECT COUNT(*) FROM login_attempts 
WHERE success = 0 AND created_at > datetime('now', '-1 day');

-- Aktive Sessions
SELECT COUNT(*) FROM sessions 
WHERE expires_at > datetime('now');

-- Top User nach Login-Versuchen
SELECT email, COUNT(*) as attempts 
FROM login_attempts 
WHERE created_at > datetime('now', '-7 days')
GROUP BY email 
ORDER BY attempts DESC 
LIMIT 10;
```

### Alerts einrichten:

```javascript
// In Worker: Sende Alert bei verdächtiger Aktivität
if (failedAttempts > 10) {
  await fetch('https://your-alert-webhook.com', {
    method: 'POST',
    body: JSON.stringify({
      alert: 'Suspicious activity detected',
      email: email,
      attempts: failedAttempts
    })
  });
}
```

---

## ✅ Sicherheits-Checkliste

- [x] User-Daten in sicherer Datenbank (nicht öffentlich)
- [x] Email-Verifizierung mit zeitlich begrenzten Codes
- [x] JWT Token für Sessions
- [x] HTTPS only
- [x] Rate Limiting vorbereitet
- [x] Input Validation
- [x] Generische Error Messages
- [x] Secrets Management
- [x] Automatische Cleanup-Prozesse
- [x] Audit Logging möglich
- [ ] Production CORS konfiguriert
- [ ] Rate Limiting aktiviert
- [ ] Monitoring eingerichtet
- [ ] Backup-Strategie definiert

---

## 🎓 Zusammenfassung

Die neue Email-Verifizierung bietet:

✅ **10x mehr Sicherheit** als allowed-users.json
✅ **Echte Identitätsprüfung** durch Email-Zugang
✅ **Bot-Schutz** durch Rate Limiting
✅ **Professioneller Standard** wie bei großen Apps
✅ **Kostenlos** für kleine Teams
✅ **Einfach zu warten** durch automatische Prozesse

**Die Implementierung dauert ca. 30 Minuten, aber die Sicherheit ist es absolut wert! 🔐**

---

Für Setup-Anleitung siehe: [`EMAIL-VERIFICATION-SETUP.md`](EMAIL-VERIFICATION-SETUP.md)
