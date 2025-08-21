/**
 * Phase 4 Enhanced Fallback Controller
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | CRITICAL SAFETY SYSTEM
 * PURPOSE: Granular fallback control for selective SSE system failures
 * 
 * PHASE 4 ENHANCEMENT:
 * - System-specific fallback activation (UI, Sessions, Cards)
 * - Graduated recovery protocols  
 * - Partial system failure handling
 * - Enhanced monitoring and logging
 */

import { EmergencyController } from './emergency-controller';

/**
 * System Status Tracking
 */
const SYSTEM_STATUS = {
  ui: 'sse',           // UI events: SSE-only operation
  sessions: 'sse',     // Session events: SSE-only operation  
  cards: 'polling',    // Card events: Polling (Phase 5 target)
  hub: 'active',       // SSE Hub status
};

/**
 * Fallback Configuration per System
 */
const FALLBACK_CONFIG = {
  ui: {
    pollingInterval: 15000,    // 15s UI polling (faster than standard)
    retryAttempts: 3,
    healthCheckInterval: 30000,
    criticalQueries: ['ui-state', 'theme-state', 'dialog-state'],
  },
  
  sessions: {
    pollingInterval: 30000,    // 30s session polling (standard)
    retryAttempts: 3,
    healthCheckInterval: 60000,
    criticalQueries: ['session-data', 'user-activity', 'session-state'],
  },
  
  cards: {
    pollingInterval: 30000,    // Already polling (no change)
    retryAttempts: 2,
    healthCheckInterval: 60000,
    criticalQueries: ['cards', 'card-state'],
  },
};

/**
 * Phase 4 Enhanced Fallback Controller
 * 
 * Provides granular fallback control for individual system failures
 */
class Phase4FallbackController {
  constructor() {
    this.systemStatus = { ...SYSTEM_STATUS };
    this.fallbackTimers = new Map();
    this.healthCheckTimers = new Map();
    this.recoveryAttempts = new Map();
    this.eventListeners = new Set();
    
    this.initialize();
  }
  
  /**
   * Initialize the fallback controller
   */
  initialize() {
    console.log('[Phase4Fallback] Initializing enhanced fallback controller');
    
    // Start health monitoring for SSE systems
    this.startHealthMonitoring(['ui', 'sessions']);
    
    // Log initial system status
    this.logSystemStatus();
  }
  
  /**
   * Handle system-specific failure
   */
  handleSystemFailure(system, error, context = {}) {
    console.error(`[Phase4Fallback] System failure detected:`, {
      system,
      error: error.message,
      context,
      currentStatus: this.systemStatus[system],
    });
    
    switch (system) {
      case 'ui':
        return this.activateUIFallback(error, context);
        
      case 'sessions':  
        return this.activateSessionFallback(error, context);
        
      case 'cards':
        // Cards already polling - log but no action needed
        console.log('[Phase4Fallback] Cards system already using polling');
        return { success: true, action: 'no-change-needed' };
        
      case 'sse-hub':
        return this.activateCompleteSSEFallback(error, context);
        
      default:
        console.warn(`[Phase4Fallback] Unknown system failure: ${system}`);
        return { success: false, action: 'unknown-system' };
    }
  }
  
  /**
   * Activate UI system fallback to polling
   */
  activateUIFallback(error, context) {
    if (this.systemStatus.ui === 'polling') {
      console.log('[Phase4Fallback] UI system already in polling mode');
      return { success: true, action: 'already-polling' };
    }
    
    console.warn('[Phase4Fallback] Activating UI polling fallback');
    
    // Update system status
    this.systemStatus.ui = 'polling';
    
    // Enable UI polling in query client
    this.enableSystemPolling('ui', FALLBACK_CONFIG.ui);
    
    // Start recovery monitoring
    this.startRecoveryMonitoring('ui');
    
    // Emit system change event
    this.emitSystemStatusChange('ui', 'sse', 'polling', error);
    
    return {
      success: true,
      action: 'ui-polling-activated',
      config: FALLBACK_CONFIG.ui,
    };
  }
  
