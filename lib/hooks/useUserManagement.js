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
    if (isDevPage) {
      // In dev pages, navigate to users management page
      router.push('/dev/users?action=create');
    } else {
      // In app pages, always open the user profile dialog for creating new users
      // This allows anyone (including guests) to create proper registered users
      setEditingUser(null);
      setUserProfileMode('create');
      setUserProfileOpen(true);
    }
  }, [isDevPage, router]);
  
  /**
   * Handle editing a user profile
   */
  const handleEditUser = useCallback((user) => {
    if (isDevPage && user?.id) {
      // In dev pages, navigate to users management page with edit params
      router.push(`/dev/users?action=edit&userId=${user.id}`);
    } else {
      // In app pages, open the user profile dialog in edit mode
      // Use the provided user or current user if no user specified
      const userToEdit = user || currentUser;
      if (userToEdit) {
        setEditingUser(userToEdit);
        setUserProfileMode('edit');
        setUserProfileOpen(true);
      }
    }
  }, [currentUser, isDevPage, router]);
  
  /**
   * Handle managing all users
   */
  const handleManageUsers = useCallback(() => {
    // Always navigate to the dev users page for full user management
    // This provides a comprehensive interface for managing all users
    router.push('/dev/users');
  }, [router]);
  
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