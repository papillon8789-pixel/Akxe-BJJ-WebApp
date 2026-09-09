# 📢 Banner System - Anleitung

## Übersicht

Das Banner-System ermöglicht es Ihnen, dynamische Ankündigungen in der App anzuzeigen. Die Banner-Datei liegt im GitHub Repository und wird automatisch mit der App deployed.

## 🚀 Setup

### Banner-Datei Speicherort

**Datei:** `public/banner.json`  
**GitHub:** Im Repository unter `bjj-app/public/banner.json`  
**URL (Live):** `https://ihre-app.pages.dev/banner.json`

## 📱 Banner vom Handy bearbeiten

### Mit GitHub Mobile App (Empfohlen)

1. **GitHub App installieren** (iOS/Android)
2. **Repository öffnen:** Akxe-BJJ-WebApp
3. **Datei öffnen:** `bjj-app/public/banner.json`
4. **Bearbeiten:** Auf Stift-Icon tippen
5. **Änderungen speichern:** Commit & Push
6. **Fertig!** Cloudflare deployed automatisch (1-2 Minuten)

### Mit Browser (Alternative)

1. **GitHub öffnen:** https://github.com/papillon8789-pixel/Akxe-BJJ-WebApp
2. **Navigieren:** `bjj-app/public/banner.json`
3. **Bearbeiten:** Auf Stift-Icon klicken
4. **Commit:** Änderungen speichern
5. **Auto-Deploy:** Cloudflare deployed automatisch

## 📋 Banner-Datei Format

```json
{
  "active": true,
  "type": "info",
  "title": "🎄 Weihnachtsparty 2026",
  "message": "Unsere Weihnachtsparty findet am 20. Dezember um 18:00 Uhr statt!",
  "dismissible": true,
  "link": null,
  "expiresAt": null
}
```

## 📋 Parameter Erklärung

### `active` (erforderlich)
- **Typ:** `true` oder `false`
- **Beschreibung:** Steuert, ob der Banner angezeigt wird
- **Beispiel:** `"active": true` → Banner wird angezeigt

### `type` (erforderlich)
- **Typ:** String
- **Optionen:** `"info"`, `"success"`, `"warning"`, `"error"`
- **Beschreibung:** Bestimmt die Farbe und das Icon des Banners
  - `info` → Blau (ℹ️)
  - `success` → Grün (✓)
  - `warning` → Gelb (⚠️)
  - `error` → Rot (⚠️)

### `title` (optional)
- **Typ:** String oder `null`
- **Beschreibung:** Überschrift des Banners (fett dargestellt)
- **Beispiel:** `"title": "🎄 Weihnachtsparty"`

### `message` (erforderlich)
- **Typ:** String
- **Beschreibung:** Haupttext des Banners
- **Beispiel:** `"message": "Neue Videos verfügbar!"`

### `dismissible` (erforderlich)
- **Typ:** `true` oder `false`
- **Beschreibung:** Kann der User den Banner schließen?
- **Hinweis:** Geschlossene Banner werden im Browser gespeichert und nicht erneut angezeigt

### `link` (optional)
- **Typ:** String oder `null`
- **Beschreibung:** Macht den Banner klickbar
- **Beispiel:** `"link": "/takedown"` oder `"link": "https://example.com"`

### `expiresAt` (optional)
- **Typ:** ISO 8601 Datum-String oder `null`
- **Beschreibung:** Banner verschwindet automatisch nach diesem Datum
- **Beispiel:** `"expiresAt": "2026-12-21T00:00:00Z"`

## 💡 Beispiele

### Beispiel 1: Neue Videos Ankündigung
```json
{
  "active": true,
  "type": "success",
  "title": "🥋 Neue TakeDown Videos!",
  "message": "27 neue TakeDown Techniken sind jetzt verfügbar.",
  "dismissible": true,
  "link": null,
  "expiresAt": "2026-09-16T00:00:00Z"
}
```

### Beispiel 2: Event Ankündigung
```json
{
  "active": true,
  "type": "info",
  "title": "🎄 Weihnachtsparty 2026",
  "message": "Feiert mit uns am 20. Dezember um 18:00 Uhr im Gym!",
  "dismissible": true,
  "link": null,
  "expiresAt": "2026-12-21T00:00:00Z"
}
```

