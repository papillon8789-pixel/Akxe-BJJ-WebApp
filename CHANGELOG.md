# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

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
