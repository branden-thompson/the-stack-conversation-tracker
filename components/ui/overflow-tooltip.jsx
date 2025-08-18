/**
 * OverflowTooltip Component
 * Shows a paginated list of users when clicking the (+nnn) overflow indicator
 * Designed for displaying multiple active users in a condensed format
 */

'use client';

import { useState } from 'react';
import { ProfilePicture } from '@/components/ui/profile-picture';
import { cn } from '@/lib/utils';
import { APP_THEME, TOOLTIP_POSITIONING } from '@/lib/utils/ui-constants';
import { SESSION_EVENT_LABELS } from '@/lib/utils/session-constants';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';
import { MapPin, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

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

export function OverflowTooltip({ 
  users = [], 
  position = 'bottom',
  className,
  pageSize = 8, // Show 8 users per page
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const dynamicTheme = useDynamicAppTheme();
  
  if (!users || users.length === 0) return null;
  
  const totalPages = Math.ceil(users.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, users.length);
  const currentUsers = users.slice(startIndex, endIndex);
  
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800",
      "border border-gray-200 dark:border-gray-700",
      "rounded-lg shadow-lg",
      "p-3 min-w-[300px] max-w-[350px]",
      "text-sm",
      "z-50",
      positionClasses[position],
      className
    )}>
      {/* Arrow */}
      <div 
        className={cn(
          "absolute w-2 h-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          "rotate-45",
          position === 'bottom' && "top-0 transform -translate-y-1/2 border-t border-l",
          position === 'top' && "bottom-0 transform translate-y-1/2 border-b border-r",
          position === 'left' && "right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 border-t border-r",
          position === 'right' && "left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-b border-l"
        )}
        style={{
          right: position === 'bottom' || position === 'top' 
            ? TOOLTIP_POSITIONING.overflowArrowOffset 
            : undefined
        }}
      />
      
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between mb-3 pb-2 border-b",
        "border-gray-200 dark:border-gray-700"
      )}>
        <h3 className={cn(
          "font-semibold",
          dynamicTheme.colors.text.primary
        )}>
          Active Stackers ({users.length})
        </h3>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className={cn(
                "p-1 rounded",
                "transition-colors",
                currentPage === 0 
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            
            <span className={cn(
              "text-xs px-2",
              dynamicTheme.colors.text.tertiary
            )}>
              {currentPage + 1} / {totalPages}
            </span>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className={cn(
                "p-1 rounded",
                "transition-colors",
                currentPage === totalPages - 1 
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      
      {/* User List */}
      <div className="space-y-2">
        {currentUsers.map((user) => (
          <div
            key={user.id}
            className={cn(
              "flex items-center gap-3 p-2 rounded",
              "transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            )}
          >
            {/* Profile Picture */}
            <ProfilePicture
              src={user.profilePicture}
              name={user.name}
              size="xs"
              className="flex-shrink-0"
            />
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              {/* Name */}
              <div className={cn(
                "font-medium truncate",
                dynamicTheme.colors.text.primary
              )}>
                {user.name}
              </div>
              
              {/* Route */}
              <div className={cn(
                "flex items-center gap-1 text-xs truncate",
                dynamicTheme.colors.text.secondary
              )}>
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {formatRoute(user.route)}
                </span>
              </div>
              
              {/* Action */}
              <div className={cn(
                "flex items-center gap-1 text-xs truncate",
                dynamicTheme.colors.text.tertiary
              )}>
                <Activity className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {formatAction(user.lastAction)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      {totalPages > 1 && (
        <div className={cn(
          "mt-3 pt-2 border-t text-center",
          "border-gray-200 dark:border-gray-700"
        )}>
          <span className={cn(
            "text-xs",
            dynamicTheme.colors.text.muted
          )}>
            Showing {startIndex + 1}-{endIndex} of {users.length} users
          </span>
        </div>
      )}
    </div>
  );
}