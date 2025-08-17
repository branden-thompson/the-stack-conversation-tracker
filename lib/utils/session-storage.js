/**
 * Session Storage Utilities
 * Manages session persistence across page refreshes
 */

const SESSION_STORAGE_KEY = 'conversation_tracker_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Store session ID in localStorage
 */
export function storeSessionId(sessionId, userId) {
  if (typeof window === 'undefined') return;
  
  try {
    const sessionData = {
      sessionId,
      userId,
      timestamp: Date.now(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('[SessionStorage] Failed to store session:', error);
  }
}

/**
 * Retrieve stored session ID if still valid
 */
export function getStoredSessionId(userId) {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    
    const sessionData = JSON.parse(stored);
    
    // Check if session is for the same user
    if (sessionData.userId !== userId) {
      clearStoredSession();
      return null;
    }
    
    // Check if session is still valid (not expired)
    const age = Date.now() - sessionData.timestamp;
    if (age > SESSION_TIMEOUT) {
      clearStoredSession();
      return null;
    }
    
    return sessionData.sessionId;
  } catch (error) {
    console.error('[SessionStorage] Failed to retrieve session:', error);
    return null;
  }
}

/**
 * Clear stored session
 */
export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('[SessionStorage] Failed to clear session:', error);
  }
}

/**
 * Update session timestamp to keep it alive
 */
export function updateSessionTimestamp() {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return;
    
    const sessionData = JSON.parse(stored);
    sessionData.timestamp = Date.now();
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('[SessionStorage] Failed to update timestamp:', error);
  }
}