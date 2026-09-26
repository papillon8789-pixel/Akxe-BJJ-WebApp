import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingEmail, setProcessingEmail] = useState(null);
  const [customDateEmail, setCustomDateEmail] = useState(null);
  const [customDate, setCustomDate] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  // Lade pending users
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/admin/pending-users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending users');
      }

      const data = await response.json();
      setPendingUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin && token) {
      fetchPendingUsers();
    }
  }, [user, token]);

  // Approve user with months
  const handleApprove = async (email, paidMonths = 3) => {
    try {
      setProcessingEmail(email);
      setError(null);

      const response = await fetch(`${API_URL}/api/admin/approve-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, paidMonths }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve user');
      }

      // Refresh list
      await fetchPendingUsers();
      setCustomDateEmail(null);
      setCustomDate('');
    } catch (err) {
      console.error('Error approving user:', err);
      setError(err.message);
    } finally {
      setProcessingEmail(null);
    }
  };

  // Approve user with custom date
  const handleApproveWithDate = async (email, validUntilDate) => {
    try {
      setProcessingEmail(email);
      setError(null);

      const response = await fetch(`${API_URL}/api/admin/approve-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          validUntil: validUntilDate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve user');
      }

      // Refresh list
      await fetchPendingUsers();
      setCustomDateEmail(null);
      setCustomDate('');
    } catch (err) {
      console.error('Error approving user:', err);
      setError(err.message);
    } finally {
      setProcessingEmail(null);
    }
  };

  // Handle custom date submission
  const handleCustomDateSubmit = (email) => {
    if (!customDate) {
      setError('Please select a date');
      return;
    }
    handleApproveWithDate(email, customDate);
  };

  // Reject user
  const handleReject = async (email) => {
    if (!confirm(`Are you sure you want to reject ${email}?`)) {
      return;
    }

    try {
      setProcessingEmail(email);
      setError(null);

      const response = await fetch(`${API_URL}/api/admin/reject-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject user');
      }

      // Refresh list
      await fetchPendingUsers();
    } catch (err) {
      console.error('Error rejecting user:', err);
      setError(err.message);
    } finally {
      setProcessingEmail(null);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-card-bg border border-gray-700 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400">You don't have admin permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage user registrations and approvals</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-red-200 text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Users Card */}
        <div className="bg-card-bg border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Pending Registrations</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} waiting for approval
                </p>
              </div>
              <button
                onClick={fetchPendingUsers}
                disabled={loading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && pendingUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-primo-red mb-4"></div>
              <p className="text-gray-400">Loading pending users...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
              <p className="text-gray-400">No pending registrations at the moment.</p>
            </div>
          ) : (
            /* Users List */
            <div className="divide-y divide-gray-700">
              {pendingUsers.map((pendingUser) => (
                <div key={pendingUser.email} className="p-6 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primo-red to-red-700 rounded-full flex items-center justify-center text-white font-bold">
                          {pendingUser.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{pendingUser.email}</h3>
                          <p className="text-gray-400 text-sm">
                            Registered: {new Date(pendingUser.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {customDateEmail === pendingUser.email ? (
                        /* Custom Date Picker */
                        <div className="flex gap-2 items-center">
                          <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primo-red"
                          />
                          <button
                            onClick={() => handleCustomDateSubmit(pendingUser.email)}
                            disabled={processingEmail === pendingUser.email || !customDate}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                          >
                            ✓ Confirm
                          </button>
                          <button
                            onClick={() => {
                              setCustomDateEmail(null);
                              setCustomDate('');
                            }}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        /* Quick Approve Buttons */
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(pendingUser.email, 1)}
                            disabled={processingEmail === pendingUser.email}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                            title="Approve for 1 month"
                          >
                            {processingEmail === pendingUser.email ? '⏳' : '✓ 1M'}
                          </button>
                          <button
                            onClick={() => handleApprove(pendingUser.email, 3)}
                            disabled={processingEmail === pendingUser.email}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                            title="Approve for 3 months"
                          >
                            {processingEmail === pendingUser.email ? '⏳' : '✓ 3M'}
                          </button>
                          <button
                            onClick={() => handleApprove(pendingUser.email, 6)}
                            disabled={processingEmail === pendingUser.email}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                            title="Approve for 6 months"
                          >
                            {processingEmail === pendingUser.email ? '⏳' : '✓ 6M'}
                          </button>
                          <button
                            onClick={() => handleApprove(pendingUser.email, 12)}
                            disabled={processingEmail === pendingUser.email}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                            title="Approve for 12 months"
                          >
                            {processingEmail === pendingUser.email ? '⏳' : '✓ 12M'}
                          </button>
                          <button
                            onClick={() => {
                              setCustomDateEmail(pendingUser.email);
                              setCustomDate('');
                            }}
                            disabled={processingEmail === pendingUser.email}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                            title="Choose custom date"
                          >
                            📅 Custom
                          </button>
                          <button
                            onClick={() => handleReject(pendingUser.email)}
                            disabled={processingEmail === pendingUser.email}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                          >
                            {processingEmail === pendingUser.email ? '⏳' : '✗ Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 text-xl">ℹ️</span>
            <div className="flex-1">
              <h3 className="text-blue-200 font-semibold mb-1">How it works</h3>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Users can register themselves with their email</li>
                <li>• They receive a verification code but account stays "pending"</li>
                <li>• You approve them here with 3, 6, or 12 months access</li>
                <li>• They receive an email notification when approved</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
