/**
 * AppHeader Component
 * Reusable application header with conversation controls and app actions
 * 
 * Features:
 * - Hamburger menu button
 * - App title and description
 * - Theme toggle
 * - App control buttons (Help, Reset, Refresh, New Card)
 * - Real-time conversation status display
 * - Conversation controls (Start/Resume, Pause, Stop)
 * - All conversation state flows to Dev Page
 */

'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Plus, 
  RefreshCw, 
  HelpCircle, 
  Maximize2, 
  Menu, 
  Play, 
  Pause as PauseIcon, 
  Square, 
  Clock3 
} from 'lucide-react';

const TOOLBAR_H = 40;
const DIVIDER_MX = 'mx-6';
const HEADER_SIDE_GAP = 'gap-3';

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
  
  // Customization
  title = "The Stack",
  subtitle = "Conversation tracking and facilitation",
  showConversationControls = true,
  showAppActions = true,
}) {
  const actionBtnClass = `h-[${TOOLBAR_H}px] leading-none`;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 shadow-sm">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right groups */}
        <div className="flex items-center">
          {/* Theme */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>

          {showAppActions && (
            <>
              {/* Divider */}
              <span className={`h-6 w-px bg-gray-200 dark:bg-gray-700 ${DIVIDER_MX}`} />

              {/* App controls */}
              <div className="flex items-center gap-2">
                {onOpenHelp && (
                  <Button
                    onClick={onOpenHelp}
                    variant="outline"
                    title="Help and keyboard shortcuts"
                    className={actionBtnClass}
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help
                  </Button>
                )}
                {onResetLayout && (
                  <Button
                    onClick={onResetLayout}
                    variant="outline"
                    title="Reset layout to start sizes"
                    className={actionBtnClass}
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
                {onRefreshCards && (
                  <Button
                    onClick={onRefreshCards}
                    variant="outline"
                    className={actionBtnClass}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                )}
                {onOpenNewCard && (
                  <Button
                    onClick={onOpenNewCard}
                    className={actionBtnClass}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Card
                  </Button>
                )}
              </div>
            </>
          )}

          {showConversationControls && (
            <>
              {/* Divider */}
              <span className={`h-6 w-px bg-gray-200 dark:bg-gray-700 ${DIVIDER_MX}`} />

              {/* Conversation status + controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-sm text-gray-800 dark:text-gray-100 mr-3 min-w-[270px]">
                  <Clock3 className="w-4 h-4 mr-2 opacity-80" />
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold">
                      {activeConversation ? activeConversation.name : 'No active conversation'}
                    </span>
                    <span className="font-mono text-xs opacity-80">{runtime}</span>
                  </div>
                </div>

                {onConversationResumeOrStart && (
                  <Button
                    variant="outline"
                    className={actionBtnClass}
                    disabled={activeConversation?.status === 'active'}
                    onClick={onConversationResumeOrStart}
                    title={activeConversation?.status === 'paused' ? 'Resume' : 'Start'}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {activeConversation?.status === 'paused' ? 'Resume' : 'Start'}
                  </Button>
                )}

                {onConversationPause && (
                  <Button
                    variant="outline"
                    className={actionBtnClass}
                    disabled={activeConversation?.status !== 'active'}
                    onClick={onConversationPause}
                    title="Pause"
                  >
                    <PauseIcon className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}

                {onConversationStop && (
                  <Button
                    variant="outline"
                    className={actionBtnClass}
                    disabled={!activeConversation || activeConversation.status === 'stopped'}
                    onClick={onConversationStop}
                    title="Stop"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}