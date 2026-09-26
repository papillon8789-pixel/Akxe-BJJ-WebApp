import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// API Base URL - wird in Production durch Cloudflare Worker URL ersetzt
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-worker.your-subdomain.workers.dev';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Full user object with isAdmin, status, etc.
  const [userEmail, setUserEmail] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStep, setVerificationStep] = useState('email'); // 'email' | 'code'
  const [pendingEmail, setPendingEmail] = useState(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem('bjj-auth-token');
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/validate-session`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data.user);
          setUserEmail(data.user.email);
          setToken(storedToken);
        } else {
          // Token ungültig - entfernen
          localStorage.removeItem('bjj-auth-token');
          localStorage.removeItem('bjj-user-data');
        }
      } catch (err) {
        console.error('Session validation error:', err);
        localStorage.removeItem('bjj-auth-token');
        localStorage.removeItem('bjj-user-data');
      }
      
      setIsLoading(false);
    };

    validateSession();
  }, []);

  // Schritt 1: Email eingeben und Verifizierungscode anfordern
  const requestVerification = async (email) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send email');
        setIsLoading(false);
        return false;
      }

      // Erfolg - wechsle zu Code-Eingabe
      setPendingEmail(email.toLowerCase().trim());
      setVerificationStep('code');
      setIsLoading(false);
      return true;

    } catch (err) {
      console.error('Request verification error:', err);
      setError('Network error. Please check your internet connection.');
      setIsLoading(false);
      return false;
    }
  };

  // Schritt 2: Verifizierungscode eingeben
  const verifyCode = async (code) => {
    setError(null);
    setIsLoading(true);

    if (!pendingEmail) {
      setError('No email address found. Please start again.');
      setIsLoading(false);
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: pendingEmail, 
          code: code.trim() 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid code');
        setIsLoading(false);
        return false;
      }

      // Check if account is pending
      if (data.status === 'pending') {
        setError('Your account is pending approval. You will receive an email once activated.');
        setIsLoading(false);
        return false;
      }

      // Erfolg - speichere Token und User-Daten
      if (data.token) {
        localStorage.setItem('bjj-auth-token', data.token);
        localStorage.setItem('bjj-user-data', JSON.stringify(data.user));
        
        setIsAuthenticated(true);
        setUser(data.user);
        setUserEmail(data.user.email);
        setToken(data.token);
      }
      
      setVerificationStep('email');
      setPendingEmail(null);
      setIsLoading(false);
      return true;

    } catch (err) {
      console.error('Verify code error:', err);
      setError('Network error. Please check your internet connection.');
      setIsLoading(false);
      return false;
    }
  };

  // Zurück zur Email-Eingabe
  const resetVerification = () => {
    setVerificationStep('email');
    setPendingEmail(null);
    setError(null);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('bjj-auth-token');
    localStorage.removeItem('bjj-user-data');
    setIsAuthenticated(false);
    setUser(null);
    setUserEmail(null);
    setToken(null);
    setError(null);
    setVerificationStep('email');
    setPendingEmail(null);
  };

  const value = {
    isAuthenticated,
    user,
    userEmail,
    token,
    isLoading,
    error,
    verificationStep,
    pendingEmail,
    requestVerification,
    verifyCode,
    resetVerification,
    logout,
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
