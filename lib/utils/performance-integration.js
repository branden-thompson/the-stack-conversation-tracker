/**
 * Performance Integration Utilities
 * 
 * Utilities for integrating performance monitoring with existing API infrastructure
 * Implements zero-impact piggybacking strategy for metrics collection
 */

import React from 'react';

// Client-side: Enhance API responses with performance metrics
export function enhanceApiResponse(response, performanceMetrics = []) {
  if (!response || typeof response !== 'object') return response;
  
  // Only add metrics if they exist and response is successful
  if (performanceMetrics.length > 0) {
    return {
      ...response,
      _performance: {
        metricsIncluded: performanceMetrics.length,
        collectedAt: Date.now()
      }
    };
  }
  
  return response;
}

// Client-side: Extract and send performance metrics from API calls
export async function sendPerformanceMetrics(metrics) {
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return null;
  }

  try {
    const response = await fetch('/api/performance-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics })
    });

    if (!response.ok) {
      console.warn('Failed to send performance metrics:', response.status);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.warn('Error sending performance metrics:', error);
    return null;
  }
}

// Client-side: Create enhanced fetch wrapper that handles performance metrics
export function createPerformanceAwareFetch(performanceMonitor) {
  const originalFetch = window.fetch;

  return async function enhancedFetch(...args) {
    const result = await originalFetch(...args);
    
    // Get any pending metrics from the performance monitor
    if (performanceMonitor && typeof performanceMonitor.getMetricsBatch === 'function') {
      const metrics = performanceMonitor.getMetricsBatch();
      
      // Send metrics asynchronously without blocking the main request
      if (metrics.length > 0) {
        setTimeout(() => {
          sendPerformanceMetrics(metrics);
        }, 0);
      }
    }
    
    return result;
  };
}

// Server-side: Middleware to add performance timing to API responses
export function withPerformanceTiming(handler) {
  return async function performanceTimedHandler(request) {
    const startTime = process.hrtime.bigint();
    
    try {
      const response = await handler(request);
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      // Add server timing header
      if (response && response.headers) {
        response.headers.set('Server-Timing', `api-duration;dur=${duration.toFixed(2)}`);
      }

      // If response is JSON, add timing metadata
      if (response && response.headers && response.headers.get('content-type')?.includes('application/json')) {
        try {
          const originalJson = await response.json();
          const enhancedResponse = {
            ...originalJson,
            _timing: {
              serverDuration: duration,
              timestamp: Date.now()
            }
          };
          
          return new Response(JSON.stringify(enhancedResponse), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        } catch (error) {
          // If we can't parse JSON, return original response
          return response;
        }
      }

      return response;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      
      // Still add timing even for errors
      console.error(`API Error after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };
}

// Utility to create performance-aware API client
export class PerformanceAwareApiClient {
  constructor(performanceMonitor = null) {
    this.performanceMonitor = performanceMonitor;
    this.metricsQueue = [];
    this.maxQueueSize = 50;
  }

  async request(url, options = {}) {
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, options);
      const endTime = performance.now();
      
      // Queue performance metric
      this.queueMetric({
        type: 'api_performance',
        url,
        method: options.method || 'GET',
        duration: endTime - startTime,
        status: response.status,
        ok: response.ok,
        timestamp: Date.now()
      });
      
      // Auto-flush metrics if queue is getting full
      if (this.metricsQueue.length >= this.maxQueueSize) {
        this.flushMetrics();
      }
      
      return response;
    } catch (error) {
      const endTime = performance.now();
      
      // Queue error metric
      this.queueMetric({
        type: 'api_performance',
        url,
        method: options.method || 'GET',
        duration: endTime - startTime,
        status: 0,
        ok: false,
        error: error.message,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }

  queueMetric(metric) {
    this.metricsQueue.push(metric);
    
    // Prevent queue from growing too large
    if (this.metricsQueue.length > this.maxQueueSize) {
      this.metricsQueue.shift();
    }
  }

  async flushMetrics() {
    if (this.metricsQueue.length === 0) return;
    
    const metrics = [...this.metricsQueue];
    this.metricsQueue = [];
    
    try {
      await sendPerformanceMetrics(metrics);
    } catch (error) {
      console.warn('Failed to flush performance metrics:', error);
      // Re-queue metrics on failure (up to a limit)
      if (this.metricsQueue.length < this.maxQueueSize / 2) {
        this.metricsQueue.unshift(...metrics.slice(-10)); // Keep last 10 metrics
      }
    }
  }

  // Get current queue status
  getQueueStatus() {
    return {
      queuedMetrics: this.metricsQueue.length,
      maxQueueSize: this.maxQueueSize,
      ready: this.metricsQueue.length > 0
    };
  }
}

// React hook integration helper
export function usePerformanceIntegration(performanceMonitor) {
  const apiClient = React.useMemo(() => 
    new PerformanceAwareApiClient(performanceMonitor), 
    [performanceMonitor]
  );
  
  // Auto-flush metrics periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (apiClient.getQueueStatus().queuedMetrics > 0) {
        apiClient.flushMetrics();
      }
    }, 30000); // Flush every 30 seconds
    
    return () => clearInterval(interval);
  }, [apiClient]);
  
  return {
    apiClient,
    queueStatus: apiClient.getQueueStatus()
  };
}

// Development utilities for testing performance impact
export const PerformanceTestUtils = {
  // Measure function execution time
  measureExecution: async (fn, iterations = 1) => {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }
    
    return {
      iterations,
      times,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      total: times.reduce((a, b) => a + b, 0)
    };
  },

  // Create load testing scenario
  createLoadTest: (apiCall, options = {}) => {
    const {
      concurrentUsers = 5,
      callsPerUser = 10,
      delayBetweenCalls = 1000,
      maxDuration = 60000
    } = options;
    
    return async function runLoadTest() {
      const results = [];
      const startTime = Date.now();
      
      const userPromises = Array.from({ length: concurrentUsers }, async (_, userIndex) => {
        const userResults = [];
        
        for (let call = 0; call < callsPerUser; call++) {
          if (Date.now() - startTime > maxDuration) break;
          
          const callStart = performance.now();
          try {
            await apiCall();
            const callEnd = performance.now();
            userResults.push({
              user: userIndex,
              call,
              duration: callEnd - callStart,
              success: true,
              timestamp: Date.now()
            });
          } catch (error) {
            const callEnd = performance.now();
            userResults.push({
              user: userIndex,
              call,
              duration: callEnd - callStart,
              success: false,
              error: error.message,
              timestamp: Date.now()
            });
          }
          
          // Wait between calls
          if (call < callsPerUser - 1) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
          }
        }
        
        return userResults;
      });
      
      const allResults = await Promise.all(userPromises);
      return allResults.flat();
    };
  }
};

const PerformanceIntegration = {
  enhanceApiResponse,
  sendPerformanceMetrics,
  createPerformanceAwareFetch,
  withPerformanceTiming,
  PerformanceAwareApiClient,
  usePerformanceIntegration,
  PerformanceTestUtils
};

export default PerformanceIntegration;