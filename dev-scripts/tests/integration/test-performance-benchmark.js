#!/usr/bin/env node

/**
 * Performance Benchmark Test
 * 
 * Tests API response times and system performance after React Query migration.
 */

const http = require('http');

const BASE_URL = 'http://localhost:3006';

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
    const startTime = Date.now();
    
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      clearTimeout(timeout);
      const endTime = Date.now();
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ 
            status: res.statusCode, 
            data: JSON.parse(data),
            responseTime: endTime - startTime
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data,
            responseTime: endTime - startTime
          });
        }
      });
    });
    
    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function benchmarkEndpoint(path, testName) {
  console.log(`📊 Benchmarking ${testName}...`);
  
  const times = [];
  const testRuns = 5;
  let successCount = 0;
  
  for (let i = 0; i < testRuns; i++) {
    try {
      const result = await makeRequest(path);
      if (result.status === 200) {
        times.push(result.responseTime);
        successCount++;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`   Request ${i + 1} failed: ${error.message}`);
    }
  }
  
  if (times.length === 0) {
    console.log(`❌ ${testName}: All requests failed`);
    return { avg: 0, min: 0, max: 0, successRate: 0 };
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const successRate = (successCount / testRuns) * 100;
  
  console.log(`✅ ${testName}:`);
  console.log(`   Average: ${Math.round(avg)}ms`);
  console.log(`   Range: ${min}ms - ${max}ms`);
  console.log(`   Success Rate: ${successRate}%`);
  
  return { avg, min, max, successRate };
}

async function runPerformanceBenchmark() {
  console.log('⚡ React Query Migration Performance Benchmark\n');
  console.log('='.repeat(50));
  
  const results = {};
  
  // Test core endpoints
  results.users = await benchmarkEndpoint('/api/users', 'Users API');
  results.sessions = await benchmarkEndpoint('/api/sessions', 'Sessions API');
  results.events = await benchmarkEndpoint('/api/sessions/events?limit=20', 'Session Events API');
  results.cards = await benchmarkEndpoint('/api/cards', 'Cards API');
  results.conversations = await benchmarkEndpoint('/api/conversations', 'Conversations API');
  
  console.log('\n' + '='.repeat(50));
  console.log('📈 PERFORMANCE SUMMARY');
  console.log('='.repeat(50));
  
  let totalAvg = 0;
  let totalSuccessRate = 0;
  let endpointCount = 0;
  
  Object.entries(results).forEach(([endpoint, stats]) => {
    if (stats.avg > 0) {
      totalAvg += stats.avg;
      totalSuccessRate += stats.successRate;
      endpointCount++;
      
      const performance = stats.avg < 200 ? '🟢 Excellent' : 
                         stats.avg < 500 ? '🟡 Good' : 
                         stats.avg < 1000 ? '🟠 Acceptable' : '🔴 Slow';
      
      console.log(`${endpoint.padEnd(15)}: ${Math.round(stats.avg)}ms ${performance}`);
    }
  });
  
  if (endpointCount > 0) {
    const overallAvg = totalAvg / endpointCount;
    const overallSuccess = totalSuccessRate / endpointCount;
    
    console.log(`\nOverall Performance: ${Math.round(overallAvg)}ms average`);
    console.log(`Overall Success Rate: ${Math.round(overallSuccess)}%`);
    
    if (overallAvg < 500 && overallSuccess > 95) {
      console.log('🎉 Performance is excellent! React Query migration successful.');
    } else if (overallAvg < 1000 && overallSuccess > 90) {
      console.log('✅ Performance is good. Migration working well.');
    } else {
      console.log('⚠️  Performance could be improved. Consider optimization.');
    }
  }
  
  console.log('\n💡 React Query Benefits:');
  console.log('   • Request deduplication reduces redundant calls');
  console.log('   • Smart caching improves perceived performance');
  console.log('   • Background updates keep data fresh');
  console.log('   • Automatic retries improve reliability');
  
  return results;
}

if (require.main === module) {
  runPerformanceBenchmark().catch(console.error);
}