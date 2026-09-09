import { useState, useEffect } from 'react';

function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentBelt, setCurrentBelt] = useState(0);

  const belts = [
    { name: 'White Belt', color: '#FFFFFF', textColor: '#000000' },
    { name: 'Blue Belt', color: '#1E40AF', textColor: '#FFFFFF' },
    { name: 'Purple Belt', color: '#7C3AED', textColor: '#FFFFFF' },
    { name: 'Brown Belt', color: '#78350F', textColor: '#FFFFFF' },
    { name: 'Black Belt', color: '#000000', textColor: '#FFFFFF' }
  ];

  useEffect(() => {
    // Progress through belts (faster: 600ms per belt instead of 800ms)
    const beltTimers = belts.map((_, index) =>
      setTimeout(() => setCurrentBelt(index), index * 600)
    );

    // Hold on black belt (shorter total time: 3.5s instead of 4.5s)
    const holdTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 400);
    }, 3500);

    return () => {
      beltTimers.forEach(timer => clearTimeout(timer));
      clearTimeout(holdTimer);
    };
  }, [onFinish]);

  const currentBeltData = belts[currentBelt];

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-app-bg transition-opacity duration-500 ${
        !isVisible ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/images/icon-512.png" 
            alt="PRIMO BJJ Logo" 
            className="w-48 h-48 mx-auto"
          />
        </div>

        {/* Belt Progression */}
        <div className="mb-6">
          {/* Belt visual */}
          <div 
            className="h-16 w-64 mx-auto rounded-lg shadow-2xl transition-all duration-500 flex items-center justify-center relative overflow-hidden"
            style={{ 
              backgroundColor: currentBeltData.color,
              transform: currentBelt === belts.length - 1 ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {/* Belt texture lines */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="h-full border-r border-white"
                  style={{ 
                    width: '12.5%',
                    display: 'inline-block'
                  }}
                />
              ))}
            </div>

            {/* Belt rank text */}
            <span 
              className="text-xl font-bold tracking-wider relative z-10 transition-colors duration-300"
              style={{ color: currentBeltData.textColor }}
            >
              {currentBeltData.name.toUpperCase()}
            </span>

            {/* Shine effect for black belt */}
            {currentBelt === belts.length - 1 && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine"
              />
            )}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {belts.map((belt, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= currentBelt ? 'scale-100' : 'scale-75 opacity-30'
                }`}
                style={{ 
                  backgroundColor: index <= currentBelt ? belt.color : '#4B5563',
                  border: belt.color === '#FFFFFF' ? '1px solid #4B5563' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* App Name */}
        <div className={`transition-all duration-700 ${
          currentBelt >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h1 className="text-3xl font-bold text-white mb-1">
            PRIMO BJJ
          </h1>
          <p className="text-primo-gold text-sm tracking-wider">
            TECHNIQUE LOCKER
          </p>
          {currentBelt === belts.length - 1 && (
            <p className="text-gray-400 text-xs mt-2 italic animate-pulse">
              Your Journey Begins Here
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default SplashScreen;
