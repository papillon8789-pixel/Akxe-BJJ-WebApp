# 🥋 BJJ Technique Locker - PRIMO BJJ München

Eine Mobile-First Web-App zur Verwaltung und Anzeige von Brazilian Jiu-Jitsu Techniken mit Cloudflare Stream Video-Integration.

![PRIMO BJJ](https://img.shields.io/badge/PRIMO_BJJ-München-gold?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwind-css)

---

## ✨ Features

- ✅ **Dark Theme Design** - Modernes, augenfreundliches Interface basierend auf PRIMO BJJ Branding
- ✅ **Kategorisierung** - Guard, Pass, Side Control, Back, Submissions
- ✅ **Video-Management** - Cloudflare Stream Integration für optimales Streaming
- ✅ **Favoriten-System** - Markiere deine Lieblingstechniken ❤️
- ✅ **Download-Tracking** - Markiere Videos als offline verfügbar ⬇️
- ✅ **Bookmark-Funktion** - Wichtige Techniken hervorheben ⭐
- ✅ **Such-Funktion** - Schnelles Finden von Techniken 🔍
- ✅ **Responsive Design** - Optimiert für Mobile, Tablet und Desktop
- ✅ **LocalStorage** - Alle Einstellungen werden lokal gespeichert

---

## 🚀 Schnellstart

### Voraussetzungen

Installiere zuerst **Node.js** (v18 oder höher):
- Download: [nodejs.org](https://nodejs.org/)

### Installation

1. **In den Projektordner wechseln:**
   ```bash
   cd bjj-app
   ```

2. **Dependencies installieren:**
   ```bash
   npm install
   ```

3. **Development Server starten:**
   ```bash
   npm run dev
   ```

4. **App öffnen:**
   - Öffne [http://localhost:5173](http://localhost:5173) im Browser
   - Die App sollte jetzt laufen! 🎉

---

## 📹 Videos hinzufügen

### Schritt 1: Videos zu Cloudflare Stream hochladen

1. Gehe zu [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigiere zu **Stream**
3. Lade deine BJJ-Technik Videos hoch
4. Kopiere die **Video-ID** für jedes Video

### Schritt 2: Videos in der App eintragen

Öffne die Datei: **`src/data/mockTechniques.js`**

Füge für jedes Video einen Eintrag hinzu:

```javascript
{
  id: '1',
  title: 'C Guard Entry',
  description: 'Grundlegende Einführung in die C Guard Position',
  category: 'guard',  // guard, pass, side, back, submissions
  subCategory: 'C Guard',
  videoId: 'DEINE-CLOUDFLARE-VIDEO-ID',  // ← Hier eintragen!
  thumbnail: 'https://customer-XXXXX.cloudflarestream.com/VIDEO-ID/thumbnails/thumbnail.jpg',
  duration: '1:30',
  tags: ['Guard', 'Entry', 'Gi'],
  dateAdded: '2026-09-01',
  month: '2026-09',
  difficulty: 'Beginner',
  // ...
}
```

**Detaillierte Anleitung:** Siehe [`CLOUDFLARE-SETUP.md`](./CLOUDFLARE-SETUP.md)

---

## 📁 Projekt-Struktur

```
bjj-app/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx              # App-Header mit Logo & Suche
│   │   │   └── IconNavigation.jsx      # Kategorie-Navigation
│   │   ├── categories/
│   │   │   └── CategoryAccordion.jsx   # Ausklappbare Kategorien
│   │   └── techniques/
│   │       └── TechniqueCard.jsx       # Video-Karte mit Actions
│   ├── context/
│   │   └── TechniqueContext.jsx        # State Management
│   ├── data/
│   │   └── mockTechniques.js           # Video-Daten (HIER BEARBEITEN!)
│   ├── App.jsx                         # Haupt-App
│   ├── main.jsx                        # Entry Point
│   └── index.css                       # Tailwind Styles
├── public/                             # Statische Assets
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js                  # PRIMO BJJ Farben
```

---

## 🎨 Kategorien

Die App organisiert Techniken in folgende Kategorien:

| Icon | Kategorie | Beschreibung |
|------|-----------|--------------|
| 🛡️ | **GUARD** | Alle Guard-Positionen (C Guard, Deep Half, etc.) |
| 🏃 | **PASS** | Guard Passes (Toreando, Knee Slice, etc.) |
| 🔄 | **SIDE CONTROL** | Side Control Techniken |
| 🔙 | **BACK** | Back Control & Turtle |
| ⚔️ | **SUBMISSIONS** | Armlocks, Chokes, Leglocks |

---

## 🎯 Verwendung

### Techniken durchsuchen
1. **Kategorie wählen:** Klicke auf ein Icon (Guard, Pass, etc.)
2. **Suchen:** Klicke auf 🔍 und gib einen Suchbegriff ein
3. **Kategorie aufklappen:** Klicke auf den Kategorie-Header

### Techniken verwalten
- **❤️ Favorit** - Markiere wichtige Techniken
- **⬇️ Download** - Markiere als offline verfügbar
- **⭐ Bookmark** - Setze Lesezeichen

Alle Einstellungen werden automatisch im Browser gespeichert (LocalStorage).

---

## 🔧 Anpassungen

### Farben ändern

Bearbeite `tailwind.config.js`:

```javascript
colors: {
  'primo-red': '#e63946',    // Akzentfarbe
  'primo-gold': '#d4af37',   // Gold-Akzente
  'app-bg': '#0a0a0a',       // Hintergrund
  'card-bg': '#1a1a1a',      // Karten
}
```

### Neue Kategorie hinzufügen

1. Öffne `src/data/mockTechniques.js`
2. Füge zur `categories` Array hinzu:
   ```javascript
   { id: 'neue-kategorie', icon: '🆕', label: 'NEUE KATEGORIE' }
   ```

---

## 📦 Build für Production

```bash
npm run build
```

Die Build-Dateien werden im `dist/` Ordner erstellt.

### Preview des Builds

```bash
npm run preview
```

---

## 🌐 Deployment auf Cloudflare Pages

1. **GitHub Repository erstellen** und Code pushen

2. **Cloudflare Pages Projekt erstellen:**
   - Gehe zu [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigiere zu **Pages**
   - Klicke auf **Create a project**
   - Verbinde dein GitHub Repository

3. **Build-Einstellungen:**
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `bjj-app` (falls im Unterordner)

4. **Deploy!**
   - Cloudflare baut und deployed automatisch
   - Bei jedem Git Push wird neu deployed

---

## 🎨 Tech-Stack

- **React 18** - UI Framework
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS** - Utility-First CSS Framework
- **Context API** - State Management
- **Cloudflare Stream** - Video Hosting & Streaming
- **LocalStorage** - Persistente Daten

---

## 📝 Beispiel-Workflow

### Monatliche Techniken hinzufügen

Jeden Monat lernst du 2 neue Techniken:

1. **Videos aufnehmen** (Handy, Kamera, etc.)
2. **Zu Cloudflare Stream hochladen**
3. **Video-IDs kopieren**
4. **In `mockTechniques.js` eintragen:**
   ```javascript
   {
     id: '11',
     title: 'Neue Technik September',
     category: 'guard',
     subCategory: 'Spider Guard',
     videoId: 'neue-video-id',
     month: '2026-09',  // Aktueller Monat
     // ...
   }
   ```
5. **Fertig!** Die App zeigt die neue Technik an

---

## 🤝 PRIMO BJJ - AKXE GERMANY

**Standort:** München  
**Gegründet:** 2012  
**Motto:** *"Together we stand, united we fight"*

Diese App wurde speziell für PRIMO BJJ München entwickelt, um das Training zu unterstützen und Techniken zu dokumentieren.

---

## 📄 Lizenz

© 2012-2026 PRIMO BJJ - AKXE GERMANY

---

## 🆘 Hilfe & Support

### Häufige Probleme

**Problem:** Videos laden nicht  
**Lösung:** Prüfe ob die Video-IDs korrekt sind und Cloudflare Stream aktiv ist

**Problem:** App startet nicht  
**Lösung:** 
```bash
rm -rf node_modules
npm install
npm run dev
```

**Problem:** Favoriten werden nicht gespeichert  
**Lösung:** Prüfe ob LocalStorage im Browser aktiviert ist

### Weitere Hilfe

- **Cloudflare Stream Docs:** [developers.cloudflare.com/stream](https://developers.cloudflare.com/stream/)
- **React Docs:** [react.dev](https://react.dev)
- **Tailwind Docs:** [tailwindcss.com](https://tailwindcss.com)

---

**Viel Erfolg beim Training! 🥋**

*Together we stand, united we fight!*
