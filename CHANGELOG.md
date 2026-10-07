# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

---

## [2026-10-07] - Optionales Namensfeld bei Registrierung 👤

### Hinzugefügt
- **Namensfeld im Registrierungsformular**:
  - Optionales Feld "Your Name" im Login-Screen
  - Erscheint oberhalb des Email-Feldes
  - Placeholder: "First name"
  - Hilft Admin bei der Identifikation neuer Registrierungen

### Geändert
- **Admin-Benachrichtigungs-Email erweitert**:
  - Zeigt jetzt den Namen des Users an (falls angegeben)
  - Format: "**Name:** [Name]" über der Email-Adresse
  - Erleichtert die Zuordnung von Email-Adressen zu Personen
  
- **API Endpoint `/api/auth/request-verification`**:
  - Akzeptiert jetzt optionalen `name` Parameter
  - Name wird **nicht in der Datenbank gespeichert**
  - Dient nur zur besseren Identifikation in Admin-Emails

### Technische Details
- Datei: [`src/components/LoginScreen.jsx`](src/components/LoginScreen.jsx) - Namensfeld hinzugefügt
- Datei: [`src/context/AuthContext.jsx`](src/context/AuthContext.jsx) - `requestVerification()` mit `name` Parameter erweitert
- Datei: [`workers/auth-api.js`](workers/auth-api.js) - Admin-Email zeigt Namen an
- Abwärtskompatibel - funktioniert auch ohne Namenseingabe

### User Experience
**Vorher:**
- Admin erhält Email nur mit: `Email: max@example.com`
- Schwierig zu erkennen, wer sich registriert hat

**Jetzt:**
- Admin erhält Email mit: `Name: Max` + `Email: max@example.com`
- Sofortige Zuordnung möglich

---

## [2026-09-28] - Deep Half Guard Techniken hinzugefügt 🥋

### Hinzugefügt
- **Deep Half Guard Kategorie** - Neue Guard-Unterkategorie mit 6 Techniken:
  - Deep Half - Technique 1 (ID 1)
  - Deep Half - Technique 2 (ID 2)
  - Deep Half - Technique 3 (ID 3)
  - Deep Half - Technique 4 (ID 4)
  - Deep Half - Technique 5 (ID 5)
  - Deep Half - Technique 6 (ID 6) - Nachträglich hinzugefügt
  - Videos: `DeepHalf_Technique_1.mp4` bis `DeepHalf_Technique_6.mp4`
  - Alle Videos im Cloudflare R2 Bucket verfügbar
  - Tags: "Deep Half", "Guard"

### Geändert
- **Alle Techniken neu nummeriert**:
  - Deep Half Techniken: IDs 1-6 (ganz oben!)
  - Alle anderen Techniken: IDs 7-78 (neu nummeriert)
  - Datei: [`src/data/mockTechniques.js`](src/data/mockTechniques.js)
  
- **subCategories Array erweitert**:
  - "Deep Half" zu guard-Unterkategorien hinzugefügt
  - Neue Reihenfolge: Z Guard, 50/50 Guard, Octopus Guard, Half-lasso Guard, Spider Lasso, Deep Half

### Technische Details
- Datei: [`src/data/mockTechniques.js`](src/data/mockTechniques.js) - 6 neue Techniken hinzugefügt
- **Gesamt: 78 Techniken** in der Datenbank (vorher 72)
- Alle Videos verwenden R2_BASE_URL: `https://pub-333effaca17f49c9b80b42fa7b22c347.r2.dev`
- dateAdded: "2026-09-28"
- Deep Half Techniken erscheinen automatisch ganz oben mit "NEW!" Badge

---

## [2026-09-27] - Upcoming Events Feature 🎉

