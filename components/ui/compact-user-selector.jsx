/**
 * CompactUserSelector Component
 * 
 * A reusable, space-efficient user selector that displays only a profile picture (50x50)
 * that when clicked shows a dropdown below with user selection options.
 * 
 * Features:
 * - Fixed 50x50 size maintains consistent layout
 * - Profile picture with fallback to initials
 * - Dropdown with user list and management actions
 * - Right-aligned dropdown positioning
 * - System user indicators (crown badge)
 * - Click outside to close
 * - Keyboard accessible
 * 
 * @param {Array} users - Array of user objects
 * @param {string} currentUserId - ID of currently selected user
 * @param {Function} onUserSelect - Callback when user is selected (user) => void
 * @param {Function} onCreateUser - Optional callback for create user action
 * @param {Function} onEditUser - Optional callback for edit user action (user) => void
 * @param {Function} onManageUsers - Optional callback for manage users action
 * @param {string} className - Optional additional CSS classes
 * @param {boolean} disabled - Whether the selector is disabled
 * @param {boolean} showManagementActions - Whether to show create/edit/manage actions (default: true)
 * @param {boolean} showUserPreferences - Whether to show user preference controls (default: true)
 * @param {Object} themeControls - Theme control props { theme, setTheme, systemTheme } from useTheme()
 * @param {Array} additionalPreferences - Additional preference controls to render
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Crown, Plus, Edit3, Users, Sun, Moon, Laptop, LogOut } from 'lucide-react';
import { ProfilePicture } from '@/components/ui/profile-picture';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PROFILE_PICTURE_SIZES, Z_INDEX_CLASSES } from '@/lib/utils/ui-constants';

export function CompactUserSelector({
  users = [],
  currentUserId,
  onUserSelect,
  onCreateUser,
  onEditUser,
  onManageUsers,
  onLogout,
  className,
  disabled = false,
  showManagementActions = true,
  showUserPreferences = true,
  themeControls,
  additionalPreferences = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  // Handle both regular users and guest mode
  const currentUser = currentUserId === 'guest' 
    ? { id: 'guest', name: 'Guest Mode', isGuest: true }
    : users.find(user => user.id === currentUserId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (userId) => {
    console.log('=== COMPACT USER SELECTOR ===');
    console.log('handleUserSelect called with userId:', userId);
    console.log('Available users:', users.map(u => ({id: u.id, name: u.name, isSystemUser: u.isSystemUser})));
    
    if (userId.startsWith('action:')) {
      const action = userId.replace('action:', '');
      
      switch (action) {
        case 'create-user':
          onCreateUser?.();
          break;
        case 'edit-current':
          if (currentUser) {
            onEditUser?.(currentUser);
          }
          break;
        case 'manage-users':
          onManageUsers?.();
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } else {
      // Handle guest mode selection
      if (userId === 'guest') {
        console.log('Guest mode selected');
        if (onUserSelect) {
          onUserSelect({ id: 'guest', name: 'Guest Mode', isGuest: true });
        }
      } else {
        // Handle regular user selection
        const selectedUser = users.find(user => user.id === userId);
        console.log('Looking for user with ID:', userId);
        console.log('Found selectedUser:', selectedUser);
        
        if (selectedUser && onUserSelect) {
          console.log('Calling onUserSelect with:', selectedUser);
          onUserSelect(selectedUser);
        } else {
          console.warn('User not found or onUserSelect missing:', {selectedUser, onUserSelect: !!onUserSelect});
        }
      }
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Profile Picture Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          `w-[${PROFILE_PICTURE_SIZES.compact}px] h-[${PROFILE_PICTURE_SIZES.compact}px] rounded-full border-2 border-gray-200 dark:border-gray-600`,
          "hover:border-blue-400 dark:hover:border-blue-500 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "flex items-center justify-center relative",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "border-blue-400 dark:border-blue-500"
        )}
        title={currentUser ? currentUser.name : "Select user"}
      >
        {currentUser ? (
          <div className="relative w-[46px] h-[46px]">
            {currentUser.isGuest ? (
              <div className="w-[46px] h-[46px] rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg font-bold">
                G
              </div>
            ) : (
              <ProfilePicture
                src={currentUser.profilePicture}
                name={currentUser.name}
                size="46"
                className="border-0"
              />
            )}
            {/* System user indicator */}
            {currentUser.isSystemUser && (
              <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border border-white dark:border-gray-800">
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-[46px] h-[46px] rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[60px] right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[200px] max-w-[280px]">
          <div className="p-1">
            {/* Current user header */}
            {currentUser && (
              <>
                <div className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                  Current: {currentUser.name}
                  {currentUser.isSystemUser && <span className="text-xs opacity-60 ml-1">(System)</span>}
                  {currentUser.isGuest && <span className="text-xs opacity-60 ml-1">(Guest)</span>}
                </div>
              </>
            )}

            {/* User Preferences Section */}
            {currentUser && showUserPreferences && (themeControls || additionalPreferences.length > 0) && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                {/* Theme Controls */}
                {themeControls && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Theme
                    </div>
                    <div className="flex items-center gap-1" role="group" aria-label="Theme toggle">
                      <Button
                        variant={themeControls.currentTheme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2 text-xs"
                        aria-pressed={themeControls.currentTheme === 'light'}
                        aria-label="Light theme"
                        title="Light"
                        onClick={() => themeControls.setTheme('light')}
                      >
                        <Sun className="h-3 w-3 mr-1" />
                        Light
                      </Button>

                      <Button
                        variant={themeControls.currentTheme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2 text-xs"
                        aria-pressed={themeControls.currentTheme === 'dark'}
                        aria-label="Dark theme"
                        title="Dark"
                        onClick={() => themeControls.setTheme('dark')}
                      >
                        <Moon className="h-3 w-3 mr-1" />
                        Dark
                      </Button>

                      <Button
                        variant={themeControls.theme === 'system' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2 text-xs"
                        aria-pressed={themeControls.theme === 'system'}
                        aria-label="System theme"
                        title="System"
                        onClick={() => themeControls.setTheme('system')}
                      >
                        <Laptop className="h-3 w-3 mr-1" />
                        Auto
                      </Button>
                    </div>
                  </div>
                )}

                {/* Additional Preferences */}
                {additionalPreferences.map((preference, index) => (
                  <div key={index} className={cn("space-y-2", themeControls && "mt-4")}>
                    {preference}
                  </div>
                ))}
              </div>
            )}
            
            {/* User List */}
            {users.map((user) => (
              <button
                key={user.id}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm",
                  "flex items-center gap-2",
                  user.id === currentUserId && "bg-blue-50 dark:bg-blue-900/20"
                )}
                onClick={() => handleUserSelect(user.id)}
              >
                <ProfilePicture
                  src={user.profilePicture}
                  name={user.name}
                  size="sm"
                />
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="font-medium">
                    {user.name}
                  </span>
                  {user.isSystemUser && (
                    <Crown className="w-3 h-3 opacity-60" />
                  )}
                  {user.isSystemUser && (
                    <span className="text-xs opacity-60">
                      (System)
                    </span>
                  )}
                </div>
              </button>
            ))}
            
            {users.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No users available
              </div>
            )}

            {/* Guest Mode Option */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <button
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm",
                "flex items-center gap-2",
                currentUserId === 'guest' && "bg-orange-50 dark:bg-orange-900/20"
              )}
              onClick={() => handleUserSelect('guest')}
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                G
              </div>
              <div className="flex items-center gap-1.5 flex-1">
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  Guest Mode
                </span>
                <span className="text-xs opacity-60">
                  (Anonymous)
                </span>
              </div>
            </button>

            {/* Management Actions */}
            {showManagementActions && (
              <>
                {/* Separator */}
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                {onCreateUser && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm text-blue-600 dark:text-blue-400 flex items-center gap-2"
                    onClick={() => handleUserSelect('action:create-user')}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New User</span>
                  </button>
                )}

                {currentUser && onEditUser && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm text-green-600 dark:text-green-400 flex items-center gap-2"
                    onClick={() => handleUserSelect('action:edit-current')}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}

                {onManageUsers && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm text-purple-600 dark:text-purple-400 flex items-center gap-2"
                    onClick={() => handleUserSelect('action:manage-users')}
                  >
                    <Users className="w-4 h-4" />
                    <span>Manage All Users</span>
                  </button>
                )}

                {/* Logout Button */}
                {onLogout && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm text-red-600 dark:text-red-400 flex items-center gap-2"
                      onClick={() => {
                        setIsOpen(false);
                        onLogout();
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Export for easy importing
export default CompactUserSelector;

// Example usage:
// import { CompactUserSelector } from '@/components/ui/compact-user-selector';
// import { useTheme } from 'next-themes';
// 
// const { theme, setTheme, systemTheme } = useTheme();
// const themeControls = {
//   theme,
//   setTheme,
//   systemTheme,
//   currentTheme: theme === 'system' ? systemTheme : theme
// };
//
// <CompactUserSelector
//   users={users}
//   currentUserId={currentUser?.id}
//   onUserSelect={handleUserSelect}
//   onCreateUser={handleCreateUser}     // Optional
//   onEditUser={handleEditUser}         // Optional
//   onManageUsers={handleManageUsers}   // Optional
//   themeControls={themeControls}       // Optional, for theme switching
//   showManagementActions={true}        // Optional, default: true
//   showUserPreferences={true}          // Optional, default: true
//   additionalPreferences={[]}          // Optional, for future preferences
//   disabled={false}                    // Optional, default: false
//   className="custom-class"            // Optional
// />