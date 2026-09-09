import { TechniqueProvider, useTechniques } from './context/TechniqueContext';
import Header from './components/layout/Header';
import IconNavigation from './components/layout/IconNavigation';
import CategoryAccordion from './components/categories/CategoryAccordion';

function AppContent() {
  const { groupedTechniques, filteredTechniques } = useTechniques();

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
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>{filteredTechniques.length} Techniken angezeigt</p>
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
    </div>
  );
}

function App() {
  return (
    <TechniqueProvider>
      <AppContent />
    </TechniqueProvider>
  );
}

export default App;
