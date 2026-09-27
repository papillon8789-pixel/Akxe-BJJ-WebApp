# Events direkt auf GitHub bearbeiten 🎉

## Schnellanleitung

Du kannst Events jetzt genauso einfach wie den Banner direkt auf GitHub bearbeiten!

### 📍 Datei-Locations
**Events**: `public/data/events.json`
**Emoji Library**: `public/data/emoji-library.txt`

### 🔗 Direkte Links
📝 **Events bearbeiten**: https://github.com/papillon8789-pixel/Akxe-BJJ-WebApp/blob/main/public/data/events.json
😀 **Emoji Library**: https://github.com/papillon8789-pixel/Akxe-BJJ-WebApp/blob/main/public/data/emoji-library.txt

---

## ✏️ So bearbeitest du Events auf GitHub

### 1. Öffne die Datei
- Gehe zu deinem Repository auf GitHub
- Navigiere zu: `public/data/events.json`
- Oder nutze den Direktlink oben

### 2. Klicke auf den Stift (Edit)
- Oben rechts in der Dateiansicht
- Icon: ✏️ (Bleistift)

### 3. Bearbeite die Events
- Füge neue Events hinzu
- Ändere bestehende Events
- Lösche alte Events

### 4. Speichere die Änderungen
- Scrolle nach unten
- Gib eine Commit-Message ein (z.B. "Add New Year Event")
- Klicke auf "Commit changes"

### 5. Fertig! 🎉
- Cloudflare Pages deployt automatisch
- Nach ~2 Minuten ist die Änderung live

---

## 📋 Event-Struktur

Jedes Event hat diese Felder:

```json
{
  "id": 1,
  "title": "Event Name",
  "date": "2024-12-12",
  "time": "19:30",
  "description": "Event Beschreibung",
  "icon": "🎄",
  "color": "red"
}
```

### Feld-Erklärung

| Feld | Beschreibung | Beispiel |
|------|--------------|----------|
| `id` | Eindeutige Nummer (1, 2, 3, ...) | `1` |
| `title` | Event-Name | `"Xmas Party"` |
| `date` | Datum (YYYY-MM-DD) | `"2024-12-12"` |
| `time` | Uhrzeit (HH:MM) | `"19:30"` |
| `description` | Event-Details | `"OpenMat + Dinner"` |
| `icon` | Emoji-Icon | `"🎄"` |
| `color` | Farbe (siehe unten) | `"red"` |

### Verfügbare Farben

- `"red"` - Rot (Parties, Special Events)
- `"gold"` - Gold (Premium Events, Championships)
- `"blue"` - Blau (Seminars, Workshops)
- `"green"` - Grün (Training Camps, Open Mats)
- `"purple"` - Lila (Competitions, Tournaments)

### Emoji-Vorschläge

