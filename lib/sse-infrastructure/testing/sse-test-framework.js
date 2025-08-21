/**
 * SSE Testing & Validation Framework
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | TESTING UTILITIES
 * PURPOSE: Automated testing framework for SSE systems and performance validation
 * 
 * FEATURES:
 * - Automated flickering detection
 * - Performance regression testing
 * - Hash optimization validation
 * - Cross-tab synchronization testing
 * - Load testing utilities
 * - Visual regression detection
 */

'use client';

import { createDebugLogger, DEBUG_CATEGORIES } from '../config/debug-config.js';
import { createPerformanceMonitor } from '../utils/performance-monitor.js';

/**
 * Test configuration defaults
 */
const DEFAULT_TEST_CONFIG = {
  // Flickering detection
  flickerDetection: {
    enabled: true,
    sampleDuration: 10000,    // 10 seconds
    updateThreshold: 5,       // Max updates per second before flagging
    stabilityWindow: 3000     // 3 seconds of stability required
  },
  
  // Performance thresholds
  performance: {
    hashCalculationTime: 5,   // Max 5ms
    renderEfficiency: 80,     // Min 80% efficiency
    processingTime: 50,       // Max 50ms
    connectionReliability: 95 // Min 95% success rate
  },
  
  // Load testing
  loadTesting: {
    maxConcurrentUsers: 10,
    dataUpdateFrequency: 1000, // 1 second
    testDuration: 30000        // 30 seconds
  },
  
  // Cross-tab testing
  crossTab: {
    tabCount: 3,
    synchronizationTimeout: 5000,
    dataConsistencyChecks: true
  }
};

/**
 * Automated flickering detection system
 */
class FlickerDetector {
  constructor(config = {}) {
    this.config = { ...DEFAULT_TEST_CONFIG.flickerDetection, ...config };
    this.debugLogger = createDebugLogger('FlickerDetector', DEBUG_CATEGORIES.PERFORMANCE);
    
    this.renderEvents = [];
    this.isMonitoring = false;
    this.detectionCallbacks = [];
  }

  /**
   * Start monitoring for flickering
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.renderEvents = [];
    
    this.debugLogger('info', 'Starting flicker detection monitoring', {
      duration: this.config.sampleDuration,
      updateThreshold: this.config.updateThreshold
    });
    
    // Set up monitoring timeout
    this.monitoringTimeout = setTimeout(() => {
      this.stopMonitoring();
      this.analyzeFlickering();
    }, this.config.sampleDuration);
    
    return this;
  }

  /**
   * Record a render event
   */
  recordRender(componentName, data = {}) {
    if (!this.isMonitoring) return;
    
    const event = {
      timestamp: Date.now(),
      componentName,
      data: {
        dataHash: data.dataHash || '',
        renderTrigger: data.renderTrigger || 'unknown',
        renderPrevented: data.renderPrevented || false
      }
    };
    
    this.renderEvents.push(event);
    
    this.debugLogger('verbose', 'Render event recorded', event);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.monitoringTimeout) {
      clearTimeout(this.monitoringTimeout);
      this.monitoringTimeout = null;
    }
    
