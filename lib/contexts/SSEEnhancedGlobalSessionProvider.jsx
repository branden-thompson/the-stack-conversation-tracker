/**
 * SSE Enhanced Global Session Provider
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | PHASE 3 SESSION INTEGRATION
 * Enhanced session provider with SSE event broadcasting and fallback support
 * 
 * Features:
 * - Real-time session event broadcasting
 * - Cross-tab session coordination
 * - Dual-mode operation (SSE + legacy)
 * - Session state synchronization
 * - Activity tracking consolidation
 * - Emergency fallback integration
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import sessionTracker from '@/lib/services/session-tracker';
import { SESSION_EVENT_TYPES, SESSION_USER_TYPES } from '@/lib/utils/session-constants';
import { storeSessionId, getStoredSessionId, clearStoredSession, updateSessionTimestamp } from '@/lib/utils/session-storage';
import { getBrowserSessionId, getBrowserMetadata } from '@/lib/utils/browser-session';
import { useSSESessionEvents } from '@/lib/hooks/useSSESessionEvents';

const SSEGlobalSessionContext = createContext(null);

/**
 * Feature flags for gradual SSE migration
 */
const SSE_SESSION_FLAGS = {
  ENABLE_SSE_EVENTS: process.env.NEXT_PUBLIC_ENABLE_SSE_SESSION_EVENTS !== 'false',
  DUAL_MODE: process.env.NEXT_PUBLIC_SSE_SESSION_DUAL_MODE !== 'false', // Run both SSE and legacy
  FALLBACK_TO_LEGACY: process.env.NEXT_PUBLIC_SSE_SESSION_FALLBACK === 'true'
};

