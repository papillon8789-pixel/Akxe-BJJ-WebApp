import { useState } from 'react';
import { useTechniques } from '../../context/TechniqueContext';

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const { searchQuery, setSearchQuery } = useTechniques();

  return (
    <header className="bg-primo-black text-white px-4 py-3 sticky top-0 z-50 border-b border-primo-gold/20">
      <div className="flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <img
              src="/images/logo.png"
              alt="PRIMO BJJ Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">PRIMO TECHNIQUE VAULT</h1>
            <p className="text-xs text-primo-gold">PRIMO BJJ München</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-800 rounded-lg transition"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="mt-3">
          <input
            type="text"
            placeholder="Technik suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primo-red focus:border-transparent outline-none text-white placeholder-gray-500"
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