### Hinzugefügt
- **Upcoming Events Section** unterhalb des Training Schedules:
  - Zeigt bis zu 3 kommende Events an
  - Automatisches Filtern von vergangenen Events
  - Sortierung nach Datum (nächstes Event zuerst)
  - **Calendar Icon Design** mit Datum-Highlighting:
    - Großes Kalender-Icon zeigt Tag und Monat
    - Farbcodierung für verschiedene Event-Typen (rot, gold, blau, grün, lila)
  - **Event Cards** mit Gradient-Design:
    - Event-Icon (z.B. 🎄 für Xmas Party)
    - Event-Titel und Beschreibung
    - Datum und Uhrzeit
    - Hover-Effekte und Animationen
  - **Mobile-Responsive Design**:
    - Optimierte Darstellung auf allen Bildschirmgrößen
    - Flexible Layouts mit Tailwind Breakpoints
  - **GitHub-Bearbeitung möglich**:
    - Events in JSON-Datei ausgelagert: [`public/data/events.json`](public/data/events.json)
    - Direkte Bearbeitung auf GitHub wie beim Banner
    - Automatisches Deployment nach Änderungen
  - Neue Komponente: [`src/components/UpcomingEvents.jsx`](src/components/UpcomingEvents.jsx)
  - Integration in [`src/App.jsx`](src/App.jsx) unterhalb des Training Schedules
  - Dokumentation: [`EVENTS-GITHUB-ANLEITUNG.md`](EVENTS-GITHUB-ANLEITUNG.md)

### Technische Details
- Events werden aus JSON-Datei geladen (fetch API)
- Automatisches Ausblenden wenn keine Events vorhanden
- 5 Farbvarianten für Event-Kategorisierung
- Datum-Formatierung mit JavaScript Intl API
- Loading-State während Daten geladen werden

### Beispiel Event
```json
{
  "id": 1,
  "title": "Xmas Party",
  "date": "2024-12-12",
  "time": "19:30",
  "description": "Xmas OpenMat + Dinner/Drinks",
  "icon": "🎄",
  "color": "red"
}
```

### Verwaltung
- **Einfach**: Bearbeite [`public/data/events.json`](public/data/events.json) direkt auf GitHub
- **Anleitung**: Siehe [`EVENTS-GITHUB-ANLEITUNG.md`](EVENTS-GITHUB-ANLEITUNG.md)
- **Technisch**: Siehe [`EVENTS-MANAGEMENT.md`](EVENTS-MANAGEMENT.md)

---

## [2026-09-27] - Analytics Dashboard & Magic Link Login ✨

### Hinzugefügt
- **Erweitertes Analytics Dashboard** im Admin-Bereich:
  - **Echtes Activity-Tracking** statt nur Login-Tracking:
    - `app_open` - Wird getrackt wenn User die App öffnet (einmal pro Tag)
    - `video_view` - Wird getrackt wenn User ein Video anschaut (mit Metadaten)
    - `category_view` - Wird getrackt wenn User eine Kategorie öffnet
    - `login` - Login-Events (beibehalten)
  - **Neue Metriken**:
    - Active Users Today - User die App heute geöffnet haben (nicht nur Logins!)
    - Active Users This Week - User die App diese Woche genutzt haben
    - Video Views Today - Anzahl angeschauter Videos heute
    - Total Users - Gesamtanzahl aktiver User
  - **Daily Active Users Chart** - Zeigt echte App-Nutzung der letzten 7 Tage
  - **Analytics Helper** ([`src/utils/analytics.js`](src/utils/analytics.js)) - Zentrale Tracking-Funktionen
  - **Metadata-Unterstützung** - Speichert Video-IDs, Namen, Kategorien für detaillierte Analysen
  - Neue D1 Tabelle: `analytics_events` mit `metadata` Spalte
  - Neue API Endpoints:
    - `POST /api/analytics/track` - Event-Tracking mit Validierung und Duplikat-Prävention
    - `GET /api/admin/analytics` - Analytics-Daten mit erweiterten Metriken
  - Mobile-responsive Design mit Gradient-Karten
  - Refresh-Button für manuelle Aktualisierung

- **Delete User Funktion** im Admin Dashboard:
  - Permanentes Löschen von Usern aus der Datenbank
  - Doppelte Bestätigung erforderlich (Confirm + "DELETE" tippen)
  - Löscht alle User-Daten: Sessions, Verification Codes, User-Eintrag
  - Admin-User können nicht gelöscht werden
  - Verfügbar für Active und Suspended Users
  - Neuer API Endpoint: `POST /api/admin/delete-user`

