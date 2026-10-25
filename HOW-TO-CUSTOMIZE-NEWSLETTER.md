# How to Customize Newsletter Content

## Quick Guide: Ändern des Newsletter-Textes

### Schritt 1: Datei öffnen
Öffne die Datei: [`src/components/AdminDashboard.jsx`](src/components/AdminDashboard.jsx)

### Schritt 2: Funktion finden
Suche nach der Funktion `handleSendNewsletter` (ca. Zeile 335)

### Schritt 3: Betreff ändern
```javascript
const subject = '🎉 New Features in the PRIMO BJJ App!';
```

**Beispiele:**
```javascript
// Für neue Videos
const subject = '🎥 New Technique Videos Added!';

// Für Events
const subject = '📅 Upcoming Seminar - Save the Date!';

// Für Updates
const subject = '⚡ App Update - New Features Available';
```

### Schritt 4: Email-Inhalt ändern
Der HTML-Inhalt beginnt bei `const htmlContent = ...`

#### Wichtige Bereiche:

**1. Begrüßung:**
```html
<h2 style="color: #1a1a1a; margin-top: 0;">🎉 New Features in the PRIMO BJJ App!</h2>
<p>Hey BJJ Family,</p>
<p>We've got exciting updates for you! The PRIMO BJJ App has been enhanced with new features:</p>
```

**2. Feature Box (Hauptinhalt):**
```html
<div class="feature-box">
  <div class="feature-title">📊 Training Analytics Now Available</div>
  <p><strong>Just launched!</strong> Track your training sessions and monitor your progress:</p>
  <ul>
    <li>📅 Training calendar with all sessions</li>
    <li>🥋 Gi vs NoGi statistics</li>
    <!-- Weitere Punkte hier -->
  </ul>
</div>
```

**3. Highlight Box (Zusatzinfo):**
```html
<div class="highlight">
  <strong>🎥 4 New Sumi Gaeshi TakeDown Videos!</strong><br>
  From Wednesday's training - now available
</div>
```

**4. Call-to-Action Button:**
```html
<div style="text-align: center;">
  <a href="https://primo-bjj.com" class="button">🔓 Open App</a>
</div>
```

**5. Abschluss:**
```html
<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px;">
  Happy training!<br>
  <strong>Your PRIMO BJJ Team</strong>
</p>
```

---

## Beispiel: Newsletter für neue Videos

```javascript
const handleSendNewsletter = async () => {
  try {
    setSendingNewsletter(true);
    setError(null);
    setNewsletterSuccess(null);

    const subject = '🎥 New Technique Videos - Guard Passing Series';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 30px; background: white; }
            .feature-box { background: #f5f5f5; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .feature-title { color: #dc2626; font-weight: bold; font-size: 18px; margin-bottom: 10px; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🦅 PRIMO BJJ</div>
              <p style="margin: 0; opacity: 0.9;">Technique Locker</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1a1a1a; margin-top: 0;">🎥 New Guard Passing Videos!</h2>
              <p>Hey BJJ Family,</p>
              <p>We've just uploaded a complete guard passing series from last week's training:</p>
              
              <div class="feature-box">
                <div class="feature-title">🥋 Guard Passing Series</div>
                <p><strong>5 new videos now available:</strong></p>
                <ul>
                  <li>Toreando Pass - Basic Mechanics</li>
                  <li>Toreando Pass - Advanced Grips</li>
                  <li>Knee Slice Pass - Step by Step</li>
                  <li>X-Pass Fundamentals</li>
                  <li>Combining Passes - Flow Drill</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px;"><strong>Ready to level up your passing game?</strong></p>
              <p>Log in now and start watching!</p>
              
              <div style="text-align: center;">
                <a href="https://primo-bjj.com" class="button">🔓 Watch Now</a>
              </div>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px;">
                Happy training!<br>
                <strong>Your PRIMO BJJ Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">© 2026 PRIMO BJJ - AKXE München</p>
              <p style="margin: 5px 0 0 0;">"Together we stand, united we fight"</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Rest bleibt gleich...
    const response = await fetch(`${API_URL}/api/admin/send-newsletter`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, htmlContent }),
    });
    
    // ... etc
  }
};
```

---

## Beispiel: Newsletter für Event-Ankündigung

