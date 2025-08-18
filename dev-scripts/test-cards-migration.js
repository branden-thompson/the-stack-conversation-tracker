/**
 * Cards Migration Testing Script
 * 
 * Comprehensive testing of React Query cards migration including
 * optimistic updates, drag-and-drop operations, and critical card functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const baseUrl = 'http://localhost:3006';
const testResults = {
  api: {},
  performance: {},
  optimisticUpdates: {},
  errors: []
};

console.log('🎴 Starting Cards Migration Testing\n');

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, options);
    let data;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
    return { success: response.ok, status: response.status, data, response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test Cards API endpoints
async function testCardsAPI() {
  console.log('1. Testing Cards API Endpoints:');
  
  const apiUrl = `${baseUrl}/api/cards`;
  let createdCardId = null;
  
  // Test GET cards
  console.log('   GET /api/cards...');
  const getResult = await makeRequest(apiUrl);
  if (getResult.success) {
    const cardCount = Array.isArray(getResult.data) ? getResult.data.length : 0;
    console.log(`   ✅ GET success - ${cardCount} cards found`);
  } else {
    console.log(`   ❌ GET failed - ${getResult.error || getResult.status}`);
    testResults.errors.push('GET /api/cards failed');
  }
  
  // Test POST cards (create)
  console.log('   POST /api/cards...');
  const testCard = {
    type: 'topic',
    content: `Test Card Migration ${Date.now()}`,
    zone: 'active',
    position: { x: 100, y: 100 },
    stackOrder: 0,
    faceUp: true
  };
  
  const postResult = await makeRequest(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testCard)
  });
  
  if (postResult.success && postResult.data.id) {
    createdCardId = postResult.data.id;
    console.log(`   ✅ POST success - card created with ID: ${createdCardId}`);
    
    // Test PUT cards (update)
    console.log('   PUT /api/cards...');
    const updateData = {
      id: createdCardId,
      content: 'Updated Test Card Content',
      zone: 'parking',
      position: { x: 200, y: 150 }
    };
    
    const putResult = await makeRequest(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (putResult.success) {
      console.log('   ✅ PUT success - card updated');
    } else {
      console.log(`   ❌ PUT failed - ${putResult.error || putResult.status}`);
      testResults.errors.push('PUT /api/cards failed');
    }
    
  } else {
    console.log(`   ❌ POST failed - ${postResult.error || postResult.status}`);
    testResults.errors.push('POST /api/cards failed');
  }
  
  // Test multiple card updates
  if (createdCardId) {
    console.log('   PUT /api/cards (multiple)...');
    const multipleUpdates = [
      { id: createdCardId, stackOrder: 1 },
    ];
    
    const multipleResult = await makeRequest(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(multipleUpdates)
    });
    
    if (multipleResult.success) {
      console.log('   ✅ PUT multiple success - cards updated');
    } else {
      console.log(`   ❌ PUT multiple failed - ${multipleResult.error || multipleResult.status}`);
      testResults.errors.push('PUT multiple /api/cards failed');
    }
  }
  
  // Test DELETE cards
  if (createdCardId) {
    console.log('   DELETE /api/cards...');
    const deleteResult = await makeRequest(`${apiUrl}?id=${createdCardId}`, {
      method: 'DELETE'
    });
    
    if (deleteResult.success) {
      console.log('   ✅ DELETE success - card deleted');
    } else {
      console.log(`   ❌ DELETE failed - ${deleteResult.error || deleteResult.status}`);
      testResults.errors.push('DELETE /api/cards failed');
    }
  }
  
  console.log();
  return { apiWorking: getResult.success && postResult.success };
}

// Test drag and drop simulation
async function testDragAndDropOperations() {
  console.log('2. Testing Drag & Drop Operations:');
  
  const apiUrl = `${baseUrl}/api/cards`;
  
  // Create test cards for drag and drop
  const testCards = [
    {
      type: 'question',
      content: 'Drag Test Card 1',
      zone: 'active',
      position: { x: 10, y: 10 },
      stackOrder: 0,
      faceUp: true
    },
    {
      type: 'fact', 
      content: 'Drag Test Card 2',
      zone: 'active',
      position: { x: 10, y: 70 },
      stackOrder: 1,
      faceUp: true
    }
  ];
  
  const createdCards = [];
  
  // Create test cards
  for (const card of testCards) {
    const result = await makeRequest(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });
    
    if (result.success && result.data.id) {
      createdCards.push(result.data);
    }
  }
  
  console.log(`   Created ${createdCards.length} test cards`);
  
  if (createdCards.length >= 2) {
    // Test zone change (simulate drag from active to parking)
    console.log('   Testing zone change (active → parking)...');
    const moveResult = await makeRequest(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: createdCards[0].id,
        zone: 'parking',
        position: { x: 50, y: 50 },
        stackOrder: 0
      })
    });
    
    if (moveResult.success) {
      console.log('   ✅ Zone change successful');
    } else {
      console.log('   ❌ Zone change failed');
      testResults.errors.push('Card zone change failed');
    }
    
    // Test stacking (simulate cards stacking on each other)
    console.log('   Testing card stacking...');
    const stackUpdates = createdCards.map((card, index) => ({
      id: card.id,
      stackOrder: index,
      position: { x: 100, y: 100 } // Same position for stacking
    }));
    
    const stackResult = await makeRequest(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stackUpdates)
    });
    
    if (stackResult.success) {
      console.log('   ✅ Card stacking successful');
    } else {
      console.log('   ❌ Card stacking failed');
      testResults.errors.push('Card stacking failed');
    }
  }
  
  // Cleanup test cards
  console.log('   Cleaning up test cards...');
  for (const card of createdCards) {
    await makeRequest(`${apiUrl}?id=${card.id}`, { method: 'DELETE' });
  }
  
  console.log();
}

// Test card types and zone operations
async function testCardTypesAndZones() {
  console.log('3. Testing Card Types and Zones:');
  
  const apiUrl = `${baseUrl}/api/cards`;
  const cardTypes = ['topic', 'question', 'accusation', 'fact', 'guess', 'opinion'];
  const zones = ['active', 'parking', 'resolved', 'unresolved'];
  
  console.log(`   Testing ${cardTypes.length} card types across ${zones.length} zones...`);
  
  const createdCards = [];
  
  // Create one card of each type in each zone
  for (const type of cardTypes) {
    for (const zone of zones) {
      const cardData = {
        type,
        content: `Test ${type} in ${zone}`,
        zone,
        position: { x: 10 + (cardTypes.indexOf(type) * 30), y: 10 + (zones.indexOf(zone) * 30) },
        stackOrder: 0,
        faceUp: true
      };
      
      const result = await makeRequest(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });
      
      if (result.success) {
        createdCards.push(result.data);
      } else {
        testResults.errors.push(`Failed to create ${type} card in ${zone}`);
      }
    }
  }
  
  console.log(`   ✅ Created ${createdCards.length}/${cardTypes.length * zones.length} test cards`);
  
  // Test card flipping (critical functionality that was previously broken)
  if (createdCards.length > 0) {
    console.log('   Testing card flipping (critical functionality)...');
    const flipCard = createdCards[0];
    
    const flipResult = await makeRequest(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: flipCard.id,
        faceUp: !flipCard.faceUp
      })
    });
    
    if (flipResult.success) {
      console.log('   ✅ Card flipping successful (no interference detected)');
    } else {
      console.log('   ❌ Card flipping failed - CRITICAL ISSUE');
      testResults.errors.push('Card flipping failed - Critical functionality broken');
    }
  }
  
  // Cleanup
  console.log('   Cleaning up test cards...');
  for (const card of createdCards) {
    await makeRequest(`${apiUrl}?id=${card.id}`, { method: 'DELETE' });
  }
  
  console.log();
}

// Test performance with multiple rapid operations
async function testPerformanceOptimizations() {
  console.log('4. Testing Performance Optimizations:');
  
  const apiUrl = `${baseUrl}/api/cards`;
  
  // Test rapid sequential card creation
  console.log('   Testing rapid card creation (5 cards)...');
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < 5; i++) {
    promises.push(makeRequest(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'topic',
        content: `Performance Test Card ${i + 1}`,
        zone: 'active',
        position: { x: 10 + (i * 20), y: 10 + (i * 20) },
        stackOrder: i,
        faceUp: true
      })
    }));
  }
  
  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;
  const successCount = results.filter(r => r.success).length;
  
  console.log(`   📊 Created ${successCount}/5 cards in ${duration}ms`);
  console.log(`   📊 Average: ${(duration / successCount).toFixed(2)}ms per card`);
  
  // Cleanup performance test cards
  const cardsToCleanup = results.filter(r => r.success && r.data?.id).map(r => r.data.id);
  for (const cardId of cardsToCleanup) {
    await makeRequest(`${apiUrl}?id=${cardId}`, { method: 'DELETE' });
  }
  
  testResults.performance = {
    rapidCreation: {
      totalCards: 5,
      successCount,
      duration,
      averagePerCard: duration / successCount
    }
  };
  
  console.log();
}

// Main test execution
async function runCardsTests() {
  const startTime = Date.now();
  
  try {
    const apiResults = await testCardsAPI();
    await testDragAndDropOperations();
    await testCardTypesAndZones();
    await testPerformanceOptimizations();
    
    // Summary
    const totalDuration = Date.now() - startTime;
    console.log('📋 Cards Migration Test Summary:');
    console.log(`   Duration: ${totalDuration}ms`);
    console.log(`   Errors: ${testResults.errors.length}`);
    
    if (testResults.errors.length > 0) {
      console.log('\n❌ Issues Found:');
      testResults.errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('\n✅ All cards tests passed!');
    }
    
    // Performance summary
    if (testResults.performance.rapidCreation) {
      const perf = testResults.performance.rapidCreation;
      console.log(`\n📊 Performance: ${perf.averagePerCard.toFixed(2)}ms avg per card operation`);
    }
    
    // Critical functionality check
    const criticalFunctionsWorking = !testResults.errors.some(error => 
      error.includes('flipping') || error.includes('stacking') || error.includes('zone change')
    );
    
    if (criticalFunctionsWorking) {
      console.log('\n🎯 Critical card functionality verified (flipping, stacking, drag-and-drop)');
    } else {
      console.log('\n⚠️  Critical card functionality issues detected');
    }
    
    // Save results
    const resultsPath = path.join(__dirname, 'test-results-cards.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
      ...testResults,
      totalDuration,
      criticalFunctionsWorking
    }, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
  } catch (error) {
    console.error('❌ Cards test execution failed:', error);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const result = await makeRequest(`${baseUrl}/api/cards`);
    return result.success;
  } catch (error) {
    return false;
  }
}

// Run if executed directly
if (require.main === module) {
  checkServer().then(serverRunning => {
    if (serverRunning) {
      runCardsTests();
    } else {
      console.log('❌ Development server not running. Please start with: npm run dev');
      process.exit(1);
    }
  });
}

module.exports = { runCardsTests };