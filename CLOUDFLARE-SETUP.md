# Cloudflare Stream Setup - Anleitung

## 📹 Videos zu Cloudflare Stream hochladen

### Schritt 1: Cloudflare Dashboard öffnen
1. Gehe zu [dash.cloudflare.com](https://dash.cloudflare.com)
2. Wähle dein Konto aus
3. Navigiere zu **Stream** im Menü

### Schritt 2: Videos hochladen
1. Klicke auf **"Upload Video"**
2. Wähle deine BJJ-Technik Videos aus
3. Warte bis der Upload abgeschlossen ist

### Schritt 3: Video-IDs kopieren
Nach dem Upload erhältst du für jedes Video:
- **Video-ID** (z.B. `abc123def456789`)
- **Thumbnail-URL** (automatisch generiert)
- **Stream-URL** (für Embedding)

Beispiel:
```
Video-ID: abc123def456789
Thumbnail: https://customer-XXXXX.cloudflarestream.com/abc123def456789/thumbnails/thumbnail.jpg
Stream URL: https://customer-XXXXX.cloudflarestream.com/abc123def456789/iframe
```

---

## 🔧 Videos in die App eintragen

### Datei öffnen: `src/data/mockTechniques.js`

Für jedes Video, das du hochgeladen hast, erstelle einen Eintrag:

```javascript
{
  id: '1',  // Eindeutige ID (einfach hochzählen)
  title: 'C Guard Entry',  // Titel der Technik
  description: 'Grundlegende Einführung in die C Guard Position',
  category: 'guard',  // guard, pass, side, back, submissions
  subCategory: 'C Guard',  // Unterkategorie
  videoId: 'abc123def456789',  // ← DEINE CLOUDFLARE VIDEO-ID
  thumbnail: 'https://customer-XXXXX.cloudflarestream.com/abc123def456789/thumbnails/thumbnail.jpg',  // ← DEIN THUMBNAIL
  duration: '0:45',  // Video-Länge
  tags: ['Guard', 'Entry', 'Gi'],  // Tags für Filterung
  dateAdded: '2026-09-01',  // Datum hinzugefügt
  month: '2026-09',  // Monat für Gruppierung
  difficulty: 'Beginner',  // Beginner, Intermediate, Advanced
  isFavorite: false,
  isDownloaded: false,
  isBookmarked: false,
  viewCount: 0,
  notes: ''
}
```

---

## 📝 Beispiel: 6 C-Guard Videos eintragen

```javascript
export const mockTechniques = [
  {
    id: '1',
    title: 'C Guard Entry - Grundlagen',
    description: 'Wie man in die C Guard Position kommt',
    category: 'guard',
    subCategory: 'C Guard',
    videoId: 'DEINE-VIDEO-ID-1',  // ← Hier deine Cloudflare Video-ID
    thumbnail: 'https://customer-XXXXX.cloudflarestream.com/DEINE-VIDEO-ID-1/thumbnails/thumbnail.jpg',
    duration: '1:30',
    tags: ['Guard', 'Entry', 'Gi'],
    dateAdded: '2026-09-01',
    month: '2026-09',
    difficulty: 'Beginner',
    isFavorite: false,
    isDownloaded: false,
    isBookmarked: false,
    viewCount: 0,
    notes: ''
  },
  {
    id: '2',
    title: 'C Guard Sweep #1',
    description: 'Erster Sweep aus der C Guard',
    category: 'guard',
    subCategory: 'C Guard',
    videoId: 'DEINE-VIDEO-ID-2',  // ← Hier deine Cloudflare Video-ID
    thumbnail: 'https://customer-XXXXX.cloudflarestream.com/DEINE-VIDEO-ID-2/thumbnails/thumbnail.jpg',
    duration: '2:15',
    tags: ['Sweep', 'Guard', 'Gi'],
    dateAdded: '2026-09-05',
    month: '2026-09',
    difficulty: 'Intermediate',
    isFavorite: false,
    isDownloaded: false,
    isBookmarked: false,
    viewCount: 0,
    notes: ''
  },
  // ... weitere 4 Videos
];
```

---

## 🎥 Video-Player Integration

Die App nutzt automatisch Cloudflare Stream's iframe-Embedding:

```html
<iframe
  src="https://customer-XXXXX.cloudflarestream.com/{videoId}/iframe"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
  allowfullscreen
/>
```

### Features die Cloudflare automatisch bietet:
- ✅ Adaptive Bitrate Streaming
- ✅ Automatische Qualitätsanpassung
- ✅ Mobile-Optimierung
- ✅ Schnelles Laden
- ✅ Thumbnail-Generierung
- ✅ Analytics

---

## 🔑 Cloudflare Account-ID finden

1. Gehe zu Cloudflare Dashboard
2. Klicke auf **Stream**
3. Deine Account-ID findest du in der URL oder unter **Settings**

Format: `customer-XXXXX` (z.B. `customer-abc123`)

---

## 📊 Monatliche Organisation

Videos werden automatisch nach Monat gruppiert:

```javascript
month: '2026-09'  // September 2026
```

Die App zeigt dann:
- **September 2026:** 2 Techniken
- **August 2026:** 3 Techniken
- etc.

---

## ✅ Checkliste

- [ ] Cloudflare Stream Account erstellt
- [ ] Videos hochgeladen
- [ ] Video-IDs kopiert
- [ ] Thumbnail-URLs kopiert
- [ ] Videos in `mockTechniques.js` eingetragen
- [ ] Kategorien korrekt zugewiesen
- [ ] Tags hinzugefügt
- [ ] App getestet

---

## 🚀 Nach dem Setup

1. **App starten:**
   ```bash
   npm run dev
   ```

2. **Videos testen:**
   - Klicke auf eine Technik-Karte
   - Video sollte von Cloudflare laden
   - Prüfe Qualität und Ladezeit

3. **Deployment:**
   - Build erstellen: `npm run build`
   - Auf Cloudflare Pages deployen

---

## 💡 Tipps

### Video-Benennung
Benenne deine Videos konsistent:
- `c-guard-entry.mp4`
- `c-guard-sweep-1.mp4`
- `c-guard-defense.mp4`

### Video-Qualität
- **Empfohlen:** 1080p (Full HD)
- **Format:** MP4 (H.264)
- **Länge:** 30 Sekunden bis 5 Minuten

### Thumbnails
Cloudflare generiert automatisch Thumbnails. Du kannst aber auch eigene hochladen.

---

**Bei Fragen: Cloudflare Stream Dokumentation**  
https://developers.cloudflare.com/stream/
