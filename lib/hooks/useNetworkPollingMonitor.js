/**
 * Network Polling Monitor - Phase 4 Validation
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | VALIDATION SYSTEM
 * PURPOSE: Monitor and validate polling elimination success
 * 
 * PHASE 4 VALIDATION:
 * - Track polling requests by system type
 * - Validate SSE-only operation for UI/Sessions
 * - Confirm card polling maintenance
 * - Measure network traffic reduction
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Network Request Categories for Phase 4 Monitoring
 */
const REQUEST_CATEGORIES = {
  // UI System (should be 0 polling in Phase 4)
  ui: {
    patterns: ['/api/ui', 'ui-state', 'theme-state', 'dialog-state', 'tray-state'],
    expectedPolling: false,
    system: 'UI Events',
  },
  
  // Session System (should be 0 polling in Phase 4)
  sessions: {
    patterns: ['/api/sessions', 'session-data', 'user-activity', 'session-state'],
    expectedPolling: false,
    system: 'Session Events',
  },
  
  // Card System (should maintain polling in Phase 4)
  cards: {
    patterns: ['/api/cards', 'card-state', 'card-updates'],
    expectedPolling: true,
    system: 'Card Events',
  },
  
  // SSE System (should show activity)
  sse: {
    patterns: ['/api/sse', 'sse/events'],
    expectedPolling: false,
    system: 'SSE Events',
  },
};

/**
 * Hook: useNetworkPollingMonitor
 * 
 * Monitors network requests to validate Phase 4 polling elimination
 */
