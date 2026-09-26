import { createContext, useContext, useState, useEffect, useRef } from 'react';

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
  const [info, setInfo] = useState(null); // For non-error messages like "pending approval"
  const [verificationStep, setVerificationStep] = useState('email'); // 'email' | 'code' | 'pending'
  const [pendingEmail, setPendingEmail] = useState(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const pollingIntervalRef = useRef(null);

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
        setInfo('Your account is pending approval. You will receive an email once activated. We\'ll check automatically every 10 seconds...');
        setVerificationStep('pending');
        setIsPendingApproval(true);
        setPendingEmail(pendingEmail); // Keep email for polling
        setIsLoading(false);
        
        // Start polling for approval
        startApprovalPolling(pendingEmail);
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

  // Poll for approval status
  const startApprovalPolling = (email) => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll every 10 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        // Request a new verification code
        const response = await fetch(`${API_BASE_URL}/api/auth/request-verification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.toLowerCase().trim() }),
        });

        const data = await response.json();

        if (response.ok && data.status === 'active') {
          // Account was approved! Stop polling
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          
          // Show success message and prompt for new code
          setInfo('🎉 Your account has been approved! Please check your email for a new login code.');
          setIsPendingApproval(false);
          setVerificationStep('code');
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Continue polling even on error
      }
    }, 10000); // 10 seconds
  };

  // Stop polling
  const stopApprovalPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopApprovalPolling();
    };
  }, []);

  // Zurück zur Email-Eingabe
  const resetVerification = () => {
    stopApprovalPolling();
    setVerificationStep('email');
    setPendingEmail(null);
    setError(null);
    setInfo(null);
    setIsPendingApproval(false);
  };

  // Logout function
  const logout = () => {
    stopApprovalPolling();
    localStorage.removeItem('bjj-auth-token');
    localStorage.removeItem('bjj-user-data');
    setIsAuthenticated(false);
    setUser(null);
    setUserEmail(null);
    setToken(null);
    setError(null);
    setInfo(null);
    setVerificationStep('email');
    setPendingEmail(null);
    setIsPendingApproval(false);
  };

  const value = {
    isAuthenticated,
    user,
    userEmail,
    token,
    isLoading,
    error,
    info,
    verificationStep,
    pendingEmail,
    isPendingApproval,
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
