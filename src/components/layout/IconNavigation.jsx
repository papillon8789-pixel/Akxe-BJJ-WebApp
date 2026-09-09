import { categories } from '../../data/mockTechniques';
import { useTechniques } from '../../context/TechniqueContext';

export default function IconNavigation() {
  const { selectedCategory, setSelectedCategory } = useTechniques();

  return (
    <nav className="bg-card-bg border-b border-gray-800 px-4 py-3 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              selectedCategory === cat.id
                ? 'bg-primo-red text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {cat.iconType === 'image' ? (
              <img
                src={cat.icon}
                alt={cat.label}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback zu Emoji wenn Bild nicht lädt
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : (
              <span className="text-2xl">{cat.icon}</span>
            )}
            <span className="text-xs font-semibold whitespace-nowrap">{cat.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