export function useNetworkPollingMonitor(options = {}) {
  const {
    enabled = true,
    monitoringWindow = 60000, // 1 minute monitoring window
    sampleInterval = 10000,   // 10 second sampling
    maxSamples = 100,         // Keep last 100 samples
  } = options;
  
  const [pollingActivity, setPollingActivity] = useState({
    ui: { requests: 0, lastRequest: null, rate: 0 },
    sessions: { requests: 0, lastRequest: null, rate: 0 },
    cards: { requests: 0, lastRequest: null, rate: 0 },
    sse: { requests: 0, lastRequest: null, rate: 0 },
    total: { requests: 0, lastRequest: null, rate: 0 },
  });
  
  const [validationStatus, setValidationStatus] = useState({
    phase4Success: null,
    uiPollingEliminated: null,
    sessionPollingEliminated: null,
    cardPollingMaintained: null,
    networkReduction: null,
    lastValidation: null,
  });
  
  const requestSamples = useRef([]);
  const originalFetch = useRef(null);
  const startTime = useRef(Date.now());
  
  /**
   * Categorize request URL into system type
   */
  const categorizeRequest = useCallback((url) => {
    for (const [category, config] of Object.entries(REQUEST_CATEGORIES)) {
      if (config.patterns.some(pattern => url.includes(pattern))) {
        return category;
      }
    }
    return 'other';
  }, []);
  
  /**
   * Track network request
   */
  const trackRequest = useCallback((url, method, timestamp) => {
    const category = categorizeRequest(url);
    const sample = {
      url,
      method,
      category,
      timestamp,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    // Add to samples (keep within max limit)
    requestSamples.current.push(sample);
    if (requestSamples.current.length > maxSamples) {
      requestSamples.current = requestSamples.current.slice(-maxSamples);
    }
    
    return sample;
  }, [categorizeRequest, maxSamples]);
  
  /**
   * Calculate polling rates and update activity state
   */
  const updatePollingActivity = useCallback(() => {
    const now = Date.now();
    const windowStart = now - monitoringWindow;
    
    // Filter samples within monitoring window
    const recentSamples = requestSamples.current.filter(
      sample => sample.timestamp >= windowStart
    );
    
    // Group by category and calculate stats
    const activityStats = {};
    
    Object.keys(REQUEST_CATEGORIES).forEach(category => {
      const categorySamples = recentSamples.filter(s => s.category === category);
      const requestCount = categorySamples.length;
      const rate = requestCount / (monitoringWindow / 1000); // requests per second
      const lastRequest = categorySamples.length > 0 ? 
        Math.max(...categorySamples.map(s => s.timestamp)) : null;
      
      activityStats[category] = {
        requests: requestCount,
        rate: Math.round(rate * 100) / 100, // Round to 2 decimals
        lastRequest,
      };
    });
    
    // Total stats
    activityStats.total = {
      requests: recentSamples.length,
      rate: Math.round((recentSamples.length / (monitoringWindow / 1000)) * 100) / 100,
      lastRequest: recentSamples.length > 0 ? 
        Math.max(...recentSamples.map(s => s.timestamp)) : null,
    };
    
    setPollingActivity(activityStats);
    
    // Update validation status
    validatePhase4Success(activityStats, now);
  }, [monitoringWindow]);
  
  /**
   * Validate Phase 4 success criteria
   */
  const validatePhase4Success = useCallback((stats, timestamp) => {
    const validation = {
      // UI polling should be eliminated (0 requests)
      uiPollingEliminated: stats.ui.requests === 0,
      
      // Session polling should be eliminated (0 requests) 
      sessionPollingEliminated: stats.sessions.requests === 0,
      
      // Card polling should be maintained (>0 requests expected)
      cardPollingMaintained: stats.cards.requests > 0,
      
      // Overall network reduction (compared to baseline)
      networkReduction: calculateNetworkReduction(stats),
      
      lastValidation: timestamp,
    };
    
    // Overall Phase 4 success
    validation.phase4Success = 
      validation.uiPollingEliminated && 
      validation.sessionPollingEliminated &&
      validation.cardPollingMaintained;
    
    setValidationStatus(validation);
  }, []);
  
  /**
   * Calculate network reduction percentage
   */
  const calculateNetworkReduction = useCallback((stats) => {
    // Baseline: Assume all systems were polling at 30s intervals
    // Phase 4: UI and Sessions eliminated, Cards maintained
    
    const baselineRate = 3 * (1/30); // 3 systems * 1 request per 30 seconds
    const currentRate = stats.total.rate;
    
    const reduction = ((baselineRate - currentRate) / baselineRate) * 100;
    return Math.max(0, Math.round(reduction));
  }, []);
  
  /**
   * Setup network monitoring
   */
  useEffect(() => {
    if (!enabled) return;
    
    console.log('[NetworkMonitor] Starting Phase 4 polling elimination monitoring');
    
    // Store original fetch
    originalFetch.current = window.fetch;
    
    // Intercept fetch requests
    window.fetch = async (...args) => {
      const url = args[0];
      const options = args[1] || {};
      const method = options.method || 'GET';
      const timestamp = Date.now();
      
      // Track the request
      const sample = trackRequest(url, method, timestamp);
      
      // Log significant requests
      if (sample.category !== 'other') {
        console.log(`[NetworkMonitor] ${sample.category.toUpperCase()} request:`, {
          url: sample.url,
          method: sample.method,
          category: sample.category,
        });
      }
      
      // Execute original fetch
      return originalFetch.current(...args);
    };
    
    // Start sampling interval
    const samplingTimer = setInterval(updatePollingActivity, sampleInterval);
    
    // Initial update
    updatePollingActivity();
    
    // Cleanup on unmount
    return () => {
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
      }
      clearInterval(samplingTimer);
      console.log('[NetworkMonitor] Monitoring stopped');
    };
  }, [enabled, sampleInterval, trackRequest, updatePollingActivity]);
  
  /**
   * Reset monitoring data
   */
  const resetMonitoring = useCallback(() => {
    requestSamples.current = [];
    startTime.current = Date.now();
    setPollingActivity({
      ui: { requests: 0, lastRequest: null, rate: 0 },
      sessions: { requests: 0, lastRequest: null, rate: 0 },
      cards: { requests: 0, lastRequest: null, rate: 0 },
      sse: { requests: 0, lastRequest: null, rate: 0 },
      total: { requests: 0, lastRequest: null, rate: 0 },
    });
    setValidationStatus({
      phase4Success: null,
      uiPollingEliminated: null,
      sessionPollingEliminated: null,
      cardPollingMaintained: null,
      networkReduction: null,
      lastValidation: null,
    });
    console.log('[NetworkMonitor] Monitoring data reset');
  }, []);
  
  /**
   * Export monitoring data
   */
  const exportData = useCallback(() => {
    const exportData = {
      timestamp: Date.now(),
      monitoringWindow,
      sampleInterval,
      pollingActivity,
      validationStatus,
      samples: requestSamples.current.slice(-50), // Last 50 samples
      phase4Config: REQUEST_CATEGORIES,
    };
    
    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phase4-network-monitoring-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('[NetworkMonitor] Data exported');
  }, [monitoringWindow, sampleInterval, pollingActivity, validationStatus]);
  
  /**
   * Get detailed system analysis
   */
  const getSystemAnalysis = useCallback(() => {
    const analysis = {};
    
    Object.entries(REQUEST_CATEGORIES).forEach(([category, config]) => {
      const stats = pollingActivity[category];
      const isCompliant = config.expectedPolling ? 
        stats.requests > 0 : // Should have polling
        stats.requests === 0; // Should NOT have polling
      
      analysis[category] = {
        system: config.system,
        expectedPolling: config.expectedPolling,
        actualRequests: stats.requests,
        requestRate: stats.rate,
        isCompliant,
        status: isCompliant ? 'PASS' : 'FAIL',
        lastActivity: stats.lastRequest ? new Date(stats.lastRequest).toISOString() : null,
      };
    });
    
    return analysis;
  }, [pollingActivity]);
  
  return {
    // Monitoring data
    pollingActivity,
    validationStatus,
    
    // Analysis functions
    getSystemAnalysis,
    
    // Control functions
    resetMonitoring,
    exportData,
    
    // Status helpers
    isPhase4Successful: validationStatus.phase4Success,
    networkReduction: validationStatus.networkReduction,
    monitoringActive: enabled,
  };
}

/**
 * Hook: usePhase4ValidationSummary
 * 
 * Provides a summary view of Phase 4 validation status
 */
export function usePhase4ValidationSummary() {
  const monitor = useNetworkPollingMonitor();
  
  const summary = {
    phase: 4,
    status: monitor.isPhase4Successful ? 'SUCCESS' : 'IN_PROGRESS',
    networkReduction: `${monitor.networkReduction || 0}%`,
    systemStatus: {
      ui: monitor.pollingActivity.ui.requests === 0 ? 'SSE-ONLY' : 'POLLING',
      sessions: monitor.pollingActivity.sessions.requests === 0 ? 'SSE-ONLY' : 'POLLING',
      cards: monitor.pollingActivity.cards.requests > 0 ? 'POLLING' : 'NO-ACTIVITY',
    },
    lastValidation: monitor.validationStatus.lastValidation,
  };
  
  return summary;
}