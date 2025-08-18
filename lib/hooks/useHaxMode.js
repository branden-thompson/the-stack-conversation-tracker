/**
 * useHaxMode Hook
 * 
 * Manages TUI hax-mode state with persistence:
 * - SessionStorage for guest users (per session)
 * - LocalStorage for registered users (across sessions)
 * 
 * Data-first approach: Only manages display state, never modifies data
 */

import { useState, useEffect, useCallback } from 'react';

const HAX_MODE_KEY = 'haxModeEnabled';
const HAX_MODE_SESSION_KEY = 'haxModeEnabledSession';

/**
 * Custom hook for managing hax-mode (TUI) state
 * @param {Object} currentUser - Current user object
 * @returns {Object} Hax mode state and controls
 */
export function useHaxMode(currentUser = null) {
  const [isHaxMode, setIsHaxMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Determine storage based on user type
  const getStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    // Guest users or no user: use sessionStorage
    if (!currentUser || currentUser.isGuest) {
      return window.sessionStorage;
    }
    
    // Registered users: use localStorage
    return window.localStorage;
  }, [currentUser]);
  
  // Get storage key based on user
  const getStorageKey = useCallback(() => {
    // Guest users or no user: use session key
    if (!currentUser || currentUser.isGuest) {
      return HAX_MODE_SESSION_KEY;
    }
    
    // Registered users: use persistent key with user ID
    return `${HAX_MODE_KEY}_${currentUser.id}`;
  }, [currentUser]);
  
  // Load saved preference on mount and when user changes
  useEffect(() => {
    const storage = getStorage();
    const key = getStorageKey();
    
    if (storage && key) {
      try {
        const saved = storage.getItem(key);
        if (saved !== null) {
          const enabled = saved === 'true';
          setIsHaxMode(enabled);
        }
      } catch (error) {
        console.error('[useHaxMode] Error loading preference:', error);
      }
    }
    
    setIsInitialized(true);
  }, [currentUser, getStorage, getStorageKey]);
  
  // Toggle hax mode
  const toggleHaxMode = useCallback(() => {
    const newValue = !isHaxMode;
    setIsHaxMode(newValue);
    
    // Save preference
    const storage = getStorage();
    const key = getStorageKey();
    
    if (storage && key) {
      try {
        storage.setItem(key, String(newValue));
      } catch (error) {
        console.error('[useHaxMode] Error saving preference:', error);
      }
    }
    
    // Apply or remove TUI classes to body
    if (typeof document !== 'undefined') {
      if (newValue) {
        document.body.classList.add('tui-mode');
        document.body.classList.add('tui-scanline');
      } else {
        document.body.classList.remove('tui-mode');
        document.body.classList.remove('tui-scanline');
        document.body.classList.remove('tui-crt');
      }
    }
    
    return newValue;
  }, [isHaxMode, getStorage, getStorageKey]);
  
  // Enable hax mode
  const enableHaxMode = useCallback(() => {
    if (!isHaxMode) {
      toggleHaxMode();
    }
  }, [isHaxMode, toggleHaxMode]);
  
  // Disable hax mode
  const disableHaxMode = useCallback(() => {
    if (isHaxMode) {
      toggleHaxMode();
    }
  }, [isHaxMode, toggleHaxMode]);
  
  // Apply TUI classes on state change
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    if (isHaxMode) {
      document.body.classList.add('tui-mode');
      document.body.classList.add('tui-scanline');
    } else {
      document.body.classList.remove('tui-mode');
      document.body.classList.remove('tui-scanline');
      document.body.classList.remove('tui-crt');
    }
    
    return () => {
      // Cleanup on unmount
      document.body.classList.remove('tui-mode');
      document.body.classList.remove('tui-scanline');
      document.body.classList.remove('tui-crt');
    };
  }, [isHaxMode]);
  
  return {
    isHaxMode,
    isInitialized,
    toggleHaxMode,
    enableHaxMode,
    disableHaxMode,
  };
}

/**
 * Helper to check if current page is a dev page
 * @param {string} pathname - Current pathname
 * @returns {boolean} Whether current page is a dev page
 */
export function isDevPage(pathname) {
  return pathname && pathname.startsWith('/dev');
}

/**
 * Helper to apply TUI styles conditionally
 * @param {boolean} isHaxMode - Whether hax mode is enabled
 * @param {string} normalClass - Normal CSS classes
 * @param {string} tuiClass - TUI CSS classes
 * @returns {string} Appropriate CSS classes
 */
export function conditionalTUIClass(isHaxMode, normalClass, tuiClass) {
  return isHaxMode ? tuiClass : normalClass;
}