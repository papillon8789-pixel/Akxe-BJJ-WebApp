# ⚡ Quick Start - Email-Verifizierung

**Schnellanleitung zur Aktivierung der sicheren Email-Verifizierung**

---

## 🎯 Was wurde implementiert?

Die unsichere [`allowed-users.json`](public/allowed-users.json) wurde durch eine professionelle Email-Verifizierung ersetzt:

### ❌ Vorher (allowed-users.json):
- Datei öffentlich sichtbar
- Jeder kann Email-Liste sehen
- Bots können sich einfach "einloggen"
- Keine echte Verifizierung

### ✅ Jetzt (Email-Verifizierung):
- User-Daten in sicherer Datenbank
- 6-stelliger Code per Email
- Nur wer Zugang zur Email hat, kann sich anmelden
- JWT Sessions (30 Tage)
- **10x sicherer!**

---

## 🚀 Setup in 5 Schritten (ca. 30 Minuten)

### 1️⃣ Wrangler CLI installieren

```bash
npm install -g wrangler
wrangler login
```

### 2️⃣ D1 Database erstellen

```bash
cd bjj-app/workers
npm install
wrangler d1 create bjj-auth-db
```

Kopiere die `database_id` aus dem Output und füge sie in [`wrangler.toml`](workers/wrangler.toml) ein.

### 3️⃣ Database Schema ausführen

```bash
wrangler d1 execute bjj-auth-db --file=./schema.sql
```

### 4️⃣ Resend API Key & JWT Secret

```bash
# Erstelle Account auf resend.com und hole API Key
wrangler secret put RESEND_API_KEY

# Generiere JWT Secret
wrangler secret put JWT_SECRET
# (Nutze: openssl rand -base64 32)
```

### 5️⃣ Worker deployen & Frontend konfigurieren

```bash
# Worker deployen
wrangler deploy

# Kopiere die Worker URL aus dem Output
# Erstelle .env im bjj-app Verzeichnis:
echo "VITE_API_URL=https://bjj-auth-api.your-subdomain.workers.dev" > ../.env
```

---

## 📝 User hinzufügen

```bash
# Einzelner User
wrangler d1 execute bjj-auth-db --command="
INSERT INTO allowed_users (email, valid_until, paid_months, added_date, notes)
VALUES ('user@example.com', '2027-12-31', 12, date('now'), 'Jahres-Abo');
"

# Alle User auflisten
wrangler d1 execute bjj-auth-db --command="SELECT * FROM allowed_users"
```

---

## ✅ Testen

```bash
# Frontend starten
cd bjj-app
npm run dev

# Öffne http://localhost:5173
# Teste Login mit deiner Email
# Prüfe Email-Postfach für Code
```

---

## 📚 Vollständige Dokumentation

- **Setup-Anleitung**: [`EMAIL-VERIFICATION-SETUP.md`](EMAIL-VERIFICATION-SETUP.md)
- **Sicherheitsanalyse**: [`SECURITY-IMPROVEMENTS.md`](SECURITY-IMPROVEMENTS.md)
- **Worker Docs**: [`workers/README.md`](workers/README.md)
- **Changelog**: [`Changelog.md`](Changelog.md)

---

## 🆘 Hilfe benötigt?

### Häufige Probleme:

**"Database not found"**
```bash
wrangler d1 list  # Prüfe ob DB existiert
```

**"Resend API Key invalid"**
```bash
wrangler secret list  # Prüfe Secrets
```

**"Code nicht erhalten"**
- Prüfe Spam-Ordner
- Prüfe Resend Dashboard
- Prüfe Worker Logs: `wrangler tail`

---

## 💰 Kosten

**Für kleine Teams (< 50 User): Komplett kostenlos! 🎉**

- Cloudflare Workers: 100.000 Requests/Tag (Free)
- Cloudflare D1: 5 GB Storage (Free)
- Resend: 100 Emails/Tag (Free)

---

## 🎓 Wie funktioniert es?

```
1. User gibt Email ein
   ↓
2. Worker prüft Email in D1 Database
   ↓
3. Worker sendet 6-stelligen Code per Email
   ↓
4. User gibt Code ein
   ↓
5. Worker validiert Code
   ↓
6. Worker gibt JWT Token zurück
   ↓
7. User ist 30 Tage angemeldet
```

---

**Los geht's! 🚀**

Folge den 5 Schritten oben und deine App ist in 30 Minuten sicher geschützt!
