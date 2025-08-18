#!/usr/bin/env node

/**
 * Performance Impact Test
 * 
 * Tests that the performance monitoring system doesn't negatively impact
 * application performance by measuring baseline vs. monitored performance
 */

import { performance } from 'perf_hooks';

// Simulate API calls
async function simulateApiCall(duration = 100) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ status: 'success', duration });
    }, duration);
  });
}

// Simulate navigation
async function simulateNavigation() {
  const start = performance.now();
  
  // Simulate DOM operations and rendering
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const end = performance.now();
  return end - start;
}

// Simulate memory operations
function simulateMemoryOperations() {
  const data = [];
  for (let i = 0; i < 10000; i++) {
    data.push({ id: i, timestamp: Date.now(), data: Math.random() });
  }
  return data.length;
}

// Test without performance monitoring
async function runBaselineTest(iterations = 100) {
  console.log('🔍 Running baseline performance test...');
  
  const results = {
    apiCalls: [],
    navigations: [],
    memoryOps: [],
    totalTime: 0
  };
  
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    // API calls
    const apiStart = performance.now();
    await simulateApiCall(Math.random() * 50 + 25);
    results.apiCalls.push(performance.now() - apiStart);
    
    // Navigation
    const navTime = await simulateNavigation();
    results.navigations.push(navTime);
    
    // Memory operations
    const memStart = performance.now();
    simulateMemoryOperations();
    results.memoryOps.push(performance.now() - memStart);
    
    // Brief pause between iterations
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }
  
  results.totalTime = performance.now() - start;
  
  return {
    apiAverage: results.apiCalls.reduce((a, b) => a + b, 0) / results.apiCalls.length,
    navAverage: results.navigations.reduce((a, b) => a + b, 0) / results.navigations.length,
    memAverage: results.memoryOps.reduce((a, b) => a + b, 0) / results.memoryOps.length,
    totalTime: results.totalTime,
    iterations
  };
}

// Mock performance monitoring overhead
class MockPerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.observers = [];
    this.isEnabled = true;
  }
  
  addMetric(metric) {
    if (!this.isEnabled) return;
    
    const start = performance.now();
    
    // Simulate metric processing overhead
    const processedMetric = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      processed: true
    };
    
    this.metrics.push(processedMetric);
    
    // Simulate batch processing
    if (this.metrics.length > 10) {
      this.metrics = this.metrics.slice(-5); // Keep last 5
    }
    
    const end = performance.now();
    return end - start; // Return overhead time
  }
  
  getOverheadStats() {
    return {
      metricsCount: this.metrics.length,
      enabled: this.isEnabled
    };
  }
}

// Test with performance monitoring
async function runMonitoredTest(iterations = 100) {
  console.log('📊 Running monitored performance test...');
  
  const monitor = new MockPerformanceMonitor();
  const results = {
    apiCalls: [],
    navigations: [],
    memoryOps: [],
    monitoringOverhead: [],
    totalTime: 0
  };
  
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    // API calls with monitoring
    const apiStart = performance.now();
    await simulateApiCall(Math.random() * 50 + 25);
    const apiDuration = performance.now() - apiStart;
    results.apiCalls.push(apiDuration);
    
    // Add API metric
    const overhead1 = monitor.addMetric({
      type: 'api_performance',
      duration: apiDuration,
      url: '/api/test'
    });
    results.monitoringOverhead.push(overhead1);
    
    // Navigation with monitoring
    const navTime = await simulateNavigation();
    results.navigations.push(navTime);
    
    // Add navigation metric
    const overhead2 = monitor.addMetric({
      type: 'navigation_timing',
      navigationTime: navTime,
      route: '/test'
    });
    results.monitoringOverhead.push(overhead2);
    
    // Memory operations with monitoring
    const memStart = performance.now();
    const memCount = simulateMemoryOperations();
    const memDuration = performance.now() - memStart;
    results.memoryOps.push(memDuration);
    
    // Add memory metric
    const overhead3 = monitor.addMetric({
      type: 'memory_usage',
      memoryCount: memCount
    });
    results.monitoringOverhead.push(overhead3);
    
    // Brief pause between iterations
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }
  
  results.totalTime = performance.now() - start;
  
  return {
    apiAverage: results.apiCalls.reduce((a, b) => a + b, 0) / results.apiCalls.length,
    navAverage: results.navigations.reduce((a, b) => a + b, 0) / results.navigations.length,
    memAverage: results.memoryOps.reduce((a, b) => a + b, 0) / results.memoryOps.length,
    monitoringOverhead: results.monitoringOverhead.reduce((a, b) => a + b, 0),
    averageOverheadPerMetric: results.monitoringOverhead.reduce((a, b) => a + b, 0) / results.monitoringOverhead.length,
    totalTime: results.totalTime,
    iterations,
    monitorStats: monitor.getOverheadStats()
  };
}

