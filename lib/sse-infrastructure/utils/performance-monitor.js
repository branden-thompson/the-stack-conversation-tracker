/**
 * SSE Performance Monitoring Utilities
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | PERFORMANCE UTILITIES
 * PURPOSE: Automated performance monitoring and alerting for SSE systems
 * 
 * FEATURES:
 * - Real-time performance metrics collection
 * - Automated threshold detection and alerting
 * - Performance trend analysis
 * - Resource usage monitoring
 * - Early regression detection
 */

'use client';

import { createDebugLogger, DEBUG_CATEGORIES } from '../config/debug-config.js';

/**
 * Performance thresholds for different metrics
 */
const PERFORMANCE_THRESHOLDS = {
  // Hash calculation performance
  hashCalculationTime: {
    good: 5,      // < 5ms
    warning: 10,  // 5-10ms
    critical: 20  // > 20ms
  },
  
  // Render efficiency (percentage of renders prevented)
  renderEfficiency: {
    excellent: 90, // > 90%
    good: 75,      // 75-90%
    warning: 50,   // 50-75%
    critical: 25   // < 25%
  },
  
  // Data processing time
  processingTime: {
    good: 50,      // < 50ms
    warning: 100,  // 50-100ms
    critical: 200  // > 200ms
  },
  
  // Connection reliability (success rate)
  connectionReliability: {
    excellent: 95, // > 95%
    good: 85,      // 85-95%
    warning: 70,   // 70-85%
    critical: 50   // < 50%
  },
  
  // Memory usage (approximate)
  memoryUsage: {
    good: 10,      // < 10MB
    warning: 25,   // 10-25MB
    critical: 50   // > 50MB
  }
};

/**
 * Performance metrics collector class
 */
class SSEPerformanceMonitor {
  constructor(componentName = 'Unknown', config = {}) {
    this.componentName = componentName;
    this.config = {
      alertThresholds: { ...PERFORMANCE_THRESHOLDS, ...config.alertThresholds },
      enableAlerting: config.enableAlerting !== false,
      collectTrends: config.collectTrends !== false,
      maxTrendSamples: config.maxTrendSamples || 100,
      sampleInterval: config.sampleInterval || 30000 // 30 seconds
    };
    
    this.debugLogger = createDebugLogger(componentName, DEBUG_CATEGORIES.PERFORMANCE);
    
    // Performance data storage
    this.metrics = {
      hashCalculations: [],
      renderPrevention: [],
      dataProcessing: [],
      connectionEvents: [],
      memorySnapshots: []
    };
    
    // Current session stats
    this.sessionStats = {
      startTime: Date.now(),
      totalOperations: 0,
      alertsTriggered: 0,
      performanceRating: 'unknown'
    };
    
    // Alert state tracking
    this.alertState = {
      lastAlertTime: {},
      alertCooldowns: {}
    };
    
    // Start periodic monitoring if enabled
    if (this.config.collectTrends) {
      this.startTrendCollection();
    }
  }

  /**
   * Record hash calculation performance
   */
  recordHashCalculation(duration, dataSize = 0, changed = false) {
    const metric = {
      timestamp: Date.now(),
      duration,
      dataSize,
      changed,
      componentName: this.componentName
    };
    
    this.metrics.hashCalculations.push(metric);
    this.trimMetrics('hashCalculations');
    
    this.debugLogger('verbose', 'Hash calculation recorded', metric);
    
    // Check for performance alerts
    this.checkPerformanceAlert('hashCalculationTime', duration);
    
    return metric;
  }

  /**
   * Record render prevention efficiency
   */
  recordRenderPrevention(prevented, total) {
    const efficiency = total > 0 ? (prevented / total) * 100 : 0;
    
    const metric = {
      timestamp: Date.now(),
      prevented,
      total,
      efficiency,
      componentName: this.componentName
    };
    
    this.metrics.renderPrevention.push(metric);
    this.trimMetrics('renderPrevention');
    
    this.debugLogger('verbose', 'Render prevention recorded', metric);
    
    // Check for efficiency alerts
    this.checkPerformanceAlert('renderEfficiency', efficiency);
    
    return metric;
  }

