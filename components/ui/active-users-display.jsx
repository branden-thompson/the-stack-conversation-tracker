/**
 * ActiveUsersDisplay Component
 * Shows active users with profile images, smart grouping, and tooltips
 * Designed for app-level pages only (not dev pages)
 */

'use client';

import { useState, useMemo, useCallback, memo, useRef } from 'react';
import { ProfilePicture } from '@/components/ui/profile-picture';
import { UserProfileTooltip } from '@/components/ui/user-profile-tooltip';
import { OverflowTooltip } from '@/components/ui/overflow-tooltip';
import { useStableActiveUsers } from '@/lib/hooks/useStableActiveUsers';
import { useSSEActiveUsers } from '@/lib/hooks/useSSEActiveUsers';
import { useSSEActiveUsersOptimized } from '@/lib/hooks/useSSEActiveUsersOptimized';
import { getEnvironmentConfig } from '@/lib/sse-infrastructure/config/environment-config';
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

const ActiveUsersDisplayComponent = ({ 
  className,
  size = 'sm',
  showLabel = true,
  maxVisible,
}) => {
  // DEBUGGING: Track component render cycles to verify fix
  const renderTimestamp = Date.now();
  const renderCountRef = useRef(0);
  const lastPropsRef = useRef({});
  renderCountRef.current++;
  
  const currentProps = { className, size, showLabel, maxVisible };
  const propsChanged = JSON.stringify(lastPropsRef.current) !== JSON.stringify(currentProps);
  
  console.log(`[ActiveUsersDisplayComponent] Render #${renderCountRef.current} at ${renderTimestamp}`, {
    propsChanged,
    currentProps,
    lastProps: lastPropsRef.current,
    timestamp: renderTimestamp
  });
  
  lastPropsRef.current = currentProps;

  const [hoveredUser, setHoveredUser] = useState(null);
  const [showOverflow, setShowOverflow] = useState(false);
  const dynamicTheme = useDynamicAppTheme();
  
  // Get environment configuration for production-safe operation
  const envConfig = getEnvironmentConfig();
  
  // Phase 4: Detect if we're in SSE mode by checking environment and Phase 4 status
  const isPhase4Enabled = process.env.NEXT_PUBLIC_PHASE4_SSE_ONLY === 'true' || 
                         process.env.NODE_ENV === 'development';
  
  // EMERGENCY FIX: Completely disable optimized SSE to stop API runaway
  const useOptimizedSSE = false; // DISABLED until coordination is fixed
  
  // CRITICAL FIX: Prevent API runaway by ensuring only one hook is active at a time
  const optimizedHookResult = useSSEActiveUsersOptimized({
    maxVisible,
    enabled: isPhase4Enabled && useOptimizedSSE
  });
  
  const sseHookResult = useSSEActiveUsers({
    maxVisible,
    enabled: isPhase4Enabled && !useOptimizedSSE // FIXED: Only enabled when optimization is OFF
  });
  
  const pollingHookResult = useStableActiveUsers({
    maxVisible,
    pollInterval: 5000 // Fallback polling when SSE not available
  });
  
  // Select the appropriate hook result based on optimization testing and Phase 4 status
  const {
    activeUsers,
    loading,
    error,
    visibleUsers,
    overflowUsers,
    hasOverflow,
    getPerformanceStats,
    isSSEConnected,
    connectionMode: hookConnectionMode,
    trackActivity,
    runOptimizationTests,
    systemStatus,
    _optimization
  } = isPhase4Enabled && useOptimizedSSE ? optimizedHookResult :
      isPhase4Enabled ? sseHookResult : pollingHookResult;
  
  // DEBUGGING: Track hook result changes to verify SSE still works after timer fix
  const hookResultRef = useRef(null);
  const currentHookResult = {
    activeUsersCount: activeUsers.length,
    loading,
    error: error?.message || null,
    visibleUsersCount: visibleUsers.length,
    overflowUsersCount: overflowUsers.length,
    hasOverflow,
    isSSEConnected,
    connectionMode: hookConnectionMode
  };
  const hookResultHash = JSON.stringify(currentHookResult);
  const hookResultChanged = hookResultRef.current !== hookResultHash;
  
  if (hookResultChanged) {
    console.log(`[ActiveUsersDisplayComponent] Hook result changed`, {
      renderCount: renderCountRef.current,
      oldResult: hookResultRef.current ? JSON.parse(hookResultRef.current) : null,
      newResult: currentHookResult,
      timestamp: renderTimestamp
    });
    hookResultRef.current = hookResultHash;
  }
  
  const connectionMode = hookConnectionMode || 'polling-fallback';
  const isConnectedViaSSE = isSSEConnected || false;
  const isOptimizedSSE = _optimization?.enabled || false;
  
  // Performance monitoring with Phase 4 SSE tracking
  const logPerformanceStats = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const stats = getPerformanceStats();
      console.log('[ActiveUsersDisplay] Performance Stats:', {
        ...stats,
        connectionMode,
        isSSEConnected: isConnectedViaSSE,
        phase4Enabled: isPhase4Enabled,
        optimizedSSE: isOptimizedSSE,
        hookUsed: isPhase4Enabled && useOptimizedSSE ? 'useSSEActiveUsersOptimized' :
                  isPhase4Enabled ? 'useSSEActiveUsers' : 'useStableActiveUsers',
        systemStatus: systemStatus || 'unknown',
        optimization: _optimization || 'none',
        environment: envConfig.environment.type,
        pollingInterval: envConfig.polling.sessions
      });
    }
  }, [getPerformanceStats, connectionMode, isConnectedViaSSE, isPhase4Enabled]);
  
  // Track user interactions for session activity
  const handleUserInteraction = useCallback((user, action = 'hover') => {
    // Phase 4: Use trackActivity if available from SSE hook, otherwise log for debugging
    if (trackActivity && typeof trackActivity === 'function') {
      trackActivity(`active-users-${action}`);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`[ActiveUsersDisplay] User interaction: ${action} for user ${user.name} (${connectionMode})`);
    }
    
    if (action === 'hover') {
      setHoveredUser(user);
    }
  }, [trackActivity, connectionMode]);
  
  // Log performance stats only when meaningful changes occur
  const prevUserCountRef = useRef(activeUsers.length);
  useMemo(() => {
    // Only log if user count actually changed
    if (prevUserCountRef.current !== activeUsers.length) {
      prevUserCountRef.current = activeUsers.length;
      logPerformanceStats();
    }
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
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-xs font-medium",
            dynamicTheme.colors.text.tertiary
          )}>
            Active Stackers:
          </span>
          {/* Phase 4: Connection mode indicator with optimization status */}
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isOptimizedSSE ? "bg-blue-500" : // Blue for optimized SSE
            isConnectedViaSSE ? "bg-green-500" : "bg-yellow-500"
          )} 
          title={`Phase 4: ${connectionMode.toUpperCase()} mode | ${
            isPhase4Enabled && useOptimizedSSE ? 'Optimized SSE Hook' :
            isPhase4Enabled ? 'SSE Hook' : 'Polling Hook'
          }${isOptimizedSSE ? ' | Infrastructure v' + (_optimization?.version || '1.0.0') : ''}`} />
        </div>
      )}
      
      {/* User Profiles */}
      <div className="flex items-center justify-start -space-x-2 min-w-0">
        {visibleUsers.map((user) => (
          <div
            key={user._stableKey || user.id}
            className="relative"
            onMouseEnter={() => handleUserInteraction(user, 'hover')}
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
};

// Memoize the component to prevent unnecessary re-renders
export const ActiveUsersDisplay = memo(ActiveUsersDisplayComponent, (prevProps, nextProps) => {
  // Deep debugging: Log every comparison attempt
  const propsChanged = !(
    prevProps.className === nextProps.className &&
    prevProps.size === nextProps.size &&
    prevProps.showLabel === nextProps.showLabel &&
    prevProps.maxVisible === nextProps.maxVisible
  );
  
  if (propsChanged) {
    console.log('[ActiveUsersDisplay] Props changed, re-rendering:', {
      className: { prev: prevProps.className, next: nextProps.className, changed: prevProps.className !== nextProps.className },
      size: { prev: prevProps.size, next: nextProps.size, changed: prevProps.size !== nextProps.size },
      showLabel: { prev: prevProps.showLabel, next: nextProps.showLabel, changed: prevProps.showLabel !== nextProps.showLabel },
      maxVisible: { prev: prevProps.maxVisible, next: nextProps.maxVisible, changed: prevProps.maxVisible !== nextProps.maxVisible }
    });
  } else {
    console.log('[ActiveUsersDisplay] Props identical, preventing re-render');
  }
  
  return !propsChanged;
});