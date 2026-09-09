import fs from 'fs';

const R2_BASE_URL = 'https://pub-333effaca17f49c9b80b42fa7b22c347.r2.dev';

const videoGroups = [
  // Z Guard (C_Guard1-6) - NEW!
  { start: 1, count: 6, title: 'Z Guard', filePrefix: 'C_Guard', category: 'guard', subCategory: 'Z Guard', tags: ['Guard', 'Z Guard', 'Gi'], difficulties: ['Beginner', 'Beginner', 'Intermediate', 'Intermediate', 'Advanced', 'Advanced'], isLegacy: false },
  
  // 50/50 Guard
  { start: 7, count: 6, title: '50/50 Position', filePrefix: '50_50_Position_Technique_', category: 'guard', subCategory: '50/50 Guard', tags: ['Guard', '50/50', 'Gi', 'Leg Entanglement'], difficulties: ['Intermediate', 'Intermediate', 'Advanced', 'Advanced', 'Advanced', 'Advanced'] },
  
  // Half Guard
  { start: 13, count: 9, title: 'Half Guard', filePrefix: 'HalfGuard_Technique_', category: 'guard', subCategory: 'Half Guard', tags: ['Guard', 'Half Guard', 'Gi'], difficulties: ['Beginner', 'Beginner', 'Intermediate', 'Intermediate', 'Intermediate', 'Advanced', 'Advanced', 'Advanced', 'Advanced'] },
  
  // Knee Shield
  { start: 22, count: 6, title: 'Knee Shield', filePrefix: 'KneeShield_Technique_', category: 'guard', subCategory: 'Knee Shield', tags: ['Guard', 'Knee Shield', 'Half Guard', 'Gi'], difficulties: ['Beginner', 'Intermediate', 'Intermediate', 'Intermediate', 'Advanced', 'Advanced'] },
  
  // Spider Lasso
  { start: 28, count: 3, title: 'Spider Lasso', filePrefix: 'SpiderLasso_Technique_', category: 'guard', subCategory: 'Spider Lasso', tags: ['Guard', 'Spider Guard', 'Lasso', 'Gi'], difficulties: ['Intermediate', 'Advanced', 'Advanced'] },
  
  // Side Control
  { start: 31, count: 10, title: 'Side Control', filePrefix: 'SideControl_Technique_', category: 'side', subCategory: 'Side Control', tags: ['Side Control', 'Position', 'Gi'], difficulties: Array(10).fill('Intermediate') },
  
  // North South
  { start: 41, count: 9, title: 'North South', filePrefix: 'NorthSouth_Technique_', category: 'side', subCategory: 'North South', tags: ['North South', 'Position', 'Gi'], difficulties: Array(9).fill('Intermediate') },
  
  // Back Control
  { start: 50, count: 4, title: 'Back Control', filePrefix: 'Back_Technique_', category: 'back', subCategory: 'Back Control', tags: ['Back', 'Position', 'Gi'], difficulties: Array(4).fill('Intermediate') },
  
  // TakeDown
  { start: 54, count: 27, title: 'TakeDown', filePrefix: 'TakeDown_Technique_', category: 'takedown', subCategory: 'TakeDown', tags: ['TakeDown', 'Standing', 'Gi'], difficulties: Array(27).fill('Intermediate'), isLegacy: false },
];

let techniques = [];

videoGroups.forEach(group => {
  for (let i = 0; i < group.count; i++) {
    const id = group.start + i;
    const techNum = i + 1;
    const videoFile = group.filePrefix.includes('C_Guard') 
      ? `${group.filePrefix}${techNum}.mp4`
      : `${group.filePrefix}${techNum}.mp4`;
    
    const technique = {
      id: String(id),
      title: `${group.title} - Technique ${techNum}`,
      description: `${group.title} technique from PRIMO BJJ Training`,
      category: group.category,
      subCategory: group.subCategory,
      videoId: videoFile,
      videoUrl: `\${R2_BASE_URL}/${videoFile}`,
      thumbnail: `https://via.placeholder.com/400x225/1a1a1a/e63946?text=${encodeURIComponent(group.title + ' ' + techNum)}`,
      duration: '1:00',
      tags: group.tags,
      dateAdded: '2026-09-09',
      month: '2026-09',
      difficulty: group.difficulties[i],
      isLegacy: group.isLegacy !== false,
      isFavorite: false,
      isDownloaded: false,
      isBookmarked: false,
      viewCount: 0,
      notes: ''
    };
    
    techniques.push(technique);
  }
});

const fileContent = `// Base URL for R2 Storage
const R2_BASE_URL = '${R2_BASE_URL}';

export const mockTechniques = ${JSON.stringify(techniques, null, 2).replace(/"(\$\{R2_BASE_URL\}[^"]+)"/g, '`$1`')};

export const categories = [
  { id: 'all', icon: '/images/AllCategories.png', label: 'ALL', iconType: 'image' },
  { id: 'guard', icon: '/images/guard.png', label: 'GUARD', iconType: 'image' },
  { id: 'pass', icon: '/images/pass.png', label: 'PASS', iconType: 'image' },
  { id: 'side', icon: '/images/side.png', label: 'SIDE CONTROL', iconType: 'image' },
  { id: 'back', icon: '/images/back.png', label: 'BACK', iconType: 'image' },
  { id: 'submissions', icon: '/images/submission.png', label: 'SUBMISSIONS', iconType: 'image' },
  { id: 'takedown', icon: '/images/TakeDown.png', label: 'TAKEDOWN', iconType: 'image' }
];

export const subCategories = {
  guard: ['Z Guard', '50/50 Guard', 'Half Guard', 'Knee Shield', 'Spider Lasso'],
  pass: ['Guard Pass', 'Knee Slice', 'Toreando', 'Leg Drag'],
  side: ['Side Control', 'North South', 'Knee on Belly'],
  back: ['Back Control', 'Turtle'],
  submissions: ['Armlocks', 'Chokes', 'Leglocks'],
  takedown: ['TakeDown']
};
`;

fs.writeFileSync('src/data/mockTechniques.js', fileContent);
console.log(`✅ Generated ${techniques.length} techniques!`);
console.log('📊 Breakdown:');
videoGroups.forEach(group => {
  console.log(`   - ${group.title}: ${group.count} videos`);
});