  /**
   * Record data processing performance
   */
  recordDataProcessing(duration, success = true, errorType = null) {
    const metric = {
      timestamp: Date.now(),
      duration,
      success,
      errorType,
      componentName: this.componentName
    };
    
    this.metrics.dataProcessing.push(metric);
    this.trimMetrics('dataProcessing');
    
    this.debugLogger('verbose', 'Data processing recorded', metric);
    
    // Check for processing time alerts
    this.checkPerformanceAlert('processingTime', duration);
    
    return metric;
  }

  /**
   * Record connection event
   */
  recordConnectionEvent(type, success = true, duration = 0) {
    const metric = {
      timestamp: Date.now(),
      type, // 'connect', 'disconnect', 'fetch', 'error'
      success,
      duration,
      componentName: this.componentName
    };
    
    this.metrics.connectionEvents.push(metric);
    this.trimMetrics('connectionEvents');
    
    this.debugLogger('verbose', 'Connection event recorded', metric);
    
    // Calculate and check connection reliability
    const recentEvents = this.metrics.connectionEvents.slice(-20);
    const successRate = (recentEvents.filter(e => e.success).length / recentEvents.length) * 100;
    this.checkPerformanceAlert('connectionReliability', successRate);
    
    return metric;
  }

  /**
   * Record memory usage snapshot
   */
  recordMemorySnapshot() {
    if (typeof window === 'undefined' || !window.performance?.memory) {
      return null;
    }
    
    const memory = window.performance.memory;
    const metric = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      componentName: this.componentName
    };
    
    this.metrics.memorySnapshots.push(metric);
    this.trimMetrics('memorySnapshots');
    
    this.debugLogger('verbose', 'Memory snapshot recorded', metric);
    
    // Check for memory usage alerts
    this.checkPerformanceAlert('memoryUsage', metric.usedMB);
    
