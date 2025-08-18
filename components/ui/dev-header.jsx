/**
 * DevHeader Component
 * Reusable developer header for all dev pages under app/dev/
 * 
 * Features:
 * - Hamburger menu button (activates same left tray as app-header)
 * - "The Stack | D.O.C" title with "Developer Operations Center" subtitle
 * - User profile switcher for testing with different user types
 * - Theme toggle on the right
 * - Extensible right controls for page-specific actions
 * - Consistent with app-header styling but dev-focused
 */

'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CompactUserSelector } from '@/components/ui/compact-user-selector';
import { Menu } from 'lucide-react';
import { THEME, getThemeClasses, UI_HEIGHTS } from '@/lib/utils/ui-constants';
import { useTheme } from 'next-themes';
import { useUserManagement } from '@/lib/hooks/useUserManagement';

const TOOLBAR_H = UI_HEIGHTS.toolbar;
const DIVIDER_MX = 'mx-6';
const HEADER_SIDE_GAP = 'gap-3';

export function DevHeader({
  // Tray control
  onOpenTray,
  
  // Page-specific actions (rendered in right controls area)
  rightControls,
  
  // Customization
  title = "Developer Operations Center",
  subtitle = "See the inside of The Stack",
  
  // User management (optional overrides)
  showUserSelector = true,
  onCreateUser: onCreateUserOverride,
  onEditUser: onEditUserOverride,
  onManageUsers: onManageUsersOverride,
  
  // Additional styling
  className = "",
}) {
  // Use unified user management hook
  const {
    allUsers,
    currentUser,
    handleUserSelect,
    handleCreateUser,
    handleEditUser,
    handleManageUsers,
    updateGuestPreferences,
    isGuestMode,
    provisionedGuest,
  } = useUserManagement();

  // Theme controls
  const { theme, setTheme, systemTheme } = useTheme();
  
  // Enhanced theme controls that handle both regular users and guests
  const handleThemeChange = useCallback((newTheme) => {
    if (isGuestMode && updateGuestPreferences) {
      // Update guest preferences
      updateGuestPreferences({ theme: newTheme });
    }
    // Always update the global theme
    setTheme(newTheme);
  }, [isGuestMode, updateGuestPreferences, setTheme]);
  
  const themeControls = {
    theme,
    setTheme: handleThemeChange,
    systemTheme,
    currentTheme: theme === 'system' ? systemTheme : theme
  };

  // Use override handlers if provided, otherwise use defaults from hook
  const onCreateUser = onCreateUserOverride || handleCreateUser;
  const onEditUser = onEditUserOverride || handleEditUser;
  const onManageUsers = onManageUsersOverride || handleManageUsers;
  return (
    <header className={`${THEME.colors.background.primary} border-b ${THEME.colors.border.primary} px-6 py-3 ${THEME.shadows.sm} ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left: Hamburger + Title */}
        <div className={`flex items-center ${HEADER_SIDE_GAP}`}>
          {onOpenTray && (
            <Button
              variant="outline"
              size="icon"
              className={`h-[${TOOLBAR_H}px] w-[${TOOLBAR_H}px]`}
              title="Open menu"
              onClick={onOpenTray}
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className={`text-2xl font-bold ${THEME.colors.text.primary}`}>{title}</h1>
            {subtitle && (
              <p className={`text-xs ${THEME.colors.text.muted}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right groups - User selector has highest priority */}
        <div className="flex items-center min-w-0 flex-1 justify-end gap-0">
          {/* Page-specific controls */}
          {rightControls && (
            <>
              {/* Divider */}
              <span className={`h-6 w-px bg-zinc-300 dark:bg-zinc-600 ${DIVIDER_MX}`} />
              
              {/* Custom controls */}
              <div className="flex items-center gap-2">
                {rightControls}
              </div>
            </>
          )}

          {/* User Selector - ALWAYS VISIBLE - Highest priority */}
          {showUserSelector && allUsers && allUsers.length > 0 && (
            <>
              {/* Divider */}
              <span className={`h-6 w-px bg-zinc-300 dark:bg-zinc-600 ${DIVIDER_MX}`} />
              
              {/* Compact User Selector - Fixed width, never shrinks */}
              <div className="flex-shrink-0 w-[50px]">
                <CompactUserSelector
                  users={allUsers.filter(u => !u.isGuest)}
                  currentUserId={currentUser?.id}
                  currentUser={currentUser}
                  provisionedGuest={provisionedGuest}
                  onUserSelect={handleUserSelect}
                  onCreateUser={onCreateUser}
                  onEditUser={onEditUser}
                  onManageUsers={onManageUsers}
                  themeControls={themeControls}
                  showManagementActions={true}
                  showUserPreferences={true}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}