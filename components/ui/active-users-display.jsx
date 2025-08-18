/**
 * ActiveUsersDisplay Component
 * Shows active users with profile images, smart grouping, and tooltips
 * Designed for app-level pages only (not dev pages)
 */

'use client';

import { useState, useMemo } from 'react';
import { ProfilePicture } from '@/components/ui/profile-picture';
import { UserProfileTooltip } from '@/components/ui/user-profile-tooltip';
import { OverflowTooltip } from '@/components/ui/overflow-tooltip';
import { useUserTracking } from '@/lib/hooks/useUserTracking';
import { useGuestUsers } from '@/lib/hooks/useGuestUsers';
import { cn } from '@/lib/utils';
import { APP_THEME } from '@/lib/utils/ui-constants';
import { SESSION_STATUS } from '@/lib/utils/session-constants';

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
  
  // Get user tracking data
  const { sessions, loading, error } = useUserTracking({
    mode: 'polling',
    pollInterval: 5000, // Update every 5 seconds
  });
  
  // Get user info
  const { allUsers } = useGuestUsers();
  
  // Determine responsive limit
  const getResponsiveLimit = () => {
    if (maxVisible) return maxVisible;
    
    // Default responsive behavior for header display
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return DISPLAY_LIMITS.sm;
      if (width < 768) return DISPLAY_LIMITS.md;
      if (width < 1024) return DISPLAY_LIMITS.lg;
      if (width < 1280) return DISPLAY_LIMITS.xl;
      if (width < 1536) return DISPLAY_LIMITS.xl;
      return DISPLAY_LIMITS['2xl'];
    }
    
    return DISPLAY_LIMITS.lg; // SSR fallback for header
  };
  
  // Filter for active users on app-level pages (not dev pages)
  const activeUsers = useMemo(() => {
    if (!sessions || loading || error) return [];
    
    const allSessions = [
      ...Object.values(sessions.grouped || {}).flat(),
      ...(sessions.guests || [])
    ];
    
    // Filter for active sessions on app-level routes
    const activeAppSessions = allSessions.filter(session => {
      const isActive = session.status === SESSION_STATUS.ACTIVE;
      const isAppRoute = session.currentRoute && !session.currentRoute.startsWith('/dev');
      return isActive && isAppRoute;
    });
    
    // Create user objects with session data
    return activeAppSessions.map(session => {
      const user = allUsers.find(u => u.id === session.userId) || {
        id: session.userId,
        name: session.userName || 'Unknown User',
        profilePicture: session.metadata?.avatar
      };
      
      return {
        ...user,
        session,
        route: session.currentRoute || '/',
        lastAction: session.recentActions?.[0] || null,
        lastActivity: session.lastActivityAt
      };
    })
    // Sort by most recent activity
    .sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0))
    // Remove duplicates (same user, multiple sessions)
    .filter((user, index, arr) => 
      arr.findIndex(u => u.id === user.id) === index
    );
  }, [sessions, allUsers, loading, error]);
  
  const displayLimit = getResponsiveLimit();
  const visibleUsers = activeUsers.slice(0, displayLimit);
  const overflowUsers = activeUsers.slice(displayLimit);
  const hasOverflow = overflowUsers.length > 0;
  
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
            APP_THEME.colors.text.tertiary
          )}>
            Active Stackers:
          </span>
        </div>
      )}
      
      {/* User Profiles */}
      <div className="flex items-center justify-start -space-x-2 min-w-0">
        {visibleUsers.map((user, index) => (
          <div
            key={user.id}
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
                "ring-2 ring-green-500 ring-opacity-50" // Active indicator
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
              APP_THEME.colors.text.secondary
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