  /**
   * Activate Session system fallback to polling
   */
  activateSessionFallback(error, context) {
    if (this.systemStatus.sessions === 'polling') {
      console.log('[Phase4Fallback] Session system already in polling mode');
      return { success: true, action: 'already-polling' };
    }
    
    console.warn('[Phase4Fallback] Activating Session polling fallback');
    
    // Update system status
    this.systemStatus.sessions = 'polling';
    
    // Enable session polling in query client
    this.enableSystemPolling('sessions', FALLBACK_CONFIG.sessions);
    
    // Start recovery monitoring
    this.startRecoveryMonitoring('sessions');
    
    // Emit system change event
    this.emitSystemStatusChange('sessions', 'sse', 'polling', error);
    
    return {
      success: true,
      action: 'session-polling-activated',
      config: FALLBACK_CONFIG.sessions,
    };
  }
  
  /**
   * Activate complete SSE fallback (hub failure)
   */
  activateCompleteSSEFallback(error, context) {
    console.error('[Phase4Fallback] Complete SSE hub failure - activating all polling');
    
    const results = [];
    
    // Activate UI fallback if currently SSE
    if (this.systemStatus.ui === 'sse') {
      results.push(this.activateUIFallback(error, { ...context, cause: 'hub-failure' }));
    }
    
    // Activate Session fallback if currently SSE  
    if (this.systemStatus.sessions === 'sse') {
      results.push(this.activateSessionFallback(error, { ...context, cause: 'hub-failure' }));
    }
    
    // Update hub status
    this.systemStatus.hub = 'failed';
    
    // Start hub recovery monitoring
    this.startHubRecoveryMonitoring();
    
    return {
      success: results.every(r => r.success),
      action: 'complete-sse-fallback',
      results,
    };
  }
  
  /**
   * Attempt system recovery from polling back to SSE
   */
  attemptSystemRecovery(system) {
    console.log(`[Phase4Fallback] Attempting recovery for ${system} system`);
    
    const attempts = this.recoveryAttempts.get(system) || 0;
    
    if (attempts >= 3) {
      console.warn(`[Phase4Fallback] Max recovery attempts reached for ${system}`);
      return { success: false, reason: 'max-attempts-reached' };
    }
    
    // Test SSE connection for specific system
    if (this.testSSEConnection(system)) {
      console.log(`[Phase4Fallback] SSE recovery successful for ${system}`);
      
      // Update system status back to SSE
      this.systemStatus[system] = 'sse';
      
      // Disable polling for this system
      this.disableSystemPolling(system);
      
      // Clear recovery monitoring
      this.stopRecoveryMonitoring(system);
      
      // Reset attempt counter
      this.recoveryAttempts.delete(system);
      
      // Emit recovery event
      this.emitSystemStatusChange(system, 'polling', 'sse', null);
      
      return { success: true, action: 'sse-recovery' };
    }
    
    // Recovery failed - increment attempts
    this.recoveryAttempts.set(system, attempts + 1);
    console.warn(`[Phase4Fallback] Recovery attempt ${attempts + 1} failed for ${system}`);
    
    return { success: false, reason: 'sse-connection-failed', attempts: attempts + 1 };
  }
  
  /**
   * Enable polling for specific system
   */
  enableSystemPolling(system, config) {
    console.log(`[Phase4Fallback] Enabling polling for ${system}:`, config);
    
    // This would integrate with React Query to enable polling for specific queries
    // For now, we'll emit an event that the query client can listen to
    this.emitPollingConfigChange(system, true, config);
  }
  
  /**
   * Disable polling for specific system
   */
  disableSystemPolling(system) {
    console.log(`[Phase4Fallback] Disabling polling for ${system}`);
    
    // Emit event to disable polling for this system
    this.emitPollingConfigChange(system, false, null);
  }
  
  /**
   * Test SSE connection for specific system
   */
  testSSEConnection(system) {
    try {
      // This would perform an actual SSE health check
      // For Phase 4, we'll simulate the check
      const isSSEHealthy = EmergencyController.isSSEEnabled() && this.systemStatus.hub === 'active';
      
      console.log(`[Phase4Fallback] SSE health check for ${system}:`, isSSEHealthy);
      return isSSEHealthy;
    } catch (error) {
      console.error(`[Phase4Fallback] SSE health check failed for ${system}:`, error);
      return false;
    }
  }
  
  /**
   * Start health monitoring for SSE systems
   */
  startHealthMonitoring(systems) {
    systems.forEach(system => {
      if (this.healthCheckTimers.has(system)) return;
      
      const config = FALLBACK_CONFIG[system];
      const timer = setInterval(() => {
        this.performHealthCheck(system);
      }, config.healthCheckInterval);
      
      this.healthCheckTimers.set(system, timer);
      console.log(`[Phase4Fallback] Health monitoring started for ${system}`);
    });
  }
  
