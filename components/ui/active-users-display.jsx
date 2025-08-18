/**
 * ActiveUsersDisplay Component
 * Shows active users with profile images, smart grouping, and tooltips
 * Designed for app-level pages only (not dev pages)
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { ProfilePicture } from '@/components/ui/profile-picture';
import { UserProfileTooltip } from '@/components/ui/user-profile-tooltip';
import { OverflowTooltip } from '@/components/ui/overflow-tooltip';
import { useStableActiveUsers } from '@/lib/hooks/useStableActiveUsers';
import { cn } from '@/lib/utils';
import { APP_THEME, ANIMATION } from '@/lib/utils/ui-constants';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

// Responsive limits for profile display
const DISPLAY_LIMITS = {
  sm: 3,   // Mobile (not used in header)
  md: 5,   // Tablet (not used in header)
  lg: 3,   // Desktop - conservative for header space
  xl: 4,   // Large desktop - a bit more space
  '2xl': 5, // Extra large - more space available
};

export function ActiveUsersDisplay({ 
  className,
  size = 'sm',
  showLabel = true,
  maxVisible,
}) {
  const [hoveredUser, setHoveredUser] = useState(null);
  const [showOverflow, setShowOverflow] = useState(false);
  const dynamicTheme = useDynamicAppTheme();
  
  // Use optimized stable active users hook
  const {
    activeUsers,
    loading,
    error,
    visibleUsers,
    overflowUsers,
    hasOverflow,
    getPerformanceStats
  } = useStableActiveUsers({
    maxVisible,
    pollInterval: 5000
  });
  
  // Performance monitoring - disabled by default
  const logPerformanceStats = useCallback(() => {
    // Performance stats can be accessed via getPerformanceStats() if needed
  }, [getPerformanceStats]);
  
  // Optional: Log performance stats periodically (can be removed)
  useMemo(() => {
    logPerformanceStats();
  }, [activeUsers.length, logPerformanceStats]);
  
  // Don't render if no active users or in error state
  if (loading || error || activeUsers.length === 0) {
    return null;
  }
  
  return (
    <div className={cn(
      "flex flex-col items-start gap-1 px-2",
      className
    )}>
      {/* Label */}
      {showLabel && (
        <div className="flex items-start">
          <span className={cn(
            "text-xs font-medium",
            dynamicTheme.colors.text.tertiary
          )}>
            Active Stackers:
          </span>
        </div>
      )}
      
      {/* User Profiles */}
      <div className="flex items-center justify-start -space-x-2 min-w-0">
        {visibleUsers.map((user) => (
          <div
            key={user._stableKey || user.id}
            className="relative"
            onMouseEnter={() => setHoveredUser(user)}
            onMouseLeave={() => setHoveredUser(null)}
          >
            <ProfilePicture
              src={user.profilePicture}
              name={user.name}
              size={size}
              className={cn(
                "border-2 border-white dark:border-gray-800",
                "cursor-pointer transition-transform hover:scale-110 hover:z-10",
                "ring-2 ring-green-500 ring-opacity-50", // Active indicator
                // GPU acceleration classes
                "will-change-transform backface-visibility-hidden transform-gpu"
              )}
            />
            
            {/* Tooltip */}
            {hoveredUser?.id === user.id && (
              <UserProfileTooltip
                user={user}
                position="bottom"
                className="absolute top-full right-0 mt-2 z-50"
              />
            )}
          </div>
        ))}
        
        {/* Overflow indicator */}
        {hasOverflow && (
          <div
            className="relative"
            onMouseEnter={() => setShowOverflow(true)}
            onMouseLeave={() => setShowOverflow(false)}
          >
            <div className={cn(
              "flex items-center justify-center",
              "w-8 h-8 rounded-full", // Same as ProfilePicture 'sm'
              "border-2 border-white dark:border-gray-800",
              "bg-gray-100 dark:bg-gray-700",
              "text-xs font-medium cursor-pointer",
              "transition-transform hover:scale-110 hover:z-10",
              dynamicTheme.colors.text.secondary
            )}>
              +{overflowUsers.length}
            </div>
            
            {/* Overflow Tooltip */}
            {showOverflow && (
              <OverflowTooltip
                users={overflowUsers}
                position="bottom"
                className="absolute top-full right-0 mt-2 z-50"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}