# 🏗️ PRIMO BJJ - Technisches Setup Übersicht

## 📦 **FRONTEND (React App)**
**Wo:** Cloudflare Pages
**URL:** https://primo-bjj.com
**Code:** `bjj-app/src/`
**Was macht es:**
- React Single Page Application (SPA)
- Zeigt BJJ Techniken (Videos, Beschreibungen)
- Login-Screen für User-Authentifizierung
- Admin Dashboard für User-Verwaltung
- PWA (Progressive Web App) - kann als App installiert werden

**Wichtige Dateien:**
- `src/context/AuthContext.jsx` - Login-Logik, Session-Management
- `src/components/AdminDashboard.jsx` - Admin-Interface
- `src/components/LoginScreen.jsx` - Login-UI

---

## ⚙️ **BACKEND (Cloudflare Worker)**
**Wo:** Cloudflare Workers
**URL:** https://bjj-auth-api.papillon8789.workers.dev
**Code:** `bjj-app/workers/auth-api.js`
**Was macht es:**
- Serverless Backend (läuft auf Cloudflare Edge)
- Verarbeitet alle Auth-Requests
- Generiert Verifizierungscodes
- Erstellt JWT Tokens
- Verwaltet User-Status (pending, active, suspended)

**API Endpoints:**
- `POST /api/auth/request-verification` - Code anfordern
- `POST /api/auth/verify-token` - Code verifizieren
- `POST /api/auth/check-status` - Status prüfen (ohne Code)
- `GET /api/auth/magic-login` - Magic Link Login
- `POST /api/auth/validate-session` - Session validieren
- `POST /api/admin/*` - Admin-Funktionen (approve, delete, suspend, etc.)

---

## 🗄️ **DATABASE (Cloudflare D1)**
**Wo:** Cloudflare D1 (SQLite)
**Name:** `bjj-auth-db`
**Schema:** `bjj-app/workers/schema.sql`
**Was speichert es:**

**Tabellen:**
1. **`allowed_users`** - Alle User
   - email, status (pending/active/suspended)
   - valid_until, paid_months
   - is_admin (0/1)

2. **`verification_codes`** - 6-stellige Codes
   - email, code, expires_at (15 Min)

3. **`sessions`** - JWT Tokens
   - email, token, expires_at (60 Tage)

4. **`admin_notifications`** - Admin-Benachrichtigungen
   - type, user_email, message, read

---

## 📧 **EMAIL SERVICE (Resend)**
**Wo:** Resend.com API
**API Key:** In Cloudflare Worker Secrets
**Was macht es:**
- Versendet Verifizierungscodes
- Versendet Magic Link Emails
- Versendet Admin-Benachrichtigungen
- Versendet Approval/Suspension Emails

**Limits:**
- Kostenlos: 100 Emails/Tag
- Paid: 50.000 Emails/Monat ($20)

---

## 🔐 **AUTHENTIFIZIERUNG (JWT)**
**Technologie:** JSON Web Tokens (JWT)
**Algorithmus:** HMAC SHA-256
**Secret:** In Cloudflare Worker Secrets (`JWT_SECRET`)

**Flow:**
1. User gibt Email ein
2. Backend generiert 6-stelligen Code → Email
3. User gibt Code ein
4. Backend erstellt JWT Token (60 Tage gültig)
5. Frontend speichert Token in localStorage
6. Jeder Request sendet Token im `Authorization: Bearer` Header
7. Backend validiert Token bei jedem Request

**Token enthält:**
- email
- exp (Expiration: 60 Tage)
- iat (Issued At)
- status (active/pending/suspended)
- isAdmin (true/false)

---

## 🌐 **DOMAIN & ROUTING**
**Domain:** primo-bjj.com
**DNS:** Cloudflare DNS
**Routing:**
- `primo-bjj.com/*` → Cloudflare Pages (Frontend)
- `bjj-auth-api.papillon8789.workers.dev/*` → Worker (Backend)

**CORS:** Worker erlaubt Requests von allen Origins (`Access-Control-Allow-Origin: *`)

---

