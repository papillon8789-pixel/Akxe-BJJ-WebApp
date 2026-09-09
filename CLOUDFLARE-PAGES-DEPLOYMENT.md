# Cloudflare Pages Deployment - BJJ App

## Schritt 1: Cloudflare Pages öffnen

1. Gehe zu: https://dash.cloudflare.com/
2. Melde dich mit deinem Cloudflare Account an
3. Klicke links auf **"Workers & Pages"**
4. Klicke auf **"Create application"**
5. Wähle den Tab **"Pages"**
6. Klicke auf **"Connect to Git"**

## Schritt 2: GitHub Repository verbinden

1. **GitHub Account verbinden:**
   - Klicke auf "Connect GitHub"
   - Autorisiere Cloudflare für GitHub
   
2. **Repository auswählen:**
   - Wähle `papillon8789-pixel/Akxe-BJJ-WebApp`
   - Klicke auf "Begin setup"

## Schritt 3: Build-Einstellungen konfigurieren

**Wichtig! Diese Einstellungen genau so eingeben:**

- **Project name:** `akxe-bjj-webapp` (oder ein anderer Name)
- **Production branch:** `main`
- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`

**Environment variables (optional):**
- Keine nötig für den Start

## Schritt 4: Deployment starten

1. Klicke auf **"Save and Deploy"**
2. Warte 2-3 Minuten während Cloudflare:
   - Den Code von GitHub holt
   - `npm install` ausführt
   - `npm run build` ausführt
   - Die App deployed

## Schritt 5: Deine Live-URL

Nach erfolgreichem Deployment bekommst du eine URL wie:

```
https://akxe-bjj-webapp.pages.dev
```

**Diese URL kannst du dann:**
- ✅ Mit Freunden teilen
- ✅ Auf deinem Handy öffnen
- ✅ Überall im Internet aufrufen
- ✅ Später mit einer Custom Domain verbinden (z.B. bjj.primo-akxe.de)

## Automatische Updates

**Das Beste:** Jedes Mal wenn du Code-Änderungen zu GitHub pushst, wird die App automatisch neu deployed! 🎉

1. Änderungen in VSCode machen
2. In GitHub Desktop committen
3. Push to origin
4. Cloudflare baut automatisch neu
5. Nach 2-3 Minuten ist die neue Version live!

## Troubleshooting

### Build schlägt fehl
- Überprüfe ob `package.json` korrekt ist
- Stelle sicher dass `vite.config.js` existiert
- Build command muss `npm run build` sein

### Videos werden nicht geladen
- Überprüfe CORS-Einstellungen in R2
- Stelle sicher dass R2 URLs öffentlich zugänglich sind

### App lädt nicht
- Überprüfe Browser-Konsole (F12)
- Stelle sicher dass `dist` Ordner korrekt gebaut wurde

---

## Custom Domain einrichten (Optional)

Wenn du eine eigene Domain hast:

1. Gehe zu deinem Cloudflare Pages Projekt
2. Klicke auf "Custom domains"
3. Klicke "Set up a custom domain"
4. Gib deine Domain ein (z.B. `bjj.primo-akxe.de`)
5. Folge den DNS-Anweisungen

---

**Viel Erfolg! 🥋🦅**