    return metric;
  }

  /**
   * Check if a metric exceeds performance thresholds
   */
  checkPerformanceAlert(metricType, value) {
    if (!this.config.enableAlerting) return;
    
    const thresholds = this.config.alertThresholds[metricType];
    if (!thresholds) return;
    
    let alertLevel = null;
    let message = '';
    
    // Determine alert level based on metric type
    if (metricType === 'renderEfficiency' || metricType === 'connectionReliability') {
      // Higher values are better
      if (value < thresholds.critical) {
        alertLevel = 'critical';
        message = `${metricType} critically low: ${value}%`;
      } else if (value < thresholds.warning) {
        alertLevel = 'warning';
        message = `${metricType} below optimal: ${value}%`;
      }
    } else {
      // Lower values are better
      if (value > thresholds.critical) {
        alertLevel = 'critical';
        message = `${metricType} critically high: ${value}${metricType.includes('Time') ? 'ms' : ''}`;
      } else if (value > thresholds.warning) {
        alertLevel = 'warning';
        message = `${metricType} above optimal: ${value}${metricType.includes('Time') ? 'ms' : ''}`;
      }
    }
    
    if (alertLevel) {
      this.triggerAlert(alertLevel, metricType, message, value);
    }
  }

  /**
   * Trigger performance alert with cooldown logic
   */
  triggerAlert(level, metricType, message, value) {
    const now = Date.now();
    const alertKey = `${level}-${metricType}`;
    const cooldownTime = level === 'critical' ? 30000 : 60000; // 30s for critical, 60s for warning
    
    // Check cooldown
    if (this.alertState.lastAlertTime[alertKey] && 
        (now - this.alertState.lastAlertTime[alertKey]) < cooldownTime) {
      return;
    }
    
    this.alertState.lastAlertTime[alertKey] = now;
    this.sessionStats.alertsTriggered++;
    
    const alert = {
      timestamp: now,
      level,
      metricType,
      message,
      value,
      componentName: this.componentName,
      sessionStats: { ...this.sessionStats }
    };
    
    // Log alert based on level
    if (level === 'critical') {
      this.debugLogger('error', `🚨 CRITICAL PERFORMANCE ALERT: ${message}`, alert);
    } else {
      this.debugLogger('warn', `⚠️ PERFORMANCE WARNING: ${message}`, alert);
    }
    
    return alert;
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport() {
    const now = Date.now();
    const sessionDuration = now - this.sessionStats.startTime;
    
    // Calculate averages and trends
    const hashCalcs = this.metrics.hashCalculations;
    const renderPrev = this.metrics.renderPrevention;
    const dataProc = this.metrics.dataProcessing;
    const connEvents = this.metrics.connectionEvents;
    const memSnapshots = this.metrics.memorySnapshots;
    
    const report = {
      componentName: this.componentName,
      sessionDuration,
      timestamp: now,
      
      // Hash calculation performance
      hashCalculation: {
        totalCalculations: hashCalcs.length,
        averageDuration: this.calculateAverage(hashCalcs, 'duration'),
        p95Duration: this.calculatePercentile(hashCalcs, 'duration', 95),
        changeDetectionRate: hashCalcs.length > 0 ? 
          (hashCalcs.filter(h => h.changed).length / hashCalcs.length * 100).toFixed(1) : 0
      },
      
      // Render prevention efficiency
      renderEfficiency: {
        totalRenderChecks: renderPrev.reduce((sum, r) => sum + r.total, 0),
        totalRendersPrevented: renderPrev.reduce((sum, r) => sum + r.prevented, 0),
        currentEfficiency: renderPrev.length > 0 ? 
          renderPrev[renderPrev.length - 1].efficiency : 0,
        averageEfficiency: this.calculateAverage(renderPrev, 'efficiency')
      },
      
      // Data processing performance
      dataProcessing: {
        totalProcessed: dataProc.length,
        averageDuration: this.calculateAverage(dataProc, 'duration'),
        successRate: dataProc.length > 0 ?
          (dataProc.filter(d => d.success).length / dataProc.length * 100).toFixed(1) : 0,
        errorTypes: this.getErrorTypeSummary(dataProc)
      },
      
      // Connection reliability
      connectionReliability: {
        totalEvents: connEvents.length,
        successRate: connEvents.length > 0 ?
          (connEvents.filter(c => c.success).length / connEvents.length * 100).toFixed(1) : 0,
        eventTypes: this.getEventTypeSummary(connEvents)
      },
      
      // Memory usage
      memoryUsage: {
        samplesCollected: memSnapshots.length,
        currentUsageMB: memSnapshots.length > 0 ? memSnapshots[memSnapshots.length - 1].usedMB : 0,
        averageUsageMB: this.calculateAverage(memSnapshots, 'usedMB'),
        peakUsageMB: Math.max(...memSnapshots.map(m => m.usedMB), 0)
      },
      
      // Overall health assessment
      healthAssessment: this.calculateHealthAssessment(),
      
      // Session statistics
      sessionStats: {
        ...this.sessionStats,
        sessionDuration
      }
    };
    
    return report;
  }

  /**
   * Calculate overall health assessment
   */
  calculateHealthAssessment() {
    const thresholds = this.config.alertThresholds;
    let healthScore = 100;
    const issues = [];
    
    // Analyze recent performance
    const recentHashCalcs = this.metrics.hashCalculations.slice(-10);
    const recentRenderPrev = this.metrics.renderPrevention.slice(-5);
    const recentDataProc = this.metrics.dataProcessing.slice(-10);
    const recentConnEvents = this.metrics.connectionEvents.slice(-10);
    
    // Hash calculation health
    const avgHashTime = this.calculateAverage(recentHashCalcs, 'duration');
    if (avgHashTime > thresholds.hashCalculationTime.critical) {
      healthScore -= 20;
      issues.push('Hash calculations are critically slow');
    } else if (avgHashTime > thresholds.hashCalculationTime.warning) {
      healthScore -= 10;
      issues.push('Hash calculations are slower than optimal');
    }
    
    // Render efficiency health
    const avgRenderEff = this.calculateAverage(recentRenderPrev, 'efficiency');
    if (avgRenderEff < thresholds.renderEfficiency.critical) {
      healthScore -= 25;
      issues.push('Render efficiency is critically low');
    } else if (avgRenderEff < thresholds.renderEfficiency.warning) {
      healthScore -= 15;
      issues.push('Render efficiency below optimal');
    }
    
    // Processing health
    const avgProcTime = this.calculateAverage(recentDataProc, 'duration');
    if (avgProcTime > thresholds.processingTime.critical) {
      healthScore -= 20;
      issues.push('Data processing is critically slow');
    } else if (avgProcTime > thresholds.processingTime.warning) {
      healthScore -= 10;
      issues.push('Data processing is slower than optimal');
    }
    
    // Connection health
    const connSuccessRate = recentConnEvents.length > 0 ?
      (recentConnEvents.filter(c => c.success).length / recentConnEvents.length * 100) : 100;
    if (connSuccessRate < thresholds.connectionReliability.critical) {
      healthScore -= 25;
      issues.push('Connection reliability is critically low');
    } else if (connSuccessRate < thresholds.connectionReliability.warning) {
      healthScore -= 15;
      issues.push('Connection reliability below optimal');
    }
    
    // Determine overall rating
    let rating;
    if (healthScore >= 90) rating = 'excellent';
    else if (healthScore >= 75) rating = 'good';
    else if (healthScore >= 50) rating = 'fair';
    else rating = 'poor';
    
    return {
      score: Math.max(0, healthScore),
      rating,
      issues,
      recommendations: this.generateRecommendations(issues)
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(issues) {
    const recommendations = [];
    
    if (issues.some(i => i.includes('Hash calculations'))) {
      recommendations.push('Consider optimizing hash calculation by reducing data size or using more efficient comparison methods');
    }
    
    if (issues.some(i => i.includes('Render efficiency'))) {
      recommendations.push('Review excludeFromHash configuration and essential data extraction to improve render prevention');
    }
    
    if (issues.some(i => i.includes('Data processing'))) {
      recommendations.push('Optimize data transformation logic and consider async processing for heavy operations');
    }
    
    if (issues.some(i => i.includes('Connection reliability'))) {
      recommendations.push('Check network stability and consider implementing exponential backoff for reconnections');
    }
    
    return recommendations;
  }

  /**
   * Start periodic trend collection
   */
  startTrendCollection() {
    if (this.trendInterval) return;
    
    this.trendInterval = setInterval(() => {
      this.recordMemorySnapshot();
      this.debugLogger('verbose', 'Periodic trend collection completed');
    }, this.config.sampleInterval);
  }

  /**
   * Stop trend collection
   */
  stopTrendCollection() {
    if (this.trendInterval) {
      clearInterval(this.trendInterval);
      this.trendInterval = null;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopTrendCollection();
    this.metrics = {};
    this.sessionStats = {};
    this.alertState = {};
  }

  // Utility methods
  calculateAverage(array, field) {
    if (array.length === 0) return 0;
    return (array.reduce((sum, item) => sum + item[field], 0) / array.length).toFixed(2);
  }

  calculatePercentile(array, field, percentile) {
    if (array.length === 0) return 0;
    const sorted = array.map(item => item[field]).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  getErrorTypeSummary(dataProc) {
    const errorTypes = {};
    dataProc.filter(d => !d.success && d.errorType).forEach(d => {
      errorTypes[d.errorType] = (errorTypes[d.errorType] || 0) + 1;
    });
    return errorTypes;
  }

  getEventTypeSummary(connEvents) {
    const eventTypes = {};
    connEvents.forEach(e => {
      eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
    });
    return eventTypes;
  }

  trimMetrics(metricType) {
    if (this.metrics[metricType].length > this.config.maxTrendSamples) {
      this.metrics[metricType] = this.metrics[metricType].slice(-this.config.maxTrendSamples);
    }
  }
}

/**
 * Factory function to create performance monitor instances
 */
export function createPerformanceMonitor(componentName, config = {}) {
  return new SSEPerformanceMonitor(componentName, config);
}

/**
 * Global performance monitoring utilities
 */
export const PerformanceUtils = {
  /**
   * Create performance timer
   */
  createTimer: (label) => {
    const start = performance.now();
    return {
      end: () => performance.now() - start,
      endWithLog: (monitor) => {
        const duration = performance.now() - start;
        if (monitor && typeof monitor.recordHashCalculation === 'function') {
          monitor.recordHashCalculation(duration);
        }
        return duration;
      }
    };
  },

  /**
   * Memory usage snapshot
   */
  getMemoryUsage: () => {
    if (typeof window === 'undefined' || !window.performance?.memory) {
      return null;
    }
    
    const memory = window.performance.memory;
    return {
      usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
    };
  },

  /**
   * Performance marks for complex operations
   */
  markStart: (label) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`sse-${label}-start`);
    }
  },

  markEnd: (label) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`sse-${label}-end`);
      try {
        performance.measure(`sse-${label}`, `sse-${label}-start`, `sse-${label}-end`);
        const measure = performance.getEntriesByName(`sse-${label}`)[0];
        return measure.duration;
      } catch (err) {
        return null;
      }
    }
    return null;
  }
};

export default SSEPerformanceMonitor;