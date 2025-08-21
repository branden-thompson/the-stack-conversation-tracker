/**
 * useSSEActiveUsersOptimized - Testing Implementation with SSE Infrastructure
 * 
 * CLASSIFICATION: APPLICATION LEVEL | TESTING | OPTIMIZED SSE IMPLEMENTATION
 * PURPOSE: Test the new SSE infrastructure with Active Stackers to validate optimizations
 * 
 * FEATURES:
 * - Uses new SSE infrastructure components
 * - Comprehensive performance monitoring
 * - Automated flickering detection
 * - Hash optimization validation
 * - Maintains backward compatibility with existing interface
 */

'use client';

import { useMemo, useCallback, useRef, useState } from 'react';
import { useGuestUsers } from '@/lib/hooks/useGuestUsers';
import { processActiveUsersStable } from '@/lib/utils/user-list-utils';
import { useSSEIntegration } from '@/lib/sse-infrastructure/core/useSSEIntegration.js';
import { createOptimizationConfig, OPTIMIZATION_PATTERNS } from '@/lib/sse-infrastructure/templates/hash-optimization-patterns.js';
import { createPerformanceMonitor } from '@/lib/sse-infrastructure/utils/performance-monitor.js';
import { SSETestFramework } from '@/lib/sse-infrastructure/testing/sse-test-framework.js';
import { getPollingInterval, getEnvironmentConfig } from '@/lib/sse-infrastructure/config/environment-config.js';

/**
 * Optimized Active Users Hook using new SSE infrastructure
 */
