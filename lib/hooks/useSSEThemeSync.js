/**
 * SSE Theme Synchronization Hook
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | PHASE 2 UI INTEGRATION
 * Enhanced theme synchronization with SSE real-time broadcasting
 * 
 * Features:
 * - Real-time theme sync across tabs
 * - Optimistic UI updates
 * - Fallback to local storage
 * - Cross-tab coordination
 * - Performance optimization
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSSEConnection } from './useSSEConnection';

/**
 * SSE Theme Synchronization Hook
 * Extends theme provider with real-time SSE broadcasting
 */
export function useSSEThemeSync({ 
  sessionId, 
  userId, 
  colorTheme, 
  setColorTheme, 
  onColorThemeChange,
  currentUser 
}) {
  const lastEmittedThemeRef = useRef(colorTheme);
  const isInitializedRef = useRef(false);
  
  const { 
    isConnected, 
    isFallback, 
    subscribe, 
    emit,
    connectionState 
  } = useSSEConnection({ 
    sessionId, 
    userId, 
    autoConnect: true 
  });

  /**
   * Emit theme change event via SSE
   */
  const emitThemeChange = useCallback(async (newTheme, source = 'user') => {
    if (!newTheme || newTheme === lastEmittedThemeRef.current) {
      return { success: true, reason: 'no-change' };
    }

    try {
      const result = await emit({
        eventType: 'ui.themeChanged',
        eventData: {
          theme: newTheme,
          userId,
          source,
          timestamp: Date.now()
        }
      });

      if (result.success) {
        lastEmittedThemeRef.current = newTheme;
        console.log(`Theme change emitted via SSE: ${newTheme}`);
      } else {
        console.warn('Failed to emit theme change via SSE:', result.error);
        // Fallback to local storage broadcast
        broadcastThemeViaStorage(newTheme, source);
      }

      return result;

    } catch (error) {
      console.error('SSE theme emission error:', error);
      broadcastThemeViaStorage(newTheme, source);
      return { success: false, error: error.message };
    }
  }, [emit, userId, broadcastThemeViaStorage]);

  /**
   * Fallback theme broadcasting via localStorage
   */
  const broadcastThemeViaStorage = useCallback((theme, source) => {
    if (typeof window === 'undefined') return;
    
    const themeEvent = {
      type: 'theme-change',
      theme,
      userId,
      source,
      timestamp: Date.now()
    };
    
    localStorage.setItem('sse-theme-broadcast', JSON.stringify(themeEvent));
    
    // Dispatch storage event for same-tab components
    window.dispatchEvent(new CustomEvent('sse-theme-fallback', {
      detail: themeEvent
    }));
    
    console.log(`Theme change broadcast via localStorage fallback: ${theme}`);
  }, [userId]);

  /**
   * Handle incoming theme change events
   */
  const handleThemeChangeEvent = useCallback((eventData) => {
    // Ignore our own theme changes
    if (eventData.eventData?.userId === userId && 
        eventData.eventData?.source === 'user') {
      return;
    }

    const newTheme = eventData.eventData?.theme;
    if (newTheme && newTheme !== colorTheme) {
      console.log(`Received theme change from SSE: ${newTheme}`);
      setColorTheme(newTheme);
      
      // Persist the change
      if (onColorThemeChange && currentUser) {
        onColorThemeChange(currentUser.id, newTheme, currentUser.isGuest)
          .catch(error => {
            console.error('Failed to persist received theme change:', error);
          });
      }
    }
  }, [userId, colorTheme, setColorTheme, onColorThemeChange, currentUser]);

  /**
   * Enhanced theme change handler with SSE
   */
  const handleThemeChangeWithSSE = useCallback(async (newTheme) => {
    // Immediate optimistic update
    setColorTheme(newTheme);
    
    try {
      // Persist to user preferences
      if (onColorThemeChange && currentUser) {
        await onColorThemeChange(currentUser.id, newTheme, currentUser.isGuest);
      }
      
      // Broadcast via SSE
      await emitThemeChange(newTheme, 'user');
      
    } catch (error) {
      console.error('Theme change with SSE failed:', error);
      
      // Revert optimistic update on failure
      if (currentUser?.preferences?.colorTheme) {
        setColorTheme(currentUser.preferences.colorTheme);
      }
    }
  }, [setColorTheme, onColorThemeChange, currentUser, emitThemeChange]);

  /**
   * Listen for localStorage fallback events
   */
  const handleStorageFallback = useCallback((event) => {
    if (event.key === 'sse-theme-broadcast') {
      try {
        const themeEvent = JSON.parse(event.newValue);
        
        // Ignore our own events
        if (themeEvent.userId === userId) return;
        
        const newTheme = themeEvent.theme;
        if (newTheme && newTheme !== colorTheme) {
          console.log(`Received theme change from localStorage fallback: ${newTheme}`);
          setColorTheme(newTheme);
          
          // Persist the change
          if (onColorThemeChange && currentUser) {
            onColorThemeChange(currentUser.id, newTheme, currentUser.isGuest)
              .catch(error => {
                console.error('Failed to persist fallback theme change:', error);
              });
          }
        }
      } catch (error) {
        console.error('Failed to parse localStorage theme event:', error);
      }
    }
  }, [userId, colorTheme, setColorTheme, onColorThemeChange, currentUser]);

  /**
   * Handle custom fallback events (same tab)
   */
  const handleCustomFallback = useCallback((event) => {
    const themeEvent = event.detail;
    
    // Ignore our own events
    if (themeEvent.userId === userId) return;
    
    const newTheme = themeEvent.theme;
    if (newTheme && newTheme !== colorTheme) {
      console.log(`Received theme change from custom fallback: ${newTheme}`);
      setColorTheme(newTheme);
    }
  }, [userId, colorTheme, setColorTheme]);

  // Subscribe to SSE theme events
  useEffect(() => {
    if (!isConnected) return;
    
    const unsubscribe = subscribe('ui.themeChanged', handleThemeChangeEvent);
    return unsubscribe;
  }, [isConnected, subscribe, handleThemeChangeEvent]);

  // Setup fallback event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('storage', handleStorageFallback);
    window.addEventListener('sse-theme-fallback', handleCustomFallback);
    
    return () => {
      window.removeEventListener('storage', handleStorageFallback);
      window.removeEventListener('sse-theme-fallback', handleCustomFallback);
    };
  }, [handleStorageFallback, handleCustomFallback]);

  // Emit initial theme when SSE connects
  useEffect(() => {
    if (isConnected && !isInitializedRef.current && colorTheme) {
      emitThemeChange(colorTheme, 'sync');
      isInitializedRef.current = true;
    }
  }, [isConnected, colorTheme, emitThemeChange]);

  // Monitor fallback activation
  useEffect(() => {
    const handleFallbackActivation = (event) => {
      console.log('SSE fallback activated for theme sync - using localStorage');
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('sse-fallback-activated', handleFallbackActivation);
      return () => {
        window.removeEventListener('sse-fallback-activated', handleFallbackActivation);
      };
    }
  }, []);

  return {
    // Connection status
    isSSEConnected: isConnected,
    isFallbackMode: isFallback,
    connectionState,
    
    // Enhanced theme change handler
    setColorTheme: handleThemeChangeWithSSE,
    
    // Manual emit function for advanced use cases
    emitThemeChange,
    
    // Status indicators
    canBroadcast: isConnected || isFallback,
    syncMethod: isConnected ? 'sse' : isFallback ? 'localStorage' : 'none'
  };
}