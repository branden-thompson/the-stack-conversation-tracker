/**
 * useUserTheme Hook
 * 
 * Convenience hook that provides user theme functionality with additional utilities.
 * Combines UserThemeProvider context with next-themes integration for seamless usage.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useUserTheme as useUserThemeContext } from '@/lib/contexts/UserThemeProvider';
import { 
  isUserThemeIsolationEnabled,
  getUserThemeMode,
  setUserThemeMode as setUserThemeModeStorage,
  getDefaultThemeMode
} from '@/lib/utils/user-theme-storage';

/**
 * Enhanced useUserTheme hook with additional utilities
 * @param {Object} currentUser - Current user object
 * @param {Object} options - Configuration options
 */
export function useUserTheme(currentUser = null, options = {}) {
  const { 
    userThemeMode, 
    setUserThemeMode, 
    isUserThemeLoaded, 
    syncThemeForUser, 
    resetToDefault 
  } = useUserThemeContext();
  
  const { theme: nextTheme, setTheme: setNextTheme, systemTheme } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Get the effective theme (resolves 'system' to actual theme)
   */
  const getEffectiveTheme = useCallback(() => {
    const currentTheme = isUserThemeIsolationEnabled() ? userThemeMode : nextTheme;
    return currentTheme === 'system' ? systemTheme : currentTheme;
  }, [userThemeMode, nextTheme, systemTheme]);

  /**
   * Enhanced theme setting with user awareness
   */
  const setTheme = useCallback((mode) => {
    if (isUserThemeIsolationEnabled() && currentUser?.id) {
      setUserThemeMode(mode);
    } else {
      setNextTheme(mode);
    }
  }, [currentUser?.id, setUserThemeMode, setNextTheme]);

  /**
   * Initialize user theme on mount
   */
  useEffect(() => {
    if (!isInitialized && currentUser?.id && isUserThemeIsolationEnabled()) {
      // Initialize user theme from storage
      const storedMode = getUserThemeMode(currentUser.id, currentUser);
      if (storedMode !== userThemeMode) {
        syncThemeForUser(currentUser.id, currentUser);
      }
      setIsInitialized(true);
    }
  }, [currentUser, userThemeMode, syncThemeForUser, isInitialized]);

  /**
   * Check if theme is user-specific
   */
  const isUserSpecific = useCallback(() => {
    return isUserThemeIsolationEnabled() && !!currentUser?.id;
  }, [currentUser?.id]);

  /**
   * Get theme mode directly from storage (bypass context)
   */
  const getStoredThemeMode = useCallback((userId = null) => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return null;
    
    return getUserThemeMode(targetUserId, currentUser);
  }, [currentUser]);

  /**
   * Set theme mode directly in storage (bypass context)
   */
  const setStoredThemeMode = useCallback((mode, userId = null) => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return false;
    
    return setUserThemeModeStorage(targetUserId, mode);
  }, [currentUser]);

  /**
   * Check if user has custom theme (different from default)
   */
  const hasCustomTheme = useCallback((userId = null) => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return false;
    
    const storedMode = getUserThemeMode(targetUserId, currentUser);
    const defaultMode = getDefaultThemeMode(currentUser);
    
    return storedMode !== defaultMode;
  }, [currentUser]);

  /**
   * Get theme statistics for current user
   */
  const getThemeStats = useCallback(() => {
    if (!currentUser?.id) {
      return {
        userId: null,
        currentMode: nextTheme,
        isDefault: true,
        isUserSpecific: false,
        effectiveTheme: getEffectiveTheme()
      };
    }
    
    const storedMode = getUserThemeMode(currentUser.id, currentUser);
    const defaultMode = getDefaultThemeMode(currentUser);
    
    return {
      userId: currentUser.id,
      currentMode: storedMode,
      isDefault: storedMode === defaultMode,
      isUserSpecific: isUserSpecific(),
      effectiveTheme: getEffectiveTheme(),
      defaultMode
    };
  }, [currentUser, nextTheme, getEffectiveTheme, isUserSpecific]);

  return {
    // Theme state
    theme: isUserThemeIsolationEnabled() ? userThemeMode : nextTheme,
    effectiveTheme: getEffectiveTheme(),
    systemTheme,
    isUserThemeLoaded: isUserThemeIsolationEnabled() ? isUserThemeLoaded : true,
    
    // Theme actions
    setTheme,
    resetToDefault,
    syncThemeForUser,
    
    // Utilities
    isUserSpecific,
    hasCustomTheme,
    getStoredThemeMode,
    setStoredThemeMode,
    getThemeStats,
    
    // Feature status
    isUserThemeIsolationEnabled: isUserThemeIsolationEnabled(),
    
    // Advanced access (for debugging/admin)
    raw: {
      userThemeMode,
      nextTheme,
      setUserThemeMode,
      setNextTheme
    }
  };
}

/**
 * Simple hook for just getting current theme mode
 */
export function useCurrentTheme(currentUser = null) {
  const { theme, effectiveTheme } = useUserTheme(currentUser);
  return { theme, effectiveTheme };
}

/**
 * Hook for theme toggle components
 */
export function useThemeToggle(currentUser = null) {
  const { theme, setTheme, effectiveTheme, isUserThemeIsolationEnabled } = useUserTheme(currentUser);
  
  const toggleTheme = useCallback(() => {
    const modes = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  }, [theme, setTheme]);
  
  const setLightMode = useCallback(() => setTheme('light'), [setTheme]);
  const setDarkMode = useCallback(() => setTheme('dark'), [setTheme]);
  const setSystemMode = useCallback(() => setTheme('system'), [setTheme]);
  
  return {
    theme,
    effectiveTheme,
    isUserSpecific: isUserThemeIsolationEnabled && !!currentUser?.id,
    toggleTheme,
    setLightMode,
    setDarkMode,
    setSystemMode
  };
}

/**
 * Hook for debug/admin theme management
 */
export function useThemeDebug(currentUser = null) {
  const userTheme = useUserTheme(currentUser);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const refreshDebugInfo = useCallback(() => {
    const stats = userTheme.getThemeStats();
    const storage = typeof window !== 'undefined' ? 
      Object.keys(localStorage)
        .filter(key => key.includes('theme'))
        .reduce((obj, key) => {
          obj[key] = localStorage.getItem(key);
          return obj;
        }, {}) : {};
    
    setDebugInfo({
      ...stats,
      storage,
      timestamp: Date.now(),
      featureEnabled: isUserThemeIsolationEnabled()
    });
  }, [userTheme]);
  
  useEffect(() => {
    refreshDebugInfo();
  }, [refreshDebugInfo]);
  
  return {
    ...userTheme,
    debugInfo,
    refreshDebugInfo
  };
}