- **Mobile Responsive Design** für Admin Dashboard:
  - Optimierte Darstellung auf Smartphones und Tablets
  - Flexible Button-Layouts mit Wrapping
  - Kleinere Schriftgrößen und Abstände auf Mobile
  - Tab-Labels verkürzt auf kleinen Bildschirmen
  - Bessere Touch-Targets für mobile Bedienung

### Verbessert
- **Vereinfachter Login-Flow nach Account-Genehmigung**:
  - Neue User erhalten nach Admin-Genehmigung eine Email mit **direktem Login-Link (Magic Link)**
  - Kein erneutes Eingeben von Email + Code mehr nötig
  - Magic Link ist 24 Stunden gültig und einmalig verwendbar
  - Nach Magic Link Login wird automatisch eine reguläre 60-Tage Session erstellt

- **Session-Dauer erhöht**:
  - JWT Token Gültigkeit von 30 auf **60 Tage** erhöht
  - Gilt für alle Login-Methoden (Code-Verifizierung und Magic Link)
  - User müssen sich seltener neu anmelden

- **Splash Screen Optimierung**:
  - Splash Screen wird nur noch einmal pro Browser-Session angezeigt
  - Verwendet sessionStorage statt localStorage
  - Bessere User Experience bei App-Nutzung

- **Error Handling im Admin Dashboard**:
  - Falsche Fehlermeldungen bei erfolgreichen Operationen behoben
  - Delete und Extend Access zeigen keine Fehler mehr wenn Operation erfolgreich war
  - Automatischer Page Reload wenn Refresh fehlschlägt aber Operation erfolgreich war

### Geändert
- **Worker API** ([`workers/auth-api.js`](workers/auth-api.js)):
  - Neuer Endpoint: `GET /api/auth/magic-login` - Verarbeitet Magic Link Tokens
  - Neuer Endpoint: `POST /api/auth/check-status` - Status-Check ohne Code-Generierung
  - Neuer Endpoint: `POST /api/analytics/track` - Event-Tracking
  - Neuer Endpoint: `GET /api/admin/analytics` - Analytics-Daten abrufen
  - Neuer Endpoint: `POST /api/admin/delete-user` - User permanent löschen
  - `POST /api/admin/approve-user` - Generiert jetzt Magic Link statt Verifizierungscode
  - Approval-Email enthält direkten Login-Link statt Anleitung für Code-Eingabe
  
- **AuthContext** ([`src/context/AuthContext.jsx`](src/context/AuthContext.jsx)):
  - Automatische Erkennung von Magic Link Token in URL beim App-Start
  - Magic Link Login ohne weitere Benutzerinteraktion
  - Polling verwendet jetzt `/check-status` statt `/request-verification` (verhindert mehrfache Code-Generierung)
  - **App-Open Tracking** bei Session-Validierung und Magic Link Login
  - Automatisches Login-Event-Tracking nach erfolgreicher Anmeldung
  - Polling zeigt jetzt Hinweis auf Magic Link Email statt Code-Eingabe

- **Admin Dashboard** ([`src/components/AdminDashboard.jsx`](src/components/AdminDashboard.jsx)):
  - Analytics Widget mit erweiterten Statistiken und Daily Active Users Chart
  - Zeigt jetzt echte App-Nutzung statt nur Logins
  - Delete-Button für permanentes Löschen von Usern
  - Vollständig mobile-responsive mit Tailwind Breakpoints
  - Verbesserte Error-Handling-Logik

- **TechniqueCard** ([`src/components/techniques/TechniqueCard.jsx`](src/components/techniques/TechniqueCard.jsx)):
  - **Video-View Tracking** beim Abspielen eines Videos
  - Speichert Video-ID, Name und Kategorie für detaillierte Analysen

