/**
 * Performance Monitor Service
 * 
 * Zero-impact performance monitoring that piggybacks on existing API calls
 * and provides comprehensive metrics collection without new polling loops.
 */

class PerformanceMonitor {
  constructor() {
    this.isEnabled = true;
    this.metrics = new Map();
    this.observers = new Map();
    this.startTime = performance.now();
    this.sessionId = this.generateSessionId();
    
    // Batch metrics for efficient transport
    this.metricsBatch = [];
    this.batchSize = 10;
    this.lastFlush = Date.now();
    
    // Performance impact tracking
    this.overheadTracking = {
      collectionTime: [],
      memoryBaseline: null,
      enabled: true
    };

    this.initializeMonitoring();
  }

  generateSessionId() {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize all performance monitoring capabilities
   */
  initializeMonitoring() {
    if (!this.isEnabled) return;

    // Set memory baseline
    if (performance.memory) {
      this.overheadTracking.memoryBaseline = performance.memory.usedJSHeapSize;
    }

    this.initializePerformanceObservers();
    this.initializeNavigationTracking();
    this.initializeApiTracking();
    this.initializeMemoryTracking();
    this.initializeWebVitals();
  }

  /**
   * Performance Observer for comprehensive timing metrics
   */
  initializePerformanceObservers() {
    const observerTypes = [
      'navigation',
      'resource',
      'paint',
      'layout-shift',
      'first-input',
      'largest-contentful-paint'
    ];

    observerTypes.forEach(type => {
      try {
        if (PerformanceObserver.supportedEntryTypes.includes(type)) {
          const observer = new PerformanceObserver((list) => {
            this.processPerformanceEntries(list.getEntries(), type);
          });
          
          observer.observe({ type, buffered: true });
          this.observers.set(type, observer);
        }
      } catch (error) {
        console.warn(`Performance observer for ${type} not supported:`, error);
      }
    });
  }

  /**
   * Process performance entries and extract relevant metrics
   */
  processPerformanceEntries(entries, type) {
    const startTime = performance.now();

    entries.forEach(entry => {
      const metric = {
        id: this.generateMetricId(),
        timestamp: Date.now(),
        sessionId: this.sessionId,
        type: `performance_${type}`,
        data: this.extractMetricData(entry, type)
      };

      this.addToBatch(metric);
    });

    // Track overhead
    if (this.overheadTracking.enabled) {
      const overhead = performance.now() - startTime;
      this.overheadTracking.collectionTime.push(overhead);
      
      // Keep only last 100 measurements
      if (this.overheadTracking.collectionTime.length > 100) {
        this.overheadTracking.collectionTime.shift();
      }
    }
  }

  /**
   * Extract relevant data from performance entries
   */
  extractMetricData(entry, type) {
    const baseData = {
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration
    };

    switch (type) {
      case 'navigation':
        return {
          ...baseData,
          domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          loadComplete: entry.loadEventEnd - entry.loadEventStart,
          dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
          tcpConnect: entry.connectEnd - entry.connectStart,
          responseTime: entry.responseEnd - entry.responseStart,
          renderTime: entry.domComplete - entry.domLoading
        };
        
      case 'resource':
        return {
          ...baseData,
          size: entry.transferSize || 0,
          responseTime: entry.responseEnd - entry.responseStart,
          initiatorType: entry.initiatorType
        };
        
      case 'paint':
        return {
          ...baseData,
          paintType: entry.name
        };
        
      case 'layout-shift':
        return {
          ...baseData,
          value: entry.value,
          sources: entry.sources?.length || 0
        };
        
      case 'first-input':
        return {
          ...baseData,
          processingTime: entry.processingEnd - entry.processingStart
        };
        
      case 'largest-contentful-paint':
        return {
          ...baseData,
          size: entry.size,
          loadTime: entry.loadTime
        };
        
      default:
        return baseData;
    }
  }

  /**
   * Track navigation performance
   */
  initializeNavigationTracking() {
    let navigationStartTime = performance.now();

    // Track route changes (for SPA navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      navigationStartTime = performance.now();
      const result = originalPushState.apply(history, args);
      this.trackNavigationEnd(args[2] || window.location.pathname, navigationStartTime);
      return result;
    };

    history.replaceState = (...args) => {
      navigationStartTime = performance.now();
      const result = originalReplaceState.apply(history, args);
      this.trackNavigationEnd(args[2] || window.location.pathname, navigationStartTime);
      return result;
    };

    // Track popstate events
    window.addEventListener('popstate', () => {
      navigationStartTime = performance.now();
      setTimeout(() => {
        this.trackNavigationEnd(window.location.pathname, navigationStartTime);
      }, 0);
    });
  }

  /**
   * Track navigation completion
   */
  trackNavigationEnd(route, startTime) {
    // Wait for page to be interactive
    setTimeout(() => {
      const navigationTime = performance.now() - startTime;
      
      const metric = {
        id: this.generateMetricId(),
        timestamp: Date.now(),
        sessionId: this.sessionId,
        type: 'navigation_timing',
        data: {
          route,
          navigationTime,
          timestamp: Date.now()
        }
      };

      this.addToBatch(metric);
    }, 100); // Allow time for rendering
  }

