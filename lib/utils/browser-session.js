/**
 * Browser Session Management
 * 
 * Provides a unique identifier for each browser tab/window that:
 * - Persists across page refreshes (sessionStorage)
 * - Is unique per tab (not shared across tabs)
 * - Links to server-side session tracking
 */

/**
 * Get or create a browser session ID for this tab
 * @returns {string|null} Browser session ID or null if not in browser
 */
export function getBrowserSessionId() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Extra safety check for sessionStorage availability
  try {
    const BROWSER_SESSION_KEY = 'browser_session_id';
    
    // Check if we already have a browser session ID for this tab
    let browserSessionId = sessionStorage.getItem(BROWSER_SESSION_KEY);
    
    if (!browserSessionId) {
      // Generate a new browser session ID
      // Format: bs_<timestamp>_<random>
      browserSessionId = `bs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(BROWSER_SESSION_KEY, browserSessionId);
      
    } else {
      // Retrieved existing session
    }
    
    return browserSessionId;
  } catch (error) {
    console.error('[BrowserSession] Error accessing sessionStorage:', error);
    return null;
  }
}

/**
 * Clear the browser session ID (for cleanup)
 */
export function clearBrowserSessionId() {
  if (typeof window === 'undefined') return;
  
  const BROWSER_SESSION_KEY = 'browser_session_id';
  const browserSessionId = sessionStorage.getItem(BROWSER_SESSION_KEY);
  
  if (browserSessionId) {
    sessionStorage.removeItem(BROWSER_SESSION_KEY);
  }
}

/**
 * Check if we have an active browser session
 * @returns {boolean}
 */
export function hasBrowserSession() {
  if (typeof window === 'undefined') return false;
  
  const BROWSER_SESSION_KEY = 'browser_session_id';
  return !!sessionStorage.getItem(BROWSER_SESSION_KEY);
}

/**
 * Browser session metadata
 */
export function getBrowserMetadata() {
  if (typeof window === 'undefined') return {};
  
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: Date.now()
  };
}