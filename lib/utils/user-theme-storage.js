/**
 * User Theme Storage Utilities
 * 
 * Provides safe per-user theme mode storage with error handling and defaults.
 * Enables theme mode isolation between users while preserving data integrity.
 */

/**
 * Generate localStorage key for user theme mode
 * @param {string} userId - User ID (can be guest_xxx or regular user ID)
 * @returns {string} Storage key for user's theme mode
 */
export const getThemeModeKey = (userId) => {
  if (!userId) {
    console.warn('[UserThemeStorage] No userId provided, using fallback');
    return 'user_fallback_theme_mode';
  }
  return `user_${userId}_theme_mode`;
};

/**
 * Get default theme mode for user type
 * @param {Object} user - User object with isGuest property
 * @returns {string} Default theme mode ('light' | 'dark' | 'system')
 */
export const getDefaultThemeMode = (user) => {
  // All users default to dark mode as per requirements
  // Guests explicitly default to dark mode
  if (user?.isGuest) {
    return 'dark';
  }
  
  // Registered users check preferences first, then default to dark
  return user?.preferences?.themeMode || 'dark';
};

/**
 * Safely get user's theme mode from localStorage
 * @param {string} userId - User ID
 * @param {Object} user - User object for default determination
 * @returns {string} User's theme mode or default
 */
export const getUserThemeMode = (userId, user = null) => {
  if (!userId) {
    console.warn('[UserThemeStorage] getUserThemeMode called without userId');
    return 'dark';
  }
  
  try {
    const key = getThemeModeKey(userId);
    const stored = localStorage.getItem(key);
    
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    
    // No stored value or invalid value, use default
    const defaultMode = getDefaultThemeMode(user);
    
    // Store the default for future use
    try {
      localStorage.setItem(key, defaultMode);
    } catch (error) {
      console.warn('[UserThemeStorage] Failed to store default theme mode:', error);
    }
    
    return defaultMode;
  } catch (error) {
    console.error('[UserThemeStorage] Error getting user theme mode:', error);
    return getDefaultThemeMode(user);
  }
};

/**
 * Safely set user's theme mode in localStorage
 * @param {string} userId - User ID
 * @param {string} mode - Theme mode ('light' | 'dark' | 'system')
 * @returns {boolean} Success status
 */
export const setUserThemeMode = (userId, mode) => {
  if (!userId) {
    console.warn('[UserThemeStorage] setUserThemeMode called without userId');
    return false;
  }
  
  if (!['light', 'dark', 'system'].includes(mode)) {
    console.warn('[UserThemeStorage] Invalid theme mode:', mode);
    return false;
  }
  
  try {
    const key = getThemeModeKey(userId);
    localStorage.setItem(key, mode);
    
    // Optional: Trigger storage event for cross-tab sync
    // This will be picked up by other tabs with the same user
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      newValue: mode,
      oldValue: localStorage.getItem(key),
      storageArea: localStorage
    }));
    
    return true;
  } catch (error) {
    console.error('[UserThemeStorage] Error setting user theme mode:', error);
    return false;
  }
};

/**
 * Remove user's theme mode from localStorage (cleanup on user deletion)
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
export const removeUserThemeMode = (userId) => {
  if (!userId) {
    console.warn('[UserThemeStorage] removeUserThemeMode called without userId');
    return false;
  }
  
  try {
    const key = getThemeModeKey(userId);
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('[UserThemeStorage] Error removing user theme mode:', error);
    return false;
  }
};

/**
 * Get all user theme modes (for admin/debug purposes)
 * @returns {Object} Map of userId -> themeMode
 */
export const getAllUserThemes = () => {
  const userThemes = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('user_') && key.endsWith('_theme_mode')) {
        // Extract userId from key: user_${userId}_theme_mode
        const userId = key.slice(5, -11); // Remove 'user_' prefix and '_theme_mode' suffix
        const themeMode = localStorage.getItem(key);
        
        if (themeMode && ['light', 'dark', 'system'].includes(themeMode)) {
          userThemes[userId] = themeMode;
        }
      }
    }
  } catch (error) {
    console.error('[UserThemeStorage] Error getting all user themes:', error);
  }
  
  return userThemes;
};

/**
 * Get storage usage for user theme data (monitoring/debugging)
 * @returns {Object} Storage usage statistics
 */
export const getThemeStorageUsage = () => {
  try {
    const userThemes = getAllUserThemes();
    const keyCount = Object.keys(userThemes).length;
    
    // Estimate storage usage (rough calculation)
    const estimatedBytes = Object.entries(userThemes)
      .reduce((total, [userId, mode]) => {
        const keySize = getThemeModeKey(userId).length * 2; // UTF-16
        const valueSize = mode.length * 2; // UTF-16
        return total + keySize + valueSize;
      }, 0);
    
    return {
      userCount: keyCount,
      estimatedBytes,
      estimatedKB: Math.round(estimatedBytes / 1024 * 100) / 100,
      themes: userThemes
    };
  } catch (error) {
    console.error('[UserThemeStorage] Error calculating storage usage:', error);
    return {
      userCount: 0,
      estimatedBytes: 0,
      estimatedKB: 0,
      themes: {}
    };
  }
};

/**
 * Clean up old/orphaned user theme data
 * @param {Array} activeUserIds - List of currently active user IDs
 * @returns {number} Number of cleaned up entries
 */
export const cleanupOrphanedThemeData = (activeUserIds = []) => {
  let cleanedCount = 0;
  
  try {
    const userThemes = getAllUserThemes();
    const activeSet = new Set(activeUserIds);
    
    Object.keys(userThemes).forEach(userId => {
      if (!activeSet.has(userId)) {
        if (removeUserThemeMode(userId)) {
          cleanedCount++;
        }
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`[UserThemeStorage] Cleaned up ${cleanedCount} orphaned theme entries`);
    }
  } catch (error) {
    console.error('[UserThemeStorage] Error during cleanup:', error);
  }
  
  return cleanedCount;
};

/**
 * Feature flag check for user theme isolation
 * @returns {boolean} Whether user theme isolation is enabled
 */
export const isUserThemeIsolationEnabled = () => {
  // Check environment variable
  if (process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION !== 'true') {
    return false;
  }
  
  // Check emergency disable flag
  if (typeof window !== 'undefined') {
    const emergencyDisabled = localStorage.getItem('user_theme_isolation_disabled');
    if (emergencyDisabled === 'true') {
      return false;
    }
  }
  
  return true;
};

/**
 * Emergency disable function (for debugging/rollback)
 */
export const emergencyDisableUserThemeIsolation = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_theme_isolation_disabled', 'true');
    localStorage.setItem('theme_emergency_disable_reason', 'manual_emergency_disable');
    localStorage.setItem('theme_emergency_disable_time', Date.now().toString());
    
    console.warn('[UserThemeStorage] User theme isolation emergency disabled');
  }
};

/**
 * Re-enable user theme isolation (after debugging)
 */
export const enableUserThemeIsolation = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_theme_isolation_disabled');
    localStorage.removeItem('theme_emergency_disable_reason');
    
    console.log('[UserThemeStorage] User theme isolation re-enabled');
  }
};