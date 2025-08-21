/**
 * Manual test script for user switching
 * Run this in the browser console to test user switching logic
 */

console.log('=== USER SWITCHING TEST SUITE ===');

// Test function to systematically check user switching
function testUserSwitching() {
  console.log('\n=== STARTING USER SWITCHING TESTS ===');
  
  // Test 1: Check available users
  console.log('\n1. CHECKING AVAILABLE USERS');
  const selector = document.querySelector('[title="Select user"]')?.closest('div');
  if (selector) {
    selector.click();
    setTimeout(() => {
      const userButtons = document.querySelectorAll('button[data-user-id], button:has(span[contains(text(), "System")]), button:has(span[contains(text(), "Branden")]), button:has(span[contains(text(), "Guest Mode")])');
      console.log('Found user buttons:', userButtons.length);
      userButtons.forEach((btn, i) => {
        console.log(`Button ${i}:`, btn.textContent.trim(), btn.onclick);
      });
    }, 100);
  }
  
  // Test 2: Try switching to System user specifically
  setTimeout(() => {
    console.log('\n2. ATTEMPTING SYSTEM USER SWITCH');
    const systemButtons = document.querySelectorAll('button');
    let systemButton = null;
    
    systemButtons.forEach(btn => {
      if (btn.textContent.includes('System') && !btn.textContent.includes('Guest')) {
        systemButton = btn;
      }
    });
    
    if (systemButton) {
      console.log('Found System button:', systemButton.textContent.trim());
      console.log('Clicking System button...');
      systemButton.click();
    } else {
      console.log('System button not found');
    }
  }, 500);
  
  // Test 3: Check current user after switch
  setTimeout(() => {
    console.log('\n3. CHECKING CURRENT USER AFTER SWITCH');
    const currentUserElement = document.querySelector('[title*="Select user"]');
    if (currentUserElement) {
      console.log('Current user element:', currentUserElement.title);
    }
    
    // Check console for any switching logs
    console.log('Check the console above for detailed switching logs');
  }, 2000);
}

// Test helper to manually trigger a switch
function testSwitchToUser(userId) {
  console.log(`\n=== MANUAL SWITCH TEST TO: ${userId} ===`);
  
  // Try to find the user selector and trigger switch
  const profileButton = document.querySelector('[title*="Select user"]');
  if (profileButton) {
    profileButton.click();
    
    setTimeout(() => {
      const buttons = document.querySelectorAll('button');
      let targetButton = null;
      
      buttons.forEach(btn => {
        const text = btn.textContent.trim();
        if ((userId === 'system' && text.includes('System') && !text.includes('Guest')) ||
            (userId === 'branden' && text.toLowerCase().includes('branden')) ||
            (userId === 'guest' && text.includes('Guest Mode'))) {
          targetButton = btn;
        }
      });
      
      if (targetButton) {
        console.log(`Found target button for ${userId}:`, targetButton.textContent.trim());
        targetButton.click();
        
        setTimeout(() => {
          console.log('Switch attempt completed, check current user state');
        }, 500);
      } else {
        console.log(`Target button for ${userId} not found`);
      }
    }, 100);
  }
}

// Export test functions to global scope
window.testUserSwitching = testUserSwitching;
window.testSwitchToUser = testSwitchToUser;

console.log('Test functions available:');
console.log('- testUserSwitching() - Run full test suite');
console.log('- testSwitchToUser("system") - Test switch to system user');
console.log('- testSwitchToUser("branden") - Test switch to branden user');  
console.log('- testSwitchToUser("guest") - Test switch to guest mode');