# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

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
