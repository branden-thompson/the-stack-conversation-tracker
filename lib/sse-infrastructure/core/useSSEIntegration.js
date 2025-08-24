/**
 * useSSEIntegration - Composed SSE Hook with All Optimizations
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | INTEGRATION LAYER
 * PURPOSE: Combine connection, processing, and optimization into a single reusable hook
 * 
 * FEATURES:
 * - Complete SSE lifecycle management
 * - Automatic performance optimization
 * - Configurable data processing pipelines
 * - Enhanced debugging and monitoring
 * - Template pattern for specific use cases
 */

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useSSEConnection } from './useSSEConnection.js';
import { useSSEDataProcessing } from './useSSEDataProcessing.js';
import { useSSEStateOptimization } from './useSSEStateOptimization.js';
import { getPollingInterval } from '../config/environment-config.js';

/**
 * SSE Integration Hook - Complete SSE implementation pattern
 * 
 * @param {Object} config Comprehensive configuration object
 * @param {string} config.endpoint API endpoint for data fetching
 * @param {number} config.interval Polling interval in milliseconds
 * @param {boolean} config.enabled Whether SSE is enabled
 * @param {Function} config.transformData Data transformation function
 * @param {Function} config.validateData Data validation function
 * @param {Function} config.extractEssentialData Extract UI-affecting data for optimization
 * @param {Array} config.excludeFromHash Fields to exclude from change detection
 * @param {Object} config.debug Debug configuration
 * @returns {Object} Complete SSE state and utilities
 */
