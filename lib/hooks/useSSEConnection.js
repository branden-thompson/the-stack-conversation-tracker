/**
 * SSE Connection Hook
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | CLIENT SSE INFRASTRUCTURE
 * React hook for managing SSE connections with comprehensive error handling
 * 
 * Features:
 * - Automatic connection management
 * - Event subscription system
 * - Fallback integration
 * - Performance monitoring
 * - Emergency response
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { EmergencyController } from '@/lib/services/emergency-controller';

/**
 * SSE Connection States
 */
const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed',
  FALLBACK: 'fallback'
};

/**
 * SSE Connection Manager Hook
 * Provides reactive SSE connection management for React components
 */
export function useSSEConnection({ sessionId, userId, autoConnect = true }) {
  // Connection state
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [lastEvent, setLastEvent] = useState(null);
  const [connectionMetrics, setConnectionMetrics] = useState({
    connectedAt: null,
    eventsReceived: 0,
    reconnectAttempts: 0,
    lastHeartbeat: null
  });
  const [error, setError] = useState(null);

  // Connection management
  const eventSourceRef = useRef(null);
  const eventHandlersRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);
  const heartbeatTimeoutRef = useRef(null);
  const isUnmountedRef = useRef(false);

  // Connection configuration
  const reconnectDelay = 1000;
  const maxReconnectAttempts = 5;
  const heartbeatTimeout = 90000; // 90 seconds

  /**
   * Connect to SSE endpoint
   */
  const connect = useCallback(async () => {
    if (isUnmountedRef.current) return;
    
    // Check if SSE is enabled
    if (!EmergencyController.areConnectionsEnabled()) {
      console.log('SSE connections disabled - activating fallback');
      setConnectionState(CONNECTION_STATES.FALLBACK);
      return;
    }

    if (!sessionId || !userId) {
      console.warn('Cannot connect: missing sessionId or userId');
      setError(new Error('Missing connection parameters'));
      return;
    }

    try {
      setConnectionState(CONNECTION_STATES.CONNECTING);
      setError(null);

      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create SSE connection
      const url = `/api/sse/events?sessionId=${encodeURIComponent(sessionId)}&userId=${encodeURIComponent(userId)}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      // Handle connection open
      eventSource.addEventListener('open', () => {
        if (isUnmountedRef.current) return;
        
        console.log('SSE connection established');
        setConnectionState(CONNECTION_STATES.CONNECTED);
        setConnectionMetrics(prev => ({
          ...prev,
          connectedAt: Date.now(),
          reconnectAttempts: 0
        }));
        
        // Start heartbeat monitoring
        startHeartbeatMonitoring();
      });

      // Handle incoming messages
      eventSource.addEventListener('message', (event) => {
        if (isUnmountedRef.current) return;
        
        try {
          const eventData = JSON.parse(event.data);
          handleIncomingEvent(eventData);
        } catch (parseError) {
          console.error('Failed to parse SSE event:', parseError);
        }
      });

      // Handle connection errors
      eventSource.addEventListener('error', (error) => {
        if (isUnmountedRef.current) return;
        
        console.warn('SSE connection error:', error);
        handleConnectionError(error);
      });

    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      setError(error);
      setConnectionState(CONNECTION_STATES.FAILED);
      scheduleReconnect();
    }
  }, [sessionId, userId, handleConnectionError, handleIncomingEvent, scheduleReconnect, startHeartbeatMonitoring]);

  /**
   * Handle incoming SSE events
   */
  const handleIncomingEvent = useCallback((eventData) => {
    setLastEvent(eventData);
    setConnectionMetrics(prev => ({
      ...prev,
      eventsReceived: prev.eventsReceived + 1,
      lastHeartbeat: eventData.eventType === 'heartbeat' ? Date.now() : prev.lastHeartbeat
    }));

    // Process event through registered handlers
    const handlers = eventHandlersRef.current.get(eventData.eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(eventData);
      } catch (error) {
        console.error(`Event handler error for ${eventData.eventType}:`, error);
      }
    });

    // Process wildcard handlers
    const wildcardHandlers = eventHandlersRef.current.get('*') || [];
    wildcardHandlers.forEach(handler => {
      try {
        handler(eventData);
      } catch (error) {
        console.error('Wildcard event handler error:', error);
      }
    });
  }, []);

  /**
   * Handle connection errors
   */
  const handleConnectionError = useCallback((error) => {
    setError(error);
    
    if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
      setConnectionState(CONNECTION_STATES.FAILED);
      scheduleReconnect();
    }
  }, [scheduleReconnect]);

  /**
   * Schedule reconnection attempt
   */
  const scheduleReconnect = useCallback(() => {
    if (isUnmountedRef.current) return;
    
    setConnectionMetrics(prev => {
      const newAttempts = prev.reconnectAttempts + 1;
      
      if (newAttempts >= maxReconnectAttempts) {
        console.warn('Max reconnection attempts reached - activating fallback');
        setConnectionState(CONNECTION_STATES.FALLBACK);
        activateFallback();
        return prev;
      }

      setConnectionState(CONNECTION_STATES.RECONNECTING);
      
      const delay = reconnectDelay * Math.pow(2, newAttempts - 1); // Exponential backoff
      console.log(`Scheduling reconnection attempt ${newAttempts} in ${delay}ms`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);

      return {
        ...prev,
        reconnectAttempts: newAttempts
      };
    });
  }, [connect, activateFallback]);

  /**
   * Start heartbeat monitoring
   */
  const startHeartbeatMonitoring = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setTimeout(() => {
      if (isUnmountedRef.current) return;
      
      console.warn('Heartbeat timeout - connection may be stale');
      handleConnectionError(new Error('Heartbeat timeout'));
    }, heartbeatTimeout);
  }, [handleConnectionError]);

  /**
   * Activate fallback mode
   */
  const activateFallback = useCallback(() => {
    console.log('Activating SSE fallback mode');
    
    // Notify emergency controller
    EmergencyController.triggerEmergencyShutdown('sse-connection-failed', 'medium');
    
    // Dispatch fallback event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sse-fallback-activated', {
        detail: {
          reason: 'connection-failed',
          sessionId,
          userId,
          timestamp: Date.now()
        }
      }));
    }
  }, [sessionId, userId]);

  /**
   * Disconnect from SSE
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
    
    setConnectionState(CONNECTION_STATES.DISCONNECTED);
  }, []);

  /**
   * Subscribe to specific event types
   */
  const subscribe = useCallback((eventType, handler) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, []);
    }
    
    eventHandlersRef.current.get(eventType).push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = eventHandlersRef.current.get(eventType) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }, []);

  /**
   * Emit event to SSE hub
   */
  const emit = useCallback(async (eventData) => {
    try {
      const response = await fetch(`/api/sse/events?sessionId=${encodeURIComponent(sessionId)}&userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...eventData,
          sessionId,
          userId,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to emit event: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, ...result };

    } catch (error) {
      console.error('Failed to emit SSE event:', error);
      return { success: false, error: error.message };
    }
  }, [sessionId, userId]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      isUnmountedRef.current = true;
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Monitor emergency controller state
  useEffect(() => {
    const checkEmergencyState = () => {
      if (!EmergencyController.areConnectionsEnabled() && connectionState === CONNECTION_STATES.CONNECTED) {
        console.log('Emergency controller disabled SSE - disconnecting');
        disconnect();
        setConnectionState(CONNECTION_STATES.FALLBACK);
      }
    };

    const interval = setInterval(checkEmergencyState, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [connectionState, disconnect]);

  return {
    // Connection state
    connectionState,
    isConnected: connectionState === CONNECTION_STATES.CONNECTED,
    isConnecting: connectionState === CONNECTION_STATES.CONNECTING,
    isReconnecting: connectionState === CONNECTION_STATES.RECONNECTING,
    isFallback: connectionState === CONNECTION_STATES.FALLBACK,
    
    // Event data
    lastEvent,
    error,
    
    // Metrics
    connectionMetrics,
    
    // Actions
    connect,
    disconnect,
    subscribe,
    emit
  };
}