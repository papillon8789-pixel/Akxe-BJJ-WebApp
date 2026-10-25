# TakeDown Techniken Workflow

Dieses Dokument beschreibt den standardisierten Workflow zum Hinzufügen neuer TakeDown-Techniken zur BJJ-App.

## 📋 Übersicht

Die TakeDown-Kategorie verwendet ein spezielles Filter-System basierend auf **Mechanik-Typen**:
- **Hips** (Hüft-Techniken) - Orange/Rot Gradient
- **Arms** (Arm-Techniken) - Blau/Cyan Gradient
- **Legs** (Bein-Techniken) - Grün/Emerald Gradient
- **Sacrifice** (Opfer-Techniken) - Lila/Pink Gradient
- **Other** (Unkategorisiert) - Grau Gradient

## 🎯 Workflow: Neue TakeDown-Techniken hinzufügen

### Schritt 1: Videos hochladen
1. Videos zu Cloudflare R2 hochladen
2. Namenskonvention: `TakeDown_Technique_XX.mp4` (fortlaufende Nummerierung)

### Schritt 2: Techniken in mockTechniques.js hinzufügen

**Wichtig:** Neue Techniken immer **ganz oben** in der Liste einfügen (IDs 1-X)!

```javascript
{"id": "1",
  "title": "Technik Name - Variante",  // z.B. "Sumi Gaeshi - Yoko NoGi Version"
  "description": "Kurze Beschreibung der Technik",
  "category": "takedown",
  "subCategory": "TakeDown",  // WICHTIG: Immer "TakeDown", nicht den Technik-Namen!
  "variant": "Varianten-Name",  // z.B. "Yoko NoGi Version"
  "mechanicType": "sacrifice",  // hips, arms, legs, sacrifice, oder uncategorized
  "videoId": "TakeDown_Technique_XX.mp4",
  "videoUrl": `${R2_BASE_URL}/TakeDown_Technique_XX.mp4`,
  "thumbnail": "https://via.placeholder.com/400x225/1a1a1a/e63946?text=Technik%20Name",
  "duration": null,
  "tags": [
    "TakeDown",
    "Technik Name",  // z.B. "Sumi Gaeshi"
    "Mechanik-Typ",  // z.B. "Sacrifice Technique"
    "Gi/NoGi"  // Optional
  ],
  "dateAdded": "YYYY-MM-DD",  // Heutiges Datum für NEW Badge
  "month": "YYYY-MM",
  "isLegacy": false,
  "isFavorite": false,
  "isDownloaded": false,
  "isBookmarked": false,
  "viewCount": 0,
  "notes": ""}
```

### Schritt 3: Neuen Mechanik-Typ hinzufügen (falls nötig)

Wenn ein neuer Mechanik-Typ benötigt wird:

#### 3.1 TakeDownFilter.jsx erweitern
```javascript
// MECHANIC_TYPES erweitern
const MECHANIC_TYPES = {
  ALL: 'all',
  HIPS: 'hips',
  ARMS: 'arms',
  LEGS: 'legs',
  SACRIFICE: 'sacrifice',
  NEW_TYPE: 'new_type',  // Neuer Typ hinzufügen
  UNCATEGORIZED: 'uncategorized'
};

// Filter-Button hinzufügen
const filters = [
  { id: MECHANIC_TYPES.ALL, label: 'All', color: 'bg-gradient-to-r from-gray-700 to-gray-600' },
  { id: MECHANIC_TYPES.HIPS, label: 'Hips', color: 'bg-gradient-to-r from-orange-600 to-red-600' },
  { id: MECHANIC_TYPES.ARMS, label: 'Arms', color: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
  { id: MECHANIC_TYPES.LEGS, label: 'Legs', color: 'bg-gradient-to-r from-green-600 to-emerald-600' },
  { id: MECHANIC_TYPES.SACRIFICE, label: 'Sacrifice', color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  { id: MECHANIC_TYPES.NEW_TYPE, label: 'Label', color: 'bg-gradient-to-r from-color1 to-color2' },
  { id: MECHANIC_TYPES.UNCATEGORIZED, label: 'Other', color: 'bg-gradient-to-r from-gray-600 to-gray-500' }
];
```