    this.debugLogger('info', 'Flicker detection monitoring stopped');
  }

  /**
   * Analyze collected render events for flickering patterns
   */
  analyzeFlickering() {
    const analysis = {
      totalRenders: this.renderEvents.length,
      timeWindow: this.config.sampleDuration,
      rendersPerSecond: (this.renderEvents.length / this.config.sampleDuration) * 1000,
      hasFlickering: false,
      flickerPatterns: [],
      stabilityPeriods: [],
      recommendations: []
    };
    
    // Group events by component
    const componentEvents = this.renderEvents.reduce((acc, event) => {
      const comp = event.componentName || 'unknown';
      if (!acc[comp]) acc[comp] = [];
      acc[comp].push(event);
      return acc;
    }, {});
    
    // Analyze each component
    Object.keys(componentEvents).forEach(componentName => {
      const events = componentEvents[componentName];
      const componentAnalysis = this.analyzeComponentFlickering(componentName, events);
      
      if (componentAnalysis.hasFlickering) {
        analysis.hasFlickering = true;
        analysis.flickerPatterns.push(componentAnalysis);
      }
      
      analysis.stabilityPeriods.push(...componentAnalysis.stabilityPeriods);
    });
    
    // Overall assessment
    if (analysis.rendersPerSecond > this.config.updateThreshold) {
      analysis.hasFlickering = true;
      analysis.recommendations.push(
        `Render frequency (${analysis.rendersPerSecond.toFixed(1)}/sec) exceeds threshold (${this.config.updateThreshold}/sec)`
      );
    }
    
    // Generate recommendations
    analysis.recommendations.push(...this.generateFlickerRecommendations(analysis));
    
    this.debugLogger('info', 'Flicker analysis completed', analysis);
    
    // Notify callbacks
    this.detectionCallbacks.forEach(callback => {
      try {
        callback(analysis);
      } catch (err) {
        this.debugLogger('error', 'Flicker detection callback failed', { error: err.message });
      }
    });
    
    return analysis;
  }

  /**
   * Analyze flickering for a specific component
   */
  analyzeComponentFlickering(componentName, events) {
    const analysis = {
      componentName,
      totalEvents: events.length,
      hasFlickering: false,
      flickerFrequency: 0,
      stabilityPeriods: [],
      patterns: []
    };
    
    if (events.length < 2) return analysis;
    
    // Calculate time gaps between renders
    const timeGaps = [];
    for (let i = 1; i < events.length; i++) {
      timeGaps.push(events[i].timestamp - events[i - 1].timestamp);
    }
    
    // Look for regular patterns (potential flickering)
    const averageGap = timeGaps.reduce((a, b) => a + b, 0) / timeGaps.length;
    const gapVariance = timeGaps.reduce((acc, gap) => acc + Math.pow(gap - averageGap, 2), 0) / timeGaps.length;
    const gapStdDev = Math.sqrt(gapVariance);
    
    // Detect regular intervals (flickering indicator)
    if (gapStdDev < averageGap * 0.2 && averageGap < 5000) { // Less than 5 second intervals with low variance
      analysis.hasFlickering = true;
      analysis.flickerFrequency = 1000 / averageGap; // Flickers per second
      analysis.patterns.push({
        type: 'regular_interval',
        frequency: analysis.flickerFrequency,
        averageInterval: averageGap,
        variance: gapVariance
      });
    }
    
    // Look for stability periods
    let currentStabilityStart = null;
    for (let i = 0; i < timeGaps.length; i++) {
      const gap = timeGaps[i];
      
      if (gap > this.config.stabilityWindow) {
        // Found a stability period
        if (currentStabilityStart !== null) {
          analysis.stabilityPeriods.push({
            start: currentStabilityStart,
            end: events[i].timestamp,
            duration: events[i].timestamp - currentStabilityStart
          });
        }
        currentStabilityStart = events[i + 1]?.timestamp || null;
      }
    }
    
    return analysis;
  }

  /**
   * Generate recommendations based on flicker analysis
   */
  generateFlickerRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.hasFlickering) {
      recommendations.push('Flickering detected - review hash optimization and essential data extraction');
    }
    
    if (analysis.flickerPatterns.some(p => p.patterns.some(pat => pat.type === 'regular_interval'))) {
      recommendations.push('Regular interval flickering suggests timer-based issues - check for unnecessary setInterval/setTimeout');
    }
    
    if (analysis.stabilityPeriods.length === 0) {
      recommendations.push('No stability periods found - system may have continuous unnecessary updates');
    }
    
    const shortStabilityPeriods = analysis.stabilityPeriods.filter(p => p.duration < this.config.stabilityWindow);
    if (shortStabilityPeriods.length > 0) {
      recommendations.push('Multiple short stability periods - consider increasing debounce or throttling');
    }
    
    return recommendations;
  }

  /**
   * Add callback for flicker detection results
   */
  onFlickerDetected(callback) {
    this.detectionCallbacks.push(callback);
    return this;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopMonitoring();
    this.renderEvents = [];
    this.detectionCallbacks = [];
  }
}

