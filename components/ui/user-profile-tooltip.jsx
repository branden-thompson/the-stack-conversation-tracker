/**
 * UserProfileTooltip Component
 * Shows detailed information about an active user when hovering their profile
 */

'use client';

import { cn } from '@/lib/utils';
import { APP_THEME, TOOLTIP_POSITIONING } from '@/lib/utils/ui-constants';
import { SESSION_EVENT_LABELS } from '@/lib/utils/session-constants';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';
import { MapPin, Clock, Activity } from 'lucide-react';

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Unknown';
  
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatRoute(route) {
  if (!route || route === '/') return 'Conversation Stack';
  
  // Clean up route display
  const cleanRoute = route.replace(/^\//, '').replace(/\//g, ' › ');
  
  // Handle specific routes
  if (route.startsWith('/timeline')) return 'Timeline';
  if (route.startsWith('/auth')) return 'Authentication';
  if (route.startsWith('/dev')) return 'Developer Tools';
  
  return cleanRoute || 'Conversation Stack';
}

function formatAction(action) {
  if (!action) return 'Browsing';
  
  const label = SESSION_EVENT_LABELS[action.type] || action.type;
  const timeAgo = formatTimeAgo(action.timestamp);
  
  return `${label} • ${timeAgo}`;
}

export function UserProfileTooltip({ 
  user, 
  position = 'bottom',
  className 
}) {
  const dynamicTheme = useDynamicAppTheme();
  
  if (!user) return null;
  
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };
  
  return (
    <div className={cn(
      dynamicTheme.colors.background.dropdown,
      dynamicTheme.colors.border.primary,
      "border rounded-lg shadow-lg",
      "p-3 min-w-[200px] max-w-[280px]",
      "text-sm",
      "z-50",
      positionClasses[position],
      className
    )}>
      {/* Arrow */}
      <div 
        className={cn(
          `absolute w-2 h-2 ${dynamicTheme.colors.background.dropdown} ${dynamicTheme.colors.border.primary}`,
          "border rotate-45",
          position === 'bottom' && "top-0 transform -translate-y-1/2 border-t border-l",
          position === 'top' && "bottom-0 transform translate-y-1/2 border-b border-r",
          position === 'left' && "right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 border-t border-r",
          position === 'right' && "left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-b border-l"
        )}
        style={{
          right: position === 'bottom' || position === 'top' 
            ? TOOLTIP_POSITIONING.profilePictureArrowOffset 
            : undefined
        }}
      />
      
      {/* User Name */}
      <div className={cn(
        "font-semibold mb-2",
        dynamicTheme.colors.text.primary
      )}>
        {user.name}
      </div>
      
      {/* Route Location */}
      <div className={cn(
        "flex items-center gap-2 mb-2",
        dynamicTheme.colors.text.secondary
      )}>
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">
          {formatRoute(user.route)}
        </span>
      </div>
      
      {/* Last Action */}
      <div className={cn(
        "flex items-center gap-2",
        dynamicTheme.colors.text.tertiary
      )}>
        <Activity className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">
          {formatAction(user.lastAction)}
        </span>
      </div>
      
      {/* Session Time */}
      {user.session?.startedAt && (
        <div className={cn(
          "flex items-center gap-2 mt-2 pt-2 border-t",
          "border-gray-200 dark:border-gray-700",
          dynamicTheme.colors.text.muted
        )}>
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs">
            Active {formatTimeAgo(user.session.startedAt)}
          </span>
        </div>
      )}
    </div>
  );
}