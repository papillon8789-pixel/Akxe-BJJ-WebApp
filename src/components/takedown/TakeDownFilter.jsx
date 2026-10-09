import React from 'react';

const MECHANIC_TYPES = {
  ALL: 'all',
  HIPS: 'hips',
  ARMS: 'arms',
  UNCATEGORIZED: 'uncategorized'
};

const TakeDownFilter = ({ activeFilter, onFilterChange, counts }) => {
  const filters = [
    { id: MECHANIC_TYPES.ALL, label: 'All', color: 'bg-gradient-to-r from-gray-700 to-gray-600' },
    { id: MECHANIC_TYPES.HIPS, label: 'Hips', color: 'bg-gradient-to-r from-orange-600 to-red-600' },
    { id: MECHANIC_TYPES.ARMS, label: 'Arms', color: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
    { id: MECHANIC_TYPES.UNCATEGORIZED, label: 'Other', color: 'bg-gradient-to-r from-gray-600 to-gray-500' }
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {filters.map(filter => {
          const count = counts[filter.id] || 0;
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                px-4 py-2 rounded-lg font-semibold text-sm sm:text-base
                transition-all duration-200 transform
                ${isActive 
                  ? `${filter.color} text-white shadow-lg scale-105` 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }
                hover:scale-105 active:scale-95
                flex items-center gap-2
              `}
            >
              <span>{filter.label}</span>
              {count > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive ? 'bg-white/20' : 'bg-gray-700'}
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TakeDownFilter;
export { MECHANIC_TYPES };
