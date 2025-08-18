/**
 * Safety Switch Testing Script
 * 
 * Tests the safety switch functionality and circuit breakers
 * Run with: node dev-scripts/test-safety-switches.js
 */

// Mock window and localStorage for Node environment
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  localStorage: {
    getItem: (key) => null,
    setItem: (key, value) => console.log(`localStorage.setItem('${key}', '${value}')`),
    removeItem: (key) => console.log(`localStorage.removeItem('${key}')`)
  }
};

global.localStorage = global.window.localStorage;

// Import safety switches
const { 
  getAllSafetySwitches,
  setSafetySwitch,
  circuitBreakers,
  withSafetyControls 
} = require('../lib/utils/safety-switches.js');

console.log('🔧 Testing Safety Switches\n');

// Test 1: Check default states
console.log('1. Default Safety Switch States:');
const switches = getAllSafetySwitches();
Object.entries(switches).forEach(([name, enabled]) => {
  console.log(`   ${name}: ${enabled ? '✅' : '❌'}`);
});

console.log('\n2. Testing Switch Toggle:');
setSafetySwitch('cardEvents', false);
setSafetySwitch('userTracking', false);

console.log('\n3. Testing Circuit Breaker:');
const cardBreaker = circuitBreakers.cards;

// Simulate failures
console.log('   Simulating failures...');
for (let i = 0; i < 6; i++) {
  try {
    cardBreaker.onFailure();
    console.log(`   Failure ${i + 1}: ${cardBreaker.getStats().state}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
}

console.log(`   Final circuit state: ${cardBreaker.getStats().state}`);
console.log(`   Stats:`, cardBreaker.getStats());

console.log('\n4. Testing withSafetyControls wrapper:');
const testOperation = withSafetyControls('cards', 'cardEvents', async (data) => {
  return `Operation completed with: ${data}`;
});

testOperation('test data')
  .then(result => console.log(`   Result: ${result}`))
  .catch(error => console.log(`   Error: ${error.message}`));

console.log('\n✅ Safety switch tests completed');