**📖 Vollständige Emoji-Library**: [`emoji-library.txt`](https://github.com/papillon8789-pixel/Akxe-BJJ-WebApp/blob/main/public/data/emoji-library.txt)

**Beliebte Emojis**:
- 🎄 Weihnachten | 🎊 Neujahr | 🎉 Parties
- 🥋 Training | 🏆 Wettkämpfe | 🏅 Erfolge
- 🍕 Social Events | 🍻 Drinks | 🥂 Cheers
- 📚 Workshops | 🎓 Graduierung | 💡 Seminare
- 🌟 Special Events | 🔥 Intensive Camps | 💪 Power
- 🏔️ Outdoor | ⛺ Camping | 🏖️ Beach
- 🦅 AKXE Eagle | 🐉 Dragon | 🦁 Lion

**💡 Tipp**: Öffne die [`emoji-library.txt`](https://github.com/papillon8789-pixel/Akxe-BJJ-WebApp/blob/main/public/data/emoji-library.txt) und kopiere einfach das gewünschte Emoji!

---

## 📝 Beispiele

### Beispiel 1: Ein Event

```json
[
  {
    "id": 1,
    "title": "Xmas Party",
    "date": "2024-12-12",
    "time": "19:30",
    "description": "Xmas OpenMat + Dinner/Drinks",
    "icon": "🎄",
    "color": "red"
  }
]
```

### Beispiel 2: Mehrere Events

```json
[
  {
    "id": 1,
    "title": "Xmas Party",
    "date": "2024-12-12",
    "time": "19:30",
    "description": "Xmas OpenMat + Dinner/Drinks",
    "icon": "🎄",
    "color": "red"
  },
  {
    "id": 2,
    "title": "New Year Open Mat",
    "date": "2025-01-01",
    "time": "10:00",
    "description": "Start the year with training!",
    "icon": "🎊",
    "color": "gold"
  },
  {
    "id": 3,
    "title": "IBJJF Munich Open",
    "date": "2025-02-15",
    "time": "08:00",
    "description": "Team competition - Register by Feb 1st",
    "icon": "🏆",
    "color": "purple"
  }
]
```

### Beispiel 3: Keine Events (leere Liste)

```json
[]
```

---

## ⚠️ Wichtige Hinweise

### ✅ DO's (Mach das)

- **Kommas zwischen Events** - Jedes Event außer dem letzten braucht ein Komma
- **Anführungszeichen** - Alle Texte in `"Anführungszeichen"`
- **Datum-Format** - Immer `YYYY-MM-DD` (z.B. `2024-12-25`)
- **Zeit-Format** - Immer `HH:MM` im 24h-Format (z.B. `19:30`)
- **IDs eindeutig** - Jedes Event braucht eine eigene ID (1, 2, 3, ...)

### ❌ DON'Ts (Vermeide das)

- ❌ Vergessene Kommas zwischen Events
- ❌ Falsches Datum-Format (`25-12-2024` oder `12/25/2024`)
- ❌ Falsche Zeit (`7:30 PM` statt `19:30`)
- ❌ Fehlende Anführungszeichen
- ❌ Doppelte IDs

---

## 🔍 JSON Syntax-Checker

Falls du unsicher bist, ob dein JSON korrekt ist:
- Kopiere den Inhalt
- Gehe zu: https://jsonlint.com/
- Füge ein und klicke "Validate JSON"
- Grüner Haken = Alles gut! ✅
- Roter Fehler = Syntax-Problem ❌

---

## 🚀 Automatische Features

### Vergangene Events werden automatisch ausgeblendet
- Du musst alte Events nicht löschen
- Sie verschwinden automatisch nach dem Datum
- Aber du kannst sie trotzdem löschen für Übersichtlichkeit

### Maximum 3 Events werden angezeigt
- Auch wenn du mehr hinzufügst
- Die nächsten 3 Events werden gezeigt
- Sortiert nach Datum (nächstes zuerst)

### Section verschwindet automatisch
- Wenn keine kommenden Events existieren
- Keine leere Section sichtbar
- Sauberes UI

---

## 🎯 Workflow

```
1. GitHub öffnen
   ↓
2. events.json bearbeiten
   ↓
3. Änderungen committen
   ↓
4. Cloudflare deployt automatisch (~2 Min)
   ↓
5. Live auf primo-bjj.com! 🎉
```

---

## 💡 Tipps

### Event hinzufügen
1. Kopiere ein bestehendes Event
2. Ändere die ID (nächste freie Nummer)
3. Passe alle Felder an
4. **Wichtig**: Komma nach dem vorherigen Event nicht vergessen!

### Event löschen
1. Lösche das komplette Event-Objekt `{ ... }`
2. Entferne das Komma davor oder danach
3. Achte darauf, dass die JSON-Struktur korrekt bleibt

### Event bearbeiten
1. Finde das Event anhand der ID oder des Titels
2. Ändere die gewünschten Felder
3. Speichere

---

## 🆘 Hilfe bei Problemen

### Events werden nicht angezeigt?
- Prüfe das Datum (muss in der Zukunft liegen)
- Prüfe das Datum-Format (`YYYY-MM-DD`)
- Validiere JSON auf jsonlint.com

### Deployment-Fehler?
- Prüfe die JSON-Syntax
- Schau in Cloudflare Pages Dashboard nach Fehlern
- Kontaktiere den Developer

### Falsche Farben?
- Prüfe Schreibweise: `"red"`, `"gold"`, `"blue"`, `"green"`, `"purple"`
- Kleinbuchstaben verwenden
- In Anführungszeichen

---

## 📞 Support

Bei Fragen oder Problemen:
- Siehe auch: [`EVENTS-MANAGEMENT.md`](EVENTS-MANAGEMENT.md) für technische Details
- Oder kontaktiere den Development-Team

---

**Viel Erfolg beim Event-Management! 🥋**
