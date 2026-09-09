import { useState } from 'react';
import { TechniqueProvider, useTechniques } from './context/TechniqueContext';
import Header from './components/layout/Header';
import IconNavigation from './components/layout/IconNavigation';
import CategoryAccordion from './components/categories/CategoryAccordion';
import SplashScreen from './components/SplashScreen';

function AppContent() {
  const { groupedTechniques, filteredTechniques } = useTechniques();

  // Find the newest category based on the most recent dateAdded
  const getNewestCategory = () => {
    let newestCategory = null;
    let newestDate = null;

    Object.entries(groupedTechniques).forEach(([category, techniques]) => {
      techniques.forEach(tech => {
        const techDate = new Date(tech.dateAdded);
        if (!newestDate || techDate > newestDate) {
          newestDate = techDate;
          newestCategory = category;
        }
      });
    });

    return newestCategory;
  };

  const newestCategory = getNewestCategory();

  return (
    <div className="min-h-screen bg-app-bg">
      <Header />
      <IconNavigation />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {Object.keys(groupedTechniques).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🥋</div>
            <p className="text-gray-400 text-lg mb-2">Keine Techniken gefunden</p>
            <p className="text-gray-600 text-sm">Versuche einen anderen Filter oder Suchbegriff</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedTechniques).map(([category, techniques]) => (
              <CategoryAccordion
                key={category}
                category={category}
                techniques={techniques}
                isNewest={category === newestCategory}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>{filteredTechniques.length} Techniques displayed</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card-bg border-t border-gray-800 mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🦅</span>
            <span className="text-primo-gold font-bold">AKXE BJJ - PRIMO GERMANY</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">München</p>
          <p className="text-gray-600 text-xs italic">"Together we stand, united we fight"</p>
          <p className="text-gray-700 text-xs mt-3">© 2012-2026 AKXE BJJ | EST. 2012</p>
        </div>
      </footer>

      {/* Training Schedule Section */}
      <section className="bg-gradient-to-b from-card-bg to-app-bg py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              📅 Training Schedule
            </h2>
            <p className="text-primo-gold text-sm">
              AKXE BJJ - PRIMO München
            </p>
          </div>
          
          <div className="bg-card-bg rounded-xl p-6 shadow-2xl border border-gray-800">
            <img
              src="/images/schedule.png"
              alt="PRIMO BJJ Training Schedule"
              className="w-full h-auto rounded-lg"
            />
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Join us for world-class BJJ training in Munich
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <TechniqueProvider>
      <AppContent />
    </TechniqueProvider>
  );
}

export default App;