  /**
   * Track API call performance
   */
  initializeApiTracking() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      const options = args[1] || {};

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Only track our API calls
        if (url.includes('/api/')) {
          const metric = {
            id: this.generateMetricId(),
            timestamp: Date.now(),
            sessionId: this.sessionId,
            type: 'api_performance',
            data: {
              url: url.toString(),
              method: options.method || 'GET',
              duration,
              status: response.status,
              ok: response.ok,
              size: parseInt(response.headers.get('content-length') || '0'),
              timestamp: Date.now()
            }
          };

          this.addToBatch(metric);
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (url.includes('/api/')) {
          const metric = {
            id: this.generateMetricId(),
            timestamp: Date.now(),
            sessionId: this.sessionId,
            type: 'api_performance',
            data: {
              url: url.toString(),
              method: options.method || 'GET',
              duration,
              status: 0,
              ok: false,
              error: error.message,
              timestamp: Date.now()
            }
          };

          this.addToBatch(metric);
        }

        throw error;
      }
    };
  }

  /**
   * Track memory usage
   */
  initializeMemoryTracking() {
    if (!performance.memory) return;

    setInterval(() => {
      if (!this.isEnabled) return;

      const metric = {
        id: this.generateMetricId(),
        timestamp: Date.now(),
        sessionId: this.sessionId,
        type: 'memory_usage',
        data: {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        }
      };

      this.addToBatch(metric);
    }, 10000); // Every 10 seconds
  }

  /**
   * Web Vitals tracking
   */
  initializeWebVitals() {
    // Track Cumulative Layout Shift
    let clsValue = 0;
    
    // Track First Input Delay
    let fidValue = null;

    // These will be captured by performance observers above
    // but we can also track them here for immediate access
  }

  /**
   * Add metric to batch for efficient transport
   */
  addToBatch(metric) {
    if (!this.isEnabled) return;

    this.metricsBatch.push(metric);

    // Auto-flush when batch is full or after 30 seconds
    const now = Date.now();
    if (this.metricsBatch.length >= this.batchSize || (now - this.lastFlush) > 30000) {
      this.flushMetrics();
    }
  }

  /**
   * Get current batch of metrics for piggybacking on API calls
   */
  getMetricsBatch() {
    const batch = [...this.metricsBatch];
    this.metricsBatch = [];
    this.lastFlush = Date.now();
    return batch;
  }

  /**
   * Manually flush metrics (called by existing API calls)
   */
  flushMetrics() {
    if (this.metricsBatch.length === 0) return [];

    const batch = this.getMetricsBatch();
    return batch;
  }

  /**
   * Get current performance summary
   */
  getCurrentSummary() {
    const now = Date.now();
    const memoryData = performance.memory ? {
      usedMB: Math.round(performance.memory.usedJSHeapSize / 1048576),
      totalMB: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limitMB: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
    } : null;

    const overheadStats = this.overheadTracking.collectionTime.length > 0 ? {
      avgCollectionTime: this.overheadTracking.collectionTime.reduce((a, b) => a + b, 0) / this.overheadTracking.collectionTime.length,
      maxCollectionTime: Math.max(...this.overheadTracking.collectionTime),
      totalMeasurements: this.overheadTracking.collectionTime.length
    } : null;

    return {
      sessionId: this.sessionId,
      uptime: now - this.startTime,
      isEnabled: this.isEnabled,
      pendingMetrics: this.metricsBatch.length,
      memory: memoryData,
      monitoringOverhead: overheadStats,
      activeObservers: Array.from(this.observers.keys()),
      timestamp: now
    };
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    
    if (!enabled) {
      // Stop all observers
      this.observers.forEach(observer => observer.disconnect());
      this.observers.clear();
      this.metricsBatch = [];
    } else {
      // Reinitialize
      this.initializeMonitoring();
    }
  }

  /**
   * Get monitoring overhead impact
   */
  getOverheadImpact() {
    if (!this.overheadTracking.enabled || this.overheadTracking.collectionTime.length === 0) {
      return null;
    }

    const totalTime = this.overheadTracking.collectionTime.reduce((a, b) => a + b, 0);
    const avgTime = totalTime / this.overheadTracking.collectionTime.length;
    const maxTime = Math.max(...this.overheadTracking.collectionTime);

    const currentMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = this.overheadTracking.memoryBaseline ? 
      currentMemory - this.overheadTracking.memoryBaseline : 0;

    return {
      averageCollectionTime: avgTime,
      maxCollectionTime: maxTime,
      totalCollectionTime: totalTime,
      memoryIncrease: memoryIncrease,
      measurementCount: this.overheadTracking.collectionTime.length
    };
  }

  /**
   * Generate unique metric ID
   */
  generateMetricId() {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
    this.metricsBatch = [];
    this.isEnabled = false;
  }
}

// Singleton instance
let performanceMonitorInstance = null;

export function getPerformanceMonitor() {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
  }
  return performanceMonitorInstance;
}

export function destroyPerformanceMonitor() {
  if (performanceMonitorInstance) {
    performanceMonitorInstance.destroy();
    performanceMonitorInstance = null;
  }
}

export { PerformanceMonitor };