import { useState } from 'react';
import TechniqueCard from '../techniques/TechniqueCard';

export default function CategoryAccordion({ category, techniques, isNewest }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-card-bg hover:bg-card-hover p-4 rounded-lg flex items-center justify-between transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            ▶
          </span>
          <h2 className="text-lg font-bold text-primo-red uppercase tracking-wide">
            {category}
          </h2>
          <span className="bg-primo-red text-white px-2 py-1 rounded-full text-sm font-semibold">
            {techniques.length}
          </span>
          {isNewest && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold uppercase animate-pulse">
              NEW!
            </span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="mt-3 space-y-3">
          {techniques.map((tech) => (
            <TechniqueCard key={tech.id} technique={tech} />
          ))}
        </div>
      )}
    </div>
  );
}
