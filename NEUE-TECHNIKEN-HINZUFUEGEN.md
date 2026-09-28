# Neue Techniken hinzufügen - Anleitung

Diese Anleitung erklärt, wie du neue Techniken zur BJJ App hinzufügst, sodass sie automatisch ganz oben angezeigt werden und das "NEW!" Badge erhalten.

## 🎯 Wichtige Regeln

1. **Neue Techniken IMMER ganz oben einfügen** (direkt nach `export const mockTechniques = [`)
2. **IDs sequentiell vergeben** (neue Technik = ID 1, alle anderen IDs um +1 erhöhen)
3. **Aktuelles Datum verwenden** für `dateAdded` (Format: "YYYY-MM-DD")
4. **Videos im Cloudflare R2 Bucket hochladen** vor dem Hinzufügen

## 📝 Schritt-für-Schritt Anleitung

### Schritt 1: Videos hochladen
1. Lade die neuen Video-Dateien in den Cloudflare R2 Bucket hoch
2. Bucket URL: `https://pub-333effaca17f49c9b80b42fa7b22c347.r2.dev`
3. Dateinamen sollten beschreibend sein, z.B. `DeepHalf_Technique_1.mp4`

### Schritt 2: Techniken in mockTechniques.js hinzufügen

Öffne die Datei: `bjj-app/src/data/mockTechniques.js`

**Beispiel:** Du möchtest 3 neue "X Guard" Techniken hinzufügen:

```javascript
export const mockTechniques = [
  // ⬇️ NEUE TECHNIKEN HIER EINFÜGEN (ID 1, 2, 3)
  {
    "id": "1",
    "title": "X Guard - Technique 1",
    "description": "Beschreibung der Technik",
    "category": "guard",
    "subCategory": "X Guard",
    "videoId": "XGuard_Technique_1.mp4",
    "videoUrl": `${R2_BASE_URL}/XGuard_Technique_1.mp4`,
    "thumbnail": "https://via.placeholder.com/400x225/1a1a1a/e63946?text=X%20Guard%201",
    "duration": null,
    "tags": [
      "X Guard",
      "Guard",
      "Sweep"
    ],
    "dateAdded": "2026-09-28",  // ⬅️ AKTUELLES DATUM!
    "month": "2026-09",
    "isLegacy": false,
    "isFavorite": false,
    "isDownloaded": false,
    "isBookmarked": false,
    "viewCount": 0,
    "notes": ""
  },
  {
    "id": "2",
    "title": "X Guard - Technique 2",
    // ... (gleiche Struktur)
    "dateAdded": "2026-09-28",  // ⬅️ AKTUELLES DATUM!
  },
  {
    "id": "3",
    "title": "X Guard - Technique 3",
    // ... (gleiche Struktur)
    "dateAdded": "2026-09-28",  // ⬅️ AKTUELLES DATUM!
  },
  // ⬇️ ALTE TECHNIKEN (IDs müssen um +3 erhöht werden)
  {
    "id": "4",  // ⬅️ War vorher ID "1"
    "title": "Deep Half - Technique 1",
    "dateAdded": "2026-09-28",
    // ...
  },
  // ... rest der Techniken
];
```

### Schritt 3: IDs aller alten Techniken anpassen

**WICHTIG:** Alle bestehenden Techniken müssen neue IDs bekommen!

- Wenn du 3 neue Techniken hinzufügst (IDs 1-3)
- Dann müssen alle alten Techniken um +3 verschoben werden
- Alte ID 1 → Neue ID 4
- Alte ID 2 → Neue ID 5
- usw.

**Tipp:** Verwende das `reorder.mjs` Script (siehe unten)

### Schritt 4: Neue Unterkategorie hinzufügen (falls nötig)

Wenn die neue Technik eine neue Unterkategorie benötigt:

```javascript
export const subCategories = {
  guard: ['Z Guard', '50/50 Guard', 'Octopus Guard', 'Half-lasso Guard', 'Spider Lasso', 'Deep Half', 'X Guard'],  // ⬅️ 'X Guard' hinzugefügt
  // ...
};
```

### Schritt 5: Changelog aktualisieren

Füge einen neuen Eintrag in `bjj-app/changelog.md` hinzu:

