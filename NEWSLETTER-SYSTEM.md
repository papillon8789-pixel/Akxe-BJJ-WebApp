# Newsletter System - PRIMO BJJ App

## Übersicht

Das Newsletter-System ermöglicht es Admins, E-Mails an alle aktiven User zu versenden. Es beinhaltet Rate Limiting, Logging und eine benutzerfreundliche Admin-Oberfläche.

## Features

### 1. **Admin Newsletter Button**
- Prominent platziert im Admin Dashboard Header
- Nur für Admins sichtbar
- Öffnet Modal mit Newsletter-Vorschau

### 2. **Newsletter Modal**
- **Vorschau**: Zeigt Betreff und Empfängeranzahl
- **Email Preview**: Vollständige HTML-Vorschau des Newsletter-Inhalts
- **Bestätigung**: Zwei-Schritt-Prozess (Modal öffnen → Bestätigen)
- **Rate Limiting Warnung**: Hinweis auf 1 Newsletter/Stunde Limit

### 3. **API Endpoints**

#### `POST /api/admin/send-newsletter`
Sendet Newsletter an alle aktiven User.

**Request:**
```json
{
  "subject": "Newsletter Betreff",
  "htmlContent": "<html>...</html>"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Newsletter sent to 25 users",
  "recipientCount": 25
}
```

**Fehler:**
- `401`: Unauthorized (kein Token)
- `403`: Admin access required
- `429`: Rate limit exceeded (max 1/Stunde)
- `400`: Keine aktiven User gefunden
- `500`: Email-Versand fehlgeschlagen

#### `GET /api/admin/newsletter-history`
Holt die letzten 10 Newsletter-Versendungen.

**Response:**
```json
{
  "success": true,
  "newsletters": [
    {
      "id": 1,
      "sent_by": "admin@primo-bjj.com",
      "subject": "🎉 Neue Features",
      "recipient_count": 25,
      "created_at": "2026-10-25T08:00:00.000Z"
    }
  ]
}
```

### 4. **Rate Limiting**
- **Limit**: 1 Newsletter pro Stunde
- **Implementierung**: Database-basiert (newsletter_logs Tabelle)
- **Fehler**: HTTP 429 mit verbleibenden Minuten

### 5. **Logging**
Jeder Newsletter-Versand wird geloggt:
- Wer hat versendet (`sent_by`)
- Betreff (`subject`)
- Anzahl Empfänger (`recipient_count`)
- Zeitstempel (`created_at`)

### 6. **Sicherheit**
- ✅ Nur Admins können Newsletter versenden
- ✅ JWT Token Validierung
- ✅ Rate Limiting (1/Stunde)
- ✅ Logging aller Versendungen
- ✅ Admin-Benachrichtigung bei Versand

## Newsletter-Inhalt (Aktuell)

**Betreff:** 🎉 Neue Features in der PRIMO BJJ App!

**Inhalt:**
1. **Training Analytics** - Jetzt für alle User verfügbar
   - Trainingskalender
   - Gi vs NoGi Statistiken
   - Kalorien tracking
   - Zeitstatistiken
   - Monatliche Übersichten

2. **4 neue Sumi Gaeshi TakeDown Videos**
   - Vom Mittwoch-Training
   - Verschiedene Varianten und Troubleshooting

3. **Call-to-Action**: Link zur App

## Database Schema

```sql
CREATE TABLE newsletter_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sent_by TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipient_count INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_newsletter_logs_created ON newsletter_logs(created_at);
CREATE INDEX idx_newsletter_logs_sent_by ON newsletter_logs(sent_by);
```

## Setup & Deployment

### 1. Database Migration
```bash
# Führe Migration aus
wrangler d1 execute bjj-auth-db --file=./workers/migrations/add-newsletter-logs.sql
```

### 2. Environment Variables
Stelle sicher, dass folgende Variablen gesetzt sind:
- `RESEND_API_KEY`: Resend API Key für Email-Versand
- `JWT_SECRET`: JWT Secret für Token-Validierung
- `FRONTEND_URL`: URL der Frontend-App (für Links)

### 3. Deploy Worker
```bash
cd workers
wrangler deploy
```

## Verwendung

### Als Admin:
1. Öffne Admin Dashboard
2. Klicke auf "Send Newsletter" Button (oben rechts)
3. Überprüfe Vorschau im Modal
4. Klicke "Newsletter versenden"
5. Warte auf Bestätigung

### Rate Limit beachten:
- Nur 1 Newsletter pro Stunde
- Bei Versuch innerhalb der Stunde: Fehlermeldung mit verbleibenden Minuten

## Email Template Anpassen

Die Newsletter-Vorlage befindet sich in:
`src/components/AdminDashboard.jsx` → `handleSendNewsletter()` → `htmlContent`

**Struktur:**
```javascript
const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        /* CSS Styles */
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">🦅 PRIMO BJJ</div>
        <div class="content">
          <!-- Newsletter Content -->
        </div>
        <div class="footer">© 2026 PRIMO BJJ</div>
      </div>
    </body>
  </html>
`;
```

## Monitoring

### Newsletter History
- Abrufbar via API: `GET /api/admin/newsletter-history`
- Zeigt letzte 10 Newsletter
- Enthält: Sender, Betreff, Empfängeranzahl, Zeitstempel

### Admin Notifications
- Jeder Newsletter-Versand erstellt Admin-Benachrichtigung
- Sichtbar im Admin Dashboard (wenn implementiert)

## Troubleshooting

### Newsletter wird nicht versendet
1. **Prüfe Admin-Rechte**: User muss `is_admin = 1` haben
2. **Prüfe Rate Limit**: Warte 1 Stunde seit letztem Newsletter
3. **Prüfe aktive User**: Mindestens 1 aktiver User muss existieren
4. **Prüfe Resend API Key**: Muss gültig sein

### Email kommt nicht an
1. **Prüfe Resend Dashboard**: Wurden Emails versendet?
2. **Prüfe Spam-Ordner**: Emails könnten als Spam markiert sein
3. **Prüfe Email-Adressen**: Müssen gültig sein in `allowed_users`

### Rate Limit Fehler
- **Lösung**: Warte bis Rate Limit abgelaufen ist
- **Workaround**: Manuell in DB löschen (nur für Testing!)
  ```sql
  DELETE FROM newsletter_logs WHERE created_at > datetime('now', '-1 hour');
  ```

## Best Practices

1. **Teste zuerst**: Sende Test-Newsletter an dich selbst
2. **Timing**: Versende zu optimalen Zeiten (z.B. Abends)
3. **Inhalt**: Halte Newsletter kurz und relevant
4. **Frequenz**: Nicht zu oft versenden (max 1-2 pro Woche)
5. **Tracking**: Überwache Öffnungsraten in Resend Dashboard

## Zukünftige Erweiterungen

- [ ] Newsletter Templates (mehrere Vorlagen)
- [ ] Geplante Newsletter (Scheduling)
- [ ] Segmentierung (z.B. nur Gi-User)
- [ ] A/B Testing
- [ ] Öffnungsraten-Tracking
- [ ] Unsubscribe-Funktion
- [ ] Newsletter-Archiv für User
