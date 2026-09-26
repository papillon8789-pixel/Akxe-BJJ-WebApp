# 📧 Resend Domain Setup für primo-bjj.com

## 🎯 Ziel
Emails an alle User senden können (nicht nur an papillon8789@gmail.com)

---

## Schritt 1: Domain bei Resend hinzufügen

1. Gehe zu: **https://resend.com/domains**
2. Klicke **"Add Domain"**
3. Gib ein: `primo-bjj.com`
4. Klicke **"Add"**

Resend zeigt dir jetzt 3 DNS Records. **Lass das Fenster offen!**

---

## Schritt 2: DNS Records in Cloudflare eintragen

1. Gehe zu: **https://dash.cloudflare.com**
2. Wähle deine Domain: **`primo-bjj.com`**
3. Klicke **"DNS"** → **"Records"**
4. Füge die 3 Records von Resend hinzu:

### Record 1: SPF
```
Type: TXT
Name: @
Content: v=spf1 include:_spf.resend.com ~all
TTL: Auto
Proxy: DNS only (grau)
```
Klicke **"Save"**

### Record 2: DKIM
```
Type: TXT
Name: resend._domainkey
Content: [der lange String von Resend - kopiere ihn genau!]
TTL: Auto
Proxy: DNS only (grau)
```
Klicke **"Save"**

### Record 3: DMARC (optional, aber empfohlen)
```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none
TTL: Auto
Proxy: DNS only (grau)
```
Klicke **"Save"**

---

## Schritt 3: In Resend verifizieren

1. Zurück zu **https://resend.com/domains**
2. Klicke bei `primo-bjj.com` auf **"Verify"**
3. Warte 5-30 Minuten
4. Status ändert sich zu **"Verified"** ✅

**Tipp:** Aktualisiere die Seite alle paar Minuten

---

## Schritt 4: Worker aktualisieren

### 4a. Datei öffnen
Öffne: `bjj-app/workers/auth-api.js`

### 4b. Zeile ~145 finden
Suche nach:
```javascript
from: 'PRIMO BJJ <onboarding@resend.dev>',
```

### 4c. Ändern zu:
```javascript
from: 'PRIMO BJJ <noreply@primo-bjj.com>',
```

### 4d. Speichern

---

## Schritt 5: Worker neu deployen

```bash
cd bjj-app/workers
wrangler deploy
```

---

## Schritt 6: Testen!

1. Gehe zu: `http://localhost:5173` (oder deine Live-URL)
2. Gib eine beliebige Email ein (z.B. `daniel_-_fischer@hotmail.de`)
3. Klicke **"Code anfordern"**
4. **Email sollte jetzt ankommen!** 🎉

---

## ✅ Checkliste

- [ ] Domain bei Resend hinzugefügt
- [ ] SPF Record in Cloudflare eingetragen
- [ ] DKIM Record in Cloudflare eingetragen
- [ ] DMARC Record in Cloudflare eingetragen
- [ ] Domain in Resend verifiziert (Status: Verified)
- [ ] `from` Adresse in auth-api.js geändert
- [ ] Worker neu deployed
- [ ] Mit echter User-Email getestet

---

## 🐛 Troubleshooting

### "Domain not verified"
- Warte noch 5-10 Minuten
- Prüfe ob DNS Records korrekt sind
- Klicke nochmal "Verify" in Resend

### "Email kommt nicht an"
- Prüfe Spam-Ordner
- Prüfe ob Domain "Verified" ist in Resend
- Prüfe Worker Logs: `wrangler tail`
- Prüfe ob `from` Adresse geändert wurde

### "DNS Record Error"
- Stelle sicher dass Proxy auf "DNS only" (grau) steht
- Nicht "Proxied" (orange)!

---

## 📊 Nach dem Setup

### Emails gehen jetzt an:
- ✅ Alle User in der Datenbank
- ✅ Beliebige Email-Adressen
- ✅ Gmail, Hotmail, Yahoo, etc.

### Limits (Resend Free):
- 100 Emails pro Tag
- 3.000 Emails pro Monat
- Völlig ausreichend für kleine Gyms!

---

**🎉 Nach dem Setup kannst du Emails an alle deine Gym-Mitglieder senden!**
