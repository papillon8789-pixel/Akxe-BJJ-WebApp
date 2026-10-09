import React from 'react';

const MECHANIC_TYPES = {
  ALL: 'all',
  HIPS: 'hips',
  ARMS: 'arms',
  UNCATEGORIZED: 'uncategorized'
};

const TakeDownFilter = ({ activeFilter, onFilterChange, counts }) => {
  console.log('TakeDownFilter rendering with counts:', counts);
  
  const filters = [
    { id: MECHANIC_TYPES.ALL, label: 'All', color: 'from-gray-700 to-gray-600' },
    { id: MECHANIC_TYPES.HIPS, label: 'Hips', color: 'from-orange-600 to-red-600' },
    { id: MECHANIC_TYPES.ARMS, label: 'Arms', color: 'from-blue-600 to-cyan-600' },
    { id: MECHANIC_TYPES.UNCATEGORIZED, label: 'Other', color: 'from-gray-600 to-gray-500' }
  ];

  return (
    <div className="mb-6 p-4 bg-gray-900 rounded-lg">
      <h3 className="text-white text-lg font-bold mb-3">Filter by Mechanic Type:</h3>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {filters.map(filter => {
          const count = counts?.[filter.id] || 0;
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                px-4 py-2 rounded-lg font-semibold text-sm sm:text-base
                transition-all duration-200
                ${isActive
                  ? `bg-gradient-to-r ${filter.color} text-white shadow-lg`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }
                flex items-center gap-2
              `}
            >
              <span>{filter.label}</span>
              {count > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive ? 'bg-white bg-opacity-20' : 'bg-gray-700'}
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
