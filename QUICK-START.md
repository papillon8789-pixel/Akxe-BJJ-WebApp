# Training Analytics - Quick Start Guide

## ⚠️ Wichtig: Das Feature benötigt die Cloudflare Worker API

Die Fehlermeldung "Failed to add training log" erscheint, weil die API-Endpoints noch nicht deployed sind.

## 🚀 Schnellstart für lokales Testen

### Option 1: Mit lokalem Worker (Empfohlen)

1. **Öffne ein neues Terminal** und starte den Worker lokal:
```bash
cd bjj-app/workers
wrangler dev
```

2. **Erstelle die Datenbank-Tabelle lokal:**
```bash
wrangler d1 execute bjj-auth-db --local --file=./schema-training-logs.sql
```

3. **Prüfe deine `.env` Datei** (bjj-app/.env):
```
VITE_API_URL=http://localhost:8787
```

4. **Starte den Frontend Dev Server** (falls nicht schon läuft):
```bash
cd bjj-app
npm run dev
```

5. **Öffne:** http://localhost:5173/

### Option 2: Mit Production Worker (Schneller)

Wenn du bereits einen deployed Worker hast:

1. **Deploye die neue Datenbank-Tabelle:**
```bash
cd bjj-app/workers
wrangler d1 execute bjj-auth-db --file=./schema-training-logs.sql
```

2. **Deploye den aktualisierten Worker:**
```bash
wrangler deploy
```

3. **Prüfe deine `.env` Datei** (bjj-app/.env):
```
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
```

4. **Starte den Frontend Dev Server:**
```bash
cd bjj-app
npm run dev
```

5. **Öffne:** http://localhost:5173/

## 🔍 Troubleshooting

### "Failed to add training log"

**Ursache:** API-Endpoints sind nicht erreichbar

**Lösung:**
1. Prüfe ob Worker läuft: `wrangler dev` oder deployed ist
2. Prüfe `.env` Datei: `VITE_API_URL` muss korrekt sein
3. Prüfe Browser Console (F12) für detaillierte Fehlermeldungen
4. Prüfe ob Datenbank-Tabelle existiert:
```bash
wrangler d1 execute bjj-auth-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name='training_logs';"
```

### "Unauthorized" Fehler

**Ursache:** JWT Token ist ungültig oder fehlt

**Lösung:**
1. Logout und erneut einloggen
2. Prüfe ob du als Admin-User eingeloggt bist
3. Prüfe Browser Console für Token-Fehler

### Worker startet nicht lokal

**Ursache:** Wrangler nicht installiert oder konfiguriert

**Lösung:**
```bash
npm install -g wrangler
wrangler login
```

## 📝 Nächste Schritte

Nach erfolgreichem Setup:

1. ✅ Login als Admin-User
2. ✅ Klicke auf "Training Analytics" (grüner Button)
3. ✅ Klicke "Add Training Session"
4. ✅ Fülle das Formular aus und klicke "Add Training Log"
5. ✅ Sieh dir die Analytics Widgets an
6. ✅ Teste den Month Filter
7. ✅ Teste die Delete-Funktion

## 🎯 Für Production Deployment

Siehe [`TRAINING-ANALYTICS-SETUP.md`](TRAINING-ANALYTICS-SETUP.md) für vollständige Deployment-Anleitung.

## 💡 Tipp

Wenn du nur die UI testen möchtest ohne Backend, kannst du Mock-Daten direkt im Code hinzufügen. Lass mich wissen, wenn du das möchtest!
