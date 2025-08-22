/**
 * Force Fix Theme Isolation
 * 
 * This script provides a comprehensive fix for theme isolation issues.
 * It can be run directly in the browser console or as a bookmarklet.
 */

console.log('🔧 Force Fix Theme Isolation');
console.log('============================');

// Step 1: Clear emergency disable flags
const wasEmergencyDisabled = localStorage.getItem('user_theme_isolation_disabled') === 'true';
if (wasEmergencyDisabled) {
  const reason = localStorage.getItem('theme_emergency_disable_reason');
  const time = localStorage.getItem('theme_emergency_disable_time');
  
  console.log('🚨 Found emergency disable flag');
  console.log('Reason:', reason);
  console.log('Time:', time ? new Date(parseInt(time)).toLocaleString() : 'Unknown');
  
  localStorage.removeItem('user_theme_isolation_disabled');
  localStorage.removeItem('theme_emergency_disable_reason');
  localStorage.removeItem('theme_emergency_disable_time');
  
  console.log('✅ Emergency disable flags cleared');
} else {
  console.log('✅ No emergency disable flags found');
}

// Step 2: Check environment variable
const envVar = typeof process !== 'undefined' && process.env ? 
  process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION : 'Not available';
console.log('Environment Variable:', envVar);

// Step 3: Test user theme storage
const testUserId = 'test_theme_fix_' + Date.now();
const testTheme = 'light';

try {
  localStorage.setItem(`user_${testUserId}_theme_mode`, testTheme);
  const retrieved = localStorage.getItem(`user_${testUserId}_theme_mode`);
  
  if (retrieved === testTheme) {
    console.log('✅ User theme storage working');
  } else {
    console.log('❌ User theme storage failed');
  }
  
  // Clean up
  localStorage.removeItem(`user_${testUserId}_theme_mode`);
} catch (error) {
  console.log('❌ User theme storage error:', error.message);
}

// Step 4: Check if we need to refresh
if (wasEmergencyDisabled) {
  console.log('');
  console.log('🔄 REFRESH NEEDED');
  console.log('Emergency disable was active. Please refresh the page to re-enable theme isolation.');
  console.log('');
  
  const autoRefresh = confirm('Refresh the page now to apply the fix?');
  if (autoRefresh) {
    window.location.reload();
  }
} else {
  console.log('');
  console.log('✅ Theme isolation should be working');
  console.log('If still not working, check the React component state in DevTools');
}

// Step 5: Provide manual test commands
console.log('');
console.log('🧪 Manual Test Commands:');
console.log('========================');
console.log('// Set a test theme for current user');
console.log('localStorage.setItem("user_' + (Date.now()) + '_theme_mode", "dark");');
console.log('');
console.log('// Check all theme keys');
console.log('Object.keys(localStorage).filter(k => k.includes("theme")).forEach(k => console.log(k, localStorage.getItem(k)));');

// Export for programmatic use
window.forceFixThemeIsolation = () => {
  console.log('Running force fix...');
  // Re-run the fix
  eval(document.currentScript ? document.currentScript.innerHTML : '/* Already executed */');
};