import React, { useState, useMemo } from 'react';
import TakeDownFilter, { MECHANIC_TYPES } from './TakeDownFilter';
import TakeDownAccordion from './TakeDownAccordion';

const TakeDownView = ({ techniques }) => {
  const [activeFilter, setActiveFilter] = useState(MECHANIC_TYPES.ALL);
  const [openGroups, setOpenGroups] = useState({});

  // Group and filter techniques
  const { groups, counts } = useMemo(() => {
    // Filter by category first
    let filtered = techniques.filter(t => t.category === 'takedown');
    
    // Apply mechanic filter
    if (activeFilter !== MECHANIC_TYPES.ALL) {
      filtered = filtered.filter(t => t.mechanicType === activeFilter);
    }
    
    // Group by subCategory
    const grouped = filtered.reduce((acc, tech) => {
      const group = tech.subCategory;
      if (!acc[group]) {
        acc[group] = {
          name: group,
          mechanicType: tech.mechanicType,
          variants: []
        };
      }
      acc[group].variants.push(tech);
      return acc;
    }, {});
    
    // Calculate counts for each filter
    const allTechniques = techniques.filter(t => t.category === 'takedown');
    const counts = {
      [MECHANIC_TYPES.ALL]: allTechniques.length,
      [MECHANIC_TYPES.HIPS]: allTechniques.filter(t => t.mechanicType === 'hips').length,
      [MECHANIC_TYPES.ARMS]: allTechniques.filter(t => t.mechanicType === 'arms').length,
      [MECHANIC_TYPES.UNCATEGORIZED]: allTechniques.filter(t => t.mechanicType === 'uncategorized').length
    };
    
    return {
      groups: Object.values(grouped),
      counts
    };
  }, [techniques, activeFilter]);

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  console.log('TakeDownView rendering:', { groups: groups.length, counts });
  
  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <TakeDownFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />
      
      {/* Technique Groups */}
      {groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((group) => (
            <TakeDownAccordion
              key={group.name}
              group={group}
              isOpen={openGroups[group.name] || false}
              onToggle={() => toggleGroup(group.name)}
            />
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