```markdown
## [2026-09-28] - X Guard Techniken hinzugefügt

### Hinzugefügt
- **X Guard Kategorie** - Neue Guard-Unterkategorie mit 3 Techniken:
  - X Guard - Technique 1 (ID 1)
  - X Guard - Technique 2 (ID 2)
  - X Guard - Technique 3 (ID 3)
  - Videos: `XGuard_Technique_1.mp4` bis `XGuard_Technique_3.mp4`

### Geändert
- Alle bestehenden Techniken-IDs um +3 verschoben
- **Gesamt: 80 Techniken** in der Datenbank (vorher 77)
```

## 🤖 Automatisches ID-Renummerieren (Empfohlen)

Statt alle IDs manuell zu ändern, kannst du das `reorder.mjs` Script verwenden:

1. Füge die neuen Techniken am **Ende** der Datei hinzu (mit hohen IDs wie 999, 1000, 1001)
2. Führe das Script aus:
   ```bash
   cd bjj-app
   node reorder.mjs
   ```
3. Das Script verschiebt die neuesten Techniken automatisch nach oben und nummeriert alle IDs neu

## ✅ Das "NEW!" Badge

Das Badge wird **automatisch** angezeigt für die Kategorie mit dem neuesten `dateAdded` Datum!

- Keine manuelle Konfiguration nötig
- Badge verschwindet automatisch, wenn neuere Techniken hinzugefügt werden
- Funktioniert über die `getNewestCategory()` Funktion in `App.jsx`

## 🚀 Git Commit & Push

```bash
cd bjj-app
git add -A
git commit -m "Add X Guard techniques (3 new techniques, IDs 1-3)"
git push
```

## 📋 Checkliste

- [ ] Videos im Cloudflare R2 Bucket hochgeladen
- [ ] Neue Techniken ganz oben in `mockTechniques.js` eingefügt
- [ ] Alle IDs korrekt nummeriert (neue Techniken = 1, 2, 3, ...)
- [ ] `dateAdded` auf aktuelles Datum gesetzt
- [ ] Neue Unterkategorie in `subCategories` hinzugefügt (falls nötig)
- [ ] Changelog aktualisiert
- [ ] Git commit & push
- [ ] App testen: Neue Techniken erscheinen ganz oben mit "NEW!" Badge

## 🎨 Felder-Erklärung

| Feld | Beschreibung | Beispiel |
|------|--------------|----------|
| `id` | Eindeutige ID (String) | `"1"` |
| `title` | Titel der Technik | `"X Guard - Technique 1"` |
| `description` | Kurze Beschreibung | `"Sweep from X Guard"` |
| `category` | Hauptkategorie (lowercase) | `"guard"`, `"pass"`, `"sweep"`, etc. |
| `subCategory` | Unterkategorie | `"X Guard"`, `"Deep Half"`, etc. |
| `videoId` | Dateiname des Videos | `"XGuard_Technique_1.mp4"` |
| `videoUrl` | Vollständige URL | `` `${R2_BASE_URL}/XGuard_Technique_1.mp4` `` |
| `thumbnail` | Placeholder Thumbnail | `"https://via.placeholder.com/..."` |
| `tags` | Array von Tags | `["X Guard", "Guard", "Sweep"]` |
| `dateAdded` | Datum hinzugefügt | `"2026-09-28"` (YYYY-MM-DD) |
| `month` | Monat hinzugefügt | `"2026-09"` (YYYY-MM) |

## 💡 Tipps

- **Konsistente Benennung:** Verwende einheitliche Dateinamen für Videos
- **Beschreibungen:** Füge detaillierte Beschreibungen hinzu (nicht nur "technique from PRIMO BJJ Training")
- **Tags:** Verwende relevante Tags für bessere Filterung
- **Testen:** Teste die App lokal vor dem Push (`npm run dev`)

## 🆘 Probleme?

- **Videos werden nicht angezeigt:** Überprüfe die R2 Bucket URL und Dateinamen
- **Badge erscheint nicht:** Stelle sicher, dass `dateAdded` das neueste Datum ist
- **Techniken nicht ganz oben:** IDs müssen sequentiell sein (1, 2, 3, ...)