### Beispiel 3: Wartungshinweis
```json
{
  "active": true,
  "type": "warning",
  "title": "⚠️ Geplante Wartung",
  "message": "Am Sonntag, 15. September von 10-12 Uhr ist die App nicht verfügbar.",
  "dismissible": false,
  "link": null,
  "expiresAt": "2026-09-15T14:00:00Z"
}
```

### Beispiel 4: Wichtige Ankündigung mit Link
```json
{
  "active": true,
  "type": "error",
  "title": "🚨 Wichtig",
  "message": "Bitte aktualisiere dein Profil bis zum 30. September.",
  "dismissible": true,
  "link": "/profile",
  "expiresAt": "2026-09-30T23:59:59Z"
}
```

### Beispiel 5: Banner deaktivieren
```json
{
  "active": false,
  "type": "info",
  "title": "",
  "message": "",
  "dismissible": true,
  "link": null,
  "expiresAt": null
}
```

## 🔄 Workflow

### Banner aktivieren (vom Handy):
1. **GitHub App öffnen**
2. **Repository:** Akxe-BJJ-WebApp
3. **Datei öffnen:** `bjj-app/public/banner.json`
4. **Bearbeiten:** Auf Stift-Icon tippen
5. **Ändern:** `"active": false` zu `"active": true`
6. **Text anpassen:** title, message, etc.
7. **Commit:** "Banner aktiviert" als Nachricht
8. **Push:** Änderungen hochladen
9. ✅ **Fertig!** Banner erscheint in 1-2 Minuten

### Banner deaktivieren (vom Handy):
1. **GitHub App öffnen**
2. **Datei öffnen:** `bjj-app/public/banner.json`
3. **Bearbeiten:** `"active": true` zu `"active": false`
4. **Commit & Push**
5. ✅ **Fertig!** Banner verschwindet in 1-2 Minuten

## 🎨 Banner-Typen Vorschau

### Info (Blau)
Für allgemeine Informationen und Ankündigungen

### Success (Grün)
Für positive Nachrichten (neue Features, neue Videos)

### Warning (Gelb)
Für Warnungen und wichtige Hinweise

### Error (Rot)
Für dringende Mitteilungen und Probleme

## 📝 Tipps

1. **Emojis verwenden:** Machen den Banner auffälliger (🎄 🥋 ⚠️ 🎉)
2. **Kurz halten:** Maximal 1-2 Sätze für bessere Lesbarkeit
3. **Ablaufdatum setzen:** Verhindert, dass alte Banner ewig angezeigt werden
4. **Dismissible nutzen:** Lassen Sie User unwichtige Banner schließen
5. **Type passend wählen:** Farbe sollte zur Nachricht passen
6. **Commit-Nachricht:** Schreiben Sie aussagekräftige Commit-Nachrichten

## 🔧 Technische Details

- **Speicherort:** `public/banner.json` im GitHub Repository
- **Deployment:** Automatisch bei jedem Push (Cloudflare Pages)
- **Deploy-Zeit:** 1-2 Minuten nach Commit
- **Cache:** Banner wird ohne Cache geladen (immer aktuell)
- **Speicherung:** Geschlossene Banner werden im localStorage gespeichert
- **Versionskontrolle:** Alle Änderungen sind in Git nachvollziehbar

## ❓ Häufige Fragen

**Q: Wie schnell erscheint der Banner nach Änderung?**  
A: 1-2 Minuten nach dem Push (Cloudflare Deployment-Zeit)

**Q: Kann ich mehrere Banner gleichzeitig anzeigen?**  
A: Nein, aktuell nur ein Banner zur Zeit

**Q: Was passiert, wenn ich einen Fehler in der JSON mache?**  
A: Der Banner wird nicht angezeigt. Prüfen Sie die JSON-Syntax (z.B. mit jsonlint.com)

**Q: Kann ich HTML im Banner verwenden?**  
A: Nein, nur reiner Text und Emojis

**Q: Wie teste ich den Banner lokal?**  
A: Bearbeiten Sie `public/banner.json` lokal und starten Sie den Dev-Server neu

**Q: Kann ich die Änderungen rückgängig machen?**  
A: Ja! In GitHub können Sie zu früheren Versionen zurückkehren (Git History)

## 📱 GitHub Mobile App Tipps

- **Schnellzugriff:** Markieren Sie das Repository als Favorit
- **Benachrichtigungen:** Aktivieren Sie Push-Benachrichtigungen für Deployments
- **Offline-Bearbeitung:** Änderungen werden gespeichert und später synchronisiert
- **Vorschau:** GitHub zeigt JSON-Dateien formatiert an