export function useSSEIntegration(config = {}) {
  // Get environment-safe default interval
  const defaultSafeInterval = getPollingInterval('sessions');
  
  const {
    endpoint,
    interval = defaultSafeInterval, // FIXED: Use environment-safe default instead of hardcoded 3000
    enabled = true,
    transformData,
    validateData,
    extractEssentialData,
    excludeFromHash,
    debug = {}
  } = config;

  // DEBUG: Log the actual interval being used
  console.log('[useSSEIntegration] Config received:', { 
    endpoint, 
    interval, 
    intervalFromConfig: config.interval,
    defaultSafeInterval,
    enabled 
  });

  // Enhanced debug configuration - memoized to prevent recreating on every render
  const enhancedDebug = useMemo(() => ({
    enabled: debug.enabled ?? (process.env.NODE_ENV === 'development'),
    level: debug.level ?? process.env.NEXT_PUBLIC_SSE_DEBUG_LEVEL ?? 'normal',
    showHashChanges: debug.showHashChanges ?? 
      (process.env.NEXT_PUBLIC_SSE_HASH_LOGGING === 'true'),
    ...debug
  }), [debug]);

  /**
   * Debug logging utility
   */
  const debugLog = useCallback((level, message, data = {}) => {
    const prefix = '[SSEIntegration]';
    
    if (enhancedDebug.enabled && enhancedDebug.level !== 'off') {
      switch (level) {
        case 'error':
          console.error(`${prefix} ${message}`, data);
          break;
        case 'warn':
          console.warn(`${prefix} ${message}`, data);
          break;
        case 'info':
          if (enhancedDebug.level === 'verbose' || enhancedDebug.level === 'info') {
            console.log(`${prefix} ${message}`, data);
          }
          break;
        case 'verbose':
          if (enhancedDebug.level === 'verbose') {
            console.log(`${prefix} ${message}`, data);
          }
          break;
      }
    }
  }, [enhancedDebug]);

  // Core SSE modules
  const connection = useSSEConnection({
    endpoint,
    interval,
    enabled,
    autoStart: false, // CRITICAL: Prevent useSSEConnection from creating its own timer
    debug: enhancedDebug
  });

  const processing = useSSEDataProcessing({
    transformData,
    validateData,
    excludeFromComparison: excludeFromHash,
    debug: enhancedDebug
  });

  const optimization = useSSEStateOptimization({
    extractEssentialData,
    excludeFromHash,
    onRenderPrevented: (data) => {
      debugLog('verbose', 'Render prevented by optimization', {
        rendersPrevented: optimization.getOptimizationStats().rendersPrevented
      });
    },
    onRenderAllowed: (data) => {
      debugLog('info', 'Render allowed - data changed', {
        rendersAllowed: optimization.getOptimizationStats().rendersAllowed
      });
    },
    debug: enhancedDebug
  });

  /**
   * Integrated data flow - CENTRALIZED TIMER MANAGEMENT
   * FIXED: Prevent useSSEConnection from creating independent timers
   */
  useEffect(() => {
    if (!enabled) {
      debugLog('info', 'SSE integration disabled');
      return;
    }

    debugLog('info', 'SSE integration starting with centralized timer control', {
      endpoint,
      interval,
      hasTransform: !!transformData,
      hasValidation: !!validateData,
      hasEssentialExtractor: !!extractEssentialData
    });

    // CRITICAL FIX: Set up SINGLE centralized data flow pipeline with OUR timer
    const setupDataFlow = async () => {
      try {
        // 1. Fetch data via connection (MANUAL - no connection timer)
        const rawData = await connection.fetchData();
        
        if (!rawData) {
          debugLog('verbose', 'No data from connection - skipping pipeline');
          return;
        }

        // 2. Process data (validation + transformation)
        const processingResult = await processing.processData(rawData);
        
        if (!processingResult.processed) {
          debugLog('info', 'Data processing skipped', {
            reason: processingResult.reason,
            error: processingResult.error
          });
          return;
        }

        // 3. Optimize state updates (prevent unnecessary re-renders)
        const optimizedData = optimization.getStableData(processingResult.data);
        
        debugLog('info', 'SSE data flow completed successfully', {
          processingTime: processingResult.processingTime,
          dataOptimized: optimizedData === processingResult.data ? 'stable_reference' : 'new_reference'
        });

      } catch (err) {
        debugLog('error', 'SSE data flow failed', { error: err.message });
      }
    };

    // CRITICAL FIX: WE control the timer, not useSSEConnection
    debugLog('info', 'Setting up CENTRALIZED timer with interval:', interval);
    
    // Initial fetch
    setupDataFlow();
    
    // Set up OUR controlled interval
    const integrationTimer = setInterval(setupDataFlow, interval);

    // Cleanup function
    return () => {
      debugLog('info', 'Cleaning up SSE integration timer');
      clearInterval(integrationTimer);
    };

  }, [enabled, endpoint, interval, connection, processing, optimization, transformData, validateData, extractEssentialData, debugLog]);

  /**
   * Manual refresh with integrated pipeline
   */
  const refresh = useCallback(async () => {
    debugLog('info', 'Manual SSE refresh triggered');
    
    try {
      const rawData = await connection.refresh();
      
      if (rawData) {
        const processingResult = await processing.processData(rawData);
        
        if (processingResult.processed) {
          const optimizedData = optimization.getStableData(processingResult.data);
          debugLog('info', 'Manual refresh completed successfully');
          return optimizedData;
        }
      }
      
      return null;
    } catch (err) {
      debugLog('error', 'Manual refresh failed', { error: err.message });
      return null;
    }
  }, [connection, processing, optimization, debugLog]);

  /**
   * Get comprehensive system statistics
   */
  const getSystemStats = useCallback(() => {
    const connectionStats = connection.getConnectionStats();
    const processingStats = processing.getProcessingStats();
    const optimizationStats = optimization.getOptimizationStats();

    return {
      connection: connectionStats,
      processing: processingStats,
      optimization: optimizationStats,
      overall: {
        systemUptime: connectionStats.uptime,
        overallEfficiency: parseFloat(optimizationStats.renderEfficiency),
        dataQuality: parseFloat(processingStats.successRate),
        connectionReliability: parseFloat(connectionStats.successRate)
      }
    };
  }, [connection, processing, optimization]);

  /**
   * Reset entire SSE system
   */
  const resetSystem = useCallback(() => {
    debugLog('info', 'Resetting entire SSE system');
    
    processing.resetProcessing();
    optimization.resetOptimization();
    
    // Connection reset is handled by stopping/starting
    connection.stopConnection();
    if (enabled) {
      connection.startConnection();
    }
  }, [processing, optimization, connection, enabled, debugLog]);

  /**
   * Current system status summary
   */
  const systemStatus = useMemo(() => {
    const stats = getSystemStats();
    
    return {
      isHealthy: connection.isConnected && !connection.error && !processing.processingError,
      isOptimal: parseFloat(stats.optimization.renderEfficiency) > 80,
      connectionStatus: connection.connectionMode,
      lastDataUpdate: processing.lastProcessedTime,
      performanceRating: stats.overall.overallEfficiency > 90 ? 'excellent' :
                         stats.overall.overallEfficiency > 70 ? 'good' :
                         stats.overall.overallEfficiency > 50 ? 'fair' : 'poor'
    };
  }, [connection, processing, getSystemStats]);

  return {
    // Current state
    data: optimization.getCurrentStableData(),
    isConnected: connection.isConnected,
    connectionMode: connection.connectionMode,
    error: connection.error || processing.processingError,
    lastUpdate: processing.lastProcessedTime,
    
    // System status
    systemStatus,
    
    // Control functions
    refresh,
    resetSystem,
    startConnection: connection.startConnection,
    stopConnection: connection.stopConnection,
    
    // Data utilities
    wouldTriggerRender: optimization.wouldTriggerRender,
    forceUpdate: optimization.forceUpdate,
    
    // Monitoring
    getSystemStats,
    getConnectionStats: connection.getConnectionStats,
    getProcessingStats: processing.getProcessingStats,
    getOptimizationStats: optimization.getOptimizationStats,
    
    // Configuration
    config: {
      endpoint,
      interval,
      enabled,
      debug: enhancedDebug,
      hasTransform: !!transformData,
      hasValidation: !!validateData,
      hasEssentialExtractor: !!extractEssentialData
    },
    
    // Internal modules (for advanced usage)
    _modules: process.env.NODE_ENV === 'development' ? {
      connection,
      processing,
      optimization
    } : undefined
  };
}