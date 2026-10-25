# Newsletter System Deployment Guide

## Schritt-für-Schritt Anleitung

### 1. Database Migration

Führe die Migration aus, um die `newsletter_logs` Tabelle zu erstellen:

```bash
# Im bjj-app Verzeichnis
wrangler d1 execute bjj-auth-db --file=./workers/migrations/add-newsletter-logs.sql
```

**Erwartete Ausgabe:**
```
🌀 Executing on bjj-auth-db (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
🚣 Executed 3 commands in 0.123ms
```

### 2. Verifiziere die Tabelle

Prüfe, ob die Tabelle korrekt erstellt wurde:

```bash
wrangler d1 execute bjj-auth-db --command "SELECT name FROM sqlite_master WHERE type='table' AND name='newsletter_logs';"
```

**Erwartete Ausgabe:**
```
┌──────────────────┐
│ name             │
├──────────────────┤
│ newsletter_logs  │
└──────────────────┘
```

### 3. Worker Deployment

Deploye den aktualisierten Worker:

```bash
cd workers
wrangler deploy
```

**Erwartete Ausgabe:**
```
 ⛅️ wrangler 3.x.x
------------------
Total Upload: xx.xx KiB / gzip: xx.xx KiB
Uploaded auth-api (x.xx sec)
Published auth-api (x.xx sec)
  https://auth-api.your-subdomain.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 4. Frontend Build & Deploy

Baue und deploye das Frontend (falls nötig):

```bash
cd ..
npm run build
# Deploy zu deinem Hosting (z.B. Cloudflare Pages)
```

### 5. Teste das Newsletter-System

#### Test 1: Admin Dashboard öffnen
1. Logge dich als Admin ein
2. Öffne das Admin Dashboard
3. Verifiziere, dass der "Send Newsletter" Button sichtbar ist

#### Test 2: Newsletter Modal
1. Klicke auf "Send Newsletter"
2. Prüfe, dass das Modal sich öffnet
3. Verifiziere die Vorschau:
   - Betreff: "🎉 Neue Features in der PRIMO BJJ App!"
   - Empfängeranzahl wird angezeigt
   - Email-Vorschau ist sichtbar

#### Test 3: Newsletter versenden (Optional - nur für Testing!)
⚠️ **ACHTUNG**: Dies versendet echte Emails an alle aktiven User!

Für Testing empfohlen:
1. Erstelle einen Test-User in der DB
2. Setze alle anderen User auf `status = 'suspended'`
3. Versende Newsletter
4. Prüfe, dass Email ankommt
5. Setze User-Status zurück

```sql
-- Test-Setup
UPDATE allowed_users SET status = 'suspended' WHERE email != 'test@example.com';

-- Nach Test: Zurücksetzen
UPDATE allowed_users SET status = 'active' WHERE valid_until > datetime('now');
```

#### Test 4: Rate Limiting
1. Versende einen Newsletter
2. Versuche sofort einen zweiten zu versenden
3. Erwartete Fehlermeldung: "Rate limit: Please wait X minutes..."

#### Test 5: Newsletter History
Teste den History-Endpoint:

```bash
curl -X GET "https://auth-api.your-subdomain.workers.dev/api/admin/newsletter-history" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Erwartete Response:**
```json
{
  "success": true,
  "newsletters": [
    {
      "id": 1,
      "sent_by": "admin@primo-bjj.com",
      "subject": "🎉 Neue Features in der PRIMO BJJ App!",
      "recipient_count": 25,
      "created_at": "2026-10-25T08:00:00.000Z"
    }
  ]
}
```

### 6. Monitoring

#### Resend Dashboard
1. Öffne [Resend Dashboard](https://resend.com/emails)
2. Prüfe, dass Emails versendet wurden
3. Überwache Delivery-Rate

#### Database Logs
Prüfe Newsletter-Logs in der Datenbank:

```bash
wrangler d1 execute bjj-auth-db --command "SELECT * FROM newsletter_logs ORDER BY created_at DESC LIMIT 5;"
```

#### Admin Notifications
Prüfe Admin-Benachrichtigungen:

```bash
wrangler d1 execute bjj-auth-db --command "SELECT * FROM admin_notifications WHERE type = 'newsletter_sent' ORDER BY created_at DESC LIMIT 5;"
```

## Troubleshooting

### Problem: Tabelle existiert nicht
**Fehler:** `no such table: newsletter_logs`

**Lösung:**
```bash
# Migration erneut ausführen
wrangler d1 execute bjj-auth-db --file=./workers/migrations/add-newsletter-logs.sql
```

### Problem: Rate Limit für Testing zurücksetzen
**Lösung:**
```bash
wrangler d1 execute bjj-auth-db --command "DELETE FROM newsletter_logs WHERE created_at > datetime('now', '-1 hour');"
```

### Problem: Newsletter wird nicht versendet
**Mögliche Ursachen:**
1. Keine aktiven User: `SELECT COUNT(*) FROM allowed_users WHERE status = 'active';`
2. Resend API Key ungültig: Prüfe Environment Variables
3. Rate Limit aktiv: Warte 1 Stunde oder lösche Logs (siehe oben)

### Problem: Emails kommen nicht an
**Prüfschritte:**
1. Resend Dashboard → Emails → Status prüfen
2. Spam-Ordner prüfen
3. Email-Adressen in DB validieren
4. Resend Domain-Verifizierung prüfen

## Rollback

Falls Probleme auftreten, Rollback durchführen:

### 1. Worker Rollback
```bash
cd workers
wrangler rollback
```

### 2. Tabelle löschen (optional)
```bash
wrangler d1 execute bjj-auth-db --command "DROP TABLE IF EXISTS newsletter_logs;"
```

### 3. Frontend Rollback
Deploye vorherige Version des Frontends

## Post-Deployment Checklist

- [ ] Database Migration erfolgreich
- [ ] Worker deployed
- [ ] Frontend deployed
- [ ] "Send Newsletter" Button sichtbar im Admin Dashboard
- [ ] Newsletter Modal funktioniert
- [ ] Email-Vorschau korrekt
- [ ] Rate Limiting funktioniert
- [ ] Newsletter History abrufbar
- [ ] Resend Dashboard zeigt Emails
- [ ] Admin Notifications werden erstellt
- [ ] Dokumentation aktualisiert (README, Changelog)

## Nächste Schritte

Nach erfolgreichem Deployment:

1. **Informiere das Team** über das neue Feature
2. **Erstelle Guidelines** für Newsletter-Inhalte
3. **Plane Newsletter-Frequenz** (z.B. 1x pro Woche)
4. **Überwache Metriken** in Resend Dashboard
5. **Sammle Feedback** von Usern

## Support

Bei Fragen oder Problemen:
- Dokumentation: [`NEWSLETTER-SYSTEM.md`](./NEWSLETTER-SYSTEM.md)
- Changelog: [`changelog.md`](./changelog.md)
- API Dokumentation: Siehe `workers/auth-api.js` Kommentare
