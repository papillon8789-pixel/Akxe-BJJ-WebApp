const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/data/mockTechniques.js', 'utf8');

// Fix TakeDown subCategories - change from "Harai Goshi", "Seoi Nage", "Uncategorized" to "TakeDown"
// But keep the technik name in a new field "techniqueGroup"

// Pattern: Find all takedown techniques and change subCategory
const lines = content.split('\n');
let inTakedownTech = false;
let currentTechId = null;

for (let i = 0; i < lines.length; i++) {
  // Check if we're starting a takedown technique
  if (lines[i].includes('"category": "takedown"')) {
    inTakedownTech = true;
  }
  
  // If we're in a takedown tech and find subCategory, change it to "TakeDown"
  if (inTakedownTech && lines[i].includes('"subCategory":')) {
    // Extract the current subCategory value
    const match = lines[i].match(/"subCategory": "([^"]+)"/);
    if (match && match[1] !== 'TakeDown') {
      const oldSubCat = match[1];
      // Change subCategory to "TakeDown"
      lines[i] = lines[i].replace(`"subCategory": "${oldSubCat}"`, '"subCategory": "TakeDown"');
      console.log(`Changed subCategory from "${oldSubCat}" to "TakeDown"`);
    }
    inTakedownTech = false; // Reset for next technique
  }
  
  // Reset if we hit the next technique
  if (lines[i].includes('"id":') && inTakedownTech) {
    inTakedownTech = false;
  }
}

content = lines.join('\n');

// Write back
fs.writeFileSync('src/data/mockTechniques.js', content, 'utf8');

console.log('Fixed all TakeDown subCategories!');
