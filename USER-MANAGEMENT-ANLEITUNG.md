# 👥 User Management Anleitung

## Übersicht

Die PRIMO BJJ App verwendet ein einfaches E-Mail-basiertes Zugriffssystem. Erlaubte Nutzer werden in einer JSON-Datei im GitHub Repository verwaltet.

---

## 📁 Datei-Struktur

**Datei:** `public/allowed-users.json`

```json
{
  "users": [
    {
      "email": "user@example.com",
      "validUntil": "2027-12-31",
      "paidMonths": 12,
      "addedDate": "2026-09-11",
      "notes": "Jahresabo"
    }
  ],
  "lastUpdated": "2026-09-11T07:51:00Z"
}
```

---

## ✅ Neuen Nutzer hinzufügen

### Option 1: Mit GitHub Desktop (Empfohlen)

1. **Öffne GitHub Desktop**
2. **Repository öffnen:** `Akxe-BJJ-WebApp`
3. **Datei öffnen:** `bjj-app/public/allowed-users.json`
4. **Neuen Nutzer hinzufügen:**
   ```json
   {
     "email": "neuer.nutzer@example.com",
     "validUntil": "2027-09-11",
     "paidMonths": 12,
     "addedDate": "2026-09-11",
     "notes": "Jahresabo - 20€ bezahlt"
   }
   ```
5. **Speichern** → **Commit** → **Push to origin**
6. **Fertig!** Cloudflare deployed automatisch (1-2 Minuten)

### Option 2: Mit GitHub Mobile App

1. **GitHub App öffnen**
2. **Repository:** `Akxe-BJJ-WebApp`
3. **Navigiere zu:** `bjj-app/public/allowed-users.json`
4. **Bearbeiten** (Stift-Icon)
5. **Nutzer hinzufügen** (siehe JSON-Format oben)
6. **Commit changes**
7. **Fertig!** Auto-Deployment startet

### Option 3: Direkt auf GitHub.com

1. Gehe zu: https://github.com/papillon8789-pixel/Akxe-BJJ-WebApp
2. Navigiere zu: `bjj-app/public/allowed-users.json`
3. Klicke auf **Edit** (Stift-Icon)
4. Füge neuen Nutzer hinzu
5. **Commit changes**

---

## 📅 Ablaufdatum berechnen

### Beispiele:

**1 Monat (2€):**
- Heute: 2026-09-11
- Gültig bis: 2026-10-11
- `"validUntil": "2026-10-11"`

**3 Monate (6€):**
- Heute: 2026-09-11
- Gültig bis: 2026-12-11
- `"validUntil": "2026-12-11"`

**12 Monate (24€):**
- Heute: 2026-09-11
- Gültig bis: 2027-09-11
- `"validUntil": "2027-09-11"`

**Lebenslang:**
- `"validUntil": "2099-12-31"`

---

## 🔄 Nutzer verlängern

Finde den Nutzer in der Liste und ändere das `validUntil` Datum:

**Vorher:**
```json
{
  "email": "user@example.com",
  "validUntil": "2026-12-31",
  "paidMonths": 3,
  "addedDate": "2026-09-11",
  "notes": "3 Monate"
}
```

**Nachher (verlängert um 12 Monate):**
```json
{
  "email": "user@example.com",
  "validUntil": "2027-12-31",
  "paidMonths": 15,
  "addedDate": "2026-09-11",
  "notes": "Verlängert um 12 Monate - 24€ bezahlt"
}
```

---

## ❌ Nutzer entfernen

Lösche einfach den kompletten Nutzer-Block aus der JSON-Datei:

```json
{
  "users": [
    // Diesen Block löschen:
    {
      "email": "zu-loeschen@example.com",
      "validUntil": "2026-12-31",
      ...
    }
  ]
}
```

---

## 🔍 Nutzer-Status prüfen

### Aktive Nutzer:
- `validUntil` Datum liegt in der Zukunft
- Nutzer kann sich einloggen

### Abgelaufene Nutzer:
- `validUntil` Datum liegt in der Vergangenheit
- Nutzer bekommt Fehlermeldung: "Dein Zugang ist abgelaufen"

### Nicht existierende Nutzer:
- E-Mail nicht in der Liste
- Nutzer bekommt Fehlermeldung: "E-Mail nicht berechtigt"

---

