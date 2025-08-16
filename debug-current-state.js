/**
 * Debug Current State
 * Run this in browser console to check current user state
 */

function debugCurrentState() {
  console.log('=== CURRENT STATE DEBUG ===');
  
  // Check if React DevTools can help
  if (window.React) {
    console.log('React found:', window.React.version);
  }
  
  // Check user selector dropdown
  const userButton = document.querySelector('[title*="Select user"], [title*="user"]');
  if (userButton) {
    console.log('User button found:', userButton.title || userButton.textContent);
    
    // Try to open dropdown and see what users are available
    userButton.click();
    
    setTimeout(() => {
      const dropdownButtons = document.querySelectorAll('button');
      const userButtons = [];
      
      dropdownButtons.forEach(btn => {
        const text = btn.textContent.trim().toLowerCase();
        if (text.includes('system') || text.includes('branden') || text.includes('guest')) {
          userButtons.push({
            text: btn.textContent.trim(),
            element: btn
          });
        }
      });
      
      console.log('Available users in dropdown:', userButtons);
      
      // Check if theme controls are present
      const themeButtons = document.querySelectorAll('button[title*="theme"], button[aria-label*="theme"]');
      console.log('Theme controls found:', themeButtons.length);
      
      // Close dropdown
      if (userButton) userButton.click();
      
    }, 500);
  } else {
    console.log('User button not found');
  }
  
  // Check API directly
  fetch('/api/users')
    .then(response => response.json())
    .then(users => {
      console.log('API users:', users);
    })
    .catch(error => {
      console.error('API error:', error);
    });
}

// Run the debug
debugCurrentState();

// Make it available globally
window.debugCurrentState = debugCurrentState;