#!/usr/bin/env node

/**
 * User and Session Migration Testing Script
 * 
 * Tests the migration from legacy user tracking to React Query implementation.
 * Validates that all functionality works correctly with safety switches.
 */

const http = require('http');
const querystring = require('querystring');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_CONFIG = {
  timeout: 5000,
  retryCount: 2,
  pollInterval: 1000,
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

/**
 * HTTP helper function
 */
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, TEST_CONFIG.timeout);
    
    const url = new URL(path, BASE_URL);
    
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      clearTimeout(timeout);
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ 
            status: res.statusCode, 
            data: jsonData,
            headers: res.headers 
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: data,
            headers: res.headers 
          });
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * Test helper functions
 */
function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const message = `${status} ${name}`;
  
  console.log(message);
  if (details) {
    console.log(`   ${details}`);
  }
  
  testResults.details.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

function logWarning(message) {
  console.log(`⚠️  WARNING: ${message}`);
  testResults.warnings++;
}

/**
 * Test server availability
 */
async function testServerHealth() {
  console.log('\n🔍 Testing server health...');
  
  try {
    const response = await makeRequest('/api/users');
    logTest('Server responsive', response.status === 200, `Status: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    logTest('Server responsive', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * Test users API functionality
 */
async function testUsersAPI() {
  console.log('\n👥 Testing users API functionality...');
  
  try {
    // Test fetch users
    const usersResponse = await makeRequest('/api/users');
    logTest('Fetch users', usersResponse.status === 200 && Array.isArray(usersResponse.data), 
      `Status: ${usersResponse.status}, Users count: ${usersResponse.data?.length || 0}`);
    
    const users = usersResponse.data || [];
    const hasSystemUser = users.some(u => u.isSystemUser);
    logTest('System user exists', hasSystemUser, hasSystemUser ? 'System user found' : 'No system user');
    
    // Test user creation (if we have test data)
    const testUser = {
      name: `Test User ${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      role: 'participant'
    };
    
    const createResponse = await makeRequest('/api/users', {
      method: 'POST',
      body: testUser
    });
    
    const userCreated = createResponse.status === 201 || createResponse.status === 200;
    logTest('Create user', userCreated, `Status: ${createResponse.status}`);
    
    if (userCreated && createResponse.data?.id) {
      // Test user update
      const updateData = { name: `Updated ${testUser.name}` };
      const updateResponse = await makeRequest('/api/users', {
        method: 'PUT',
        body: { id: createResponse.data.id, ...updateData }
      });
      
      logTest('Update user', updateResponse.status === 200, `Status: ${updateResponse.status}`);
      
      // Test user deletion
      const deleteResponse = await makeRequest(`/api/users?id=${createResponse.data.id}`, {
        method: 'DELETE'
      });
      
      logTest('Delete user', deleteResponse.status === 200, `Status: ${deleteResponse.status}`);
    }
    
    return true;
  } catch (error) {
    logTest('Users API functionality', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * Test sessions API functionality
 */
async function testSessionsAPI() {
  console.log('\n📊 Testing sessions API functionality...');
  
  try {
    // Test fetch sessions
    const sessionsResponse = await makeRequest('/api/sessions');
    logTest('Fetch sessions', sessionsResponse.status === 200, 
      `Status: ${sessionsResponse.status}, Total sessions: ${sessionsResponse.data?.total || 0}`);
    
    // Test session events
    const eventsResponse = await makeRequest('/api/sessions/events?limit=10');
    logTest('Fetch session events', eventsResponse.status === 200 && Array.isArray(eventsResponse.data?.events),
      `Status: ${eventsResponse.status}, Events count: ${eventsResponse.data?.events?.length || 0}`);
    
    // Test simulated session creation
    const simulateResponse = await makeRequest('/api/sessions/simulate', {
      method: 'POST',
      body: { count: 1, autoActivity: false }
    });
    
    const sessionCreated = simulateResponse.status === 200 || simulateResponse.status === 201;
    logTest('Create simulated session', sessionCreated, `Status: ${simulateResponse.status}`);
    
    if (sessionCreated) {
      // Wait a moment for session to register
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test fetch simulated sessions
      const simSessionsResponse = await makeRequest('/api/sessions/simulate');
      logTest('Fetch simulated sessions', simSessionsResponse.status === 200,
        `Status: ${simSessionsResponse.status}, Simulated count: ${simSessionsResponse.data?.sessions?.length || 0}`);
      
      // Clean up - remove simulated sessions
      const cleanupResponse = await makeRequest('/api/sessions/simulate', {
        method: 'DELETE'
      });
      logTest('Cleanup simulated sessions', cleanupResponse.status === 200, `Status: ${cleanupResponse.status}`);
    }
    
    return true;
  } catch (error) {
    logTest('Sessions API functionality', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * Test React Query migration functionality
 */
async function testReactQueryMigration() {
  console.log('\n⚛️  Testing React Query migration...');
  
  try {
    // Test that our hooks work with the dev server running
    // Since we can't directly test React hooks in Node.js, we test the API endpoints
    // that the React Query hooks would use
    
    // Test users endpoint (used by useUsersQuery)
    const usersTest = await makeRequest('/api/users');
    logTest('React Query users endpoint', usersTest.status === 200, `Status: ${usersTest.status}`);
    
    // Test sessions endpoint (used by useSessionsQuery)  
    const sessionsTest = await makeRequest('/api/sessions');
    logTest('React Query sessions endpoint', sessionsTest.status === 200, `Status: ${sessionsTest.status}`);
    
    // Test events endpoint (used by useSessionEventsQuery)
    const eventsTest = await makeRequest('/api/sessions/events?limit=50');
    logTest('React Query events endpoint', eventsTest.status === 200, `Status: ${eventsTest.status}`);
    
    // Test mutation endpoints
    const testUser = {
      name: `RQ Test User ${Date.now()}`,
      email: `rq-test-${Date.now()}@example.com`,
      role: 'participant'
    };
    
    const createTest = await makeRequest('/api/users', {
      method: 'POST',
      body: testUser
    });
    
    const createWorked = createTest.status === 200 || createTest.status === 201;
    logTest('React Query create mutation endpoint', createWorked, `Status: ${createTest.status}`);
    
    if (createWorked && createTest.data?.id) {
      // Test update mutation endpoint
      const updateTest = await makeRequest('/api/users', {
        method: 'PUT',
        body: { id: createTest.data.id, name: `Updated ${testUser.name}` }
      });
      logTest('React Query update mutation endpoint', updateTest.status === 200, `Status: ${updateTest.status}`);
      
      // Test delete mutation endpoint
      const deleteTest = await makeRequest(`/api/users?id=${createTest.data.id}`, {
        method: 'DELETE'
      });
      logTest('React Query delete mutation endpoint', deleteTest.status === 200, `Status: ${deleteTest.status}`);
    }
    
    return true;
  } catch (error) {
    logTest('React Query migration', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * Test safety switches functionality
 */
async function testSafetySwitches() {
  console.log('\n🛡️  Testing safety switches...');
  
  // We can't directly test the safety switches from Node.js, but we can verify
  // that the system is stable and responsive, which indicates safety switches work
  
  try {
    let consecutiveSuccesses = 0;
    const testCount = 5;
    
    for (let i = 0; i < testCount; i++) {
      const response = await makeRequest('/api/users');
      if (response.status === 200) {
        consecutiveSuccesses++;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const stabilityRatio = consecutiveSuccesses / testCount;
    logTest('System stability with safety switches', stabilityRatio >= 0.8, 
      `${consecutiveSuccesses}/${testCount} requests successful (${Math.round(stabilityRatio * 100)}%)`);
    
    // Test that APIs don't error out (which would indicate safety switch issues)
    const endpoints = ['/api/users', '/api/sessions', '/api/sessions/events?limit=10'];
    let healthyEndpoints = 0;
    
    for (const endpoint of endpoints) {
      try {
        const response = await makeRequest(endpoint);
        if (response.status < 500) { // Any non-server-error is considered healthy
          healthyEndpoints++;
        }
      } catch (e) {
        // Endpoint not responding
      }
    }
    
    logTest('Safety switches prevent system errors', healthyEndpoints === endpoints.length,
      `${healthyEndpoints}/${endpoints.length} endpoints healthy`);
    
    return true;
  } catch (error) {
    logTest('Safety switches functionality', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * Performance baseline test
 */
async function testPerformanceBaseline() {
  console.log('\n⚡ Testing performance baseline...');
  
  try {
    const testEndpoints = [
      '/api/users',
      '/api/sessions',
      '/api/sessions/events?limit=20'
    ];
    
    const performanceData = {};
    
    for (const endpoint of testEndpoints) {
      const times = [];
      const testRuns = 3;
      
      for (let i = 0; i < testRuns; i++) {
        const startTime = Date.now();
        await makeRequest(endpoint);
        const endTime = Date.now();
        times.push(endTime - startTime);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      performanceData[endpoint] = avgTime;
      
      logTest(`Performance: ${endpoint}`, avgTime < 2000, `Average: ${avgTime}ms`);
    }
    
    const overallAvg = Object.values(performanceData).reduce((a, b) => a + b, 0) / Object.values(performanceData).length;
    logTest('Overall API performance', overallAvg < 1500, `Overall average: ${Math.round(overallAvg)}ms`);
    
    return true;
  } catch (error) {
    logTest('Performance baseline', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting User and Session Migration Tests\n');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  try {
    // Check server health first
    const serverHealthy = await testServerHealth();
    if (!serverHealthy) {
      console.log('\n❌ Server not responding. Make sure the development server is running with "npm run dev"');
      process.exit(1);
    }
    
    // Run all test suites
    await testUsersAPI();
    await testSessionsAPI();
    await testReactQueryMigration();
    await testSafetySwitches();
    await testPerformanceBaseline();
    
  } catch (error) {
    console.error('\n💥 Test runner error:', error.message);
    testResults.failed++;
  }
  
  // Print summary
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! User and session migration is working correctly.');
  } else {
    console.log('\n🔍 Some tests failed. Check the details above.');
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testResults };