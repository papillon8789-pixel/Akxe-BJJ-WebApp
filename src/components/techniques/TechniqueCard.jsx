import { useState } from 'react';

export default function TechniqueCard({ technique }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-600 text-white',
      intermediate: 'bg-yellow-600 text-white',
      advanced: 'bg-red-600 text-white'
    };
    return colors[difficulty?.toLowerCase()] || 'bg-gray-500 text-white';
  };

  return (
    <div className="bg-card-bg hover:bg-card-hover rounded-lg p-4 transition-all duration-200 border border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {technique.title}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Difficulty Badge */}
            {technique.difficulty && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getDifficultyColor(technique.difficulty)}`}>
                {technique.difficulty}
              </span>
            )}
            
            {/* Sub Category Badge */}
            {technique.subCategory && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-gray-200">
                {technique.subCategory}
              </span>
            )}

            {/* Duration Badge */}
            {technique.duration && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primo-red text-white">
                ⏱️ {technique.duration}
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-gray-300 text-sm mb-3">
            {technique.description}
          </p>

          {/* Tags */}
          {technique.tags && technique.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {technique.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {technique.viewCount !== undefined && (
              <span>👁️ {technique.viewCount} views</span>
            )}
            {technique.isFavorite && <span className="text-yellow-500">⭐ Favorite</span>}
            {technique.isDownloaded && <span className="text-green-500">⬇️ Downloaded</span>}
            {technique.isBookmarked && <span className="text-blue-500">🔖 Bookmarked</span>}
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primo-red hover:bg-red-700 transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg
            className={`w-5 h-5 text-white transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
          {/* Thumbnail */}
          {technique.thumbnail && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={technique.thumbnail}
                alt={technique.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Category:</span>
              <span className="ml-2 text-white capitalize">{technique.category}</span>
            </div>
            <div>
              <span className="text-gray-500">Added:</span>
              <span className="ml-2 text-white">{technique.dateAdded}</span>
            </div>
          </div>

          {/* Notes */}
          {technique.notes && (
            <div>
              <h4 className="text-sm font-bold text-primo-red uppercase mb-2">
                📝 Notes
              </h4>
              <p className="text-gray-300 text-sm">{technique.notes}</p>
            </div>
          )}

          {/* Video Player */}
          {technique.videoUrl && (
            <div>
              <h4 className="text-sm font-bold text-primo-red uppercase mb-2">
                🎥 Video
              </h4>
              <div className="rounded-lg overflow-hidden bg-black">
                <video
                  controls
                  className="w-full"
                  preload="metadata"
                >
                  <source src={technique.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
