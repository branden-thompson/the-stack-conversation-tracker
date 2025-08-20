/**
 * SSE Session Synchronization Hook
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | PHASE 3 SESSION SYNC
 * Cross-tab session state synchronization with SSE and fallback support
 * 
 * Features:
 * - Real-time session state sync across tabs
 * - Activity coordination between browser windows
 * - Session lifecycle management
 * - Cross-tab session validation
 * - Emergency response integration
 * - Performance optimization
 */

'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useSSESessionEvents } from './useSSESessionEvents';

/**
 * Session Sync States
 */
const SYNC_STATES = {
  DISCONNECTED: 'disconnected',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  CONFLICT: 'conflict',
  FAILED: 'failed'
};

/**
 * Session Sync Configuration
 */
const SYNC_CONFIG = {
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  CONFLICT_RESOLUTION_TIMEOUT: 5000, // 5 seconds
  MAX_SYNC_ATTEMPTS: 3,
  ACTIVITY_SYNC_DEBOUNCE: 2000, // 2 seconds
  SESSION_VALIDATION_INTERVAL: 60000 // 1 minute
};

/**
 * SSE Session Synchronization Hook
 */
export function useSSESessionSync({ 
  sessionId, 
  userId, 
  userType = 'guest',
  autoSync = true 
}) {
  const [syncState, setSyncState] = useState(SYNC_STATES.DISCONNECTED);
  const [syncMetrics, setSyncMetrics] = useState({
    lastSync: null,
    syncCount: 0,
    conflictCount: 0,
    failureCount: 0,
    connectedTabs: 1 // Current tab
  });
  const [sessionData, setSessionData] = useState(null);
  const [conflictData, setConflictData] = useState(null);

  const syncAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef(null);
  const validationIntervalRef = useRef(null);
  const lastActivitySyncRef = useRef(null);

  const {
    isSSEConnected,
    isFallbackMode,
    emitSessionEvent,
    sessionStats,
    connectionState
  } = useSSESessionEvents({ sessionId, userId, userType });

  /**
   * Emit session sync event
   */
  const emitSyncEvent = useCallback(async (syncType, data = {}) => {
    try {
      const result = await emitSessionEvent('session.sync', {
        syncType,
        sessionData: {
          sessionId,
          userId,
          userType,
          timestamp: Date.now(),
          tabId: typeof window !== 'undefined' ? window.performance?.timeOrigin || Date.now() : Date.now(),
          ...data
        }
      });

      if (result.success) {
        setSyncMetrics(prev => ({
          ...prev,
          syncCount: prev.syncCount + 1,
          lastSync: Date.now()
        }));
      }

      return result;
    } catch (error) {
      console.error('Session sync event emission failed:', error);
      setSyncMetrics(prev => ({
        ...prev,
        failureCount: prev.failureCount + 1
      }));
      return { success: false, error: error.message };
    }
  }, [emitSessionEvent, sessionId, userId, userType]);

  /**
   * Broadcast session state to other tabs
   */
  const broadcastSessionState = useCallback(async (state) => {
    setSyncState(SYNC_STATES.SYNCING);
    
    const result = await emitSyncEvent('state-broadcast', {
      state,
      sessionStats,
      lastActivity: sessionStats.lastActivity
    });

    if (result.success) {
      setSyncState(SYNC_STATES.SYNCED);
      setSessionData(state);
    } else {
      setSyncState(SYNC_STATES.FAILED);
      
      // Fallback to localStorage
      broadcastViaLocalStorage('state-broadcast', state);
    }

    return result;
  }, [emitSyncEvent, sessionStats]);

  /**
   * Request session state from other tabs
   */
  const requestSessionState = useCallback(async () => {
    setSyncState(SYNC_STATES.SYNCING);
    
    const result = await emitSyncEvent('state-request', {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    });

    if (result.success) {
      // Wait for responses
      setTimeout(() => {
        if (syncState === SYNC_STATES.SYNCING) {
          setSyncState(SYNC_STATES.SYNCED); // Assume no conflicts if no response
        }
      }, SYNC_CONFIG.CONFLICT_RESOLUTION_TIMEOUT);
    } else {
      setSyncState(SYNC_STATES.FAILED);
      
      // Fallback to localStorage
      requestViaLocalStorage();
    }

    return result;
  }, [emitSyncEvent, syncState]);

  /**
   * Sync activity across tabs
   */
  const syncActivity = useCallback(async (activityType, metadata = {}) => {
    const now = Date.now();
    
    // Debounce activity sync to prevent spam
    if (lastActivitySyncRef.current && 
        now - lastActivitySyncRef.current < SYNC_CONFIG.ACTIVITY_SYNC_DEBOUNCE) {
      return { success: true, debounced: true };
    }
    
    lastActivitySyncRef.current = now;

    return await emitSyncEvent('activity-sync', {
      activityType,
      metadata,
      timestamp: now
    });
  }, [emitSyncEvent]);

  /**
   * Handle session conflicts
   */
  const resolveSessionConflict = useCallback(async (conflictData) => {
    setSyncState(SYNC_STATES.CONFLICT);
    setConflictData(conflictData);
    
    // Simple conflict resolution: newest session wins
    const localTimestamp = sessionData?.timestamp || 0;
    const remoteTimestamp = conflictData.timestamp || 0;
    
    if (remoteTimestamp > localTimestamp) {
      // Remote session is newer, adopt it
      setSessionData(conflictData);
      setSyncState(SYNC_STATES.SYNCED);
      
      console.log('Session conflict resolved: adopting remote session');
      
      setSyncMetrics(prev => ({
        ...prev,
        conflictCount: prev.conflictCount + 1
      }));
      
      return { resolved: true, action: 'adopted-remote' };
    } else {
      // Local session is newer or same, keep it
      await broadcastSessionState(sessionData);
      setSyncState(SYNC_STATES.SYNCED);
      
      console.log('Session conflict resolved: keeping local session');
      
      return { resolved: true, action: 'kept-local' };
    }
  }, [sessionData, broadcastSessionState]);

  /**
   * Fallback localStorage broadcasting
   */
  const broadcastViaLocalStorage = useCallback((syncType, data) => {
    if (typeof window === 'undefined') return;
    
    const syncEvent = {
      type: 'session-sync',
      syncType,
      sessionId,
      userId,
      data,
      timestamp: Date.now(),
      tabId: window.performance?.timeOrigin || Date.now()
    };
    
    localStorage.setItem('sse-session-sync', JSON.stringify(syncEvent));
    
    // Dispatch custom event for same-tab components
    window.dispatchEvent(new CustomEvent('sse-session-sync-fallback', {
      detail: syncEvent
    }));
    
    console.log(`Session sync via localStorage: ${syncType}`);
  }, [sessionId, userId]);

  /**
   * Fallback localStorage request
   */
  const requestViaLocalStorage = useCallback(() => {
    broadcastViaLocalStorage('state-request', {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    });
  }, [broadcastViaLocalStorage]);

  /**
   * Handle incoming sync events
   */
  const handleSyncEvent = useCallback((eventData) => {
    const { eventData: data } = eventData;
    const { syncType, sessionData: remoteSessionData } = data;
    
    // Ignore our own events
    const tabId = typeof window !== 'undefined' ? window.performance?.timeOrigin || Date.now() : Date.now();
    if (remoteSessionData?.tabId === tabId) {
      return;
    }

    console.log(`Received session sync event: ${syncType}`, data);

    switch (syncType) {
      case 'state-broadcast':
        if (sessionData && sessionData.timestamp !== remoteSessionData.timestamp) {
          resolveSessionConflict(remoteSessionData);
        } else {
          setSessionData(remoteSessionData);
          setSyncState(SYNC_STATES.SYNCED);
        }
        break;
        
      case 'state-request':
        if (sessionData) {
          broadcastSessionState(sessionData);
        }
        break;
        
      case 'activity-sync':
        // Update connected tabs count
        setSyncMetrics(prev => ({
          ...prev,
          connectedTabs: Math.max(prev.connectedTabs, 2) // At least 2 if receiving sync
        }));
        break;
        
      default:
        console.warn(`Unknown sync type: ${syncType}`);
    }
  }, [sessionData, resolveSessionConflict, broadcastSessionState]);

  /**
   * Handle localStorage fallback events
   */
  const handleStorageFallback = useCallback((event) => {
    if (event.key === 'sse-session-sync') {
      try {
        const syncEvent = JSON.parse(event.newValue);
        
        // Ignore our own events
        if (syncEvent.sessionId === sessionId) return;
        
        console.log(`Received session sync from localStorage: ${syncEvent.syncType}`);
        
        // Process fallback event similar to SSE event
        handleSyncEvent({
          eventData: {
            syncType: syncEvent.syncType,
            sessionData: syncEvent.data
          }
        });
      } catch (error) {
        console.error('Failed to parse localStorage sync event:', error);
      }
    }
  }, [sessionId, handleSyncEvent]);

  /**
   * Handle custom fallback events (same tab)
   */
  const handleCustomFallback = useCallback((event) => {
    const syncEvent = event.detail;
    
    // Ignore our own events
    if (syncEvent.sessionId === sessionId) return;
    
    console.log(`Received session sync from custom fallback: ${syncEvent.syncType}`);
    
    // Process fallback event
    handleSyncEvent({
      eventData: {
        syncType: syncEvent.syncType,
        sessionData: syncEvent.data
      }
    });
  }, [sessionId, handleSyncEvent]);

  /**
   * Start heartbeat for connection monitoring
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) return;

    heartbeatIntervalRef.current = setInterval(async () => {
      if (sessionId && userId) {
        await emitSyncEvent('heartbeat', {
          isActive: true,
          timestamp: Date.now()
        });
      }
    }, SYNC_CONFIG.HEARTBEAT_INTERVAL);
  }, [sessionId, userId, emitSyncEvent]);

  /**
   * Start session validation
   */
  const startSessionValidation = useCallback(() => {
    if (validationIntervalRef.current) return;

    validationIntervalRef.current = setInterval(async () => {
      if (sessionId && userId) {
        await requestSessionState();
      }
    }, SYNC_CONFIG.SESSION_VALIDATION_INTERVAL);
  }, [sessionId, userId, requestSessionState]);

  /**
   * Initialize sync when session is available
   */
  useEffect(() => {
    if (autoSync && sessionId && userId && isSSEConnected) {
      setSyncState(SYNC_STATES.SYNCING);
      
      // Request current state from other tabs
      requestSessionState();
      
      // Start monitoring
      startHeartbeat();
      startSessionValidation();
    }
  }, [autoSync, sessionId, userId, isSSEConnected, requestSessionState, startHeartbeat, startSessionValidation]);

  /**
   * Subscribe to session sync events
   */
  useEffect(() => {
    if (!isSSEConnected) return;

    // Subscribe to session sync events via the session events hook
    // This would typically be handled by the SSE connection in useSSESessionEvents
    // For now, we'll monitor connection state changes
    
    console.log(`Session sync SSE connection: ${connectionState}`);
  }, [isSSEConnected, connectionState]);

  /**
   * Setup fallback event listeners
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('storage', handleStorageFallback);
    window.addEventListener('sse-session-sync-fallback', handleCustomFallback);
    
    return () => {
      window.removeEventListener('storage', handleStorageFallback);
      window.removeEventListener('sse-session-sync-fallback', handleCustomFallback);
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
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
      }
    };
  }, []);

  return {
    // Sync state
    syncState,
    isConnected: isSSEConnected,
    isSyncing: syncState === SYNC_STATES.SYNCING,
    isSynced: syncState === SYNC_STATES.SYNCED,
    hasConflict: syncState === SYNC_STATES.CONFLICT,
    
    // Session data
    sessionData,
    conflictData,
    
    // Metrics
    syncMetrics,
    
    // Actions
    broadcastSessionState,
    requestSessionState,
    syncActivity,
    resolveSessionConflict,
    
    // Status
    canSync: isSSEConnected || isFallbackMode,
    syncMethod: isSSEConnected ? 'sse' : 'localStorage'
  };
}