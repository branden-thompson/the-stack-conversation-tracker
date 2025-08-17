/**
 * Global Session Provider
 * Manages session initialization and tracking at the app level
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import sessionTracker from '@/lib/services/session-tracker';
import { SESSION_EVENT_TYPES, SESSION_USER_TYPES } from '@/lib/utils/session-constants';
import { storeSessionId, getStoredSessionId, clearStoredSession, updateSessionTimestamp } from '@/lib/utils/session-storage';
import { getBrowserSessionId, getBrowserMetadata } from '@/lib/utils/browser-session';

const GlobalSessionContext = createContext(null);

export function GlobalSessionProvider({ children }) {
  const [currentSession, setCurrentSession] = useState(null);
  const hasInitialized = useRef(false);
  const pathname = usePathname();
  
  // Debug: Verify component is mounting
  console.log('[GlobalSessionProvider] RENDERING, pathname:', pathname, 'hasInitialized:', hasInitialized.current, 'timestamp:', Date.now());
  
  /**
   * Initialize or update session for a user
   */
  const initializeSession = useCallback(async (user) => {
    // If no user provided, try to get provisioned guest from browser session first
    if (!user) {
      console.log('[GlobalSessionProvider] No user provided, checking browser session for provisioned guest');
      
      // Get browser session ID and check for provisioned guest from server
      const browserSessionId = getBrowserSessionId();
      let provisionedGuest = null;
      
      // If no browser session ID (SSR or not ready), skip for now
      if (!browserSessionId) {
        console.log('[GlobalSessionProvider] No browser session ID available, skipping guest initialization');
        return;
      }
      
      if (browserSessionId) {
        try {
          console.log('[GlobalSessionProvider] Fetching browser session:', browserSessionId);
          const response = await fetch(`/api/browser-sessions?id=${browserSessionId}`);
          console.log('[GlobalSessionProvider] Browser session response:', response.status);
          if (response.ok) {
            const browserSession = await response.json();
            console.log('[GlobalSessionProvider] Browser session data:', browserSession);
            if (browserSession.provisionedGuest) {
              provisionedGuest = browserSession.provisionedGuest;
              console.log('[GlobalSessionProvider] Using provisioned guest from browser session:', 
                provisionedGuest.name, provisionedGuest.id);
            } else {
              console.log('[GlobalSessionProvider] No provisioned guest in browser session');
            }
          } else {
            console.log('[GlobalSessionProvider] Browser session response not OK:', response.status);
          }
        } catch (error) {
          console.error('[GlobalSessionProvider] Error fetching browser session:', error);
        }
      }
      
      console.log('[GlobalSessionProvider] After browser session check, provisionedGuest:', provisionedGuest);
      
      // Fallback to client-side provisioning if needed
      if (!provisionedGuest) {
        const { sessionGuestProvisioning } = await import('@/lib/auth/guest-session');
        provisionedGuest = await sessionGuestProvisioning.getOrCreateProvisionedGuest();
        
        if (!provisionedGuest) {
          console.error('[GlobalSessionProvider] Failed to get provisioned guest');
          return;
        }
        console.log('[GlobalSessionProvider] Using client-provisioned guest:', provisionedGuest.name, provisionedGuest.id);
      }
      
      const guestUser = {
        id: provisionedGuest.id,
        name: provisionedGuest.name,
        isGuest: true,  // Ensure this is set
        profilePicture: provisionedGuest.profilePicture,
      };
      
      // Check for stored session
      const storedSessionId = getStoredSessionId(guestUser.id);
      
      const sessionData = {
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
      };
      
      console.log('[GlobalSessionProvider] Creating provisioned guest session:', guestUser.name, 'metadata:', sessionData.metadata);
      
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        });
        
        console.log('[GlobalSessionProvider] Session API response:', response.status, response.ok);
        
        if (response.ok) {
          const session = await response.json();
          console.log('[GlobalSessionProvider] Provisioned guest session created:', session.id, session);
          setCurrentSession(session);
          storeSessionId(session.id, guestUser.id);
          
          // Also initialize client-side tracker with the API session ID
          await sessionTracker.startSession(guestUser.id, SESSION_USER_TYPES.GUEST, session.id);
        } else {
          console.error('[GlobalSessionProvider] Failed to create session, status:', response.status);
          const errorText = await response.text();
          console.error('[GlobalSessionProvider] Error response:', errorText);
        }
      } catch (error) {
        console.error('[GlobalSessionProvider] Failed to create guest session:', error);
      }
      
      return;
    }
    
    // Now validate user object after potentially fetching provisioned guest
    if (!user || !user.id || user.id === 'undefined' || user.id === 'null') {
      console.log('[GlobalSessionProvider] Invalid or missing user after provisioned guest check');
      return;
    }
    
    // CRITICAL: Don't create sessions for system user
    if (user.id === 'system' || user.isSystemUser) {
      console.log('[GlobalSessionProvider] Skipping session for system user');
      return;
    }
    
    // Skip if already have a session for the exact same user
    if (currentSession?.userId === user?.id && currentSession?.userType === (user?.isGuest ? 'guest' : 'registered')) {
      console.log('[GlobalSessionProvider] Session already exists for user:', user?.name || 'guest');
      return;
    }
    
    // Handle user switching scenarios
    if (currentSession) {
      console.log('[GlobalSessionProvider] User switch detected:', {
        from: currentSession.userName,
        to: user?.name || 'guest',
        fromType: currentSession.userType,
        toType: user ? (user.isGuest ? 'guest' : 'registered') : 'guest'
      });
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
    
    // Build session data with proper metadata
    const sessionData = {
      userId: user.id,
      userType,
      sessionId: storedSessionId,
      browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      metadata: {
        userName: user.name,
        route: pathname || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        isSystemUser: user.isSystemUser || false,
        avatar: user.avatar || user.profilePicture,
        // CRITICAL: Mark guest users as provisioned
        provisioned: user.isGuest === true,
      },
    };
    
    console.log('[GlobalSessionProvider] Creating session for user:', user.name, 'isGuest:', user.isGuest, 'metadata:', sessionData.metadata);
    
    try {
      // Create or reuse session on server
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
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
  
  // Auto-initialize a guest session on app boot - using ref to track
  useEffect(() => {
    console.log('[GlobalSessionProvider] useEffect running, hasInitialized:', hasInitialized.current);
    
    // Only run once
    if (hasInitialized.current) {
      console.log('[GlobalSessionProvider] Already initialized, skipping');
      return;
    }
    
    console.log('[GlobalSessionProvider] Component mounted at', Date.now(), 'initializing session...');
    hasInitialized.current = true;
    
    // Delay to ensure browser is ready
    const timer = setTimeout(() => {
      console.log('[GlobalSessionProvider] Starting session initialization for path:', pathname);
      initializeSession(null);
    }, 500);
    
    return () => clearTimeout(timer);
  }); // No deps array - run on every render until initialized
  
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