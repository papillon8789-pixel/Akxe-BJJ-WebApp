import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TechniqueCard from '../techniques/TechniqueCard';

const getMechanicBadge = (mechanicType) => {
  const badges = {
    hips: { label: 'Hips', color: 'bg-gradient-to-r from-orange-600 to-red-600' },
    arms: { label: 'Arms', color: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
    legs: { label: 'Legs', color: 'bg-gradient-to-r from-green-600 to-emerald-600' },
    sacrifice: { label: 'Sacrifice', color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
    uncategorized: { label: 'Other', color: 'bg-gradient-to-r from-gray-600 to-gray-500' }
  };
  
  return badges[mechanicType] || badges.uncategorized;
};

// Check if technique group is new (within last 7 days)
const isGroupNew = (variants) => {
  if (!variants || variants.length === 0) return false;
  
  // Check if any variant in the group is new (within last 7 days)
  return variants.some(variant => {
    if (!variant.dateAdded) return false;
    const addedDate = new Date(variant.dateAdded);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    return addedDate >= sevenDaysAgo;
  });
};

const TakeDownAccordion = ({ group, isOpen, onToggle }) => {
  const { name, mechanicType, variants } = group;
  const badge = getMechanicBadge(mechanicType);
  const isNew = isGroupNew(variants);
  
  return (
    <div className="mb-4">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600
                   rounded-lg p-4 transition-all duration-200 shadow-lg hover:shadow-xl
                   flex items-center justify-between group"
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Video Icon */}
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
          </div>
          
          {/* Technique Name */}
          <div className="flex-1 text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-2">
              {name}
              {isNew && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full text-xs font-bold uppercase animate-pulse">
                  NEW!
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400">
              {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
            </p>
          </div>
          
          {/* Mechanic Badge */}
          <span className={`
            ${badge.color} text-white text-xs sm:text-sm font-bold
            px-3 py-1 rounded-full shadow-md
            hidden sm:inline-block
          `}>
            {badge.label}
          </span>
          
          {/* Mobile Badge */}
          <span className={`
            ${badge.color} text-white text-xs font-bold
            px-2 py-1 rounded-full shadow-md
            sm:hidden
          `}>
            {badge.label}
          </span>
        </div>
        
        {/* Chevron Icon */}
        <div className="ml-3 flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
          )}
        </div>
      </button>
      
      {/* Accordion Content */}
      {isOpen && (
        <div className="mt-2 space-y-2 pl-4 sm:pl-6">
          {variants.map((technique) => (
            <div key={technique.id} className="relative">
              {/* Variant Indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 to-red-800 rounded-full" />
              
              {/* Technique Card */}
              <div className="ml-4">
                <TechniqueCard technique={technique} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TakeDownAccordion;
