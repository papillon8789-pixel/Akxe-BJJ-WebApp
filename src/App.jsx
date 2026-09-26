import { useState } from 'react';
import { TechniqueProvider, useTechniques } from './context/TechniqueContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import IconNavigation from './components/layout/IconNavigation';
import CategoryAccordion from './components/categories/CategoryAccordion';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import Banner from './components/Banner';
import AdminDashboard from './components/AdminDashboard';

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

  // Check if a category is legacy (all videos have isLegacy: true)
  const isLegacyCategory = (techniques) => {
    return techniques.every(tech => tech.isLegacy === true);
  };

  const newestCategory = getNewestCategory();

  return (
    <div className="min-h-screen bg-app-bg">
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Banner />
        
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
                isLegacy={isLegacyCategory(techniques)}
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
            <span className="text-primo-gold font-bold">PRIMO BJJ - AKXE GERMANY</span>
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
              PRIMO BJJ - AKXE München
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

function AuthenticatedApp() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'admin'

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primo-red mx-auto mb-4"></div>
          <p className="text-gray-400">Lade...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Admin Dashboard View
  if (currentView === 'admin' && user?.isAdmin) {
    return (
      <div>
        {/* Simple Navigation Bar */}
        <div className="bg-primo-black text-white px-4 py-3 border-b border-primo-gold/20 flex items-center justify-between">
          <h1 className="text-lg font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setCurrentView('main')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back to Techniques
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Main App View
  return (
    <TechniqueProvider>
      <div>
        <Header />
        {/* Admin Button (only for admins) */}
        {user?.isAdmin && (
          <div className="bg-card-bg border-b border-gray-800 px-4 py-2">
            <button
              onClick={() => setCurrentView('admin')}
              className="w-full px-4 py-2 bg-primo-red hover:bg-red-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <span>⚙️</span>
              <span>Admin Dashboard</span>
            </button>
          </div>
        )}
        <IconNavigation />
        <AppContent />
      </div>
    </TechniqueProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
