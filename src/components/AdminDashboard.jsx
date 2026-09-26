import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // pending, active, suspended
  const [allUsers, setAllUsers] = useState({ pending: [], active: [], suspended: [] });
  const [counts, setCounts] = useState({ pending: 0, active: 0, suspended: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingEmail, setProcessingEmail] = useState(null);
  const [customDateEmail, setCustomDateEmail] = useState(null);
  const [customDate, setCustomDate] = useState('');
  const [extendEmail, setExtendEmail] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/admin/all-users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setAllUsers(data.grouped || { pending: [], active: [], suspended: [] });
      setCounts(data.counts || { pending: 0, active: 0, suspended: 0, total: 0 });
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin && token) {
      fetchAllUsers();
    }
  }, [user, token]);

  // Approve pending user
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

      await fetchAllUsers();
      setCustomDateEmail(null);
      setCustomDate('');
    } catch (err) {
      console.error('Error approving user:', err);
      setError(err.message);
    } finally {
      setProcessingEmail(null);
    }
  };

  // Approve with custom date
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
        body: JSON.stringify({ email, validUntil: validUntilDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve user');
      }

      await fetchAllUsers();
      setCustomDateEmail(null);
      setCustomDate('');
    } catch (err) {
      console.error('Error approving user:', err);
      setError(err.message);
    } finally {
      setProcessingEmail(null);
    }
  };

  // Reject pending user
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

      await fetchAllUsers();
    } catch (err) {
      console.error('Error rejecting user:', err);
      setError(err.message);
    } finally {
      setProcessingEmail(null);
    }
  };

  // Suspend active user
  const handleSuspend = async (email) => {
    const reason = prompt(`Suspend ${email}?\n\nOptional reason:`);
    if (reason === null) return; // User cancelled

    try {
      setProcessingEmail(email);
      setError(null);

      const response = await fetch(`${API_URL}/api/admin/suspend-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, reason: reason || undefined }),
      });

      if (!response.ok) {
        throw new Error('Failed to suspend user');
      }

      await fetchAllUsers();
      setActiveTab('suspended'); // Switch to suspended tab
    } catch (err) {
      console.error('Error suspending user:', err);
      setError(err.message);
    } finally {
      setProcessingEmail(null);
    }
  };

  // Reactivate suspended user
  const handleReactivate = async (email) => {
    if (!confirm(`Reactivate ${email}?`)) {
      return;
    }

    try {
      setProcessingEmail(email);
      setError(null);

      const response = await fetch(`${API_URL}/api/admin/reactivate-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate user');
      }

      await fetchAllUsers();
      setActiveTab('active'); // Switch to active tab
    } catch (err) {
      console.error('Error reactivating user:', err);
      setError(err.message);
    } finally {
      setProcessingEmail(null);
    }
  };

  // Extend access for active user
  const handleExtendAccess = async (email, paidMonths = null, validUntilDate = null) => {
    try {
      setProcessingEmail(email);
      setError(null);

      const body = { email };
      if (validUntilDate) {
        body.validUntil = validUntilDate;
      } else {
        body.paidMonths = paidMonths;
      }

      const response = await fetch(`${API_URL}/api/admin/extend-access`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to extend access');
      }

      await fetchAllUsers();
      setExtendEmail(null);
      setCustomDate('');
    } catch (err) {
      console.error('Error extending access:', err);
      setError(err.message);
    } finally {
      setProcessingEmail(null);
    }
  };

  const handleCustomDateSubmit = (email) => {
    if (!customDate) {
      setError('Please select a date');
      return;
    }
    if (activeTab === 'pending') {
      handleApproveWithDate(email, customDate);
    } else if (activeTab === 'active') {
      handleExtendAccess(email, null, customDate);
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

  const currentUsers = allUsers[activeTab] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage all users and their access</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-red-200 text-sm font-medium">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card-bg border border-gray-700 rounded-lg overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'pending'
                  ? 'bg-primo-red text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              Active ({counts.active})
            </button>
            <button
              onClick={() => setActiveTab('suspended')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'suspended'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              Suspended ({counts.suspended})
            </button>
          </div>

          {/* Tab Header */}
          <div className="p-6 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {activeTab === 'pending' && 'Pending Registrations'}
                  {activeTab === 'active' && 'Active Users'}
                  {activeTab === 'suspended' && 'Suspended Users'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {currentUsers.length} user{currentUsers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={fetchAllUsers}
                disabled={loading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && currentUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-primo-red mb-4"></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : currentUsers.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">
                {activeTab === 'pending' && '✅'}
                {activeTab === 'active' && '👥'}
                {activeTab === 'suspended' && '🚫'}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {activeTab === 'pending' && 'No pending registrations'}
                {activeTab === 'active' && 'No active users'}
                {activeTab === 'suspended' && 'No suspended users'}
              </h3>
              <p className="text-gray-400">
                {activeTab === 'pending' && 'All caught up!'}
                {activeTab === 'active' && 'No users have active access'}
                {activeTab === 'suspended' && 'No users are currently suspended'}
              </p>
            </div>
          ) : (
            /* Users List */
            <div className="divide-y divide-gray-700">
              {currentUsers.map((u) => (
                <div key={u.email} className="p-6 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          activeTab === 'pending' ? 'bg-gradient-to-br from-primo-red to-red-700' :
                          activeTab === 'active' ? 'bg-gradient-to-br from-green-600 to-green-700' :
                          'bg-gradient-to-br from-orange-600 to-orange-700'
                        }`}>
                          {u.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold">{u.email}</h3>
                            {u.is_admin === 1 && (
                              <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded">ADMIN</span>
                            )}
                          </div>
                          <div className="flex gap-4 text-gray-400 text-sm mt-1">
                            {activeTab === 'pending' && (
                              <span>Registered: {new Date(u.created_at).toLocaleDateString()}</span>
                            )}
                            {activeTab === 'active' && (
                              <>
                                <span>Valid Until: {new Date(u.valid_until).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{u.paid_months} month{u.paid_months > 1 ? 's' : ''}</span>
                                {u.approved_by && (
                                  <>
                                    <span>•</span>
                                    <span>Approved by: {u.approved_by}</span>
                                  </>
                                )}
                              </>
                            )}
                            {activeTab === 'suspended' && (
                              <>
                                <span>Suspended</span>
                                {u.valid_until && (
                                  <>
                                    <span>•</span>
                                    <span>Was valid until: {new Date(u.valid_until).toLocaleDateString()}</span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {activeTab === 'pending' && (
                        <>
                          {customDateEmail === u.email ? (
                            <div className="flex gap-2 items-center">
                              <input
                                type="date"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primo-red"
                              />
                              <button
                                onClick={() => handleCustomDateSubmit(u.email)}
                                disabled={processingEmail === u.email || !customDate}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => { setCustomDateEmail(null); setCustomDate(''); }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-all"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => handleApprove(u.email, 1)} disabled={processingEmail === u.email} className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg" title="1 month">
                                {processingEmail === u.email ? '⏳' : '✓ 1M'}
                              </button>
                              <button onClick={() => handleApprove(u.email, 3)} disabled={processingEmail === u.email} className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg" title="3 months">
                                {processingEmail === u.email ? '⏳' : '✓ 3M'}
                              </button>
                              <button onClick={() => handleApprove(u.email, 6)} disabled={processingEmail === u.email} className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg" title="6 months">
                                {processingEmail === u.email ? '⏳' : '✓ 6M'}
                              </button>
                              <button onClick={() => handleApprove(u.email, 12)} disabled={processingEmail === u.email} className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg" title="12 months">
                                {processingEmail === u.email ? '⏳' : '✓ 12M'}
                              </button>
                              <button onClick={() => { setCustomDateEmail(u.email); setCustomDate(''); }} disabled={processingEmail === u.email} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg" title="Custom date">
                                📅
                              </button>
                              <button onClick={() => handleReject(u.email)} disabled={processingEmail === u.email} className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg">
                                {processingEmail === u.email ? '⏳' : '✗'}
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {activeTab === 'active' && (
                        <>
                          {extendEmail === u.email ? (
                            <div className="flex gap-2 items-center">
                              <input
                                type="date"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                              />
                              <button
                                onClick={() => handleCustomDateSubmit(u.email)}
                                disabled={processingEmail === u.email || !customDate}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => { setExtendEmail(null); setCustomDate(''); }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => handleExtendAccess(u.email, 1)} disabled={processingEmail === u.email || u.is_admin === 1} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg" title="Extend 1 month">
                                +1M
                              </button>
                              <button onClick={() => handleExtendAccess(u.email, 3)} disabled={processingEmail === u.email || u.is_admin === 1} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg" title="Extend 3 months">
                                +3M
                              </button>
                              <button onClick={() => handleExtendAccess(u.email, 6)} disabled={processingEmail === u.email || u.is_admin === 1} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg" title="Extend 6 months">
                                +6M
                              </button>
                              <button onClick={() => { setExtendEmail(u.email); setCustomDate(''); }} disabled={processingEmail === u.email || u.is_admin === 1} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg" title="Custom date">
                                📅
                              </button>
                              <button onClick={() => handleSuspend(u.email)} disabled={processingEmail === u.email || u.is_admin === 1} className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg" title="Suspend user">
                                🚫
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {activeTab === 'suspended' && (
                        <button
                          onClick={() => handleReactivate(u.email)}
                          disabled={processingEmail === u.email}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg"
                        >
                          {processingEmail === u.email ? '⏳ Processing...' : '✓ Reactivate'}
                        </button>
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
              <h3 className="text-blue-200 font-semibold mb-1">User Management Guide</h3>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• <strong>Pending:</strong> New registrations waiting for approval</li>
                <li>• <strong>Active:</strong> Users with valid access - extend or suspend</li>
                <li>• <strong>Suspended:</strong> Blocked users - can be reactivated</li>
                <li>• Admin users cannot be suspended or have their access modified</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