- **CategoryAccordion** ([`src/components/categories/CategoryAccordion.jsx`](src/components/categories/CategoryAccordion.jsx)):
  - **Category-View Tracking** beim Öffnen einer Kategorie
  - Ermöglicht Analyse welche Kategorien am beliebtesten sind

- **Database Schema**:
  - [`workers/schema-analytics.sql`](workers/schema-analytics.sql) - Initiales Schema
  - [`workers/schema-analytics-update.sql`](workers/schema-analytics-update.sql) - Metadata-Spalte hinzugefügt
  - Tabelle `analytics_events` mit Feldern: id, event_type, user_email, created_at, date, metadata

### User Experience
**Vorher (umständlich):**
1. Neuer User → Email + Code eingeben
2. Account auf "pending"
3. Admin genehmigt
4. User bekommt Email → **muss nochmal Email + neuen Code eingeben** ❌

**Jetzt (optimiert):**
1. Neuer User → Email + Code eingeben
2. Account auf "pending"
3. Admin genehmigt
4. User bekommt Email mit **direktem Login-Link** → Ein Klick und fertig! ✅

### Sicherheit
- Magic Link Token sind JWT-basiert mit 24h Gültigkeit
- Einmalige Verwendung (Token wird nach Login gelöscht)
- Nach Magic Link Login wird reguläre 60-Tage Session erstellt
- Alle bestehenden Sicherheitsfeatures bleiben erhalten

---

## [2026-09-26] - Email-Verifizierung implementiert 🔐

### Hinzugefügt
- **Sichere Email-Verifizierung** - Ersetzt unsichere allowed-users.json Lösung
  - Cloudflare Worker API für Backend-Authentifizierung
  - Cloudflare D1 Database für sichere User-Verwaltung
  - Resend Email Service Integration für Code-Versand
  - 6-stellige Verifizierungscodes (15 Minuten gültig)
  - JWT Token Sessions (30 Tage Gültigkeit)
  - Zweistufiger Login-Prozess (Email → Code)

### Geändert
- **AuthContext komplett überarbeitet**:
  - Neue Funktionen: `requestVerification()`, `verifyCode()`, `resetVerification()`
  - Session-Validierung via Backend API
  - JWT Token statt localStorage-only Authentifizierung
  - Datei: `src/context/AuthContext.jsx`

- **LoginScreen modernisiert**:
  - Zweistufiger Prozess: Email-Eingabe → Code-Eingabe
  - Visuelles Feedback für jeden Schritt
  - "Code erneut senden" Funktion
  - Verbesserte UX mit Auto-Focus und Input-Validierung
  - Datei: `src/components/LoginScreen.jsx`

### Sicherheitsverbesserungen
- ✅ User-Daten nicht mehr öffentlich sichtbar
- ✅ Echte Email-Verifizierung (nur wer Zugang zur Email hat, kann sich anmelden)
- ✅ Bot-Schutz durch zeitlich begrenzte Codes
- ✅ Rate Limiting vorbereitet (login_attempts Tabelle)
- ✅ JWT Token mit Expiration
- ✅ Server-seitige Validierung
- ✅ HTTPS only (Cloudflare Workers)

### Neue Dateien
- `workers/auth-api.js` - Cloudflare Worker mit 3 API Endpoints
- `workers/schema.sql` - D1 Database Schema (4 Tabellen)
- `workers/wrangler.toml` - Worker Konfiguration
- `workers/package.json` - Worker Dependencies
- `workers/.gitignore` - Git Ignore für Worker
- `workers/README.md` - Worker Dokumentation
- `EMAIL-VERIFICATION-SETUP.md` - Vollständige Setup-Anleitung
- `SECURITY-IMPROVEMENTS.md` - Sicherheitsanalyse & Vergleich
- `.env.example` - Environment Variables Template

### Dokumentation
- Detaillierte Setup-Anleitung mit allen Schritten
- Sicherheitsanalyse: Alt vs. Neu
- API Dokumentation für alle Endpoints
- User-Verwaltung Befehle
- Troubleshooting Guide
- Migration Guide von allowed-users.json

