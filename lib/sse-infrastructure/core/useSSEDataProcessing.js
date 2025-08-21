/**
 * useSSEDataProcessing - Data Transformation & Change Detection
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | REUSABLE COMPONENT
 * PURPOSE: Handle data transformation, validation, and change detection for SSE streams
 * 
 * FEATURES:
 * - Deep change detection with configurable comparison
 * - Data transformation pipelines
 * - Validation and error handling
 * - Performance optimized comparison algorithms
 * - Debug logging for data flow analysis
 */

'use client';

import { useState, useRef, useCallback, useMemo } from 'react';

/**
 * SSE Data Processing Hook - Reusable data transformation and change detection
 * 
 * @param {Object} config Configuration options
 * @param {Function} config.transformData Data transformation function
 * @param {Function} config.validateData Data validation function  
 * @param {Function} config.compareData Custom comparison function (optional)
 * @param {Array} config.excludeFromComparison Fields to exclude from change detection
 * @param {Object} config.debug Debug configuration
 * @returns {Object} Processing state and functions
 */
export function useSSEDataProcessing(config = {}) {
  const {
    transformData = (data) => data,
    validateData = () => ({ isValid: true }),
    compareData = null, // Custom comparison function
    excludeFromComparison = ['timestamp', 'lastUpdate', 'processingTime'],
    debug = {}
  } = config;

  // Processing state
  const [processedData, setProcessedData] = useState(null);
  const [processingError, setProcessingError] = useState(null);
  const [lastProcessedTime, setLastProcessedTime] = useState(null);

  // Previous data for comparison
  const previousDataRef = useRef(null);
  const previousHashRef = useRef('');
  
  // Processing statistics
  const processingStatsRef = useRef({
    totalProcessed: 0,
    skippedDuplicates: 0,
    transformationErrors: 0,
    validationErrors: 0,
    lastProcessingTime: 0
  });

  /**
   * Debug logging utility
   */
  const debugLog = useCallback((level, message, data = {}) => {
    const prefix = '[SSEDataProcessing]';
    
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
   * Create content hash for change detection
   */
  const createContentHash = useCallback((data) => {
    if (!data) return '';

    try {
      // Create a copy excluding specified fields
      const cleanData = { ...data };
      excludeFromComparison.forEach(field => {
        delete cleanData[field];
      });

      return JSON.stringify(cleanData);
    } catch (err) {
      debugLog('error', 'Hash creation failed', { error: err.message });
      return JSON.stringify(data); // Fallback
    }
  }, [excludeFromComparison, debugLog]);

  /**
   * Detect if data has actually changed
   */
  const hasDataChanged = useCallback((newData) => {
    if (!previousDataRef.current) {
      debugLog('verbose', 'No previous data - treating as changed');
      return true;
    }

    // Use custom comparison if provided
    if (compareData) {
      const changed = compareData(previousDataRef.current, newData);
      debugLog('verbose', 'Custom comparison result', { changed });
      return changed;
    }

    // Default: hash-based comparison
    const newHash = createContentHash(newData);
    const hashChanged = previousHashRef.current !== newHash;
    
    debugLog('verbose', 'Hash comparison result', {
      changed: hashChanged,
      previousHash: previousHashRef.current.substring(0, 50) + '...',
      newHash: newHash.substring(0, 50) + '...'
    });

    return hashChanged;
  }, [compareData, createContentHash, debugLog]);

  /**
   * Process incoming raw data
   */
  const processData = useCallback(async (rawData) => {
    const startTime = Date.now();
    processingStatsRef.current.totalProcessed++;

    try {
      debugLog('verbose', 'Starting data processing', { 
        dataType: typeof rawData,
        hasData: !!rawData 
      });

      // Skip processing if no data
      if (!rawData) {
        debugLog('verbose', 'No data to process - skipping');
        return { processed: false, reason: 'no_data' };
      }

      // Check if data has changed
      if (!hasDataChanged(rawData)) {
        processingStatsRef.current.skippedDuplicates++;
        debugLog('info', 'Data unchanged - skipping processing');
        return { processed: false, reason: 'no_change' };
      }

      // Validate incoming data
      const validation = validateData(rawData);
      if (!validation.isValid) {
        processingStatsRef.current.validationErrors++;
        const error = `Validation failed: ${validation.error || 'Unknown validation error'}`;
        setProcessingError(error);
        debugLog('error', 'Data validation failed', validation);
        return { processed: false, reason: 'validation_error', error };
      }

      // Transform data
      let transformedData;
      try {
        transformedData = await transformData(rawData);
        debugLog('verbose', 'Data transformation successful');
      } catch (transformError) {
        processingStatsRef.current.transformationErrors++;
        const error = `Transformation failed: ${transformError.message}`;
        setProcessingError(error);
        debugLog('error', 'Data transformation failed', { error: transformError.message });
        return { processed: false, reason: 'transformation_error', error };
      }

      // Update state with processed data
      setProcessedData(transformedData);
      setProcessingError(null);
      setLastProcessedTime(Date.now());
      
      // Update references for next comparison
      previousDataRef.current = rawData;
      previousHashRef.current = createContentHash(rawData);
      
      // Update processing stats
      const processingTime = Date.now() - startTime;
      processingStatsRef.current.lastProcessingTime = processingTime;

      debugLog('info', 'Data processing completed successfully', {
        processingTime: `${processingTime}ms`,
        dataSize: JSON.stringify(transformedData).length
      });

      return { 
        processed: true, 
        data: transformedData,
        processingTime 
      };

    } catch (err) {
      const error = `Processing failed: ${err.message}`;
      setProcessingError(error);
      debugLog('error', 'Unexpected processing error', { error: err.message });
      
      return { processed: false, reason: 'unexpected_error', error };
    }
  }, [hasDataChanged, validateData, transformData, createContentHash, debugLog]);

  /**
   * Get processing statistics
   */
  const getProcessingStats = useCallback(() => {
    const stats = processingStatsRef.current;
    
    return {
      ...stats,
      skipRate: stats.totalProcessed > 0 ? 
        (stats.skippedDuplicates / stats.totalProcessed * 100).toFixed(1) : 0,
      errorRate: stats.totalProcessed > 0 ?
        ((stats.transformationErrors + stats.validationErrors) / stats.totalProcessed * 100).toFixed(1) : 0,
      successRate: stats.totalProcessed > 0 ?
        ((stats.totalProcessed - stats.skippedDuplicates - stats.transformationErrors - stats.validationErrors) / stats.totalProcessed * 100).toFixed(1) : 0,
      averageProcessingTime: stats.lastProcessingTime,
      lastProcessedTime
    };
  }, [lastProcessedTime]);

  /**
   * Reset processing state
   */
  const resetProcessing = useCallback(() => {
    setProcessedData(null);
    setProcessingError(null);
    setLastProcessedTime(null);
    previousDataRef.current = null;
    previousHashRef.current = '';
    
    processingStatsRef.current = {
      totalProcessed: 0,
      skippedDuplicates: 0,
      transformationErrors: 0,
      validationErrors: 0,
      lastProcessingTime: 0
    };
    
    debugLog('info', 'Processing state reset');
  }, [debugLog]);

  /**
   * Memoized processing configuration
   */
  const processingConfig = useMemo(() => ({
    excludeFromComparison,
    hasCustomComparison: !!compareData,
    hasValidation: validateData !== (() => ({ isValid: true })),
    hasTransformation: transformData !== ((data) => data)
  }), [excludeFromComparison, compareData, validateData, transformData]);

  return {
    // Processed data state
    processedData,
    processingError,
    lastProcessedTime,
    
    // Processing functions
    processData,
    resetProcessing,
    
    // Change detection utilities
    hasDataChanged,
    createContentHash,
    
    // Monitoring
    getProcessingStats,
    processingConfig,
    
    // Internal state (for debugging)
    _internal: process.env.NODE_ENV === 'development' ? {
      previousData: previousDataRef.current,
      previousHash: previousHashRef.current,
      stats: processingStatsRef.current
    } : undefined
  };
}