/**
 * React Query vs Legacy Performance Comparison Test
 * 
 * Tests performance differences between React Query and Legacy implementations
 * Measures request deduplication and cache efficiency
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('⚡ React Query vs Legacy Performance Test\n');

// Test configuration
const baseUrl = 'http://localhost:3006';
const testIterations = 10;

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data, response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Measure API call frequency by monitoring server logs
async function measureAPICallFrequency() {
  console.log('1. Testing API Call Deduplication:');
  
  const apiUrl = `${baseUrl}/api/conversations`;
  
  // Simulate multiple simultaneous requests (like multiple components)
  console.log('   Simulating multiple simultaneous API calls...');
  
  const startTime = Date.now();
  const promises = [];
  
  // Create 5 simultaneous requests
  for (let i = 0; i < 5; i++) {
    promises.push(makeRequest(apiUrl));
  }
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  
  const successCount = results.filter(r => r.success).length;
  const totalTime = endTime - startTime;
  
  console.log(`   📊 ${successCount}/5 requests successful`);
  console.log(`   📊 Total time: ${totalTime}ms`);
  console.log(`   📊 Average per request: ${(totalTime / successCount).toFixed(2)}ms`);
  
  // Check if requests were processed efficiently
  if (totalTime < (successCount * 20)) { // Less than 20ms per request suggests caching/deduplication
    console.log('   ✅ Good performance - likely using caching/deduplication');
  } else {
    console.log('   ⚠️  Higher latency - may indicate individual processing');
  }
  
  console.log();
  return { successCount, totalTime, averageTime: totalTime / successCount };
}

// Test cache behavior
async function testCacheBehavior() {
  console.log('2. Testing Cache Behavior:');
  
  const apiUrl = `${baseUrl}/api/conversations`;
  
  // First request (should hit server)
  console.log('   First request (cache miss expected)...');
  const start1 = Date.now();
  const result1 = await makeRequest(apiUrl);
  const time1 = Date.now() - start1;
  
  if (result1.success) {
    console.log(`   📊 First request: ${time1}ms`);
  }
  
  // Immediate second request (should hit cache if React Query enabled)
  console.log('   Second request (cache hit expected)...');
  const start2 = Date.now();
  const result2 = await makeRequest(apiUrl);
  const time2 = Date.now() - start2;
  
  if (result2.success) {
    console.log(`   📊 Second request: ${time2}ms`);
    
    const improvement = ((time1 - time2) / time1) * 100;
    if (improvement > 20) {
      console.log(`   ✅ Cache working - ${improvement.toFixed(1)}% faster`);
    } else {
      console.log(`   ⚠️  Similar times - cache may not be active`);
    }
  }
  
  console.log();
  return { firstRequest: time1, secondRequest: time2, improvement: time1 > time2 };
}

// Test with different safety switch configurations
async function testSafetySwitchConfigurations() {
  console.log('3. Testing Safety Switch Configurations:');
  
  // Read current environment settings
  const envPath = path.join(__dirname, '../.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('   Current React Query setting:', envContent.includes('NEXT_PUBLIC_USE_REACT_QUERY=true') ? 'ENABLED' : 'DISABLED');
  }
  
  console.log('   ℹ️  Note: Testing with current configuration only');
  console.log('   💡 To test both modes, toggle NEXT_PUBLIC_USE_REACT_QUERY in .env.local');
  
  console.log();
}

// Test React Query DevTools availability
async function testDevToolsIntegration() {
  console.log('4. Testing React Query DevTools Integration:');
  
  // Check if main page includes DevTools scripts
  const mainPageUrl = baseUrl;
  const result = await makeRequest(mainPageUrl);
  
  if (result.success && result.response) {
    const html = await result.response.text();
    
    if (html.includes('react-query-devtools') || html.includes('tanstack')) {
      console.log('   ✅ DevTools integration detected in page');
    } else {
      console.log('   ⚠️  DevTools integration not detected (may be conditional)');
    }
    
    // Check if React Query chunks are being loaded
    if (html.includes('@tanstack') || html.includes('query-client')) {
      console.log('   ✅ React Query chunks detected');
    } else {
      console.log('   ⚠️  React Query chunks not detected');
    }
  }
  
  console.log();
}

// Test error handling and recovery
async function testErrorHandling() {
  console.log('5. Testing Error Handling:');
  
  // Test invalid endpoint
  console.log('   Testing invalid endpoint...');
  const result = await makeRequest(`${baseUrl}/api/nonexistent`);
  
  if (!result.success) {
    console.log('   ✅ Properly handles 404 errors');
  } else {
    console.log('   ⚠️  Unexpected success on invalid endpoint');
  }
  
  console.log();
}

// Main test execution
async function runPerformanceComparison() {
  const startTime = Date.now();
  
  try {
    const apiFreqResults = await measureAPICallFrequency();
    const cacheResults = await testCacheBehavior();
    await testSafetySwitchConfigurations();
    await testDevToolsIntegration();
    await testErrorHandling();
    
    // Summary
    const totalDuration = Date.now() - startTime;
    console.log('📋 Performance Comparison Summary:');
    console.log(`   Total test duration: ${totalDuration}ms`);
    console.log(`   API call efficiency: ${apiFreqResults.averageTime.toFixed(2)}ms avg`);
    console.log(`   Cache behavior: ${cacheResults.improvement ? 'Working' : 'Limited'}`);
    
    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      apiCallEfficiency: apiFreqResults,
      cacheBehavior: cacheResults,
      totalDuration
    };
    
    const resultsPath = path.join(__dirname, 'performance-comparison-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (apiFreqResults.averageTime < 50) {
      console.log('   ✅ API response times are excellent');
    } else {
      console.log('   ⚠️  Consider optimizing API response times');
    }
    
    if (cacheResults.improvement) {
      console.log('   ✅ Caching appears to be working effectively');
    } else {
      console.log('   💡 Consider verifying React Query cache configuration');
    }
    
  } catch (error) {
    console.error('❌ Performance comparison failed:', error);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const result = await makeRequest(`${baseUrl}/api/conversations`);
    return result.success;
  } catch (error) {
    return false;
  }
}

// Run if executed directly
if (require.main === module) {
  checkServer().then(serverRunning => {
    if (serverRunning) {
      runPerformanceComparison();
    } else {
      console.log('❌ Development server not running. Please start with: npm run dev');
      process.exit(1);
    }
  });
}

module.exports = { runPerformanceComparison };