export function SSEEnhancedGlobalSessionProvider({ children }) {
  const [currentSession, setCurrentSession] = useState(null);
  const [syncStats, setSyncStats] = useState({
    sseEvents: 0,
    legacyEvents: 0,
    lastSync: null,
    failures: 0
  });
  const hasInitialized = useRef(false);
  const pathname = usePathname();
  
  // SSE Session Integration
  const {
    isSSEConnected,
    isFallbackMode,
    startSession: startSSESession,
    endSession: endSSESession,
    trackActivity: trackSSEActivity,
    emitSessionEvent,
    sessionStats,
    connectionState
  } = useSSESessionEvents({
    sessionId: currentSession?.sessionId,
    userId: currentSession?.userId,
    userType: currentSession?.userType
  });

  /**
   * Enhanced session event emission with SSE + legacy support
   */
  const emitSessionEventEnhanced = useCallback(async (eventType, data) => {
    try {
      let sseResult = { success: false };
      let legacyResult = { success: false };

      // SSE Event Emission
      if (SSE_SESSION_FLAGS.ENABLE_SSE_EVENTS && currentSession) {
        try {
          sseResult = await emitSessionEvent(eventType, data);
          if (sseResult.success) {
            setSyncStats(prev => ({
              ...prev,
              sseEvents: prev.sseEvents + 1,
              lastSync: Date.now()
            }));
          }
        } catch (error) {
          console.warn('SSE session event failed:', error);
          setSyncStats(prev => ({
            ...prev,
            failures: prev.failures + 1
          }));
        }
      }

      // Legacy Event Emission (dual mode or fallback)
      if (SSE_SESSION_FLAGS.DUAL_MODE || 
          SSE_SESSION_FLAGS.FALLBACK_TO_LEGACY || 
          !sseResult.success) {
        try {
          sessionTracker.emit(eventType, data);
          legacyResult = { success: true };
          setSyncStats(prev => ({
            ...prev,
            legacyEvents: prev.legacyEvents + 1
          }));
        } catch (error) {
          console.warn('Legacy session event failed:', error);
        }
      }

      return {
        success: sseResult.success || legacyResult.success,
        sse: sseResult,
        legacy: legacyResult,
        method: sseResult.success ? 'sse' : 'legacy'
      };

    } catch (error) {
      console.error('Session event emission failed:', error);
      return { success: false, error: error.message };
    }
  }, [emitSessionEvent, currentSession]);

  /**
   * Initialize or update session for a user with SSE enhancement
   */
  const initializeSession = useCallback(async (user) => {
    // Original logic for provisioned guests (preserved)
    if (!user) {
      const browserSessionId = getBrowserSessionId();
      let provisionedGuest = null;
      
      if (!browserSessionId) {
        return;
      }
      
      if (browserSessionId) {
        try {
          const response = await fetch(`/api/browser-sessions?id=${browserSessionId}`);
          if (response.ok) {
            const browserSession = await response.json();
            if (browserSession.provisionedGuest) {
              provisionedGuest = browserSession.provisionedGuest;
            }
          }
        } catch (error) {
          console.error('[SSEGlobalSessionProvider] Error fetching browser session:', error);
        }
      }
      
      if (!provisionedGuest) {
        const { sessionGuestProvisioning } = await import('@/lib/auth/guest-session');
        provisionedGuest = await sessionGuestProvisioning.getOrCreateProvisionedGuest();
        
        if (!provisionedGuest) {
          console.error('[SSEGlobalSessionProvider] Failed to get provisioned guest');
          return;
        }
      }
      
      const guestUser = {
        id: provisionedGuest.id,
        name: provisionedGuest.name,
        isGuest: true,
        profilePicture: provisionedGuest.profilePicture,
      };
      
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
      
      try {
        const session = await sessionTracker.initializeSession(sessionData);
        
        if (session) {
          setCurrentSession(session);
          
          // Enhanced SSE session start
          if (SSE_SESSION_FLAGS.ENABLE_SSE_EVENTS) {
            await startSSESession({
              userType: SESSION_USER_TYPES.GUEST,
              provisioned: true,
              userName: guestUser.name,
              route: pathname
            });
          }
          
          console.log('[SSEGlobalSessionProvider] Guest session initialized with SSE enhancement');
        }
      } catch (error) {
        console.error('[SSEGlobalSessionProvider] Session initialization failed:', error);
      }
      
      return;
    }

    // Registered user session initialization
    const storedSessionId = getStoredSessionId(user.id);
    
    const sessionData = {
      userId: user.id,
      userType: user.isGuest ? SESSION_USER_TYPES.GUEST : SESSION_USER_TYPES.REGISTERED,
      sessionId: storedSessionId,
      browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      metadata: {
        userName: user.name,
        userEmail: user.email,
        route: pathname || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        profilePicture: user.profilePicture,
      },
    };

    try {
      const session = await sessionTracker.initializeSession(sessionData);
      
      if (session) {
        setCurrentSession(session);
        
        // Enhanced SSE session start
        if (SSE_SESSION_FLAGS.ENABLE_SSE_EVENTS) {
          await startSSESession({
            userType: sessionData.userType,
            userName: user.name,
            userEmail: user.email,
            route: pathname
          });
        }
        
        console.log('[SSEGlobalSessionProvider] User session initialized with SSE enhancement:', user.name);
      }
    } catch (error) {
      console.error('[SSEGlobalSessionProvider] Session initialization failed:', error);
    }
  }, [pathname, startSSESession]);

  /**
   * End session with SSE enhancement
   */
  const endCurrentSession = useCallback(async (reason = 'user-logout') => {
    if (!currentSession) return;

    try {
      // Enhanced SSE session end
      if (SSE_SESSION_FLAGS.ENABLE_SSE_EVENTS) {
        await endSSESession(reason, {
          sessionDuration: sessionStats.sessionStartTime ? 
            Date.now() - sessionStats.sessionStartTime : 0,
          eventsEmitted: sessionStats.eventsEmitted
        });
      }

      // Legacy session end
      await sessionTracker.endSession(reason);
      
      setCurrentSession(null);
      console.log('[SSEGlobalSessionProvider] Session ended with SSE enhancement');
      
    } catch (error) {
      console.error('[SSEGlobalSessionProvider] Session end failed:', error);
    }
  }, [currentSession, endSSESession, sessionStats]);

  /**
   * Enhanced UI event emission
   */
  const emitUIEvent = useCallback(async (eventType, data) => {
    if (!currentSession) return;

    try {
      // Convert UI event to session activity
      await emitSessionEventEnhanced('session.activity', {
        activityType: 'ui-interaction',
        metadata: {
          eventType,
          ...data,
          route: pathname
        }
      });
    } catch (error) {
      console.error('[SSEGlobalSessionProvider] UI event emission failed:', error);
    }
  }, [currentSession, emitSessionEventEnhanced, pathname]);

  /**
   * Enhanced activity tracking
   */
  const trackActivity = useCallback(async (activityType, metadata = {}) => {
    if (!currentSession) return;

    try {
      // SSE activity tracking
      if (SSE_SESSION_FLAGS.ENABLE_SSE_EVENTS) {
        await trackSSEActivity(activityType, {
          ...metadata,
          route: pathname,
          timestamp: Date.now()
        });
      }

      // Legacy activity tracking (dual mode)
      if (SSE_SESSION_FLAGS.DUAL_MODE || SSE_SESSION_FLAGS.FALLBACK_TO_LEGACY) {
        sessionTracker.emit('session.activity', {
          activityType,
          metadata: {
            ...metadata,
            route: pathname
          }
        });
      }
    } catch (error) {
      console.error('[SSEGlobalSessionProvider] Activity tracking failed:', error);
    }
  }, [currentSession, trackSSEActivity, pathname]);

  /**
   * Auto-initialize session on mount
   */
  useEffect(() => {
    if (!hasInitialized.current) {
      initializeSession();
      hasInitialized.current = true;
    }
  }, [initializeSession]);

  /**
   * Monitor route changes for activity tracking
   */
  useEffect(() => {
    if (currentSession && pathname) {
      trackActivity('navigation', { 
        route: pathname,
        timestamp: Date.now()
      });
    }
  }, [pathname, currentSession, trackActivity]);

  /**
   * Handle page visibility changes
   */
  useEffect(() => {
    if (typeof window === 'undefined' || !currentSession) return;

    const handleVisibilityChange = () => {
      const activityType = document.hidden ? 'idle' : 'active';
      trackActivity(activityType, {
        visibility: document.visibilityState,
        timestamp: Date.now()
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentSession, trackActivity]);

  /**
   * Monitor SSE connection state changes
   */
  useEffect(() => {
    console.log(`[SSEGlobalSessionProvider] SSE connection: ${connectionState}`);
  }, [connectionState]);

  const contextValue = {
    // Session data
    currentSession,
    
    // Session management
    initializeSession,
    endCurrentSession,
    
    // Event emission
    emitUIEvent,
    emitSessionEvent: emitSessionEventEnhanced,
    trackActivity,
    
    // SSE status
    isSSEConnected,
    isFallbackMode,
    connectionState,
    
    // Statistics
    syncStats,
    sessionStats,
    
    // Feature flags
    sseEnabled: SSE_SESSION_FLAGS.ENABLE_SSE_EVENTS,
    dualMode: SSE_SESSION_FLAGS.DUAL_MODE,
    
    // Legacy compatibility
    hasSession: !!currentSession,
    sessionId: currentSession?.sessionId,
    userId: currentSession?.userId,
    userType: currentSession?.userType
  };

  return (
    <SSEGlobalSessionContext.Provider value={contextValue}>
      {children}
    </SSEGlobalSessionContext.Provider>
  );
}

/**
 * Hook to access SSE-enhanced session context
 */
export function useSSEGlobalSession() {
  const context = useContext(SSEGlobalSessionContext);
  if (!context) {
    throw new Error('useSSEGlobalSession must be used within SSEEnhancedGlobalSessionProvider');
  }
  return context;
}

/**
 * Backward compatibility hook (delegates to SSE-enhanced version)
 */
export function useGlobalSession() {
  return useSSEGlobalSession();
}