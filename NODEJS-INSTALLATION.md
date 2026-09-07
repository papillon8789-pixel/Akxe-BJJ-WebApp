# 🔧 Node.js Installation & Troubleshooting

## Problem: "node" wird nicht gefunden

Wenn du die Fehlermeldung bekommst:
```
Der Befehl "node" ist entweder falsch geschrieben oder konnte nicht gefunden werden.
```

Dann ist Node.js entweder nicht richtig installiert oder nicht im System-PATH.

---

## ✅ Lösung 1: Computer neu starten (Einfachste Lösung)

Nach der Node.js Installation:

1. **Schließe alle Programme** (VS Code, Terminal, etc.)
2. **Starte den Computer neu**
3. **Öffne VS Code wieder**
4. **Öffne ein neues Terminal** (Strg + `)
5. **Teste:** `node --version`

Das sollte jetzt funktionieren! ✅

---

## ✅ Lösung 2: Neues Terminal öffnen

Manchmal reicht es, ein neues Terminal zu öffnen:

1. **Schließe das aktuelle Terminal** in VS Code
2. **Öffne ein neues Terminal:** Strg + ` oder Terminal → Neues Terminal
3. **Teste:** `node --version`

---

## ✅ Lösung 3: Node.js neu installieren

Falls es immer noch nicht funktioniert:

### Schritt 1: Alte Installation entfernen (falls vorhanden)

1. **Windows-Taste** drücken
2. **"Programme hinzufügen oder entfernen"** eingeben
3. **Node.js** suchen und deinstallieren

### Schritt 2: Neu installieren

1. **Download:** [nodejs.org](https://nodejs.org/)
2. **Wähle:** LTS Version (z.B. 18.x.x oder 20.x.x)
3. **Installer ausführen**
4. **WICHTIG:** Bei der Installation:
   - ✅ "Automatically install necessary tools" **AKTIVIEREN**
   - ✅ "Add to PATH" **AKTIVIEREN** (sollte Standard sein)
5. **Installation abschließen**
6. **Computer neu starten**

### Schritt 3: Testen

Öffne **Eingabeaufforderung** (cmd):

```bash
node --version
```

Sollte zeigen: `v18.17.0` (oder ähnlich)

```bash
npm --version
```

Sollte zeigen: `9.6.7` (oder ähnlich)

---

## ✅ Lösung 4: Manuell zum PATH hinzufügen

Falls Node.js installiert ist, aber nicht im PATH:

### Schritt 1: Node.js Installationsort finden

Standard-Pfad ist normalerweise:
```
C:\Program Files\nodejs\
```

### Schritt 2: Zum PATH hinzufügen

1. **Windows-Taste** drücken
2. **"Umgebungsvariablen"** eingeben
3. **"Umgebungsvariablen für dieses Konto bearbeiten"** öffnen
4. **Unter "Benutzervariablen":**
   - Wähle **"Path"**
   - Klicke **"Bearbeiten"**
5. **Klicke "Neu"**
6. **Füge hinzu:** `C:\Program Files\nodejs\`
7. **OK** klicken
8. **Alle Fenster schließen**
9. **Computer neu starten**

---

## ✅ Lösung 5: PowerShell statt CMD verwenden

Manchmal funktioniert es in PowerShell besser:

1. **In VS Code:** Terminal → Neues Terminal
2. **Wähle:** PowerShell (statt CMD)
3. **Teste:** `node --version`

---

## 🔍 Node.js Installation prüfen

### Wo ist Node.js installiert?

**Windows Explorer öffnen** und prüfen:

```
C:\Program Files\nodejs\
```

Dort solltest du sehen:
- `node.exe`
- `npm.cmd`
- `npx.cmd`

Falls dieser Ordner existiert, ist Node.js installiert!

---

## 📝 Nach erfolgreicher Installation

Wenn `node --version` funktioniert:

### 1. In den Projektordner wechseln

```bash
cd Desktop/bjj-app
```

### 2. Dependencies installieren

```bash
npm install
```

Das dauert 1-2 Minuten und lädt alle benötigten Pakete herunter.

### 3. Development Server starten

```bash
npm run dev
```

### 4. App öffnen

Browser: `http://localhost:5173`

---

## 🆘 Immer noch Probleme?

### Alternative: Online-Version nutzen

Falls die lokale Installation nicht funktioniert, kannst du auch:

1. **StackBlitz** nutzen: [stackblitz.com](https://stackblitz.com)
2. **CodeSandbox** nutzen: [codesandbox.io](https://codesandbox.io)

Dort kannst du den Code hochladen und direkt im Browser entwickeln!

### Alternative: Warten und später probieren

Manchmal braucht Windows nach der Installation etwas Zeit:

1. **Computer neu starten**
2. **30 Minuten warten**
3. **Nochmal probieren**

---

## ✅ Checkliste

- [ ] Node.js von nodejs.org heruntergeladen
- [ ] Installer ausgeführt
- [ ] "Add to PATH" aktiviert
- [ ] Computer neu gestartet
- [ ] Neues Terminal geöffnet
- [ ] `node --version` funktioniert
- [ ] `npm --version` funktioniert
- [ ] Bereit für `npm install`!

---

## 💡 Tipps

### Welche Version installieren?

- **LTS Version** (Long Term Support) - **EMPFOHLEN**
- Aktuell: v18.x.x oder v20.x.x
- Nicht die "Current" Version (nur für Entwickler)

### Wo herunterladen?

**Offizielle Seite:** [nodejs.org](https://nodejs.org/)

Großer grüner Button: **"Download Node.js (LTS)"**

---

## 🎯 Nächste Schritte nach Installation

1. ✅ `node --version` funktioniert
2. ✅ `npm --version` funktioniert
3. ➡️ `cd Desktop/bjj-app`
4. ➡️ `npm install`
5. ➡️ `npm run dev`
6. ➡️ Browser: `http://localhost:5173`

---

**Viel Erfolg! 🚀**

Bei weiteren Fragen: Einfach nochmal nachfragen!
