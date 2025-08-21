/**
 * useSSEActiveUsers - Optimized Template Implementation
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | TEMPLATE IMPLEMENTATION
 * PURPOSE: Show how to use the new SSE infrastructure for Active Users
 * 
 * FEATURES:
 * - Uses modular SSE infrastructure
 * - Demonstrates proper configuration patterns
 * - Shows optimization best practices
 * - Provides template for Card Events and other features
 */

'use client';

import { useMemo } from 'react';
import { useSSEIntegration } from '../core/useSSEIntegration.js';
import { useGuestUsers } from '@/lib/hooks/useGuestUsers';
import { processActiveUsersStable } from '@/lib/utils/user-list-utils';
import { createDebugLogger, DEBUG_CATEGORIES } from '../config/debug-config.js';

/**
 * Active Users specific data transformation
 */
const transformActiveUsersData = async (rawSessionsData) => {
  // This would contain the same transformation logic as before
  // but separated into its own function for reusability
  return rawSessionsData;
};

/**
 * Active Users data validation
 */
const validateActiveUsersData = (data) => {
  if (!data) {
    return { isValid: false, error: 'No data provided' };
  }
  
  if (typeof data !== 'object') {
    return { isValid: false, error: 'Data must be an object' };
  }
  
  // Add more specific validation as needed
  return { isValid: true };
};

/**
 * Extract essential data for UI optimization
 */
const extractActiveUsersEssentialData = (data) => {
  if (!data || !data.processedUsers) {
    return {
      userCount: 0,
      userIds: [],
      hasUsers: false,
      displayLimit: 3,
      hasOverflow: false
    };
  }
  
  const users = data.processedUsers;
  const displayLimit = data.displayLimit || 3;
  
  return {
    // Core data affecting UI
    userCount: users.length,
    userIds: users.map(u => u.id),
    hasUsers: users.length > 0,
    
    // Display calculations
    displayLimit,
    visibleCount: Math.min(users.length, displayLimit),
    overflowCount: Math.max(0, users.length - displayLimit),
    hasOverflow: users.length > displayLimit,
    
    // Connection status (affects UI indicators)
    connectionMode: data.connectionMode || 'disconnected',
    isConnected: data.isConnected || false,
    
    // Error states that affect UI
    hasError: !!data.error,
    errorMessage: data.error?.message || null
  };
};

/**
 * Optimized useSSEActiveUsers using new infrastructure
 */
export function useSSEActiveUsersOptimized(config = {}) {
  const enabled = config.enabled !== false;
  const debugLogger = createDebugLogger('ActiveUsers', DEBUG_CATEGORIES.INTEGRATION);
  
  // Get guest users (same as before)
  const { allUsers: rawAllUsers, sessionInfo } = useGuestUsers();
  
  // Create complete data transformation pipeline
  const transformCompleteData = async (rawSessionsData) => {
    try {
      debugLogger('verbose', 'Starting Active Users data transformation');
      
      // Transform sessions data
      const transformedSessions = await transformActiveUsersData(rawSessionsData);
      
      // Process active users using existing utility
      const processedUsers = processActiveUsersStable(
        transformedSessions,
        rawAllUsers,
        false, // loading state not needed here
        null   // error handled by SSE infrastructure
      );
      
      // Calculate display data
      const limit = config.maxVisible || 3;
      const visibleUsers = processedUsers.slice(0, limit);
      const overflowUsers = processedUsers.slice(limit);
      
      const result = {
        // Core data
        processedUsers,
        rawSessions: transformedSessions,
        rawUsers: rawAllUsers,
        
        // Display calculations
        visibleUsers,
        overflowUsers,
        hasOverflow: overflowUsers.length > 0,
        totalUsers: processedUsers.length,
        displayLimit: limit,
        
        // Session info
        sessionInfo,
        
        // Connection info (will be added by SSE infrastructure)
        connectionMode: 'unknown',
        isConnected: false
      };
      
      debugLogger('info', 'Active Users transformation completed', {
        userCount: processedUsers.length,
        visibleCount: visibleUsers.length,
        overflowCount: overflowUsers.length
      });
      
      return result;
      
    } catch (err) {
      debugLogger('error', 'Active Users transformation failed', { error: err.message });
      throw err;
    }
  };
  
  // SSE Integration with optimized configuration
  const sseResult = useSSEIntegration({
    endpoint: '/api/sessions',
    interval: 3000,
    enabled,
    
    // Data processing configuration
    transformData: transformCompleteData,
    validateData: validateActiveUsersData,
    
    // Optimization configuration  
    extractEssentialData: extractActiveUsersEssentialData,
    excludeFromHash: [
      'loading',           // Causes false positives
      'timestamp',         // Changes every fetch
      'lastUpdate',        // Internal processing time
      'processingTime',    // Performance data
      'rawSessions',       // Internal data (timestamp changes)
      'sessionInfo'        // Session state (separate from user data)
    ],
    
    // Debug configuration
    debug: {
      enabled: true,
      level: 'info',
      showHashChanges: true
    }
  });
  
  // Memoized responsive limit calculation (same as before)
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
  
  // Activity tracking function
  const trackActivity = (activityType = 'user-interaction') => {
    if (sessionInfo?.sessionId) {
      debugLogger('verbose', 'Activity tracked', { 
        type: activityType, 
        sessionId: sessionInfo.sessionId 
      });
    }
  };
  
  // Current data from SSE infrastructure
  const currentData = sseResult.data;
  
  // Backward compatibility - return same interface as original hook
  return {
    // Core data (same interface as before)
    activeUsers: currentData?.processedUsers || [],
    loading: false, // Always false with SSE
    error: sseResult.error,
    
    // Display helpers (same interface as before)
    visibleUsers: currentData?.visibleUsers || [],
    overflowUsers: currentData?.overflowUsers || [],
    hasOverflow: currentData?.hasOverflow || false,
    totalUsers: currentData?.totalUsers || 0,
    displayLimit: currentData?.displayLimit || 3,
    
    // Utilities (same interface as before)
    getResponsiveLimit,
    trackActivity,
    refreshData: sseResult.refresh,
    
    // Enhanced SSE-specific features
    isSSEConnected: sseResult.isConnected,
    connectionMode: sseResult.connectionMode,
    lastUpdateTime: sseResult.lastUpdate,
    
    // Performance monitoring (new)
    getPerformanceStats: () => {
      const stats = sseResult.getSystemStats();
      
      return {
        // Backward compatibility stats
        totalUpdates: stats.processing.totalProcessed,
        skippedUpdates: stats.processing.skippedDuplicates,
        sseUpdates: stats.connection.successfulFetches,
        fallbackUpdates: 0, // Not applicable with SSE
        skipRate: stats.processing.skipRate,
        
        // Enhanced stats
        renderEfficiency: stats.optimization.renderEfficiency,
        connectionReliability: stats.connection.successRate,
        currentUserCount: currentData?.totalUsers || 0,
        systemHealth: sseResult.systemStatus.isHealthy,
        performanceRating: sseResult.systemStatus.performanceRating
      };
    },
    
    // Raw data access (same interface as before)
    rawSessions: currentData?.rawSessions,
    rawUsers: currentData?.rawUsers,
    
    // Advanced SSE features (new)
    systemStatus: sseResult.systemStatus,
    getSystemStats: sseResult.getSystemStats,
    resetSystem: sseResult.resetSystem,
    
    // Development utilities
    _debug: process.env.NODE_ENV === 'development' ? {
      sseModules: sseResult._modules,
      config: sseResult.config,
      wouldTriggerRender: sseResult.wouldTriggerRender
    } : undefined
  };
}