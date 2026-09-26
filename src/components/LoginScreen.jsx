import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const { 
    requestVerification, 
    verifyCode, 
    resetVerification,
    isLoading, 
    error,
    verificationStep,
    pendingEmail 
  } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (email.trim()) {
      await requestVerification(email);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (code.trim()) {
      await verifyCode(code);
    }
  };

  const handleResendCode = async () => {
    if (pendingEmail) {
      await requestVerification(pendingEmail);
      setCode(''); // Reset code input
    }
  };

  const handleBackToEmail = () => {
    resetVerification();
    setCode('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/images/Logo_neu_schwarz.png" 
            alt="PRIMO BJJ" 
            className="w-32 h-32 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            PRIMO BJJ
          </h1>
          <p className="text-gray-400">
            Technique Locker
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card-bg border border-gray-700 rounded-lg p-8 shadow-2xl">
          {verificationStep === 'email' ? (
            // Schritt 1: Email-Eingabe
            <>
              <h2 className="text-2xl font-bold text-white mb-2">
                Zugang anfordern
              </h2>
              <p className="text-gray-400 mb-6">
                Gib deine registrierte Email-Adresse ein. Du erhältst einen Verifizierungscode per Email.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email-Adresse
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine@email.com"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primo-red focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">⚠️</span>
                      <div className="flex-1">
                        <p className="text-red-200 text-sm font-medium">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full bg-primo-red hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sende Email...
                    </span>
                  ) : (
                    'Code anfordern'
                  )}
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-400 text-xl">ℹ️</span>
                    <div className="flex-1">
                      <h3 className="text-blue-200 font-semibold mb-1">
                        Noch kein Zugang?
                      </h3>
                      <p className="text-blue-300 text-sm">
                        Kontaktiere deinen Professor, um Zugang zur Technique Library zu erhalten.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Schritt 2: Code-Eingabe
            <>
              <div className="mb-6">
                <button
                  onClick={handleBackToEmail}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                  disabled={isLoading}
                >
                  <span>←</span>
                  <span>Zurück</span>
                </button>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  Code eingeben
                </h2>
                <p className="text-gray-400 mb-2">
                  Wir haben einen 6-stelligen Code an
                </p>
                <p className="text-primo-red font-semibold mb-2">
                  {pendingEmail}
                </p>
                <p className="text-gray-500 text-sm">
                  gesendet. Der Code ist 15 Minuten gültig.
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                {/* Code Input */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                    Verifizierungscode
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-center text-2xl font-bold tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primo-red focus:border-transparent transition-all"
                    disabled={isLoading}
                    autoFocus
                  />
                  <p className="text-gray-500 text-xs mt-2 text-center">
                    6-stelliger Code aus der Email
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">⚠️</span>
                      <div className="flex-1">
                        <p className="text-red-200 text-sm font-medium">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full bg-primo-red hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifiziere...
                    </span>
                  ) : (
                    'Zugang bestätigen'
                  )}
                </button>
              </form>

              {/* Resend Code */}
              <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                <p className="text-gray-400 text-sm mb-3">
                  Code nicht erhalten?
                </p>
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-primo-red hover:text-red-400 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Code erneut senden
                </button>
              </div>

              {/* Security Info */}
              <div className="mt-6">
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">🔒</span>
                    <div className="flex-1">
                      <h3 className="text-green-200 font-semibold mb-1 text-sm">
                        Sicher & Geschützt
                      </h3>
                      <p className="text-green-300 text-xs">
                        Nur du hast Zugang zu deiner Email. Niemand kann sich ohne Zugriff auf dein Email-Konto anmelden.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2026 PRIMO BJJ Training</p>
        </div>
      </div>
    </div>
  );
}
