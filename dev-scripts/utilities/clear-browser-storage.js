/**
 * Browser Storage Cleaner
 * Run this in your browser console to clear all storage for the current site
 */

console.log('🧹 Clearing browser storage...');

// Clear localStorage
try {
  localStorage.clear();
  console.log('✅ localStorage cleared');
} catch (e) {
  console.error('❌ Failed to clear localStorage:', e);
}

// Clear sessionStorage
try {
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');
} catch (e) {
  console.error('❌ Failed to clear sessionStorage:', e);
}

// Clear all cookies for current domain
try {
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  console.log('✅ Cookies cleared');
} catch (e) {
  console.error('❌ Failed to clear cookies:', e);
}

console.log('🎉 Browser storage cleared! Please refresh the page.');
console.log('');
console.log('Next steps:');
console.log('1. Close this tab');
console.log('2. Open a new tab to http://localhost:3000/');
console.log('3. Check http://localhost:3000/dev/user-tracking to see the fixed behavior');