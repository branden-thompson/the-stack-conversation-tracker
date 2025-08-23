/**
 * Universal Dev Header Component
 * Professional development header with consolidated controls and theme isolation
 * 
 * Features:
 * - Hamburger menu integration with app tray system
 * - "Stack DevOps" professional branding
 * - Test Coverage Control Group (Run Tests + Export All Data)
 * - Info/Help Group for consistency with app-header
 * - User Profile Selector with theme isolation
 * - Icon-only buttons for layout decluttering
 * - Full theme awareness and user mode isolation
 */

'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CompactUserSelector } from '@/components/ui/compact-user-selector';
import { InfoDialog } from '@/components/ui/info-dialog';
import { ColorThemeSelector } from '@/components/ui/color-theme-selector';
import { useTheme } from 'next-themes';
import { useAppTheme, useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';
import { useUserManagement } from '@/lib/hooks/useUserManagement';
import { cn } from '@/lib/utils';
import { 
  Menu,
  Play,
  FileDown,
  HelpCircle,
  Info,
  Sparkles
} from 'lucide-react';
import { UI_HEIGHTS } from '@/lib/utils/ui-constants';

const TOOLBAR_H = UI_HEIGHTS.toolbar;
const DIVIDER_MX = 'mx-2 lg:mx-3';
const HEADER_SIDE_GAP = 'gap-2 sm:gap-3';

export function UniversalDevHeader({
  // Tray control
  onOpenTray,
  
  // Test coverage actions
  onRunTests,
  onExportAllData,
  
  // Help actions
  onOpenHelp,
  
  // Customization
  title = "Stack DevOps",
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

  // Theme controls with full theme isolation
  const { theme, setTheme, systemTheme } = useTheme();
  const { colorTheme, setColorTheme } = useAppTheme();
  const dynamicTheme = useDynamicAppTheme();
  
  // Enhanced theme controls that handle both regular users and guests (theme isolation)
  const handleThemeChange = useCallback((newTheme) => {
    if (isGuestMode && updateGuestPreferences) {
      // Update guest preferences for theme isolation
      updateGuestPreferences({ theme: newTheme });
    }
    // Always update the global theme
    setTheme(newTheme);
  }, [isGuestMode, updateGuestPreferences, setTheme]);

  // Color theme change handler
  const handleColorThemeChange = useCallback((newColorTheme) => {
    if (isGuestMode && updateGuestPreferences) {
      // Update guest preferences for color theme isolation
      updateGuestPreferences({ colorTheme: newColorTheme });
    }
    setColorTheme(newColorTheme);
  }, [isGuestMode, updateGuestPreferences, setColorTheme]);
  
  const themeControls = {
    theme,
    setTheme: handleThemeChange,
    systemTheme,
    currentTheme: theme === 'system' ? systemTheme : theme
  };

  // Theme-aware button classes that override ShadCN defaults
  const buttonClasses = {
    // Outline buttons for all dev header actions (icon-only design)
    outline: `bg-transparent ${dynamicTheme.colors.text.secondary} border ${dynamicTheme.colors.border.secondary} ${dynamicTheme.colors.background.hover}`
  };

  // Use override handlers if provided, otherwise use defaults from hook
  const onCreateUser = onCreateUserOverride || handleCreateUser;
  const onEditUser = onEditUserOverride || handleEditUser;
  const onManageUsers = onManageUsersOverride || handleManageUsers;

  const iconBtnClass = `h-[${TOOLBAR_H}px] w-[${TOOLBAR_H}px] p-0 leading-none`;

  return (
    <header className={`${dynamicTheme.colors.background.header} border-b ${dynamicTheme.colors.border.secondary} px-3 sm:px-4 lg:px-6 py-2 lg:py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left: Hamburger + Professional Dev Title */}
        <div className={`flex items-center ${HEADER_SIDE_GAP}`}>
          {onOpenTray && (
            <Button
              variant="outline"
              size="icon"
              className={`h-[${TOOLBAR_H}px] w-[${TOOLBAR_H}px] ${buttonClasses.outline} cursor-pointer`}
              title="Open menu"
              aria-label="Open menu"
              onClick={onOpenTray}
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold ${dynamicTheme.colors.text.primary} truncate`}>
                {title}
              </h1>
              {isGuestMode && (
                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
                  Guest Mode
                </span>
              )}
            </div>
            {subtitle && (
              <p className={`text-xs ${dynamicTheme.colors.text.tertiary} truncate`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right groups - User selector has highest priority */}
        <div className="flex items-center min-w-0 flex-1 justify-end gap-0">

          {/* Test Coverage Control Group */}
          {(onRunTests || onExportAllData) && (
            <>
              {/* Divider */}
              <span className={`h-6 w-px ${dynamicTheme.colors.background.divider} ${DIVIDER_MX}`} />

              {/* Test Coverage Controls - Icon-only for decluttering */}
              <div className="flex items-center gap-2">
                {/* Run Tests */}
                {onRunTests && (
                  <Button
                    onClick={onRunTests}
                    variant="outline"
                    title="Run Test Suite"
                    aria-label="Run Test Suite"
                    className={`${iconBtnClass} ${buttonClasses.outline} cursor-pointer`}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}

                {/* Export All Data */}
                {onExportAllData && (
                  <Button
                    onClick={onExportAllData}
                    variant="outline"
                    title="Export Full Report"
                    aria-label="Export Full Report"
                    className={`${iconBtnClass} ${buttonClasses.outline} cursor-pointer`}
                  >
                    <FileDown className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Info & Help Group - Mirror app-header for consistency */}
          <>
            {/* Divider */}
            <span className={`h-6 w-px ${dynamicTheme.colors.background.divider} ${DIVIDER_MX}`} />
            
            {/* Info & Help controls */}
            <div className="flex items-center gap-2">
              {/* Info Dialog - App version and GitHub */}
              <InfoDialog 
                size="icon"
                className={`${iconBtnClass} ${buttonClasses.outline}`}
              />
              
              {/* Help - Icon-only design */}
              {onOpenHelp && (
                <Button
                  onClick={onOpenHelp}
                  variant="outline"
                  title="Help and keyboard shortcuts"
                  aria-label="Help and keyboard shortcuts"
                  className={`${iconBtnClass} ${buttonClasses.outline} cursor-pointer`}
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </>

          {/* User Selector - ALWAYS VISIBLE - Highest priority with theme isolation */}
          {showUserSelector && allUsers && allUsers.length > 0 && (
            <>
              {/* Divider */}
              <span className={`h-6 w-px ${dynamicTheme.colors.background.divider} ${DIVIDER_MX}`} />

              {/* Compact User Selector - Fixed width, never shrinks, with theme isolation */}
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
                  additionalPreferences={[
                    // Color theme selector - positioned below Light/Dark/System for consistency
                    <div key="color-theme" className="space-y-2">
                      <ColorThemeSelector
                        currentColorTheme={colorTheme}
                        currentTheme={theme === 'system' ? systemTheme : theme}
                        systemTheme={systemTheme}
                        onColorThemeChange={handleColorThemeChange}
                      />
                    </div>
                  ]}
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