  /**
   * Perform health check for system
   */
  performHealthCheck(system) {
    if (this.systemStatus[system] !== 'sse') return;
    
    if (!this.testSSEConnection(system)) {
      console.warn(`[Phase4Fallback] Health check failed for ${system} - activating fallback`);
      this.handleSystemFailure(system, new Error('Health check failure'));
    }
  }
  
  /**
   * Start recovery monitoring for failed system
   */
  startRecoveryMonitoring(system) {
    if (this.fallbackTimers.has(system)) return;
    
    const timer = setInterval(() => {
      this.attemptSystemRecovery(system);
    }, 60000); // Attempt recovery every minute
    
    this.fallbackTimers.set(system, timer);
    console.log(`[Phase4Fallback] Recovery monitoring started for ${system}`);
  }
  
  /**
   * Stop recovery monitoring for system
   */
  stopRecoveryMonitoring(system) {
    const timer = this.fallbackTimers.get(system);
    if (timer) {
      clearInterval(timer);
      this.fallbackTimers.delete(system);
      console.log(`[Phase4Fallback] Recovery monitoring stopped for ${system}`);
    }
  }
  
  /**
   * Start hub recovery monitoring
   */
  startHubRecoveryMonitoring() {
    if (this.fallbackTimers.has('hub')) return;
    
    const timer = setInterval(() => {
      if (EmergencyController.isSSEEnabled()) {
        console.log('[Phase4Fallback] Hub recovery detected - attempting system recovery');
        this.systemStatus.hub = 'active';
        
        // Attempt recovery for all SSE systems
        ['ui', 'sessions'].forEach(system => {
          if (this.systemStatus[system] === 'polling') {
            this.attemptSystemRecovery(system);
          }
        });
        
        clearInterval(timer);
        this.fallbackTimers.delete('hub');
      }
    }, 30000); // Check hub every 30 seconds
    
    this.fallbackTimers.set('hub', timer);
  }
  
  /**
   * Emit system status change event
   */
  emitSystemStatusChange(system, fromStatus, toStatus, error) {
    const event = {
      type: 'system-status-change',
      system,
      fromStatus,
      toStatus,
      error: error?.message,
      timestamp: Date.now(),
    };
    
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error('[Phase4Fallback] Event listener error:', err);
      }
    });
  }
  
  /**
   * Emit polling configuration change event
   */
  emitPollingConfigChange(system, enabled, config) {
    const event = {
      type: 'polling-config-change',
      system,
      enabled,
      config,
      timestamp: Date.now(),
    };
    
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error('[Phase4Fallback] Event listener error:', err);
      }
    });
  }
  
  /**
   * Add event listener for fallback events
   */
  addEventListener(listener) {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }
  
  /**
   * Get current system status
   */
  getSystemStatus() {
    return {
      ...this.systemStatus,
      recoveryAttempts: Object.fromEntries(this.recoveryAttempts),
      activeTimers: {
        health: Array.from(this.healthCheckTimers.keys()),
        recovery: Array.from(this.fallbackTimers.keys()),
      },
    };
  }
  
  /**
   * Log current system status
   */
  logSystemStatus() {
    console.log('[Phase4Fallback] System Status:', this.getSystemStatus());
  }
  
  /**
   * Cleanup resources
   */
  cleanup() {
    // Clear all timers
    this.healthCheckTimers.forEach(timer => clearInterval(timer));
    this.fallbackTimers.forEach(timer => clearInterval(timer));
    
    // Clear data structures
    this.healthCheckTimers.clear();
    this.fallbackTimers.clear();
    this.recoveryAttempts.clear();
    this.eventListeners.clear();
    
    console.log('[Phase4Fallback] Cleanup completed');
  }
}

// Singleton instance
let phase4FallbackController = null;

/**
 * Get Phase 4 Fallback Controller instance
 */
export function getPhase4FallbackController() {
  if (!phase4FallbackController) {
    phase4FallbackController = new Phase4FallbackController();
  }
  return phase4FallbackController;
}

/**
 * Hook: usePhase4Fallback
 * 
 * React hook interface for Phase 4 fallback system
 */
export function usePhase4Fallback() {
  const controller = getPhase4FallbackController();
  
  return {
    systemStatus: controller.getSystemStatus(),
    handleSystemFailure: (system, error, context) => 
      controller.handleSystemFailure(system, error, context),
    attemptRecovery: (system) => controller.attemptSystemRecovery(system),
    addEventListener: (listener) => controller.addEventListener(listener),
  };
}