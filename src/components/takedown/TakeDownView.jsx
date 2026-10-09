import React, { useState, useMemo } from 'react';
import TakeDownFilter, { MECHANIC_TYPES } from './TakeDownFilter';
import TakeDownAccordion from './TakeDownAccordion';
import TechniqueCard from '../techniques/TechniqueCard';

const TakeDownView = ({ techniques }) => {
  const [activeFilter, setActiveFilter] = useState(MECHANIC_TYPES.ALL);
  const [openGroups, setOpenGroups] = useState({});

  // Group and filter techniques
  const { groups, singleTechniques, counts } = useMemo(() => {
    // Filter by category first
    let filtered = techniques.filter(t => t.category === 'takedown');
    
    // Apply mechanic filter
    if (activeFilter !== MECHANIC_TYPES.ALL) {
      filtered = filtered.filter(t => t.mechanicType === activeFilter);
    }
    
    // Separate techniques: named techniques (Harai Goshi, Seoi Nage) vs generic (TakeDown - Technique X)
    const namedTechniques = [];
    const genericTechniques = [];
    
    filtered.forEach(tech => {
      // Check if this is a generic "TakeDown - Technique X" format
      if (tech.title.startsWith('TakeDown - Technique')) {
        genericTechniques.push(tech);
      } else {
        namedTechniques.push(tech);
      }
    });
    
    // Group named techniques by technique name (extract from title before " - ")
    const grouped = namedTechniques.reduce((acc, tech) => {
      const techniqueName = tech.title.includes(' - ')
        ? tech.title.split(' - ')[0].trim()
        : tech.title;
      
      if (!acc[techniqueName]) {
        acc[techniqueName] = {
          name: techniqueName,
          mechanicType: tech.mechanicType,
          variants: []
        };
      }
      acc[techniqueName].variants.push(tech);
      return acc;
    }, {});
    
    // All named technique groups (even single variants) get accordions
    const multiVariantGroups = Object.values(grouped);
    const singleTechniques = genericTechniques; // Generic techniques shown as direct cards
    
    // Calculate counts for each filter
    const allTechniques = techniques.filter(t => t.category === 'takedown');
    const counts = {
      [MECHANIC_TYPES.ALL]: allTechniques.length,
      [MECHANIC_TYPES.HIPS]: allTechniques.filter(t => t.mechanicType === 'hips').length,
      [MECHANIC_TYPES.ARMS]: allTechniques.filter(t => t.mechanicType === 'arms').length,
      [MECHANIC_TYPES.UNCATEGORIZED]: allTechniques.filter(t => t.mechanicType === 'uncategorized').length
    };
    
    return {
      groups: multiVariantGroups,
      singleTechniques,
      counts
    };
  }, [techniques, activeFilter]);

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <TakeDownFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />
      
      {/* Technique Groups and Single Techniques */}
      {groups.length > 0 || singleTechniques.length > 0 ? (
        <div className="space-y-4">
          {/* Multi-variant groups (Harai Goshi, Seoi Nage) */}
          {groups.map((group) => (
            <TakeDownAccordion
              key={group.name}
              group={group}
              isOpen={openGroups[group.name] || false}
              onToggle={() => toggleGroup(group.name)}
            />
          ))}
          
          {/* Single techniques (no accordion, direct cards) */}
          {singleTechniques.map((tech) => (
            <TechniqueCard key={tech.id} technique={tech} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No techniques found for this filter.</p>
        </div>
      )}
    </div>
  );
};

export default TakeDownView;
