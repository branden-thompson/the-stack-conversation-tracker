/**
 * ConversationControls Component
 * Expanded conversation status and controls for larger screens
 * 
 * Features:
 * - Timer icon with status-based coloring
 * - Conversation title and running time display
 * - Individual control buttons (Start/Resume, Pause, Stop)
 * - Fixed width container to prevent layout shifts
 */

'use client';

import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause as PauseIcon, 
  Square, 
  Clock3
} from 'lucide-react';
import { UI_HEIGHTS } from '@/lib/utils/ui-constants';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

export function ConversationControls({
  activeConversation = null,
  runtime = '00:00:00',
  onConversationResumeOrStart,
  onConversationPause,
  onConversationStop,
}) {
  const dynamicTheme = useDynamicAppTheme();
  
  // Theme-aware button classes that override ShadCN defaults
  const buttonClasses = {
    outline: `bg-transparent ${dynamicTheme.colors.text.secondary} border ${dynamicTheme.colors.border.secondary} ${dynamicTheme.colors.background.hover}`
  };
  
  return (
    <div className="flex items-center gap-4">
      {/* Timer Icon & Status - Fixed width container */}
      <div className="flex items-center gap-3 min-w-[240px]">
        <Clock3 className={`w-8 h-8 ${
          activeConversation?.status === 'active' 
            ? dynamicTheme.colors.status.success.text
            : activeConversation?.status === 'paused'
            ? dynamicTheme.colors.status.warning.text
            : dynamicTheme.colors.text.muted
        }`} />
        <div className="text-sm">
          <div className={`font-medium ${dynamicTheme.colors.text.primary}`}>
            {activeConversation ? activeConversation.name : 'No active conversation'}
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-xs ${dynamicTheme.colors.text.muted} font-mono`}>
              {runtime}
            </div>
            {activeConversation && (
              <div className={`text-xs ${
                activeConversation.status === 'active' 
                  ? dynamicTheme.colors.status.success.text
                  : activeConversation.status === 'paused'
                  ? dynamicTheme.colors.status.warning.text
                  : dynamicTheme.colors.text.muted
              }`}>
                • {activeConversation.status === 'active' 
                    ? 'Tracking' 
                    : activeConversation.status === 'paused' 
                    ? 'Paused' 
                    : 'Stopped'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Individual Control Buttons */}
      <div className="flex items-center gap-2">
        {/* Start/Resume Button */}
        {onConversationResumeOrStart && (
          <Button
            onClick={onConversationResumeOrStart}
            disabled={activeConversation?.status === 'active'}
            size="sm"
            variant="outline"
            title={activeConversation?.status === 'paused' ? 'Resume conversation' : 'Start conversation'}
            className={`h-[${UI_HEIGHTS.button}px] w-[${UI_HEIGHTS.button}px] p-0 leading-none ${buttonClasses.outline} ${activeConversation?.status === 'active' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Play className="w-3 h-3" />
          </Button>
        )}

        {/* Pause Button */}
        {onConversationPause && (
          <Button
            onClick={onConversationPause}
            disabled={activeConversation?.status !== 'active'}
            size="sm"
            variant="outline"
            title="Pause conversation"
            className={`h-[${UI_HEIGHTS.button}px] w-[${UI_HEIGHTS.button}px] p-0 leading-none ${buttonClasses.outline} ${activeConversation?.status !== 'active' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <PauseIcon className="w-3 h-3" />
          </Button>
        )}

        {/* Stop Button */}
        {onConversationStop && (
          <Button
            onClick={onConversationStop}
            disabled={!activeConversation || activeConversation.status === 'stopped'}
            size="sm"
            variant="outline"
            title="Stop conversation"
            className={`h-[${UI_HEIGHTS.button}px] w-[${UI_HEIGHTS.button}px] p-0 leading-none ${buttonClasses.outline} ${(!activeConversation || activeConversation.status === 'stopped') ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Square className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}