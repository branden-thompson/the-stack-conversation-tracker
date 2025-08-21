#!/usr/bin/env node

/**
 * Simplified User and Session Migration Test
 */

const http = require('http');

const BASE_URL = 'http://localhost:3006';

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
    
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      clearTimeout(timeout);
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function runTests() {
  console.log('🚀 Running simplified user/session migration tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  try {
    console.log('Testing /api/users...');
    const usersResponse = await makeRequest('/api/users');
    if (usersResponse.status === 200 && Array.isArray(usersResponse.data)) {
      console.log('✅ Users API working');
      passed++;
    } else {
      console.log('❌ Users API failed');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Users API error: ${error.message}`);
    failed++;
  }
  
  try {
    console.log('Testing /api/sessions...');
    const sessionsResponse = await makeRequest('/api/sessions');
    if (sessionsResponse.status === 200) {
      console.log('✅ Sessions API working');
      passed++;
    } else {
      console.log('❌ Sessions API failed');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Sessions API error: ${error.message}`);
    failed++;
  }
  
  try {
    console.log('Testing /api/sessions/events...');
    const eventsResponse = await makeRequest('/api/sessions/events?limit=5');
    if (eventsResponse.status === 200) {
      console.log('✅ Session events API working');
      passed++;
    } else {
      console.log('❌ Session events API failed');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Session events API error: ${error.message}`);
    failed++;
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All core APIs working! Migration infrastructure is ready.');
  } else {
    console.log('🔍 Some APIs need attention.');
  }
  
  return failed === 0;
}

if (require.main === module) {
  runTests().catch(console.error);
}