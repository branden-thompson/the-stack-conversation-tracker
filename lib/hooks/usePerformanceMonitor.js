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

  const [isEnabled, setIsEnabled] = useState(enabledByDefault);
  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [overheadImpact, setOverheadImpact] = useState(null);
  
  const monitorRef = useRef(null);
  const flushTimerRef = useRef(null);

  // Initialize performance monitor
  useEffect(() => {
    monitorRef.current = getPerformanceMonitor();
    monitorRef.current.setEnabled(isEnabled);

    // Update summary and collect metrics periodically
    const updateSummary = () => {
      if (monitorRef.current && isEnabled) {
        // Get new metrics from the monitor
        const newMetrics = monitorRef.current.flushMetrics();
        if (newMetrics.length > 0) {
          setMetrics(prev => [...prev.slice(-90), ...newMetrics]); // Keep last 100 metrics
        }

        const currentSummary = monitorRef.current.getCurrentSummary();
        setSummary(currentSummary);

        const impact = monitorRef.current.getOverheadImpact();
        setOverheadImpact(impact);
      }
    };

    // Initial update
    updateSummary();

    // Set up periodic updates
    const intervalId = setInterval(updateSummary, 5000); // Every 5 seconds

    return () => {
      clearInterval(intervalId);
      const currentTimer = flushTimerRef.current;
      if (currentTimer) {
        clearTimeout(currentTimer);
      }
    };
  }, [isEnabled]);

  // Enable/disable monitoring
  const toggleMonitoring = useCallback((enabled) => {
    setIsEnabled(enabled);
    if (monitorRef.current) {
      monitorRef.current.setEnabled(enabled);
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

  // Get navigation metrics
  const getNavigationMetrics = useCallback(() => {
    return getMetricsByType('navigation_timing');
  }, [getMetricsByType]);

  // Get memory metrics
  const getMemoryMetrics = useCallback(() => {
    return getMetricsByType('memory_usage');
  }, [getMetricsByType]);

  // Get performance summary for specific time period
  const getPerformanceSummary = useCallback((timeWindowMs = 300000) => { // 5 minutes default
    const cutoff = Date.now() - timeWindowMs;
    const recentMetrics = metrics.filter(metric => metric.timestamp > cutoff);
    
    const apiMetrics = recentMetrics.filter(m => m.type === 'api_performance');
    const navMetrics = recentMetrics.filter(m => m.type === 'navigation_timing');
    const memMetrics = recentMetrics.filter(m => m.type === 'memory_usage');

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

    // Calculate navigation performance stats
    const navStats = navMetrics.length > 0 ? {
      totalNavigations: navMetrics.length,
      averageNavigationTime: navMetrics.reduce((sum, m) => sum + m.data.navigationTime, 0) / navMetrics.length,
      slowestNavigation: Math.max(...navMetrics.map(m => m.data.navigationTime)),
      fastestNavigation: Math.min(...navMetrics.map(m => m.data.navigationTime)),
      routeBreakdown: navMetrics.reduce((acc, m) => {
        const route = m.data.route;
        if (!acc[route]) acc[route] = { count: 0, totalTime: 0 };
        acc[route].count++;
        acc[route].totalTime += m.data.navigationTime;
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
      navigation: navStats,
      memory: memStats,
      monitoring: {
        enabled: isEnabled,
        overhead: overheadImpact,
        sessionId: summary?.sessionId
      }
    };
  }, [metrics, isEnabled, overheadImpact, summary]);

  // Health check - detect performance issues
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
    
    // Check navigation performance
    if (recentSummary.navigation) {
      if (recentSummary.navigation.averageNavigationTime > 2000) {
        issues.push('Slow page navigation detected');
      } else if (recentSummary.navigation.averageNavigationTime > 1000) {
        warnings.push('Navigation could be faster');
      }
    }
    
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
  }, [getPerformanceSummary]);

  return {
    // State
    isEnabled,
    summary,
    metrics: metrics.slice(-50), // Return last 50 metrics for UI
    overheadImpact,
    
    // Controls
    toggleMonitoring,
    
    // Metrics access
    getMetricsBatch,
    flushMetrics,
    getMetricsByType,
    getApiMetrics,
    getNavigationMetrics,
    getMemoryMetrics,
    
    // Analysis
    getPerformanceSummary,
    getHealthStatus
  };
}

export default usePerformanceMonitor;