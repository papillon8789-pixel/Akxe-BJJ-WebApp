// Analytics tracking utility
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Track an analytics event
 * @param {string} eventType - Type of event: 'login', 'app_open', 'video_view', 'category_view'
 * @param {string} userEmail - User's email address
 * @param {object} metadata - Optional metadata (e.g., videoId, category name)
 */
export async function trackEvent(eventType, userEmail, metadata = null) {
  try {
    await fetch(`${API_BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        userEmail,
        metadata,
      }),
    });
  } catch (error) {
    // Silently fail - analytics should not break the app
    console.error('Analytics tracking failed:', error);
  }
}

/**
 * Track app open event (once per day per user)
 * @param {string} userEmail - User's email address
 */
export function trackAppOpen(userEmail) {
  return trackEvent('app_open', userEmail);
}

/**
 * Track video view event
 * @param {string} userEmail - User's email address
 * @param {number} videoId - Video ID
 * @param {string} videoName - Video name/title
 * @param {string} category - Video category
 */
export function trackVideoView(userEmail, videoId, videoName, category) {
  return trackEvent('video_view', userEmail, {
    videoId,
    videoName,
    category,
  });
}

/**
 * Track category view event
 * @param {string} userEmail - User's email address
 * @param {string} category - Category name
 */
export function trackCategoryView(userEmail, category) {
  return trackEvent('category_view', userEmail, {
    category,
  });
}
