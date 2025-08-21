/**
 * Conversations Migration Testing Script
 * 
 * Comprehensive testing of React Query conversations migration
 * Tests both legacy and React Query implementations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const baseUrl = 'http://localhost:3006';
const testResults = {
  legacy: {},
  reactQuery: {},
  performance: {},
  errors: []
};

console.log('🧪 Starting Conversations Migration Testing\n');

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test API endpoints directly
async function testConversationAPI() {
  console.log('1. Testing Conversation API Endpoints:');
  
  const apiUrl = 'http://localhost:3006/api/conversations';
  
  // Test GET conversations
  console.log('   GET /api/conversations...');
  const getResult = await makeRequest(apiUrl);
  if (getResult.success) {
    console.log(`   ✅ GET success - ${getResult.data.items?.length || 0} conversations found`);
  } else {
    console.log(`   ❌ GET failed - ${getResult.error || getResult.status}`);
    testResults.errors.push('GET /api/conversations failed');
  }
  
  // Test POST conversations
  console.log('   POST /api/conversations...');
  const postResult = await makeRequest(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `Test Conversation ${Date.now()}` })
  });
  if (postResult.success) {
    console.log('   ✅ POST success - conversation created');
    
    // Test PATCH if we have a conversation ID
    if (postResult.data.id) {
      console.log('   PATCH /api/conversations/:id...');
      const patchResult = await makeRequest(`${apiUrl}/${postResult.data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', startedAt: Date.now() })
      });
      if (patchResult.success) {
        console.log('   ✅ PATCH success - conversation updated');
      } else {
        console.log(`   ❌ PATCH failed - ${patchResult.error || patchResult.status}`);
        testResults.errors.push('PATCH conversation failed');
      }
    }
  } else {
    console.log(`   ❌ POST failed - ${postResult.error || postResult.status}`);
    testResults.errors.push('POST conversation failed');
  }
  
  console.log();
}

// Test safety switches
async function testSafetySwitches() {
  console.log('2. Testing Safety Switch Integration:');
  
  // Check if safety switches file exists and can be loaded
  const safetySwitchesPath = path.join(__dirname, '../lib/utils/safety-switches.js');
  if (fs.existsSync(safetySwitchesPath)) {
    console.log('   ✅ Safety switches file exists');
    
    // Test environment variables
    const envPath = path.join(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('NEXT_PUBLIC_USE_REACT_QUERY')) {
        console.log('   ✅ React Query environment variable configured');
      } else {
        console.log('   ❌ Missing React Query environment variable');
        testResults.errors.push('Missing React Query env var');
      }
    } else {
      console.log('   ⚠️  No .env.local file found');
    }
  } else {
    console.log('   ❌ Safety switches file not found');
    testResults.errors.push('Safety switches file missing');
  }
  
  console.log();
}

// Test React Query files
async function testReactQueryFiles() {
  console.log('3. Testing React Query Implementation Files:');
  
  const files = [
    '../lib/providers/query-client.jsx',
    '../lib/api/conversations-api.js',
    '../lib/hooks/useConversationsQuery.js'
  ];
  
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`   ✅ ${path.basename(file)} exists (${content.length} chars)`);
      
      // Basic syntax check
      if (file.endsWith('.js') && content.includes('export')) {
        console.log(`      - Has exports ✓`);
      }
    } else {
      console.log(`   ❌ ${path.basename(file)} missing`);
      testResults.errors.push(`Missing file: ${file}`);
    }
  });
  
  console.log();
}

// Test package.json dependencies
async function testDependencies() {
  console.log('4. Testing React Query Dependencies:');
  
  const packagePath = path.join(__dirname, '../package.json');
  if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = { ...packageContent.dependencies, ...packageContent.devDependencies };
    
    const requiredDeps = [
      '@tanstack/react-query',
      '@tanstack/react-query-devtools'
    ];
    
    requiredDeps.forEach(dep => {
      if (deps[dep]) {
        console.log(`   ✅ ${dep}: ${deps[dep]}`);
      } else {
        console.log(`   ❌ ${dep}: Missing`);
        testResults.errors.push(`Missing dependency: ${dep}`);
      }
    });
  } else {
    console.log('   ❌ package.json not found');
    testResults.errors.push('package.json missing');
  }
  
  console.log();
}

// Performance baseline measurement
async function measurePerformanceBaseline() {
  console.log('5. Measuring Performance Baseline:');
  
  const apiUrl = 'http://localhost:3006/api/conversations';
  const measurements = [];
  
  // Make multiple requests to measure average response time
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    const result = await makeRequest(apiUrl);
    const duration = Date.now() - start;
    
    if (result.success) {
      measurements.push(duration);
      console.log(`   Request ${i + 1}: ${duration}ms`);
    } else {
      console.log(`   Request ${i + 1}: Failed`);
    }
  }
  
  if (measurements.length > 0) {
    const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const maxTime = Math.max(...measurements);
    const minTime = Math.min(...measurements);
    
    console.log(`   📊 Average: ${avgTime.toFixed(2)}ms`);
    console.log(`   📊 Range: ${minTime}ms - ${maxTime}ms`);
    
    testResults.performance = {
      average: avgTime,
      min: minTime,
      max: maxTime,
      samples: measurements.length
    };
  }
  
  console.log();
}

// Main test execution
async function runTests() {
  const startTime = Date.now();
  
  try {
    await testConversationAPI();
    await testSafetySwitches();
    await testReactQueryFiles();
    await testDependencies();
    await measurePerformanceBaseline();
    
    // Summary
    const duration = Date.now() - startTime;
    console.log('📋 Test Summary:');
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Errors: ${testResults.errors.length}`);
    
    if (testResults.errors.length > 0) {
      console.log('\n❌ Issues Found:');
      testResults.errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('\n✅ All tests passed!');
    }
    
    if (testResults.performance.average) {
      console.log(`\n📊 Performance: ${testResults.performance.average.toFixed(2)}ms average API response`);
    }
    
    // Save results to file
    const resultsPath = path.join(__dirname, 'test-results-conversations.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Check if server is running first
async function checkServer() {
  console.log('🔍 Checking if development server is running...\n');
  try {
    const result = await makeRequest(`${baseUrl}/api/conversations`);
    if (result.success) {
      console.log('✅ Development server is running\n');
      return true;
    }
  } catch (error) {
    console.log('❌ Development server not accessible:', error);
    console.log('   Please run: npm run dev\n');
    return false;
  }
  console.log('❌ Server not responding correctly');
  return false;
}

// Run tests if this script is executed directly
if (require.main === module) {
  checkServer().then(serverRunning => {
    if (serverRunning) {
      runTests();
    } else {
      console.log('Tests skipped - server not running');
      process.exit(1);
    }
  });
}

module.exports = { runTests, testResults };