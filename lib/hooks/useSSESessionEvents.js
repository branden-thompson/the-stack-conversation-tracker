/**
 * SSE Session Events Hook
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | PHASE 3 SESSION INTEGRATION
 * Session event management with SSE broadcasting and fallback support
 * 
 * Features:
 * - Real-time session event broadcasting
 * - Cross-tab session coordination  
 * - Activity tracking consolidation
 * - Session state synchronization
 * - Fallback to local storage
 * - Performance optimization
 */

'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useSSEConnection } from './useSSEConnection';

/**
 * Session Event Types
 */
export const SESSION_EVENT_TYPES = {
  STARTED: 'session.started',
  ENDED: 'session.ended', 
  ACTIVITY: 'session.activity',
  HEARTBEAT: 'session.heartbeat'
};

/**
 * Session Activity Types
 */
export const SESSION_ACTIVITY_TYPES = {
  PAGE_VIEW: 'page-view',
  USER_ACTION: 'user-action',
  CARD_INTERACTION: 'card-interaction',
  NAVIGATION: 'navigation',
  IDLE: 'idle',
  ACTIVE: 'active'
};

/**
 * Session Event Configuration
 */
const SESSION_CONFIG = {
  // Rate limits per event type (events per minute)
  RATE_LIMITS: {
    [SESSION_EVENT_TYPES.STARTED]: 10,
    [SESSION_EVENT_TYPES.ENDED]: 10,
    [SESSION_EVENT_TYPES.ACTIVITY]: 500,
    [SESSION_EVENT_TYPES.HEARTBEAT]: 60
  },
  
  // Persistence settings
  PERSISTENT_EVENTS: [
    SESSION_EVENT_TYPES.STARTED,
    SESSION_EVENT_TYPES.ENDED
  ],
  
  // Broadcast settings (for cross-tab coordination)
  BROADCAST_EVENTS: [
    SESSION_EVENT_TYPES.STARTED,
    SESSION_EVENT_TYPES.ENDED
  ],
  
  // Activity debouncing
  ACTIVITY_DEBOUNCE: 1000, // 1 second
  HEARTBEAT_INTERVAL: 30000 // 30 seconds
};

/**
 * SSE Session Events Hook
 */
