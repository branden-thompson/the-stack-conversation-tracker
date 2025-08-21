#!/usr/bin/env node

/**
 * Debug Script: Isolated Optimized SSE Hook Testing
 * 
 * PURPOSE: Test useSSEActiveUsersOptimized in complete isolation
 * GOAL: Validate request coordination works without interference from regular SSE hook
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

console.log('🔬 PHASE 1: Isolated Optimized SSE Hook Debug');
console.log('===========================================\n');

// Test 1: Environment Detection
console.log('📋 Test 1: Environment Detection');
console.log('--------------------------------');

try {
  const { getEnvironmentConfig } = await import('../lib/sse-infrastructure/config/environment-config.js');
  const envConfig = getEnvironmentConfig();
  
  console.log('✅ Environment Configuration:');
  console.log(`   Type: ${envConfig.environment.type}`);
  console.log(`   Docker: ${envConfig.environment.isDocker}`);
  console.log(`   Browser: ${envConfig.environment.isBrowser}`);
  console.log(`   Polling Interval: ${envConfig.polling.sessions}ms`);
  
} catch (err) {
  console.log(`❌ Environment Config Error: ${err.message}`);
}

console.log('');

// Test 2: Request Coordinator Initialization
console.log('🔧 Test 2: Request Coordinator');
console.log('-----------------------------');

try {
  const { getRequestCoordinator, coordinatedFetch } = await import('../lib/sse-infrastructure/utils/request-coordinator.js');
  const coordinator = getRequestCoordinator();
  
  console.log('✅ Request Coordinator: INITIALIZED');
  
  const initialStats = coordinator.getStats();
  console.log(`   Active Requests: ${initialStats.activeRequests}`);
  console.log(`   Cached Responses: ${initialStats.cachedResponses}`);
  console.log(`   Circuit Breakers: ${initialStats.circuitBreakers.length}`);
  
  // Test coordinated fetch in isolation
  console.log('\n🧪 Testing Coordinated Fetch...');
  
  const testEndpoint = '/api/sessions';
  const testParams = { isolated: true, timestamp: Date.now() };
  
  console.log(`   Endpoint: ${testEndpoint}`);
  console.log(`   Params: ${JSON.stringify(testParams)}`);
  
  // Simulate a request (won't actually hit server)
  try {
    await coordinatedFetch(testEndpoint, {}, testParams);
    console.log('   Status: Would coordinate successfully');
  } catch (err) {
    console.log(`   Status: Coordination error - ${err.message}`);
  }
  
} catch (err) {
  console.log(`❌ Request Coordinator Error: ${err.message}`);
}

console.log('');

// Test 3: Hook Deduplication Logic
console.log('🔍 Test 3: Hook Deduplication Analysis');
console.log('-------------------------------------');

console.log('📊 Current Hook Status:');
console.log('   useSSEActiveUsersOptimized: DISABLED (useOptimizedSSE = false)');
console.log('   useSSEActiveUsers: ENABLED (Phase 4 fallback)');
console.log('   useStableActiveUsers: DISABLED (polling fallback)');

console.log('\n🔬 Root Cause Analysis:');
console.log('   Issue: Multiple hooks can run simultaneously');
console.log('   Problem: Each hook calls coordinatedFetch independently');
console.log('   Result: Coordination works per-request, not per-hook');

console.log('\n💡 Required Fix:');
console.log('   1. Global hook registry to prevent concurrent execution');
console.log('   2. Hook lifecycle tracking for debugging');
console.log('   3. Singleton pattern for SSE operations');

console.log('');

// Test 4: Proposed Solution Validation
console.log('🛠️ Test 4: Solution Design Validation');
console.log('-----------------------------------');

console.log('📋 Proposed Hook Registry Pattern:');
console.log(`
class SSEHookRegistry {
  constructor() {
    this.activeHooks = new Map(); // endpoint -> hook instance
    this.hookLifecycle = new Map(); // hook ID -> lifecycle data
  }
  
  registerHook(endpoint, hookId, config) {
    // Prevent multiple hooks for same endpoint
    if (this.activeHooks.has(endpoint)) {
      console.warn('Hook already active for endpoint:', endpoint);
      return false;
    }
    
    this.activeHooks.set(endpoint, { hookId, config, startTime: Date.now() });
    return true;
  }
  
  unregisterHook(endpoint, hookId) {
    const active = this.activeHooks.get(endpoint);
    if (active && active.hookId === hookId) {
      this.activeHooks.delete(endpoint);
      return true;
    }
    return false;
  }
}
`);

console.log('✅ Registry Benefits:');
console.log('   - Prevents duplicate hooks per endpoint');
console.log('   - Provides lifecycle tracking');
console.log('   - Enables debugging and monitoring');
console.log('   - Maintains request coordination integrity');

console.log('');

// Test 5: Implementation Plan
console.log('📋 Test 5: Implementation Plan');
console.log('-----------------------------');

const implementationSteps = [
  {
    step: 1,
    title: 'Create SSE Hook Registry',
    file: 'lib/sse-infrastructure/registry/hook-registry.js',
    status: 'PENDING'
  },
  {
    step: 2, 
    title: 'Integrate Registry with Optimized Hook',
    file: 'lib/hooks/useSSEActiveUsersOptimized.js',
    status: 'PENDING'
  },
  {
    step: 3,
    title: 'Add Registry to Regular SSE Hook',
    file: 'lib/hooks/useSSEActiveUsers.js', 
    status: 'PENDING'
  },
  {
    step: 4,
    title: 'Update Component Hook Selection',
    file: 'components/ui/active-users-display.jsx',
    status: 'PENDING'
  },
  {
    step: 5,
    title: 'Integration Testing',
    file: 'dev-scripts/debug/test-hook-coordination.js',
    status: 'PENDING'
  }
];

implementationSteps.forEach(({ step, title, file, status }) => {
  console.log(`   ${step}. ${title}`);
  console.log(`      File: ${file}`);
  console.log(`      Status: ${status}`);
  console.log('');
});

console.log('🎯 SUCCESS CRITERIA:');
console.log('   - Only one SSE hook active per endpoint at any time');
console.log('   - Request coordination working properly');
console.log('   - No API runaway when optimized hook enabled');
console.log('   - Cross-tab synchronization maintained');
console.log('   - Performance monitoring functional');

console.log('');
console.log('🔄 NEXT ACTION: Implement Hook Registry');
console.log('   Command: GOFLIGHT to proceed with Step 1 implementation');

export default {
  validateEnvironment: () => getEnvironmentConfig(),
  validateCoordinator: () => getRequestCoordinator(),
  implementationSteps
};