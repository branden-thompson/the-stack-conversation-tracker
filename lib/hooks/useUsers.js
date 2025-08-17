/**
 * useUsers Hook
 * 
 * React hook for managing user data and operations
 * Follows the same pattern as useCards and useConversations
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for user management
 * @returns {Object} User state and operations
 */
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); // Don't default to any user
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false); // Track if we've auto-switched

  /**
   * Fetch all users from the API
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const usersArray = Array.isArray(data) ? data : [];
      setUsers(usersArray);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object|null>} Created user or null if error
   */
  const createUser = useCallback(async (userData) => {
    setError(null);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
      }
      
      const newUser = await response.json();
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Update an existing user
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated user or null if error
   */
  const updateUser = useCallback(async (userId, updates) => {
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status} ${response.statusText}`);
      }
      
      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Delete a user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  const deleteUser = useCallback(async (userId) => {
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
      }
      
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // If current user was deleted, switch to system user
      if (currentUserId === userId) {
        setCurrentUserId('system');
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message);
      return false;
    }
  }, [currentUserId]);

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Preferences to update
   * @returns {Promise<Object|null>} Updated user or null if error
   */
  const updateUserPreferences = useCallback(async (userId, preferences) => {
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update preferences: ${response.status} ${response.statusText}`);
      }
      
      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      console.error('Error updating user preferences:', err);
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Switch to a different user
   * @param {string} userId - User ID to switch to
   */
  const switchUser = useCallback((userId) => {
    // Get fresh users state to avoid stale closure issues
    setUsers(currentUsers => {
      const user = currentUsers.find(u => u.id === userId);
      
      if (user) {
        setCurrentUserId(userId);
        // IMPORTANT: Mark as auto-switched to prevent future auto-switching interference
        setHasAutoSwitched(true);
      }
      
      return currentUsers; // Return unchanged users array
    });
  }, []);

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  // Derived state
  const currentUser = users.find(user => user.id === currentUserId) || null;
  const systemUser = users.find(user => user.isSystemUser) || null;
  const regularUsers = users.filter(user => !user.isSystemUser);

  return {
    // State
    users,
    loading,
    error,
    currentUserId,
    currentUser,
    systemUser,
    regularUsers,
    
    // Operations
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserPreferences,
    switchUser,
    
    // Utilities
    refreshUsers: fetchUsers // Alias for consistency with other hooks
  };
}