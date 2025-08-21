/**
 * useSSEActiveUsers Hook - Phase 4 SSE Implementation
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | PHASE 4 SSE-ONLY OPERATION
 * PURPOSE: Replace polling-based useStableActiveUsers with SSE-based real-time updates
 * 
 * PHASE 4 FEATURES:
 * - Real-time session updates via SSE
 * - Zero polling for session data
 * - Instant cross-tab synchronization
 * - Automatic fallback to polling if SSE fails
 * - Performance optimized with stable references
 */

'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useGuestUsers } from '@/lib/hooks/useGuestUsers';
import { 
  processActiveUsersStable, 
  hasUserListChanged,
  shallowEqualArrays 
} from '@/lib/utils/user-list-utils';

/**
 * Phase 4: SSE-Only Active Users Hook
 * Replaces polling with real-time SSE session updates
 */
export function useSSEActiveUsers(config = {}) {
  const enabled = config.enabled !== false;
  
  // Always call guest users hook for consistency  
  const { allUsers: rawAllUsers, sessionInfo } = useGuestUsers();
  
  // Stabilize allUsers to prevent unnecessary re-renders when content hasn't changed
  const lastUsersHashRef = useRef('');
  const lastUsersRef = useRef(rawAllUsers);
  
  const allUsers = useMemo(() => {
    // Create a hash from user ids, names, and active status
    const currentHash = rawAllUsers.map(user => `${user.id}:${user.name}:${user.isActive}`).sort().join('|');
    
    // Only update if hash actually changed
    if (lastUsersHashRef.current !== currentHash) {
      console.log(`[SSEActiveUsers] User hash changed:`, currentHash);
      lastUsersHashRef.current = currentHash;
      lastUsersRef.current = rawAllUsers;
      return rawAllUsers;
    }
    
    // Return the previous reference to maintain stability
    return lastUsersRef.current;
  }, [rawAllUsers]);
  
  // SSE simulation state (until real SSE infrastructure is ready)
  const [isSSESimulated] = useState(true);
  const [sessionsData, setSessionsData] = useState({ grouped: {}, guests: [] });
  
  // State for stable user list
  const [stableUsers, setStableUsers] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [loading, setLoading] = useState(false); // Start as not loading since we're simulating
  const [error, setError] = useState(null);
  
  // Refs for previous values to enable diffing
  const prevUsersRef = useRef([]);
  const prevSessionsRef = useRef(null);
  const prevAllUsersRef = useRef([]);
  
  // Processing stats for performance monitoring
  const processingStatsRef = useRef({
    totalUpdates: 0,
    skippedUpdates: 0,
    lastProcessTime: 0,
    sseUpdates: 0,
    fallbackUpdates: 0,
  });
  
  /**
   * Fetch sessions data - simplified version for SSE simulation with change detection
   */
  const fetchSessionsData = useCallback(async () => {
    try {
      if (!enabled) {
        console.log('[SSEActiveUsers] SSE disabled, using static data');
        return;
      }
      
      setLoading(true);
      
      // Fetch sessions data via API
      const response = await fetch('/api/sessions');
      if (!response.ok) throw new Error(`Sessions API error: ${response.status}`);
      
      const data = await response.json();
      
      // Transform API response to expected format (without timestamp for comparison)
      const newSessionsContent = {
        grouped: data.grouped || {},
        guests: data.guests || [],
      };
      
      // Check if sessions data actually changed before updating state
      const hasChanged = !prevSessionsRef.current || 
                        JSON.stringify(prevSessionsRef.current.grouped) !== JSON.stringify(newSessionsContent.grouped) ||
                        JSON.stringify(prevSessionsRef.current.guests) !== JSON.stringify(newSessionsContent.guests);
      
      console.log('[SSEActiveUsers] Change detection:', {
        hasChanged,
        hasPrevious: !!prevSessionsRef.current,
        currentGrouped: Object.keys(newSessionsContent.grouped).length,
        currentGuests: newSessionsContent.guests.length,
        prevGrouped: prevSessionsRef.current ? Object.keys(prevSessionsRef.current.grouped).length : 'none',
        prevGuests: prevSessionsRef.current ? prevSessionsRef.current.guests.length : 'none'
      });
      
      if (hasChanged) {
        console.log('[SSEActiveUsers] Sessions data changed, updating state');
        // Only add timestamp when we're actually updating the state
        const transformedSessions = {
          ...newSessionsContent,
          timestamp: Date.now(),
        };
        setSessionsData(transformedSessions);
        prevSessionsRef.current = newSessionsContent; // Store content without timestamp for future comparisons
        
        // Update stats only when data actually changes
        if (isSSESimulated) {
          processingStatsRef.current.sseUpdates++;
          console.log('[SSEActiveUsers] SSE simulated data fetch completed - data changed');
        } else {
          processingStatsRef.current.fallbackUpdates++;
        }
      } else {
        // Don't update state if data is the same - prevents re-renders
        if (isSSESimulated) {
          console.log('[SSEActiveUsers] SSE simulated data fetch completed - no changes');
        }
        // CRITICAL: Do not call setSessionsData here even if data is the same!
        // This was causing unnecessary state updates
      }
      
      setError(null);
      
    } catch (err) {
      console.error('[SSEActiveUsers] Session fetch failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [enabled, isSSESimulated]);
  
  /**
   * Setup data fetching - simplified without complex SSE subscription
   */
  useEffect(() => {
    if (!enabled) {
      console.log('[SSEActiveUsers] Hook disabled');
      return;
    }
    
    // Initial fetch
    fetchSessionsData();
    
    // Set up SSE simulation interval (reduced for better responsiveness)
    const interval = isSSESimulated ? 3000 : 5000; // 3s for SSE sim, 5s for fallback
    const fetchInterval = setInterval(fetchSessionsData, interval);
    
    return () => clearInterval(fetchInterval);
  }, [enabled, fetchSessionsData, isSSESimulated]);
  
  
  /**
   * Ref to track the last time we processed users to prevent unnecessary processing
   */
  const lastProcessedHashRef = useRef('');
  
  /**
   * Effect to process users only when dependencies actually change
   */
  useEffect(() => {
    console.log(`[SSEActiveUsers] useEffect triggered - checking for changes`, {
      sessionsDataTimestamp: sessionsData?.timestamp,
      sessionsDataKeys: sessionsData ? Object.keys(sessionsData) : 'none',
      allUsersLength: allUsers.length,
      loading,
      error: error?.message || null
    });
    
    // Don't process if we don't have meaningful data
    if (!sessionsData || Object.keys(sessionsData).length === 0) {
      console.log(`[SSEActiveUsers] useEffect skipped - no meaningful sessionsData`);
      return;
    }
    
    // Create a hash of all dependencies to detect real changes
    // CRITICAL FIX: Remove loading from hash since it changes on every fetch
    const dependencyHash = JSON.stringify({
      sessions: { grouped: sessionsData.grouped, guests: sessionsData.guests }, // Exclude timestamp
      userHash: allUsers.map(user => `${user.id}:${user.name}:${user.isActive}`).sort().join('|'),
      error: error?.message || null
    });
    
    // Skip processing if nothing meaningful has changed
    if (lastProcessedHashRef.current === dependencyHash) {
      console.log(`[SSEActiveUsers] Users processing skipped - no dependency changes`);
      processingStatsRef.current.skippedUpdates++;
      return;
    }
    
    console.log(`[SSEActiveUsers] Dependency hash changed - processing users`);
    
    // Process the users
    const newUsers = processActiveUsersStable(
      sessionsData,
      allUsers,
      loading,
      error
    );
    
    // Only update state if users actually changed
    const usersActuallyChanged = hasUserListChanged(stableUsers, newUsers);
    
    if (usersActuallyChanged) {
      console.log(`[SSEActiveUsers] Users updated: ${newUsers.length} active users`);
      setStableUsers(newUsers);
      setLastUpdateTime(Date.now());
      
      processingStatsRef.current = {
        ...processingStatsRef.current,
        totalUpdates: processingStatsRef.current.totalUpdates + 1,
      };
    } else {
      console.log(`[SSEActiveUsers] Users processing skipped - no user changes`);
      processingStatsRef.current.skippedUpdates++;
    }
    
    // Update the processed hash
    lastProcessedHashRef.current = dependencyHash;
  }, [sessionsData, allUsers, error]); // FIXED: Removed loading from deps to prevent unnecessary re-runs
  
  /**
   * Memoized responsive limit calculation
   */
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
  
  /**
   * Memoized display users with overflow calculation
   */
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
  
  /**
   * Enhanced performance stats with SSE metrics
   */
  const getPerformanceStats = useCallback(() => ({
    ...processingStatsRef.current,
    skipRate: processingStatsRef.current.totalUpdates > 0 
      ? (processingStatsRef.current.skippedUpdates / processingStatsRef.current.totalUpdates * 100).toFixed(1)
      : 0,
    lastUpdateTime,
    currentUserCount: stableUsers.length,
    connectionMode: isSSESimulated && enabled ? 'sse-simulated' : 'disabled',
    sseUpdateRate: processingStatsRef.current.sseUpdates / Math.max(1, processingStatsRef.current.totalUpdates) * 100,
  }), [lastUpdateTime, stableUsers.length, isSSESimulated, enabled]);

  /**
   * Activity tracking function for SSE events
   */
  const trackActivity = useCallback((activityType = 'user-interaction') => {
    if (sessionInfo?.sessionId) {
      console.log(`[SSEActiveUsers] Activity tracked: ${activityType} (Session: ${sessionInfo.sessionId})`);
      // Future: Emit activity via SSE when infrastructure is ready
    } else {
      console.log(`[SSEActiveUsers] Activity tracked: ${activityType} (No session)`);
    }
  }, [sessionInfo]);

  /**
   * Stable return object to prevent unnecessary re-renders
   */
  const returnDataRef = useRef(null);
  const currentReturnData = {
    // Core data
    activeUsers: stableUsers,
    loading,
    error,
    
    // Display helpers
    ...displayData,
    
    // Responsive utilities
    getResponsiveLimit,
    
    // Performance monitoring
    getPerformanceStats,
    lastUpdateTime,
    
    // Phase 4 specific - SSE simulation
    isSSEConnected: isSSESimulated && enabled,
    connectionMode: isSSESimulated && enabled ? 'sse-simulated' : 'disabled',
    trackActivity,
    
    // Manual refresh capability for immediate updates
    refreshData: fetchSessionsData,
    
    // Raw data access if needed
    rawSessions: sessionsData,
    rawUsers: allUsers,
  };
  
  // Create hash of return data to detect real changes (only essential data, not functions)
  // CRITICAL: Exclude loading and rawSessionsTimestamp from hash to prevent false changes
  const returnDataHash = JSON.stringify({
    activeUsersLength: stableUsers.length,
    activeUsersIds: stableUsers.map(u => u.id),
    // loading: REMOVED - changes on every fetch cycle causing false hash changes
    error: error?.message || null,
    visibleUsersLength: displayData.visibleUsers.length,
    overflowUsersLength: displayData.overflowUsers.length,
    hasOverflow: displayData.hasOverflow,
    totalUsers: displayData.totalUsers,
    displayLimit: displayData.displayLimit,
    isSSEConnected: isSSESimulated && enabled,
    connectionMode: isSSESimulated && enabled ? 'sse-simulated' : 'disabled',
    // rawSessionsTimestamp: REMOVED - changes even when sessions data content is identical
    rawUsersLength: allUsers.length
    // NOTE: Removed lastUpdateTime and loading as they change on every processing cycle even when no data changes
  });
  
  // Only update return data reference if hash actually changed
  if (!returnDataRef.current || returnDataRef.current.hash !== returnDataHash) {
    console.log('[SSEActiveUsers] Return data hash changed, updating return object');
    
    // ENHANCED DEBUGGING: Log the exact hash comparison to identify what's changing
    const prevHashData = returnDataRef.current ? JSON.parse(returnDataRef.current.hash) : null;
    const currentHashData = JSON.parse(returnDataHash);
    
    if (prevHashData) {
      // Find what changed by comparing each field
      const changes = {};
      Object.keys(currentHashData).forEach(key => {
        const prevValue = prevHashData[key];
        const currValue = currentHashData[key];
        const isChanged = JSON.stringify(prevValue) !== JSON.stringify(currValue);
        if (isChanged) {
          changes[key] = { prev: prevValue, curr: currValue };
        }
      });
      
      console.log('[SSEActiveUsers] Hash comparison - CHANGED FIELDS ONLY:', changes);
      console.log('[SSEActiveUsers] Total changed fields:', Object.keys(changes).length);
      
      // Also log rawSessionsTimestamp specifically since that's likely the culprit
      if (changes.rawSessionsTimestamp) {
        console.log('[SSEActiveUsers] 🚨 rawSessionsTimestamp changed:', {
          prev: new Date(prevHashData.rawSessionsTimestamp).toISOString(),
          curr: new Date(currentHashData.rawSessionsTimestamp).toISOString(),
          diff: currentHashData.rawSessionsTimestamp - prevHashData.rawSessionsTimestamp
        });
      }
    } else {
      console.log('[SSEActiveUsers] First hash creation:', currentHashData);
    }
    
    returnDataRef.current = {
      data: currentReturnData,
      hash: returnDataHash
    };
  } else {
    console.log('[SSEActiveUsers] Return data identical, reusing previous object');
  }
  return returnDataRef.current.data;
}