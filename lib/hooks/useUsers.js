/**
 * useUsers Hook
 * 
 * React Query-powered users management with fallback to legacy implementation.
 * Legacy code moved to /deprecated after successful React Query migration.
 */

import { useState, useEffect, useCallback } from 'react';
import { getSafetySwitch } from '@/lib/utils/safety-switches';

/**
 * React Query version with proper user switching
 */
function useUsersReactQuery() {
  const { useUsersQuery, useUserMutations } = require('./useUserTrackingQuery');
  const { data: users = [], isLoading: loading, error } = useUsersQuery();
  const mutations = useUserMutations();
  
  // Add state for current user selection (same as legacy)
  const [currentUserId, setCurrentUserId] = useState(null);
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);
  
  /**
   * Switch to a different user
   */
  const switchUser = useCallback((userId) => {
    // If users are still loading, set currentUserId immediately to prevent UI flickering
    if (loading || users.length === 0) {
      setCurrentUserId(userId);
      setHasAutoSwitched(true);
      return;
    }
    
    // Ensure user exists in the users array
    const user = users.find(u => u.id === userId);
    
    if (user || userId) { // Allow switching even if user not found yet (loading state)
      setCurrentUserId(userId);
      setHasAutoSwitched(true);
    }
  }, [users, loading]);
  
  // Don't auto-switch users - let browser session handle defaults
  useEffect(() => {
    // Just mark as initialized to prevent any auto-switching
    if (!hasAutoSwitched && users.length > 0) {
      setHasAutoSwitched(true);
      // Clear any old persisted user selections to prevent conflicts
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('selectedUserId');
      }
    }
  }, [users, currentUserId, hasAutoSwitched]);
  
  // Derived state with loading state handling
  const currentUser = currentUserId ? 
    (users.find(user => user.id === currentUserId) || 
     // If users haven't loaded but we have a currentUserId, create a placeholder
     (loading && currentUserId ? { 
       id: currentUserId, 
       name: currentUserId === 'system' ? 'System' : 'Loading...', 
       isSystemUser: currentUserId === 'system',
       loading: true 
     } : null)
    ) : null;
  
  const systemUser = users.find(user => user.isSystemUser) || null;
  const regularUsers = users.filter(user => !user.isSystemUser);
  
  return {
    // State
    users,
    loading,
    error: error?.message || null,
    currentUserId,
    currentUser,
    systemUser,
    regularUsers,
    
    // Operations  
    fetchUsers: () => {}, // React Query handles this automatically
    createUser: mutations.create,
    updateUser: mutations.update,
    deleteUser: mutations.delete,
    updateUserPreferences: (userId, preferences) => mutations.update(userId, { preferences }),
    switchUser,
    
    // Utilities
    refreshUsers: () => {}, // React Query handles this automatically
  };
}

/**
 * Main useUsers hook with React Query migration
 */
export function useUsers() {
  // Use non-hook version to avoid conditional hook calls
  const useReactQuery = getSafetySwitch('reactQuery');
  
  if (useReactQuery) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUsersReactQuery();
  } else {
    // Fallback to legacy version if needed
    const { useUsersLegacy } = require('./deprecated/useUsersLegacy');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUsersLegacy();
  }
}