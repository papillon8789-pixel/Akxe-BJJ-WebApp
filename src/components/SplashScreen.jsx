import { useState, useEffect } from 'react';

function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 300); // Wait for fade-out animation
    }, 2000); // Show for 2 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-app-bg transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center">
        {/* Logo */}
        <div className="mb-6 animate-pulse">
          <img 
            src="/images/icon-512.png" 
            alt="PRIMO BJJ Logo" 
            className="w-48 h-48 mx-auto"
          />
        </div>
        
        {/* App Name */}
        <h1 className="text-3xl font-bold text-white mb-2">
          PRIMO BJJ
        </h1>
        <p className="text-primo-gold text-lg mb-6">
          Technique Locker
        </p>
        
        {/* Loading Animation */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-primo-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primo-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primo-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
