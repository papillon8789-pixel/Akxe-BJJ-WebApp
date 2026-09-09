# 📱 PWA Setup - App-Icon Installation

## Übersicht

Die App ist jetzt als **Progressive Web App (PWA)** konfiguriert! Das bedeutet, du kannst sie auf deinem Smartphone wie eine native App installieren.

---

## 🎨 App-Icon vorbereiten

### Schritt 1: Logo in die richtigen Größen konvertieren

Du brauchst das PRIMO BJJ Logo in **2 Größen**:

1. **192x192 Pixel** - Für kleine Icons
2. **512x512 Pixel** - Für große Icons und Splash Screens

### Empfohlene Tools:

#### Online (Kostenlos):
- **[Squoosh.app](https://squoosh.app/)** - Google's Bild-Optimierer
- **[ResizeImage.net](https://resizeimage.net/)** - Einfacher Resizer
- **[Favicon.io](https://favicon.io/)** - Generiert alle Größen automatisch

#### Desktop:
- **Photoshop / GIMP** - Professionelle Bildbearbeitung
- **Paint.NET** (Windows) - Kostenlos
- **Preview** (Mac) - Eingebaut

### Schritt 2: Icons speichern

Speichere die konvertierten Bilder hier:

```
bjj-app/
└── public/
    └── icons/
        ├── icon-192x192.png    ← 192x192 Pixel
        └── icon-512x512.png    ← 512x512 Pixel
```

**Wichtig:** Die Dateinamen müssen **exakt** so heißen!

---

## 📋 Schnell-Anleitung mit Squoosh.app

1. **Öffne:** [squoosh.app](https://squoosh.app/)
2. **Upload:** Ziehe dein PRIMO BJJ Logo in den Browser
3. **Resize:**
   - Klicke auf "Resize" (rechts)
   - Wähle "Browser PNG" als Format
   - Setze Width: `192` und Height: `192`
   - Download als `icon-192x192.png`
4. **Wiederhole** für 512x512 Pixel
5. **Speichere** beide Dateien in `bjj-app/public/icons/`

---

## ✅ Installation testen

### Auf dem Smartphone:

#### **Android (Chrome):**
1. Öffne die App im Chrome Browser
2. Tippe auf die **3 Punkte** (⋮) oben rechts
3. Wähle **"Zum Startbildschirm hinzufügen"** oder **"App installieren"**
4. Bestätige mit **"Installieren"**
5. ✅ Das PRIMO BJJ Logo erscheint auf deinem Homescreen!

#### **iOS (Safari):**
1. Öffne die App in Safari
2. Tippe auf das **Teilen-Symbol** (□↑) unten
3. Scrolle runter und wähle **"Zum Home-Bildschirm"**
4. Bestätige mit **"Hinzufügen"**
5. ✅ Das PRIMO BJJ Logo erscheint auf deinem Homescreen!

### Auf dem Desktop:

#### **Chrome / Edge:**
1. Öffne die App im Browser
2. Klicke auf das **⊕ Icon** in der Adressleiste (rechts)
3. Oder: **3 Punkte** → **"App installieren"**
4. ✅ Die App öffnet sich in einem eigenen Fenster!

---

## 🎨 Was wurde konfiguriert?

### 1. Web App Manifest (`public/manifest.json`)
```json
{
  "name": "PRIMO BJJ Technique Locker",
  "short_name": "PRIMO BJJ",
  "theme_color": "#e63946",        // PRIMO Rot
  "background_color": "#0a0a0a",   // Dunkel
  "display": "standalone",          // Wie native App
  "icons": [...]
}
```

### 2. PWA Meta-Tags (`index.html`)
- ✅ Theme Color (PRIMO Rot)
- ✅ Apple Touch Icons
- ✅ Manifest Link
- ✅ Mobile-optimiert

### 3. App-Features
- 📱 **Standalone Mode** - Öffnet ohne Browser-UI
- 🎨 **Custom Theme** - PRIMO BJJ Farben
- 🔄 **Orientation Lock** - Portrait-Modus
- ⚡ **Fast Loading** - Optimierte Performance

---

## 🚀 Deployment

### Cloudflare Pages

Wenn du die App auf Cloudflare Pages deployed, funktioniert die PWA automatisch:

1. **Push zu GitHub:**
   ```bash
   git add .
   git commit -m "Add PWA support"
   git push
   ```

2. **Cloudflare baut automatisch** und die PWA ist live!

3. **Teste die Installation** auf deinem Smartphone über die Live-URL

---

## 🔧 Erweiterte Konfiguration

### Service Worker (Optional)

Für **Offline-Funktionalität** kannst du einen Service Worker hinzufügen:

```javascript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('primo-bjj-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        // Weitere Assets...
      ]);
    })
  );
});
```

Registrierung in `src/main.jsx`:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## 📝 Checkliste

- [x] Manifest erstellt (`public/manifest.json`)
- [x] Meta-Tags hinzugefügt (`index.html`)
- [ ] **Icons hochgeladen** (`public/icons/icon-*.png`) ← **DU BIST HIER**
- [ ] App auf Smartphone getestet
- [ ] Installation getestet

---

## 🆘 Troubleshooting

### Problem: "Installieren"-Button erscheint nicht

**Lösung:**
1. Prüfe ob die Icons existieren: `bjj-app/public/icons/`
2. Öffne DevTools → Application → Manifest
3. Prüfe auf Fehler in der Konsole
4. Stelle sicher, dass die App über **HTTPS** läuft (oder localhost)

### Problem: Falsches Icon wird angezeigt

**Lösung:**
1. Lösche Browser-Cache
2. Deinstalliere die App
3. Installiere neu
4. Prüfe Dateinamen: `icon-192x192.png` und `icon-512x512.png`

### Problem: App öffnet sich im Browser statt standalone

**Lösung:**
1. Prüfe `manifest.json` → `"display": "standalone"`
2. Deinstalliere und installiere die App neu
3. Auf iOS: Muss über Safari installiert werden

---

## 🎯 Nächste Schritte

1. **Icons vorbereiten** (192x192 und 512x512)
2. **In `public/icons/` speichern**
3. **App neu starten:** `npm run dev`
4. **Auf Smartphone testen**
5. **Deployen und genießen!** 🥋

---

## 📞 Weitere Infos

- **PWA Docs:** [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps/)
- **Manifest Generator:** [simicart.com/manifest-generator.html](https://www.simicart.com/manifest-generator.html/)
- **Icon Generator:** [favicon.io](https://favicon.io/)

---

**Together we stand, united we fight!** 🦅

*PRIMO BJJ - AKXE GERMANY | München | EST. 2012*