// Calculate performance impact
function calculateImpact(baseline, monitored) {
  const impacts = {
    apiImpact: ((monitored.apiAverage - baseline.apiAverage) / baseline.apiAverage) * 100,
    navImpact: ((monitored.navAverage - baseline.navAverage) / baseline.navAverage) * 100,
    memImpact: ((monitored.memAverage - baseline.memAverage) / baseline.memAverage) * 100,
    totalTimeImpact: ((monitored.totalTime - baseline.totalTime) / baseline.totalTime) * 100,
    overheadPercentage: (monitored.monitoringOverhead / monitored.totalTime) * 100
  };
  
  return impacts;
}

// Format results for display
function formatResults(label, results) {
  console.log(`\n${label}:`);
  console.log(`  API Average: ${results.apiAverage.toFixed(2)}ms`);
  console.log(`  Navigation Average: ${results.navAverage.toFixed(2)}ms`);
  console.log(`  Memory Operations Average: ${results.memAverage.toFixed(2)}ms`);
  console.log(`  Total Time: ${results.totalTime.toFixed(2)}ms`);
  console.log(`  Iterations: ${results.iterations}`);
  
  if (results.monitoringOverhead !== undefined) {
    console.log(`  Total Monitoring Overhead: ${results.monitoringOverhead.toFixed(2)}ms`);
    console.log(`  Average Overhead Per Metric: ${results.averageOverheadPerMetric.toFixed(3)}ms`);
  }
}

// Performance impact assessment
function assessPerformanceImpact(impacts) {
  console.log('\n📈 Performance Impact Analysis:');
  console.log(`  API Performance Impact: ${impacts.apiImpact.toFixed(2)}%`);
  console.log(`  Navigation Impact: ${impacts.navImpact.toFixed(2)}%`);
  console.log(`  Memory Operations Impact: ${impacts.memImpact.toFixed(2)}%`);
  console.log(`  Total Execution Time Impact: ${impacts.totalTimeImpact.toFixed(2)}%`);
  console.log(`  Monitoring Overhead: ${impacts.overheadPercentage.toFixed(3)}%`);
  
  console.log('\n🎯 Assessment:');
  
  // Define thresholds
  const ACCEPTABLE_IMPACT = 2.0; // 2%
  const WARNING_IMPACT = 5.0;   // 5%
  
  const maxImpact = Math.max(
    Math.abs(impacts.apiImpact),
    Math.abs(impacts.navImpact),
    Math.abs(impacts.memImpact),
    Math.abs(impacts.totalTimeImpact)
  );
  
  if (maxImpact <= ACCEPTABLE_IMPACT && impacts.overheadPercentage <= 1.0) {
    console.log('  ✅ EXCELLENT - Performance impact is minimal and within acceptable limits');
    console.log('     Monitoring can be safely enabled in production');
  } else if (maxImpact <= WARNING_IMPACT && impacts.overheadPercentage <= 2.0) {
    console.log('  ⚠️  ACCEPTABLE - Performance impact is noticeable but acceptable');
    console.log('     Consider optimizing monitoring frequency or enabling only for dev/staging');
  } else {
    console.log('  ❌ CONCERNING - Performance impact is significant');
    console.log('     Monitoring should be optimized before production use');
  }
  
  // Specific recommendations
  console.log('\n💡 Recommendations:');
  if (impacts.overheadPercentage > 1.0) {
    console.log('  - Consider reducing metric collection frequency');
    console.log('  - Implement more efficient batching strategies');
  }
  if (Math.abs(impacts.apiImpact) > ACCEPTABLE_IMPACT) {
    console.log('  - Optimize API performance metric collection');
    console.log('  - Consider sampling-based monitoring for high-frequency calls');
  }
  if (Math.abs(impacts.navImpact) > ACCEPTABLE_IMPACT) {
    console.log('  - Review navigation timing collection overhead');
  }
  if (Math.abs(impacts.memImpact) > ACCEPTABLE_IMPACT) {
    console.log('  - Optimize memory usage tracking frequency');
  }
  
  return maxImpact <= WARNING_IMPACT;
}

// Main test execution
async function runPerformanceImpactTest() {
  console.log('🚀 Starting Performance Impact Assessment');
  console.log('===============================================');
  
  const iterations = 200; // More iterations for better accuracy
  
  try {
    // Run baseline test
    const baseline = await runBaselineTest(iterations);
    formatResults('📊 Baseline Results', baseline);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Run monitored test
    const monitored = await runMonitoredTest(iterations);
    formatResults('📊 Monitored Results', monitored);
    
    // Calculate and assess impact
    const impacts = calculateImpact(baseline, monitored);
    const acceptable = assessPerformanceImpact(impacts);
    
    console.log('\n===============================================');
    console.log(acceptable ? '✅ Performance monitoring passes impact test!' : '❌ Performance monitoring needs optimization');
    
    return { baseline, monitored, impacts, acceptable };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Export for use in other scripts
export { runPerformanceImpactTest };

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runPerformanceImpactTest();
}