# 👥 User Management Guide

## Neue User hinzufügen

### Verschiedene Abo-Modelle:

#### 1️⃣ 3-Monats-Abo
```bash
wrangler d1 execute bjj-auth-db --remote --command="
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes)
VALUES ('user@example.com', date('now', '+3 months'), 3, date('now'), '3-Monats-Abo');
"
```

#### 2️⃣ 6-Monats-Abo
```bash
wrangler d1 execute bjj-auth-db --remote --command="
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes)
VALUES ('user@example.com', date('now', '+6 months'), 6, date('now'), '6-Monats-Abo');
"
```

#### 3️⃣ Jahres-Abo
```bash
wrangler d1 execute bjj-auth-db --remote --command="
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes)
VALUES ('user@example.com', date('now', '+12 months'), 12, date('now'), 'Jahres-Abo');
"
```

#### 4️⃣ Lebenslanger Zugang
```bash
wrangler d1 execute bjj-auth-db --remote --command="
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes)
VALUES ('trainer@example.com', '2099-12-31', 999, date('now'), 'Trainer - Lebenslang');
"
```

#### 5️⃣ Testphase (1 Monat)
```bash
wrangler d1 execute bjj-auth-db --remote --command="
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes)
VALUES ('test@example.com', date('now', '+1 month'), 1, date('now'), 'Testphase');
"
```

#### 6️⃣ Spezifisches Datum
```bash
wrangler d1 execute bjj-auth-db --remote --command="
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes)
VALUES ('user@example.com', '2027-06-30', 6, date('now'), 'Bis Ende Juni 2027');
"
```

---

## 📧 Email-Versand an andere Adressen

### ⚠️ Aktuelles Problem:
Mit dem **kostenlosen Resend Account** kannst du nur Emails an **deine eigene registrierte Email** (`papillon8789@gmail.com`) senden.

### ✅ Lösung: Domain verifizieren

Um Emails an **alle User** zu senden, musst du eine Domain verifizieren:

#### Schritt 1: Domain bei Resend hinzufügen
1. Gehe zu [resend.com/domains](https://resend.com/domains)
2. Klicke "Add Domain"
3. Gib deine Domain ein (z.B. `primo-bjj.com`)

#### Schritt 2: DNS Records hinzufügen
Resend gibt dir 3 DNS Records:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM Record:**
```
Type: TXT
Name: resend._domainkey
Value: [wird von Resend bereitgestellt]
```

**DMARC Record (optional):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none
```

#### Schritt 3: Worker aktualisieren
Nach Domain-Verifizierung, ändere die `from` Adresse im Worker:

```javascript
// In workers/auth-api.js, Zeile ~145
from: 'PRIMO BJJ <noreply@primo-bjj.com>',  // Statt onboarding@resend.dev
```

Dann neu deployen:
```bash
cd bjj-app/workers
wrangler deploy
```

---

## 🔍 User verwalten

### Alle User anzeigen
```bash
wrangler d1 execute bjj-auth-db --remote --command="
SELECT email, valid_until, paid_months, notes FROM allowed_users ORDER BY added_date DESC;
"
```

### User suchen
```bash
wrangler d1 execute bjj-auth-db --remote --command="
SELECT * FROM allowed_users WHERE email='user@example.com';
"
```

### Abo verlängern
```bash
wrangler d1 execute bjj-auth-db --remote --command="
UPDATE allowed_users 
SET valid_until = date('now', '+12 months'), 
    paid_months = paid_months + 12,
    notes = 'Abo verlängert um 12 Monate'
WHERE email='user@example.com';
"
```

### User löschen
```bash
wrangler d1 execute bjj-auth-db --remote --command="
DELETE FROM allowed_users WHERE email='user@example.com';
"
```

### Abgelaufene User finden
```bash
wrangler d1 execute bjj-auth-db --remote --command="
SELECT email, valid_until, notes 
FROM allowed_users 
WHERE valid_until < date('now')
ORDER BY valid_until DESC;
"
```

### Aktive User zählen
```bash
wrangler d1 execute bjj-auth-db --remote --command="
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN valid_until > date('now') THEN 1 ELSE 0 END) as active_users,
  SUM(CASE WHEN valid_until < date('now') THEN 1 ELSE 0 END) as expired_users
FROM allowed_users;
"
```

---

## 📊 Bulk Import (Mehrere User auf einmal)

Erstelle eine `new-users.sql` Datei:

```sql
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes) VALUES
('user1@example.com', date('now', '+12 months'), 12, date('now'), 'Jahres-Abo'),
('user2@example.com', date('now', '+6 months'), 6, date('now'), '6-Monats-Abo'),
('user3@example.com', date('now', '+3 months'), 3, date('now'), '3-Monats-Abo'),
('trainer@example.com', '2099-12-31', 999, date('now'), 'Trainer - Lebenslang');
```

Dann importieren:
```bash
wrangler d1 execute bjj-auth-db --remote --file=./new-users.sql
```

---

## 🔔 Automatische Erinnerungen (Optional)

### User die bald ablaufen (nächste 7 Tage)
```bash
wrangler d1 execute bjj-auth-db --remote --command="
SELECT email, valid_until, 
       julianday(valid_until) - julianday('now') as days_remaining
FROM allowed_users 
WHERE valid_until BETWEEN date('now') AND date('now', '+7 days')
ORDER BY valid_until;
"
```

---

## 💡 Workflow für neuen Gym-Kollegen

### Beispiel: Max möchte 3 Monate Zugang

**1. User hinzufügen:**
```bash
cd bjj-app/workers
wrangler d1 execute bjj-auth-db --remote --command="
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes)
VALUES ('max@example.com', date('now', '+3 months'), 3, date('now'), 'Max - 3-Monats-Abo');
"
```

**2. Max informieren:**
"Hey Max, du kannst dich jetzt anmelden:
1. Gehe zu https://your-app.com
2. Gib deine Email ein: max@example.com
3. Du bekommst einen Code per Email
4. Gib den Code ein
5. Fertig! 🎉"

**3. Max meldet sich an:**
- Max gibt seine Email ein
- **WICHTIG:** Email wird nur gesendet wenn Domain verifiziert ist!
- Sonst nur an `papillon8789@gmail.com`

---

## 🎯 Zusammenfassung

### ✅ Was funktioniert jetzt:
- Unterschiedliche Abo-Längen (3, 6, 12 Monate, lebenslang)
- Automatische Ablauf-Prüfung
- User-Verwaltung via CLI

### ⚠️ Was noch fehlt:
- **Domain-Verifizierung** bei Resend für Email-Versand an alle User
- Ohne Domain: Nur Emails an `papillon8789@gmail.com`

### 🚀 Nächster Schritt:
Domain bei Resend verifizieren, dann funktioniert Email-Versand an alle!