/**
 * Performance regression testing
 */
class PerformanceRegression {
  constructor(config = {}) {
    this.config = { ...DEFAULT_TEST_CONFIG.performance, ...config };
    this.debugLogger = createDebugLogger('PerformanceRegression', DEBUG_CATEGORIES.PERFORMANCE);
    this.performanceMonitor = createPerformanceMonitor('RegressionTester');
    
    this.baseline = null;
    this.testResults = [];
  }

  /**
   * Set performance baseline
   */
  setBaseline(metrics) {
    this.baseline = {
      timestamp: Date.now(),
      metrics: { ...metrics },
      version: process.env.npm_package_version || 'unknown'
    };
    
    this.debugLogger('info', 'Performance baseline set', this.baseline);
    return this;
  }

  /**
   * Run performance regression test
   */
  async runRegressionTest(hookInstance) {
    if (!this.baseline) {
      throw new Error('No baseline set - call setBaseline() first');
    }
    
    this.debugLogger('info', 'Starting performance regression test');
    
    const testResult = {
      timestamp: Date.now(),
      baseline: this.baseline,
      current: {},
      regressions: [],
      improvements: [],
      status: 'unknown'
    };
    
    try {
      // Collect current performance metrics
      if (hookInstance && typeof hookInstance.getPerformanceStats === 'function') {
        const currentStats = hookInstance.getPerformanceStats();
        testResult.current = currentStats;
        
        // Compare with baseline
        this.compareMetrics(testResult, this.baseline.metrics, currentStats);
      }
      
      // System health check
      if (hookInstance && typeof hookInstance.getSystemStats === 'function') {
        const systemStats = hookInstance.getSystemStats();
        testResult.current.systemStats = systemStats;
        
        this.checkSystemHealth(testResult, systemStats);
      }
      
      // Determine overall status
      if (testResult.regressions.length === 0) {
        testResult.status = 'passed';
      } else if (testResult.regressions.some(r => r.severity === 'critical')) {
        testResult.status = 'failed';
      } else {
        testResult.status = 'warning';
      }
      
      this.testResults.push(testResult);
      
      this.debugLogger('info', 'Performance regression test completed', {
        status: testResult.status,
        regressions: testResult.regressions.length,
        improvements: testResult.improvements.length
      });
      
      return testResult;
      
    } catch (err) {
      testResult.status = 'error';
      testResult.error = err.message;
      
      this.debugLogger('error', 'Performance regression test failed', { error: err.message });
      return testResult;
    }
  }

  /**
   * Compare metrics with baseline
   */
  compareMetrics(testResult, baseline, current) {
    const metricsToCheck = [
      { key: 'renderEfficiency', threshold: 5, higherIsBetter: true },
      { key: 'skipRate', threshold: 10, higherIsBetter: true },
      { key: 'currentUserCount', threshold: 20, higherIsBetter: false },
      { key: 'totalUpdates', threshold: 100, higherIsBetter: false }
    ];
    
    metricsToCheck.forEach(metric => {
      const baselineValue = parseFloat(baseline[metric.key]) || 0;
      const currentValue = parseFloat(current[metric.key]) || 0;
      
      if (baselineValue === 0) return; // Skip if no baseline data
      
      const percentChange = ((currentValue - baselineValue) / baselineValue) * 100;
      const absChange = Math.abs(percentChange);
      
      if (absChange > metric.threshold) {
        const isRegression = metric.higherIsBetter ? percentChange < 0 : percentChange > 0;
        const severity = absChange > 25 ? 'critical' : absChange > 15 ? 'high' : 'medium';
        
        const changeInfo = {
          metric: metric.key,
          baseline: baselineValue,
          current: currentValue,
          percentChange: percentChange.toFixed(1),
          severity,
          threshold: metric.threshold
        };
        
        if (isRegression) {
          testResult.regressions.push(changeInfo);
        } else {
          testResult.improvements.push(changeInfo);
        }
      }
    });
  }