export function useSSESessionEvents({ sessionId, userId, userType = 'guest' }) {
  const [sessionStats, setSessionStats] = useState({
    eventsEmitted: 0,
    eventsReceived: 0,
    lastActivity: null,
    sessionStartTime: null,
    isActive: false
  });

  const lastActivityRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const activityTimeoutRef = useRef(null);

  const { 
    isConnected, 
    isFallback, 
    subscribe, 
    emit: emitSSE,
    connectionState 
  } = useSSEConnection({ 
    sessionId,
    userId,
    autoConnect: true
  });

  /**
   * Emit session event with SSE and fallback
   */
  const emitSessionEvent = useCallback(async (eventType, eventData = {}) => {
    if (!Object.values(SESSION_EVENT_TYPES).includes(eventType)) {
      console.warn(`Unknown session event type: ${eventType}`);
      return { success: false, error: 'Unknown event type' };
    }

    try {
      const timestamp = Date.now();

      // Prepare event payload
      const payload = {
        eventType,
        eventData: {
          ...eventData,
          userType,
          timestamp,
          sessionDuration: sessionStats.sessionStartTime ? 
            timestamp - sessionStats.sessionStartTime : 0
        }
      };

      let result = { success: false };

      // Try SSE first if connected
      if (isConnected) {
        result = await emitSSE(payload);
        
        if (result.success) {
          console.log(`Session event emitted via SSE: ${eventType}`);
          
          setSessionStats(prev => ({
            ...prev,
            eventsEmitted: prev.eventsEmitted + 1,
            lastActivity: eventType === SESSION_EVENT_TYPES.ACTIVITY ? timestamp : prev.lastActivity
          }));
          
          return { ...result, method: 'sse' };
        } else {
          console.warn(`SSE session event failed for ${eventType}:`, result.error);
        }
      }

      // Fallback to localStorage broadcasting
      if (SESSION_CONFIG.BROADCAST_EVENTS.includes(eventType)) {
        broadcastSessionEventViaStorage(eventType, payload.eventData);
      }

      // Fallback to local storage persistence
      if (SESSION_CONFIG.PERSISTENT_EVENTS.includes(eventType)) {
        persistSessionEventToStorage(eventType, payload.eventData);
      }

      setSessionStats(prev => ({
        ...prev,
        eventsEmitted: prev.eventsEmitted + 1,
        lastActivity: eventType === SESSION_EVENT_TYPES.ACTIVITY ? timestamp : prev.lastActivity
      }));

      return { success: true, method: 'fallback' };

    } catch (error) {
      console.error(`Session event emission error for ${eventType}:`, error);
      return { success: false, error: error.message };
    }
  }, [isConnected, emitSSE, userType, sessionStats.sessionStartTime, broadcastSessionEventViaStorage, persistSessionEventToStorage]);

  /**
   * Fallback localStorage broadcasting
   */
  const broadcastSessionEventViaStorage = useCallback((eventType, eventData) => {
    if (typeof window === 'undefined') return;
    
    const sessionEvent = {
      type: 'session-event',
      eventType,
      eventData,
      sessionId,
      userId,
      timestamp: Date.now()
    };
    
    localStorage.setItem('sse-session-broadcast', JSON.stringify(sessionEvent));
    
    // Dispatch custom event for same-tab components
    window.dispatchEvent(new CustomEvent('sse-session-fallback', {
      detail: sessionEvent
    }));
    
    console.log(`Session event broadcast via localStorage: ${eventType}`);
  }, [sessionId, userId]);

  /**
   * Persist session events to localStorage
   */
  const persistSessionEventToStorage = useCallback((eventType, eventData) => {
    if (typeof window === 'undefined') return;
    
    try {
      const storageKey = `session-${sessionId}-events`;
      const existingEvents = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      existingEvents.push({
        eventType,
        eventData,
        timestamp: Date.now()
      });
      
      // Keep only last 100 events
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existingEvents));
    } catch (error) {
      console.error('Failed to persist session event:', error);
    }
  }, [sessionId]);

  /**
   * Session-specific event handlers
   */
  const startSession = useCallback(async (metadata = {}) => {
    const timestamp = Date.now();
    
    setSessionStats(prev => ({
      ...prev,
      sessionStartTime: timestamp,
      isActive: true
    }));

    return await emitSessionEvent(SESSION_EVENT_TYPES.STARTED, {
      activityType: 'session-start',
      metadata: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
        referrer: typeof window !== 'undefined' ? document.referrer : '',
        ...metadata
      }
    });
  }, [emitSessionEvent]);

  const endSession = useCallback(async (reason = 'user-logout', metadata = {}) => {
    const timestamp = Date.now();
    const duration = sessionStats.sessionStartTime ? 
      timestamp - sessionStats.sessionStartTime : 0;

    setSessionStats(prev => ({
      ...prev,
      isActive: false
    }));

    return await emitSessionEvent(SESSION_EVENT_TYPES.ENDED, {
      reason,
      duration,
      metadata
    });
  }, [emitSessionEvent, sessionStats.sessionStartTime]);

  const trackActivity = useCallback(async (activityType, metadata = {}) => {
    // Debounce activity events
    const now = Date.now();
    if (lastActivityRef.current && 
        now - lastActivityRef.current < SESSION_CONFIG.ACTIVITY_DEBOUNCE) {
      return { success: true, debounced: true };
    }
    
    lastActivityRef.current = now;

    return await emitSessionEvent(SESSION_EVENT_TYPES.ACTIVITY, {
      activityType,
      metadata
    });
  }, [emitSessionEvent]);

  const sendHeartbeat = useCallback(async () => {
    return await emitSessionEvent(SESSION_EVENT_TYPES.HEARTBEAT, {
      isActive: sessionStats.isActive,
      eventsEmitted: sessionStats.eventsEmitted
    });
  }, [emitSessionEvent, sessionStats.isActive, sessionStats.eventsEmitted]);

  /**
   * Handle incoming session events from other tabs
   */
  const handleIncomingSessionEvent = useCallback((eventData) => {
    const { eventType, eventData: data } = eventData;
    
    console.log(`Received session event from SSE: ${eventType}`, data);
    
    setSessionStats(prev => ({
      ...prev,
      eventsReceived: prev.eventsReceived + 1
    }));

    // Dispatch custom events for components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`sse-session-${eventType}`, {
        detail: { eventType, eventData: data }
      }));
    }
  }, []);

  /**
   * Handle localStorage fallback events
   */
  const handleStorageFallback = useCallback((event) => {
    if (event.key === 'sse-session-broadcast') {
      try {
        const sessionEvent = JSON.parse(event.newValue);
        
        // Ignore our own events
        if (sessionEvent.sessionId === sessionId) return;
        
        console.log(`Received session event from localStorage: ${sessionEvent.eventType}`);
        
        setSessionStats(prev => ({
          ...prev,
          eventsReceived: prev.eventsReceived + 1
        }));

        // Dispatch custom event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(`sse-session-${sessionEvent.eventType}`, {
            detail: sessionEvent
          }));
        }
      } catch (error) {
        console.error('Failed to parse localStorage session event:', error);
      }
    }
  }, [sessionId]);

  /**
   * Handle custom fallback events (same tab)
   */
  const handleCustomFallback = useCallback((event) => {
    const sessionEvent = event.detail;
    
    // Ignore our own events
    if (sessionEvent.sessionId === sessionId) return;
    
    console.log(`Received session event from custom fallback: ${sessionEvent.eventType}`);
    
    setSessionStats(prev => ({
      ...prev,
      eventsReceived: prev.eventsReceived + 1
    }));
  }, [sessionId]);

  /**
   * Setup heartbeat interval
   */
  useEffect(() => {
    if (!sessionStats.isActive) return;

    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, SESSION_CONFIG.HEARTBEAT_INTERVAL);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [sessionStats.isActive, sendHeartbeat]);

  /**
   * Subscribe to SSE session events
   */
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeList = Object.values(SESSION_EVENT_TYPES).map(eventType => 
      subscribe(eventType, handleIncomingSessionEvent)
    );

    return () => {
      unsubscribeList.forEach(unsubscribe => unsubscribe());
    };
  }, [isConnected, subscribe, handleIncomingSessionEvent]);

  /**
   * Setup fallback event listeners
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('storage', handleStorageFallback);
    window.addEventListener('sse-session-fallback', handleCustomFallback);
    
    return () => {
      window.removeEventListener('storage', handleStorageFallback);
      window.removeEventListener('sse-session-fallback', handleCustomFallback);
    };
  }, [handleStorageFallback, handleCustomFallback]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      // Capture ref value to avoid stale closure
      const currentActivityTimeout = activityTimeoutRef.current;
      if (currentActivityTimeout) {
        clearTimeout(currentActivityTimeout);
      }
    };
  }, []);

  return {
    // Connection status
    isSSEConnected: isConnected,
    isFallbackMode: isFallback,
    connectionState,
    
    // Session management
    startSession,
    endSession,
    trackActivity,
    sendHeartbeat,
    
    // Generic event emission
    emitSessionEvent,
    
    // Session state
    sessionStats,
    isSessionActive: sessionStats.isActive,
    
    // Activity types for convenience
    activityTypes: SESSION_ACTIVITY_TYPES,
    
    // Status
    canBroadcast: isConnected || isFallback,
    broadcastMethod: isConnected ? 'sse' : 'localStorage'
  };
}