/**
 * UserSelector Component
 * 
 * A specialized selector for choosing users with proper display of user information
 * 
 * Features:
 * - Displays user names with system user indicators
 * - Shows user preferences (theme) as additional context
 * - Supports current user highlighting
 * - Keyboard accessible via Radix Select
 */

'use client';

import { User, Crown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function UserSelector({
  users = [],
  currentUserId,
  onUserSelect,
  placeholder = "Select user...",
  className,
  size = "default",
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
    <Select
      value={currentUserId || ''}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-fit min-w-[180px]", className)} size={size}>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 opacity-70" />
          <SelectValue placeholder={placeholder}>
            {currentUser && (
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {currentUser.name}
                  {currentUser.isSystemUser && (
                    <Crown className="w-3 h-3 ml-1 inline opacity-60" />
                  )}
                </span>
                {currentUser.preferences?.theme && (
                  <span className="text-xs opacity-60 capitalize">
                    ({currentUser.preferences.theme})
                  </span>
                )}
              </div>
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex items-center gap-2 w-full">
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
      </SelectContent>
    </Select>
  );
}

/**
 * Compact UserSelector - minimal version for tight spaces
 */
export function CompactUserSelector({
  users = [],
  currentUserId,
  onUserSelect,
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
    <Select
      value={currentUserId || ''}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-fit min-w-[120px]", className)} size="sm">
        <div className="flex items-center gap-1.5">
          <User className="w-3 h-3 opacity-70" />
          <SelectValue placeholder="User">
            {currentUser && (
              <span className="text-sm">
                {currentUser.name}
                {currentUser.isSystemUser && (
                  <Crown className="w-2.5 h-2.5 ml-1 inline opacity-60" />
                )}
              </span>
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex items-center gap-1.5">
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
  );
}