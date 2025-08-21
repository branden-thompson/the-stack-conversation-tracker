/**
 * useSSEStateOptimization - React State & Render Optimization
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | REUSABLE COMPONENT
 * PURPOSE: Optimize React state updates and prevent unnecessary re-renders for SSE data
 * 
 * FEATURES:
 * - Stable object references with useRef pattern
 * - Essential data hash calculation templates
 * - Render prevention through change detection
 * - Performance monitoring and alerting
 * - Configurable optimization strategies
 */

'use client';

import { useRef, useCallback, useMemo } from 'react';

/**
 * Default essential data extractor - override for specific use cases
 */
const defaultEssentialDataExtractor = (data) => {
  if (!data) return {};
  
  return {
    // Core data that affects UI rendering
    itemCount: data.items?.length || 0,
    itemIds: data.items?.map(item => item.id) || [],
    
    // Error states that affect UI
    hasError: !!data.error,
    errorMessage: data.error?.message || null,
    
    // Connection states that affect UI
    isConnected: data.connected || false,
    connectionMode: data.connectionMode || 'unknown'
  };
};

/**
 * SSE State Optimization Hook - Prevent unnecessary re-renders
 * 
 * @param {Object} config Configuration options
 * @param {Function} config.extractEssentialData Function to extract UI-affecting data
 * @param {Array} config.excludeFromHash Fields to exclude from hash calculation
 * @param {Function} config.onRenderPrevented Callback when render is prevented
 * @param {Function} config.onRenderAllowed Callback when render is allowed
 * @param {Object} config.debug Debug configuration
 * @returns {Object} Optimization utilities and state management
 */
