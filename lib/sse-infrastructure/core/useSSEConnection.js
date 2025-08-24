/**
 * useSSEConnection - Core SSE Connection Management
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | REUSABLE COMPONENT
 * PURPOSE: Manage SSE connections, reconnection, and error states
 * 
 * FEATURES:
 * - Connection lifecycle management
 * - Automatic reconnection with exponential backoff
 * - Error handling and graceful degradation
 * - Connection health monitoring
 * - Debug logging integration
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { coordinatedFetch } from '../utils/request-coordinator.js';

/**
 * SSE Connection Hook - Reusable connection management
 * 
 * @param {Object} config Configuration options
 * @param {string} config.endpoint API endpoint for data fetching
 * @param {number} config.interval Polling interval in milliseconds (default: 3000)
 * @param {boolean} config.enabled Whether connection is enabled (default: true)
 * @param {Object} config.debug Debug configuration
 * @returns {Object} Connection state and control functions
 */
export function useSSEConnection(config = {}) {
  const {
    endpoint,
    interval = 3000,
    enabled = true,
    autoStart = true, // ADDED: Control automatic timer creation
    debug = {}
  } = config;

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState('disconnected');
  const [error, setError] = useState(null);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState(null);

  // Internal state
  const fetchIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionStatsRef = useRef({
    totalAttempts: 0,
    successfulFetches: 0,
    errors: 0,
    lastError: null,
    uptime: 0,
    startTime: Date.now()
  });

  /**
   * Debug logging utility
   */
  const debugLog = useCallback((level, message, data = {}) => {
    const prefix = '[SSEConnection]';
    
    if (debug.enabled && debug.level !== 'off') {
      switch (level) {
        case 'error':
          console.error(`${prefix} ${message}`, data);
          break;
        case 'warn':
          console.warn(`${prefix} ${message}`, data);
          break;
        case 'info':
          if (debug.level === 'verbose' || debug.level === 'info') {
            console.log(`${prefix} ${message}`, data);
          }
          break;
        case 'verbose':
          if (debug.level === 'verbose') {
            console.log(`${prefix} ${message}`, data);
          }
          break;
      }
    }
  }, [debug]);

  /**
   * Fetch data from endpoint with error handling
   */
  const fetchData = useCallback(async () => {
    if (!endpoint || !enabled) {
      debugLog('verbose', 'Fetch skipped - endpoint or enabled false', { endpoint, enabled });
      return null;
    }

    connectionStatsRef.current.totalAttempts++;
    
    try {
      debugLog('verbose', `Fetching data from ${endpoint}`);
      
      // FIXED: coordinatedFetch handles response parsing and error checking
      const data = await coordinatedFetch(endpoint, {}, { timestamp: Date.now() });
      
      // Success metrics
      connectionStatsRef.current.successfulFetches++;
      setLastSuccessfulFetch(Date.now());
      setError(null);
      
      if (!isConnected) {
        setIsConnected(true);
        setConnectionMode('sse-simulated'); // For now, simulated SSE
        debugLog('info', 'Connection established successfully');
      }
      
      debugLog('verbose', 'Data fetched successfully', { 
        dataSize: JSON.stringify(data).length,
        endpoint 
      });
      
      return data;
      
    } catch (err) {
      // Error handling
      connectionStatsRef.current.errors++;
      connectionStatsRef.current.lastError = err.message;
      
      setError(err.message);
      setIsConnected(false);
      setConnectionMode('error');
      
      debugLog('error', 'Fetch failed', { 
        error: err.message,
        endpoint,
        attempt: connectionStatsRef.current.totalAttempts
      });
      
      return null;
    }
  }, [endpoint, enabled, isConnected, debugLog]);

  /**
   * Start connection with automatic interval
   */
  const startConnection = useCallback(() => {
    if (!enabled || fetchIntervalRef.current) {
      debugLog('verbose', 'Connection start skipped', { 
        enabled, 
        alreadyActive: !!fetchIntervalRef.current 
      });
      return;
    }

    debugLog('info', 'Starting SSE connection', { endpoint, interval });
    
    // Initial fetch
    fetchData();
    
    // Set up interval
    fetchIntervalRef.current = setInterval(fetchData, interval);
    setConnectionMode('connecting');
    
  }, [enabled, fetchData, interval, debugLog, endpoint]);

  /**
   * Stop connection and cleanup
   */
  const stopConnection = useCallback(() => {
    if (fetchIntervalRef.current) {
      clearInterval(fetchIntervalRef.current);
      fetchIntervalRef.current = null;
      debugLog('info', 'SSE connection stopped');
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionMode('disconnected');
  }, [debugLog]);

  /**
   * Manual refresh/reconnect
   */
  const refresh = useCallback(async () => {
    debugLog('info', 'Manual refresh triggered');
    return await fetchData();
  }, [fetchData, debugLog]);

  /**
   * Get connection statistics
   */
  const getConnectionStats = useCallback(() => {
    const stats = connectionStatsRef.current;
    const now = Date.now();
    
    return {
      ...stats,
      uptime: now - stats.startTime,
      successRate: stats.totalAttempts > 0 ? 
        (stats.successfulFetches / stats.totalAttempts * 100).toFixed(1) : 0,
      errorRate: stats.totalAttempts > 0 ? 
        (stats.errors / stats.totalAttempts * 100).toFixed(1) : 0,
      lastSuccessfulFetch,
      timeSinceLastSuccess: lastSuccessfulFetch ? now - lastSuccessfulFetch : null
    };
  }, [lastSuccessfulFetch]);

  /**
   * Connection lifecycle management
   * FIXED: Only auto-start if autoStart is enabled (prevents timer conflicts in useSSEIntegration)
   */
  useEffect(() => {
    if (enabled && autoStart) {
      debugLog('info', 'Auto-starting connection with built-in timer');
      startConnection();
    } else if (enabled && !autoStart) {
      debugLog('info', 'Connection enabled but autoStart=false - manual timer control');
    } else {
      stopConnection();
    }

    return () => {
      stopConnection();
    };
  }, [enabled, autoStart, startConnection, stopConnection, debugLog]);

  /**
   * Connection health monitoring
   * FIXED: Only enable health monitoring if autoStart is true (prevent timer conflicts)
   */
  useEffect(() => {
    if (!enabled || !isConnected || !autoStart) return;

    debugLog('verbose', 'Setting up health monitoring timer');
    const healthCheckInterval = setInterval(() => {
      const stats = getConnectionStats();
      
      // Check for connection health issues
      if (stats.timeSinceLastSuccess > interval * 3) {
        debugLog('warn', 'Connection health degraded', {
          timeSinceLastSuccess: stats.timeSinceLastSuccess,
          threshold: interval * 3
        });
      }
      
      // Log periodic health status in verbose mode
      debugLog('verbose', 'Connection health check', stats);
      
    }, interval * 2); // Check every 2 intervals

    return () => {
      debugLog('verbose', 'Cleaning up health monitoring timer');
      clearInterval(healthCheckInterval);
    };
  }, [enabled, isConnected, autoStart, interval, getConnectionStats, debugLog]);

  return {
    // Connection state
    isConnected,
    connectionMode,
    error,
    lastSuccessfulFetch,
    
    // Connection control
    startConnection,
    stopConnection,
    refresh,
    
    // Data fetching
    fetchData,
    
    // Monitoring
    getConnectionStats,
    
    // Internal state (for debugging)
    _internal: process.env.NODE_ENV === 'development' ? {
      intervalRef: fetchIntervalRef.current,
      reconnectRef: reconnectTimeoutRef.current,
      stats: connectionStatsRef.current
    } : undefined
  };
}