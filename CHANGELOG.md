# Changelog - PRIMO BJJ Technique Locker

## 2026-09-09 - Banner System Implementation

### Dynamisches Banner-System
- **Banner-Komponente erstellt:** Zeigt dynamische Ankündigungen in der App
- **GitHub Integration:** Banner-Text liegt im Repository (`public/banner.json`)
- **Handy-freundlich:** Einfach mit GitHub Mobile App bearbeitbar
- **Aktiv/Inaktiv Steuerung:** Einfaches `"active": true/false` Flag
- **4 Banner-Typen:** Info (blau), Success (grün), Warning (gelb), Error (rot)
- **Features:**
  - Dismissible: User können Banner schließen (localStorage)
  - Auto-Expire: Banner verschwinden automatisch nach Ablaufdatum
  - Optional klickbar mit Link
  - Automatisches Deployment bei Änderungen

### Technische Details
- **Banner-Datei:** `public/banner.json` (im GitHub Repository)
- **Komponente:** `src/components/Banner.jsx`
- **Icons:** lucide-react Package hinzugefügt
- **Deployment:** Automatisch bei Git Push (1-2 Minuten)
- **Cache:** No-cache für immer aktuelle Banner-Daten

### Dateien erstellt
- `src/components/Banner.jsx` - Banner-Komponente
- `public/banner.json` - Banner-Konfiguration
- `BANNER-ANLEITUNG.md` - Vollständige Dokumentation mit Handy-Anleitung

### Workflow
1. GitHub App öffnen (oder Browser)
2. `public/banner.json` bearbeiten
3. Commit & Push
4. Cloudflare deployed automatisch
5. Banner ist live (1-2 Minuten)

### Use Cases
- 📢 Neue Videos ankündigen
- 🎄 Events kommunizieren (z.B. Weihnachtsparty)
- 🔧 Wartungsarbeiten ankündigen
- ⚠️ Wichtige Hinweise anzeigen

---

## 2026-09-09 - TakeDown Category & Icon Updates

### Icon-Update: ALL Category
- **Neues Icon für "ALL":** `/images/AllCategories.png` statt Emoji
- **Design:** Konsistentes Image-Icon für alle Kategorien
- **Typ:** Von `emoji` zu `image` geändert

### TakeDown Category Added (27 Videos)

### Neue Video-Kategorie: TakeDown
- **27 TakeDown Videos** aus Cloudflare R2 integriert
- **Video-Dateien:** TakeDown_Technique_1.mp4 bis TakeDown_Technique_27.mp4
- **Kategorie-Icon:** `/images/TakeDown.png`
- **Tags:** TakeDown, Standing, Gi
- **Schwierigkeitsgrad:** Intermediate
- **Status:** Neue Videos (isLegacy: false) - "NEW!" Badge

### Technische Details
- **Gesamt-Videos:** 80 (vorher 53)
- **Neue Kategorie:** "TAKEDOWN" in Navigation hinzugefügt
- **SubCategory:** TakeDown
- **ID-Range:** 54-80

### Dateien geändert
- `generate-techniques.js` - TakeDown Gruppe hinzugefügt
- `src/data/mockTechniques.js` - 27 neue Video-Einträge generiert
- Categories und SubCategories aktualisiert

### Video-Übersicht nach Kategorien
- **GUARD:** 30 Videos
- **SIDE CONTROL:** 19 Videos
- **BACK:** 4 Videos
- **TAKEDOWN:** 27 Videos (NEU!)
- **Gesamt:** 80 Videos

---

## 2026-09-09 - Legacy Badge System

### Badge System Implementation
- **LEGACY Badge hinzugefügt:** Goldenes "🏛️ LEGACY" Badge für ältere Video-Kategorien
- **Badge-Position:** Auf Unterkategorie-Ebene (neben Kategorie-Namen)
- **Design:** Gradient von Amber-600 zu Amber-700
- **Logik:** Wird angezeigt, wenn alle Videos einer Kategorie `isLegacy: true` haben
- **Priorität:** "NEW!" Badge hat Vorrang vor "LEGACY" Badge

### Video-Kategorisierung
- **Z Guard (6 Videos):** "NEW!" Badge - Neueste Videos
- **Legacy Kategorien (47 Videos):** "🏛️ LEGACY" Badge
  - 50/50 Guard: 6 Videos
  - Half Guard: 9 Videos
  - Knee Shield: 6 Videos
  - Spider Lasso: 3 Videos
  - Side Control: 10 Videos
  - North South: 9 Videos
  - Back Control: 4 Videos

### Technische Details
- **CategoryAccordion.jsx:** `isLegacy` Prop und Badge-Rendering
- **App.jsx:** `isLegacyCategory()` Funktion zur Kategorieprüfung
- **TechniqueCard.jsx:** Legacy Badge auf Video-Karten-Ebene
- **generate-techniques.js:** Konfigurierbare `isLegacy` Flag pro Gruppe

### Dateien geändert
- `src/components/categories/CategoryAccordion.jsx` - Legacy Badge Display
- `src/components/techniques/TechniqueCard.jsx` - Video-Level Badge
- `src/App.jsx` - Legacy Kategorie Detection
- `generate-techniques.js` - Legacy Flag Configuration
- `src/data/mockTechniques.js` - Video Data mit Legacy Flags