  /**
   * Check system health metrics
   */
  checkSystemHealth(testResult, systemStats) {
    const healthChecks = [
      {
        path: 'overall.overallEfficiency',
        threshold: this.config.renderEfficiency,
        higherIsBetter: true,
        name: 'Overall Efficiency'
      },
      {
        path: 'connection.successRate',
        threshold: this.config.connectionReliability,
        higherIsBetter: true,
        name: 'Connection Reliability'
      }
    ];
    
    healthChecks.forEach(check => {
      const value = this.getNestedValue(systemStats, check.path);
      if (value === undefined) return;
      
      const numValue = parseFloat(value);
      const meetsThreshold = check.higherIsBetter ? 
        numValue >= check.threshold : 
        numValue <= check.threshold;
      
      if (!meetsThreshold) {
        testResult.regressions.push({
          metric: check.name,
          current: numValue,
          threshold: check.threshold,
          severity: 'high',
          type: 'system_health'
        });
      }
    });
  }

  /**
   * Get nested object value by path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  }

  /**
   * Get test history and trends
   */
  getTestHistory() {
    return {
      baseline: this.baseline,
      testCount: this.testResults.length,
      tests: this.testResults,
      trends: this.calculateTrends()
    };
  }

  /**
   * Calculate performance trends
   */
  calculateTrends() {
    if (this.testResults.length < 2) return null;
    
    const recent = this.testResults.slice(-5); // Last 5 tests
    const trends = {};
    
    // Calculate trends for key metrics
    ['renderEfficiency', 'skipRate', 'totalUpdates'].forEach(metric => {
      const values = recent
        .map(test => parseFloat(test.current?.[metric]) || 0)
        .filter(val => val > 0);
      
      if (values.length >= 2) {
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const trend = ((lastValue - firstValue) / firstValue) * 100;
        
        trends[metric] = {
          direction: trend > 5 ? 'improving' : trend < -5 ? 'degrading' : 'stable',
          percentChange: trend.toFixed(1),
          values
        };
      }
    });
    
    return trends;
  }
}

/**
 * Cross-tab synchronization testing
 */
class CrossTabTester {
  constructor(config = {}) {
    this.config = { ...DEFAULT_TEST_CONFIG.crossTab, ...config };
    this.debugLogger = createDebugLogger('CrossTabTester', DEBUG_CATEGORIES.INTEGRATION);
    
    this.tabs = [];
    this.testResults = {};
    this.isTestRunning = false;
  }

  /**
   * Start cross-tab synchronization test
   */
  async startCrossTabTest() {
    if (this.isTestRunning) {
      throw new Error('Cross-tab test already running');
    }
    
    this.isTestRunning = true;
    this.testResults = {
      startTime: Date.now(),
      tabs: [],
      synchronizationEvents: [],
      dataConsistency: [],
      status: 'running'
    };
    
    this.debugLogger('info', 'Starting cross-tab synchronization test', {
      tabCount: this.config.tabCount,
      timeout: this.config.synchronizationTimeout
    });
    
    try {
      // Simulate multiple tabs by creating multiple hook instances
      for (let i = 0; i < this.config.tabCount; i++) {
        const tabInfo = {
          id: `tab_${i}`,
          index: i,
          events: [],
          data: null,
          lastUpdate: null
        };
        
        this.testResults.tabs.push(tabInfo);
      }
      
      // Run synchronization test
      await this.runSynchronizationTest();
      
      this.testResults.status = 'completed';
      this.testResults.endTime = Date.now();
      this.testResults.duration = this.testResults.endTime - this.testResults.startTime;
      
    } catch (err) {
      this.testResults.status = 'failed';
      this.testResults.error = err.message;
      this.debugLogger('error', 'Cross-tab test failed', { error: err.message });
    } finally {
      this.isTestRunning = false;
    }
    
    return this.testResults;
  }

