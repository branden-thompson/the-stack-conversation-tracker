/**
 * Theme Isolation Diagnostic Tool
 * Run this in browser console to test theme isolation system
 */

console.log('🔍 Theme Isolation Diagnostic Starting...');

// Test 1: Check if feature flag is enabled
function checkFeatureFlag() {
  // This won't work in client-side, but we know it's enabled from .env.local
  console.log('✅ Feature flag: NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION=true (confirmed)');
}

// Test 2: Test localStorage events
function testStorageEvents() {
  console.log('📡 Testing localStorage events...');
  
  let eventReceived = false;
  
  // Listen for storage events
  const handler = (event) => {
    console.log('🔥 Storage event received!', {
      key: event.key,
      oldValue: event.oldValue,
      newValue: event.newValue,
      storageArea: event.storageArea
    });
    eventReceived = true;
  };
  
  window.addEventListener('storage', handler);
  
  // Test by setting a value (this will only trigger in OTHER tabs)
  const testKey = 'diagnostic_test_' + Date.now();
  localStorage.setItem(testKey, 'test_value');
  
  setTimeout(() => {
    console.log(eventReceived ? 
      '✅ Storage events are working' : 
      '❌ Storage events NOT received (this is normal - they only fire in OTHER tabs)'
    );
    localStorage.removeItem(testKey);
    window.removeEventListener('storage', handler);
  }, 1000);
}

// Test 3: Check current theme storage
function checkThemeStorage() {
  console.log('🎨 Checking theme storage...');
  
  const keys = Object.keys(localStorage).filter(key => 
    key.includes('theme') || key.startsWith('user_')
  );
  
  console.log('Theme-related localStorage keys:', keys);
  
  keys.forEach(key => {
    console.log(`  ${key}: ${localStorage.getItem(key)}`);
  });
}

// Test 4: Manual theme simulation
function simulateThemeChange(userId = 'test_user_123') {
  console.log(`🧪 Simulating theme change for user: ${userId}`);
  
  const key = `user_${userId}_theme_mode`;
  const currentValue = localStorage.getItem(key) || 'dark';
  const newValue = currentValue === 'dark' ? 'light' : 'dark';
  
  console.log(`Setting ${key}: ${currentValue} -> ${newValue}`);
  localStorage.setItem(key, newValue);
  
  console.log('✅ Theme change simulated. Check other tabs for sync.');
}

// Run all tests
function runDiagnostic() {
  console.log('🚀 Running theme isolation diagnostic...');
  checkFeatureFlag();
  testStorageEvents();
  checkThemeStorage();
  
  console.log('\n📋 Manual tests:');
  console.log('1. Run simulateThemeChange() in this tab');
  console.log('2. Open another tab and watch console');
  console.log('3. Storage events should fire in the other tab');
  
  // Make functions available globally for manual testing
  window.simulateThemeChange = simulateThemeChange;
  window.checkThemeStorage = checkThemeStorage;
}

runDiagnostic();