### Deployment
- **Commit:** edaf962
- **Branch:** main
- **Platform:** Cloudflare Pages

---

## 2026-09-09 - Video Library Expansion (53 Videos)

### Video Integration
- **53 BJJ Technique Videos** aus Cloudflare R2 Bucket integriert
- **Video-Kategorien erweitert:**
  - **GUARD (30 Videos):**
    - Z Guard: 6 Videos (C_Guard1-6.mp4)
    - 50/50 Guard: 6 Videos (50_50_Position_Technique_1-6.mp4)
    - Half Guard: 9 Videos (HalfGuard_Technique_1-9.mp4)
    - Knee Shield: 6 Videos (KneeShield_Technique_1-6.mp4)
    - Spider Lasso: 3 Videos (SpiderLasso_Technique_1-3.mp4)
  - **SIDE CONTROL (19 Videos):**
    - Side Control: 10 Videos (SideControl_Technique_1-10.mp4)
    - North South: 9 Videos (NorthSouth_Technique_1-9.mp4)
  - **BACK (4 Videos):**
    - Back Control: 4 Videos (Back_Technique_1-4.mp4)

### Neue Tools & Dokumentation
- **Generator-Script erstellt:** `generate-techniques.js`
  - Automatische Generierung von Video-Einträgen
  - Einfache Erweiterung für zukünftige Videos
  - Konsistente Datenstruktur
- **Video-Integration Anleitung:** `VIDEO-INTEGRATION-ANLEITUNG.md`
  - Schritt-für-Schritt Anleitung für neue Videos
  - Generator-Script Dokumentation
  - Best Practices für Video-Benennung
  - Troubleshooting Guide

### Technische Details
- **Datenquelle:** Cloudflare R2 Storage
- **Base URL:** `https://pub-333effaca17f49c9b80b42fa7b22c347.r2.dev`
- **Video-Format:** MP4 (H.264)
- **Thumbnails:** Placeholder (400x225px)
- **Kategorisierung:** Nach Position und Technik
- **Tags:** Für verbesserte Suchfunktion

### Dateien geändert
- `src/data/mockTechniques.js` - 53 Video-Einträge hinzugefügt
- `generate-techniques.js` - Neu erstellt
- `VIDEO-INTEGRATION-ANLEITUNG.md` - Neu erstellt

### Deployment
- **Commit:** e206b4f
- **Branch:** main
- **Platform:** Cloudflare Pages
- **Auto-Deploy:** Aktiviert

### Statistik
- **Gesamt:** 53 Videos
- **Nach Kategorie:**
  - Guard: 30 Videos (57%)
  - Side Control: 19 Videos (36%)
  - Back: 4 Videos (7%)
- **Nach Schwierigkeitsgrad:**
  - Beginner: ~10 Videos
  - Intermediate: ~25 Videos
  - Advanced: ~18 Videos

---

## 2026-09-09 - App Icon & Splash Screen Update

### App Icon Optimierung
- **Neues Logo integriert:** `Logo_neu_schwarz.png` (1024x1024px)
- **Icon-Versionen erstellt:**
  - `icon-192.png` - Standard Icon für kleinere Größen
  - `icon-512.png` - Hochauflösendes Icon
  - `icon-maskable-512.png` - Spezielles Icon für Android Splash Screen
- **Hintergrundfarbe:** Einheitliches Schwarz (#0a0a0a) für nahtlose Integration
- **Padding:** 10% Abstand für optimale Darstellung auf verschiedenen Geräten
- **Manifest aktualisiert:** PWA Icons für "any" und "maskable" purpose

### Splash Screen Animation
- **Typ:** Belt Progression Animation
- **Dauer:** 4 Sekunden
- **Ablauf:**
  - 0-0.6s: White Belt
  - 0.6-1.2s: Blue Belt
  - 1.2-1.8s: Purple Belt
  - 1.8-2.4s: Brown Belt
  - 2.4-3.5s: Black Belt (mit Shine-Effekt)
  - 3.5-4s: Fade-Out
- **Features:**
  - Realistische Gürtel-Farben und Texturen
  - Progress-Dots zur Visualisierung
  - Shine-Effekt beim schwarzen Gürtel
  - "Your Journey Begins Here" Motivationstext
  - Smooth Transitions zwischen allen Gürteln

### Technische Details
- **Komponente:** `src/components/SplashScreen.jsx`
- **Integration:** In `App.jsx` mit useState Hook
- **Styling:** Tailwind CSS mit Custom Animations
- **Performance:** Optimierte Timings für schnelles Laden

### Dateien geändert
- `public/images/icon-192.png` - Neu erstellt
- `public/images/icon-512.png` - Neu erstellt
- `public/images/icon-maskable-512.png` - Neu erstellt
- `public/images/Logo_neu_schwarz.png` - Hinzugefügt
- `public/manifest.json` - Icons aktualisiert
- `index.html` - Favicon und Apple Touch Icons aktualisiert
- `src/components/SplashScreen.jsx` - Neu erstellt
- `src/App.jsx` - Splash Screen integriert

### Deployment
- **Commit:** e726550
- **Branch:** main
- **Platform:** Cloudflare Pages
- **Auto-Deploy:** Aktiviert

### Nächste Schritte
- App auf Android-Gerät neu installieren für neue Icons
- Browser-Cache leeren für Splash Screen
- Feedback zur Animation-Geschwindigkeit sammeln
