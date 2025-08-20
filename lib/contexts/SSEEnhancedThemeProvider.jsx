/**
 * SSE Enhanced Theme Provider
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | PHASE 2 UI INTEGRATION
 * Enhanced theme provider with real-time SSE synchronization
 * 
 * Features:
 * - Real-time theme sync across tabs
 * - Fallback to localStorage when SSE unavailable
 * - Optimistic UI updates
 * - Performance optimization
 * - Emergency response integration
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { APP_THEME } from '@/lib/utils/ui-constants';
import { getCurrentAppTheme } from '@/lib/utils/ui-constants';
import { useSSEThemeSync } from '@/lib/hooks/useSSEThemeSync';

const SSEThemeContext = createContext({
  appTheme: APP_THEME,
  colorTheme: 'gray',
  setColorTheme: () => {},
  isSSEConnected: false,
  syncMethod: 'none'
});

export function SSEEnhancedThemeProvider({ 
  children, 
  initialColorTheme = 'gray',
  currentUser = null,
  sessionId = null,
  onColorThemeChange = null
}) {
  const { theme: nextTheme, systemTheme } = useTheme();
  const [colorTheme, setColorTheme] = useState(() => {
    return currentUser?.preferences?.colorTheme || initialColorTheme;
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStats, setSyncStats] = useState({
    lastSync: null,
    syncCount: 0,
    failureCount: 0
  });

  // SSE Theme Synchronization
  const {
    isSSEConnected,
    isFallbackMode,
    setColorTheme: setColorThemeWithSSE,
    connectionState,
    syncMethod
  } = useSSEThemeSync({
    sessionId,
    userId: currentUser?.id,
    colorTheme,
    setColorTheme,
    onColorThemeChange,
    currentUser
  });

  // Initialize theme from user preference
  useEffect(() => {
    if (!isInitialized && currentUser?.preferences?.colorTheme) {
      console.log('[SSEThemeProvider] Initializing theme from user preference:', currentUser.preferences.colorTheme);
      setColorTheme(currentUser.preferences.colorTheme);
      setIsInitialized(true);
    }
  }, [currentUser?.preferences?.colorTheme, isInitialized]);

  // Sync theme when user changes
  useEffect(() => {
    if (isInitialized && currentUser?.preferences?.colorTheme && 
        currentUser.preferences.colorTheme !== colorTheme) {
      console.log('[SSEThemeProvider] User changed, syncing theme:', currentUser.preferences.colorTheme);
      setColorTheme(currentUser.preferences.colorTheme);
    }
  }, [currentUser?.preferences?.colorTheme, colorTheme, isInitialized]);

  // Generate dynamic theme
  const currentTheme = nextTheme === 'system' ? systemTheme : nextTheme;
  const appTheme = getCurrentAppTheme(colorTheme, currentTheme || 'light', systemTheme || 'light');

  // Enhanced theme change handler
  const handleColorThemeChange = useCallback(async (newTheme) => {
    console.log('[SSEThemeProvider] User-initiated theme change:', newTheme, 'via', syncMethod);
    
    try {
      // Use SSE-enhanced handler
      await setColorThemeWithSSE(newTheme);
      
      // Update sync stats
      setSyncStats(prev => ({
        ...prev,
        lastSync: Date.now(),
        syncCount: prev.syncCount + 1
      }));
      
      console.log('[SSEThemeProvider] Theme change successful via', syncMethod);
      
    } catch (error) {
      console.error('[SSEThemeProvider] Theme change failed:', error);
      
      // Update failure stats
      setSyncStats(prev => ({
        ...prev,
        failureCount: prev.failureCount + 1
      }));
      
      // Fallback to direct local change
      setColorTheme(newTheme);
      
      if (onColorThemeChange && currentUser) {
        try {
          await onColorThemeChange(currentUser.id, newTheme, currentUser.isGuest);
        } catch (persistError) {
          console.error('[SSEThemeProvider] Direct persistence also failed:', persistError);
        }
      }
    }
  }, [setColorThemeWithSSE, syncMethod, onColorThemeChange, currentUser]);

  const contextValue = {
    // Theme data
    appTheme,
    colorTheme,
    setColorTheme: handleColorThemeChange,
    
    // SSE status
    isSSEConnected,
    isFallbackMode,
    connectionState,
    syncMethod,
    
    // Sync statistics
    syncStats,
    
    // Helper flags
    canSyncRealtime: isSSEConnected,
    isUsingFallback: isFallbackMode || syncMethod === 'localStorage'
  };

  return (
    <SSEThemeContext.Provider value={contextValue}>
      {children}
    </SSEThemeContext.Provider>
  );
}

/**
 * Hook to access SSE-enhanced theme context
 */
export function useSSEAppTheme() {
  const context = useContext(SSEThemeContext);
  if (!context) {
    // Fallback to static theme if provider not found
    return {
      appTheme: APP_THEME,
      colorTheme: 'gray',
      setColorTheme: () => {},
      isSSEConnected: false,
      isFallbackMode: false,
      connectionState: 'disconnected',
      syncMethod: 'none',
      syncStats: { lastSync: null, syncCount: 0, failureCount: 0 },
      canSyncRealtime: false,
      isUsingFallback: true
    };
  }
  return context;
}

/**
 * Hook to get just the theme object (backward compatibility)
 */
export function useSSEDynamicAppTheme() {
  const { appTheme } = useSSEAppTheme();
  return appTheme;
}

/**
 * Hook for SSE theme sync status monitoring
 */
export function useThemeSyncStatus() {
  const { 
    isSSEConnected, 
    isFallbackMode, 
    connectionState, 
    syncMethod, 
    syncStats 
  } = useSSEAppTheme();
  
  return {
    isConnected: isSSEConnected,
    isFallback: isFallbackMode,
    state: connectionState,
    method: syncMethod,
    stats: syncStats,
    isHealthy: isSSEConnected || isFallbackMode
  };
}