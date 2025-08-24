/**
 * Unified User Management Hook
 * 
 * Provides consistent user management handlers for both app and dev headers.
 * Handles both registered users and guest users appropriately.
 */

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGuestUsers } from './useGuestUsers';

export function useUserManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    allUsers,
    currentUser,
    switchUser,
    createUser,
    updateUser,
    deleteUser,
    isGuestMode,
    isCurrentUserGuest,
    createNewGuestUser,
    updateGuestUserName,
    updateGuestPreferences,
    guestUsers,
    sessionTimeRemaining,
    provisionedGuest,
  } = useGuestUsers();
  
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [userProfileMode, setUserProfileMode] = useState('create');
  const [editingUser, setEditingUser] = useState(null);
  
  // Determine if we're in a dev page
  const isDevPage = pathname?.startsWith('/dev/');
  
  /**
   * Handle user selection/switching
   */
  const handleUserSelect = useCallback((selectedUser) => {
    if (selectedUser.id === 'guest' || selectedUser.isGuest) {
      switchUser('guest');
    } else {
      switchUser(selectedUser.id);
    }
  }, [switchUser]);
  
  /**
   * Handle creating a new user
   * Behavior differs between app and dev contexts
   */
  const handleCreateUser = useCallback((userData) => {
    // Guests can't create registered users - offer to create another guest
    if (isCurrentUserGuest) {
      const newGuest = createNewGuestUser();
      if (newGuest && !isDevPage) {
        // In app context, show a subtle notification
        console.log(`Created new guest: ${newGuest.name}`);
      } else if (newGuest && isDevPage) {
        // In dev context, show an alert for testing
        alert(`Created new guest: ${newGuest.name}`);
      }
      return;
    }
    
    if (isDevPage) {
      // In dev pages, navigate to users management page
      router.push('/dev/users?action=create');
    } else {
      // In app pages, open the user profile dialog
      setEditingUser(null);
      setUserProfileMode('create');
      setUserProfileOpen(true);
    }
  }, [isCurrentUserGuest, createNewGuestUser, isDevPage, router]);
  
  /**
   * Handle editing a user profile
   */
  const handleEditUser = useCallback((user) => {
    // Handle guest user name editing
    if (user?.isGuest && isCurrentUserGuest && user.id === currentUser?.id) {
      const newName = prompt('Enter new name:', user.name);
      if (newName && newName.trim()) {
        updateGuestUserName(newName.trim());
      }
      return;
    }
    
    if (isDevPage && user?.id) {
      // In dev pages, navigate to users management page with edit params
      router.push(`/dev/users?action=edit&userId=${user.id}`);
    } else {
      // In app pages, open the user profile dialog in edit mode
      setEditingUser(user);
      setUserProfileMode('edit');
      setUserProfileOpen(true);
    }
  }, [isCurrentUserGuest, currentUser, updateGuestUserName, isDevPage, router]);
  
  /**
   * Handle managing all users
   */
  const handleManageUsers = useCallback(() => {
    if (isCurrentUserGuest) {
      // Show guest limitations
      const message = 'Guest users have limited management capabilities. You can create additional guests or edit your own name.';
      if (isDevPage) {
        alert(message);
      } else {
        // In app context, could show a toast or just create a new user
        console.log(message);
        handleCreateUser();
      }
      return;
    }
    
    if (isDevPage) {
      // In dev pages, navigate to users management page
      router.push('/dev/users');
    } else {
      // In app pages, open create dialog (later could be a dedicated management page)
      handleCreateUser();
    }
  }, [isCurrentUserGuest, isDevPage, router, handleCreateUser]);
  
  /**
   * Handle saving user data (for app context with dialog)
   */
  const handleUserSave = useCallback(async (userData, userId) => {
    let result;
    if (userId) {
      // Update existing user
      result = await updateUser(userId, userData);
    } else {
      // Create new user
      result = await createUser(userData);
    }
    // Don't close dialog here - let the dialog component handle closing
    // after profile picture upload (if any) is complete
    return result; // Return the created/updated user for profile picture upload
  }, [createUser, updateUser]);
  
  /**
   * Handle deleting a user
   */
  const handleUserDelete = useCallback(async (userId) => {
    await deleteUser(userId);
    // If we deleted the current user, switch to system or guest
    if (userId === currentUser?.id) {
      switchUser('system');
    }
    setUserProfileOpen(false);
  }, [deleteUser, currentUser, switchUser]);
  
  return {
    // User data
    allUsers,
    currentUser,
    isGuestMode,
    isCurrentUserGuest,
    guestUsers,
    sessionTimeRemaining,
    provisionedGuest,
    
    // User management handlers
    handleUserSelect,
    handleCreateUser,
    handleEditUser,
    handleManageUsers,
    handleUserSave,
    handleUserDelete,
    
    // Guest-specific handlers
    updateGuestPreferences,
    createNewGuestUser,
    updateGuestUserName,
    
    // Dialog state (for app context)
    userProfileOpen,
    setUserProfileOpen,
    userProfileMode,
    setUserProfileMode,
    editingUser,
    setEditingUser,
  };
}