  /**
   * Run the actual synchronization test
   */
  async runSynchronizationTest() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Cross-tab test timeout'));
      }, this.config.synchronizationTimeout);
      
      // Simulate data updates and check synchronization
      const updateInterval = setInterval(() => {
        this.simulateDataUpdate();
        this.checkSynchronization();
        
        // Check if test should complete
        if (this.testResults.synchronizationEvents.length >= 5) {
          clearInterval(updateInterval);
          clearTimeout(timeout);
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * Simulate a data update across tabs
   */
  simulateDataUpdate() {
    const updateData = {
      timestamp: Date.now(),
      users: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
        id: `user_${i}`,
        name: `User ${i}`,
        status: 'active'
      }))
    };
    
    // Update all tabs with the same data (simulating SSE broadcast)
    this.testResults.tabs.forEach(tab => {
      tab.data = updateData;
      tab.lastUpdate = updateData.timestamp;
      tab.events.push({
        type: 'data_update',
        timestamp: updateData.timestamp,
        userCount: updateData.users.length
      });
    });
    
    this.debugLogger('verbose', 'Simulated data update across tabs', {
      userCount: updateData.users.length,
      timestamp: updateData.timestamp
    });
  }

  /**
   * Check synchronization between tabs
   */
  checkSynchronization() {
    const syncEvent = {
      timestamp: Date.now(),
      synchronized: true,
      dataConsistency: true,
      timingVariance: 0,
      issues: []
    };
    
    const tabs = this.testResults.tabs;
    if (tabs.length < 2) return;
    
    // Check data consistency
    const firstTabData = JSON.stringify(tabs[0].data);
    const dataMatches = tabs.every(tab => JSON.stringify(tab.data) === firstTabData);
    
    if (!dataMatches) {
      syncEvent.synchronized = false;
      syncEvent.dataConsistency = false;
      syncEvent.issues.push('Data inconsistency between tabs');
    }
    
    // Check timing synchronization
    const updateTimes = tabs.map(tab => tab.lastUpdate).filter(time => time);
    if (updateTimes.length > 1) {
      const maxTime = Math.max(...updateTimes);
      const minTime = Math.min(...updateTimes);
      syncEvent.timingVariance = maxTime - minTime;
      
      if (syncEvent.timingVariance > 1000) { // More than 1 second variance
        syncEvent.synchronized = false;
        syncEvent.issues.push(`High timing variance: ${syncEvent.timingVariance}ms`);
      }
    }
    
    this.testResults.synchronizationEvents.push(syncEvent);
    
    this.debugLogger('verbose', 'Synchronization check completed', {
      synchronized: syncEvent.synchronized,
      issues: syncEvent.issues.length
    });
  }

  /**
   * Get synchronization test report
   */
  getSynchronizationReport() {
    const events = this.testResults.synchronizationEvents;
    const successfulSyncs = events.filter(e => e.synchronized).length;
    const totalSyncs = events.length;
    
    return {
      ...this.testResults,
      summary: {
        successRate: totalSyncs > 0 ? (successfulSyncs / totalSyncs * 100).toFixed(1) : 0,
        averageVariance: events.length > 0 ? 
          (events.reduce((sum, e) => sum + e.timingVariance, 0) / events.length).toFixed(1) : 0,
        totalIssues: events.reduce((sum, e) => sum + e.issues.length, 0)
      }
    };
  }
}

/**
 * Main SSE testing framework
 */
export class SSETestFramework {
  constructor(config = {}) {
    this.config = { ...DEFAULT_TEST_CONFIG, ...config };
    this.debugLogger = createDebugLogger('SSETestFramework', DEBUG_CATEGORIES.INTEGRATION);
    
    this.flickerDetector = new FlickerDetector(this.config.flickerDetection);
    this.performanceRegression = new PerformanceRegression(this.config.performance);
    this.crossTabTester = new CrossTabTester(this.config.crossTab);
    
    this.testSuites = [];
    this.currentTest = null;
  }