#### 3.2 TakeDownView.jsx erweitern
```javascript
// Counts für neuen Typ hinzufügen
const counts = {
  [MECHANIC_TYPES.ALL]: allTechniques.length,
  [MECHANIC_TYPES.HIPS]: allTechniques.filter(t => t.mechanicType === 'hips').length,
  [MECHANIC_TYPES.ARMS]: allTechniques.filter(t => t.mechanicType === 'arms').length,
  [MECHANIC_TYPES.LEGS]: allTechniques.filter(t => t.mechanicType === 'legs').length,
  [MECHANIC_TYPES.SACRIFICE]: allTechniques.filter(t => t.mechanicType === 'sacrifice').length,
  [MECHANIC_TYPES.NEW_TYPE]: allTechniques.filter(t => t.mechanicType === 'new_type').length,
  [MECHANIC_TYPES.UNCATEGORIZED]: allTechniques.filter(t => t.mechanicType === 'uncategorized').length
};
```

#### 3.3 TakeDownAccordion.jsx erweitern
```javascript
// Badge für neuen Typ hinzufügen
const getMechanicBadge = (mechanicType) => {
  const badges = {
    hips: { label: 'Hips', color: 'bg-gradient-to-r from-orange-600 to-red-600' },
    arms: { label: 'Arms', color: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
    legs: { label: 'Legs', color: 'bg-gradient-to-r from-green-600 to-emerald-600' },
    sacrifice: { label: 'Sacrifice', color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
    new_type: { label: 'Label', color: 'bg-gradient-to-r from-color1 to-color2' },
    uncategorized: { label: 'Other', color: 'bg-gradient-to-r from-gray-600 to-gray-500' }
  };
  
  return badges[mechanicType] || badges.uncategorized;
};
```

## 🎨 Gradient-Farben Empfehlungen

Für neue Mechanik-Typen:
- **Gelb/Gold**: `from-yellow-600 to-amber-600`
- **Türkis/Teal**: `from-teal-600 to-cyan-600`
- **Indigo/Violett**: `from-indigo-600 to-purple-600`
- **Rosa/Rot**: `from-pink-600 to-red-600`
- **Lime/Grün**: `from-lime-600 to-green-600`

## ⚠️ Wichtige Hinweise

### 1. subCategory muss "TakeDown" sein
```javascript
"subCategory": "TakeDown",  // ✅ RICHTIG
"subCategory": "Sumi Gaeshi",  // ❌ FALSCH - erstellt separate Kategorie!
```

### 2. Gruppierung erfolgt über den Titel
Techniken werden automatisch nach dem ersten Teil des Titels (vor " - ") gruppiert:
- "Sumi Gaeshi - Yoko NoGi Version" → Gruppe: "Sumi Gaeshi"
- "Sumi Gaeshi - Upper Hook Version" → Gruppe: "Sumi Gaeshi"
- "Harai Goshi - Original" → Gruppe: "Harai Goshi"

### 3. NEW Badge Zeitfenster
- Badge erscheint für Techniken mit `dateAdded` innerhalb der **letzten 7 Tage**
- Wird automatisch auf Gruppen-Ebene angezeigt
- Funktion: `isGroupNew()` in TakeDownAccordion.jsx

### 4. Neue Techniken oben platzieren
- Neue Techniken immer mit IDs 1-X ganz oben einfügen
- Alle anderen Techniken werden automatisch nach unten verschoben
- Dadurch erscheinen neue Techniken prominent an erster Stelle

## 📊 Beispiel: Sumi Gaeshi (2026-10-25)

### Hinzugefügte Techniken
- **4 Varianten** von Sumi Gaeshi
- **Mechanik-Typ**: sacrifice
- **IDs**: 1-4 (ganz oben)
- **Filter**: Neuer "Sacrifice" Filter (Lila-Pink)
- **Badge**: "Sacrifice" Badge + "NEW!" Badge

### Dateien geändert
1. `src/data/mockTechniques.js` - 4 neue Techniken hinzugefügt
2. `src/components/takedown/TakeDownFilter.jsx` - SACRIFICE Filter hinzugefügt
3. `src/components/takedown/TakeDownView.jsx` - Sacrifice Count hinzugefügt
4. `src/components/takedown/TakeDownAccordion.jsx` - Sacrifice Badge + NEW Badge Logik

## 🔄 Deployment

Nach dem Hinzufügen neuer Techniken:

1. **Videos hochladen**: Cloudflare R2
2. **Code ändern**: mockTechniques.js + ggf. Filter-Komponenten
3. **Testen**: `npm run dev` - Lokal testen
4. **Build**: `npm run build`
5. **Deploy**: Cloudflare Pages / Vercel

## 📝 Changelog aktualisieren

Nach jedem Update das changelog.md aktualisieren mit:
- Datum
- Anzahl neuer Techniken
- Technik-Namen und Varianten
- Neuer Mechanik-Typ (falls hinzugefügt)
- Geänderte Dateien

---

**Letzte Aktualisierung**: 2026-10-25
**Autor**: Roo AI Assistant
