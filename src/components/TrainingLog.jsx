import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Calendar, Clock, Flame, TrendingUp, Trash2, Plus, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// Session type presets
const SESSION_PRESETS = {
  'Basic': { duration: 60, type: 'Gi' },
  'All Levels BJJ': { duration: 90, type: 'Gi' },
  'TakeDown': { duration: 60, type: null }, // User chooses Gi/NoGi
  'Sparring': { duration: 120, type: null }, // User chooses Gi/NoGi
  'OpenMat': { duration: 120, type: null }, // User chooses Gi/NoGi
};

// Calories per minute (approximately 11.6 kcal/min for BJJ)
const CALORIES_PER_MINUTE = 11.6;

export default function TrainingLog() {
  const { token, user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sessionType: 'All Levels BJJ',
    duration: 90,
    giType: 'Gi',
    calories: Math.round(90 * CALORIES_PER_MINUTE),
  });
  
  // Data state
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Generate month options (Sep 2026 to Jun 2027)
  const generateMonthOptions = () => {
    const months = [];
    const startDate = new Date(2026, 8, 1); // September 2026 (month is 0-indexed)
    const endDate = new Date(2027, 5, 1); // June 2027
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const value = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const label = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months.push({ value, label });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  };

  const monthOptions = generateMonthOptions();

  // Fetch logs and analytics
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch logs
      const logsResponse = await fetch(`${API_URL}/api/training-log/list?month=${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!logsResponse.ok) throw new Error('Failed to fetch logs');
      const logsData = await logsResponse.json();
      setLogs(logsData.logs || []);

      // Fetch analytics
      const analyticsResponse = await fetch(`${API_URL}/api/training-log/analytics?month=${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!analyticsResponse.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, selectedMonth]);

  // Handle form changes
  const handleSessionTypeChange = (type) => {
    const preset = SESSION_PRESETS[type];
    const duration = preset.duration;
    const giType = preset.type || formData.giType;
    
    setFormData({
      ...formData,
      sessionType: type,
      duration: duration,
      giType: giType,
      calories: Math.round(duration * CALORIES_PER_MINUTE),
    });
  };

  const handleCaloriesChange = (calories) => {
    setFormData({
      ...formData,
      calories: calories,
    });
  };

  // Check if current session type allows Gi/NoGi selection
  const canSelectGiType = () => {
    return ['TakeDown', 'Sparring', 'OpenMat'].includes(formData.sessionType);
  };

  // Submit new log
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);

      const date = new Date(formData.date);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

      const response = await fetch(`${API_URL}/api/training-log/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          weekday: weekday,
          sessionType: formData.sessionType,
          durationMinutes: formData.duration,
          giType: formData.giType,
          caloriesBurned: formData.calories,
          notes: null,
        }),
      });

      if (!response.ok) throw new Error('Failed to add training log');

      // Reset form and refresh data
      setFormData({
        date: new Date().toISOString().split('T')[0],
        sessionType: 'All Levels BJJ',
        duration: 90,
        giType: 'Gi',
        calories: Math.round(90 * CALORIES_PER_MINUTE),
      });
      setShowForm(false);
      fetchData();

    } catch (err) {
      console.error('Error adding log:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete log
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this training log?')) return;

    try {
      setDeletingId(id);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/training-log/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete log');
      }
      
      // Refresh data after successful delete
      await fetchData();

    } catch (err) {
      console.error('Error deleting log:', err);
      setError(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Format duration
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Calculate Gi vs NoGi percentages
  const getGiNoGiPercentages = () => {
    if (!analytics?.giBreakdown || analytics.giBreakdown.length === 0) {
      return { gi: 0, noGi: 0 };
    }

    const totalMinutes = analytics.giBreakdown.reduce((sum, item) => sum + item.total_minutes, 0);
    const giMinutes = analytics.giBreakdown.find(item => item.gi_type === 'Gi')?.total_minutes || 0;
    const noGiMinutes = analytics.giBreakdown.find(item => item.gi_type === 'NoGi')?.total_minutes || 0;

    return {
      gi: totalMinutes > 0 ? Math.round((giMinutes / totalMinutes) * 100) : 0,
      noGi: totalMinutes > 0 ? Math.round((noGiMinutes / totalMinutes) * 100) : 0,
    };
  };

  const percentages = getGiNoGiPercentages();

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Only</h2>
          <p className="text-gray-400">This feature is only available for administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <div className="bg-card-bg border-b border-gray-800 text-white px-4 py-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-gray-400" />
            <h1 className="text-2xl md:text-3xl font-bold">Training Analytics</h1>
          </div>
          <p className="text-gray-400 text-sm md:text-base">Track your mat time and progress</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* Month Timeline */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {monthOptions.map((month) => (
              <button
                key={month.value}
                onClick={() => setSelectedMonth(month.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedMonth === month.value
                    ? 'bg-transparent text-white border-2 border-[#FF8C00] shadow-lg'
                    : 'bg-card-bg text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
                }`}
              >
                {month.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Entry Button */}
        <div className="mb-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full md:w-auto px-6 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Training Session
            </button>
          ) : (
            <button
              onClick={() => setShowForm(false)}
              className="w-full md:w-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          )}
        </div>

        {/* Quick Entry Form */}
        {showForm && (
          <div className="bg-card-bg rounded-xl p-6 mb-6 border border-gray-800 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primo-red" />
              Log Training Session
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-primo-red focus:outline-none"
                  required
                />
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Session Type</label>
                <select
                  value={formData.sessionType}
                  onChange={(e) => handleSessionTypeChange(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-primo-red focus:outline-none"
                  required
                >
                  {Object.keys(SESSION_PRESETS).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Duration - Read Only */}
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Duration
                </label>
                <div className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700">
                  {formData.duration} minutes
                </div>
              </div>

              {/* Gi Type - Only for TakeDown, Sparring, OpenMat */}
              {canSelectGiType() && (
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="Gi"
                        checked={formData.giType === 'Gi'}
                        onChange={(e) => setFormData({ ...formData, giType: e.target.value })}
                        className="w-4 h-4 text-primo-red"
                      />
                      <span className="text-white">Gi</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="NoGi"
                        checked={formData.giType === 'NoGi'}
                        onChange={(e) => setFormData({ ...formData, giType: e.target.value })}
                        className="w-4 h-4 text-primo-red"
                      />
                      <span className="text-white">No-Gi</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Calories */}
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Estimated Calories Burned
                </label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => handleCaloriesChange(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-primo-red focus:outline-none"
                  required
                />
                <p className="text-gray-500 text-xs mt-1">
                  Auto-calculated at ~11.6 kcal/min (adjustable)
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding...' : 'Add Training Log'}
              </button>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primo-red mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Analytics Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Donut Chart - Gi vs NoGi */}
              <div className="bg-card-bg rounded-xl p-6 border border-gray-800 shadow-lg">
                <div className="flex flex-col items-center">
                  {/* Simple Donut Chart */}
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="20"
                      />
                      {/* Gi segment (Cleveland Browns Orange) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#FF3C00"
                        strokeWidth="20"
                        strokeDasharray={`${percentages.gi * 2.51} 251`}
                        strokeLinecap="round"
                      />
                      {/* NoGi segment (Cleveland Browns Brown) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#311D00"
                        strokeWidth="20"
                        strokeDasharray={`${percentages.noGi * 2.51} 251`}
                        strokeDashoffset={`-${percentages.gi * 2.51}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {analytics?.summary?.sessionCount || 0}
                        </div>
                        <div className="text-xs text-gray-400">sessions</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF3C00]"></div>
                        <span className="text-sm text-gray-400">Gi</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{percentages.gi}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#311D00]"></div>
                        <span className="text-sm text-gray-400">No-Gi</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{percentages.noGi}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Duration */}
              <div className="bg-card-bg rounded-xl p-6 border border-gray-800 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-gray-400" />
                  <h3 className="text-gray-400 text-sm font-medium">Total Duration</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {formatDuration(analytics?.summary?.totalMinutes || 0)}
                </div>
                <p className="text-gray-400 text-sm">
                  {analytics?.summary?.sessionCount || 0} sessions
                </p>
              </div>

              {/* Avg Session Length */}
              <div className="bg-card-bg rounded-xl p-6 border border-gray-800 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-gray-400" />
                  <h3 className="text-gray-400 text-sm font-medium">Avg Session</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {formatDuration(analytics?.summary?.avgDuration || 0)}
                </div>
                <p className="text-gray-400 text-sm">per training</p>
              </div>

              {/* Calories Burned */}
              <div className="bg-card-bg rounded-xl p-6 border border-gray-800 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-6 h-6 text-gray-400" />
                  <h3 className="text-gray-400 text-sm font-medium">Calories Burned</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {(analytics?.summary?.totalCalories || 0).toLocaleString()}
                </div>
                <p className="text-gray-400 text-sm">kcal total</p>
              </div>
            </div>

            {/* Training Log History */}
            <div className="bg-card-bg rounded-xl p-6 border border-gray-800 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primo-red" />
                Training History
              </h3>

              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-400 text-lg mb-2">No training logs yet</p>
                  <p className="text-gray-600 text-sm">Add your first training session above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              log.gi_type === 'Gi' 
                                ? 'bg-orange-900/40 text-orange-400 border border-orange-700/50'
                                : 'bg-amber-900/40 text-amber-400 border border-amber-700/50'
                            }`}>
                              {log.gi_type}
                            </span>
                            <span className="text-white font-semibold">{log.session_type}</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(log.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(log.duration_minutes)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-4 h-4" />
                              {log.calories_burned} kcal
                            </span>
                          </div>

                          {log.notes && (
                            <p className="mt-2 text-sm text-gray-500 italic">"{log.notes}"</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete log"
                        >
                          {deletingId === log.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
