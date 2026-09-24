# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

---

## 🔮 Geplante Verbesserungen (Future Ideas)

### Sicherheit & Authentifizierung
- **Email-Verifizierung statt Allowed-User.json**
  - **Problem**: Aktuelle Allowed-User.json Lösung ist im Frontend sichtbar und kann von Bots umgangen werden
  - **Lösung**: Email-Verifizierung mit Bestätigungslink
  - **Technologie-Stack**:
    - Cloudflare Workers (Backend API)
    - Cloudflare D1 Database (User-Datenbank)
    - Resend Email Service (Email-Versand, 100 Emails/Tag kostenlos)
  - **Vorteile**:
    - Deutlich sicherer - echte Identitätsprüfung
    - Nur Personen mit Zugang zur Email können sich verifizieren
    - Professioneller Standard
    - Kostenlos für kleine Teams
    - Alles im Cloudflare-Ökosystem integriert
  - **Priorität**: Mittel
  - **Aufwand**: 2-3 Stunden Implementierung

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