```javascript
const subject = '📅 Upcoming Seminar - Special Guest Instructor';
const htmlContent = `
  <!-- Header wie oben -->
  
  <div class="content">
    <h2 style="color: #1a1a1a; margin-top: 0;">📅 Special Seminar Announcement!</h2>
    <p>Hey BJJ Family,</p>
    <p>We're excited to announce a special seminar next month:</p>
    
    <div class="feature-box">
      <div class="feature-title">🥋 Advanced Guard Retention Seminar</div>
      <p><strong>Details:</strong></p>
      <ul>
        <li>📅 Date: Saturday, November 15th, 2026</li>
        <li>⏰ Time: 2:00 PM - 5:00 PM</li>
        <li>📍 Location: AKXE München</li>
        <li>👨‍🏫 Instructor: [Guest Name] - Black Belt</li>
        <li>💰 Price: €50 (Members) / €70 (Non-members)</li>
      </ul>
    </div>
    
    <p><strong>Topics covered:</strong></p>
    <ul>
      <li>Modern guard retention concepts</li>
      <li>Dealing with pressure passing</li>
      <li>Recovery positions and re-guards</li>
      <li>Live training and Q&A</li>
    </ul>
    
    <p style="margin-top: 30px;"><strong>Limited spots available!</strong></p>
    <p>Register now to secure your spot.</p>
    
    <div style="text-align: center;">
      <a href="https://primo-bjj.com" class="button">📝 Register Now</a>
    </div>
  </div>
  
  <!-- Footer wie oben -->
`;
```

---

## Workflow: Newsletter ändern und versenden

### 1. Code ändern
```bash
# Öffne die Datei
code src/components/AdminDashboard.jsx

# Ändere subject und htmlContent
# Speichere die Datei
```

### 2. Testen (lokal)
```bash
# Starte Dev-Server (falls nicht läuft)
npm run dev

# Öffne http://localhost:5173
# Logge dich als Admin ein
# Teste Newsletter-Modal
```

### 3. Deployen
```bash
# Build
npm run build

# Deploy zu Cloudflare Pages
wrangler pages deploy dist --project-name=akxe-bjj-webapp

# Warte auf Deployment (ca. 30 Sekunden)
```

### 4. Newsletter versenden
1. Gehe zu https://primo-bjj.com
2. Logge dich als Admin ein
3. Klicke "Send Newsletter"
4. Prüfe Vorschau
5. Klicke "Newsletter versenden"
6. Warte auf Success-Message: "✅ Newsletter successfully sent to X users!"

---

## Tipps & Best Practices

### ✅ DO's:
- **Kurz und prägnant**: Max 500 Wörter
- **Klare Struktur**: Überschrift → Hauptinhalt → Call-to-Action
- **Emojis nutzen**: Macht Newsletter lebendiger (aber nicht übertreiben)
- **Mobile-friendly**: Template ist bereits responsive
- **Testen**: Sende zuerst an dich selbst zum Testen
- **Timing**: Versende abends oder am Wochenende (bessere Öffnungsraten)

### ❌ DON'Ts:
- **Zu lang**: Niemand liest 1000-Wort-Newsletter
- **Zu viele Links**: Fokus auf 1-2 Hauptaktionen
- **Zu häufig**: Max 1-2 Newsletter pro Woche
- **Spam-Wörter**: Vermeide "FREE", "CLICK HERE", etc.
- **Nur Text**: Nutze die Feature-Boxen für Struktur

### 📊 Tracking:
- Öffnungsraten in Resend Dashboard prüfen
- Newsletter-Logs in Database checken
- Feedback von Usern sammeln

---

## Häufige Fehler beheben

### Problem: Newsletter wird nicht versendet
**Lösung:**
1. Prüfe Browser Console auf Fehler
2. Prüfe ob du als Admin eingeloggt bist
3. Prüfe Rate Limit (max 1/Stunde)

### Problem: Formatierung sieht komisch aus
**Lösung:**
- Prüfe HTML-Syntax (alle Tags geschlossen?)
- Teste in verschiedenen Email-Clients
- Nutze inline CSS (wie im Template)

### Problem: Links funktionieren nicht
**Lösung:**
- Prüfe URL (https:// nicht vergessen)
- Teste Link vor dem Versenden

---

## Support

Bei Fragen:
- Dokumentation: [`NEWSLETTER-SYSTEM.md`](./NEWSLETTER-SYSTEM.md)
- Deployment: [`DEPLOYMENT-NEWSLETTER.md`](./DEPLOYMENT-NEWSLETTER.md)
- Beispiele: Diese Datei

Viel Erfolg mit deinen Newslettern! 🚀
