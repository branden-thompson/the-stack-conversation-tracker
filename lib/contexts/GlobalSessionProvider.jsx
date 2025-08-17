/**
 * Global Session Provider
 * Manages session initialization and tracking at the app level
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import sessionTracker from '@/lib/services/session-tracker';
import { SESSION_EVENT_TYPES, SESSION_USER_TYPES } from '@/lib/utils/session-constants';
import { storeSessionId, getStoredSessionId, clearStoredSession, updateSessionTimestamp } from '@/lib/utils/session-storage';

const GlobalSessionContext = createContext(null);

export function GlobalSessionProvider({ children }) {
  const [currentSession, setCurrentSession] = useState(null);
  const pathname = usePathname();
  
  /**
   * Initialize or update session for a user
   */
  const initializeSession = useCallback(async (user) => {
    // Skip if already have a session for the exact same user
    if (currentSession?.userId === user?.id && currentSession?.userType === (user?.isGuest ? 'guest' : 'registered')) {
      console.log('[GlobalSessionProvider] Session already exists for user:', user?.name || 'guest');
      return;
    }
    
    // Handle user switching scenarios:
    // 1. Provisioned guest → Registered user
    // 2. Registered user → Different registered user
    // 3. Registered user → Guest (including provisioned)
    // 4. Guest → Different guest
    
    if (currentSession) {
      const switchingFromGuest = currentSession.metadata?.provisioned || currentSession.userType === 'guest';
      const switchingToGuest = !user || user.isGuest;
      
      console.log('[GlobalSessionProvider] User switch detected:', {
        from: currentSession.userName,
        to: user?.name || 'guest',
        fromType: currentSession.userType,
        toType: user ? (user.isGuest ? 'guest' : 'registered') : 'guest'
      });
      
      // Always create a new session when switching users
      // This ensures proper tracking for each user context
    }
    
    if (!user) {
      console.log('[GlobalSessionProvider] No user provided, using sessionGuestProvisioning for consistency');
      
      // Use sessionGuestProvisioning to ensure consistency with profile switcher
      const { sessionGuestProvisioning } = await import('@/lib/auth/guest-session');
      const provisionedGuest = await sessionGuestProvisioning.getOrCreateProvisionedGuest();
      
      if (!provisionedGuest) {
        console.error('[GlobalSessionProvider] Failed to get provisioned guest');
        return;
      }
      
      console.log('[GlobalSessionProvider] Using provisioned guest:', provisionedGuest.name, provisionedGuest.id);
      
      const guestUser = {
        id: provisionedGuest.id,
        name: provisionedGuest.name,
        isGuest: true,
        profilePicture: provisionedGuest.profilePicture,
      };
      
      // Check for stored session
      const storedSessionId = getStoredSessionId(guestUser.id);
      
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: guestUser.id,
            userType: SESSION_USER_TYPES.GUEST,
            sessionId: storedSessionId,
            browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
            metadata: {
              userName: guestUser.name,
              route: pathname || (typeof window !== 'undefined' ? window.location.pathname : '/'),
              provisioned: true,
              avatar: guestUser.profilePicture,
            },
          }),
        });
        
        if (response.ok) {
          const session = await response.json();
          console.log('[GlobalSessionProvider] Provisioned guest session:', session.id);
          setCurrentSession(session);
          storeSessionId(session.id, guestUser.id);
          
          // Also initialize client-side tracker with the API session ID
          await sessionTracker.startSession(guestUser.id, SESSION_USER_TYPES.GUEST, session.id);
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
            route: pathname || (typeof window !== 'undefined' ? window.location.pathname : '/'),
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
        
        // Initialize client-side tracker with the API session ID
        // This ensures the sessionTracker has a currentSession for emitting events
        await sessionTracker.startSession(user.id, userType, session.id);
      }
    } catch (error) {
      console.error('[GlobalSessionProvider] Failed to create/reuse session:', error);
    }
  }, [currentSession, pathname]);
  
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
  
  // Auto-initialize a guest session if no session exists
  useEffect(() => {
    // Only auto-initialize once per app load
    if (!currentSession && pathname) {
      console.log('[GlobalSessionProvider] Auto-initializing provisioned guest session for route:', pathname);
      // Create a provisioned guest session automatically for tracking
      // Don't set isInitialized here - let initializeSession handle it
      // This allows upgrading to a registered user later
      initializeSession(null);
    }
  }, [pathname, currentSession, initializeSession]);
  
  // Track route changes using Next.js pathname
  useEffect(() => {
    if (!currentSession || !pathname) return;
    
    const previousRoute = sessionTracker.currentSession?.currentRoute;
    
    console.log('[GlobalSessionProvider] Route change detected:', previousRoute, '->', pathname);
    
    // Only emit if route actually changed
    if (previousRoute && previousRoute !== pathname) {
      emit(SESSION_EVENT_TYPES.ROUTE_CHANGE, {
        from: previousRoute,
        to: pathname,
      });
    }
    
    // Always update the route in session tracker
    sessionTracker.updateRoute(pathname);
    
    // Always update the server-side session route
    if (currentSession.id) {
      console.log('[GlobalSessionProvider] Updating server session route:', currentSession.id, pathname);
      fetch(`/api/sessions/${currentSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: pathname }),
      }).catch(error => {
        console.error('Failed to update session route:', error);
      });
    }
  }, [pathname, currentSession, emit]);
  
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