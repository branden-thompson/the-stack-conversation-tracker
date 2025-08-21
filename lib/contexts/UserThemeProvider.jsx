/**
 * User Theme Provider
 * 
 * Provides per-user theme mode isolation by wrapping next-themes with user-specific storage.
 * Enables theme mode (Light/Dark/System) to be stored and restored per user while preserving
 * SSE system stability and existing DynamicThemeProvider functionality.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
  getUserThemeMode,
  setUserThemeMode,
  isUserThemeIsolationEnabled,
  getDefaultThemeMode
} from '@/lib/utils/user-theme-storage';

// User Theme Context
const UserThemeContext = createContext({
  userThemeMode: 'dark',
  setUserThemeMode: () => {},
  isUserThemeLoaded: false,
  syncThemeForUser: () => {},
  resetToDefault: () => {},
});

/**
 * UserThemeProvider Component
 * Wraps next-themes with user-specific theme mode management
 */
export function UserThemeProvider({ 
  children, 
  currentUser = null,
  enableCrossTabSync = true,
  onThemeChange = null 
}) {
  const { setTheme } = useTheme();
  const [userThemeMode, setUserThemeModeState] = useState('dark');
  const [isUserThemeLoaded, setIsUserThemeLoaded] = useState(false);
  const [lastUserId, setLastUserId] = useState(null);

  /**
   * Sync theme mode for specific user
   * @param {string} userId - User ID to sync theme for
   * @param {Object} user - User object for defaults
   */
  const syncThemeForUser = useCallback(async (userId, user = null) => {
    if (!isUserThemeIsolationEnabled()) {
      // Feature disabled, skip sync
      return;
    }
    
    if (!userId) {
      console.warn('[UserTheme] syncThemeForUser called without userId');
      return;
    }
    
    try {
      // Get user's stored theme mode
      const userMode = getUserThemeMode(userId, user);
      
      // Update local state
      setUserThemeModeState(userMode);
      
      // Update next-themes (this triggers the HTML class changes)
      setTheme(userMode);
      
      // Track which user we're synced to
      setLastUserId(userId);
      
      console.log(`[UserTheme] Synced theme mode for user ${userId}: ${userMode}`);
      
      // Optional callback for additional handling
      if (onThemeChange) {
        onThemeChange(userId, userMode);
      }
      
    } catch (error) {
      console.error('[UserTheme] Error syncing theme for user:', error);
      
      // Fallback to default
      const defaultMode = getDefaultThemeMode(user);
      setUserThemeModeState(defaultMode);
      setTheme(defaultMode);
    }
  }, [setTheme, onThemeChange]);

  /**
   * Set theme mode for current user
   * @param {string} mode - Theme mode to set
   */
  const handleSetUserThemeMode = useCallback((mode) => {
    if (!isUserThemeIsolationEnabled()) {
      // Feature disabled, just use next-themes directly
      setTheme(mode);
      return;
    }
    
    if (!currentUser?.id) {
      console.warn('[UserTheme] Cannot set theme mode without current user');
      return;
    }
    
    try {
      // Store in user-specific localStorage
      const success = setUserThemeMode(currentUser.id, mode);
      
      if (success) {
        // Update local state
        setUserThemeModeState(mode);
        
        // Update next-themes
        setTheme(mode);
        
        console.log(`[UserTheme] Set theme mode for user ${currentUser.id}: ${mode}`);
        
        // Optional callback
        if (onThemeChange) {
          onThemeChange(currentUser.id, mode);
        }
      } else {
        console.warn('[UserTheme] Failed to store theme mode, using next-themes only');
        setTheme(mode);
      }
      
    } catch (error) {
      console.error('[UserTheme] Error setting user theme mode:', error);
      
      // Fallback to next-themes
      setTheme(mode);
    }
  }, [currentUser?.id, setTheme, onThemeChange]);

  /**
   * Reset current user's theme to default
   */
  const resetToDefault = useCallback(() => {
    if (!currentUser) return;
    
    const defaultMode = getDefaultThemeMode(currentUser);
    handleSetUserThemeMode(defaultMode);
  }, [currentUser, handleSetUserThemeMode]);

  /**
   * Handle current user changes - sync theme when user switches
   */
  useEffect(() => {
    if (!isUserThemeIsolationEnabled()) {
      setIsUserThemeLoaded(true);
      return;
    }
    
    // Only sync if user actually changed
    if (currentUser?.id && currentUser.id !== lastUserId) {
      syncThemeForUser(currentUser.id, currentUser);
      setIsUserThemeLoaded(true);
    } else if (!currentUser?.id) {
      // No current user, use system default
      setUserThemeModeState('dark');
      setTheme('dark');
      setLastUserId(null);
      setIsUserThemeLoaded(true);
    }
  }, [currentUser?.id, lastUserId, syncThemeForUser, setTheme]);

  /**
   * Cross-tab synchronization via storage events
   */
  useEffect(() => {
    if (!enableCrossTabSync || !isUserThemeIsolationEnabled()) {
      return;
    }
    
    const handleStorageChange = (event) => {
      // Only handle theme mode changes
      if (!event.key || !event.key.startsWith('user_') || !event.key.endsWith('_theme_mode')) {
        return;
      }
      
      // Extract userId from key
      const userId = event.key.slice(5, -11); // Remove 'user_' prefix and '_theme_mode' suffix
      
      // Only sync if this is for the current user and the change came from another tab
      if (userId === currentUser?.id && event.newValue && event.newValue !== userThemeMode) {
        console.log(`[UserTheme] Cross-tab sync: ${userId} theme changed to ${event.newValue}`);
        
        setUserThemeModeState(event.newValue);
        setTheme(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser?.id, userThemeMode, setTheme, enableCrossTabSync]);

  /**
   * Context value
   */
  const contextValue = {
    userThemeMode,
    setUserThemeMode: handleSetUserThemeMode,
    isUserThemeLoaded,
    syncThemeForUser,
    resetToDefault,
  };

  return (
    <UserThemeContext.Provider value={contextValue}>
      {children}
    </UserThemeContext.Provider>
  );
}

/**
 * Hook to use UserTheme context
 */
export function useUserTheme() {
  const context = useContext(UserThemeContext);
  
  if (!context) {
    // Fallback behavior when provider is not available
    console.warn('[UserTheme] useUserTheme called outside of UserThemeProvider');
    return {
      userThemeMode: 'dark',
      setUserThemeMode: () => {},
      isUserThemeLoaded: true,
      syncThemeForUser: () => {},
      resetToDefault: () => {},
    };
  }
  
  return context;
}

/**
 * Hook for components that only need the current theme mode
 */
export function useUserThemeMode() {
  const { userThemeMode } = useUserTheme();
  return userThemeMode;
}

/**
 * Error boundary for theme-related errors
 */
export class UserThemeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error) {
    console.error('[UserTheme] Error boundary caught:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[UserTheme] Component error:', error, errorInfo);
    
    // Increment error count
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }));
    
    // Auto-disable if too many errors (safety measure)
    if (this.state.errorCount >= 3) {
      console.error('[UserTheme] Too many errors, emergency disable triggered');
      localStorage.setItem('user_theme_isolation_disabled', 'true');
      localStorage.setItem('theme_emergency_disable_reason', 'error_boundary_triggered');
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback to rendering children without user theme isolation
      console.warn('[UserTheme] Error boundary active, rendering without user theme isolation');
      return this.props.children;
    }

    return this.props.children;
  }
}

/**
 * Safe UserThemeProvider with error boundary
 */
export function SafeUserThemeProvider({ children, ...props }) {
  return (
    <UserThemeErrorBoundary>
      <UserThemeProvider {...props}>
        {children}
      </UserThemeProvider>
    </UserThemeErrorBoundary>
  );
}