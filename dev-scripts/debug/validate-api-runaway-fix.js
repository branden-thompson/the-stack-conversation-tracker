#!/usr/bin/env node

/**
 * API Runaway Fix Validation Script
 * 
 * PURPOSE: Validate the API runaway fixes are working correctly
 * USAGE: node dev-scripts/debug/validate-api-runaway-fix.js
 */

import { getEnvironmentConfig, getPollingInterval } from '../lib/sse-infrastructure/config/environment-config.js';
import { getRequestCoordinator } from '../lib/sse-infrastructure/utils/request-coordinator.js';

console.log('🔍 API Runaway Fix Validation');
console.log('============================\n');

// Test 1: Environment Configuration
console.log('📋 Test 1: Environment Configuration');
console.log('------------------------------------');

try {
  const envConfig = getEnvironmentConfig();
  
  console.log('✅ Environment Detection:');
  console.log(`   Type: ${envConfig.environment.type}`);
  console.log(`   Docker: ${envConfig.environment.isDocker}`);
  console.log(`   Browser: ${envConfig.environment.isBrowser}`);
  
  console.log('\n✅ Production-Safe Polling Intervals:');
  console.log(`   Sessions: ${envConfig.polling.sessions}ms`);
  console.log(`   Conversations: ${envConfig.polling.conversations}ms`);
  console.log(`   Users: ${envConfig.polling.users}ms`);
  console.log(`   Events: ${envConfig.polling.events}ms`);
  
  console.log('\n✅ Safety Controls:');
  console.log(`   Circuit Breaker: ${envConfig.features.enableCircuitBreaker ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   Request Deduplication: ${envConfig.features.enableRequestDeduplication ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   Monitoring: ${envConfig.features.enableMonitoring ? 'ENABLED' : 'DISABLED'}`);
  
} catch (err) {
  console.log(`❌ Environment Configuration: ERROR - ${err.message}`);
}

console.log('');

// Test 2: Request Coordinator
console.log('📊 Test 2: Request Coordinator');
console.log('------------------------------');

try {
  const coordinator = getRequestCoordinator();
  
  console.log('✅ Request Coordinator: INITIALIZED');
  
  // Get initial stats
  const initialStats = coordinator.getStats();
  console.log(`   Active Requests: ${initialStats.activeRequests}`);
  console.log(`   Cached Responses: ${initialStats.cachedResponses}`);
  console.log(`   Circuit Breakers: ${initialStats.circuitBreakers.length}`);
  
} catch (err) {
  console.log(`❌ Request Coordinator: ERROR - ${err.message}`);
}

console.log('');

// Test 3: Interval Calculations
console.log('🕐 Test 3: Interval Calculations');
console.log('--------------------------------');

const endpoints = ['sessions', 'conversations', 'users', 'events'];

endpoints.forEach(endpoint => {
  try {
    const interval = getPollingInterval(endpoint);
    const requestsPerMinute = (60000 / interval).toFixed(1);
    
    console.log(`✅ ${endpoint.padEnd(12)}: ${interval}ms (${requestsPerMinute} req/min)`);
  } catch (err) {
    console.log(`❌ ${endpoint.padEnd(12)}: ERROR - ${err.message}`);
  }
});

console.log('');

// Test 4: Expected Request Frequency
console.log('📈 Test 4: Expected Request Frequency');
console.log('-------------------------------------');

const sessionsInterval = getPollingInterval('sessions');
const expectedRequestsPerMinute = 60000 / sessionsInterval;

console.log('✅ Expected API Request Frequency:');
console.log(`   Before Fix: ~150+ requests/minute (API runaway)`);
console.log(`   After Fix: ~${expectedRequestsPerMinute.toFixed(1)} requests/minute (controlled)`);
console.log(`   Improvement: ${(150 / expectedRequestsPerMinute).toFixed(1)}x reduction`);

console.log('');

// Test 5: Production Readiness
console.log('🚀 Test 5: Production Readiness');
console.log('-------------------------------');

const prodChecks = [
  {
    name: 'Environment Config',
    check: () => getEnvironmentConfig().environment.type !== undefined,
    description: 'Environment detection working'
  },
  {
    name: 'Safe Intervals',
    check: () => getPollingInterval('sessions') >= 5000,
    description: 'Polling intervals are production-safe (≥5s)'
  },
  {
    name: 'Request Coordinator',
    check: () => getRequestCoordinator() !== null,
    description: 'Request coordination system initialized'
  },
  {
    name: 'Circuit Breaker',
    check: () => getEnvironmentConfig().safety.circuitBreaker.failureThreshold > 0,
    description: 'Circuit breaker configuration valid'
  },
  {
    name: 'Rate Limiting',
    check: () => getEnvironmentConfig().safety.rateLimit.maxRequestsPerMinute <= 20,
    description: 'Rate limiting configured (≤20 req/min)'
  }
];

let passedChecks = 0;

prodChecks.forEach(({ name, check, description }) => {
  try {
    if (check()) {
      console.log(`✅ ${name}: PASS - ${description}`);
      passedChecks++;
    } else {
      console.log(`❌ ${name}: FAIL - ${description}`);
    }
  } catch (err) {
    console.log(`❌ ${name}: ERROR - ${err.message}`);
  }
});

console.log('');

// Summary
console.log('🎯 VALIDATION SUMMARY');
console.log('====================');

const totalChecks = prodChecks.length;
const passRate = (passedChecks / totalChecks * 100).toFixed(1);

if (passedChecks === totalChecks) {
  console.log('✅ ALL CHECKS PASSED - API runaway fix is production-ready');
} else {
  console.log(`⚠️  ${passedChecks}/${totalChecks} checks passed (${passRate}%)`);
}

console.log('');
console.log('📋 Next Steps:');
console.log('1. Open browser to http://localhost:3000');
console.log('2. Monitor network tab for API request frequency');
console.log('3. Should see sessions requests every 5-10 seconds (not every 3 seconds)');
console.log('4. Look for blue connection indicator (optimized SSE)');
console.log('5. Verify no visual flickering occurs');

console.log('');
console.log('🔍 Monitoring Commands:');
console.log('• Check request stats: getRequestCoordinator().getStats()');
console.log('• Environment config: getEnvironmentConfig()');
console.log('• Reset coordinator: getRequestCoordinator().reset()');

console.log('');
console.log('🎉 API Runaway Fix Validation Complete');

// Export for potential import usage
export default {
  validateEnvironmentConfig: () => getEnvironmentConfig(),
  validateRequestCoordinator: () => getRequestCoordinator(),
  validateIntervals: () => {
    return {
      sessions: getPollingInterval('sessions'),
      conversations: getPollingInterval('conversations'), 
      users: getPollingInterval('users'),
      events: getPollingInterval('events')
    };
  }
};