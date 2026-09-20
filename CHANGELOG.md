# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

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
