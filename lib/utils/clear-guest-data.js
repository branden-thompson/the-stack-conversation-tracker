/**
 * Utility to properly clear all guest data across different storage mechanisms
 */

import { sessionGuestProvisioning } from '@/lib/auth/guest-session';

/**
 * Clear all guest data from localStorage, sessionStorage, and API
 * @param {Function} refreshProvisionedGuest - Optional function to refresh the provisioned guest
 */
export async function clearAllGuestData(refreshProvisionedGuest = null) {
  console.log('[ClearGuestData] Starting comprehensive guest data cleanup...');
  
  // 1. Clear localStorage guest data (used by GlobalSessionProvider)
  if (typeof window !== 'undefined') {
    const localStorageKeys = [
      'provisioned_guest_data',
      'selectedUserId',
      'sessionId_guest_'
    ];
    
    localStorageKeys.forEach(key => {
      if (key.endsWith('_')) {
        // Handle prefixed keys
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.startsWith(key)) {
            localStorage.removeItem(storageKey);
            console.log('[ClearGuestData] Removed localStorage key:', storageKey);
          }
        });
      } else {
        localStorage.removeItem(key);
        console.log('[ClearGuestData] Removed localStorage key:', key);
      }
    });
  }
  
  // 2. Clear sessionStorage guest data (used by sessionGuestProvisioning)
  if (sessionGuestProvisioning) {
    sessionGuestProvisioning.clearProvisionedGuest();
    console.log('[ClearGuestData] Cleared provisioned guest from sessionStorage');
  }
  
  // 3. Clear sessionStorage user selection
  if (typeof window !== 'undefined') {
    const sessionStorageKeys = [
      'selectedUserId',
      'provisioned_session_guest',
      'guest_coordination_session',
      'guest_coordination_fingerprint'
    ];
    
    sessionStorageKeys.forEach(key => {
      sessionStorage.removeItem(key);
      console.log('[ClearGuestData] Removed sessionStorage key:', key);
    });
  }
  
  // 4. Clean up guest sessions via API
  try {
    console.log('[ClearGuestData] Cleaning up guest sessions via API...');
    const response = await fetch('/api/sessions/cleanup', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userType: 'guest'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('[ClearGuestData] API cleanup result:', result);
    } else {
      console.warn('[ClearGuestData] API cleanup failed:', response.status);
    }
  } catch (error) {
    console.error('[ClearGuestData] Error during API cleanup:', error);
  }
  
  console.log('[ClearGuestData] Comprehensive cleanup completed!');
  
  // 5. Refresh provisioned guest if function provided
  if (refreshProvisionedGuest && typeof refreshProvisionedGuest === 'function') {
    try {
      console.log('[ClearGuestData] Refreshing provisioned guest...');
      refreshProvisionedGuest();
    } catch (error) {
      console.error('[ClearGuestData] Error refreshing provisioned guest:', error);
    }
  }
  
  // 6. Return a promise that resolves after a brief delay to allow cleanup to complete
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('[ClearGuestData] Ready for page refresh');
      resolve();
    }, 200);
  });
}

/**
 * Check what guest data currently exists across all storage mechanisms
 */
export function debugGuestData() {
  console.log('[DebugGuestData] Current guest data state:');
  
  // Check localStorage
  if (typeof window !== 'undefined') {
    const localStorageData = localStorage.getItem('provisioned_guest_data');
    console.log('  localStorage provisioned_guest_data:', localStorageData ? JSON.parse(localStorageData) : 'None');
    
    const selectedUserId = localStorage.getItem('selectedUserId');
    console.log('  localStorage selectedUserId:', selectedUserId);
    
    // Check sessionStorage
    const sessionGuestData = sessionStorage.getItem('provisioned_session_guest');
    console.log('  sessionStorage provisioned_session_guest:', sessionGuestData ? JSON.parse(sessionGuestData) : 'None');
    
    const sessionSelectedUserId = sessionStorage.getItem('selectedUserId');
    console.log('  sessionStorage selectedUserId:', sessionSelectedUserId);
  }
  
  // Check sessionGuestProvisioning
  if (sessionGuestProvisioning) {
    const hasProvisionedGuest = sessionGuestProvisioning.hasProvisionedGuest();
    console.log('  sessionGuestProvisioning.hasProvisionedGuest():', hasProvisionedGuest);
  }
}

const clearGuestDataUtils = {
  clearAllGuestData,
  debugGuestData
};

export default clearGuestDataUtils;