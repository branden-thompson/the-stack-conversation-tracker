/**
 * useUserTheme Hook
 * 
 * Custom theme hook that stores theme preferences per user instead of globally
 * This provides isolation between users and browser tabs
 */

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';

/**
 * Custom hook for user-specific theme management
 * @param {Object} currentUser - Current active user object
 * @param {Function} updateUserPreferences - Function to update user preferences in database
 * @returns {Object} Theme state and controls
 */
export function useUserTheme(currentUser, updateUserPreferences) {
  const { setTheme: setGlobalTheme, systemTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isManualThemeChange, setIsManualThemeChange] = useState(false);

  console.log('🎨 useUserTheme called:', { 
    currentUser: currentUser?.id, 
    hasPreferences: !!currentUser?.preferences,
    theme: currentUser?.preferences?.theme,
    updateUserPreferences: !!updateUserPreferences 
  });

  // Get user's theme preference or fall back to system
  const userTheme = currentUser?.preferences?.theme || 'system';
  
  // Calculate the actual theme (resolve 'system' to light/dark)
  const resolvedTheme = userTheme === 'system' ? systemTheme : userTheme;

  /**
   * Update user's theme preference and apply it manually (no global theme to avoid cross-tab interference)
   * @param {string} newTheme - Theme to set ('light', 'dark', 'system')
   */
  const setUserTheme = useCallback(async (newTheme) => {
    console.log('🎨 setUserTheme called:', { newTheme, currentUser: currentUser?.id, updateUserPreferences: !!updateUserPreferences });
    
    if (!currentUser || !updateUserPreferences) {
      console.warn('Cannot set user theme: no current user or update function', { currentUser: !!currentUser, updateUserPreferences: !!updateUserPreferences });
      return;
    }

    try {
      console.log('🎨 Updating user preferences:', currentUser.id, { theme: newTheme });
      // Update user preferences in database
      await updateUserPreferences(currentUser.id, { theme: newTheme });
      
      // Apply theme manually to avoid cross-tab interference
      const resolvedTheme = newTheme === 'system' ? systemTheme : newTheme;
      const documentElement = document.documentElement;
      
      console.log('🎨 Applying user theme manually:', resolvedTheme);
      
      // Remove existing theme classes
      documentElement.classList.remove('light', 'dark');
      
      // Add the new theme class
      if (resolvedTheme) {
        documentElement.classList.add(resolvedTheme);
      }
      
      // Update the data-theme attribute for compatibility
      documentElement.setAttribute('data-theme', resolvedTheme || 'light');
      
      console.log('🎨 User theme applied manually:', resolvedTheme);
    } catch (error) {
      console.error('Failed to update user theme:', error);
    }
  }, [currentUser, updateUserPreferences, systemTheme]);

  // Apply user's theme when user changes or on mount
  useEffect(() => {
    if (currentUser && currentUser.preferences && userTheme) {
      // Apply theme manually instead of using setGlobalTheme
      const resolvedTheme = userTheme === 'system' ? systemTheme : userTheme;
      const documentElement = document.documentElement;
      
      console.log('🎨 useUserTheme useEffect - applying theme on mount:', resolvedTheme);
      
      // Remove existing theme classes
      documentElement.classList.remove('light', 'dark');
      
      // Add the new theme class
      if (resolvedTheme) {
        documentElement.classList.add(resolvedTheme);
      }
      
      // Update the data-theme attribute for compatibility
      documentElement.setAttribute('data-theme', resolvedTheme || 'light');
      
      setIsLoading(false);
    } else if (currentUser && !currentUser.preferences) {
      // User has no preferences, use system default
      const resolvedTheme = systemTheme || 'light';
      const documentElement = document.documentElement;
      
      console.log('🎨 useUserTheme useEffect - applying system default:', resolvedTheme);
      
      documentElement.classList.remove('light', 'dark');
      if (resolvedTheme) {
        documentElement.classList.add(resolvedTheme);
      }
      documentElement.setAttribute('data-theme', resolvedTheme);
      
      setIsLoading(false);
    }
  }, [currentUser, userTheme, systemTheme]);

  // Mark as loaded after theme provider is ready
  useEffect(() => {
    if (systemTheme) {
      setIsLoading(false);
    }
  }, [systemTheme]);

  return {
    // Current theme values
    theme: userTheme,
    resolvedTheme,
    systemTheme,
    isLoading,
    
    // Theme control
    setTheme: setUserTheme,
    
    // Utilities
    isLight: resolvedTheme === 'light',
    isDark: resolvedTheme === 'dark',
    isSystem: userTheme === 'system'
  };
}