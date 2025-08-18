/**
 * usePerformanceMonitor Hook
 * 
 * React hook that provides performance monitoring capabilities
 * and integrates with existing polling infrastructure for zero-impact metrics collection
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPerformanceMonitor } from '@/lib/services/performance-monitor';

export function usePerformanceMonitor(options = {}) {
  const {
    enabledByDefault = true,
    autoFlushInterval = 30000, // 30 seconds
    batchWithApiCalls = true
  } = options;

  // Check for emergency disable flags
  const emergencyDisabled = 
    process.env.NEXT_PUBLIC_PERF_MONITORING_DISABLED === 'true' ||
    (typeof window !== 'undefined' && 
     (window.localStorage?.getItem('perf-monitoring-disabled') === 'true' ||
      window.localStorage?.getItem('perf-monitoring-circuit-tripped')));

  const [isEnabled, setIsEnabled] = useState(enabledByDefault && !emergencyDisabled);
  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [overheadImpact, setOverheadImpact] = useState(null);
  const [circuitBreakerStatus, setCircuitBreakerStatus] = useState(null);
  
  const monitorRef = useRef(null);
  const flushTimerRef = useRef(null);

  // Initialize performance monitor with safety checks
  useEffect(() => {
    if (emergencyDisabled) {
      console.warn('[usePerformanceMonitor] Monitoring disabled via emergency controls');
      return;
    }

    try {
      monitorRef.current = getPerformanceMonitor();
      monitorRef.current.setEnabled(isEnabled);

      // Update summary and collect metrics periodically with error handling
      const updateSummary = () => {
        try {
          if (monitorRef.current && isEnabled) {
            // Check circuit breaker status
            const breaker = monitorRef.current.circuitBreaker;
            const breakerStatus = {
              isTripped: monitorRef.current.isCircuitBreakerTripped(),
              trippedAt: breaker.trippedAt,
              consecutiveErrors: breaker.consecutiveErrors,
              totalErrors: monitorRef.current.safetyMetrics.totalErrors,
              totalOperations: monitorRef.current.safetyMetrics.totalOperations
            };
            setCircuitBreakerStatus(breakerStatus);

            // Skip updates if circuit breaker is tripped
            if (breakerStatus.isTripped) {
              return;
            }

            // Get new metrics from the monitor
            const newMetrics = monitorRef.current.flushMetrics();
            if (newMetrics.length > 0) {
              setMetrics(prev => [...prev.slice(-90), ...newMetrics]); // Keep last 100 metrics
            }

            const currentSummary = monitorRef.current.getCurrentSummary();
            setSummary(currentSummary);

            const impact = monitorRef.current.getOverheadImpact();
            setOverheadImpact(impact);
            
            // Auto-disable if overhead is too high
            if (impact && impact.averageCollectionTime > 15) {
              console.warn('[usePerformanceMonitor] High overhead detected, disabling monitoring');
              setIsEnabled(false);
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem('perf-monitoring-disabled', 'true');
                } catch (error) {
                  // Ignore localStorage errors
                }
              }
            }
          }
        } catch (error) {
          console.error('[usePerformanceMonitor] Error updating summary:', error);
          // Don't disable on single errors, let circuit breaker handle it
        }
      };

      // Initial update
      updateSummary();

      // Set up periodic updates with longer interval for safety
      const intervalId = setInterval(updateSummary, 8000); // Every 8 seconds (increased from 5)

      return () => {
        clearInterval(intervalId);
        const currentTimer = flushTimerRef.current;
        if (currentTimer) {
          clearTimeout(currentTimer);
        }
      };
    } catch (error) {
      console.error('[usePerformanceMonitor] Failed to initialize:', error);
    }
  }, [isEnabled, emergencyDisabled]);

  // Enable/disable monitoring with safety checks
  const toggleMonitoring = useCallback((enabled) => {
    if (emergencyDisabled && enabled) {
      console.warn('[usePerformanceMonitor] Cannot enable monitoring - emergency controls active');
      return false;
    }
    
    try {
      setIsEnabled(enabled);
      if (monitorRef.current) {
        monitorRef.current.setEnabled(enabled);
      }
      
      // Clear emergency disable flags when manually enabling
      if (enabled && typeof window !== 'undefined') {
        try {
          localStorage.removeItem('perf-monitoring-disabled');
          localStorage.removeItem('perf-monitoring-circuit-tripped');
        } catch (error) {
          // Ignore localStorage errors
        }
      }
      
      return true;
    } catch (error) {
      console.error('[usePerformanceMonitor] Error toggling monitoring:', error);
      return false;
    }
  }, [emergencyDisabled]);
  
  // Emergency disable function
  const emergencyDisable = useCallback(() => {
    console.warn('[usePerformanceMonitor] EMERGENCY DISABLE activated');
    setIsEnabled(false);
    
    if (monitorRef.current) {
      try {
        monitorRef.current.setEnabled(false);
        // Trip circuit breaker to prevent re-enabling
        monitorRef.current.tripCircuitBreaker('Manual emergency disable');
      } catch (error) {
        console.error('[usePerformanceMonitor] Error during emergency disable:', error);
      }
    }
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('perf-monitoring-disabled', 'true');
      } catch (error) {
        // Ignore localStorage errors
      }
    }
  }, []);

  // Get metrics batch for piggybacking on API calls
  const getMetricsBatch = useCallback(() => {
    if (!monitorRef.current || !batchWithApiCalls) return [];
    return monitorRef.current.flushMetrics();
  }, [batchWithApiCalls]);

  // Force flush metrics
  const flushMetrics = useCallback(() => {
    if (monitorRef.current) {
      const batch = monitorRef.current.flushMetrics();
      setMetrics(prev => [...prev.slice(-90), ...batch]); // Keep last 100 metrics
      return batch;
    }
    return [];
  }, []);

  // Get specific metric types
  const getMetricsByType = useCallback((type) => {
    return metrics.filter(metric => metric.type === type);
  }, [metrics]);

  // Get API performance metrics
  const getApiMetrics = useCallback(() => {
    return getMetricsByType('api_performance');
  }, [getMetricsByType]);

  // Navigation metrics disabled due to previous system interference
  // const getNavigationMetrics = useCallback(() => {
  //   return getMetricsByType('navigation_timing');
  // }, [getMetricsByType]);

  // Get memory metrics
  const getMemoryMetrics = useCallback(() => {
    return getMetricsByType('memory_usage');
  }, [getMetricsByType]);

  // Get performance summary for specific time period (navigation tracking disabled)
  const getPerformanceSummary = useCallback((timeWindowMs = 300000) => { // 5 minutes default
    const cutoff = Date.now() - timeWindowMs;
    const recentMetrics = metrics.filter(metric => metric.timestamp > cutoff);
    
    const apiMetrics = recentMetrics.filter(m => m.type === 'api_performance');
    const memMetrics = recentMetrics.filter(m => m.type === 'memory_usage');
    // Navigation metrics intentionally excluded due to previous system interference

    // Calculate API performance stats
    const apiStats = apiMetrics.length > 0 ? {
      totalRequests: apiMetrics.length,
      averageResponseTime: apiMetrics.reduce((sum, m) => sum + m.data.duration, 0) / apiMetrics.length,
      errorRate: apiMetrics.filter(m => !m.data.ok).length / apiMetrics.length,
      slowestRequest: Math.max(...apiMetrics.map(m => m.data.duration)),
      fastestRequest: Math.min(...apiMetrics.map(m => m.data.duration)),
      endpointBreakdown: apiMetrics.reduce((acc, m) => {
        const endpoint = m.data.url.split('/').pop() || 'unknown';
        if (!acc[endpoint]) acc[endpoint] = { count: 0, totalTime: 0, errors: 0 };
        acc[endpoint].count++;
        acc[endpoint].totalTime += m.data.duration;
        if (!m.data.ok) acc[endpoint].errors++;
        return acc;
      }, {})
    } : null;

    // Calculate memory stats
    const memStats = memMetrics.length > 0 ? {
      measurements: memMetrics.length,
      currentUsage: memMetrics[memMetrics.length - 1]?.data.usedJSHeapSize || 0,
      peakUsage: Math.max(...memMetrics.map(m => m.data.usedJSHeapSize)),
      averageUsage: memMetrics.reduce((sum, m) => sum + m.data.usedJSHeapSize, 0) / memMetrics.length,
      trend: memMetrics.length > 1 ? 
        memMetrics[memMetrics.length - 1].data.usedJSHeapSize - memMetrics[0].data.usedJSHeapSize : 0
    } : null;

    return {
      timeWindow: timeWindowMs,
      generatedAt: Date.now(),
      totalMetrics: recentMetrics.length,
      api: apiStats,
      // navigation: intentionally removed due to previous issues
      memory: memStats,
      monitoring: {
        enabled: isEnabled,
        overhead: overheadImpact,
        sessionId: summary?.sessionId
      }
    };
  }, [metrics, isEnabled, overheadImpact, summary]);

  // Health check - detect performance issues (navigation checks removed)
  const getHealthStatus = useCallback(() => {
    const recentSummary = getPerformanceSummary(60000); // Last minute
    
    const issues = [];
    const warnings = [];
    
    // Check API performance
    if (recentSummary.api) {
      if (recentSummary.api.averageResponseTime > 1000) {
        issues.push('High API response times detected');
      } else if (recentSummary.api.averageResponseTime > 500) {
        warnings.push('Elevated API response times');
      }
      
      if (recentSummary.api.errorRate > 0.05) {
        issues.push('High API error rate detected');
      } else if (recentSummary.api.errorRate > 0.01) {
        warnings.push('API errors detected');
      }
    }
    
    // Navigation performance checks intentionally removed due to previous system interference
    
    // Check memory usage
    if (recentSummary.memory) {
      const memoryUsageMB = recentSummary.memory.currentUsage / 1048576;
      if (memoryUsageMB > 100) {
        issues.push('High memory usage detected');
      } else if (memoryUsageMB > 50) {
        warnings.push('Memory usage is elevated');
      }
      
      // Check for memory leaks
      if (recentSummary.memory.trend > 10485760) { // 10MB growth
        issues.push('Potential memory leak detected');
      }
    }

    // Check monitoring system health
    if (circuitBreakerStatus?.isTripped) {
      issues.push('Performance monitoring circuit breaker tripped');
    } else if (overheadImpact?.averageCollectionTime > 10) {
      warnings.push('High monitoring overhead detected');
    }

    // Overall health status
    let status = 'optimal';
    if (issues.length > 0) {
      status = 'poor';
    } else if (warnings.length > 0) {
      status = 'degraded';
    }

    return {
      status,
      issues,
      warnings,
      checkedAt: Date.now(),
      summary: recentSummary
    };
  }, [getPerformanceSummary, circuitBreakerStatus, overheadImpact]);

  return {
    // State
    isEnabled: isEnabled && !emergencyDisabled,
    summary,
    metrics: metrics.slice(-50), // Return last 50 metrics for UI
    overheadImpact,
    circuitBreakerStatus,
    emergencyDisabled,
    
    // Controls
    toggleMonitoring,
    emergencyDisable,
    
    // Metrics access
    getMetricsBatch,
    flushMetrics,
    getMetricsByType,
    getApiMetrics,
    // getNavigationMetrics, // Disabled due to previous system interference
    getMemoryMetrics,
    
    // Analysis
    getPerformanceSummary,
    getHealthStatus
  };
}

export default usePerformanceMonitor;