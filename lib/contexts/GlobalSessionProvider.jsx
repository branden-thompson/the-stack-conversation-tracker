/**
 * Global Session Provider
 * Manages session initialization and tracking at the app level
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import sessionTracker from '@/lib/services/session-tracker';
import { SESSION_EVENT_TYPES, SESSION_USER_TYPES } from '@/lib/utils/session-constants';
import { storeSessionId, getStoredSessionId, clearStoredSession, updateSessionTimestamp } from '@/lib/utils/session-storage';

const GlobalSessionContext = createContext(null);

export function GlobalSessionProvider({ children }) {
  const [currentSession, setCurrentSession] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  /**
   * Initialize or update session for a user
   */
  const initializeSession = useCallback(async (user) => {
    // Skip if already initializing
    if (currentSession?.userId === user?.id && isInitialized) {
      console.log('[GlobalSessionProvider] Session already initialized for user:', user?.name);
      return;
    }
    
    if (!user) {
      console.log('[GlobalSessionProvider] No user provided, creating guest session');
      
      // Create a provisioned guest session
      const guestId = `guest_${Date.now()}`;
      const guestUser = {
        id: guestId,
        name: 'Provisioned Guest',
        isGuest: true,
      };
      
      // Check for stored session
      const storedSessionId = getStoredSessionId(guestId);
      
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: guestId,
            userType: SESSION_USER_TYPES.GUEST,
            sessionId: storedSessionId,
            browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
            metadata: {
              userName: 'Provisioned Guest',
              route: typeof window !== 'undefined' ? window.location.pathname : '/',
              provisioned: true,
            },
          }),
        });
        
        if (response.ok) {
          const session = await response.json();
          console.log('[GlobalSessionProvider] Provisioned guest session:', session.id);
          setCurrentSession(session);
          storeSessionId(session.id, guestId);
          
          // Also initialize client-side tracker
          await sessionTracker.startSession(guestId, SESSION_USER_TYPES.GUEST);
        }
      } catch (error) {
        console.error('[GlobalSessionProvider] Failed to create guest session:', error);
      }
      
      return;
    }
    
    console.log('[GlobalSessionProvider] Initializing session for user:', user.name);
    
    // Check for stored session ID
    const storedSessionId = getStoredSessionId(user.id);
    if (storedSessionId) {
      console.log('[GlobalSessionProvider] Found stored session:', storedSessionId);
    }
    
    // Determine user type
    const userType = user.isGuest 
      ? SESSION_USER_TYPES.GUEST 
      : SESSION_USER_TYPES.REGISTERED;
    
    try {
      // Create or reuse session on server
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userType,
          sessionId: storedSessionId,
          browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
          metadata: {
            userName: user.name,
            route: typeof window !== 'undefined' ? window.location.pathname : '/',
            isSystemUser: user.isSystemUser || false,
            avatar: user.avatar,
          },
        }),
      });
      
      if (response.ok) {
        const session = await response.json();
        const isNewSession = response.status === 201;
        console.log('[GlobalSessionProvider] Session', isNewSession ? 'created' : 'reused', ':', session.id);
        
        setCurrentSession(session);
        storeSessionId(session.id, user.id);
        
        // Only initialize client-side tracker for new sessions
        if (isNewSession) {
          await sessionTracker.startSession(user.id, userType);
        }
        
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('[GlobalSessionProvider] Failed to create/reuse session:', error);
    }
  }, [currentSession, isInitialized]);
  
  /**
   * Emit a tracking event
   */
  const emit = useCallback((type, metadata = {}) => {
    if (!currentSession) {
      console.warn('[GlobalSessionProvider] No active session, cannot emit event');
      return;
    }
    
    return sessionTracker.emitEvent(type, metadata);
  }, [currentSession]);
  
  /**
   * Emit card event
   */
  const emitCardEvent = useCallback((type, cardData) => {
    const eventType = {
      created: SESSION_EVENT_TYPES.CARD_CREATED,
      updated: SESSION_EVENT_TYPES.CARD_UPDATED,
      deleted: SESSION_EVENT_TYPES.CARD_DELETED,
      moved: SESSION_EVENT_TYPES.CARD_MOVED,
      flipped: SESSION_EVENT_TYPES.CARD_FLIPPED,
    }[type];
    
    if (eventType) {
      emit(eventType, cardData);
    }
  }, [emit]);
  
  /**
   * Emit UI interaction event
   */
  const emitUIEvent = useCallback((type, metadata = {}) => {
    const eventType = {
      dialogOpen: SESSION_EVENT_TYPES.DIALOG_OPENED,
      dialogClose: SESSION_EVENT_TYPES.DIALOG_CLOSED,
      trayOpen: SESSION_EVENT_TYPES.TRAY_OPENED,
      trayClose: SESSION_EVENT_TYPES.TRAY_CLOSED,
      buttonClick: SESSION_EVENT_TYPES.BUTTON_CLICKED,
    }[type];
    
    if (eventType) {
      emit(eventType, metadata);
    }
  }, [emit]);
  
  /**
   * Emit preference change event
   */
  const emitPreferenceEvent = useCallback((type, metadata = {}) => {
    const eventType = {
      theme: SESSION_EVENT_TYPES.THEME_CHANGED,
      animation: SESSION_EVENT_TYPES.ANIMATION_TOGGLED,
      preference: SESSION_EVENT_TYPES.PREFERENCE_UPDATED,
    }[type];
    
    if (eventType) {
      emit(eventType, metadata);
    }
  }, [emit]);
  
  // Don't auto-initialize - let Board component handle it when user is known
  
  // Track route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (currentSession) {
        emit(SESSION_EVENT_TYPES.ROUTE_CHANGE, {
          from: currentSession.currentRoute,
          to: window.location.pathname,
        });
        sessionTracker.updateRoute(window.location.pathname);
      }
    };
    
    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [currentSession, emit]);
  
  // Update session timestamp periodically to keep it alive
  useEffect(() => {
    if (!currentSession) return;
    
    // Update every 5 minutes
    const interval = setInterval(() => {
      updateSessionTimestamp();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentSession]);
  
  // Clean up session on window unload
  useEffect(() => {
    const handleUnload = () => {
      if (currentSession) {
        // Use sendBeacon for reliable cleanup
        navigator.sendBeacon(`/api/sessions?id=${currentSession.id}`, JSON.stringify({
          method: 'DELETE'
        }));
        clearStoredSession();
      }
    };
    
    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentSession]);
  
  const contextValue = {
    currentSession,
    isInitialized,
    initializeSession,
    emit,
    emitCardEvent,
    emitUIEvent,
    emitPreferenceEvent,
    startSession: initializeSession,
    endSession: async () => {
      const session = await sessionTracker.endSession();
      setCurrentSession(null);
      return session;
    },
  };
  
  return (
    <GlobalSessionContext.Provider value={contextValue}>
      {children}
    </GlobalSessionContext.Provider>
  );
}

export function useGlobalSession() {
  const context = useContext(GlobalSessionContext);
  if (!context) {
    throw new Error('useGlobalSession must be used within GlobalSessionProvider');
  }
  return context;
}