export function useSSEStateOptimization(config = {}) {
  const {
    extractEssentialData = defaultEssentialDataExtractor,
    excludeFromHash = ['loading', 'timestamp', 'lastUpdate', 'processingTime', 'stats'],
    onRenderPrevented = null,
    onRenderAllowed = null,
    debug = {}
  } = config;

  // Stable reference storage
  const stableDataRef = useRef(null);
  const previousHashRef = useRef('');
  
  // Performance tracking
  const optimizationStatsRef = useRef({
    totalHashCalculations: 0,
    rendersAllowed: 0,
    rendersPrevented: 0,
    lastHashCalculationTime: 0,
    falsePositiveRate: 0
  });

  /**
   * Debug logging utility
   */
  const debugLog = useCallback((level, message, data = {}) => {
    const prefix = '[SSEStateOptimization]';
    
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
   * Create optimized hash from essential data only
   */
  const createOptimizedHash = useCallback((data) => {
    const startTime = Date.now();
    optimizationStatsRef.current.totalHashCalculations++;

    try {
      // Extract only essential UI-affecting data
      const essentialData = extractEssentialData(data);
      
      // Remove excluded fields
      const cleanData = { ...essentialData };
      excludeFromHash.forEach(field => {
        delete cleanData[field];
      });

      const hash = JSON.stringify(cleanData);
      
      // Performance tracking
      const calculationTime = Date.now() - startTime;
      optimizationStatsRef.current.lastHashCalculationTime = calculationTime;

      debugLog('verbose', 'Hash calculation completed', {
        calculationTime: `${calculationTime}ms`,
        hashLength: hash.length,
        essentialDataKeys: Object.keys(essentialData),
        excludedFields: excludeFromHash
      });

      return hash;
    } catch (err) {
      debugLog('error', 'Hash calculation failed', { error: err.message });
      // Fallback to full data hash
      return JSON.stringify(data || {});
    }
  }, [extractEssentialData, excludeFromHash, debugLog]);

  /**
   * Get stable data reference - prevents unnecessary re-renders
   */
  const getStableData = useCallback((newData) => {
    if (!newData) {
      debugLog('verbose', 'No data provided - returning null');
      return null;
    }

    // Calculate hash of essential data
    const newHash = createOptimizedHash(newData);
    
    // Check if essential data has changed
    if (previousHashRef.current === newHash) {
      // Data hasn't changed - return stable reference
      optimizationStatsRef.current.rendersPrevented++;
      
      debugLog('info', 'Data unchanged - returning stable reference', {
        rendersPrevented: optimizationStatsRef.current.rendersPrevented,
        hashMatched: true
      });
      
      // Trigger callback if provided
      if (onRenderPrevented) {
        onRenderPrevented({
          previousHash: previousHashRef.current,
          newHash,
          data: newData,
          stableData: stableDataRef.current
        });
      }
      
      return stableDataRef.current;
    }

    // Data has changed - create new stable reference
    optimizationStatsRef.current.rendersAllowed++;
    
    debugLog('info', 'Data changed - creating new stable reference', {
      rendersAllowed: optimizationStatsRef.current.rendersAllowed,
      previousHash: previousHashRef.current.substring(0, 50) + '...',
      newHash: newHash.substring(0, 50) + '...'
    });

    // Enhanced debugging - show what changed
    if (debug.showHashChanges && previousHashRef.current) {
      try {
        const prevData = JSON.parse(previousHashRef.current);
        const newDataParsed = JSON.parse(newHash);
        const changes = {};
        
        Object.keys(newDataParsed).forEach(key => {
          if (JSON.stringify(prevData[key]) !== JSON.stringify(newDataParsed[key])) {
            changes[key] = { prev: prevData[key], curr: newDataParsed[key] };
          }
        });
        
        debugLog('verbose', 'Hash changes detected', {
          changedFields: Object.keys(changes),
          changes
        });
      } catch (parseErr) {
        debugLog('verbose', 'Could not parse hash for change detection');
      }
    }

    // Update references
    stableDataRef.current = newData;
    previousHashRef.current = newHash;
    
    // Trigger callback if provided
    if (onRenderAllowed) {
      onRenderAllowed({
        previousHash: previousHashRef.current,
        newHash,
        data: newData,
        renderCount: optimizationStatsRef.current.rendersAllowed
      });
    }
    
    return newData;
  }, [createOptimizedHash, debugLog, onRenderPrevented, onRenderAllowed, debug.showHashChanges]);

  /**
   * Check if data would trigger a re-render (without updating state)
   */
  const wouldTriggerRender = useCallback((data) => {
    if (!data) return false;
    
    const newHash = createOptimizedHash(data);
    return previousHashRef.current !== newHash;
  }, [createOptimizedHash]);

  /**
   * Force update stable reference (use sparingly)
   */
  const forceUpdate = useCallback((newData) => {
    debugLog('info', 'Force update triggered');
    
    stableDataRef.current = newData;
    previousHashRef.current = createOptimizedHash(newData);
    
    return newData;
  }, [createOptimizedHash, debugLog]);

  /**
   * Reset optimization state
   */
  const resetOptimization = useCallback(() => {
    stableDataRef.current = null;
    previousHashRef.current = '';
    
    optimizationStatsRef.current = {
      totalHashCalculations: 0,
      rendersAllowed: 0,
      rendersPrevented: 0,
      lastHashCalculationTime: 0,
      falsePositiveRate: 0
    };
    
    debugLog('info', 'Optimization state reset');
  }, [debugLog]);

  /**
   * Get optimization performance statistics
   */
  const getOptimizationStats = useCallback(() => {
    const stats = optimizationStatsRef.current;
    const totalRenders = stats.rendersAllowed + stats.rendersPrevented;
    
    return {
      ...stats,
      totalRenders,
      renderEfficiency: totalRenders > 0 ? 
        (stats.rendersPrevented / totalRenders * 100).toFixed(1) : 0,
      renderRate: totalRenders > 0 ?
        (stats.rendersAllowed / totalRenders * 100).toFixed(1) : 0,
      hashCalculationRate: stats.totalHashCalculations / Math.max(1, totalRenders),
      averageHashTime: stats.lastHashCalculationTime
    };
  }, []);

  /**
   * Memoized optimization configuration
   */
  const optimizationConfig = useMemo(() => ({
    excludeFromHash,
    hasCustomExtractor: extractEssentialData !== defaultEssentialDataExtractor,
    hasRenderCallbacks: !!(onRenderPrevented || onRenderAllowed),
    debugShowChanges: debug.showHashChanges || false
  }), [excludeFromHash, extractEssentialData, onRenderPrevented, onRenderAllowed, debug.showHashChanges]);

  return {
    // Core optimization functions
    getStableData,
    wouldTriggerRender,
    forceUpdate,
    resetOptimization,
    
    // Hash utilities
    createOptimizedHash,
    
    // Monitoring
    getOptimizationStats,
    optimizationConfig,
    
    // Current state access
    getCurrentStableData: () => stableDataRef.current,
    getCurrentHash: () => previousHashRef.current,
    
    // Internal state (for debugging)
    _internal: process.env.NODE_ENV === 'development' ? {
      stableDataRef: stableDataRef.current,
      previousHash: previousHashRef.current,
      stats: optimizationStatsRef.current
    } : undefined
  };
}