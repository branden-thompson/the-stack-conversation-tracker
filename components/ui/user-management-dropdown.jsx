/**
 * UserManagementDropdown Component
 * 
 * Enhanced user selector with user management options
 * 
 * Features:
 * - User switching (like UserSelector)
 * - "Manage Users" option to open profile management
 * - "Create New User" option
 * - "Edit Current User" option
 * - Separation between user selection and management actions
 */

'use client';

import { useState } from 'react';
import { User, Crown, Settings, Plus, Users, Edit3 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ProfilePicture } from '@/components/ui/profile-picture';

export function UserManagementDropdown({
  users = [],
  currentUserId,
  onUserSelect,
  onCreateUser,
  onEditUser,
  onManageUsers,
  placeholder = "Select user...",
  className,
  size = "default",
  disabled = false,
}) {
  const currentUser = users.find(user => user.id === currentUserId);

  const handleValueChange = (value) => {
    // Handle special management actions
    if (value.startsWith('action:')) {
      const action = value.replace('action:', '');
      
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
      return; // Don't change the actual selection
    }

    // Handle normal user selection
    const selectedUser = users.find(user => user.id === value);
    if (selectedUser && onUserSelect) {
      onUserSelect(selectedUser);
    }
  };

  return (
    <Select
      value={currentUserId || ''}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-fit min-w-[180px]", className)} size={size}>
        <div className="flex items-center gap-2">
          <SelectValue placeholder={placeholder}>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <ProfilePicture
                  src={currentUser.profilePicture}
                  name={currentUser.name}
                  size="sm"
                />
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {currentUser.name}
                  </span>
                  {currentUser.isSystemUser && (
                    <Crown className="w-3 h-3 opacity-60" />
                  )}
                  {currentUser.preferences?.theme && (
                    <span className="text-xs opacity-60 capitalize">
                      ({currentUser.preferences.theme})
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 opacity-70" />
                <span>{placeholder}</span>
              </div>
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {/* User List */}
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex items-center gap-2 w-full">
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
              </div>
              {user.preferences?.theme && (
                <span className="text-xs opacity-60 capitalize ml-auto">
                  {user.preferences.theme}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
        
        {users.length === 0 && (
          <SelectItem value="no-users" disabled>
            <span className="text-muted-foreground">No users available</span>
          </SelectItem>
        )}

        {/* Separator */}
        <SelectSeparator />

        {/* Management Actions */}
        <SelectItem value="action:create-user" className="text-blue-600 dark:text-blue-400">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Create New User</span>
          </div>
        </SelectItem>

        {currentUser && (
          <SelectItem value="action:edit-current" className="text-green-600 dark:text-green-400">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </div>
          </SelectItem>
        )}

        <SelectItem value="action:manage-users" className="text-purple-600 dark:text-purple-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Manage All Users</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

/**
 * Simplified version that just adds a manage button next to the user selector
 */
export function UserSelectorWithManagement({
  users = [],
  currentUserId,
  onUserSelect,
  onManageUsers,
  className,
  disabled = false,
}) {
  const currentUser = users.find(user => user.id === currentUserId);

  const handleValueChange = (userId) => {
    const selectedUser = users.find(user => user.id === userId);
    if (selectedUser && onUserSelect) {
      onUserSelect(selectedUser);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={currentUserId || ''}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-fit min-w-[140px]" size="sm">
          <div className="flex items-center gap-2">
            <SelectValue placeholder="User">
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <ProfilePicture
                    src={currentUser.profilePicture}
                    name={currentUser.name}
                    size="xs"
                  />
                  <span className="font-medium">
                    {currentUser.name}
                    {currentUser.isSystemUser && (
                      <Crown className="w-3 h-3 ml-1 inline opacity-60" />
                    )}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 opacity-70" />
                  <span>User</span>
                </div>
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center gap-1.5">
                <ProfilePicture
                  src={user.profilePicture}
                  name={user.name}
                  size="xs"
                />
                <span className="text-sm">
                  {user.name}
                </span>
                {user.isSystemUser && (
                  <Crown className="w-2.5 h-2.5 opacity-60" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        onClick={onManageUsers}
        disabled={disabled}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Manage users"
      >
        <Settings className="w-4 h-4 opacity-70" />
      </button>
    </div>
  );
}