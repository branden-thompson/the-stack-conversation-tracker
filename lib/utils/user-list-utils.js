/**
 * User List Utilities
 * Optimized utilities for processing and comparing user lists in active user displays
 */

/**
 * Generate a stable key for a user object to prevent unnecessary re-renders
 * @param {Object} user - User object
 * @returns {string} Stable key based on user properties
 */
export function generateUserKey(user) {
  if (!user || !user.id) return 'unknown';
  
  // Include properties that affect display to create stable but responsive key
  const keyParts = [
    user.id,
    user.session?.status || 'unknown',
    user.route || '/',
    Math.floor((user.lastActivity || 0) / 60000) // Round to minute for stability
  ];
  
  return keyParts.join('::');
}

/**
 * Create a stable user object with consistent key generation
 * @param {Object} session - Session data
 * @param {Object} user - User data from allUsers
 * @returns {Object} Stable user object
 */
export function createStableUserObject(session, user) {
  const stableUser = {
    id: session.userId,
    name: user?.name || session.userName || 'Unknown User',
    profilePicture: user?.profilePicture || session.metadata?.avatar,
    session,
    route: session.currentRoute || '/',
    lastAction: session.recentActions?.[0] || null,
    lastActivity: session.lastActivityAt,
    // Add derived properties for stable comparison
    _stableKey: null, // Will be set after creation
    _displayOrder: session.lastActivityAt || 0
  };
  
  stableUser._stableKey = generateUserKey(stableUser);
  return stableUser;
}

/**
 * Compare two user lists to detect if actual changes occurred
 * @param {Array} prevUsers - Previous user list
 * @param {Array} newUsers - New user list
 * @returns {boolean} True if users actually changed
 */
export function hasUserListChanged(prevUsers = [], newUsers = []) {
  // Quick length check
  if (prevUsers.length !== newUsers.length) {
    return true;
  }
  
  // If empty, no change
  if (prevUsers.length === 0) {
    return false;
  }
  
  // Create sets of stable keys for comparison
  const prevKeys = new Set(prevUsers.map(u => u._stableKey || generateUserKey(u)));
  const newKeys = new Set(newUsers.map(u => u._stableKey || generateUserKey(u)));
  
  // Check if sets are equal
  if (prevKeys.size !== newKeys.size) {
    return true;
  }
  
  // Check if all keys match
  for (const key of prevKeys) {
    if (!newKeys.has(key)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Process active sessions into stable user objects with memoization-friendly structure
 * @param {Array} allSessions - All session data
 * @param {Array} allUsers - All user data
 * @returns {Array} Processed and stable user objects
 */
export function processActiveSessions(allSessions = [], allUsers = []) {
  // Filter for active sessions on app-level routes - separate step for clarity
  const activeAppSessions = allSessions.filter(session => {
    if (!session) return false;
    
    const isActive = session.status === 'active'; // Using string comparison for performance
    const isAppRoute = session.currentRoute && !session.currentRoute.startsWith('/dev');
    
    return isActive && isAppRoute;
  });
  
  // Create user objects with session data - separate step
  const usersWithSessions = activeAppSessions.map(session => {
    const user = allUsers.find(u => u?.id === session.userId);
    return createStableUserObject(session, user);
  });
  
  // Sort by most recent activity - separate step
  const sortedUsers = usersWithSessions.sort((a, b) => 
    (b._displayOrder) - (a._displayOrder)
  );
  
  // Remove duplicates (same user, multiple sessions) - final step
  const uniqueUsers = [];
  const seenIds = new Set();
  
  for (const user of sortedUsers) {
    if (!seenIds.has(user.id)) {
      seenIds.add(user.id);
      uniqueUsers.push(user);
    }
  }
  
  return uniqueUsers;
}

/**
 * Optimized hook-friendly processor that maintains referential stability
 * @param {Object} sessions - Sessions object from useUserTracking
 * @param {Array} allUsers - All users array from useGuestUsers
 * @param {boolean} loading - Loading state
 * @param {string|null} error - Error state
 * @returns {Array} Stable array of active users
 */
export function processActiveUsersStable(sessions, allUsers, loading, error) {
  // Early returns for invalid states
  if (loading || error || !sessions) {
    return [];
  }
  
  // Flatten sessions efficiently
  const allSessions = [
    ...Object.values(sessions.grouped || {}).flat(),
    ...(sessions.guests || [])
  ];
  
  // Process using our optimized function
  return processActiveSessions(allSessions, allUsers);
}

/**
 * React-friendly shallow equality check for arrays
 * @param {Array} a - First array
 * @param {Array} b - Second array
 * @returns {boolean} True if arrays are shallowly equal
 */
export function shallowEqualArrays(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}