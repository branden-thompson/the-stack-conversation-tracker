/**
 * Dynamic Theme Provider
 * Provides dynamic APP_THEME based on user's color theme selection
 * Enables hot reloading when theme changes
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { APP_THEME } from '@/lib/utils/ui-constants';
import { getCurrentAppTheme } from '@/lib/utils/ui-constants';

const ThemeContext = createContext({
  appTheme: APP_THEME,
  colorTheme: 'gray',
  setColorTheme: () => {},
});

export function DynamicThemeProvider({ 
  children, 
  initialColorTheme = 'gray',
  currentUser = null,
  onColorThemeChange = null // Callback for persistence
}) {
  const { theme: nextTheme, systemTheme } = useTheme();
  const [colorTheme, setColorTheme] = useState(() => {
    // Initialize with user preference if available, otherwise use initialColorTheme
    return currentUser?.preferences?.colorTheme || initialColorTheme;
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize theme from user preference only once
  useEffect(() => {
    if (!isInitialized && currentUser?.preferences?.colorTheme) {
      console.log('[ThemeProvider] Initializing theme from user preference:', currentUser.preferences.colorTheme);
      setColorTheme(currentUser.preferences.colorTheme);
      setIsInitialized(true);
    }
  }, [currentUser?.preferences?.colorTheme, isInitialized]);
  
  // Sync theme when user changes (but not on initial load)
  useEffect(() => {
    if (isInitialized && currentUser?.preferences?.colorTheme && 
        currentUser.preferences.colorTheme !== colorTheme) {
      console.log('[ThemeProvider] User changed, syncing theme:', currentUser.preferences.colorTheme);
      setColorTheme(currentUser.preferences.colorTheme);
    }
  }, [currentUser?.preferences?.colorTheme, colorTheme, isInitialized]);
  
  // Generate dynamic theme based on current selections
  const currentTheme = nextTheme === 'system' ? systemTheme : nextTheme;
  const appTheme = getCurrentAppTheme(colorTheme, currentTheme || 'light', systemTheme || 'light');
  
  // Enhanced setColorTheme with persistence
  const handleColorThemeChange = async (newTheme) => {
    console.log('[ThemeProvider] User-initiated color theme change:', newTheme);
    setColorTheme(newTheme);
    
    // Persist to user preferences
    if (onColorThemeChange && currentUser) {
      try {
        await onColorThemeChange(currentUser.id, newTheme, currentUser.isGuest);
        console.log('[ThemeProvider] Color theme persisted successfully');
      } catch (error) {
        console.error('[ThemeProvider] Failed to persist color theme:', error);
        // Optionally revert the change if persistence fails
        // setColorTheme(currentUser?.preferences?.colorTheme || initialColorTheme);
      }
    }
  };
  
  const contextValue = {
    appTheme,
    colorTheme,
    setColorTheme: handleColorThemeChange,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback to static theme if provider not found
    return {
      appTheme: APP_THEME,
      colorTheme: 'gray',
      setColorTheme: () => {},
    };
  }
  return context;
}

// Helper hook to get just the theme object
export function useDynamicAppTheme() {
  const { appTheme } = useAppTheme();
  return appTheme;
}