### Technische Details
- **Backend**: Cloudflare Workers (Serverless)
- **Database**: Cloudflare D1 (SQLite)
- **Email**: Resend API (100 Emails/Tag kostenlos)
- **Auth**: JWT mit HMAC SHA-256
- **Kosten**: Kostenlos für < 50 User

### Nächste Schritte
1. Cloudflare Worker deployen (siehe EMAIL-VERIFICATION-SETUP.md)
2. D1 Database erstellen und Schema ausführen
3. Resend API Key konfigurieren
4. Frontend .env mit Worker URL konfigurieren
5. User von allowed-users.json zu D1 migrieren
6. allowed-users.json löschen

---

## 🔮 Geplante Verbesserungen (Future Ideas)

### Weitere Sicherheits-Features
- **Rate Limiting aktivieren** - Schutz vor Brute-Force Angriffen
- **IP-basiertes Tracking** - Verdächtige Aktivitäten erkennen
- **Audit Logging** - Compliance & Monitoring
- **Two-Factor Authentication** - Zusätzliche Sicherheitsebene
- **Device Fingerprinting** - Login von neuen Geräten erkennen

---

## [2026-09-24]

### Behoben
- **Kategorie-Filter Bug**: Side Control Techniken wurden nicht in der Side Control Kategorie angezeigt
  - Problem: Filter prüfte nur Tags, nicht das `category` Feld
  - Lösung: Filter prüft jetzt sowohl `category` Feld als auch Tags
  - Datei: `src/context/TechniqueContext.jsx`

### Hinzugefügt
- **Detaillierte Beschreibungen und Hashtags für 34 Techniken**:
  - Half-lasso Guard (ehemals Knee Shield) - 6 Techniken mit neuen Beschreibungen und Tags
  - Spider Lasso - 3 Techniken mit neuen Beschreibungen und Tags
  - Side Control - 9 Techniken mit neuen Beschreibungen und Tags (1 Technik gelöscht, IDs neu nummeriert)
  - North South - 9 Techniken mit neuen Beschreibungen und Tags
  - Back Control - 4 Techniken mit neuen Beschreibungen und Tags
  - Octopus Guard (ehemals Half Guard) - 3 Techniken mit neuen Beschreibungen und Tags

### Geändert
- **Kategorie-Umbenennungen**:
  - "Knee Shield" wurde zu "Half-lasso Guard" umbenannt (6 Techniken)
  - "Half Guard" wurde zu "Octopus Guard" umbenannt (3 Techniken)
  - subCategories Array in mockTechniques.js aktualisiert
  
- **Side Control Techniken neu strukturiert**:
  - Technique 8 (ID 38) wurde gelöscht
  - Technique 9 wurde zu Technique 8 (ID 38, verwendet SideControl_Technique_9.mp4)
  - Technique 10 wurde zu Technique 9 (ID 39, verwendet SideControl_Technique_10.mp4)
  - Alle nachfolgenden IDs neu nummeriert
  
- **Branding-Update**: Footer und Header Text geändert
  - Von "AKXE BJJ - PRIMO Germany/München" zu "PRIMO BJJ - AKXE Germany/München"
  - Betrifft: App.jsx (Footer und Training Schedule) und Header.jsx

### Entfernt
- **Z Guard - Technique 6** (ID 6) wurde gelöscht (Duplikat von Technique 3)
- **Octopus Guard (ehemals Half Guard) - Techniques 4-9** (6 Techniken gelöscht)
  - Alle nachfolgenden IDs neu nummeriert

### Technische Details
- Datei: `src/data/mockTechniques.js` - 34 Techniken mit Beschreibungen und Tags aktualisiert, 8 Techniken gelöscht, IDs neu nummeriert
- Datei: `src/App.jsx` - Footer und Training Schedule Branding aktualisiert
- Datei: `src/components/layout/Header.jsx` - Header Branding aktualisiert
- **Gesamt: 72 Techniken** in der Datenbank (8 gelöscht, IDs neu nummeriert von 1-72)

---

## [2026-09-21]

