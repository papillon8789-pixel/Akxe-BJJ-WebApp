import { useState, useEffect } from 'react';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

// Banner wird jetzt aus dem public Ordner geladen (im GitHub Repo)
const BANNER_URL = '/banner.json';
const DISMISSED_KEY = 'banner-dismissed';

const Banner = () => {
  const [banner, setBanner] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const response = await fetch(BANNER_URL, {
        cache: 'no-cache', // Always get fresh banner data
      });
      
      if (!response.ok) {
        console.log('Banner file not found or error loading');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Check if banner is active
      if (!data.active) {
        setIsLoading(false);
        return;
      }

      // Check if banner has expired
      if (data.expiresAt) {
        const expiryDate = new Date(data.expiresAt);
        if (new Date() > expiryDate) {
          setIsLoading(false);
          return;
        }
      }

      // Check if user has dismissed this banner
      const dismissedBanners = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
      const bannerId = `${data.title}-${data.message}`;
      
      if (dismissedBanners.includes(bannerId)) {
        setIsDismissed(true);
        setIsLoading(false);
        return;
      }

      setBanner(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading banner:', error);
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    if (banner && banner.dismissible) {
      const bannerId = `${banner.title}-${banner.message}`;
      const dismissedBanners = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
      dismissedBanners.push(bannerId);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissedBanners));
      setIsDismissed(true);
    }
  };

  // Don't render anything while loading or if dismissed
  if (isLoading || isDismissed || !banner) {
    return null;
  }

  // Banner type configurations
  const typeConfig = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-400',
      icon: Info,
    },
    success: {
      bg: 'bg-green-500/10 border-green-500/30',
      text: 'text-green-400',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500/30',
      text: 'text-yellow-400',
      icon: AlertTriangle,
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/30',
      text: 'text-red-400',
      icon: AlertCircle,
    },
  };

  const config = typeConfig[banner.type] || typeConfig.info;
  const Icon = config.icon;

  const BannerContent = () => (
    <div className={`${config.bg} border rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`${config.text} flex-shrink-0 mt-0.5`} size={20} />
        
        <div className="flex-1 min-w-0">
          {banner.title && (
            <h3 className={`${config.text} font-semibold mb-1`}>
              {banner.title}
            </h3>
          )}
          <p className="text-gray-300 text-sm">
            {banner.message}
          </p>
        </div>

        {banner.dismissible && (
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Banner schließen"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );

  // If banner has a link, make it clickable
  if (banner.link) {
    return (
      <a href={banner.link} className="block no-underline">
        <BannerContent />
      </a>
    );
  }

  return <BannerContent />;
};

export default Banner;