export function useSSEActiveUsersOptimized(config = {}) {
  const enabled = config.enabled !== false;
  
  // Get environment configuration for production-safe operation
  const envConfig = getEnvironmentConfig();
  const safeInterval = getPollingInterval('sessions');
  
  // Get guest users (same as before)
  const { allUsers: rawAllUsers, sessionInfo } = useGuestUsers();
  
  // Initialize performance monitoring
  const performanceMonitor = useRef(null);
  const testFramework = useRef(null);
  
  if (!performanceMonitor.current) {
    performanceMonitor.current = createPerformanceMonitor('ActiveUsersOptimized', {
      enableAlerting: process.env.NODE_ENV === 'development',
      collectTrends: true
    });
  }
  
  if (!testFramework.current && process.env.NODE_ENV === 'development') {
    testFramework.current = new SSETestFramework();
  }
  
  /**
   * Transform sessions data for Active Users
   */
  const transformActiveUsersData = useCallback(async (rawSessionsData) => {
    const timer = performanceMonitor.current?.recordDataProcessing ? 
      Date.now() : null;
    
    try {
      // Transform API response to expected format
      const transformedData = {
        grouped: rawSessionsData.grouped || {},
        guests: rawSessionsData.guests || [],
        timestamp: Date.now()
      };
      
      // Process active users using existing utility
      const processedUsers = processActiveUsersStable(
        transformedData,
        rawAllUsers,
        false, // loading state handled by SSE infrastructure
        null   // error handled by SSE infrastructure
      );
      
      // Calculate display data
      const limit = config.maxVisible || 3;
      const visibleUsers = processedUsers.slice(0, limit);
      const overflowUsers = processedUsers.slice(limit);
      
      const result = {
        // Core data
        processedUsers,
        rawSessions: transformedData,
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
        connectionMode: 'optimized-sse',
        isConnected: true
      };
      
      // Record performance metrics
      if (timer && performanceMonitor.current) {
        const duration = Date.now() - timer;
        performanceMonitor.current.recordDataProcessing(duration, true);
        performanceMonitor.current.recordRenderPrevention(
          0, // Will be calculated by SSE infrastructure
          1  // Total renders
        );
      }
      
      return result;
      
    } catch (err) {
      if (timer && performanceMonitor.current) {
        const duration = Date.now() - timer;
        performanceMonitor.current.recordDataProcessing(duration, false, err.name);
      }
      throw err;
    }
  }, [rawAllUsers, config.maxVisible, sessionInfo]);
  
  /**
   * Validate Active Users data
   */
  const validateActiveUsersData = useCallback((data) => {
    if (!data) {
      return { isValid: false, error: 'No data provided' };
    }
    
    if (typeof data !== 'object') {
      return { isValid: false, error: 'Data must be an object' };
    }
    
    // Check for required session structure
    if (!data.grouped && !data.guests) {
      return { isValid: false, error: 'Missing required session data structure' };
    }
    
    return { isValid: true };
  }, []);
  
  /**
   * Create optimization configuration for Active Users
   */
  const optimizationConfig = useMemo(() => {
    return createOptimizationConfig('USER_LIST', {
      debug: {
        enabled: process.env.NODE_ENV === 'development',
        level: 'info',
        showHashChanges: process.env.NEXT_PUBLIC_SSE_HASH_LOGGING === 'true',
        componentName: 'ActiveUsersOptimized'
      },
      enablePerformanceMonitoring: true
    });
  }, []);
  
  /**
   * SSE Integration with production-safe configuration
   */
  const sseResult = useSSEIntegration({
    endpoint: '/api/sessions',
    interval: safeInterval, // FIXED: Use environment-safe interval instead of hardcoded 3000
    enabled,
    
    // Data processing configuration
    transformData: transformActiveUsersData,
    validateData: validateActiveUsersData,
    
    // Optimization configuration  
    extractEssentialData: optimizationConfig.extractEssentialData,
    excludeFromHash: optimizationConfig.excludeFromHash,
    
    // Enhanced debug configuration
    debug: optimizationConfig.debug
  });
  
  /**
   * Memoized responsive limit calculation (same as before)
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
   * Activity tracking function
   */
  const trackActivity = useCallback((activityType = 'user-interaction') => {
    if (sessionInfo?.sessionId) {
      console.log(`[ActiveUsersOptimized] Activity tracked: ${activityType} (Session: ${sessionInfo.sessionId})`);
      
      // Record activity for performance monitoring
      if (performanceMonitor.current) {
        performanceMonitor.current.recordConnectionEvent('activity', true);
      }
      
      // Record for flicker detection if testing
      if (testFramework.current && process.env.NODE_ENV === 'development') {
        testFramework.current.flickerDetector?.recordRender('ActiveUsersOptimized', {
          renderTrigger: activityType,
          dataHash: sseResult.data ? JSON.stringify(sseResult.data).substring(0, 50) : ''
        });
      }
    }
  }, [sessionInfo, sseResult.data]);
  
  /**
   * Enhanced performance stats combining SSE and custom metrics
   */
  const getPerformanceStats = useCallback(() => {
    const sseStats = sseResult.getSystemStats();
    const customStats = performanceMonitor.current?.getPerformanceReport() || {};
    
    return {
      // Backward compatibility stats
      totalUpdates: sseStats.processing?.totalProcessed || 0,
      skippedUpdates: sseStats.processing?.skippedDuplicates || 0,
      sseUpdates: sseStats.connection?.successfulFetches || 0,
      fallbackUpdates: 0, // Not applicable with SSE
      skipRate: sseStats.processing?.skipRate || 0,
      
      // Enhanced optimization stats
      renderEfficiency: sseStats.optimization?.renderEfficiency || 0,
      connectionReliability: sseStats.connection?.successRate || 0,
      currentUserCount: sseResult.data?.totalUsers || 0,
      systemHealth: sseResult.systemStatus?.isHealthy || false,
      performanceRating: sseResult.systemStatus?.performanceRating || 'unknown',
      
      // Performance monitoring stats
      hashCalculationAvg: customStats.hashCalculation?.averageDuration || 0,
      dataProcessingAvg: customStats.dataProcessing?.averageDuration || 0,
      memoryUsage: customStats.memoryUsage?.currentUsageMB || 0,
      
      // System overview
      optimizationEnabled: true,
      infrastructureVersion: '1.0.0',
      monitoringActive: !!performanceMonitor.current
    };
  }, [sseResult]);
  
  /**
   * Run automated tests (development only)
   */
  const runOptimizationTests = useCallback(async () => {
    if (process.env.NODE_ENV !== 'development' || !testFramework.current) {
      return null;
    }
    
    console.log('[ActiveUsersOptimized] Running optimization validation tests');
    return await testFramework.current.runFullTestSuite({
      getPerformanceStats,
      trackActivity,
      getSystemStats: sseResult.getSystemStats
    });
  }, [getPerformanceStats, trackActivity, sseResult.getSystemStats]);
  
  // Current data from SSE infrastructure
  const currentData = sseResult.data;
  
  // Enhanced performance monitoring
  if (performanceMonitor.current && currentData) {
    // Record memory usage periodically
    performanceMonitor.current.recordMemorySnapshot();
    
    // Track hash calculation performance (simulated for now)
    const hashTimer = Date.now();
    const hashDuration = Date.now() - hashTimer;
    performanceMonitor.current.recordHashCalculation(hashDuration, 
      JSON.stringify(currentData).length, 
      true // Assume data changed for now
    );
  }
  
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
    
    // Performance monitoring (enhanced)
    getPerformanceStats,
    
    // Raw data access (same interface as before)
    rawSessions: currentData?.rawSessions,
    rawUsers: currentData?.rawUsers,
    
    // Advanced optimization features (new)
    systemStatus: sseResult.systemStatus,
    getSystemStats: sseResult.getSystemStats,
    resetSystem: sseResult.resetSystem,
    
    // Testing utilities (development only)
    runOptimizationTests: process.env.NODE_ENV === 'development' ? runOptimizationTests : undefined,
    wouldTriggerRender: sseResult.wouldTriggerRender,
    
    // Performance monitoring instance access (development only)
    _performanceMonitor: process.env.NODE_ENV === 'development' ? performanceMonitor.current : undefined,
    _testFramework: process.env.NODE_ENV === 'development' ? testFramework.current : undefined,
    
    // Infrastructure metadata
    _optimization: {
      enabled: true,
      pattern: 'USER_LIST',
      version: '1.0.0',
      infrastructure: 'sse-optimization',
      performanceMonitoring: !!performanceMonitor.current,
      testingFramework: !!testFramework.current
    }
  };
}