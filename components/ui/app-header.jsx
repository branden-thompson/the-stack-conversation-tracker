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

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CompactUserSelector } from '@/components/ui/compact-user-selector';
import { ConversationControls } from '@/components/ui/conversation-controls';
import { useTheme } from 'next-themes';
import { 
  Plus, 
  RefreshCw, 
  HelpCircle, 
  Maximize2, 
  Menu, 
  Play, 
  Pause as PauseIcon, 
  Square, 
  MoreHorizontal,
  MessageCircle
} from 'lucide-react';
import { UI_HEIGHTS } from '@/lib/utils/ui-constants';

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
  
  // Customization
  title = "The Stack",
  subtitle = "Conversation tracking and facilitation",
  showConversationControls = true,
  showAppActions = true,
  showUserContext = true,
}) {
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
  
  // Prepare theme controls for user selector
  const themeControls = {
    theme,
    setTheme,
    systemTheme,
    currentTheme: theme === 'system' ? systemTheme : theme
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 lg:px-6 py-2 lg:py-3 shadow-sm">
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
          <div className="min-w-0 hidden sm:block">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-600 dark:text-gray-300 hidden sm:block truncate">
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
              <span className={`h-6 w-px bg-gray-200 dark:bg-gray-700 ${DIVIDER_MX}`} />

              {/* App controls */}
              <div className="flex items-center gap-2">
                {/* New Card - Always visible, most important action */}
                {onOpenNewCard && (
                  <Button
                    onClick={onOpenNewCard}
                    className={actionBtnClass}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">New Card</span>
                    <span className="sm:hidden sr-only">New Card</span>
                  </Button>
                )}

                {/* Help - Icon only until very wide screens */}
                {onOpenHelp && (
                  <Button
                    onClick={onOpenHelp}
                    variant="outline"
                    title="Help and keyboard shortcuts"
                    className={`${iconBtnClass} xl:w-auto xl:px-4`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden xl:inline xl:ml-2">Help</span>
                  </Button>
                )}

                {/* Refresh - Hide on smaller screens */}
                {onRefreshCards && (
                  <Button
                    onClick={onRefreshCards}
                    variant="outline"
                    title="Refresh cards"
                    className={`hidden lg:flex ${iconBtnClass} xl:w-auto xl:px-4`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden xl:inline xl:ml-2">Refresh</span>
                  </Button>
                )}

                {/* Reset - Hide on smaller screens */}
                {onResetLayout && (
                  <Button
                    onClick={onResetLayout}
                    variant="outline"
                    title="Reset layout to start sizes"
                    className={`hidden lg:flex ${iconBtnClass} xl:w-auto xl:px-4`}
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="hidden xl:inline xl:ml-2">Reset</span>
                  </Button>
                )}

                {/* Overflow menu for hidden actions on small-medium screens */}
                {(onRefreshCards || onResetLayout) && (
                  <div className="lg:hidden relative" ref={appOverflowRef}>
                    <Button
                      variant="outline"
                      title="More actions"
                      className={iconBtnClass}
                      onClick={() => setIsAppOverflowOpen(!isAppOverflowOpen)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    
                    {isAppOverflowOpen && (
                      <div className="absolute top-[42px] right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[160px]">
                        <div className="p-1">
                          {onRefreshCards && (
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2"
                              onClick={() => {
                                onRefreshCards();
                                setIsAppOverflowOpen(false);
                              }}
                            >
                              <RefreshCw className="w-4 h-4" />
                              Refresh Cards
                            </button>
                          )}
                          {onResetLayout && (
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2"
                              onClick={() => {
                                onResetLayout();
                                setIsAppOverflowOpen(false);
                              }}
                            >
                              <Maximize2 className="w-4 h-4" />
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
              <span className={`h-6 w-px bg-gray-200 dark:bg-gray-700 ${DIVIDER_MX}`} />

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
                      : 'border-gray-300'
                  }`}
                  onClick={() => setIsConversationOverflowOpen(!isConversationOverflowOpen)}
                >
                  <MessageCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    activeConversation?.status === 'active' 
                      ? 'text-green-600' 
                      : activeConversation?.status === 'paused'
                      ? 'text-yellow-600'
                      : 'text-gray-500'
                  }`} />
                  <span className="hidden lg:inline lg:ml-1 xl:ml-2 text-xs xl:text-sm">
                    {activeConversation?.status === 'active' ? 'Active' : 
                     activeConversation?.status === 'paused' ? 'Paused' : 'Start'}
                  </span>
                </Button>
                
                {/* Conversation Menu */}
                {isConversationOverflowOpen && (
                  <div className="absolute top-[42px] right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[200px]">
                    <div className="p-2">
                      {/* Status Display */}
                      <div className="px-2 py-1 text-sm border-b border-gray-200 dark:border-gray-700 mb-2">
                        <div className="font-medium">
                          {activeConversation ? activeConversation.name : 'No active conversation'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {runtime}
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="space-y-1">
                        {onConversationResumeOrStart && (
                          <button
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2 ${
                              activeConversation?.status === 'active' ? 'opacity-50 cursor-not-allowed' : ''
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
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2 ${
                              activeConversation?.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''
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
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2 ${
                              (!activeConversation || activeConversation.status === 'stopped') ? 'opacity-50 cursor-not-allowed' : ''
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

          {/* User Selector - ALWAYS VISIBLE - Highest priority */}
          {showUserContext && users.length > 0 && (
            <>
              {/* Divider */}
              <span className={`h-6 w-px bg-gray-200 dark:bg-gray-700 ${DIVIDER_MX}`} />

              {/* Compact User Selector - Fixed width, never shrinks */}
              <div className="flex-shrink-0 w-[50px]">
                <CompactUserSelector
                  users={users}
                  currentUserId={currentUser?.id}
                  onUserSelect={onUserSelect}
                  onCreateUser={onCreateUser}
                  onEditUser={onEditUser}
                  onManageUsers={onManageUsers}
                  themeControls={themeControls}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}