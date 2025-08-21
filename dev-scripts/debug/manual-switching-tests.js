/**
 * Manual User Switching Test Suite
 * Run this in the browser console to verify user switching functionality
 * 
 * Usage:
 * 1. Open browser console
 * 2. Copy and paste this entire script
 * 3. Run: runManualTests()
 */

class UserSwitchingTester {
  constructor() {
    this.results = [];
    this.startTime = null;
    this.currentTest = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCurrentUserInfo() {
    // Try to extract current user info from the UI
    const userButton = document.querySelector('[title*="Select user"], [title*="user"]');
    const userText = userButton ? userButton.title || userButton.textContent : 'Unknown';
    
    return {
      element: userButton,
      text: userText.trim(),
      timestamp: Date.now()
    };
  }

  async clickUserInDropdown(targetUserName) {
    // Open user dropdown
    const userButton = document.querySelector('[title*="Select user"], [title*="user"]');
    if (!userButton) {
      throw new Error('User selector button not found');
    }

    this.log(`Opening user dropdown...`);
    userButton.click();
    await this.delay(200);

    // Find target user in dropdown
    const buttons = Array.from(document.querySelectorAll('button'));
    let targetButton = null;

    for (const btn of buttons) {
      const text = btn.textContent.toLowerCase();
      const target = targetUserName.toLowerCase();
      
      if ((target === 'system' && text.includes('system') && !text.includes('guest')) ||
          (target === 'branden' && text.includes('branden')) ||
          (target === 'guest' && text.includes('guest mode'))) {
        targetButton = btn;
        break;
      }
    }

    if (!targetButton) {
      throw new Error(`Target user "${targetUserName}" not found in dropdown`);
    }

    this.log(`Clicking on "${targetUserName}" button...`);
    targetButton.click();
    await this.delay(300); // Wait for switch to complete

    return true;
  }

  async testSingleSwitch(targetUser) {
    const testName = `Switch to ${targetUser}`;
    this.log(`\n🧪 Starting test: ${testName}`);
    
    try {
      const beforeSwitch = this.getCurrentUserInfo();
      this.log(`Before switch: ${beforeSwitch.text}`);

      await this.clickUserInDropdown(targetUser);
      
      const afterSwitch = this.getCurrentUserInfo();
      this.log(`After switch: ${afterSwitch.text}`);

      const success = afterSwitch.text.toLowerCase().includes(targetUser.toLowerCase()) ||
                     (targetUser === 'guest' && afterSwitch.text.toLowerCase().includes('guest'));

      if (success) {
        this.log(`✅ ${testName} - SUCCESS`, 'success');
      } else {
        this.log(`❌ ${testName} - FAILED: Expected ${targetUser}, got ${afterSwitch.text}`, 'error');
      }

      return {
        test: testName,
        targetUser,
        success,
        beforeUser: beforeSwitch.text,
        afterUser: afterSwitch.text,
        timestamp: Date.now()
      };
    } catch (error) {
      this.log(`❌ ${testName} - ERROR: ${error.message}`, 'error');
      return {
        test: testName,
        targetUser,
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  async testSequentialSwitching() {
    this.log('\n🔄 Testing Sequential User Switching');
    
    const sequence = ['branden', 'guest', 'system', 'branden', 'system'];
    const results = [];

    for (const user of sequence) {
      const result = await this.testSingleSwitch(user);
      results.push(result);
      await this.delay(500); // Pause between switches
    }

    return results;
  }

  async testRapidSwitching() {
    this.log('\n⚡ Testing Rapid User Switching');
    
    const sequence = ['branden', 'guest', 'branden', 'guest', 'system'];
    const results = [];
    const startTime = Date.now();

    for (const user of sequence) {
      const result = await this.testSingleSwitch(user);
      results.push(result);
      await this.delay(100); // Very fast switching
    }

    const totalTime = Date.now() - startTime;
    this.log(`Rapid switching completed in ${totalTime}ms`);

    return results;
  }

  async testSystemUserPersistence() {
    this.log('\n🎯 Testing System User Persistence (Regression Test)');
    
    // Switch to system user
    const systemSwitch = await this.testSingleSwitch('system');
    await this.delay(1000);

    // Check if still on system user (this was the main bug!)
    const afterDelay = this.getCurrentUserInfo();
    const stillSystem = afterDelay.text.toLowerCase().includes('system');

    if (stillSystem) {
      this.log('✅ System user persistence - SUCCESS (no auto-switch interference)', 'success');
    } else {
      this.log(`❌ REGRESSION DETECTED: System user auto-switched away to ${afterDelay.text}`, 'error');
    }

    return {
      test: 'System User Persistence (Regression Test)',
      initialSwitch: systemSwitch.success,
      persistedAfterDelay: stillSystem,
      finalUser: afterDelay.text,
      regressionDetected: !stillSystem
    };
  }

  async testSystemUserAccessibility() {
    this.log('\n🔄 Testing System User Accessibility from All States');
    
    const results = [];
    const transitions = [
      { from: 'branden', to: 'system' },
      { from: 'guest', to: 'system' },
      { from: 'system', to: 'branden' },
      { from: 'branden', to: 'system' }, // Test again after switching away
    ];

    for (const transition of transitions) {
      // Set up initial state
      await this.testSingleSwitch(transition.from);
      await this.delay(200);
      
      // Attempt the transition
      const result = await this.testSingleSwitch(transition.to);
      results.push({
        transition: `${transition.from} → ${transition.to}`,
        success: result.success,
        actualUser: result.afterUser
      });
      
      await this.delay(300);
    }

    const allSucceeded = results.every(r => r.success);
    if (allSucceeded) {
      this.log('✅ System user accessible from all states', 'success');
    } else {
      this.log('❌ System user accessibility issues detected', 'error');
    }

    return {
      test: 'System User Accessibility',
      results,
      allSucceeded
    };
  }

  async testGuestSessionPersistence() {
    this.log('\n👤 Testing Guest Session Persistence');
    
    // Switch to guest mode
    await this.testSingleSwitch('guest');
    await this.delay(500);

    // Switch to registered user
    await this.testSingleSwitch('branden');
    await this.delay(500);

    // Switch back to guest mode
    const backToGuest = await this.testSingleSwitch('guest');
    
    return {
      test: 'Guest Session Persistence',
      success: backToGuest.success,
      finalUser: backToGuest.afterUser
    };
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive User Switching Tests\n');
    this.startTime = Date.now();

    try {
      // Test 1: Sequential switching
      const sequentialResults = await this.testSequentialSwitching();
      
      // Test 2: Rapid switching  
      const rapidResults = await this.testRapidSwitching();
      
      // Test 3: System user persistence (REGRESSION TEST)
      const persistenceResults = await this.testSystemUserPersistence();
      
      // Test 4: System user accessibility (NEW)
      const accessibilityResults = await this.testSystemUserAccessibility();
      
      // Test 5: Guest session persistence
      const guestResults = await this.testGuestSessionPersistence();

      // Summary
      const totalTime = Date.now() - this.startTime;
      const allResults = [...sequentialResults, ...rapidResults, persistenceResults, accessibilityResults, guestResults];
      const successCount = allResults.filter(r => r.success).length;
      const totalTests = allResults.length;

      this.log(`\n📊 TEST SUMMARY`);
      this.log(`Total tests: ${totalTests}`);
      this.log(`Passed: ${successCount}`);
      this.log(`Failed: ${totalTests - successCount}`);
      this.log(`Total time: ${totalTime}ms`);
      this.log(`Success rate: ${Math.round((successCount / totalTests) * 100)}%`);

      if (successCount === totalTests) {
        this.log('\n🎉 ALL TESTS PASSED! User switching is working correctly.', 'success');
      } else {
        this.log('\n⚠️ Some tests failed. Check the logs above for details.', 'error');
      }

      return {
        summary: {
          totalTests,
          passed: successCount,
          failed: totalTests - successCount,
          successRate: Math.round((successCount / totalTests) * 100),
          totalTime
        },
        results: allResults
      };

    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Global test functions
window.userSwitchingTester = new UserSwitchingTester();

// Convenience functions
window.runManualTests = () => window.userSwitchingTester.runAllTests();
window.testSystemUser = () => window.userSwitchingTester.testSingleSwitch('system');
window.testBrandenUser = () => window.userSwitchingTester.testSingleSwitch('branden');
window.testGuestMode = () => window.userSwitchingTester.testSingleSwitch('guest');
window.testRapidSwitching = () => window.userSwitchingTester.testRapidSwitching();

console.log('🧪 User Switching Test Suite Loaded!');
console.log('');
console.log('Available commands:');
console.log('  runManualTests()     - Run all tests');
console.log('  testSystemUser()     - Test switch to System user');
console.log('  testBrandenUser()    - Test switch to Branden user');
console.log('  testGuestMode()      - Test switch to Guest mode');
console.log('  testRapidSwitching() - Test rapid switching scenario');
console.log('');
console.log('🚀 Ready to test! Run: runManualTests()');