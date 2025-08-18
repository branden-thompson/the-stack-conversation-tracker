/**
 * useStableActiveUsers Hook
 * Optimized hook for managing active users with stable references and minimal re-computations
 */

'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { useUserTracking } from '@/lib/hooks/useUserTracking';
import { useGuestUsers } from '@/lib/hooks/useGuestUsers';
import { 
  processActiveUsersStable, 
  hasUserListChanged,
  shallowEqualArrays 
} from '@/lib/utils/user-list-utils';

/**
 * Enhanced hook for active users with performance optimizations
 * @param {Object} config - Configuration options
 * @returns {Object} Optimized active users state
 */
export function useStableActiveUsers(config = {}) {
  // Get raw data from existing hooks
  const { sessions, loading: sessionsLoading, error: sessionsError } = useUserTracking({
    mode: 'polling',
    pollInterval: config.pollInterval || 5000,
  });
  
  const { allUsers } = useGuestUsers();
  
  // State for stable user list
  const [stableUsers, setStableUsers] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  
  // Refs for previous values to enable diffing
  const prevUsersRef = useRef([]);
  const prevSessionsRef = useRef(null);
  const prevAllUsersRef = useRef([]);
  
  // Processing flags for debugging
  const processingStatsRef = useRef({
    totalUpdates: 0,
    skippedUpdates: 0,
    lastProcessTime: 0
  });
  
  // Memoized session data processing - only recalculates if sessions structure changes
  const processedSessionData = useMemo(() => {
    if (sessionsLoading || sessionsError || !sessions) {
      return { sessionsList: [], timestamp: Date.now() };
    }
    
    // Flatten sessions structure
    const sessionsList = [
      ...Object.values(sessions.grouped || {}).flat(),
      ...(sessions.guests || [])
    ];
    
    return { sessionsList, timestamp: sessions.timestamp || Date.now() };
  }, [sessions, sessionsLoading, sessionsError]);
  
  // Memoized user processing with stability optimization
  const processUsers = useCallback(() => {
    const startTime = performance.now();
    
    const newUsers = processActiveUsersStable(
      sessions,
      allUsers,
      sessionsLoading,
      sessionsError
    );
    
    const processingTime = performance.now() - startTime;
    
    // Update stats
    processingStatsRef.current = {
      ...processingStatsRef.current,
      totalUpdates: processingStatsRef.current.totalUpdates + 1,
      lastProcessTime: processingTime
    };
    
    // Check if users actually changed
    const usersChanged = hasUserListChanged(prevUsersRef.current, newUsers);
    
    if (usersChanged) {
      prevUsersRef.current = newUsers;
      setStableUsers(newUsers);
      setLastUpdateTime(Date.now());
      
    } else {
      processingStatsRef.current.skippedUpdates++;
      
    }
    
    return newUsers;
  }, [sessions, allUsers, sessionsLoading, sessionsError]);
  
  // Effect to trigger processing when dependencies change
  useMemo(() => {
    // Only process if we have meaningful changes
    const sessionsChanged = prevSessionsRef.current !== sessions;
    const usersChanged = !shallowEqualArrays(prevAllUsersRef.current, allUsers);
    
    if (sessionsChanged || usersChanged) {
      prevSessionsRef.current = sessions;
      prevAllUsersRef.current = allUsers;
      processUsers();
    }
  }, [processUsers, sessions, allUsers]);
  
  // Memoized responsive limit calculation
  const getResponsiveLimit = useMemo(() => {
    const limits = { sm: 3, md: 5, lg: 3, xl: 4, '2xl': 5 };
    
    return (maxVisible) => {
      if (maxVisible) return maxVisible;
      
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 640) return limits.sm;
        if (width < 768) return limits.md;
        if (width < 1024) return limits.lg;
        if (width < 1280) return limits.xl;
        if (width < 1536) return limits.xl;
        return limits['2xl'];
      }
      
      return limits.lg;
    };
  }, []);
  
  // Memoized display users with overflow calculation
  const displayData = useMemo(() => {
    const limit = getResponsiveLimit(config.maxVisible);
    const visibleUsers = stableUsers.slice(0, limit);
    const overflowUsers = stableUsers.slice(limit);
    
    return {
      visibleUsers,
      overflowUsers,
      hasOverflow: overflowUsers.length > 0,
      totalUsers: stableUsers.length,
      displayLimit: limit
    };
  }, [stableUsers, getResponsiveLimit, config.maxVisible]);
  
  // Performance stats getter
  const getPerformanceStats = useCallback(() => ({
    ...processingStatsRef.current,
    skipRate: processingStatsRef.current.totalUpdates > 0 
      ? (processingStatsRef.current.skippedUpdates / processingStatsRef.current.totalUpdates * 100).toFixed(1)
      : 0,
    lastUpdateTime,
    currentUserCount: stableUsers.length
  }), [lastUpdateTime, stableUsers.length]);
  
  return {
    // Core data
    activeUsers: stableUsers,
    loading: sessionsLoading,
    error: sessionsError,
    
    // Display helpers
    ...displayData,
    
    // Responsive utilities
    getResponsiveLimit,
    
    // Performance monitoring
    getPerformanceStats,
    lastUpdateTime,
    
    // Raw data access if needed
    rawSessions: sessions,
    rawUsers: allUsers,
  };
}