## 💰 Zahlungs-Workflow

### Manueller Workflow:

1. **Nutzer überweist Geld**
   - Betrag: z.B. 20€
   - Betreff: E-Mail-Adresse

2. **Du siehst Zahlung auf Konto**
   - Prüfe E-Mail im Betreff

3. **Füge Nutzer zur Liste hinzu**
   - Berechne `validUntil` Datum (20€ = 10 Monate)
   - Füge zur `allowed-users.json` hinzu
   - Commit & Push

4. **Nutzer wird benachrichtigt**
   - Per E-Mail: "Dein Zugang ist jetzt aktiv"
   - Nutzer kann sich einloggen

---

## 📊 Beispiel-Datei mit mehreren Nutzern

```json
{
  "users": [
    {
      "email": "demo@primo-bjj.com",
      "validUntil": "2027-12-31",
      "paidMonths": 12,
      "addedDate": "2026-09-11",
      "notes": "Demo Account"
    },
    {
      "email": "trainer@primo-bjj.com",
      "validUntil": "2099-12-31",
      "paidMonths": 999,
      "addedDate": "2026-09-11",
      "notes": "Trainer - Lebenslang"
    },
    {
      "email": "student1@example.com",
      "validUntil": "2027-03-11",
      "paidMonths": 6,
      "addedDate": "2026-09-11",
      "notes": "6 Monate - 12€ bezahlt"
    },
    {
      "email": "student2@example.com",
      "validUntil": "2026-10-11",
      "paidMonths": 1,
      "addedDate": "2026-09-11",
      "notes": "1 Monat Test - 2€ bezahlt"
    }
  ],
  "lastUpdated": "2026-09-11T07:51:00Z"
}
```

---

## 🚀 Deployment

Nach jeder Änderung an `allowed-users.json`:

1. **Commit & Push** zu GitHub
2. **Cloudflare Pages** deployed automatisch
3. **Wartezeit:** 1-2 Minuten
4. **Änderungen sind live!**

---

## 🔒 Sicherheit

### Was ist sicher:
- ✅ Nutzer müssen E-Mail kennen
- ✅ Ablaufdatum wird geprüft
- ✅ Session wird in localStorage gespeichert

### Was ist NICHT sicher:
- ❌ E-Mail-Liste ist öffentlich im Repository sichtbar
- ❌ Keine Passwörter
- ❌ Kann umgangen werden (technisch versierte Nutzer)

### Für mehr Sicherheit:
- Wechsel zu **Cloudflare Workers + KV Storage** (Option 2)
- Implementiere echte Authentifizierung mit Passwörtern

---

## 📱 Nutzer-Erfahrung

### Erster Login:
1. Nutzer öffnet App
2. Sieht Login-Screen
3. Gibt E-Mail ein
4. Klickt "Zugang prüfen"
5. Bei Erfolg: App wird angezeigt
6. Session wird gespeichert

### Nächster Besuch:
1. Nutzer öffnet App
2. Automatisch eingeloggt (localStorage)
3. Direkt zur App

### Abgelaufener Zugang:
1. Nutzer öffnet App
2. Fehlermeldung: "Dein Zugang ist abgelaufen"
3. Muss verlängern

---

## 🛠️ Troubleshooting

### Problem: Nutzer kann sich nicht einloggen
**Lösung:**
1. Prüfe E-Mail-Schreibweise in `allowed-users.json`
2. Prüfe `validUntil` Datum (Format: YYYY-MM-DD)
3. Prüfe ob Deployment erfolgreich war
4. Nutzer soll Browser-Cache leeren

### Problem: Änderungen werden nicht angezeigt
**Lösung:**
1. Warte 2-3 Minuten nach Push
2. Prüfe Cloudflare Pages Deployment Status
3. Hard-Refresh im Browser (Ctrl+Shift+R)

### Problem: JSON-Fehler
**Lösung:**
1. Prüfe JSON-Syntax (Kommas, Klammern)
2. Nutze JSON-Validator: https://jsonlint.com/
3. Stelle vorherige Version wieder her

---

## 📞 Support

Bei Fragen oder Problemen:
- **E-Mail:** info@primo-bjj.com
- **GitHub Issues:** https://github.com/papillon8789-pixel/Akxe-BJJ-WebApp/issues

---

**Erstellt:** 2026-09-11  
**Version:** 1.0
