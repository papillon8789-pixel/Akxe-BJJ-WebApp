# 🚀 Getting Started - Erste Schritte

## Schritt-für-Schritt Anleitung für Anfänger

---

## 1️⃣ Node.js installieren

### Windows
1. Gehe zu [nodejs.org](https://nodejs.org/)
2. Lade die **LTS Version** herunter (empfohlen)
3. Führe den Installer aus
4. Folge den Anweisungen (Standard-Einstellungen sind OK)

### Prüfen ob installiert
Öffne die **Eingabeaufforderung** (cmd) und tippe:
```bash
node --version
```
Du solltest eine Versionsnummer sehen (z.B. `v18.17.0`)

---

## 2️⃣ Projekt starten

### Terminal öffnen
1. Öffne **VS Code**
2. Öffne den `bjj-app` Ordner
3. Drücke `` Strg + ` `` (Backtick) um das Terminal zu öffnen

### Dependencies installieren
Im Terminal eingeben:
```bash
npm install
```

⏳ Das dauert 1-2 Minuten. npm lädt alle benötigten Pakete herunter.

### Development Server starten
```bash
npm run dev
```

✅ Du solltest sehen:
```
  VITE v5.3.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### App öffnen
1. Öffne deinen Browser
2. Gehe zu: `http://localhost:5173`
3. Die App sollte jetzt laufen! 🎉

---

## 3️⃣ Erste Schritte in der App

### Was du siehst:
- **Header** mit PRIMO BJJ Logo
- **Icon-Navigation** (Guard, Pass, Side Control, etc.)
- **Beispiel-Techniken** in verschiedenen Kategorien

### Ausprobieren:
1. **Klicke auf "GUARD"** - Zeigt nur Guard-Techniken
2. **Klicke auf die Lupe** 🔍 - Öffnet die Suche
3. **Klicke auf eine Kategorie** (z.B. "C GUARD") - Klappt auf/zu
4. **Klicke auf ❤️** bei einer Technik - Markiert als Favorit
5. **Klicke auf ⬇️** - Markiert als heruntergeladen

---

## 4️⃣ Eigene Videos hinzufügen

### Vorbereitung
Du brauchst:
- ✅ Cloudflare Account (kostenlos)
- ✅ Deine BJJ-Technik Videos

### Cloudflare Stream Setup

1. **Gehe zu:** [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Melde dich an** oder erstelle einen Account
3. **Navigiere zu "Stream"** im Menü
4. **Klicke auf "Upload Video"**
5. **Wähle dein Video aus** und warte bis Upload fertig ist

### Video-ID kopieren

Nach dem Upload siehst du:
```
Video-ID: abc123def456789
```

Diese ID brauchst du gleich!

### Video in der App eintragen

1. **Öffne die Datei:** `src/data/mockTechniques.js`
2. **Füge einen neuen Eintrag hinzu:**

```javascript
{
  id: '11',  // Nächste freie Nummer
  title: 'Meine erste Technik',
  description: 'Beschreibung der Technik',
  category: 'guard',  // guard, pass, side, back, submissions
  subCategory: 'C Guard',
  videoId: 'abc123def456789',  // ← DEINE VIDEO-ID HIER!
  thumbnail: 'https://customer-XXXXX.cloudflarestream.com/abc123def456789/thumbnails/thumbnail.jpg',
  duration: '1:30',
  tags: ['Guard', 'Entry', 'Gi'],
  dateAdded: '2026-09-07',
  month: '2026-09',
  difficulty: 'Beginner',
  isFavorite: false,
  isDownloaded: false,
  isBookmarked: false,
  viewCount: 0,
  notes: ''
}
```

3. **Speichere die Datei** (Strg + S)
4. **Gehe zurück zum Browser** - Die App aktualisiert sich automatisch!
5. **Deine Technik sollte jetzt erscheinen!** 🎉

---

## 5️⃣ Häufige Befehle

### Development Server starten
```bash
npm run dev
```

### Server stoppen
Drücke `Strg + C` im Terminal

### Build für Production
```bash
npm run build
```

### Build testen
```bash
npm run preview
```

---

## 6️⃣ Dateien bearbeiten

### Wichtigste Dateien:

| Datei | Was du ändern kannst |
|-------|---------------------|
| `src/data/mockTechniques.js` | **Videos hinzufügen/bearbeiten** |
| `tailwind.config.js` | Farben anpassen |
| `src/components/layout/Header.jsx` | Header-Text ändern |
| `index.html` | Seiten-Titel |

### Beispiel: Farbe ändern

Öffne `tailwind.config.js`:

```javascript
colors: {
  'primo-red': '#e63946',  // ← Ändere diese Farbe!
}
```

Speichern → Browser aktualisiert sich automatisch!

---

## 7️⃣ Troubleshooting

### Problem: "npm" nicht gefunden
**Lösung:** Node.js ist nicht installiert oder nicht im PATH
- Installiere Node.js neu
- Starte Computer neu

### Problem: Port 5173 bereits belegt
**Lösung:** Ein anderer Prozess nutzt den Port
```bash
# Stoppe den alten Server (Strg + C)
# Oder nutze einen anderen Port:
npm run dev -- --port 3000
```

### Problem: Änderungen werden nicht angezeigt
**Lösung:** 
1. Speichere die Datei (Strg + S)
2. Aktualisiere den Browser (F5)
3. Prüfe das Terminal auf Fehler

### Problem: Videos laden nicht
**Lösung:**
- Prüfe ob Video-ID korrekt ist
- Prüfe ob Cloudflare Stream aktiv ist
- Prüfe Internet-Verbindung

---

## 8️⃣ Nächste Schritte

### Jetzt kannst du:
- ✅ Die App lokal ausführen
- ✅ Videos zu Cloudflare hochladen
- ✅ Videos in der App eintragen
- ✅ Farben und Texte anpassen

### Als nächstes:
1. **Mehr Videos hinzufügen** - Baue deine Technik-Bibliothek auf
2. **Kategorien organisieren** - Sortiere nach Positionen
3. **Deployment** - Veröffentliche die App online (siehe README.md)

---

## 🆘 Hilfe benötigt?

### Dokumentation
- **Vollständige Anleitung:** [`README.md`](./README.md)
- **Cloudflare Setup:** [`CLOUDFLARE-SETUP.md`](./CLOUDFLARE-SETUP.md)
- **Architektur:** `../plans/bjj-app-architecture.md`

### Online-Ressourcen
- **React lernen:** [react.dev/learn](https://react.dev/learn)
- **Tailwind CSS:** [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Cloudflare Stream:** [developers.cloudflare.com/stream](https://developers.cloudflare.com/stream/)

---

**Viel Erfolg! 🥋**

*Bei Fragen: Schau in die Dokumentation oder probiere es einfach aus!*