## 📁 **CODE REPOSITORY**
**GitHub:** https://github.com/papillon8789-pixel/Akxe-BJJ-WebApp
**Branches:** main
**Deployment:**
- Frontend: Auto-Deploy via Cloudflare Pages (bei Git Push)
- Worker: Manuell via `wrangler deploy`

---

## 🔄 **DEPLOYMENT WORKFLOW**

**Frontend ändern:**
```bash
cd bjj-app
git add -A
git commit -m "message"
git push
# → Cloudflare Pages deployed automatisch
```

**Backend ändern:**
```bash
cd bjj-app/workers
wrangler deploy
# → Worker wird deployed
```

---

## 💰 **KOSTEN (Aktuell: KOSTENLOS)**
- **Cloudflare Pages:** Kostenlos (unbegrenzt)
- **Cloudflare Workers:** Kostenlos (100k Requests/Tag)
- **Cloudflare D1:** Kostenlos (5GB, 5M Reads/Tag)
- **Resend:** Kostenlos (100 Emails/Tag)
- **Domain:** Separat bezahlt

**Skalierung:**
- Bis ~50 aktive User: Komplett kostenlos
- Mehr User: Nur Resend upgraden ($20/Monat)

---

## 🔑 **SECRETS & ENVIRONMENT VARIABLES**

**Cloudflare Worker Secrets (via `wrangler secret put`):**
- `JWT_SECRET` - Secret für JWT Token Signierung
- `RESEND_API_KEY` - API Key für Resend Email Service

**Environment Variables (in `wrangler.toml`):**
- `ENVIRONMENT` - "production" / "development" / "staging"
- `FRONTEND_URL` - "https://primo-bjj.com"

**Frontend Environment Variables (`.env`):**
- `VITE_API_URL` - URL zum Worker Backend

---

## 📊 **DATENFLUSS**

### **User Registration:**
```
User → Frontend → Worker → D1 (User erstellen, status: pending)
                         → Resend (Code Email)
                         → Resend (Admin Notification)
```

### **Admin Approval:**
```
Admin → Frontend → Worker → D1 (User status: active)
                          → Resend (Magic Link Email)
```

### **Magic Link Login:**
```
User klickt Link → Frontend (erkennt ?magic=TOKEN)
                → Worker (validiert Token)
                → D1 (erstellt Session)
                → Frontend (speichert JWT, logged in)
```

### **Regular Login (nach 60 Tagen):**
```
User → Frontend → Worker → D1 (Code generieren)
                         → Resend (Code Email)
User gibt Code ein → Worker → D1 (Code validieren, Session erstellen)
                            → Frontend (JWT speichern)
```

---

## 🛠️ **ADMIN FUNKTIONEN**

**User Management:**
- ✅ Approve pending users (mit Zeitraum: 1M, 3M, 6M, 12M, Custom)
- ✅ Reject pending users
- ✅ Extend access für active users
- ✅ Suspend active users
- ✅ Reactivate suspended users
- ✅ Delete users permanently (mit doppelter Bestätigung)

**Notifications:**
- Neue Registrierungen
- User approved/rejected
- User suspended/reactivated
- Access extended

---

## 📱 **PWA FEATURES**

**Installierbar als App:**
- iOS: "Add to Home Screen"
- Android: "Add to Home Screen"
- Desktop: Browser-Prompt

**Offline-Fähigkeit:**
- Service Worker cached statische Assets
- Videos werden nicht gecached (zu groß)

**Manifest:**
- `public/manifest.json`
- Icons: `public/images/icon-*.png`

---

## 🔒 **SICHERHEIT**

**Implementierte Maßnahmen:**
- ✅ JWT Token mit 60 Tage Expiration
- ✅ Email-Verifizierung (nur wer Email-Zugang hat)
- ✅ 6-stellige Codes (15 Min gültig)
- ✅ Server-seitige Validierung
- ✅ HTTPS only (Cloudflare)
- ✅ CORS konfiguriert
- ✅ Admin-User können nicht gelöscht/suspended werden
- ✅ Doppelte Bestätigung für User-Löschung

**Geplante Verbesserungen:**
- Rate Limiting (Tabelle bereits vorhanden)
- IP-basiertes Tracking
- Audit Logging
- Two-Factor Authentication
- Device Fingerprinting
