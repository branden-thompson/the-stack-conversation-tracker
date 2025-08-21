#!/usr/bin/env node

/**
 * Test Dev-Scripts Access Configuration
 * 
 * Verifies that dev-scripts are accessible in development and blocked in production.
 * Run this script to test the conditional access implementation.
 * 
 * Usage: node dev-scripts/test-access.js
 */

const http = require('http');

async function testAccess(port = 3000) {
  console.log('🧪 Testing Dev-Scripts Access Configuration\n');
  
  const testUrls = [
    `/dev-scripts/`,
    `/dev-scripts/index.html`,
    `/dev-scripts/shared/ui-framework.css`,
    `/dev-scripts/test-pages/`,
    `/api/dev-scripts/`,
    `/api/dev-scripts/index.html`
  ];

  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Testing server at: http://localhost:${port}\n`);

  for (const url of testUrls) {
    try {
      const response = await makeRequest(port, url);
      const status = response.statusCode;
      const accessible = status === 200;
      const icon = accessible ? '✅' : '❌';
      const message = accessible ? 'Accessible' : `Blocked (${status})`;
      
      console.log(`${icon} ${url.padEnd(35)} - ${message}`);
      
    } catch (error) {
      console.log(`❌ ${url.padEnd(35)} - Error: ${error.message}`);
    }
  }

  console.log('\n📋 Expected Results:');
  console.log('   Development Mode: All URLs should be ✅ Accessible (200)');
  console.log('   Production Mode:  All URLs should be ❌ Blocked (404)');
  
  console.log('\n💡 To test production mode:');
  console.log('   NODE_ENV=production npm run build');
  console.log('   NODE_ENV=production npm start');
  console.log('   node dev-scripts/test-access.js');
}

function makeRequest(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(res);
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

// Run the test
testAccess().catch(console.error);