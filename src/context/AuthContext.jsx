import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('bjj-auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        // Check if authentication is still valid
        if (authData.validUntil && new Date(authData.validUntil) > new Date()) {
          setIsAuthenticated(true);
          setUserEmail(authData.email);
        } else {
          // Authentication expired
          localStorage.removeItem('bjj-auth');
        }
      } catch (err) {
        console.error('Error parsing auth data:', err);
        localStorage.removeItem('bjj-auth');
      }
    }
    setIsLoading(false);
  }, []);

  // Verify email against allowed users list
  const verifyEmail = async (email) => {
    setError(null);
    setIsLoading(true);

    try {
      // Fetch allowed users from GitHub
      const response = await fetch('/allowed-users.json', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load user list');
      }

      const data = await response.json();
      
      // Normalize email for comparison (lowercase, trim)
      const normalizedEmail = email.toLowerCase().trim();
      
      // Find user in allowed list
      const user = data.users.find(u => u.email.toLowerCase() === normalizedEmail);

      if (!user) {
        setError('E-Mail nicht berechtigt. Bitte kontaktiere den Administrator.');
        setIsLoading(false);
        return false;
      }

      // Check if access is still valid
      const validUntil = new Date(user.validUntil);
      const now = new Date();

      if (validUntil < now) {
        setError('Dein Zugang ist abgelaufen. Bitte verlängere dein Abonnement.');
        setIsLoading(false);
        return false;
      }

      // Authentication successful
      const authData = {
        email: user.email,
        validUntil: user.validUntil,
        authenticatedAt: new Date().toISOString()
      };

      localStorage.setItem('bjj-auth', JSON.stringify(authData));
      setIsAuthenticated(true);
      setUserEmail(user.email);
      setIsLoading(false);
      return true;

    } catch (err) {
      console.error('Authentication error:', err);
      setError('Fehler beim Überprüfen der E-Mail. Bitte versuche es erneut.');
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('bjj-auth');
    setIsAuthenticated(false);
    setUserEmail(null);
    setError(null);
  };

  const value = {
    isAuthenticated,
    userEmail,
    isLoading,
    error,
    verifyEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