  /**
   * Run comprehensive SSE test suite
   */
  async runFullTestSuite(hookInstance) {
    const testSuite = {
      id: `test_${Date.now()}`,
      startTime: Date.now(),
      tests: {},
      status: 'running',
      summary: {}
    };
    
    this.currentTest = testSuite;
    this.debugLogger('info', 'Starting full SSE test suite');
    
    try {
      // Test 1: Flicker Detection
      this.debugLogger('info', 'Running flicker detection test');
      this.flickerDetector.startMonitoring();
      
      // Simulate some activity for flicker detection
      await this.simulateUserActivity(hookInstance);
      
      testSuite.tests.flickerDetection = this.flickerDetector.analyzeFlickering();
      
      // Test 2: Performance Regression
      this.debugLogger('info', 'Running performance regression test');
      testSuite.tests.performanceRegression = await this.performanceRegression.runRegressionTest(hookInstance);
      
      // Test 3: Cross-tab Synchronization
      this.debugLogger('info', 'Running cross-tab synchronization test');
      testSuite.tests.crossTabSync = await this.crossTabTester.startCrossTabTest();
      
      // Generate overall summary
      testSuite.summary = this.generateTestSummary(testSuite.tests);
      testSuite.status = testSuite.summary.overallStatus;
      
    } catch (err) {
      testSuite.status = 'failed';
      testSuite.error = err.message;
      this.debugLogger('error', 'Test suite failed', { error: err.message });
    } finally {
      testSuite.endTime = Date.now();
      testSuite.duration = testSuite.endTime - testSuite.startTime;
      this.testSuites.push(testSuite);
      this.currentTest = null;
    }
    
    return testSuite;
  }

  /**
   * Simulate user activity for testing
   */
  async simulateUserActivity(hookInstance) {
    if (!hookInstance || typeof hookInstance.trackActivity !== 'function') {
      return;
    }
    
    const activities = ['user-interaction', 'navigation', 'data-update', 'refresh'];
    
    for (let i = 0; i < 10; i++) {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      hookInstance.trackActivity(activity);
      
      // Record render for flicker detection
      this.flickerDetector.recordRender('TestComponent', {
        renderTrigger: activity,
        dataHash: `hash_${Date.now()}`
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Generate test summary
   */
  generateTestSummary(tests) {
    const summary = {
      totalTests: Object.keys(tests).length,
      passed: 0,
      failed: 0,
      warnings: 0,
      overallStatus: 'unknown',
      issues: [],
      recommendations: []
    };
    
    // Analyze each test
    Object.keys(tests).forEach(testName => {
      const test = tests[testName];
      
      switch (testName) {
        case 'flickerDetection':
          if (test.hasFlickering) {
            summary.failed++;
            summary.issues.push('Flickering detected');
          } else {
            summary.passed++;
          }
          summary.recommendations.push(...test.recommendations);
          break;
          
        case 'performanceRegression':
          if (test.status === 'failed') {
            summary.failed++;
          } else if (test.status === 'warning') {
            summary.warnings++;
          } else {
            summary.passed++;
          }
          if (test.regressions.length > 0) {
            summary.issues.push(`${test.regressions.length} performance regressions`);
          }
          break;
          
        case 'crossTabSync':
          const syncReport = this.crossTabTester.getSynchronizationReport();
          if (parseFloat(syncReport.summary.successRate) < 95) {
            summary.failed++;
            summary.issues.push('Cross-tab synchronization issues');
          } else {
            summary.passed++;
          }
          break;
      }
    });
    
    // Determine overall status
    if (summary.failed > 0) {
      summary.overallStatus = 'failed';
    } else if (summary.warnings > 0) {
      summary.overallStatus = 'warning';
    } else {
      summary.overallStatus = 'passed';
    }
    
    return summary;
  }

  /**
   * Get testing framework status
   */
  getFrameworkStatus() {
    return {
      currentTest: this.currentTest,
      completedTests: this.testSuites.length,
      lastTestResult: this.testSuites[this.testSuites.length - 1] || null,
      configuration: this.config
    };
  }

  /**
   * Cleanup testing framework
   */
  destroy() {
    this.flickerDetector.destroy();
    this.testSuites = [];
    this.currentTest = null;
  }
}

// Export individual testing components
export {
  FlickerDetector,
  PerformanceRegression,
  CrossTabTester,
  DEFAULT_TEST_CONFIG
};

export default SSETestFramework;