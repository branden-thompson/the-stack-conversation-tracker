/**
 * AppHeader Component
 * Reusable application header with conversation controls and app actions
 * 
 * Features:
 * - Hamburger menu button
 * - App title and description
 * - Theme toggle
 * - Current user context display
 * - App control buttons (Help, Reset, Refresh, New Card)
 * - Real-time conversation status display
 * - Conversation controls (Start/Resume, Pause, Stop)
 * - All conversation state flows to Dev Page
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CompactUserSelector } from '@/components/ui/compact-user-selector';
import { ConversationControls } from '@/components/ui/conversation-controls';
import { ActiveUsersDisplay } from '@/components/ui/active-users-display';
import { ColorThemeSelector } from '@/components/ui/color-theme-selector';
import { InfoDialog } from '@/components/ui/info-dialog';
import { ClearBoardDialog } from '@/components/ui/clear-board-dialog';
import { useTheme } from 'next-themes';
import { useAppTheme, useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  RefreshCw, 
  HelpCircle, 
  PanelsRightBottom, // Changed from Maximize2
  Trash2, // New for clear board
  Info, // New for info dialog
  Bell, // New for notifications
  Menu, 
  Play, 
  Pause as PauseIcon, 
  Square, 
  MoreHorizontal,
  MessageCircle,
  Sparkles // For animations toggle
} from 'lucide-react';
import { UI_HEIGHTS, APP_THEME } from '@/lib/utils/ui-constants';

const TOOLBAR_H = UI_HEIGHTS.toolbar;
const DIVIDER_MX = 'mx-2 lg:mx-3';
const HEADER_SIDE_GAP = 'gap-2 sm:gap-3';

export function AppHeader({
  // Tray control
  onOpenTray,
  
  // App actions
  onOpenHelp,
  onOpenNewCard,
  onResetLayout,
  onRefreshCards,
  onClearBoard, // New callback for clear board functionality
  
  // Conversation data
  activeConversation = null,
  runtime = '00:00:00',
  
  // Conversation controls
  onConversationStart,
  onConversationPause,
  onConversationResumeOrStart,
  onConversationStop,
  
  // User context
  users = [],
  currentUser = null,
  onUserSelect,
  onCreateUser,
  onEditUser,
  onManageUsers,
  
  // Animation preferences
  animationsEnabled = true,
  onAnimationsToggle,
  
  // Guest mode
  isGuestMode = false,
  sessionTimeRemaining = 0,
  guestCount = 0,
  updateGuestPreferences,
  provisionedGuest = null,
  
  // Customization
  title = "The Stack",
  subtitle = "Conversation tracking and facilitation",
  showConversationControls = true,
  showAppActions = true,
  showUserContext = true,
}) {
  // DEBUGGING: Track AppHeader render cycles to verify fix
  const renderTimestamp = Date.now();
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  
  // AppHeader render tracking available in dev tools
  // Overflow menu state
  const [isAppOverflowOpen, setIsAppOverflowOpen] = useState(false);
  const [isConversationOverflowOpen, setIsConversationOverflowOpen] = useState(false);
  const appOverflowRef = useRef(null);
  const conversationOverflowRef = useRef(null);

  // Close overflow menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (appOverflowRef.current && !appOverflowRef.current.contains(event.target)) {
        setIsAppOverflowOpen(false);
      }
      if (conversationOverflowRef.current && !conversationOverflowRef.current.contains(event.target)) {
        setIsConversationOverflowOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const actionBtnClass = `h-[${TOOLBAR_H}px] leading-none`;
  const iconBtnClass = `h-[${TOOLBAR_H}px] w-[${TOOLBAR_H}px] p-0 leading-none`;
  const { theme, setTheme, systemTheme } = useTheme();
  const { colorTheme, setColorTheme } = useAppTheme();
  const dynamicTheme = useDynamicAppTheme();
  
  // Theme-aware button classes that override ShadCN defaults
  const buttonClasses = {
    // Primary button for main actions
    default: `${dynamicTheme.colors.background.accent} ${dynamicTheme.colors.text.primary} border ${dynamicTheme.colors.border.primary} ${dynamicTheme.colors.background.hover}`,
    // Outline buttons for secondary actions
    outline: `bg-transparent ${dynamicTheme.colors.text.secondary} border ${dynamicTheme.colors.border.secondary} ${dynamicTheme.colors.background.hover}`
  };
  
  // Enhanced theme controls that handle both regular users and guests
  const handleThemeChange = useCallback((newTheme) => {
    if (isGuestMode && updateGuestPreferences) {
      // Update guest preferences
      updateGuestPreferences({ theme: newTheme });
    }
    // Always update the global theme
    setTheme(newTheme);
  }, [isGuestMode, updateGuestPreferences, setTheme]);

  // Color theme change handler
  const handleColorThemeChange = useCallback((newColorTheme) => {
    setColorTheme(newColorTheme);
  }, [setColorTheme]);
  
  const themeControls = {
    theme,
    setTheme: handleThemeChange,
    systemTheme,
    currentTheme: theme === 'system' ? systemTheme : theme
  };

  return (
    <header className={`${dynamicTheme.colors.background.header} border-b ${dynamicTheme.colors.border.secondary} px-3 sm:px-4 lg:px-6 py-2 lg:py-3`}>
      <div className="flex items-center justify-between">
        {/* Left: Hamburger + Title */}
        <div className={`flex items-center ${HEADER_SIDE_GAP}`}>
          {onOpenTray && (
            <Button
              variant="outline"
              size="icon"
              className={`h-[${TOOLBAR_H}px] w-[${TOOLBAR_H}px] ${buttonClasses.outline} cursor-pointer`}
              title="Open menu"
              onClick={onOpenTray}
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <div className="min-w-0 hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold ${dynamicTheme.colors.text.primary} truncate`}>
                {title}
              </h1>
              {isGuestMode && (
                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
                  Guest Mode
                </span>
              )}
              {guestCount > 1 && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                  {guestCount} guests
                </span>
              )}
            </div>
            {subtitle && (
              <p className={`text-xs ${dynamicTheme.colors.text.tertiary} hidden sm:block truncate`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right groups - User selector has highest priority */}
        <div className="flex items-center min-w-0 flex-1 justify-end gap-0">


          {showAppActions && (
            <>
              {/* Divider */}
              <span className={`h-6 w-px ${dynamicTheme.colors.background.divider} ${DIVIDER_MX}`} />

              {/* Card Controls Group - Reorganized for v1.0 */}
              <div className="flex items-center gap-2">
                {/* New Card - Always visible, most important action */}
                {onOpenNewCard && (
                  <Button
                    onClick={onOpenNewCard}
                    className={`${actionBtnClass} ${buttonClasses.default} !border-2 !${dynamicTheme.colors.border.strong} cursor-pointer`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">New Card</span>
                    <span className="sm:hidden sr-only">New Card</span>
                  </Button>
                )}

                {/* Refresh Board - Renamed from Refresh Cards */}
                {onRefreshCards && (
                  <Button
                    onClick={onRefreshCards}
                    variant="outline"
                    title="Refresh board"
                    aria-label="Refresh board"
                    className={`hidden lg:flex ${iconBtnClass} ${buttonClasses.outline} cursor-pointer`}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}

                {/* Reset Layout - Updated icon */}
                {onResetLayout && (
                  <Button
                    onClick={onResetLayout}
                    variant="outline"
                    title="Reset layout to start sizes"
                    aria-label="Reset layout to start sizes"
                    className={`hidden lg:flex ${iconBtnClass} ${buttonClasses.outline} cursor-pointer`}
                  >
                    <PanelsRightBottom className="w-4 h-4" />
                  </Button>
                )}

                {/* Clear Board - Farthest right, destructive action */}
                {onClearBoard && (
                  <ClearBoardDialog
                    onClearBoard={onClearBoard}
                    size="icon"
                    className={`${iconBtnClass} ${buttonClasses.outline}`}
                  />
                )}

                {/* Overflow menu for card actions on smaller screens */}
                {(onClearBoard || onRefreshCards || onResetLayout) && (
                  <div className="lg:hidden relative" ref={appOverflowRef}>
                    <Button
                      variant="outline"
                      title="More card actions"
                      className={`${iconBtnClass} ${buttonClasses.outline} cursor-pointer`}
                      onClick={() => setIsAppOverflowOpen(!isAppOverflowOpen)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    
                    {isAppOverflowOpen && (
                      <div className={`absolute top-[42px] right-0 z-50 ${dynamicTheme.colors.background.dropdown} rounded-md min-w-[160px]`}>
                        <div className="p-1">
                          {onClearBoard && (
                            <ClearBoardDialog
                              onClearBoard={onClearBoard}
                              trigger={
                                <button
                                  className={`w-full text-left px-3 py-2 text-sm ${dynamicTheme.colors.background.hoverStrong} rounded-sm flex items-center gap-2 cursor-pointer`}
                                  onClick={() => setIsAppOverflowOpen(false)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Clear Board
                                </button>
                              }
                            />
                          )}
                          {onRefreshCards && (
                            <button
                              className={`w-full text-left px-3 py-2 text-sm ${dynamicTheme.colors.background.hoverStrong} rounded-sm flex items-center gap-2 cursor-pointer`}
                              onClick={() => {
                                onRefreshCards();
                                setIsAppOverflowOpen(false);
                              }}
                            >
                              <RefreshCw className="w-4 h-4" />
                              Refresh Board
                            </button>
                          )}
                          {onResetLayout && (
                            <button
                              className={`w-full text-left px-3 py-2 text-sm ${dynamicTheme.colors.background.hoverStrong} rounded-sm flex items-center gap-2 cursor-pointer`}
                              onClick={() => {
                                onResetLayout();
                                setIsAppOverflowOpen(false);
                              }}
                            >
                              <PanelsRightBottom className="w-4 h-4" />
                              Reset Layout
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {showConversationControls && (
            <>
              {/* Divider */}
              <span className={`h-6 w-px ${dynamicTheme.colors.background.divider} ${DIVIDER_MX}`} />

              {/* Mobile/Tablet: Compact Conversation Menu */}
              <div className="relative xl:hidden" ref={conversationOverflowRef}>
                <Button
                  variant="outline"
                  title={activeConversation ? `${activeConversation.name} (${runtime})` : 'No active conversation'}
                  className={`${iconBtnClass} lg:w-auto lg:px-2 xl:px-3 ${
                    activeConversation?.status === 'active' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : activeConversation?.status === 'paused'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : buttonClasses.outline
                  } cursor-pointer`}
                  onClick={() => setIsConversationOverflowOpen(!isConversationOverflowOpen)}
                >
                  <MessageCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    activeConversation?.status === 'active' 
                      ? 'text-green-600' 
                      : activeConversation?.status === 'paused'
                      ? 'text-yellow-600'
                      : dynamicTheme.colors.text.muted
                  }`} />
                  <span className="hidden lg:inline lg:ml-1 xl:ml-2 text-xs xl:text-sm">
                    {activeConversation?.status === 'active' ? 'Active' : 
                     activeConversation?.status === 'paused' ? 'Paused' : 'Start'}
                  </span>
                </Button>
                
                {/* Conversation Menu */}
                {isConversationOverflowOpen && (
                  <div className={`absolute top-[42px] right-0 z-50 ${dynamicTheme.colors.background.dropdown} rounded-md min-w-[200px]`}>
                    <div className="p-2">
                      {/* Status Display */}
                      <div className={`px-2 py-1 text-sm border-b ${dynamicTheme.colors.border.primary} mb-2`}>
                        <div className="font-medium">
                          {activeConversation ? activeConversation.name : 'No active conversation'}
                        </div>
                        <div className={`text-xs ${dynamicTheme.colors.text.muted} font-mono`}>
                          {runtime}
                        </div>
                        {activeConversation && (
                          <div className={`text-xs ${dynamicTheme.colors.status.success.text} mt-1`}>
                            ✓ Events tracking to /dev/convos
                          </div>
                        )}
                      </div>

                      {/* Control Buttons */}
                      <div className="space-y-1">
                        {onConversationResumeOrStart && (
                          <button
                            className={`w-full text-left px-3 py-2 text-sm ${dynamicTheme.colors.background.hoverStrong} rounded-sm flex items-center gap-2 ${
                              activeConversation?.status === 'active' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            onClick={() => {
                              if (activeConversation?.status !== 'active') {
                                onConversationResumeOrStart();
                                setIsConversationOverflowOpen(false);
                              }
                            }}
                            disabled={activeConversation?.status === 'active'}
                          >
                            <Play className="w-4 h-4 text-green-600" />
                            {activeConversation?.status === 'paused' ? 'Resume' : 'Start'}
                          </button>
                        )}

                        {onConversationPause && (
                          <button
                            className={`w-full text-left px-3 py-2 text-sm ${dynamicTheme.colors.background.hoverStrong} rounded-sm flex items-center gap-2 ${
                              activeConversation?.status !== 'active' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            onClick={() => {
                              if (activeConversation?.status === 'active') {
                                onConversationPause();
                                setIsConversationOverflowOpen(false);
                              }
                            }}
                            disabled={activeConversation?.status !== 'active'}
                          >
                            <PauseIcon className="w-4 h-4 text-yellow-600" />
                            Pause
                          </button>
                        )}

                        {onConversationStop && (
                          <button
                            className={`w-full text-left px-3 py-2 text-sm ${dynamicTheme.colors.background.hoverStrong} rounded-sm flex items-center gap-2 ${
                              (!activeConversation || activeConversation.status === 'stopped') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            onClick={() => {
                              if (activeConversation && activeConversation.status !== 'stopped') {
                                onConversationStop();
                                setIsConversationOverflowOpen(false);
                              }
                            }}
                            disabled={!activeConversation || activeConversation.status === 'stopped'}
                          >
                            <Square className="w-4 h-4 text-red-600" />
                            Stop
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop/Ultra-wide: Expanded Conversation Controls */}
              <div className="hidden xl:block">
                <ConversationControls
                  activeConversation={activeConversation}
                  runtime={runtime}
                  onConversationResumeOrStart={onConversationResumeOrStart}
                  onConversationPause={onConversationPause}
                  onConversationStop={onConversationStop}
                />
              </div>
            </>
          )}

          {/* Active-Stackers Group - Enhanced with mobile support */}
          {showConversationControls && (
            <>
              {/* Divider before active users */}
              <span className={`h-6 w-px ${dynamicTheme.colors.background.divider} ${DIVIDER_MX}`} />
              
              {/* Desktop/Tablet: Full Active Users Display */}
              <div className="hidden lg:flex min-w-[120px] xl:min-w-[160px] 2xl:min-w-[200px]">
                <ActiveUsersDisplay 
                  className="w-full"
                  size="sm"
                  showLabel={true}
                  maxVisible={undefined} // Let component determine responsive limits
                />
              </div>
              
              {/* Mobile: Hidden for now - count display to be implemented later */}
              <div className="hidden">
                {/* Mobile count display will be implemented in future iteration */}
              </div>
            </>
          )}

          {/* Info & Help Group - NEW for v1.0 */}
          <>
            {/* Divider before info & help */}
            <span className={`h-6 w-px ${dynamicTheme.colors.background.divider} ${DIVIDER_MX}`} />
            
            {/* Info & Help controls */}
            <div className="flex items-center gap-2">
              {/* Info Dialog - App version and GitHub */}
              <InfoDialog 
                size="icon"
                className={`${iconBtnClass} ${buttonClasses.outline}`}
              />
              
              {/* Help - Moved from Card Controls */}
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
              
              {/* Notifications - Placeholder for future feature */}
              <Button
                variant="outline"
                disabled={true}
                title="Notifications (coming soon)"
                aria-label="Notifications (coming soon)"
                className={`${iconBtnClass} ${buttonClasses.outline} cursor-not-allowed opacity-50`}
              >
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </>

          {/* User Selector - ALWAYS VISIBLE - Highest priority */}
          {showUserContext && users.length > 0 && (
            <>
              {/* Divider */}
              <span className={`h-6 w-px ${dynamicTheme.colors.background.divider} ${DIVIDER_MX}`} />

              {/* Compact User Selector - Fixed width, never shrinks */}
              <div className="flex-shrink-0 w-[50px]">
                <CompactUserSelector
                  users={users}
                  currentUserId={currentUser?.id}
                  currentUser={currentUser}
                  provisionedGuest={provisionedGuest}
                  onUserSelect={onUserSelect}
                  onCreateUser={onCreateUser}
                  onEditUser={onEditUser}
                  onManageUsers={onManageUsers}
                  themeControls={themeControls}
                  additionalPreferences={[
                    // Color theme selector - positioned below Light/Dark/System as specified
                    <div key="color-theme" className="space-y-2">
                      <ColorThemeSelector
                        currentColorTheme={colorTheme}
                        currentTheme={theme === 'system' ? systemTheme : theme}
                        systemTheme={systemTheme}
                        onColorThemeChange={handleColorThemeChange}
                      />
                    </div>,
                    // Animations toggle
                    <div key="animations" className="space-y-2">
                      <div className={`text-xs font-medium ${dynamicTheme.colors.text.tertiary} uppercase tracking-wide`}>
                        Animations
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className={cn(
                            "h-8 px-2 text-xs flex-1 rounded-sm border transition-colors flex items-center justify-center",
                            animationsEnabled 
                              ? `${dynamicTheme.colors.background.accent} ${dynamicTheme.colors.text.primary} border-transparent` 
                              : `bg-transparent ${dynamicTheme.colors.text.secondary} ${dynamicTheme.colors.border.secondary} ${dynamicTheme.colors.background.hover}`
                          )}
                          onClick={() => onAnimationsToggle?.(true)}
                          disabled={!onAnimationsToggle}
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          On
                        </button>
                        <button
                          className={cn(
                            "h-8 px-2 text-xs flex-1 rounded-sm border transition-colors flex items-center justify-center",
                            !animationsEnabled 
                              ? `${dynamicTheme.colors.background.accent} ${dynamicTheme.colors.text.primary} border-transparent` 
                              : `bg-transparent ${dynamicTheme.colors.text.secondary} ${dynamicTheme.colors.border.secondary} ${dynamicTheme.colors.background.hover}`
                          )}
                          onClick={() => onAnimationsToggle?.(false)}
                          disabled={!onAnimationsToggle}
                        >
                          Off
                        </button>
                      </div>
                      {!animationsEnabled && (
                        <p className={`text-[10px] ${dynamicTheme.colors.text.muted}`}>
                          Cards always show face up
                        </p>
                      )}
                    </div>
                  ]}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}