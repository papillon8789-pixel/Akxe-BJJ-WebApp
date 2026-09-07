import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { mockTechniques } from '../data/mockTechniques';

const TechniqueContext = createContext();

export function TechniqueProvider({ children }) {
  const [techniques, setTechniques] = useState(mockTechniques);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');

  // Load favorites and downloads from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const savedDownloads = JSON.parse(localStorage.getItem('downloads') || '[]');
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

    setTechniques(prev => prev.map(tech => ({
      ...tech,
      isFavorite: savedFavorites.includes(tech.id),
      isDownloaded: savedDownloads.includes(tech.id),
      isBookmarked: savedBookmarks.includes(tech.id)
    })));
  }, []);

  // Filter techniques based on category and search
  const filteredTechniques = useMemo(() => {
    return techniques.filter(tech => {
      const matchesCategory = selectedCategory === 'all' || tech.category === selectedCategory;
      const matchesSearch = tech.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tech.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tech.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSubCategory = selectedSubCategory === 'all' || tech.subCategory === selectedSubCategory;
      
      return matchesCategory && matchesSearch && matchesSubCategory;
    });
  }, [techniques, selectedCategory, searchQuery, selectedSubCategory]);

  // Group techniques by subCategory
  const groupedTechniques = useMemo(() => {
    const groups = {};
    filteredTechniques.forEach(tech => {
      if (!groups[tech.subCategory]) {
        groups[tech.subCategory] = [];
      }
      groups[tech.subCategory].push(tech);
    });
    return groups;
  }, [filteredTechniques]);

  const toggleFavorite = (id) => {
    setTechniques(prev => {
      const updated = prev.map(tech =>
        tech.id === id ? { ...tech, isFavorite: !tech.isFavorite } : tech
      );
      const favorites = updated.filter(t => t.isFavorite).map(t => t.id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      return updated;
    });
  };

  const toggleDownload = (id) => {
    setTechniques(prev => {
      const updated = prev.map(tech =>
        tech.id === id ? { ...tech, isDownloaded: !tech.isDownloaded } : tech
      );
      const downloads = updated.filter(t => t.isDownloaded).map(t => t.id);
      localStorage.setItem('downloads', JSON.stringify(downloads));
      return updated;
    });
  };

  const toggleBookmark = (id) => {
    setTechniques(prev => {
      const updated = prev.map(tech =>
        tech.id === id ? { ...tech, isBookmarked: !tech.isBookmarked } : tech
      );
      const bookmarks = updated.filter(t => t.isBookmarked).map(t => t.id);
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      return updated;
    });
  };

  const value = {
    techniques,
    filteredTechniques,
    groupedTechniques,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedSubCategory,
    setSelectedSubCategory,
    toggleFavorite,
    toggleDownload,
    toggleBookmark
  };

  return (
    <TechniqueContext.Provider value={value}>
      {children}
    </TechniqueContext.Provider>
  );
}

export function useTechniques() {
  const context = useContext(TechniqueContext);
  if (!context) {
    throw new Error('useTechniques must be used within TechniqueProvider');
  }
  return context;
}