### Hinzugefügt
- **Neue Kategorien**: Mount und Sweep Kategorien zur App hinzugefügt
  - Neue Icon-Bilder: `Mount.png` (1,61 MB) und `Sweep.png` (1,61 MB)
  - Kategorien in der Navigation in folgender Reihenfolge: Guard - Pass - Sweep - Mount - Side Control - Back - Submission - TakeDown

### Geändert
- **Tag-basierte Filterung implementiert**:
  - Filterlogik in `TechniqueContext.jsx` von `category`-Feld auf Tag-basiert umgestellt
  - Videos erscheinen jetzt in ALLEN Kategorien, die ihren Tags entsprechen
  - "All Categories" zeigt weiterhin alle Videos
  
- **Z Guard Techniken aktualisiert** (5 Videos):
  - Detaillierte Beschreibungen für alle Techniken hinzugefügt
  - Tags aktualisiert: 2 Videos mit #sweep, 3 Videos mit #pass
  - Alle Videos haben #Guard und #zguard Tags

- **50/50 Guard Techniken aktualisiert** (6 Videos):
  - Detaillierte Beschreibungen für alle Techniken hinzugefügt
  - Tags aktualisiert: 2 Videos mit #sweep, 1 Video mit #back, 3 Videos mit #submission
  - Alle Videos haben #50/50 Tag

- **Kategorie-Navigation erweitert**:
  - `categories` Array in `mockTechniques.js` um Mount und Sweep erweitert
  - `subCategories` Objekt um Mount und Sweep Unterkategorien ergänzt

### Entfernt
- **Difficulty-Feld entfernt**:
  - "difficulty" Feld (Beginner/Intermediate/Advanced) von allen 80 Techniken entfernt
  - 80 Zeilen Code bereinigt

### Technische Details
- Datei: `src/context/TechniqueContext.jsx` - Tag-basierte Filterlogik implementiert
- Datei: `src/data/mockTechniques.js` - 11 Techniken mit neuen Descriptions und Tags aktualisiert, difficulty-Feld entfernt
- Datei: `public/images/Mount.png` - Neues Mount Kategorie-Icon
- Datei: `public/images/Sweep.png` - Neues Sweep Kategorie-Icon

### Commits
- `50a5973` - Add Mount and Sweep category icons to navigation
- `21382dd` - Update Z Guard and 50/50 techniques with detailed descriptions and tag-based filtering
- `01498aa` - Remove difficulty field from all techniques

---

## [2026-09-20]

### Hinzugefügt
- Neues Logo `logo_splas_neu.png` (341 KB) zum Repository hinzugefügt
- Logo wird jetzt auf dem Splash Screen angezeigt

### Geändert
- **Splash Screen Logo Update**: 
  - Logo von `icon-512.png` auf `logo_splas_neu.png` geändert
  - Logo-Größe auf 256x256px (w-64 h-64) erhöht für bessere Proportionen
  - `object-contain` CSS-Klasse hinzugefügt, um Verzerrung zu vermeiden und Seitenverhältnis beizubehalten
  
- **Techniken Datenbereinigung**:
  - Alle "Gi" Tags aus allen 80 Techniken in `mockTechniques.js` entfernt
  - Tags sind jetzt sauberer und fokussierter auf die eigentlichen Techniken

### Technische Details
- Datei: `src/components/SplashScreen.jsx` - Logo-Implementierung
- Datei: `src/data/mockTechniques.js` - Entfernung von 79 "Gi" Tag-Einträgen
- Datei: `public/images/logo_splas_neu.png` - Neues Logo-Asset

### Commits
- `d1aa029` - Increase splash screen logo size to w-64 h-64
- `b00ab80` - Fix logo aspect ratio on splash screen with object-contain
- `d831593` - Add logo_splas_neu.png and update splash screen to use new logo
- `7dd102b` - Remove Gi tag from all techniques
- `ad3086b` - Update splash screen logo to logo_splas_neu.png (initial)

---

## Frühere Änderungen

Für frühere Änderungen siehe Git-Historie: `git log --oneline`
